import React from 'react';
import { 
  Activity, CheckCircle2, Clock, AlertTriangle, Wifi, WifiOff, RefreshCw, Sparkles, BrainCircuit, Headphones
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AgentStatusProps {
  status: string;
  message?: string;
  isFallback?: boolean;
}

export default function AgentStatus({ status, message, isFallback }: AgentStatusProps) {
  const getStatusConfig = () => {
    switch (status.toUpperCase()) {
      case 'CONNECTED':
      case 'LISTENING':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          ping: true,
          icon: Headphones,
          label: status.toUpperCase() === 'LISTENING' ? 'Listening...' : 'Agent Live & Ready'
        };
      case 'UNDERSTANDING':
      case 'SELECTING TOOL':
      case 'PROCESSING':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400',
          ping: true,
          icon: BrainCircuit,
          label: status.toUpperCase()
        };
      case 'RESPONDING':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          dot: 'bg-indigo-400',
          ping: true,
          icon: Sparkles,
          label: 'Responding...'
        };
      case 'CONNECTING':
      case 'RECONNECTING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          ping: true,
          icon: RefreshCw,
          label: status.toUpperCase()
        };
      case 'ERROR':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          ping: false,
          icon: AlertTriangle,
          label: 'Session Alert'
        };
      case 'DISCONNECTED':
      default:
        return {
          bg: 'bg-slate-800/80 border-white/10 text-slate-400',
          dot: 'bg-slate-500',
          ping: false,
          icon: WifiOff,
          label: 'Offline'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold", config.bg)}>
          <span className="relative flex h-2 w-2">
            {config.ping && (
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.dot)}></span>
            )}
            <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dot)}></span>
          </span>
          <Icon className={cn("w-3.5 h-3.5", config.ping && "animate-spin-slow")} />
          <span className="tracking-wide">{config.label}</span>
        </div>

        {message && (
          <span className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
            {message}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span className="hidden sm:inline">Engine:</span>
        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 font-bold">
          {isFallback ? 'gemini-3.8-flash + Local ML' : 'gemini-3.8-live'}
        </span>
      </div>
    </div>
  );
}
