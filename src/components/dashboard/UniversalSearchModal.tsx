import React, { useState, useEffect } from 'react';
import { Search, X, Stethoscope, FileSearch, Image, Activity, ArrowRight, CornerDownLeft } from 'lucide-react';
import { MASTER_SYMPTOMS } from '@/src/data/symptoms_library';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymptom: (symptomName: string) => void;
  onSelectModule: (module: string) => void;
}

export default function UniversalSearchModal({
  isOpen,
  onClose,
  onSelectSymptom,
  onSelectModule
}: UniversalSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSymptoms = query.trim()
    ? MASTER_SYMPTOMS.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase()) ||
        s.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : MASTER_SYMPTOMS.slice(0, 5);

  const quickModules = [
    { id: 'predict', title: 'AI Disease Prediction (500+ Symptoms)', icon: Stethoscope },
    { id: 'prescription', title: 'AI Prescription OCR Analyzer', icon: FileSearch },
    { id: 'medical_image', title: 'AI Medical Image Analyzer (X-Ray, MRI)', icon: Image },
    { id: 'vitals', title: 'My Health Vitals & BMI Calculator', icon: Activity }
  ].filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || !query);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search symptoms, diseases, medicines, modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white font-medium placeholder:text-slate-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Search Results Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Modules Match Section */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">
              System Modules
            </div>
            <div className="space-y-1">
              {quickModules.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModule(m.id);
                      onClose();
                    }}
                    className="w-full p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 flex items-center justify-between text-left transition-all text-xs font-bold text-slate-200 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{m.title}</span>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Match Section */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">
              Matching Clinical Symptoms ({filteredSymptoms.length})
            </div>
            <div className="space-y-1">
              {filteredSymptoms.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSymptom(s.name);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/10 flex items-center justify-between text-left transition-all text-xs text-slate-300 hover:text-white group"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {s.name}
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {s.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950/80 text-center text-[10px] text-slate-500 flex items-center justify-between px-6">
          <span>Search over 550+ clinical symptoms & multi-modal AI analyzers</span>
          <span className="text-emerald-400 font-bold">HEALTH.AI V2.0</span>
        </div>
      </div>
    </div>
  );
}
