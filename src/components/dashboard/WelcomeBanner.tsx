import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Calendar, ShieldCheck, HeartPulse, Activity, Radio, ArrowRight, Mic } from 'lucide-react';

interface WelcomeBannerProps {
  user: any;
  healthScore: number;
}

const HEALTH_QUOTES = [
  "“The greatest wealth is health.” – Virgil",
  "“To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.” – Buddha",
  "“Early prevention and intelligent monitoring lead to a longer, vibrant life.”",
  "“Your body hears everything your mind says. Stay positive and well hydrated today.”"
];

export default function WelcomeBanner({ user, healthScore }: WelcomeBannerProps) {
  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % HEALTH_QUOTES.length);
    }, 12000);
    return () => clearInterval(quoteTimer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-white/10 p-6 sm:p-8 shadow-2xl mb-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Welcome Details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AI Patient Workspace
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-slate-600">•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">{user?.name || 'Patient'}</span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed italic font-medium opacity-90 transition-all duration-500">
            {HEALTH_QUOTES[quoteIndex]}
          </p>

          {/* CTA: Talk to HEALTH.AI / Start Live Health Session */}
          <div className="pt-2">
            <Link
              to="/live-agent"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 group"
            >
              <Mic className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Talk to HEALTH.AI (Start Live Health Session)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Index Status</div>
            <div className="text-2xl font-black text-white font-display flex items-baseline gap-1">
              {healthScore} <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" /> Optimal Range
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
