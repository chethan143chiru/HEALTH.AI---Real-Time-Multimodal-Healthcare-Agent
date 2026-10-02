import React, { useState } from 'react';
import { 
  Mic, MicOff, Camera, CameraOff, Send, Square, Play, Sparkles, VolumeX
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LiveControlsProps {
  isConnected: boolean;
  isMicActive: boolean;
  isCameraActive: boolean;
  isPlayingAudio: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onStopAudioPlayback: () => void;
  onSendText: (text: string) => void;
  onStartSession: () => void;
  onEndSession: () => void;
}

export default function LiveControls({
  isConnected,
  isMicActive,
  isCameraActive,
  isPlayingAudio,
  onToggleMic,
  onToggleCamera,
  onStopAudioPlayback,
  onSendText,
  onStartSession,
  onEndSession
}: LiveControlsProps) {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setInputText('');
  };

  return (
    <div className="rounded-3xl bg-slate-900/95 border border-white/10 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Toggle Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onToggleMic}
            disabled={!isConnected}
            aria-label={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40",
              isMicActive 
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20" 
                : "bg-slate-800 text-slate-400 hover:text-white border border-white/10"
            )}
            title="Toggle Microphone (Voice Input)"
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicActive ? "Mic On" : "Mic Muted"}</span>
          </button>

          <button
            onClick={onToggleCamera}
            disabled={!isConnected}
            aria-label={isCameraActive ? "Stop Camera" : "Start Camera"}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40",
              isCameraActive 
                ? "bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20" 
                : "bg-slate-800 text-slate-400 hover:text-white border border-white/10"
            )}
            title="Toggle Camera (Multimodal Vision)"
          >
            {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{isCameraActive ? "Camera On" : "Camera Off"}</span>
          </button>

          {isPlayingAudio && (
            <button
              onClick={onStopAudioPlayback}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all animate-pulse"
              title="Interrupt / Stop Agent Speaking"
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">Interrupt</span>
            </button>
          )}
        </div>

        {/* Text Input Bar */}
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder={isConnected ? "Speak naturally or type medical question here..." : "Start session to interact..."}
            disabled={!isConnected}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-40"
          />

          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:hover:bg-cyan-500 shadow-lg shadow-cyan-500/10"
            title="Send text query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Start / End Session CTA */}
        <div className="w-full sm:w-auto">
          {isConnected ? (
            <button
              onClick={onEndSession}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End Session</span>
            </button>
          ) : (
            <button
              onClick={onStartSession}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Live Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
