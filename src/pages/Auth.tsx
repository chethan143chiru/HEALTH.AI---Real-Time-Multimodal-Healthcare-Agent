import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Lock, Eye, EyeOff, ShieldCheck, ShieldAlert,
  HeartPulse, ArrowRight, CheckCircle2, AlertCircle, Sparkles,
  UserCheck, UserPlus, LogIn, KeyRound
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { logUserActivity } from '@/src/lib/activity';

type ActivePanel = 'patient' | 'admin';
type PatientMode = 'login' | 'register';

export default function Auth() {
  const [activePanel, setActivePanel] = useState<ActivePanel>('patient');
  const [patientMode, setPatientMode] = useState<PatientMode>('login');
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Patient Login Form
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [patientPassword, setPatientPassword] = useState('');

  // Patient Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Admin Login Form
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Clear messages when switching tabs
  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel);
    setError(null);
    setSuccessMessage(null);
  };

  const handlePatientModeChange = (mode: PatientMode) => {
    setPatientMode(mode);
    setError(null);
    setSuccessMessage(null);
  };

  // 1. Patient Login Handler
  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const identifier = patientIdentifier.trim().toLowerCase();
    const password = patientPassword.trim();

    if (!identifier || !password) {
      setError("Please enter both email/username and password.");
      return;
    }

    setLoading(true);

    try {
      // Check registered users via backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "User not found or invalid credentials. Please register first.");
      }

      const u = data.user;
      const userObj = {
        uid: u.uid || u.id,
        id: u.uid || u.id,
        name: u.name || 'Patient',
        email: u.email,
        role: u.role || 'user',
        photo: u.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'Patient')}`
      };

      localStorage.setItem('authBypassUser', JSON.stringify(userObj));
      sessionStorage.setItem('currentRole', userObj.role);

      logUserActivity(userObj.uid, userObj.name, 'login', 'Patient logged in').catch(() => {});

      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error("Patient Login Error:", err);
      setError(err.message || "Login failed. Unregistered users cannot log in. Please register first.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Patient Registration Handler
  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields (Name, Email, Password, Confirm Password) are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.com$/i.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Success! Switch to login mode and pre-fill the registered email
      setSuccessMessage("Registration successful! You can now log in using your registered email and password.");
      setPatientIdentifier(email);
      setPatientPassword('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setPatientMode('login');
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin Login Handler (Strict: Verified admin accounts only)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const identifier = adminIdentifier.trim().toLowerCase();
    const password = adminPassword.trim();

    if (!identifier || !password) {
      setError("Please enter administrator credentials.");
      return;
    }

    setLoading(true);

    try {
      // Check backend for verified admin accounts
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        throw new Error("Access Denied: Invalid administrator credentials.");
      }

      const u = data.user;
      if (u.role !== 'admin' && u.role !== 'superadmin' && u.role !== 'super_admin') {
        throw new Error("Access Denied: This account does not possess administrator privileges.");
      }

      const adminObj = {
        uid: u.uid || u.id,
        id: u.uid || u.id,
        name: u.name || 'System Administrator',
        email: u.email,
        role: 'admin',
        photo: u.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      };

      localStorage.setItem('authBypassUser', JSON.stringify(adminObj));
      localStorage.setItem('health_ai_admin_auth', 'true');
      sessionStorage.setItem('currentRole', 'admin');

      logUserActivity(adminObj.uid, adminObj.name, 'login', 'Administrator authenticated').catch(() => {});

      window.location.href = '/admin';
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Invalid administrator credentials. Access restricted to System Admin only.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center justify-center relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-xl">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Clinical Portal Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
            HEALTH<span className="text-blue-500">.AI</span> Access
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Select your portal to securely access healthcare intelligence & administration.
          </p>
        </div>

        {/* Top 2 Main Panels: Patient Panel vs Admin Panel */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-2xl">
          <button
            type="button"
            onClick={() => handlePanelChange('patient')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200",
              activePanel === 'patient'
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <HeartPulse className="w-4 h-4 text-white" />
            <span>Patient Panel</span>
          </button>

          <button
            type="button"
            onClick={() => handlePanelChange('admin')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200",
              activePanel === 'admin'
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Notifications / Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-xs sm:text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-400 text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================== */}
          {/* PATIENT PANEL CONTENT */}
          {/* ======================================================== */}
          {activePanel === 'patient' && (
            <div>
              {/* Sub-Tabs: Sign In vs Register */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => handlePatientModeChange('login')}
                  className={cn(
                    "pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all",
                    patientMode === 'login'
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  )}
                >
                  <LogIn className="w-4 h-4" /> Patient Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handlePatientModeChange('register')}
                  className={cn(
                    "pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all",
                    patientMode === 'register'
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  )}
                >
                  <UserPlus className="w-4 h-4" /> Register New Patient
                </button>
              </div>

              {/* PATIENT SIGN IN FORM */}
              {patientMode === 'login' && (
                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={patientIdentifier}
                        onChange={(e) => setPatientIdentifier(e.target.value)}
                        placeholder="Enter your registered email"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 italic">
                    Note: Unregistered users cannot log in. New users must register first using the "Register New Patient" tab above.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group mt-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Verifying credentials...</span>
                    ) : (
                      <>
                        <span>Sign In as Patient</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* PATIENT REGISTRATION FORM */}
              {patientMode === 'register' && (
                <form onSubmit={handlePatientRegister} className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-300">
                    Register with your name, email, password, and confirm password. Once registered, log in with your email and password.
                  </div>

                  {/* 1. Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 3. Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 4. Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group mt-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Registering patient account...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register Patient Account</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ADMIN PANEL CONTENT */}
          {/* ======================================================== */}
          {activePanel === 'admin' && (
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-red-500/20 mb-6">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-bold text-white">System Admin Portal</h3>
                  <p className="text-xs text-slate-400">Strictly authorized administrator access only</p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Admin Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="Enter admin email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group mt-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Authorizing administrator...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate as Admin</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
