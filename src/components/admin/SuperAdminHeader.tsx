import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Bell, Search, Clock, Calendar, 
  User, ChevronDown, X, LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AuditLogEntry } from '@/src/types/admin';

interface SuperAdminHeaderProps {
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AuditLogEntry[];
  onOpenGlobalSearch: () => void;
}

export default function SuperAdminHeader({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  notifications,
  onOpenGlobalSearch
}: SuperAdminHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand & Title */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <h1 className="text-xl font-black text-white tracking-tight font-display">SUPER ADMIN CONTROL CENTER</h1>
            </div>
          </div>

          {/* Center: Live Date & Clock */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-2 rounded-2xl bg-slate-950/60 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{currentDate}</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{currentTime || '00:00:00'}</span>
            </div>
          </div>

          {/* Right: Search, Notifications & Admin Profile */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Button Trigger */}
            <button
              onClick={onOpenGlobalSearch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all group"
            >
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Search System...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400">Ctrl K</kbd>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Audit & Security Alerts</h4>
                    </div>
                    <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase",
                            n.result === 'success' ? "bg-emerald-500/10 text-emerald-400" :
                            n.result === 'warning' ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {n.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{n.details}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Admin: {n.adminEmail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('audit');
                        setShowNotifMenu(false);
                      }}
                      className="text-xs font-bold text-cyan-400 hover:underline"
                    >
                      View Full Audit Log Center →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-rose-500/40 bg-rose-500/20 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors leading-tight">
                    {user?.name || 'Super Admin'}
                  </div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    SUPER ADMIN
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white">{user?.name || 'Super Administrator'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@health.ai'}</p>
                    <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold uppercase">
                      Super Admin Role
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('roles');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Role & Access Control
                  </button>

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
