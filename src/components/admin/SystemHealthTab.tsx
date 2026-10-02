import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, RefreshCw, 
  Database, Server, Globe, ShieldCheck, Wrench
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MOCK_SYSTEM_HEALTH } from '@/src/data/mockAdminData';

interface SystemHealthTabProps {
  onAuditLog: (action: string, details: string) => void;
}

export default function SystemHealthTab({ onAuditLog }: SystemHealthTabProps) {
  const [loading, setLoading] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<{
    status: string;
    timestamp: string;
    platform: string;
    checks: Record<string, { status: 'PASS' | 'FAIL' | 'WARN'; reason: string; fix: string }>;
  } | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnosticsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch diagnostics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">Cross-Platform Diagnostics & Infrastructure</h2>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-widest border",
              diagnosticsData?.status === 'FAIL' 
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : diagnosticsData?.status === 'WARN'
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            )}>
              {diagnosticsData ? diagnosticsData.status : 'Operational'}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real-time automated check for VS Code, Cursor, Anti-Gravity, Docker, Render, and Cloud environment compatibility.
          </p>
        </div>

        <button
          onClick={() => {
            fetchDiagnostics();
            onAuditLog('PROBE_INFRASTRUCTURE_HEALTH', 'Executed manual cross-platform system diagnostics test');
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> {loading ? "Running Audit..." : "Run Platform Audit"}
        </button>
      </div>

      {/* REAL PLATFORM DIAGNOSTICS AUDIT LIST */}
      {diagnosticsData && diagnosticsData.checks && (
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> System Compatibility & Environment Diagnostics
            </h3>
            <span className="text-xs font-mono text-slate-400">Audited at {new Date(diagnosticsData.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(diagnosticsData.checks).map(([serviceName, checkObj]) => {
              const check = checkObj as { status: 'PASS' | 'FAIL' | 'WARN'; reason: string; fix: string };
              return (
                <div 
                  key={serviceName} 
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all",
                    check.status === 'PASS' ? "bg-slate-950/80 border-emerald-500/20" :
                    check.status === 'WARN' ? "bg-amber-950/20 border-amber-500/30" :
                    "bg-red-950/20 border-red-500/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl border mt-0.5",
                      check.status === 'PASS' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      check.status === 'WARN' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {check.status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> :
                       check.status === 'WARN' ? <AlertTriangle className="w-5 h-5" /> :
                       <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        {serviceName}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{check.reason}</p>
                      {check.status !== 'PASS' && (
                        <div className="mt-2 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-white/10 text-slate-300 flex items-start gap-2">
                          <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-400">Suggested Action: </strong>
                            {check.fix}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
                      check.status === 'PASS' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      check.status === 'WARN' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                      "bg-red-500/10 border-red-500/30 text-red-400"
                    )}>
                      {check.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SERVER RESOURCE GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud CPU Load</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">18.4%</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '18.4%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Container Node Runtime</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RAM Memory</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">3.2 / 16 GB</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '20%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">20% RAM Allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">24.2 / 500 GB</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '4.8%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Medical reports & DICOM images</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Port</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">Port 3000</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Node / Express HTTP Server</span>
        </div>

      </div>

      {/* 10 SERVICES TELEMETRY LIST */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Detailed Microservices Status Table (10 Services)
        </h3>

        <div className="space-y-3">
          {MOCK_SYSTEM_HEALTH.map((srv) => (
            <div key={srv.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    {srv.name}
                    <span className="text-[10px] font-mono text-slate-500 uppercase">({srv.category})</span>
                  </h4>
                  <p className="text-xs text-slate-400">{srv.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-emerald-400">{srv.responseTimeMs} ms</span>
                  <div className="text-[10px] text-slate-500 font-mono">Response Time</div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-white">{srv.healthPercent}%</span>
                  <div className="text-[10px] text-slate-500 font-mono">Uptime Rating</div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
                  {srv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
