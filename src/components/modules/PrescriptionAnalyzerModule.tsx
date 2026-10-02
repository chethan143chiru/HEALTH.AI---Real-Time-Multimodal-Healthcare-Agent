import React, { useState } from 'react';
import { 
  FileSearch, Upload, FileText, CheckCircle2, AlertTriangle, Download, Copy, Check, Eye, ZoomIn, ZoomOut, RotateCw, Loader2, Pill 
} from 'lucide-react';
import { PrescriptionAnalysisResult } from '@/src/types/health';
import { analyzePrescriptionAPI } from '@/src/lib/api';
import { generatePrescriptionPDF } from '@/src/lib/pdfGenerator';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface PrescriptionAnalyzerModuleProps {
  userName?: string;
  onAnalysisComplete?: (result: PrescriptionAnalysisResult) => void;
}

export default function PrescriptionAnalyzerModule({ userName = 'User', onAnalysisComplete }: PrescriptionAnalyzerModuleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing OCR scanner...');
  const [result, setResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Zoom / Rotate states for preview
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);

    const steps = [
      "Preprocessing document image contrast...",
      "Extracting handwritten clinical text...",
      "Parsing pharmacology & medication dosages...",
      "Cross-referencing drug safety guidelines..."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setLoadingStep(steps[idx % steps.length]);
      idx++;
    }, 1200);

    try {
      const mimeType = file?.type || 'image/jpeg';
      const analysis = await analyzePrescriptionAPI(imagePreview, mimeType, file?.name || 'prescription.png');
      analysis.id = `presc-${Date.now()}`;
      analysis.createdAt = new Date().toISOString();
      analysis.fileName = file?.name || 'Prescription_Scan';

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
          type: 'prescription_ocr',
          result: analysis,
          createdAt: serverTimestamp()
        }).catch(err => console.warn("Firestore save warning:", err));
      }

    } catch (err: any) {
      console.error("Prescription OCR Error:", err);
      alert(err.message || "Failed to analyze prescription image.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (result?.extractedText) {
      navigator.clipboard.writeText(result.extractedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <FileSearch className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">AI Prescription OCR Analyzer</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                VISION OCR V2.0
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Upload handwritten or printed prescription photos (JPG, PNG, PDF) for automated medication & dosage extraction.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Image Viewer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" /> Prescription Upload
            </h3>

            <label className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 transition-all text-center group">
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-3" />
              <span className="text-xs font-bold text-white">Click or drag prescription photo</span>
              <span className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, PDF up to 10MB</span>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Interactive Image Preview with Controls */}
            {imagePreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Image Controls</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.5))} className="p-1.5 rounded-lg bg-white/5 hover:text-white" title="Zoom In">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))} className="p-1.5 rounded-lg bg-white/5 hover:text-white" title="Zoom Out">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-1.5 rounded-lg bg-white/5 hover:text-white" title="Rotate">
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-white/10 h-64 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Prescription preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                    }}
                  />
                </div>
              </div>
            )}

            <button
              disabled={!imagePreview || loading}
              onClick={handleAnalyze}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-5 h-5" />
                  <span>Analyze Prescription OCR</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: OCR Results */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Summary Card */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      OCR EXTRACTION COMPLETE
                    </span>
                    <h3 className="text-xl font-black text-white font-display mt-2">
                      Doctor: {result.doctorName || 'Unspecified'}
                    </h3>
                    <p className="text-xs text-slate-400">Clinic: {result.clinicName || 'Unspecified'}</p>
                  </div>

                  <button
                    onClick={() => generatePrescriptionPDF(result, userName)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" /> PDF Report
                  </button>
                </div>

                {/* Medicines Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-400" /> Prescribed Medications ({result.medicines?.length || 0})
                  </h4>

                  <div className="space-y-3">
                    {(result.medicines || []).map(m => (
                      <div key={m.name} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                            {m.confidence} Confidence
                          </span>
                        </div>
                        <p className="text-slate-400"><strong className="text-slate-200">Generic:</strong> {m.genericName || 'N/A'}</p>
                        <p className="text-slate-400"><strong className="text-slate-200">Purpose:</strong> {m.purpose}</p>
                        
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                          <div><strong className="text-slate-400 block text-[9px] uppercase">Dosage</strong> {m.dosage}</div>
                          <div><strong className="text-slate-400 block text-[9px] uppercase">Timing</strong> {m.timing}</div>
                          <div><strong className="text-slate-400 block text-[9px] uppercase">Food Relation</strong> {m.relationToFood}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unreadable warning if any */}
                {result.unreadableSections && result.unreadableSections.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="w-4 h-4" /> Highlighted Handwriting Ambiguities:
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {result.unreadableSections.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Extracted Text Transcript Card */}
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Raw OCR Extracted Transcript
                  </h4>
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {result.extractedText}
                </pre>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileSearch className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Awaiting Prescription Upload</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Upload a prescription document or clear photo to extract recognized medications, dosage schedules, and food guidelines.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
