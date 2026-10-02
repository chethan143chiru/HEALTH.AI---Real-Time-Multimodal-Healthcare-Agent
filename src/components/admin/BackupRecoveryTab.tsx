import React, { useState } from 'react';
import { 
  Database, Download, RefreshCw, HardDrive, ShieldCheck, 
  CheckCircle2, AlertTriangle, FileText, Lock, Plus, ArrowUpRight 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MOCK_BACKUPS } from '@/src/data/mockAdminData';
import { SystemBackupRecord } from '@/src/types/admin';

interface BackupRecoveryTabProps {
  onAuditLog: (action: string, details: string) => void;
}

export default function BackupRecoveryTab({ onAuditLog }: BackupRecoveryTabProps) {
  const [backups, setBackups] = useState<SystemBackupRecord[]>(MOCK_BACKUPS);
  const [restoreModalBackup, setRestoreModalBackup] = useState<SystemBackupRecord | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleCreateBackup = (type: 'full' | 'database' | 'reports') => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newBkp: SystemBackupRecord = {
        id: `bkp-${Date.now()}`,
        backupName: `${type.toUpperCase()}_BACKUP_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}`,
        createdAt: new Date().toISOString(),
        createdBy: 'Dr. Sarah Connor (Super Admin)',
        sizeMb: type === 'full' ? 425.8 : type === 'database' ? 89.2 : 336.0,
        type: type,
        status: 'completed'
      };
      setBackups(prev => [newBkp, ...prev]);
      setIsBackingUp(false);
      onAuditLog('CREATE_SYSTEM_BACKUP', `Generated ${type.toUpperCase()} backup snapshot (${newBkp.sizeMb} MB)`);
      alert(`System backup (${type.toUpperCase()}) created successfully!`);
    }, 1200);
  };

  const handleConfirmRestore = () => {
    if (!restoreModalBackup) return;
    onAuditLog('RESTORE_SYSTEM_BACKUP', `Restored system state from backup snapshot: ${restoreModalBackup.backupName}`);
    alert(`System state restored successfully from snapshot: ${restoreModalBackup.backupName}`);
    setRestoreModalBackup(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">System Backup & Emergency Recovery Center</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
              Disaster Recovery Ready
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Generate full snapshots of Firestore patient records, medical PDF reports, OCR cache, and system configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isBackingUp}
            onClick={() => handleCreateBackup('full')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isBackingUp ? 'Generating Snapshot...' : 'Create Full Snapshot'}
          </button>
        </div>
      </div>

      {/* QUICK SNAPSHOT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Full System Snapshot</span>
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">Includes Firestore database, PDF reports repository, and RBAC configs.</p>
          <button
            onClick={() => handleCreateBackup('full')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
          >
            Run Full Backup
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Database Only Backup</span>
            <HardDrive className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400">Export user profiles, diagnostic predictions, and audit log tables.</p>
          <button
            onClick={() => handleCreateBackup('database')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
          >
            Run Database Backup
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">PDF Reports Repository</span>
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">Backup all generated medical PDF diagnostic documents.</p>
          <button
            onClick={() => handleCreateBackup('reports')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
          >
            Backup PDF Reports
          </button>
        </div>
      </div>

      {/* BACKUP HISTORY TABLE */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> System Backup Log History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Backup Snapshot Name</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Size (MB)</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {backups.map((bkp) => (
                <tr key={bkp.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white">{bkp.backupName}</td>
                  <td className="p-4 text-slate-400">{new Date(bkp.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-slate-300">{bkp.createdBy}</td>
                  <td className="p-4 text-cyan-400 font-bold">{bkp.sizeMb} MB</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] uppercase font-bold">
                      {bkp.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold">
                      {bkp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setRestoreModalBackup(bkp)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs font-sans uppercase"
                    >
                      Restore State
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {restoreModalBackup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Confirm System Restore
            </h3>
            <p className="text-xs text-slate-300">
              You are about to restore the system state to snapshot <span className="font-mono font-bold text-white">{restoreModalBackup.backupName}</span> generated on {new Date(restoreModalBackup.createdAt).toLocaleDateString()}.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setRestoreModalBackup(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={handleConfirmRestore} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Execute Restore</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
