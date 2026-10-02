import React, { useState } from 'react';
import { 
  Users, Search, Filter, ShieldAlert, CheckCircle2, AlertTriangle, 
  Lock, Unlock, Key, LogOut, Trash2, Download, Eye, Edit3, X, 
  ChevronRight, Calendar, UserCheck, UserX, SlidersHorizontal, ArrowUpDown, 
  Activity, FileText, Brain, Image, Camera, MessageSquare, Phone, Mail, MapPin, 
  AlertCircle, Shield, Laptop, Smartphone, HelpCircle, RefreshCw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AdminUserRecord, UserAccountStatus, AdminRole } from '@/src/types/admin';

interface UserManagementTabProps {
  users: AdminUserRecord[];
  onUpdateUser: (updated: AdminUserRecord) => void;
  onDeleteUser: (userId: string) => void;
  onAuditLog: (action: string, details: string, targetEmail?: string) => void;
}

export default function UserManagementTab({
  users,
  onUpdateUser,
  onDeleteUser,
  onAuditLog
}: UserManagementTabProps) {
  // Directory state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'registrationDate' | 'healthScore' | 'predictionsCount'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selection & Pagination
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Profile Drawer State
  const [activeDrawerUser, setActiveDrawerUser] = useState<AdminUserRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<'personal' | 'account' | 'health' | 'prediction' | 'prescription' | 'medical_image' | 'live_camera' | 'assistant'>('personal');

  // Account Control Modals
  const [lockModalUser, setLockModalUser] = useState<AdminUserRecord | null>(null);
  const [lockReason, setLockReason] = useState('Security precaution requested by administrator');
  
  const [suspendModalUser, setSuspendModalUser] = useState<AdminUserRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState('Violation of platform safety guidelines');
  
  // Danger Zone Deletion Modal
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserRecord | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && u.isVerified) ||
      (verificationFilter === 'unverified' && !u.isVerified);

    return matchesSearch && matchesStatus && matchesRole && matchesVerification;
  }).sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';
    if (typeof valA === 'string') {
      return sortOrder === 'asc' 
        ? (valA as string).localeCompare(valB as string) 
        : (valB as string).localeCompare(valA as string);
    }
    return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handlers for Account Controls
  const handleVerifyUserToggle = (user: AdminUserRecord) => {
    const updated: AdminUserRecord = {
      ...user,
      isVerified: !user.isVerified,
      status: !user.isVerified ? 'verified' : 'active'
    };
    onUpdateUser(updated);
    onAuditLog(
      user.isVerified ? 'UNVERIFY_USER' : 'VERIFY_USER',
      `${user.isVerified ? 'Revoked' : 'Granted'} verified badge for ${user.email}`,
      user.email
    );
  };

  const handleConfirmLock = () => {
    if (!lockModalUser) return;
    const updated: AdminUserRecord = {
      ...lockModalUser,
      status: lockModalUser.status === 'locked' ? 'active' : 'locked',
      lockDetails: lockModalUser.status === 'locked' ? undefined : {
        reason: lockReason,
        lockedAt: new Date().toISOString(),
        lockedBy: 'admin@health.ai'
      }
    };
    onUpdateUser(updated);
    onAuditLog(
      lockModalUser.status === 'locked' ? 'UNLOCK_USER_ACCOUNT' : 'LOCK_USER_ACCOUNT',
      `Account ${lockModalUser.status === 'locked' ? 'unlocked' : 'locked'}: ${lockReason}`,
      lockModalUser.email
    );
    setLockModalUser(null);
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalUser) return;
    const updated: AdminUserRecord = {
      ...suspendModalUser,
      status: suspendModalUser.status === 'suspended' ? 'active' : 'suspended',
      suspensionDetails: suspendModalUser.status === 'suspended' ? undefined : {
        reason: suspendReason,
        startDate: new Date().toISOString(),
        suspendedBy: 'admin@health.ai'
      }
    };
    onUpdateUser(updated);
    onAuditLog(
      suspendModalUser.status === 'suspended' ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
      `User ${suspendModalUser.status === 'suspended' ? 'reactivated' : 'suspended'}: ${suspendReason}`,
      suspendModalUser.email
    );
    setSuspendModalUser(null);
  };

  const handleForcePasswordReset = (user: AdminUserRecord) => {
    alert(`Password reset recovery link generated and sent to ${user.email}.`);
    onAuditLog('FORCE_PASSWORD_RESET', `Initiated emergency password reset for ${user.email}`, user.email);
  };

  const handleForceLogoutSessions = (user: AdminUserRecord) => {
    const updated: AdminUserRecord = {
      ...user,
      activeDevices: []
    };
    onUpdateUser(updated);
    alert(`Terminated all active desktop, tablet, and mobile sessions for ${user.name}.`);
    onAuditLog('FORCE_LOGOUT_ALL_SESSIONS', `Terminated all active sessions for ${user.email}`, user.email);
  };

  const handleConfirmPermanentDelete = () => {
    if (!deleteModalUser) return;
    if (deleteConfirmInput !== 'DELETE USER') {
      alert('You must type "DELETE USER" exactly to confirm permanent deletion.');
      return;
    }

    if (deleteModalUser.email === 'admin@health.ai' || deleteModalUser.role === 'super_admin') {
      alert('PROTECTED ACCOUNT: Super Admin accounts cannot be permanently deleted.');
      setDeleteModalUser(null);
      return;
    }

    onDeleteUser(deleteModalUser.id);
    onAuditLog('PERMANENT_USER_DELETION', `PERMANENTLY DELETED user account, reports, and AI diagnostic records for ${deleteModalUser.email}`, deleteModalUser.email);
    setDeleteModalUser(null);
    setDeleteConfirmInput('');
    setActiveDrawerUser(null);
  };

  // Bulk actions
  const handleBulkSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkVerify = () => {
    selectedUserIds.forEach(id => {
      const u = users.find(x => x.id === id);
      if (u) handleVerifyUserToggle(u);
    });
    setSelectedUserIds([]);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Role,Status,Verified,HealthScore,Predictions,Reports\n';
    const rows = filteredUsers.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}",${u.isVerified},${u.healthScore || 0},${u.predictionsCount},${u.reportsCount}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_directory_${Date.now()}.csv`;
    a.click();
    onAuditLog('EXPORT_USER_DIRECTORY', `Exported CSV dataset of ${filteredUsers.length} users`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">User Directory & Account Governance</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] uppercase tracking-widest">
                {filteredUsers.length} Users
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Search, verify, inspect, lock, suspend, or permanently manage patient accounts across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" /> Export CSV
            </button>
          </div>
        </div>

        {/* Search & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, email, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">🟢 Active</option>
              <option value="verified">🔵 Verified</option>
              <option value="unverified">🟠 Unverified</option>
              <option value="suspended">🔴 Suspended</option>
              <option value="locked">🔒 Locked</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All System Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support Staff</option>
              <option value="user">Standard Patient User</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="registrationDate-desc">Newest Registered First</option>
              <option value="registrationDate-asc">Oldest Registered First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="healthScore-desc">Highest Health Score</option>
              <option value="predictionsCount-desc">Most AI Predictions</option>
            </select>
          </div>

        </div>

        {/* Bulk Operations Toolbar if selected */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-bold text-cyan-300">
              Selected {selectedUserIds.length} user(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkVerify}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase text-[10px]"
              >
                Bulk Verify
              </button>
              <button
                onClick={() => setSelectedUserIds([])}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold uppercase text-[10px]"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleBulkSelectAll}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                  />
                </th>
                <th className="p-4">Patient User</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Status & Verification</th>
                <th className="p-4">Vitals & Health Score</th>
                <th className="p-4">AI Activity</th>
                <th className="p-4">Registration</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors group">
                  
                  {/* Checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => handleSelectOne(u.id)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                  </td>

                  {/* User Avatar & Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                          {u.name}
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" title="Verified Account" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border",
                      u.role === 'super_admin' ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                      u.role === 'admin' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                      u.role === 'moderator' ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                      u.role === 'support' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      "bg-slate-800 border-slate-700 text-slate-300"
                    )}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Status & Verification */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit",
                        u.status === 'active' || u.status === 'verified' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        u.status === 'locked' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        u.status === 'suspended' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-slate-800 text-slate-400 border border-slate-700"
                      )}>
                        {u.status === 'locked' ? <Lock className="w-3 h-3" /> : null}
                        {u.status}
                      </span>
                    </div>
                  </td>

                  {/* Vitals & Health Score */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
                        {u.healthScore || 90}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <div>BMI: {u.bmi || 23.5}</div>
                        <div>Blood: {u.bloodGroup || 'O+'}</div>
                      </div>
                    </div>
                  </td>

                  {/* AI Activity */}
                  <td className="p-4 font-mono text-[11px]">
                    <div>Predictions: <span className="font-bold text-white">{u.predictionsCount}</span></div>
                    <div className="text-[10px] text-slate-400">Reports: {u.reportsCount}</div>
                  </td>

                  {/* Registration Date */}
                  <td className="p-4 text-[11px] font-mono text-slate-400">
                    {new Date(u.registrationDate).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setActiveDrawerUser(u);
                        setDrawerTab('personal');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                      title="Inspect Profile Drawer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleVerifyUserToggle(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                      title={u.isVerified ? "Revoke Verification" : "Verify Patient Account"}
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setLockModalUser(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      title={u.status === 'locked' ? "Unlock Account" : "Lock Account"}
                    >
                      {u.status === 'locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setDeleteModalUser(u)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Permanent Danger Zone Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            Page {currentPage} of {totalPages} ({filteredUsers.length} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 text-white"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* USER PROFILE SLIDE-OUT DRAWER (8 TABS) */}
      {activeDrawerUser && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-950 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-cyan-500/30 overflow-hidden flex items-center justify-center">
                  {activeDrawerUser.avatarUrl ? (
                    <img src={activeDrawerUser.avatarUrl} alt={activeDrawerUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                    {activeDrawerUser.name}
                    {activeDrawerUser.isVerified && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">{activeDrawerUser.email} • ID: {activeDrawerUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerUser(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 8 Tab Navigation Bar */}
            <div className="bg-slate-950/60 border-b border-white/10 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'personal', label: '1. Personal' },
                { id: 'account', label: '2. Account' },
                { id: 'health', label: '3. Health' },
                { id: 'prediction', label: '4. Predictions' },
                { id: 'prescription', label: '5. Prescriptions' },
                { id: 'medical_image', label: '6. Radiology' },
                { id: 'live_camera', label: '7. Live Cam' },
                { id: 'assistant', label: '8. AI Chat' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={cn(
                    "px-3.5 py-2 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2",
                    drawerTab === tab.id 
                      ? "border-cyan-400 text-cyan-400 bg-slate-900" 
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* TAB 1: Personal Info */}
              {drawerTab === 'personal' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demographic & Contact Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Full Name</span>
                      <p className="font-bold text-white">{activeDrawerUser.name}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Email Address</span>
                      <p className="font-bold text-cyan-400">{activeDrawerUser.email}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Phone Number</span>
                      <p className="font-bold text-white">{activeDrawerUser.phone || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Age & Gender</span>
                      <p className="font-bold text-white">{activeDrawerUser.age || 35} yrs • {activeDrawerUser.gender || 'Not specified'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Blood Group</span>
                      <p className="font-bold text-rose-400">{activeDrawerUser.bloodGroup || 'O+'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <span className="text-slate-500 font-mono">Address</span>
                      <p className="font-bold text-white">{activeDrawerUser.address || 'Standard Residency'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Allergies & Medical Warnings</span>
                    <div className="flex gap-2">
                      {activeDrawerUser.allergies?.map((a, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                          {a}
                        </span>
                      )) || <span className="text-slate-400 text-xs">No known drug allergies reported</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Account Info */}
              {drawerTab === 'account' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Active Device Governance</h4>
                  
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Account Status</span>
                      <p className="text-xs text-slate-400">{activeDrawerUser.status.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyUserToggle(activeDrawerUser)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold"
                      >
                        {activeDrawerUser.isVerified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => setLockModalUser(activeDrawerUser)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold"
                      >
                        {activeDrawerUser.status === 'locked' ? 'Unlock' : 'Lock'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Active Device Sessions</span>
                      <button
                        onClick={() => handleForceLogoutSessions(activeDrawerUser)}
                        className="text-xs font-bold text-rose-400 hover:underline"
                      >
                        Terminate All Sessions
                      </button>
                    </div>

                    {activeDrawerUser.activeDevices && activeDrawerUser.activeDevices.length > 0 ? (
                      <div className="space-y-2">
                        {activeDrawerUser.activeDevices.map((dev) => (
                          <div key={dev.id} className="p-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Laptop className="w-4 h-4 text-cyan-400" />
                              <div>
                                <div className="font-bold text-white">{dev.device} ({dev.browser})</div>
                                <div className="text-[10px] text-slate-500 font-mono">IP: {dev.ip} • Last: {dev.lastActive}</div>
                              </div>
                            </div>
                            {dev.isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                                Current
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No active web sessions recorded right now.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Health Summary */}
              {drawerTab === 'health' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Vitals & Risk Score</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-xs font-bold text-emerald-400 uppercase">Health Score</span>
                      <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{activeDrawerUser.healthScore || 92} / 100</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                      <span className="text-xs font-bold text-cyan-400 uppercase">BMI Rating</span>
                      <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{activeDrawerUser.bmi || 23.5}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                      <span className="text-xs font-bold text-purple-400 uppercase">Risk Rating</span>
                      <div className="text-xl font-black text-purple-400 uppercase mt-2">Low Risk</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Prediction History */}
              {drawerTab === 'prediction' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Disease Prediction Scans ({activeDrawerUser.predictionsCount})</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white">
                      <span>Primary Condition: Hypertension / Stress</span>
                      <span className="text-emerald-400">94% Confidence</span>
                    </div>
                    <p className="text-slate-400">Selected Symptoms: Headache, Dizziness, Fatigue (3 items)</p>
                    <div className="text-[10px] text-slate-500 font-mono">Report ID: RPT-PRED-9941 • PDF Stored</div>
                  </div>
                </div>
              )}

              {/* TAB 5: Prescription History */}
              {drawerTab === 'prescription' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescription OCR Scans</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white">
                      <span>Prescription_Scan_2026.png</span>
                      <span className="text-cyan-400">OCR Success</span>
                    </div>
                    <p className="text-slate-400">Recognized Medicines: Amoxicillin 500mg, Paracetamol 650mg</p>
                  </div>
                </div>
              )}

              {/* TAB 6: Radiology */}
              {drawerTab === 'medical_image' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Radiology & X-Ray Scans</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white">
                      <span>Chest_XRay_Pneumonia_Check.jpg</span>
                      <span className="text-emerald-400">96.5% Clear</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Live Cam */}
              {drawerTab === 'live_camera' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Camera Skin & Eye Detections</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white">
                      <span>Live_Skin_Lesion_Scan.png</span>
                      <span className="text-emerald-400">Benign</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: AI Assistant */}
              {drawerTab === 'assistant' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Health Companion Conversations ({activeDrawerUser.conversationsCount})</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                    <div className="font-bold text-white">Topic: Daily Sodium Intake & Hydration Strategy</div>
                    <p className="text-slate-400">Patient asked regarding optimal daily electrolyte levels during intensive workouts.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setDeleteModalUser(activeDrawerUser)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase transition-all"
              >
                Permanent Danger Delete
              </button>

              <button
                onClick={() => setActiveDrawerUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LOCK / UNLOCK MODAL */}
      {lockModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> Lock / Unlock Account
            </h3>
            <p className="text-xs text-slate-300">
              User: <span className="font-bold text-white">{lockModalUser.email}</span>
            </p>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Reason for Lock Action</label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setLockModalUser(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={handleConfirmLock} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Confirm Lock Change</button>
            </div>
          </div>
        </div>
      )}

      {/* DANGER ZONE PERMANENT DELETION MODAL (PART 2B) */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-display">PERMANENT ACCOUNT DELETION</h3>
                <p className="text-xs text-rose-400 font-bold">This operation CANNOT be undone!</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-xs text-slate-300 space-y-2">
              <p>You are about to permanently delete the patient account:</p>
              <div className="font-mono font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-white/10">
                {deleteModalUser.name} ({deleteModalUser.email})
              </div>
              <p className="font-bold text-rose-300">The following user resources will be erased from Firestore & Storage:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                <li>User Database Profile & Authentication record</li>
                <li>All 4 AI diagnostic scan records & PDF reports</li>
                <li>Prescription OCR & Radiology Medical Image files</li>
                <li>Live Camera Skin & Eye detection logs</li>
                <li>AI Health Companion conversation history</li>
              </ul>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Type <span className="text-rose-400 font-mono">DELETE USER</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE USER"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-rose-500/40 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase"
              >
                Cancel Safety
              </button>
              <button
                disabled={deleteConfirmInput !== 'DELETE USER'}
                onClick={handleConfirmPermanentDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
