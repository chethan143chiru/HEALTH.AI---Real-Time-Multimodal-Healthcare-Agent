import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Heart, Sparkles, Plus, BookOpen, 
  Wind, Music, History, Target, PenTool, CheckCircle2,
  Smile, Frown, Meh, Angry, Ghost, ArrowRight, ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function MentalHealth() {
  const [mood, setMood] = useState<string | null>(null);
  const [journal, setJournal] = useState("");
  const [entries, setEntries] = useState([
    { id: '1', date: '2026-04-20', mood: 'Calm', note: 'Had a productive day focusing on wellness.' },
    { id: '2', date: '2026-04-19', mood: 'Stressed', note: 'Work was overwhelming, need more meditation.' }
  ]);

  const moods = [
    { icon: Smile, label: 'Happy', color: 'text-emerald-400 bg-emerald-500/10' },
    { icon: Sparkles, label: 'Calm', color: 'text-blue-400 bg-blue-500/10' },
    { icon: Meh, label: 'Neutral', color: 'text-slate-400 bg-slate-500/10' },
    { icon: Frown, label: 'Sad', color: 'text-indigo-400 bg-indigo-500/10' },
    { icon: Angry, label: 'Stressed', color: 'text-orange-400 bg-orange-500/10' },
    { icon: Ghost, label: 'Anxious', color: 'text-purple-400 bg-purple-500/10' },
  ];

  const handleMoodSelect = (label: string) => {
    setMood(label);
    alert(`Mood tracked: ${label}. Sending personalized mindfulness tip...`);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood: mood || 'Neutral',
      note: journal
    };
    setEntries([newEntry, ...entries]);
    setJournal("");
    setMood(null);
    alert("Journal entry saved securely.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-pink-500" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Mental Wellness System</span>
           </div>
           <h1 className="text-5xl font-black font-display tracking-tightest">Mindful <span className="text-pink-500">Journey.</span></h1>
        </div>
        <p className="text-white/40 max-w-sm text-right">Track your moods, thoughts, and maintain mental equilibrium with AI assistance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mood Tracker */}
        <div className="lg:col-span-8 space-y-8">
           <div className="glass-card p-10">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Heart className="w-6 h-6 text-pink-500" /> How are you feeling right now?</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodSelect(m.label)}
                    className={cn(
                      "flex flex-col items-center gap-3 group transition-all",
                      mood === m.label ? "scale-110" : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl", 
                      m.color,
                      mood === m.label ? "ring-2 ring-white/20" : ""
                    )}>
                      <m.icon className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>
           </div>

           <div className="glass-card p-10">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><PenTool className="w-6 h-6 text-brand-primary" /> Daily Reflections</h2>
              <form onSubmit={handleSaveEntry} className="space-y-6">
                 <textarea
                   placeholder="Write your thoughts here... Triggers, gratitudes, or just a stream of consciousness."
                   className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl py-6 px-8 focus:ring-2 focus:ring-brand-primary outline-none text-lg leading-relaxed placeholder:text-white/10 resize-none transition-all"
                   value={journal}
                   onChange={(e) => setJournal(e.target.value)}
                   required
                 />
                 <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                       <button type="button" className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                          <Music className="w-5 h-5 text-white/40" />
                       </button>
                       <button type="button" className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                          <Ghost className="w-5 h-5 text-white/40" />
                       </button>
                    </div>
                    <button type="submit" className="btn-primary py-4 px-10 flex items-center gap-3">
                       <Plus className="w-5 h-5" /> Save Entry
                    </button>
                 </div>
              </form>
           </div>

           <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                 <History className="w-4 h-4" /> Past Reflections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {entries.map((entry) => (
                   <div key={entry.id} className="glass-card p-6 border-l-4 border-white/10 hover:border-brand-primary transition-all group">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{entry.date}</span>
                         <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-brand-primary">{entry.mood}</span>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-3 leading-relaxed mb-4 italic">"{entry.note}"</p>
                      <button className="text-[10px] uppercase font-black tracking-widest text-brand-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                         Read More <ArrowRight className="w-3 h-3" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
              <h3 className="text-lg font-black mb-6 uppercase flex items-center gap-2">
                 <Wind className="w-5 h-5 text-indigo-400" /> Breathing Space
              </h3>
              <div className="flex flex-col items-center">
                 <div className="w-32 h-32 rounded-full bg-white/5 border border-indigo-500/20 flex items-center justify-center relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20" />
                    <Sparkles className="w-10 h-10 text-indigo-400" />
                 </div>
                 <button 
                  onClick={() => alert("Starting 4-7-8 Breathing Technique session...")}
                  className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm tracking-tightest shadow-lg shadow-indigo-500/20"
                 >
                   Start 4-7-8 Session
                 </button>
              </div>
           </div>

           <div className="glass-card p-8">
              <h3 className="text-lg font-black mb-6 uppercase flex items-center gap-2">
                 <Target className="w-5 h-5 text-emerald-400" /> CBT Exercises
              </h3>
              <div className="space-y-3">
                 {[
                   "Challenge Cognitive Distortions",
                   "Exposure Goal Tracking",
                   "Gratitude Shadowboxing",
                   "Anxiety Reframing"
                 ].map((ex, i) => (
                   <button 
                    key={i}
                    onClick={() => alert(`Opening ${ex} interactive session...`)}
                    className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
                   >
                      <span className="text-sm font-medium text-white/60">{ex}</span>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BookOpen className="w-20 h-20" />
              </div>
              <h3 className="text-lg font-black mb-2 uppercase">Daily Affirmation</h3>
              <p className="text-sm text-white/60 italic leading-relaxed mb-6">
                "I am capable of handling whatever this day brings. My mental health is my priority and I am taking steps to protect it."
              </p>
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                 <CheckCircle2 className="w-3 h-3" /> Updated by Health AI
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
