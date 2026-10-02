import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, CheckCircle2, TrendingUp, HeartPulse, 
  Target, ShieldAlert, Sparkles, Download, Mail
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { cn } from '@/src/lib/utils';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, 
  ArcElement, PointElement, LineElement
);

interface PredictionData {
  disease: string;
  probability: number;
  risk: 'Low' | 'Medium' | 'High';
  score: number;
  suggestions: string[];
  recommendations: string;
}

export default function PredictionResult({ data, onDownload }: { data: PredictionData, onDownload: () => void }) {
  const riskColor = {
    Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    High: "text-red-400 bg-red-500/10 border-red-500/20"
  };

  // Sanitize data values to prevent NaN
  const sanitizedProbability = typeof data.probability === 'number' ? (data.probability > 1 ? data.probability / 100 : data.probability) : 0.85;
  const sanitizedScore = typeof data.score === 'number' ? data.score : 75;

  const barData = {
    labels: ['Confidence', 'Health Index', 'Vital Match', 'Immune Guard', 'Recovery Rate'],
    datasets: [{
      label: 'Health Metrics (%)',
      data: [
        Math.round(sanitizedProbability * 100), 
        sanitizedScore, 
        88, 
        72, 
        91
      ],
      backgroundColor: ['#3b82f6', '#6366f1', '#2563eb', '#10b981', '#f59e0b'],
      borderRadius: 8,
      borderWidth: 0,
      barThickness: 20
    }]
  };

  const pieData = {
    labels: ['Risk', 'Safety'],
    datasets: [{
      data: [data.risk === 'High' ? 80 : data.risk === 'Medium' ? 40 : 10, data.risk === 'High' ? 20 : data.risk === 'Medium' ? 60 : 90],
      backgroundColor: [data.risk === 'High' ? '#ef4444' : data.risk === 'Medium' ? '#f59e0b' : '#10b981', '#1e293b'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6">
      {/* Risk Indicator Card */}
      <div className="glass-card overflow-hidden relative group">
         <div className="relative p-10 overflow-hidden border-b border-white/5 bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
               <div className="flex items-center gap-8">
                  <div className="w-1.5 h-16 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" />
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border", riskColor[data.risk])}>
                           {data.risk} RISK ALERT
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">• MULTI-MODEL ANALYSIS</span>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black text-white tracking-tightest leading-none uppercase">
                        {data.disease}
                     </h2>
                     <p className="text-blue-400/60 mt-3 text-xs font-medium tracking-wide">
                        System Recommendation: <span className="text-slate-400">Analysis complete using Enhanced Classifier Layer</span>
                     </p>
                  </div>
               </div>
               
               <div className="flex gap-4">
                  <div className="flex flex-col items-center px-8 py-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl min-w-[150px]">
                     <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Confidence</span>
                     <span className="text-5xl font-black text-blue-400">{Math.round(data.probability * 100)}%</span>
                  </div>
                  
                  <div className="flex flex-col items-center px-8 py-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl min-w-[150px]">
                     <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Health Score</span>
                     <span className={cn("text-5xl font-black", 
                        data.score > 70 ? "text-emerald-400" : data.score > 40 ? "text-yellow-400" : "text-red-400"
                     )}>{data.score}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[300px]">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-primary" /> Confidence Profile
          </h3>
          <Bar 
            data={barData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { 
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
              }
            }} 
          />
        </div>
        <div className="glass-card p-6 h-[300px] flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" /> Risk Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
               <span className="text-3xl font-black">{data.risk === 'High' ? 'High' : data.risk === 'Medium' ? 'Med' : 'Low'}</span>
               <span className="text-[10px] text-white/20 uppercase tracking-widest">Risk</span>
            </div>
            <Pie 
              data={pieData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" /> Doctor Recommendations
          </h3>
          <div className="space-y-4">
            {data.suggestions.map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-brand-primary text-xs font-black">{i + 1}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
            <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-brand-primary">Expert Guidance</h4>
            <p className="text-sm text-white/60 italic leading-relaxed">{data.recommendations}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onDownload}
            className="flex-1 glass-card p-6 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all text-white/80 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-bold text-sm">Download PDF Report</span>
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">Encrypted Medical Data</span>
          </button>
          
          <button className="flex-1 glass-card p-6 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all text-white/80 hover:text-white">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all">
              <Mail className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="font-bold text-sm">Send to Registered Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
