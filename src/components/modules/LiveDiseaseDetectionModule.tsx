import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, RefreshCw, ShieldAlert, Check, X, Download, AlertTriangle, Eye, Sparkles, Loader2, Video, SwitchCamera 
} from 'lucide-react';
import { LiveCameraAnalysisResult } from '@/src/types/health';
import { liveDiseaseDetectionAPI } from '@/src/lib/api';
import { generateLiveScanPDF } from '@/src/lib/pdfGenerator';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface LiveDiseaseDetectionModuleProps {
  userName?: string;
  onAnalysisComplete?: (result: LiveCameraAnalysisResult) => void;
}

const CONDITION_FOCUS_AREAS = [
  "Skin Rash / Redness",
  "Acne / Pimples",
  "Eczema / Dry Scaly Patch",
  "Psoriasis / Silver Scales",
  "Ringworm / Fungal Ring",
  "Minor Burn / Scald",
  "Cut / Superficial Wound",
  "Nail Discoloration",
  "Eye Redness / Irritation",
  "General Surface Condition"
];

export default function LiveDiseaseDetectionModule({ userName = 'User', onAnalysisComplete }: LiveDiseaseDetectionModuleProps) {
  // Safety Modal state
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(true);

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState("Skin Rash / Redness");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing camera vision...');
  const [result, setResult] = useState<LiveCameraAnalysisResult | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      alert("Unable to access camera device. Please grant camera permission or use photo upload.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  useEffect(() => {
    if (safetyAccepted && !capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [facingMode, safetyAccepted]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  const handleAnalyzeCapturedPhoto = async () => {
    if (!capturedImage) return;
    setLoading(true);

    const steps = [
      "Performing lighting & sharpness quality check...",
      "Extracting epidermal surface patterns...",
      "Mapping visual lesion coordinates...",
      "Synthesizing care guidance & red flags..."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setLoadingStep(steps[idx % steps.length]);
      idx++;
    }, 1200);

    try {
      const analysis = await liveDiseaseDetectionAPI(capturedImage, 'image/jpeg', focusArea);
      analysis.id = `live-${Date.now()}`;
      analysis.createdAt = new Date().toISOString();
      analysis.capturedImageUrl = capturedImage;

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
          type: 'live_camera_scan',
          result: analysis,
          createdAt: serverTimestamp()
        }).catch(err => console.warn("Firestore save warning:", err));
      }

    } catch (err: any) {
      console.error("Live Camera Analysis Error:", err);
      alert(err.message || "Failed to analyze camera photo.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Safety Modal */}
      {showSafetyModal && !safetyAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-display uppercase tracking-tight">Camera Safety Notice</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This feature uses device camera captures to analyze visible skin or surface external conditions (Acne, Eczema, Rash, Burns, etc.) for decision support.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <li>Ensure proper lighting and sharp focus.</li>
              <li>Keep camera 10–15cm away from affected skin.</li>
              <li>AI scans are educational and not a clinical diagnosis.</li>
            </ul>

            <button
              onClick={() => {
                setSafetyAccepted(true);
                setShowSafetyModal(false);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 shadow-lg shadow-pink-500/20"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">AI Live Disease Detection</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-[10px] font-bold uppercase tracking-widest">
                LIVE VISION V2.0
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Real-time camera capture for visible skin rash, acne, eczema, psoriasis, and external lesion detection.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera Feed / Captured Image */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Condition Focus Area</label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-pink-500/50"
              >
                {CONDITION_FOCUS_AREAS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Camera Feed / Image Viewer Frame */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-white/10 h-80 flex items-center justify-center">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {streamActive && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button 
                        onClick={toggleCamera} 
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-white hover:text-pink-400 transition-colors" 
                        title="Switch Camera"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {/* Target Crosshair */}
                  <div className="absolute w-48 h-48 border-2 border-dashed border-pink-400/60 rounded-3xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-bold text-pink-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-pink-400/40">
                      Center Skin Lesion Here
                    </span>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={capturedImage}
                    alt="Captured lesion photo"
                    className="w-full h-full object-cover"
                  />

                  {/* AI Annotations overlay box */}
                  {result?.annotations && result.annotations.map(ann => (
                    <div
                      key={ann.id}
                      className="absolute border-2 border-pink-400 bg-pink-500/20 rounded-lg p-1 pointer-events-none text-[9px] font-bold text-pink-200"
                      style={{
                        left: `${ann.x - ann.width/2}%`,
                        top: `${ann.y - ann.height/2}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`
                      }}
                    >
                      <span className="bg-pink-950/90 px-1 py-0.5 rounded border border-pink-400">{ann.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Photo</span>
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <button
                  disabled={loading}
                  onClick={handleAnalyzeCapturedPhoto}
                  className="flex-1 py-3.5 rounded-2xl bg-pink-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-pink-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{loadingStep}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Photo</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Findings & Educational Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in">
              
              <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                      CATEGORY: {result.conditionCategory}
                    </span>
                    <h3 className="text-xl font-black text-white font-display mt-2">
                      Confidence Level: {result.confidenceLevel}
                    </h3>
                  </div>

                  <button
                    onClick={() => generateLiveScanPDF(result, userName)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold text-xs hover:bg-pink-500/20 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" /> PDF Report
                  </button>
                </div>

                {/* Educational Analysis */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                  <span className="font-bold text-pink-400 uppercase text-[10px] tracking-wider">Educational Finding:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">{result.educationalExplanation}</p>
                </div>

                {/* Possible Conditions */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Possible External Condition Matches ({result.possibleConditions?.length || 0})
                  </h4>

                  <div className="space-y-2">
                    {(result.possibleConditions || []).map(c => (
                      <div key={c.condition} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white text-sm">{c.condition}</div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{c.overview}</p>
                        </div>
                        <span className="text-sm font-black text-pink-400 font-display shrink-0 ml-4">{c.relativeConfidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Red Flags / Urgent Warning Signs */}
                <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-2">
                  <div className="font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Urgent Warning Signs:
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {(result.urgentWarningSigns || []).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Camera className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Awaiting Camera Capture</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Click "Capture Photo" above to snapshot any visible skin condition or surface lesion for educational AI detection.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
