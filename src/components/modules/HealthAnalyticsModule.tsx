import React, { useState } from 'react';
import { 
  BarChart2, TrendingUp, Calendar, Activity, ShieldCheck, Heart 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '@/src/lib/utils';

interface HealthAnalyticsModuleProps {
  healthMetrics: any;
}

const DUMMY_ANALYTICS_TIMELINE = [
  { date: 'Jan 10', weight: 74, bmi: 24.8, bpSystolic: 125, bpDiastolic: 82, sugar: 98, score: 88 },
  { date: 'Feb 02', weight: 73.5, bmi: 24.6, bpSystolic: 122, bpDiastolic: 80, sugar: 96, score: 90 },
  { date: 'Mar 15', weight: 72.8, bmi: 24.4, bpSystolic: 120, bpDiastolic: 78, sugar: 94, score: 92 },
  { date: 'Apr 04', weight: 72.0, bmi: 24.1, bpSystolic: 118, bpDiastolic: 76, sugar: 92, score: 95 },
  { date: 'May 20', weight: 71.5, bmi: 23.9, bpSystolic: 119, bpDiastolic: 77, sugar: 90, score: 96 }
];

const RISK_PIE_DATA = [
  { name: 'Low Risk', value: 70, color: '#10b981' },
  { name: 'Moderate Risk', value: 20, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' }
];

export default function HealthAnalyticsModule({ healthMetrics }: HealthAnalyticsModuleProps) {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">Longitudinal Health Analytics</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
                RECHARTS V2.0
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Interactive visualization of body weight, BMI trends, blood pressure, and risk distribution.
            </p>
          </div>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10">
          {['7d', '30d', '6m', '1y'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all",
                timeRange === r ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weight & BMI Chart */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Body Mass Index & Weight Trend
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              -2.5 kg Total Reduction
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DUMMY_ANALYTICS_TIMELINE}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#cyanGrad)" name="Weight (kg)" />
                <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} name="BMI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4 text-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Risk Categorization</h3>
          
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RISK_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold text-slate-300">
            {RISK_PIE_DATA.map(r => (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span>{r.name} ({r.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Pressure Line Chart */}
        <div className="lg:col-span-12 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Blood Pressure (Systolic / Diastolic)
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DUMMY_ANALYTICS_TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 150]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Line type="monotone" dataKey="bpSystolic" stroke="#f43f5e" strokeWidth={3} name="Systolic (mmHg)" />
                <Line type="monotone" dataKey="bpDiastolic" stroke="#3b82f6" strokeWidth={3} name="Diastolic (mmHg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
