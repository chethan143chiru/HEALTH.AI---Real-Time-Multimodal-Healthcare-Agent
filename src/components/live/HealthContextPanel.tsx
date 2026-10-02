import React from 'react';
import { UserCheck, Heart, Shield, Activity, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface HealthContextPanelProps {
  user: any;
  healthContext: any;
}

const NOT_RECORDED = 'Not recorded';

export default function HealthContextPanel({ user, healthContext }: HealthContextPanelProps) {
  // Only real, authorized data is shown. Missing values are labelled honestly
  // as "Not recorded" rather than displaying invented vitals.
  const metrics = healthContext?.metrics || {};
  const bp =
    metrics.bloodPressure ||
    (metrics.bloodPressureSystolic && metrics.bloodPressureDiastolic
      ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic} mmHg`
      : null);
  const healthScore = typeof healthContext?.healthScore === 'number' ? healthContext.healthScore : null;

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Patient Health Context</h4>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Authorized Patient Data
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {user?.name?.[0] || 'P'}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Verified Patient'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'patient@health.ai'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Health Score</span>
            <p className="text-sm font-black text-emerald-400">
              {healthScore !== null ? `${healthScore}/100` : NOT_RECORDED}
            </p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Blood Pressure</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">{bp || NOT_RECORDED}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Heart Rate</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">{metrics.heartRate || NOT_RECORDED}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Blood Oxygen</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">{metrics.oxygenSaturation || NOT_RECORDED}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Temperature</span>
            </div>
            <p className="text-xs font-bold text-white font-mono">{metrics.temperature || NOT_RECORDED}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
