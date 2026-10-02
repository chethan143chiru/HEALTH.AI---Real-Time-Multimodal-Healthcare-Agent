import React, { useState } from 'react';
import { Search, X, Users, FileText, Brain, ShieldAlert, Radio, ArrowRight } from 'lucide-react';
import { AdminUserRecord, AuditLogEntry } from '@/src/types/admin';

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AdminUserRecord[];
  logs: AuditLogEntry[];
  onSelectUser: (user: AdminUserRecord) => void;
  onNavigateTab: (tab: string) => void;
}

export default function AdminGlobalSearchModal({
  isOpen,
  onClose,
  users,
  logs,
  onSelectUser,
  onNavigateTab
}: AdminGlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedUsers = query.trim() 
    ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()) || u.id.toLowerCase().includes(query.toLowerCase()))
    : [];

  const matchedLogs = query.trim()
    ? logs.filter(l => l.action.toLowerCase().includes(query.toLowerCase()) || l.details.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Bar */}
        <div className="p-4 bg-slate-950 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            placeholder="Global Super Admin Search (users, reports, audit logs, broadcasts)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Type anything to search across platform users, diagnosis records, audit logs, and broadcasts.</p>
            </div>
          ) : (
            <>
              {/* Users Results */}
              {matchedUsers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Matching Patient Users ({matchedUsers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email} • ID: {u.id}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs Results */}
              {matchedLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Matching Audit Logs ({matchedLogs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedLogs.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onNavigateTab('audit');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-mono font-bold text-rose-400">{l.action}</div>
                          <div className="text-[10px] text-slate-300">{l.details}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-rose-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedUsers.length === 0 && matchedLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No matching records found for "{query}".
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
