import React from 'react';
import { 
  Cpu, CheckCircle2, Loader2, Stethoscope, FileText, Image as ImageIcon, 
  Activity, ShieldAlert, Sparkles 
} from 'lucide-react';
import { LiveToolActivityItem } from '@/src/services/liveSessionService';
import { cn } from '@/src/lib/utils';

interface ToolActivityPanelProps {
  activities: LiveToolActivityItem[];
}

export default function ToolActivityPanel({ activities }: ToolActivityPanelProps) {
  const getToolIcon = (name: string) => {
    switch (name) {
      case 'predictDisease':
        return Stethoscope;
      case 'analyzePrescription':
        return FileText;
      case 'analyzeMedicalImage':
      case 'analyzeLiveVisual':
        return ImageIcon;
      case 'getHealthMetrics':
      case 'getHealthHistory':
      case 'getHealthAnalytics':
        return Activity;
      case 'emergencySafetyCheck':
        return ShieldAlert;
      default:
        return Cpu;
    }
  };

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case 'predictDisease':
        return 'Clinical Disease Screening';
      case 'analyzePrescription':
        return 'Prescription Pharmacology OCR';
      case 'analyzeMedicalImage':
        return 'Radiology Scan Analysis';
      case 'analyzeLiveVisual':
        return 'Live Camera Dermatology Screen';
      case 'getHealthMetrics':
        return 'Verified Patient Vitals Access';
      case 'getHealthHistory':
        return 'Patient Diagnostic History';
      case 'getHealthAnalytics':
        return 'Wellness Stability Index';
      case 'generateHealthReport':
        return 'Clinical Summary Compilation';
      case 'emergencySafetyCheck':
        return 'Emergency Triage Evaluation';
      default:
        return name;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agent Tool Orchestration</h4>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          Live Router
        </span>
      </div>

      <div className="space-y-2.5">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-30 text-cyan-400" />
            <p>Healthcare tools will orchestrate automatically when triggered by your voice or camera.</p>
          </div>
        ) : (
          activities.map((act) => {
            const Icon = getToolIcon(act.toolName);
            const isCompleted = act.status === 'completed';

            return (
              <div
                key={act.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border text-xs transition-all",
                  isCompleted 
                    ? "bg-slate-950/80 border-emerald-500/20 text-slate-200" 
                    : "bg-cyan-500/5 border-cyan-500/30 text-cyan-300 animate-pulse"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center",
                      isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-[12px]">{getToolDisplayName(act.toolName)}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Started {act.startedAt}</p>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10">
                      <Loader2 className="w-3 h-3 animate-spin" /> Running
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
