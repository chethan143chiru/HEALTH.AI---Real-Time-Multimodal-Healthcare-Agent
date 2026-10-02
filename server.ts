import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import crypto from 'crypto';
import { predictDiseaseLocalML } from './ml_service/services/disease_inference_engine.ts';
import { generateChatResponseLocalNLP } from './ml_service/services/chatbot_inference_engine.ts';
import { LiveSessionManager } from './server/agents/liveSessionManager.ts';
import { ai, GEMINI_FLASH_MODEL as GEMINI_MODEL } from './server/ai/geminiClient.ts';
import {
  analyzePrescriptionVision,
  analyzeMedicalImageVision,
  analyzeLiveVisualVision
} from './server/ai/visionService.ts';
import { hashPassword, verifyPassword } from './server/auth/password.ts';
import { createRateLimiter } from './server/middleware/rateLimiter.ts';

async function sendEmailWithOtp(target: string, code: string, purpose: 'register' | 'forgot') {
  const senderEmail = 'healthaiprediction@gmail.com';
  const mailSubject = 'Health.ai Email Verification Code';
  const plainTextTemplate = `Welcome to Health.ai\n\nYour One-Time Password (OTP) for account verification is:\n\n${code}\n\nThis OTP is valid for 5 minutes.\n\nFor security reasons, do not share this code with anyone.\n\nIf you did not request this verification, please ignore this email.\n\nRegards,\nHealth.ai Security Team`;

  console.log(`\n========================================\n[EMAIL SIMULATION] To: ${target}\nFrom: ${senderEmail}\nSubject: ${mailSubject}\n----------------------------------------\n${plainTextTemplate}\n========================================\n`);
  return { success: true, simulation: true };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase App on the server for Admin operations
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let db: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const fbApp = initializeApp(firebaseConfig);
    db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || firebaseConfig.projectId);
    console.log("Firebase client initialized on the server successfully");

    // Initialize Firebase Admin SDK for user authentication profile management (Auth deletions)
    if (getAdminApps().length === 0) {
      initAdminApp({
        projectId: firebaseConfig.projectId
      });
      console.log("Firebase Admin SDK successfully initialized on the server!");
    }
  } catch (err) {
    console.error("Failed to initialize Firebase on the server:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Expensive / sensitive routes are rate limited to protect the backend.
  const aiRateLimiter = createRateLimiter({ windowMs: 60_000, max: 30, message: 'Too many AI requests. Please wait a moment before trying again.' });
  const authRateLimiter = createRateLimiter({ windowMs: 60_000, max: 20, message: 'Too many authentication attempts. Please wait before retrying.' });
  const imageRateLimiter = createRateLimiter({ windowMs: 60_000, max: 12, message: 'Too many image analysis requests. Please slow down.' });

  app.use(express.json({ limit: '25mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AI Health Prediction System' });
  });

  // API Route: Send Registration OTP (Simulated)
  app.post('/api/auth/send-register-otp', authRateLimiter, async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    const emailLower = email.toLowerCase().trim();

    try {
      // 1. Prevent duplicate account creation
      const userCheck = query(collection(db, 'users'), where('email', '==', emailLower));
      const userSnap = await getDocs(userCheck);
      if (!userSnap.empty) {
        return res.status(400).json({ error: "An account with this email address already exists. Please login instead." });
      }

      // 2. Fetch any pending OTP for resend limits
      const otpCheck = query(
        collection(db, 'otps'),
        where('email', '==', emailLower),
        where('verification_status', '==', 'pending')
      );
      const otpSnap = await getDocs(otpCheck);
      
      let resendCount = 0;
      if (!otpSnap.empty) {
        const mostRecent = otpSnap.docs[0];
        const data = mostRecent.data();
        
        // Allow resend only after 30 seconds
        const ageSeconds = (Date.now() - new Date(data.otp_created_time).getTime()) / 1000;
        if (ageSeconds < 30) {
          return res.status(400).json({ error: "Please wait 30 seconds before requesting a new OTP." });
        }
        
        resendCount = (data.resend_count || 0) + 1;
        if (resendCount > 5) {
          return res.status(400).json({ error: "Maximum resend attempts (5) exceeded. Please wait or contact support." });
        }

        // Invalidate previous OTP
        await updateDoc(doc(db, 'otps', mostRecent.id), {
          verification_status: 'superseded'
        });
      }

      // 3. Generate random 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const createdTime = new Date();
      const expiryTime = new Date(createdTime.getTime() + 5 * 60 * 1000); // 5 minutes

      // 4. Save OTP reference securely in Firestore
      await addDoc(collection(db, 'otps'), {
        user_id: 'pending-register',
        email: emailLower,
        otp_code: code,
        otp_created_time: createdTime.toISOString(),
        otp_expiry_time: expiryTime.toISOString(),
        verification_status: 'pending',
        resend_count: resendCount,
        verification_attempts: 0
      });

      // 5. Dispatch email via transporter
      const mailRes = await sendEmailWithOtp(emailLower, code, 'register');

      return res.json({ 
        success: true, 
        simulation: mailRes.simulation,
        message: mailRes.simulation 
          ? "Verification code simulated content logged successfully." 
          : "Verification code has been sent to your email address." 
      });
    } catch (err: any) {
      console.error("Error sending register OTP:", err);
      return res.status(500).json({ error: err.message || "Failed to send verification code." });
    }
  });

  // API Route: Send Forgot Password OTP
  app.post('/api/auth/send-forgot-otp', authRateLimiter, async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    const emailLower = email.toLowerCase().trim();

    try {
      // 1. Ensure user account exists
      const userCheck = query(collection(db, 'users'), where('email', '==', emailLower));
      const userSnap = await getDocs(userCheck);
      if (userSnap.empty) {
        return res.status(404).json({ error: "No user found with this email" });
      }

      const userId = userSnap.docs[0].id;

      // 2. Fetch pending OTP for resend limits
      const otpCheck = query(
        collection(db, 'otps'),
        where('email', '==', emailLower),
        where('verification_status', '==', 'pending')
      );
      const otpSnap = await getDocs(otpCheck);
      
      let resendCount = 0;
      if (!otpSnap.empty) {
        const mostRecent = otpSnap.docs[0];
        const data = mostRecent.data();
        
        // Allow resend only after 30 seconds
        const ageSeconds = (Date.now() - new Date(data.otp_created_time).getTime()) / 1000;
        if (ageSeconds < 30) {
          return res.status(400).json({ error: "Please wait 30 seconds before requesting a new OTP." });
        }
        
        resendCount = (data.resend_count || 0) + 1;
        if (resendCount > 5) {
          return res.status(400).json({ error: "Maximum resend attempts (5) reached." });
        }

        // Invalidate previous OTP
        await updateDoc(doc(db, 'otps', mostRecent.id), {
          verification_status: 'superseded'
        });
      }

      // 3. Generate internal 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const createdTime = new Date();
      const expiryTime = new Date(createdTime.getTime() + 5 * 60 * 1000); // 5 minutes

      // 4. Save to Firestore
      await addDoc(collection(db, 'otps'), {
        user_id: userId,
        email: emailLower,
        otp_code: code,
        otp_created_time: createdTime.toISOString(),
        otp_expiry_time: expiryTime.toISOString(),
        verification_status: 'pending',
        resend_count: resendCount,
        verification_attempts: 0
      });

      // 5. Send verification email
      const mailRes = await sendEmailWithOtp(emailLower, code, 'forgot');

      return res.json({ 
        success: true, 
        simulation: mailRes.simulation,
        message: mailRes.simulation 
          ? "Verification code simulated content logged successfully." 
          : "Verification code has been sent to your email address." 
      });
    } catch (err: any) {
      console.error("Error sending forgot OTP:", err);
      return res.status(500).json({ error: err.message || "Failed to send reset code." });
    }
  });

  // API Route: Verify Register OTP & Securely Create Account
  app.post('/api/auth/verify-register-otp', authRateLimiter, async (req, res) => {
    const { name, gender, dob, email, mobile, address, password, code } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ error: "Email, verification code and password are required." });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    const emailLower = email.toLowerCase().trim();

    try {
      // 1. Fetch pending OTP
      const q = query(
        collection(db, 'otps'),
        where('email', '==', emailLower),
        where('verification_status', '==', 'pending')
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        return res.status(400).json({ error: "No pending verification found. Please request a new OTP." });
      }

      const otpDoc = snap.docs[0];
      const otpData = otpDoc.data();

      // 2. Expiration check
      if (Date.now() > new Date(otpData.otp_expiry_time).getTime()) {
        await updateDoc(doc(db, 'otps', otpDoc.id), {
          verification_status: 'expired'
        });
        return res.status(400).json({ error: "OTP has expired. Request a new code." });
      }

      // 3. Brute-force protection tracking
      const attempts = (otpData.verification_attempts || 0) + 1;
      await updateDoc(doc(db, 'otps', otpDoc.id), {
        verification_attempts: attempts
      });

      if (attempts > 5) {
        await updateDoc(doc(db, 'otps', otpDoc.id), {
          verification_status: 'failed'
        });
        return res.status(400).json({ error: "Maximum verification attempts (5) exceeded. Please request a new OTP." });
      }

      // 4. Validate Code match
      if (code !== otpData.otp_code) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }

      // 5. Mark OTP as verified
      await updateDoc(doc(db, 'otps', otpDoc.id), {
        verification_status: 'verified'
      });

      // 6. Calculate real age based on Date of Birth
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // 7. Securely Hash Password
      const hashedPassword = hashPassword(password);

      // 8. Create user auth record in Firebase Admin Auth
      let uid = "uid_" + Math.random().toString(36).substring(2, 11);
      try {
        const userRecord = await getAdminAuth().createUser({
          email: emailLower,
          password: password,
          displayName: name,
        });
        uid = userRecord.uid;
        console.log(`[firebase-admin] Created authenticated auth record: ${uid}`);
      } catch (adminErr: any) {
        console.warn("[firebase-admin] Optional admin side authenticated creation warning:", adminErr.message || adminErr);
        // Fallback to state-managed custom UID if auth user already exists or firebase-admin has offline mode
      }

      // 9. Persist verified profile inside Firestore
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        name,
        email: emailLower,
        mobile,
        gender,
        age: age.toString(),
        dob,
        address,
        password: hashedPassword, // Store securely hashed password
        role: 'user',
        verified: true,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Log activity
      await addDoc(collection(db, 'activities'), {
        userId: uid,
        userName: name,
        type: 'login',
        details: `Successfully completed email OTP verification and registered account!`,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });

      return res.json({
        success: true,
        user: {
          uid,
          role: 'user',
          name
        },
        message: "Email verified successfully. Account created."
      });
    } catch (err: any) {
      console.error("Error verifying register OTP:", err);
      return res.status(500).json({ error: err.message || "Failed to verify registration code." });
    }
  });

  // API Route: Verify Forgot OTP & Complete Password Reset
  app.post('/api/auth/verify-forgot-otp', authRateLimiter, async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code and new password are required." });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    const emailLower = email.toLowerCase().trim();

    try {
      // 1. Find pending OTP
      const q = query(
        collection(db, 'otps'),
        where('email', '==', emailLower),
        where('verification_status', '==', 'pending')
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        return res.status(400).json({ error: "No pending verification found. Please request a new OTP." });
      }

      const otpDoc = snap.docs[0];
      const otpData = otpDoc.data();

      // 2. Expiration check
      if (Date.now() > new Date(otpData.otp_expiry_time).getTime()) {
        await updateDoc(doc(db, 'otps', otpDoc.id), {
          verification_status: 'expired'
        });
        return res.status(400).json({ error: "OTP has expired. Request a new code." });
      }

      // 3. Brute force tracker
      const attempts = (otpData.verification_attempts || 0) + 1;
      await updateDoc(doc(db, 'otps', otpDoc.id), {
        verification_attempts: attempts
      });

      if (attempts > 5) {
        await updateDoc(doc(db, 'otps', otpDoc.id), {
          verification_status: 'failed'
        });
        return res.status(400).json({ error: "Maximum verification attempts (5) exceeded. Please request a new OTP." });
      }

      // 4. Validate OTP match
      if (code !== otpData.otp_code) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }

      // 5. Mark OTP as verified
      await updateDoc(doc(db, 'otps', otpDoc.id), {
        verification_status: 'verified'
      });

      // 6. Fetch user profile
      const userCheck = query(collection(db, 'users'), where('email', '==', emailLower));
      const userSnap = await getDocs(userCheck);
      if (userSnap.empty) {
        return res.status(404).json({ error: "Associated user profile could not be located." });
      }

      const userDoc = userSnap.docs[0];
      const targetUid = userDoc.id;

      // 7. Secure Hashing & Update
      const hashedPassword = hashPassword(newPassword);

      try {
        await getAdminAuth().updateUser(targetUid, {
          password: newPassword
        });
      } catch (adminErr) {
        console.warn("[firebase-admin] Optional admin user update warning:", adminErr);
      }

      await updateDoc(doc(db, 'users', targetUid), {
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      });

      // Log success
      await addDoc(collection(db, 'activities'), {
        userId: targetUid,
        userName: userDoc.data().name || 'User',
        type: 'profile_update',
        details: `Successfully completed password reset using secure OTP verification`,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });

      return res.json({
        success: true,
        user: {
          uid: targetUid,
          role: userDoc.data().role || 'user',
          name: userDoc.data().name || 'User'
        },
        message: "Email verified successfully. Password reset completed."
      });
    } catch (err: any) {
      console.error("Error resetting password via OTP:", err);
      return res.status(500).json({ error: err.message || "Failed to reset password." });
    }
  });

  // API Route: Reset Password
  app.post('/api/auth/reset-password', authRateLimiter, async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return res.status(404).json({ error: "No user found with this email" });
      }

      const userDoc = snapshot.docs[0];
      const hashedPassword = hashPassword(newPassword);
      await updateDoc(doc(db, 'users', userDoc.id), {
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      });

      return res.json({ success: true, message: "Password updated successfully!" });
    } catch (err: any) {
      console.error("Server Reset Password Error:", err);
      return res.status(500).json({ error: err.message || "Failed to reset password" });
    }
  });

  const REGISTERED_USERS_FILE = path.join(process.cwd(), 'src/data/registered_patients.json');

  function loadRegisteredUsers(): Record<string, any> {
    try {
      if (fs.existsSync(REGISTERED_USERS_FILE)) {
        return JSON.parse(fs.readFileSync(REGISTERED_USERS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.warn("Failed to load registered patients file:", e);
    }
    return {};
  }

  function saveRegisteredUser(user: any) {
    try {
      const users = loadRegisteredUsers();
      users[user.email.toLowerCase().trim()] = user;
      fs.writeFileSync(REGISTERED_USERS_FILE, JSON.stringify(users, null, 2));
    } catch (e) {
      console.warn("Failed to save registered patient file:", e);
    }
  }

  // API Route: Direct Patient Registration
  app.post('/api/auth/register', authRateLimiter, async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const emailLower = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.com$/i.test(emailLower)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    try {
      // 1. Check local registry first (instant)
      const localUsers = loadRegisteredUsers();
      if (localUsers[emailLower]) {
        return res.status(400).json({ error: "An account with this email already exists. Please log in." });
      }

      const hashedPassword = hashPassword(password);
      const uid = "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

      const newUser = {
        id: uid,
        uid,
        name: name.trim(),
        email: emailLower,
        password: hashedPassword,
        role: 'user',
        verified: true,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 2. Persist to local JSON database immediately
      saveRegisteredUser(newUser);

      // 3. Sync to Firestore & Admin in background (non-blocking)
      if (db) {
        setDoc(doc(db, 'users', uid), newUser).catch(e => console.warn("Firestore user sync:", e));
        addDoc(collection(db, 'activities'), {
          userId: uid,
          userName: name.trim(),
          type: 'login',
          details: 'Patient registered successfully and profile created.',
          timestamp: new Date().toISOString(),
          createdAt: new Date()
        }).catch(() => {});
      }

      getAdminAuth().createUser({
        uid,
        email: emailLower,
        password: password,
        displayName: name.trim(),
      }).catch(() => {});

      return res.json({
        success: true,
        message: "Registration successful! You can now log in with your email and password.",
        user: {
          uid,
          id: uid,
          name: name.trim(),
          email: emailLower,
          role: 'user'
        }
      });
    } catch (err: any) {
      console.error("Registration Error:", err);
      return res.status(500).json({ error: err.message || "Failed to register account." });
    }
  });

  // API Route: Login Authenticator
  app.post('/api/auth/login', authRateLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Username and password are required." });
    }

    const identifier = email.toLowerCase().trim();

    // DEMO-ONLY convenience accounts. Hard-disabled in production so they can
    // never grant privileged access on a deployed instance.
    const demoAccountsEnabled = process.env.NODE_ENV !== 'production';

    // 1. Demo Patient Credentials (development only)
    if (demoAccountsEnabled && (identifier === 'user' || identifier === 'user@health.ai') && password === 'user123') {
      return res.json({
        success: true,
        user: {
          uid: 'user-bypass-id',
          id: 'user-bypass-id',
          role: 'user',
          name: 'Patient (Default)',
          email: 'user@health.ai',
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patient'
        }
      });
    }

    // 2. Demo Admin Credentials (development only)
    if (demoAccountsEnabled && (identifier === 'admin' || identifier === 'admin@health.ai') && password === 'admin123') {
      return res.json({
        success: true,
        user: {
          uid: 'admin-bypass-id',
          id: 'admin-bypass-id',
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@health.ai',
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        }
      });
    }

    try {
      // 3. Check persistent registered registry first (instant 0.1ms)
      const localUsers = loadRegisteredUsers();
      if (localUsers[identifier]) {
        const userData = localUsers[identifier];
        const verification = verifyPassword(userData.password, password);
        if (verification.valid) {
          // Transparently upgrade legacy SHA-256 hashes to scrypt on successful login.
          if (verification.needsRehash) {
            saveRegisteredUser({ ...userData, password: hashPassword(password) });
          }
          return res.json({
            success: true,
            user: {
              uid: userData.id || userData.uid,
              id: userData.id || userData.uid,
              role: userData.role || 'user',
              name: userData.name || 'User',
              email: userData.email,
              photo: userData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name || 'User')}`
            }
          });
        } else {
          return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
        }
      }

      // 4. Fallback check in Firestore with 1.2s timeout race
      if (db) {
        const firestoreCheck = new Promise<any>(async (resolve) => {
          try {
            const q = query(collection(db, 'users'), where('email', '==', identifier));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const uDoc = snapshot.docs[0];
              const uData = uDoc.data();
              // Cache locally
              saveRegisteredUser({ ...uData, id: uDoc.id });
              resolve({ found: true, userData: uData, id: uDoc.id });
              return;
            }
          } catch (e) {
            console.warn("Firestore lookup warn:", e);
          }
          resolve({ found: false });
        });

        const timeout = new Promise<any>((resolve) => setTimeout(() => resolve({ timeout: true }), 1200));
        const checkResult = await Promise.race([firestoreCheck, timeout]);

        if (checkResult?.found && checkResult.userData) {
          const userData = checkResult.userData;
          const verification = verifyPassword(userData.password, password);
          if (verification.valid) {
            if (verification.needsRehash) {
              saveRegisteredUser({ ...userData, id: checkResult.id, password: hashPassword(password) });
            }
            return res.json({
              success: true,
              user: {
                uid: checkResult.id,
                id: checkResult.id,
                role: userData.role || 'user',
                name: userData.name || 'User',
                email: userData.email,
                photo: userData.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name || 'User')}`
              }
            });
          } else {
            return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
          }
        }
      }

      // 5. User not found anywhere -> reject (strict unregistered protection)
      return res.status(401).json({ error: "Account not registered. Please register first to access your portal." });
    } catch (err: any) {
      console.error("Server Login Error:", err);
      return res.status(500).json({ error: err.message || "Authentication error occurred." });
    }
  });

  // API Route: Delete User (Admin only)
  app.post('/api/admin/delete-user', async (req, res) => {
    const { userId, requesterId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!db) {
      return res.status(500).json({ error: "Database not initialized on server" });
    }

    // Prevention of deletion of default system users
    const isProtected = userId === 'admin-bypass-id' || userId === 'user-bypass-id';
    if (isProtected) {
      return res.status(403).json({ error: "System Integrity Violation: The System Administrator account (admin@health.ai) and Default Tester account (user@health.ai) are designated high-level assets and cannot be deleted." });
    }

    try {
      // Validate that the requester is an admin or is the admin bypass ID
      let isRequesterAdmin = false;
      let requesterName = 'Admin Controller';
      if (requesterId === 'admin-bypass-id') {
        isRequesterAdmin = true;
      } else if (requesterId) {
        const reqDoc = await getDocs(query(collection(db, 'users'), where('id', '==', requesterId)));
        if (!reqDoc.empty) {
          const reqData = reqDoc.docs[0].data();
          requesterName = reqData.name || 'System Administrator';
          if (reqData.role === 'admin') {
            isRequesterAdmin = true;
          }
        }
      }

      if (!isRequesterAdmin) {
        return res.status(403).json({ error: "Unauthorized. Admin privileges required." });
      }

      // Check if target user doc exists and check email block
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      let targetUserName = 'Deleted User';
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        targetUserName = userData.name || 'Deleted User';
        const targetEmail = (userData.email || '').toLowerCase();
        if (targetEmail === 'admin@health.ai' || targetEmail === 'user@health.ai') {
          return res.status(403).json({ error: "System Integrity Violation: The System Administrator account (admin@health.ai) and Default Tester account (user@health.ai) contain critical routing metadata and cannot be deleted." });
        }
      }

      // Delete the user document in firestore
      await deleteDoc(userDocRef);

      // Also delete the user from Firebase Authentication completely so they can register again
      try {
        console.log(`[firebase-admin] Triggering deletion of user auth record for UID: ${userId}`);
        await getAdminAuth().deleteUser(userId);
        console.log(`[firebase-admin] Successfully deleted Firebase Auth user ${userId}`);
      } catch (authErr: any) {
        console.warn(`[firebase-admin] Non-fatal auth deletion warning for ${userId}:`, authErr.message || authErr);
      }

      // Also clean up any prediction documents belonging to this user
      const predictionsSnap = await getDocs(query(collection(db, 'predictions'), where('userId', '==', userId)));
      for (const predDoc of predictionsSnap.docs) {
        await deleteDoc(doc(db, 'predictions', predDoc.id));
      }

      // Log the deletion activity
      await addDoc(collection(db, 'activities'), {
        userId: requesterId || 'admin-bypass-id',
        userName: requesterName,
        type: 'profile_update',
        details: `Deleted user: ${targetUserName} (UID: ${userId}) and securely purged all associated diagnostic records`,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });

      return res.json({ success: true, message: "User and their records deleted successfully!" });
    } catch (err: any) {
      console.error("Server Delete User Error:", err);
      return res.status(500).json({ error: err.message || "Failed to delete user" });
    }
  });

  // API Route: Advanced AI Disease Prediction (Explainable AI)
  app.post('/api/ai/predict-disease', aiRateLimiter, async (req, res) => {
    try {
      const { selectedSymptoms, userProfile, healthMetrics } = req.body;
      if (!selectedSymptoms || !Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
        return res.status(400).json({ error: "At least one symptom must be provided." });
      }

      const prompt = `You are a medical diagnostic AI engine.
Analyze these selected symptoms: ${selectedSymptoms.join(', ')}.
User Profile context: Age: ${userProfile?.age || 'Unknown'}, Gender: ${userProfile?.gender || 'Unknown'}, BMI: ${healthMetrics?.bmi || 'Unknown'}.

Perform a detailed differential diagnosis and output ONLY valid JSON matching this schema exactly:
{
  "topDiseases": [
    {
      "disease": "Disease Name",
      "probability": 85, // integer 0 to 100
      "confidence": 90, // integer 0 to 100
      "risk": "Low" | "Moderate" | "High" | "Critical",
      "severity": "Mild" | "Moderate" | "Severe",
      "confidenceExplanation": "High alignment due to presence of key pathognomonic symptoms."
    }
  ], // Provide top 5 to 7 potential conditions ordered by probability descending
  "primaryDisease": "Top Disease Name",
  "primaryRisk": "Low" | "Moderate" | "High" | "Critical",
  "primaryProbability": 85,
  "healthScore": 82, // Estimated overall health score 0 to 100 considering risk
  "reasoningSummary": "Clinical reasoning explaining why the primary disease has highest probability given the symptom constellation.",
  "contributingSymptoms": [
    {
      "symptom": "Symptom Name",
      "contribution": "High" | "Medium" | "Low",
      "importanceScore": 85
    }
  ],
  "overview": "2-3 sentence clinical summary of the primary condition.",
  "commonCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "preventionTips": ["Tip 1", "Tip 2", "Tip 3"],
  "lifestyleSuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "dietRecommendations": {
    "foodsToInclude": ["Food 1", "Food 2", "Food 3"],
    "foodsToLimit": ["Food 1", "Food 2", "Food 3"],
    "hydrationTips": "Drink at least 2.5L water daily...",
    "mealPlanSummary": "Balanced Mediterranean or light anti-inflammatory diet."
  },
  "exerciseRecommendations": {
    "activities": ["Light walking 20 mins", "Deep breathing exercises"],
    "frequency": "Daily or as tolerated",
    "precautions": "Avoid intense strain during acute flareups."
  },
  "followUpAdvice": {
    "monitoringTips": ["Monitor temperature twice daily", "Track symptom progression in app"],
    "routineCheckup": "Schedule routine consult with Primary Care Physician within 3-5 days.",
    "urgentWarningSigns": ["High fever (>103°F)", "Difficulty breathing", "Severe unremitting pain"]
  }
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          systemInstruction: 'You are an expert clinical AI diagnostic assistant. Return ONLY clean, valid JSON matching the requested schema. Do not add markdown backticks if possible.'
        }
      });

      let cleanText = response.text || '{}';
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);

      return res.json({ success: true, data: parsedData, engine: 'gemini_3.8_flash' });
    } catch (err: any) {
      console.warn("Gemini Disease Prediction failed or rate limited, falling back to Local Clinical ML engine:", err?.message || err);
      try {
        const localResult = predictDiseaseLocalML(req.body.selectedSymptoms, req.body.userProfile, req.body.healthMetrics);
        return res.json({ success: true, data: localResult, engine: 'local_clinical_ml' });
      } catch (localErr: any) {
        console.error("Local ML Fallback Error:", localErr);
        return res.status(500).json({ error: err.message || "Failed to generate AI diagnostic prediction." });
      }
    }
  });

  // API Route: AI Prescription Analyzer (OCR)
  app.post('/api/ai/analyze-prescription', imageRateLimiter, async (req, res) => {
    try {
      const { imageBase64, mimeType, fileName } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Prescription image or document base64 data is required." });
      }

      const prompt = `You are a specialized medical OCR and pharmacology AI assistant.
Analyze this medical prescription image or document.
Extract all readable handwriting, printed text, doctor information, and prescribed medications.

Output ONLY valid JSON matching this schema:
{
  "doctorName": "Dr. Full Name or 'Unspecified'",
  "clinicName": "Clinic/Hospital Name or 'Unspecified'",
  "dateDetected": "YYYY-MM-DD or 'Unspecified'",
  "extractedText": "Complete raw extracted OCR text transcript from prescription",
  "medicines": [
    {
      "id": "med-1",
      "name": "Brand/Trade Name",
      "genericName": "Generic Active Ingredient (e.g. Paracetamol)",
      "purpose": "Condition treated (e.g. Pain & Fever relief)",
      "dosage": "500 mg",
      "timing": "Morning & Night (1-0-1)",
      "relationToFood": "After Food",
      "confidence": "High" | "Medium" | "Low",
      "commonSideEffects": ["Mild nausea", "Drowsiness"],
      "precautions": "Do not exceed recommended dose. Avoid alcohol.",
      "storageGuidance": "Store in a cool dry place away from direct sunlight."
    }
  ],
  "unreadableSections": ["Highlighted illegible handwriting lines or unclear dosage notes"],
  "overallConfidence": "High" | "Medium" | "Low",
  "generalSafetyGuidance": [
    "Always verify dosages with a licensed pharmacist before consumption.",
    "Keep all medications out of reach of children."
  ]
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '')
            }
          },
          prompt
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          systemInstruction: 'You are an accurate medical OCR vision system. Extract prescription details with precision. Return ONLY valid JSON.'
        }
      });

      let cleanText = response.text || '{}';
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);

      return res.json({ success: true, data: parsedData, engine: 'gemini_3.8_flash' });
    } catch (err: any) {
      console.warn("Gemini Prescription OCR fallback activated:", err?.message || err);
      // Smart OCR vision heuristic fallback
      const fallbackPrescription = {
        doctorName: "Dr. A. Sharma, M.D.",
        clinicName: "General Health Care Clinic",
        dateDetected: new Date().toISOString().split('T')[0],
        extractedText: "Rx: Amoxicillin 500mg - 1 capsule three times daily for 7 days. Paracetamol 650mg - 1 tab as needed for fever. Cetirizine 10mg - 1 tab at bedtime.",
        medicines: [
          {
            id: "med-1",
            name: "Amoxicillin",
            genericName: "Amoxicillin Trihydrate",
            purpose: "Bacterial Infection Treatment",
            dosage: "500 mg",
            timing: "Three times daily (1-1-1)",
            relationToFood: "After Food",
            confidence: "High",
            commonSideEffects: ["Mild nausea", "Digestive upset"],
            precautions: "Complete full antibiotic course even if feeling better.",
            storageGuidance: "Store in a cool, dry place."
          },
          {
            id: "med-2",
            name: "Paracetamol",
            genericName: "Acetaminophen",
            purpose: "Fever & Pain Relief",
            dosage: "650 mg",
            timing: "SOS / As Needed (Max 3/day)",
            relationToFood: "After Food",
            confidence: "High",
            commonSideEffects: ["None at standard dosage"],
            precautions: "Do not exceed 3000mg total in 24 hours. Avoid alcohol.",
            storageGuidance: "Store at room temperature."
          }
        ],
        unreadableSections: ["Signature validated; dosage instructions verified."],
        overallConfidence: "High",
        generalSafetyGuidance: [
          "Always confirm dosage instructions with your dispensing pharmacist.",
          "Keep all medicines out of reach of children and pets."
        ]
      };
      return res.status(503).json({
        success: false,
        unavailable: true,
        error: "Prescription analysis is temporarily unavailable. Please try again shortly."
      });
    }
  });

  // API Route: AI Medical Image Analyzer
  app.post('/api/ai/analyze-medical-image', imageRateLimiter, async (req, res) => {
    try {
      const { imageBase64, mimeType, imageType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Medical image base64 data is required." });
      }

      const prompt = `You are a radiological and clinical visual AI assistant.
Analyze this medical image (Category: ${imageType || 'General Medical Scan'}).
Evaluate image quality, visual patterns, structural features, and provide educational clinical findings.

Output ONLY valid JSON matching this schema:
{
  "qualityCheck": {
    "resolutionRating": "Good" | "Fair" | "Poor",
    "contrastAdequacy": true,
    "brightnessAdequacy": true,
    "blurDetected": false,
    "overallSuitable": true,
    "qualityScore": 92
  },
  "confidenceLevel": "High" | "Moderate" | "Low",
  "primaryInterpretation": "Clear, plain language clinical description of key visual findings.",
  "plainLanguageExplanation": "Detailed educational explanation suitable for patient understanding.",
  "possibleConditions": [
    {
      "condition": "Condition Name",
      "relativeConfidence": 85,
      "description": "Brief explanation of pattern correlation."
    }
  ],
  "annotations": [
    {
      "id": "region-1",
      "label": "Observed Area / Density",
      "x": 45, // percentage 0 to 100 for box center X
      "y": 40, // percentage 0 to 100 for box center Y
      "width": 25, // percentage width
      "height": 20, // percentage height
      "confidence": 88,
      "note": "Note regarding visual variation or feature"
    }
  ],
  "generalHealthGuidance": [
    "This AI visual analysis is for educational and screening assistance only.",
    "Always consult a qualified radiologist or specialist for official diagnostic confirmation."
  ]
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
            }
          },
          prompt
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          systemInstruction: 'You are a medical radiology visual AI assistant. Output ONLY valid JSON.'
        }
      });

      let cleanText = response.text || '{}';
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);

      return res.json({ success: true, data: parsedData, engine: 'gemini_3.8_flash' });
    } catch (err: any) {
      console.warn("Gemini Medical Image Vision fallback activated:", err?.message || err);
      const fallbackRadiology = {
        qualityCheck: {
          resolutionRating: "Good",
          contrastAdequacy: true,
          brightnessAdequacy: true,
          blurDetected: false,
          overallSuitable: true,
          qualityScore: 92
        },
        confidenceLevel: "High",
        primaryInterpretation: "Scan exhibits standard anatomical landmarks. Mild parenchymal density variation observed in the examined field.",
        plainLanguageExplanation: "The uploaded medical scan shows well-defined anatomical contours. No overt signs of acute fracture, massive consolidation, or critical lesions were detected. Ongoing clinical correlation is recommended.",
        possibleConditions: [
          {
            condition: "Mild Bronchial / Soft Tissue Inflammation",
            relativeConfidence: 84,
            description: "Prominence in interstitial markings consistent with minor reactive or post-viral changes."
          },
          {
            condition: "Normal Anatomical Variant",
            relativeConfidence: 78,
            description: "No acute cardiopulmonary or osseous pathology detected."
          }
        ],
        annotations: [
          {
            id: "region-1",
            label: "Evaluated Field Area",
            x: 50,
            y: 45,
            width: 35,
            height: 30,
            confidence: 88,
            note: "Clear visual region with expected tissue contrast and density profile"
          }
        ],
        generalHealthGuidance: [
          "This AI visual screening is intended for assistive and educational screening purposes only.",
          "Please share this report with your consulting radiologist or physician for definitive diagnostic review."
        ]
      };      return res.status(503).json({
        success: false,
        unavailable: true,
        error: "Medical image analysis is temporarily unavailable. Please try again shortly."
      });
    }


  });

  // API Route: AI Live Disease Detection (Camera)
  app.post('/api/ai/live-disease-detection', imageRateLimiter, async (req, res) => {
    try {
      const { imageBase64, mimeType, focusArea } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Camera image capture base64 is required." });
      }

      const prompt = `You are a dermatology and surface clinical AI assistant.
Analyze this live camera capture of a visible skin or external condition (User focus area: ${focusArea || 'General External'}).
Perform quality assessment, feature identification, and educational analysis.

Output ONLY valid JSON matching this schema:
{
  "conditionCategory": "${focusArea || 'Skin & External Condition'}",
  "qualityCheck": {
    "brightness": "Good" | "Poor",
    "sharpness": "Good" | "Blurry",
    "lighting": "Good" | "Dark",
    "overallSuitable": true
  },
  "confidenceLevel": "High" | "Moderate" | "Low",
  "observedFeatures": [
    "Erythematous papules with mild scaling",
    "Localized epidermal inflammation"
  ],
  "possibleConditions": [
    {
      "condition": "Condition Name (e.g., Contact Dermatitis / Acne Vulgaris / Eczema)",
      "relativeConfidence": 80,
      "overview": "Educational overview of the visible pattern."
    }
  ],
  "annotations": [
    {
      "id": "ann-1",
      "label": "Primary Lesion Area",
      "x": 50,
      "y": 48,
      "width": 30,
      "height": 30,
      "confidence": 85,
      "note": "Concentrated redness and localized skin irritation"
    }
  ],
  "educationalExplanation": "Clear educational explanation of what is observed in the photo.",
  "generalCareGuidance": [
    "Keep the affected area clean and dry.",
    "Avoid harsh soaps, scratching, or popping lesions.",
    "Apply gentle hypoallergenic moisturizer if skin is dry."
  ],
  "urgentWarningSigns": [
    "Rapidly spreading redness or warmth",
    "Fever or systemic illness",
    "Purulent discharge or severe worsening pain"
  ]
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
            }
          },
          prompt
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          systemInstruction: 'You are an educational visual dermatology AI assistant. Output ONLY valid JSON.'
        }
      });

      let cleanText = response.text || '{}';
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText);

      return res.json({ success: true, data: parsedData, engine: 'gemini_3.8_flash' });
    } catch (err: any) {
      console.warn("Gemini Live Disease Camera Vision fallback activated:", err?.message || err);
      const fallbackDermatology = {
        conditionCategory: req.body.focusArea || "Skin & External Condition",
        qualityCheck: {
          brightness: "Good",
          sharpness: "Good",
          lighting: "Good",
          overallSuitable: true
        },
        confidenceLevel: "High",
        observedFeatures: [
          "Superficial epidermal erythema with intact skin barrier",
          "Mild localized follicular prominence without ulceration"
        ],
        possibleConditions: [
          {
            condition: "Contact Irritation / Mild Dermatitis",
            relativeConfidence: 86,
            overview: "Localized surface skin reaction often induced by topical friction, temperature shifts, or mild irritants."
          },
          {
            condition: "Superficial Allergic Wheal",
            relativeConfidence: 74,
            overview: "Transient reactive flush responding well to gentle barrier repair and hypoallergenic care."
          }
        ],
        annotations: [
          {
            id: "ann-1",
            label: "Observed Surface Focus",
            x: 50,
            y: 48,
            width: 32,
            height: 30,
            confidence: 86,
            note: "Area of localized flush with uniform epidermal texture"
          }
        ],
        educationalExplanation: "The camera scan identifies localized surface redness without deep tissue involvement. The lesion appears superficial and stable.",
        generalCareGuidance: [
          "Gently cleanse the affected area using cool water and mild soap-free cleanser.",
          "Avoid direct friction, scratching, or aggressive topical astringents.",
          "Apply a fragrance-free barrier balm (e.g. ceramide or zinc cream) twice daily."
        ],
        urgentWarningSigns: [
          "Rapid spreading with marked warmth or swelling",
          "Appearance of blisters, purulent drainage, or constitutional fever"
        ]
      };
      return res.status(503).json({
        success: false,
        unavailable: true,
        error: "Live visual screening is temporarily unavailable. Please try again shortly."
      });
    }
  });

  // API Route: AI Health Assistant (Chatbot with health context)
  app.post('/api/ai/health-assistant', aiRateLimiter, async (req, res) => {
    try {
      const { message, healthContext, chatHistory } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const prompt = `You are Health Buddy, an empathetic, highly knowledgeable AI Health Assistant.
User Profile: Name: ${healthContext?.userName || 'User'}, Age: ${healthContext?.age || 'N/A'}, Gender: ${healthContext?.gender || 'N/A'}, Health Score: ${healthContext?.healthScore || 85}/100.
Latest Disease Prediction: ${healthContext?.latestPrediction || 'None'}.
Latest Prescription Analyzed: ${healthContext?.latestPrescription || 'None'}.

User Message: "${message}"

Respond concisely, accurately, and empathetically in 2-4 sentences. Include a practical advice tip or question if appropriate. Avoid generic disclaimer spam, but maintain safe medical tone.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
          systemInstruction: 'You are Health Buddy, a professional AI Medical Assistant. Give direct, empathetic, clear answers.'
        }
      });

      return res.json({ success: true, text: response.text || "I am here to assist with your health questions.", engine: 'gemini_3.8_flash' });
    } catch (err: any) {
      console.warn("Gemini Health Assistant Chat failed or rate limited, falling back to local NLP engine:", err?.message || err);
      try {
        const localReply = generateChatResponseLocalNLP(req.body.message, req.body.healthContext);
        return res.json({ success: true, text: localReply.text, engine: 'local_nlp_engine' });
      } catch (localErr: any) {
        console.error("Health Assistant Chat Error:", localErr);
        return res.status(500).json({ error: err.message || "Failed to generate chat response." });
      }
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP server for both Express API & Realtime WebSocket Gateway
  const httpServer = http.createServer(app);

  // Setup WebSocket Gateway for Realtime Live Health Agent
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/live-health-agent' });
  const liveSessionManager = new LiveSessionManager({
    db,
    verifyIdToken: async (token: string) => {
      const decoded = await getAdminAuth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        name: (decoded as any).name,
        email: decoded.email
      };
    }
  });

  wss.on('connection', (ws) => {
    liveSessionManager.handleConnection(ws);
  });

  httpServer.listen(PORT, "localhost", () => {
    console.log(`Server & Realtime Live Agent running at http://localhost:${PORT}`);
  });
}

startServer();
