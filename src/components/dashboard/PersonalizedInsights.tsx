import React from 'react';
import { Sparkles, Lightbulb, ShieldAlert, Heart, ArrowRight } from 'lucide-react';

interface PersonalizedInsightsProps {
  healthMetrics: any;
  latestPrediction?: any;
  onOpenModule: (mod: string) => void;
}

export default function PersonalizedInsights({ healthMetrics, latestPrediction, onOpenModule }: PersonalizedInsightsProps) {
  return (
    <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight font-display">Personalized Health Insights</h2>
            <p className="text-slate-400 text-xs">AI-driven recommendations based on your recent vitals & scans</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          DAILY AI SUMMARY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Insight 1: Hydration & Vitals */}
        <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Heart className="w-4 h-4 text-emerald-400" /> Cardiovascular & Hydration
            </div>
            <h3 className="text-sm font-bold text-white">Maintain Optimal Fluid Balance</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">
              Based on your BMI ({healthMetrics.bmi}), aim for at least 2.7 Liters of water daily to maintain kidney clearance and stable blood pressure.
            </p>
          </div>
          <button 
            onClick={() => onOpenModule('vitals')}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 self-start mt-2"
          >
            Update Vitals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Insight 2: Prescription / Medicine reminder */}
        <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" /> OCR Prescription Verification
            </div>
            <h3 className="text-sm font-bold text-white">Prescription OCR Scan Ready</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">
              Have a handwritten paper prescription? Upload a photo to extract dosage schedules and food timing instructions automatically.
            </p>
          </div>
          <button 
            onClick={() => onOpenModule('prescription')}
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 self-start mt-2"
          >
            Scan Prescription <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Insight 3: Disease Screening */}
        <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Proactive Symptom Analysis
            </div>
            <h3 className="text-sm font-bold text-white">500+ Symptom Database</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">
              Feeling unwell or experiencing fatigue? Run an Explainable AI differential diagnosis across 15 clinical organ categories.
            </p>
          </div>
          <button 
            onClick={() => onOpenModule('predict')}
            className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 self-start mt-2"
          >
            Start Diagnosis <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
