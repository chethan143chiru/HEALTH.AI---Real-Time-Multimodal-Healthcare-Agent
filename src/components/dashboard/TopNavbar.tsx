import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, Search, Bell, Bot, User, Settings, LogOut, ShieldCheck, ChevronDown, Check, Trash2, X, Sparkles, ShieldAlert, Radio
} from 'lucide-react';
import { HealthNotification } from '@/src/types/health';
import { cn } from '@/src/lib/utils';

interface TopNavbarProps {
  user: any;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenAssistant: () => void;
  onOpenProfile: () => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  notifications: HealthNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

export default function TopNavbar({
  user,
  onLogout,
  onOpenSearch,
  onOpenAssistant,
  onOpenProfile,
  activeModule,
  setActiveModule,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications
}: TopNavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveModule('overview')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-display">HEALTH.<span className="text-emerald-400">AI</span></span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">AI Health Prediction System</p>
          </div>
        </div>

        {/* Universal Search Bar Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full bg-slate-900/90 border border-white/10 rounded-2xl py-2.5 px-4 flex items-center justify-between text-slate-400 text-xs hover:border-emerald-500/40 hover:bg-slate-900 transition-all shadow-inner group"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span>Search symptoms, diseases, OCR medicines, reports...</span>
            </div>
            <kbd className="hidden lg:inline-block px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-mono text-slate-400 border border-white/5">Ctrl + K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <button 
            onClick={onOpenSearch}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Live Health Agent (PS05 Realtime Voice & Multimodal) */}
          <Link
            to="/live-agent"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs hover:border-cyan-400 hover:text-white transition-all shadow-lg shadow-cyan-500/10 group"
            title="Open Live Real-Time Multimodal Health Agent"
          >
            <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="hidden sm:inline">Live Health Agent</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">LIVE</span>
          </Link>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/10 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Notifications Trigger & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse border-2 border-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Health Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={onClearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        className={cn(
                          "p-3 rounded-2xl border text-xs transition-all flex items-start justify-between gap-3",
                          n.isRead ? "bg-white/[0.02] border-white/5 text-slate-400" : "bg-emerald-500/10 border-emerald-500/30 text-slate-200"
                        )}
                      >
                        <div>
                          <p className="font-bold text-white text-[13px]">{n.title}</p>
                          <p className="text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">{n.timestamp}</span>
                        </div>
                        {!n.isRead && (
                          <button 
                            onClick={() => onMarkNotificationRead(n.id)}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Mode Switcher Button for Admins */}
          {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'super_admin' || localStorage.getItem('health_ai_admin_auth') === 'true') && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all shadow-md group"
              title="Return to Super Admin Control Center"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Admin Panel</span>
            </a>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-all"
            >
              <img 
                src={user?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`} 
                alt="Avatar"
                className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-white/10"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-white leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-emerald-400 font-semibold capitalize flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 inline" /> {user?.role || 'Patient'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'patient@health.ai'}</p>
                </div>

                <button
                  onClick={() => { setShowUserDropdown(false); onOpenProfile(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-400" /> My Profile & Vitals
                </button>

                <button
                  onClick={() => { setShowUserDropdown(false); setActiveModule('analytics'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-cyan-400" /> Health Analytics
                </button>

                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={() => { setShowUserDropdown(false); onLogout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
