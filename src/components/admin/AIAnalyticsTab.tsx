import React, { useState } from 'react';
import { 
  Brain, Activity, Zap, FileText, Image, Camera, MessageSquare, 
  CheckCircle2, AlertTriangle, RefreshCw, BarChart2, TrendingUp, Sliders, Play, Pause 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { MOCK_CHART_AI_MODULE_USAGE, MOCK_CHART_DISEASE_DISTRIBUTION } from '@/src/data/mockAdminData';

interface AIAnalyticsTabProps {
  onAuditLog: (action: string, details: string) => void;
}

export default function AIAnalyticsTab({ onAuditLog }: AIAnalyticsTabProps) {
  const [engineStates, setEngineStates] = useState({
    prediction: true,
    prescription: true,
    medicalImage: true,
    liveCamera: true,
    assistant: true
  });

  const toggleEngine = (engine: keyof typeof engineStates, label: string) => {
    const nextVal = !engineStates[engine];
    setEngineStates(prev => ({ ...prev, [engine]: nextVal }));
    onAuditLog('TOGGLE_AI_ENGINE', `${nextVal ? 'Enabled' : 'Disabled'} system-wide AI engine: ${label}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">AI Analytics & Neural Model Governance</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-[10px] uppercase tracking-widest">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Monitor real-time latency, confidence scores, request volumes, and model states across all 4 diagnostic AI engines.
          </p>
        </div>

        <button
          onClick={() => {
            alert('AI Models refreshed and baseline configurations updated successfully.');
            onAuditLog('REFRESH_AI_MODELS', 'Manually refreshed baseline parameters for 4 diagnostic engines');
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Models
        </button>
      </div>

      {/* 5 AI ENGINE CARDS & TOGGLES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { key: 'prediction', title: 'Disease Prediction', latency: '410ms', accuracy: '94.2%', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { key: 'prescription', title: 'Prescription OCR', latency: '620ms', accuracy: '91.8%', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { key: 'medicalImage', title: 'Radiology AI', latency: '780ms', accuracy: '93.5%', icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { key: 'liveCamera', title: 'Live Detection', latency: '320ms', accuracy: '92.0%', icon: Camera, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'assistant', title: 'AI Assistant', latency: '1.2s', accuracy: '97.4%', icon: MessageSquare, color: 'text-rose-400', bg: 'bg-rose-500/10' }
        ].map((eng) => {
          const isEnabled = engineStates[eng.key as keyof typeof engineStates];
          const Icon = eng.icon;
          return (
            <div key={eng.key} className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border border-white/10", eng.bg, eng.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => toggleEngine(eng.key as any, eng.title)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1",
                    isEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  )}
                >
                  {isEnabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {isEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase">{eng.title}</h3>
                <div className="flex items-center justify-between mt-2 font-mono text-xs">
                  <span className="text-slate-400">Latency: <span className="text-white font-bold">{eng.latency}</span></span>
                  <span className="text-emerald-400 font-bold">{eng.accuracy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Module Volume Chart */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" /> Diagnostic AI Volume & Execution Breakdown
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">10,280 Total Scans</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_AI_MODULE_USAGE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="module" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Completed Scans" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Conditions Ranking */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Top Diagnostic Diseases
          </h3>
          <p className="text-xs text-slate-400">Most identified clinical conditions</p>

          <div className="space-y-3 pt-2">
            {MOCK_CHART_DISEASE_DISTRIBUTION.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{d.disease}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Risk Category: {d.risk}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-cyan-400">{d.count}</span>
                  <div className="text-[10px] text-slate-500">cases</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI ERROR MONITOR */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" /> AI Error & Quality Resolution Monitor
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">AI Engine</th>
                <th className="p-3">Error Description</th>
                <th className="p-3">Impact</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr>
                <td className="p-3">2026-08-04 06:12</td>
                <td className="p-3 text-cyan-400">Prescription OCR</td>
                <td className="p-3 font-sans">Blurry image upload failed initial text extraction step</td>
                <td className="p-3 text-amber-400">Low</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Resolved (Fallback)</span></td>
              </tr>
              <tr>
                <td className="p-3">2026-08-03 21:45</td>
                <td className="p-3 text-purple-400">Radiology AI</td>
                <td className="p-3 font-sans">Low contrast DICOM format required histogram equalization</td>
                <td className="p-3 text-amber-400">Moderate</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Auto-Corrected</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
