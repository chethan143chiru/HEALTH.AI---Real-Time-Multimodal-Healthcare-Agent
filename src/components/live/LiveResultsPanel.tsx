import React from 'react';
import { 
  Stethoscope, FileText, Image as ImageIcon, Activity, ShieldCheck, 
  Download, AlertTriangle, ArrowRight, CheckCircle2, Heart 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LiveResultsPanelProps {
  toolResults: {
    tool: string;
    result: any;
    timestamp: string;
  }[];
  onExportReport?: () => void;
}

export default function LiveResultsPanel({ toolResults, onExportReport }: LiveResultsPanelProps) {
  if (toolResults.length === 0) return null;

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Agent Clinical Findings</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {toolResults.length} Result{toolResults.length > 1 ? 's' : ''} Produced
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolResults.map((item, index) => {
          const { tool, result, timestamp } = item;
          const data = result?.data || {};

          if (tool === 'predictDisease') {
            return (
              <div 
                key={index} 
                className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Disease Screening Assessment</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{timestamp}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase",
                    data.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    data.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  )}>
                    {data.riskLevel || 'Moderate'} Risk
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Primary Screening Finding</span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{data.primaryCondition}</h3>
                </div>

                {data.differentialDiagnoses && data.differentialDiagnoses.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-400">Differential Diagnoses (Screening Ranking):</span>
                    <div className="space-y-1">
                      {data.differentialDiagnoses.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-white/5 text-xs">
                          <span className="text-slate-300 font-medium">{d.disease}</span>
                          <span className="text-cyan-400 font-bold font-mono">{d.probability}% Match</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.recommendations && (
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-300">Clinical Lifestyle Recommendations:</span>
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                      {data.recommendations.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-white/5">
                  {data.disclaimer || "Assistive clinical screening tool. Please consult a qualified clinician for definitive diagnosis."}
                </p>
              </div>
            );
          }

          if (tool === 'analyzePrescription') {
            return (
              <div 
                key={index} 
                className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Prescription OCR Analysis</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{timestamp}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase border border-indigo-500/30">
                    Pharmacology OCR
                  </span>
                </div>

                <div className="space-y-2">
                  {data.medicines?.map((med: any, mIdx: number) => (
                    <div key={mIdx} className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-[13px]">{med.name}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">{med.timing}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{med.purpose}</p>
                      <p className="text-emerald-400 text-[11px] font-medium">Relation to Food: {med.relationToFood}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  {data.generalGuidance || "Verify all doses with your dispensing pharmacist before consumption."}
                </p>
              </div>
            );
          }

          if (tool === 'analyzeMedicalImage' || tool === 'analyzeLiveVisual') {
            return (
              <div 
                key={index} 
                className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Multimodal Visual Screening</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{timestamp}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase border border-cyan-500/30">
                    Vision Pattern Match
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {data.radiologicalFindings || data.screeningClassification || "Visual pattern matches evaluated superficial parameters."}
                  </p>

                  {data.selfCareTips && (
                    <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-cyan-300">Self-Care Guidelines:</span>
                      <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                        {data.selfCareTips.map((tip: string, tIdx: number) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Fallback tool result card
          return (
            <div 
              key={index} 
              className="rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-xl space-y-2 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white uppercase">{tool}</span>
                <span className="text-[10px] text-slate-500 font-mono">{timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{result?.summaryMessage || JSON.stringify(data)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
