import React, { useState } from 'react';
import { 
  ShieldAlert, Search, Download, Filter, Calendar, Clock, Laptop, 
  CheckCircle2, AlertTriangle, XCircle, FileText, ArrowUpDown 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AuditLogEntry } from '@/src/types/admin';

interface AuditCenterTabProps {
  logs: AuditLogEntry[];
  onAuditLog: (action: string, details: string) => void;
}

export default function AuditCenterTab({ logs, onAuditLog }: AuditCenterTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetUserEmail && log.targetUserEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesResult = resultFilter === 'all' || log.result === resultFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

    return matchesSearch && matchesResult && matchesModule;
  });

  const handleExportCSV = () => {
    const headers = 'Audit ID,Timestamp,Admin,Role,Action,Result,IP Address,Details\n';
    const rows = filteredLogs.map(l => `"${l.id}","${l.timestamp}","${l.adminEmail}","${l.adminRole}","${l.action}","${l.result}","${l.ipAddress || ''}","${l.details.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    onAuditLog('EXPORT_AUDIT_LOGS', `Exported CSV audit trail of ${filteredLogs.length} events`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">System Audit Log & Security Trail</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                Immutable Records
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Complete chronological audit history of administrative operations, security locks, user deletions, and backups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-950 border border-white/10 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase", viewMode === 'table' ? "bg-cyan-500 text-slate-950" : "text-slate-400")}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase", viewMode === 'timeline' ? "bg-cyan-500 text-slate-950" : "text-slate-400")}
              >
                Timeline View
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs uppercase flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" /> Export Audit CSV
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by admin, action, target email or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Outcome Results</option>
              <option value="success">🟢 Success</option>
              <option value="warning">🟡 Warning</option>
              <option value="failure">🔴 Failure</option>
            </select>
          </div>

          <div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Modules</option>
              <option value="Auth">Auth & Security</option>
              <option value="User Management">User Management</option>
              <option value="Broadcast Center">Broadcast Center</option>
              <option value="Backup & Recovery">Backup & Recovery</option>
              <option value="Security">Security Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp & ID</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">IP & Device</th>
                  <th className="p-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-[11px]">
                      <div className="font-bold text-white">{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{log.id}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-cyan-400">{log.adminName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.adminEmail}</div>
                    </td>

                    <td className="p-4 font-mono font-bold text-white">
                      {log.action}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                        {log.module}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                        log.result === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        log.result === 'warning' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      )}>
                        {log.result}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[10px] text-slate-400">
                      <div>{log.ipAddress || '192.168.1.1'}</div>
                      <div className="text-slate-500 truncate max-w-[120px]">{log.deviceInfo}</div>
                    </td>

                    <td className="p-4 text-slate-300 max-w-xs leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-500 group-hover:scale-125 transition-transform" />
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-400">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-white/5">
                    <span>Admin: {log.adminEmail} ({log.adminRole})</span>
                    <span>IP: {log.ipAddress || '192.168.1.1'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
