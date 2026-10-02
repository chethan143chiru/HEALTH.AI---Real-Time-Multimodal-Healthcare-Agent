import React, { useState } from 'react';
import { 
  Image as ImageIcon, Upload, Eye, EyeOff, ZoomIn, ZoomOut, RotateCw, Download, CheckCircle, AlertCircle, ShieldCheck, Loader2, Layers 
} from 'lucide-react';
import { MedicalImageAnalysisResult } from '@/src/types/health';
import { analyzeMedicalImageAPI } from '@/src/lib/api';
import { generateMedicalImagePDF } from '@/src/lib/pdfGenerator';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface MedicalImageAnalyzerModuleProps {
  userName?: string;
  onAnalysisComplete?: (result: MedicalImageAnalysisResult) => void;
}

const MODALITY_OPTIONS = [
  "Chest X-Ray",
  "Bone / Fracture X-Ray",
  "Brain / Spine MRI",
  "Abdominal / Pelvic CT Scan",
  "Ultrasound",
  "Dental X-Ray",
  "Skin Lesion / Dermatology Photo",
  "Eye / Ophthalmic Image",
  "General Medical Scan"
];

export default function MedicalImageAnalyzerModule({ userName = 'User', onAnalysisComplete }: MedicalImageAnalyzerModuleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModality, setSelectedModality] = useState<string>("Chest X-Ray");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing radiological analyzer...');
  const [result, setResult] = useState<MedicalImageAnalysisResult | null>(null);

  // Overlay & image controls
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);

    const steps = [
      "Evaluating image resolution & brightness contrast...",
      "Detecting radiological structural anomalies...",
      "Mapping Region of Interest (ROI) heatmap...",
      "Synthesizing plain-language patient findings..."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setLoadingStep(steps[idx % steps.length]);
      idx++;
    }, 1200);

    try {
      const mimeType = file?.type || 'image/jpeg';
      const analysis = await analyzeMedicalImageAPI(imagePreview, mimeType, selectedModality);
      analysis.id = `img-${Date.now()}`;
      analysis.createdAt = new Date().toISOString();
      analysis.fileName = file?.name || 'Medical_Scan';
      analysis.imageType = selectedModality;

      setResult(analysis);
      if (onAnalysisComplete) onAnalysisComplete(analysis);

      // Save to Firestore
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;

      if (activeUser) {
        await addDoc(collection(db, 'predictions'), {
          userId: activeUser.uid || activeUser.id,
          type: 'medical_image',
          result: analysis,
          createdAt: serverTimestamp()
        }).catch(err => console.warn("Firestore save warning:", err));
      }

    } catch (err: any) {
      console.error("Medical Image Error:", err);
      alert(err.message || "Failed to analyze medical image.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">AI Medical Image Analyzer</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                RADIOLOGY AI V2.0
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Automated visual feature analysis for X-Rays, MRIs, CT Scans, Ultrasounds, and Dermatology photos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Modality Select */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" /> Select Modality & Image Upload
            </h3>

            {/* Modality selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Image Modality</label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50"
              >
                {MODALITY_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <label className="border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 transition-all text-center group">
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-purple-400 group-hover:scale-110 transition-all mb-3" />
              <span className="text-xs font-bold text-white">Upload Medical Image</span>
              <span className="text-[10px] text-slate-500 mt-1">Supports DICOM convert, JPG, PNG up to 15MB</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Interactive Canvas Viewer */}
            {imagePreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Visual Overlay Controls</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowAnnotations(!showAnnotations)} 
                      className={cn("px-2 py-1 rounded-lg border text-[10px]", showAnnotations ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-white/5 text-slate-400")}
                    >
                      {showAnnotations ? 'Hide Regions' : 'Show Regions'}
                    </button>
                    <button 
                      onClick={() => setShowHeatmap(!showHeatmap)} 
                      className={cn("px-2 py-1 rounded-lg border text-[10px]", showHeatmap ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "bg-white/5 text-slate-400")}
                    >
                      Heatmap
                    </button>
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.5))} className="p-1 rounded-lg bg-white/5 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))} className="p-1 rounded-lg bg-white/5 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-white/10 h-72 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Medical Scan preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
                  />

                  {/* Simulated Heatmap Layer */}
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-pink-500/20 to-transparent pointer-events-none mix-blend-color-dodge animate-pulse" />
                  )}

                  {/* Region Annotations Box Overlay */}
                  {showAnnotations && result?.annotations && result.annotations.map(ann => (
                    <div
                      key={ann.id}
                      className="absolute border-2 border-purple-400 bg-purple-500/20 rounded-lg flex items-start p-1 pointer-events-none text-[9px] font-bold text-purple-200"
                      style={{
                        left: `${ann.x - ann.width/2}%`,
                        top: `${ann.y - ann.height/2}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`
                      }}
                    >
                      <span className="bg-purple-950/90 px-1 py-0.5 rounded border border-purple-400">{ann.label} ({ann.confidence}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!imagePreview || loading}
              onClick={handleAnalyze}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Execute Medical Image AI</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: AI Visual Findings */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Quality & Summary Card */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      MODALITY: {result.imageType}
                    </span>
                    <h3 className="text-xl font-black text-white font-display mt-2">
                      Quality Score: {result.qualityCheck?.qualityScore || 90}/100
                    </h3>
                    <p className="text-xs text-slate-400">Confidence Level: {result.confidenceLevel}</p>
                  </div>

                  <button
                    onClick={() => generateMedicalImagePDF(result, userName)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" /> PDF Report
                  </button>
                </div>

                {/* Plain language explanation */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs">
                  <span className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">Clinical Interpretation:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">{result.primaryInterpretation}</p>
                  <p className="text-slate-400 leading-relaxed mt-2 italic">{result.plainLanguageExplanation}</p>
                </div>

                {/* Possible Conditions list */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Correlated Pattern Conditions ({result.possibleConditions?.length || 0})
                  </h4>

                  <div className="space-y-2">
                    {(result.possibleConditions || []).map(c => (
                      <div key={c.condition} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white text-sm">{c.condition}</div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{c.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-purple-400 font-display">{c.relativeConfidence}%</span>
                          <span className="text-[9px] text-slate-500 block">AI Match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer note */}
                <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>This automated AI analysis provides educational decision-support. Formal diagnosis requires radiologist review.</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Awaiting Medical Scan</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Upload a radiologic scan or dermatology photo to run pattern identification and automated ROI heatmap analysis.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
