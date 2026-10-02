import React from 'react';
import { 
  Activity, HeartPulse, Scale, Ruler, User, Calendar, FileText, AlertCircle, TrendingUp, Edit3 
} from 'lucide-react';
import { UserHealthMetrics } from '@/src/types/health';
import { cn } from '@/src/lib/utils';

interface HealthOverviewPanelProps {
  user: any;
  healthMetrics: UserHealthMetrics;
  healthScore: number;
  totalPredictionsCount: number;
  latestPredictionName?: string;
  onEditMetrics: () => void;
}

export default function HealthOverviewPanel({
  user,
  healthMetrics,
  healthScore,
  totalPredictionsCount,
  latestPredictionName = 'No recent scan',
  onEditMetrics
}: HealthOverviewPanelProps) {

  const getScoreRating = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 75) return { label: 'Good', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' };
    if (score >= 60) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (score >= 40) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  };

  const rating = getScoreRating(healthScore);
  const strokeDashoffset = 283 - (283 * healthScore) / 100;

  return (
    <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight font-display">Intelligent Health Overview</h2>
            <p className="text-slate-400 text-xs">Real-time biometrics, AI health score & vital signs</p>
          </div>
        </div>

        <button
          onClick={onEditMetrics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Vitals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Circular Health Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-3xl border border-white/5 text-center relative">
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-emerald-400 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-display leading-none">{healthScore}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>

          <div className={cn("px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-2", rating.bg, rating.border, rating.color)}>
            {rating.label} Health Condition
          </div>
          <p className="text-slate-400 text-[11px] max-w-xs">
            Calculated dynamically from symptoms, BMI ({healthMetrics.bmi}), blood pressure and historical reports.
          </p>
        </div>

        {/* Right Biometric Grid Cards */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          {/* BMI Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">BMI Index</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-display">{healthMetrics.bmi}</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">{healthMetrics.bmiCategory}</div>
          </div>

          {/* Weight Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Weight</span>
              <Scale className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-white font-display">{healthMetrics.weightKg} <span className="text-xs text-slate-400 font-bold">kg</span></div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1">Height: {healthMetrics.heightCm} cm</div>
          </div>

          {/* Blood Pressure Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blood Pressure</span>
              <HeartPulse className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-white font-display">
              {healthMetrics.bloodPressureSystolic}/{healthMetrics.bloodPressureDiastolic} <span className="text-xs text-slate-400 font-bold">mmHg</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-400 mt-1">Normal Range</div>
          </div>

          {/* Blood Sugar Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blood Sugar</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-display">
              {healthMetrics.bloodSugarMgDl} <span className="text-xs text-slate-400 font-bold">mg/dL</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1">Fasting Level</div>
          </div>

          {/* Total Predictions Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Scans</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-display">{totalPredictionsCount}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1">AI Reports Generated</div>
          </div>

          {/* Latest Prediction Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Latest Scan</span>
              <AlertCircle className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xs font-black text-white font-display truncate" title={latestPredictionName}>
              {latestPredictionName}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1">Diagnostic Result</div>
          </div>

        </div>

      </div>
    </div>
  );
}
