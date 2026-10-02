import React from 'react';
import { 
  Users, Activity, Brain, FileText, MessageSquare, ShieldCheck, 
  TrendingUp, Database, ShieldAlert, DollarSign, Cpu, ArrowUpRight, 
  Zap, AlertTriangle, CheckCircle2, RefreshCw, Radio, Sparkles, Send, HardDrive
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { 
  MOCK_CHART_USER_GROWTH, 
  MOCK_CHART_AI_MODULE_USAGE, 
  MOCK_CHART_DISEASE_DISTRIBUTION,
  MOCK_SYSTEM_HEALTH,
  MOCK_AUDIT_LOGS
} from '@/src/data/mockAdminData';

interface ExecutiveDashboardTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenGlobalSearch: () => void;
}

export default function ExecutiveDashboardTab({ onNavigateTab, onOpenGlobalSearch }: ExecutiveDashboardTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner & Platform Status Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Executive Command Center
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Welcome Back, Super Administrator
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Real-time platform monitoring for AI Disease Prediction, Prescription OCR, Radiology Imaging, Live Camera, and User Governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('users')}
              className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> User Directory
            </button>
            <button
              onClick={() => onNavigateTab('broadcast')}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyan-400" /> Publish Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* 10 EXECUTIVE KPI CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Executive Platform Performance Metrics (10 KPIs)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Live Auto-Sync: 1s</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* KPI 1 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">2</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> 1 Admin, 1 User
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">2 accounts configured</div>
          </div>

          {/* KPI 2 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">2</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> 100% <span className="text-slate-500 font-normal">active</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Both users verified & active</div>
          </div>

          {/* KPI 3 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Analyses</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">10,280</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-400 font-bold">
                <Zap className="w-3.5 h-3.5" /> 4 AI Engines <span className="text-slate-500 font-normal">active</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">480 scans in 24h</div>
          </div>

          {/* KPI 4 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PDF Reports</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">8,940</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Downloadable
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Saved in PDF repository</div>
          </div>

          {/* KPI 5 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Assistant</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">6,800</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-400 font-bold">
                <span>1.2s</span> <span className="text-slate-500 font-normal">avg response</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">97.4% satisfaction</div>
          </div>

          {/* KPI 6 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Health</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-display">99.8%</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-bold">
                <span>10/10 Services</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Latency &lt; 20ms</div>
          </div>

          {/* KPI 7 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Accuracy</span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">94.2%</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-400 font-bold">
                <span>Confidence score</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">500+ symptoms matrix</div>
          </div>

          {/* KPI 8 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Used</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">24.2 GB</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-400 font-bold">
                <span>4.8% of 500 GB</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Medical images & reports</div>
          </div>

          {/* KPI 9 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security</span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-display">0 Breaches</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-bold">
                <span>0 Security Lockouts</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">RBAC Security active</div>
          </div>

          {/* KPI 10 */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3 hover:border-rose-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SaaS MRR</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">$14,250</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> +18.5% <span className="text-slate-500 font-normal">MRR</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Enterprise healthcare tier</div>
          </div>

        </div>
      </div>

      {/* QUICK ACTION SHORTCUTS PANEL */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Super Admin Quick Action Center
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {[
            { label: 'Users', tab: 'users', color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400' },
            { label: 'Roles', tab: 'roles', color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400' },
            { label: 'AI Analytics', tab: 'ai_analytics', color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400' },
            { label: 'System Status', tab: 'system_health', color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400' },
            { label: 'Broadcasts', tab: 'broadcast', color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400' },
            { label: 'Backups', tab: 'backup', color: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400' },
            { label: 'Audit Logs', tab: 'audit', color: 'hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400' },
            { label: 'Settings', tab: 'settings', color: 'hover:border-slate-500/50 hover:bg-slate-500/10 text-slate-300' },
            { label: 'Search', action: onOpenGlobalSearch, color: 'hover:border-teal-500/50 hover:bg-teal-500/10 text-teal-400' },
            { label: 'Reports', tab: 'users', color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400' }
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => act.action ? act.action() : onNavigateTab(act.tab!)}
              className={cn(
                "p-3 rounded-2xl bg-slate-950 border border-white/10 text-center transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer",
                act.color
              )}
            >
              <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold truncate max-w-full">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User Growth Chart */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Platform User Growth & Active Engagement
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly trajectory of registered vs active patients</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] uppercase">
              RECHARTS V2.0
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_USER_GROWTH}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#userGrad)" name="Total Registered" />
                <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#activeGrad)" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Engine Distribution Bar Chart */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> AI Modules Usage
            </h3>
          </div>
          <p className="text-xs text-slate-400">Breakdown of requests per engine</p>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_AI_MODULE_USAGE} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis type="category" dataKey="module" stroke="#94a3b8" fontSize={9} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 8, 8, 0]} name="Analyses Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SYSTEM STATUS PANEL & RECENT AUDIT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* System Health Service Status Table */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Platform Services Health Status (10 Modules)
            </h3>
            <button
              onClick={() => onNavigateTab('system_health')}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              Full Diagnostics →
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {MOCK_SYSTEM_HEALTH.map((srv) => (
              <div key={srv.id} className="p-3 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                    <p className="text-[10px] text-slate-400">{srv.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{srv.responseTimeMs}ms</span>
                    <p className="text-[10px] text-slate-500">Latency</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase">
                    ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Audit Activity Feed */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Live Audit Activity Stream
            </h3>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-rose-400 hover:underline"
            >
              View All Logs →
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Admin: {log.adminEmail}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
