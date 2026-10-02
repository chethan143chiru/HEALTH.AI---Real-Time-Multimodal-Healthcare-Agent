/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/src/components/Layout';
import Home from '@/src/pages/Home';
import About from '@/src/pages/About';
import Auth from '@/src/pages/Auth';
import Dashboard from '@/src/pages/Dashboard';
import History from '@/src/pages/History';
import Profile from '@/src/pages/Profile';
import Admin from '@/src/pages/Admin';
import MentalHealth from '@/src/pages/MentalHealth';
import LiveHealthAgent from '@/src/pages/LiveHealthAgent';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logUserActivity } from '@/src/lib/activity';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial fast hydration from local storage if present
    const bypassStr = localStorage.getItem('authBypassUser');
    if (bypassStr) {
      try {
        const bypassUser = JSON.parse(bypassStr);
        if (bypassUser && (bypassUser.uid || bypassUser.id)) {
          setUser(bypassUser);
          setLoading(false);
          // Sync background user doc if possible
          getDoc(doc(db, 'users', bypassUser.uid || bypassUser.id))
            .then(userDoc => {
              if (userDoc.exists()) {
                setUser((prev: any) => ({ ...prev, ...userDoc.data() }));
              }
            })
            .catch(err => {
              console.warn("Background user doc sync notice:", err);
            });
        }
      } catch (e) {
        localStorage.removeItem('authBypassUser');
      }
    }

    // 2. Always maintain live Firebase auth subscription
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({ ...fbUser, ...data });
          } else {
            // Role is NEVER inferred from an email string on the client.
            // Admin rights must be granted by the server / database record.
            setUser({
              uid: fbUser.uid,
              id: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || 'User',
              photo: fbUser.photoURL,
              role: 'user'
            });
          }
        } catch (e) {
          setUser(fbUser);
        }
      } else {
        // If not authenticated in Firebase, only keep bypass user if explicitly in local storage
        const currentBypass = localStorage.getItem('authBypassUser');
        if (currentBypass) {
          try {
            setUser(JSON.parse(currentBypass));
          } catch (err) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    // 1. Immediately wipe all local credentials
    localStorage.removeItem('authBypassUser');
    localStorage.removeItem('health_ai_admin_auth');
    sessionStorage.clear();
    setUser(null);

    // 2. Fire and forget activity log and signOut in background
    if (user) {
      const uid = user.uid || user.id;
      const name = user.name || user.displayName || 'User';
      logUserActivity(uid, name, 'logout', 'User explicitly signed out of the active session').catch(() => {});
    }
    signOut(auth).catch(() => {});

    // 3. Immediately redirect cleanly to public home
    window.location.href = '/';
  };

  if (loading) return null; // Or a loading spinner

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Patient & AI Diagnostic Routes (Accessible to all logged in users, including admins for testing) */}
          <Route path="/dashboard" element={!user ? <Navigate to="/auth" /> : <Dashboard />} />
          <Route path="/live-agent" element={!user ? <Navigate to="/auth" /> : <LiveHealthAgent />} />
          <Route path="/history" element={!user ? <Navigate to="/auth" /> : <History />} />
          <Route path="/mental-health" element={!user ? <Navigate to="/auth" /> : <MentalHealth />} />
          
          {/* Profile */}
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          
          {/* Super Admin Control Center Route */}
          <Route path="/admin" element={
            user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'superadmin'
              ? <Admin user={user} onLogout={handleLogout} /> 
              : <Navigate to="/auth" />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

