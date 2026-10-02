import React, { useState } from 'react';
import { 
  Stethoscope, Search, X, Check, Loader2, Sparkles, Download, ShieldAlert, Heart, Activity, 
  HelpCircle, AlertTriangle, ArrowRight, RefreshCw, Layers, Cpu, Brain, Plus 
} from 'lucide-react';
import { SYMPTOM_CATEGORIES, MASTER_SYMPTOMS, searchSymptoms } from '@/src/data/symptoms_library';
import { DiseasePredictionResult } from '@/src/types/health';
import { predictDiseaseAPI } from '@/src/lib/api';
import { generateDiseasePDF } from '@/src/lib/pdfGenerator';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface DiseasePredictionModuleProps {
  userProfile: any;
  healthMetrics: any;
  onPredictionComplete: (result: DiseasePredictionResult) => void;
  preselectedSymptom?: string | null;
}

export default function DiseasePredictionModule({
  userProfile,
  healthMetrics,
  onPredictionComplete,
  preselectedSymptom
}: DiseasePredictionModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    preselectedSymptom ? [preselectedSymptom] : []
  );
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing diagnostic model...');
  const [predictionResult, setPredictionResult] = useState<DiseasePredictionResult | null>(null);

  const filteredSymptoms = searchSymptoms(searchQuery, selectedCategory);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (!trimmed) return;
    if (!selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
    }
    setCustomSymptomInput('');
  };

  const clearAllSymptoms = () => setSelectedSymptoms([]);

  const handleRunPrediction = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);

    const steps = [
      "Analyzing selected clinical symptoms...",
      "Mapping organ system interactions...",
      "Computing differential probability weights...",
      "Generating Explainable AI reasoning & recommendations..."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setLoadingStep(steps[idx % steps.length]);
      idx++;
    }, 1100);

    try {
      const result = await predictDiseaseAPI(selectedSymptoms, userProfile, healthMetrics);
      result.id = `pred-${Date.now()}`;
      result.createdAt = new Date().toISOString();
      result.selectedSymptoms = selectedSymptoms;

      setPredictionResult(result);
      onPredictionComplete(result);

      // Save to Firestore
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;

      if (activeUser) {
        await addDoc(collection(db, 'predictions'), {
          userId: activeUser.uid || activeUser.id,
          symptoms: selectedSymptoms,
          engineUsed: result.engineUsed || 'local_ml',
          result: result,
          createdAt: serverTimestamp()
        }).catch(err => console.warn("Firestore save warning:", err));
      }

      // Save to LocalStorage history
      const history = JSON.parse(localStorage.getItem('medicalHistory') || '[]');
      localStorage.setItem('medicalHistory', JSON.stringify([result, ...history]));

    } catch (err: any) {
      console.error("Prediction failed:", err);
      alert(err.message || "Diagnostic engine encountered an issue. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Module Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white tracking-tight font-display">AI Disease Prediction</h2>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Clinical diagnostic differential analysis powered by intelligent symptom mapping and Explainable AI reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Symptom Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Select Symptoms ({selectedSymptoms.length})
              </h3>
              {selectedSymptoms.length > 0 && (
                <button 
                  onClick={clearAllSymptoms}
                  className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Selected Symptoms Chips */}
            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/20 max-h-36 overflow-y-auto custom-scrollbar">
                {selectedSymptoms.map(s => (
                  <span 
                    key={s}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
                  >
                    {s}
                    <X 
                      className="w-3.5 h-3.5 cursor-pointer hover:text-white" 
                      onClick={() => toggleSymptom(s)} 
                    />
                  </span>
                ))}
              </div>
            )}

            {/* Custom Symptom Input (For custom or out-of-dataset symptoms) */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type custom symptom..."
                value={customSymptomInput}
                onChange={(e) => setCustomSymptomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSymptom();
                  }
                }}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl py-2 px-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={handleAddCustomSymptom}
                disabled={!customSymptomInput.trim()}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-xs font-bold text-slate-200 hover:text-emerald-300 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symptoms (e.g. fever, chest pain, cough)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all",
                  selectedCategory === 'All' ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                All Symptoms
              </button>
              {SYMPTOM_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all",
                    selectedCategory === cat ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Symptom List Grid */}
            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredSymptoms.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No symptoms match your search. You can add it above as a custom symptom!
                </div>
              ) : (
                filteredSymptoms.map(s => {
                  const isSelected = selectedSymptoms.includes(s.name);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSymptom(s.name)}
                      className={cn(
                        "p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs",
                        isSelected 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-white font-bold" 
                          : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{s.name}</span>
                          <span className="text-[9px] font-normal px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                            {s.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">{s.description}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border",
                        isSelected ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-white/10"
                      )}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Run Prediction Button */}
            <button
              disabled={selectedSymptoms.length === 0 || loading}
              onClick={handleRunPrediction}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Run Diagnostic</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Prediction Results & Explainable AI */}
        <div className="lg:col-span-7 space-y-6">
          {predictionResult ? (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Primary Result Banner */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        PRIMARY DIFFERENTIAL MATCH
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-white font-display">{predictionResult.primaryDisease}</h3>
                  </div>

                  <button
                    onClick={() => generateDiseasePDF(predictionResult, userProfile?.name)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" /> PDF Report
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Probability</div>
                    <div className="text-2xl font-black text-emerald-400 font-display">{predictionResult.primaryProbability}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Level</div>
                    <div className="text-2xl font-black text-amber-400 font-display">{predictionResult.primaryRisk}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Health Score</div>
                    <div className="text-2xl font-black text-cyan-400 font-display">{predictionResult.healthScore}</div>
                  </div>
                </div>

                {/* Overview Text */}
                <div className="mt-4 text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <p className="font-semibold text-white mb-1">Clinical Overview:</p>
                  {predictionResult.overview}
                </div>
              </div>

              {/* Explainable AI & Symptom Contributions */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Explainable AI Reasoning & Symptom Importance
                </h4>
                
                <p className="text-xs text-slate-300 leading-relaxed italic bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 text-cyan-200">
                  "{predictionResult.reasoningSummary}"
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Symptom Contribution Meter:</span>
                  {(predictionResult.contributingSymptoms || []).map(sc => (
                    <div key={sc.symptom} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold">{sc.symptom}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{sc.contribution} Impact ({sc.importanceScore}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                          style={{ width: `${sc.importanceScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Differential Conditions List */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Differential Diagnosis Probabilities ({predictionResult.topDiseases?.length || 0})
                </h4>

                <div className="space-y-3">
                  {(predictionResult.topDiseases || []).map((d, i) => (
                    <div key={d.disease} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs gap-4">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          #{i + 1} {d.disease}
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase",
                            d.risk === 'Low' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            d.risk === 'Moderate' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                          )}>
                            {d.risk} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{d.confidenceExplanation}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-emerald-400 font-display">{d.probability}%</div>
                        <span className="text-[10px] text-slate-500 font-semibold">{d.severity} Severity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Care Plan & Recommendations */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" /> Personalized Lifestyle & Dietary Plan
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Foods to Include</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {(predictionResult.dietRecommendations?.foodsToInclude || []).map(f => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                    <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Foods to Limit</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {(predictionResult.dietRecommendations?.foodsToLimit || []).map(f => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Follow up & Urgent Warning Signs */}
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-2">
                  <div className="font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Seek Emergency Medical Care If You Experience:
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {(predictionResult.followUpAdvice?.urgentWarningSigns || []).map(w => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Stethoscope className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Awaiting Symptom Input</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Select symptoms or enter custom signs to execute our Kaggle ML model & Gemini 3.7 Flash diagnostic reasoning.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
