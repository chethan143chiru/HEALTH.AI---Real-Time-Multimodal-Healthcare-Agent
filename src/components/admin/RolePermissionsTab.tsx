import React, { useState } from 'react';
import { 
  ShieldAlert, Shield, CheckCircle2, XCircle, Plus, Edit3, Trash2, 
  Users, Lock, Key, Check, Info, AlertTriangle, Sparkles 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { DEFAULT_ROLE_PERMISSIONS } from '@/src/data/mockAdminData';
import { AdminRole, RolePermissionMatrix } from '@/src/types/admin';

interface RolePermissionsTabProps {
  onAuditLog: (action: string, details: string) => void;
}

export default function RolePermissionsTab({ onAuditLog }: RolePermissionsTabProps) {
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionMatrix[]>(DEFAULT_ROLE_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');
  
  // Custom Role Modal
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const activeRoleConfig = roleMatrix.find(r => r.role === selectedRole) || roleMatrix[0];

  const handleTogglePermission = (permKey: string) => {
    if (activeRoleConfig.isProtected && selectedRole === 'super_admin') {
      alert('PROTECTED ROLE: Super Admin permissions cannot be restricted.');
      return;
    }

    setRoleMatrix(prev => prev.map(r => {
      if (r.role === selectedRole) {
        const currentVal = !!r.permissions[permKey];
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !currentVal
          }
        };
      }
      return r;
    }));

    onAuditLog('UPDATE_ROLE_PERMISSIONS', `Updated permission "${permKey}" for role ${selectedRole}`);
  };

  const handleCreateCustomRole = () => {
    if (!newRoleName.trim()) return;
    const newRoleKey = `custom_${Date.now()}` as any;
    const newRoleObj: RolePermissionMatrix = {
      role: newRoleKey,
      roleName: newRoleName,
      description: newRoleDesc || 'Custom administrative role',
      color: '#06b6d4',
      isProtected: false,
      permissions: {
        'view_users': true,
        'view_reports': true
      }
    };
    setRoleMatrix(prev => [...prev, newRoleObj]);
    setSelectedRole(newRoleKey);
    setIsAddRoleOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    onAuditLog('CREATE_CUSTOM_ROLE', `Created new role "${newRoleName}"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">Enterprise Role-Based Access Control (RBAC)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase tracking-widest">
              Security Matrix
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Configure granular administrative capabilities across Super Admin, Admin, Moderator, Support Staff, and User accounts.
          </p>
        </div>

        <button
          onClick={() => setIsAddRoleOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" /> Add Custom Role
        </button>
      </div>

      {/* Role Selector Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {roleMatrix.map((r) => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all space-y-1.5",
              selectedRole === r.role 
                ? "bg-slate-900 border-rose-500 shadow-xl shadow-rose-500/10" 
                : "bg-slate-950 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: r.color }}>
                {r.roleName}
              </span>
              {r.isProtected && <Lock className="w-3.5 h-3.5 text-slate-500" title="Protected System Role" />}
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">{r.description}</p>
          </button>
        ))}
      </div>

      {/* PERMISSIONS MATRIX GRID */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Permission Matrix: {activeRoleConfig.roleName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeRoleConfig.description}</p>
          </div>
          {activeRoleConfig.isProtected && (
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
              Protected System Role
            </span>
          )}
        </div>

        {/* Matrix Categories */}
        {[
          {
            category: 'User Management',
            perms: [
              { key: 'view_users', label: 'View Patient User Directory' },
              { key: 'edit_users', label: 'Edit User Profiles' },
              { key: 'verify_users', label: 'Verify User Accounts' },
              { key: 'suspend_users', label: 'Suspend / Reactivate Accounts' },
              { key: 'lock_users', label: 'Lock / Unlock Accounts' },
              { key: 'delete_users', label: 'Permanently Delete User Accounts' }
            ]
          },
          {
            category: 'Reports & Diagnostic History',
            perms: [
              { key: 'view_reports', label: 'View All Patient Reports' },
              { key: 'download_reports', label: 'Download PDF Reports' },
              { key: 'export_reports', label: 'Export Data Repositories' },
              { key: 'delete_reports', label: 'Delete Diagnostic Reports' }
            ]
          },
          {
            category: 'AI Engines & System Config',
            perms: [
              { key: 'view_ai', label: 'View AI Performance Metrics' },
              { key: 'configure_ai', label: 'Configure AI Models & Parameters' },
              { key: 'restart_ai', label: 'Reload / Restart AI Services' },
              { key: 'manage_settings', label: 'Manage Platform Settings' },
              { key: 'manage_backups', label: 'Generate & Restore System Backups' }
            ]
          },
          {
            category: 'Security & Governance',
            perms: [
              { key: 'view_audit', label: 'Access Audit Log Center' },
              { key: 'view_security', label: 'View Security Alerts' },
              { key: 'force_logout', label: 'Force Session Termination' },
              { key: 'create_admin', label: 'Create New Admin Accounts' },
              { key: 'assign_roles', label: 'Modify Role Permissions' }
            ]
          }
        ].map((cat, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> {cat.category}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.perms.map((p) => {
                const isEnabled = !!activeRoleConfig.permissions[p.key];
                return (
                  <div
                    key={p.key}
                    onClick={() => handleTogglePermission(p.key)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      isEnabled 
                        ? "bg-emerald-950/30 border-emerald-500/30 text-white" 
                        : "bg-slate-950/60 border-white/5 text-slate-500 hover:border-white/10"
                    )}
                  >
                    <span className="text-xs font-semibold">{p.label}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold",
                      isEnabled ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-600"
                    )}>
                      {isEnabled ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>

      {/* ADD CUSTOM ROLE MODAL */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-400" /> Create Custom Admin Role
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Medical Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  placeholder="Describe responsibilities..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsAddRoleOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={handleCreateCustomRole} className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs">Create Role</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
