import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Video, Eye, EyeOff, Upload, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CameraInterfaceProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onFrameCaptured: (base64Jpeg: string) => void;
  onImageUploaded: (base64Data: string, mimeType: string, name: string) => void;
}

export default function CameraInterface({
  isCameraActive,
  onToggleCamera,
  onFrameCaptured,
  onImageUploaded
}: CameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);

  // Initialize or cleanup video stream when camera state changes
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      .then((s) => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
        setIsSampling(true);
      })
      .catch((err) => {
        console.error("[CameraInterface] Camera access failed:", err);
      });
    } else {
      setIsSampling(false);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraActive]);

  // Periodic 1 FPS frame sampling for Live Gemini Multimodal Vision
  useEffect(() => {
    if (!isSampling || !isCameraActive) return;

    const interval = setInterval(() => {
      captureFrame();
    }, 1200); // ~1 frame every 1.2 seconds to satisfy the 1 FPS limit

    return () => clearInterval(interval);
  }, [isSampling, isCameraActive]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = 480;
    canvas.height = (video.videoHeight / video.videoWidth) * 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      onFrameCaptured(dataUrl);
      setLastSnapshot(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onImageUploaded(result, file.type, file.name);
        setLastSnapshot(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 flex flex-col justify-between shadow-2xl overflow-hidden relative">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multimodal Vision</h4>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              CAMERA LIVE
            </span>
          )}

          <button
            onClick={onToggleCamera}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              isCameraActive 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30" 
                : "bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-750"
            )}
          >
            {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isCameraActive ? "Stop Camera" : "Start Camera"}</span>
          </button>
        </div>
      </div>

      {/* Camera / Video Viewport */}
      <div className="relative aspect-video rounded-2xl bg-slate-950 border border-white/5 overflow-hidden flex items-center justify-center">
        {isCameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover mirror"
          />
        ) : lastSnapshot ? (
          <div className="relative w-full h-full">
            <img src={lastSnapshot} alt="Last Snapshot" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold border border-white/20">
                Last Captured Frame
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <EyeOff className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Camera is currently inactive</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Click Start Camera to show a prescription, skin condition, or medical scan to HEALTH.AI.
            </p>
          </div>
        )}

        {isCameraActive && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-white/80 font-mono">
              1 FPS Multimodal Feed
            </span>
          </div>
        )}
      </div>

      {/* Action Strip: Snapshot & Upload File */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {isCameraActive ? (
          <button
            onClick={captureFrame}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Send Snapshot</span>
          </button>
        ) : (
          <button
            onClick={onToggleCamera}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Enable Camera</span>
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload Image</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
