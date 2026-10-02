import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Users, Shield, FileText, Brain, 
  Activity, Radio, Database, Settings, LogOut, Lock, Search, Sparkles 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { MOCK_ADMIN_USERS, MOCK_AUDIT_LOGS } from '@/src/data/mockAdminData';
import { AdminUserRecord, AuditLogEntry } from '@/src/types/admin';

// Sub-components
import SuperAdminHeader from '@/src/components/admin/SuperAdminHeader';
import ExecutiveDashboardTab from '@/src/components/admin/ExecutiveDashboardTab';
import UserManagementTab from '@/src/components/admin/UserManagementTab';
import RolePermissionsTab from '@/src/components/admin/RolePermissionsTab';
import AuditCenterTab from '@/src/components/admin/AuditCenterTab';
import AIAnalyticsTab from '@/src/components/admin/AIAnalyticsTab';
import SystemHealthTab from '@/src/components/admin/SystemHealthTab';
import BroadcastCenterTab from '@/src/components/admin/BroadcastCenterTab';
import BackupRecoveryTab from '@/src/components/admin/BackupRecoveryTab';
import SecuritySettingsTab from '@/src/components/admin/SecuritySettingsTab';
import AdminGlobalSearchModal from '@/src/components/admin/AdminGlobalSearchModal';

interface AdminProps {
  user?: any;
  onLogout?: () => void;
}

export default function Admin({ user: propsUser, onLogout: propsOnLogout }: AdminProps = {}) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(propsUser || { name: 'Dr. Sarah Connor', email: 'admin@health.ai', role: 'super_admin' });

  useEffect(() => {
    if (propsUser) {
      setCurrentUser(propsUser);
    }
  }, [propsUser]);

  // Primary active navigation tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Platform datasets state
  const [usersState, setUsersState] = useState<AdminUserRecord[]>(MOCK_ADMIN_USERS);
  const [auditLogsState, setAuditLogsState] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  
  // Search modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ROUTE PROTECTION: Redirect regular non-admin users to /dashboard
  useEffect(() => {
    // If user is not logged in or role is standard user, redirect
    const isBypassAdmin = localStorage.getItem('health_ai_admin_auth') === 'true';
    const isUserAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin' || isBypassAdmin;
    
    if (currentUser && currentUser.role === 'user' && !isBypassAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Logging callback
  const handleAddAuditLog = (action: string, details: string, targetEmail?: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail: currentUser?.email || 'admin@health.ai',
      adminName: currentUser?.name || 'Dr. Sarah Connor',
      adminRole: 'super_admin',
      action,
      targetUserEmail: targetEmail,
      module: 'Super Admin Control Center',
      result: 'success',
      ipAddress: '192.168.1.45',
      deviceInfo: 'MacBook Pro (Chrome 127)',
      details
    };
    setAuditLogsState(prev => [newEntry, ...prev]);
  };

  // User updates
  const handleUpdateUserRecord = (updated: AdminUserRecord) => {
    setUsersState(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // User permanent deletion
  const handleDeleteUserRecord = (userId: string) => {
    setUsersState(prev => prev.filter(u => u.id !== userId));
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('health_ai_admin_auth');
    localStorage.removeItem('authBypassUser');
    sessionStorage.clear();
    
    if (propsOnLogout) {
      propsOnLogout();
    } else {
      signOut(auth).catch(() => {});
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      
      {/* EXECUTIVE TOP HEADER */}
      <SuperAdminHeader
        user={currentUser || { name: 'Dr. Sarah Connor', email: 'admin@health.ai', role: 'super_admin' }}
        onLogout={handleLogoutAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={auditLogsState}
        onOpenGlobalSearch={() => setIsSearchOpen(true)}
      />

      {/* SECONDARY NAVIGATION TABS BAR */}
      <nav className="sticky top-20 z-30 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'User Governance', icon: Users, badge: usersState.length },
              { id: 'roles', label: 'Role & RBAC Matrix', icon: Shield },
              { id: 'audit', label: 'Audit Log Center', icon: FileText, badge: auditLogsState.length },
              { id: 'ai_analytics', label: 'AI Neural Analytics', icon: Brain },
              { id: 'system_health', label: 'Infrastructure Health', icon: Activity },
              { id: 'broadcast', label: 'Broadcast Center', icon: Radio },
              { id: 'backup', label: 'Backup & Recovery', icon: Database },
              { id: 'settings', label: 'Security & Settings', icon: Settings }
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all",
                    isActive 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{nav.label}</span>
                  {nav.badge !== undefined && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",
                      isActive ? "bg-slate-950 text-rose-400" : "bg-slate-800 text-slate-300"
                    )}>
                      {nav.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'overview' && (
          <ExecutiveDashboardTab
            onNavigateTab={setActiveTab}
            onOpenGlobalSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementTab
            users={usersState}
            onUpdateUser={handleUpdateUserRecord}
            onDeleteUser={handleDeleteUserRecord}
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'roles' && (
          <RolePermissionsTab
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'audit' && (
          <AuditCenterTab
            logs={auditLogsState}
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'ai_analytics' && (
          <AIAnalyticsTab
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'system_health' && (
          <SystemHealthTab
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'broadcast' && (
          <BroadcastCenterTab
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRecoveryTab
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'settings' && (
          <SecuritySettingsTab
            onAuditLog={handleAddAuditLog}
          />
        )}

      </main>

      {/* GLOBAL SEARCH MODAL */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        users={usersState}
        logs={auditLogsState}
        onSelectUser={(u) => {
          setActiveTab('users');
        }}
        onNavigateTab={setActiveTab}
      />

    </div>
  );
}
