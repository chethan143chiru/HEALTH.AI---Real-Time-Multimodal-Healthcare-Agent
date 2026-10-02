import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, FileSearch, Image, Camera, Activity, Bot, History, BarChart2, ArrowRight, Sparkles, Radio 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface QuickActionPanelProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export default function QuickActionPanel({ activeModule, setActiveModule }: QuickActionPanelProps) {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'live_agent',
      title: 'Live Health Agent',
      subtitle: 'Real-Time Voice • Camera • Agent',
      description: 'Interactive conversation with bidirectional audio, live camera frames & automated clinical tools.',
      icon: Radio,
      color: 'cyan',
      bgGradient: 'from-cyan-500/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-cyan-500/40',
      badge: 'PS05 REALTIME',
      isRoute: true,
      route: '/live-agent'
    },
    {
      id: 'predict',
      title: 'AI Disease Prediction',
      subtitle: '500+ Symptoms • Explainable AI',
      description: 'Instant differential diagnosis with probability breakdown & care advice.',
      icon: Stethoscope,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
      badge: 'PRO DIAGNOSTIC'
    },
    {
      id: 'prescription',
      title: 'AI Prescription OCR',
      subtitle: 'JPG / PNG / PDF OCR Parsing',
      description: 'Extract handwritten doctor notes, recognized medicines & dosages.',
      icon: FileSearch,
      color: 'blue',
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
      badge: 'OCR VISION'
    },
    {
      id: 'medical_image',
      title: 'Medical Image Analyzer',
      subtitle: 'X-Ray • MRI • CT • Ultrasound',
      description: 'Automated radiologic feature detection, quality check & heatmaps.',
      icon: Image,
      color: 'purple',
      bgGradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
      badge: 'RADIOLOGY AI'
    },
    {
      id: 'live_camera',
      title: 'Live Camera Detection',
      subtitle: 'Skin & Surface Lesions Scan',
      description: 'Real-time camera capture for acne, rash, eczema & skin conditions.',
      icon: Camera,
      color: 'pink',
      bgGradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
      borderColor: 'border-pink-500/30',
      badge: 'CAM SCANNER'
    },
    {
      id: 'vitals',
      title: 'My Health Vitals',
      subtitle: 'BMI • BP • Sugar • Weight',
      description: 'Track and log vital metrics with body index status indicators.',
      icon: Activity,
      color: 'amber',
      bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      borderColor: 'border-amber-500/30',
      badge: 'BIOMETRICS'
    },
    {
      id: 'history',
      title: 'Reports & History',
      subtitle: 'Centralized Records Hub',
      description: 'Search, filter, view details & download PDF reports of past scans.',
      icon: History,
      color: 'indigo',
      bgGradient: 'from-indigo-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-indigo-500/30',
      badge: 'PDF REPOSITORY'
    },
    {
      id: 'analytics',
      title: 'Health Analytics',
      subtitle: 'Interactive Charts & Trends',
      description: 'Visualize longitudinal weight, blood pressure and risk trends.',
      icon: BarChart2,
      color: 'cyan',
      bgGradient: 'from-cyan-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-cyan-500/30',
      badge: 'CHARTS'
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Healthcare AI Modules</h2>
          <p className="text-slate-400 text-xs">Select any specialized tool to begin intelligent diagnostic analysis</p>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 7 Active AI Engines
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(m => {
          const isActive = activeModule === m.id;
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              onClick={() => {
                if ((m as any).isRoute && (m as any).route) {
                  navigate((m as any).route);
                } else {
                  setActiveModule(m.id);
                }
              }}
              className={cn(
                "group relative rounded-3xl p-6 cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden",
                "bg-slate-900/90 hover:bg-slate-900 shadow-lg hover:shadow-2xl hover:-translate-y-1",
                isActive ? `${m.borderColor} ring-2 ring-emerald-500/40 bg-gradient-to-br ${m.bgGradient}` : "border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {m.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">{m.title}</h3>
                <p className="text-[11px] font-semibold text-emerald-400/90 mb-2">{m.subtitle}</p>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{m.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-emerald-400">
                <span>Launch Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
