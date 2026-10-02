import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Radio, Shield, Waves } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface VoiceInterfaceProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  isPlayingAudio: boolean;
  status: string;
}

export default function VoiceInterface({
  isMicActive,
  onToggleMic,
  isPlayingAudio,
  status
}: VoiceInterfaceProps) {
  const [waveHeights, setWaveHeights] = useState<number[]>([30, 45, 60, 80, 45, 30, 65, 85, 40, 25, 55, 75, 45, 35]);

  // Audio wave pulse animation during active recording or playback
  useEffect(() => {
    if (!isMicActive && !isPlayingAudio) return;

    const interval = setInterval(() => {
      setWaveHeights(prev =>
        prev.map(() => Math.floor(Math.random() * (isPlayingAudio ? 80 : 50) + 20))
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isMicActive, isPlayingAudio]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-2xl">
      {/* Background glow orb */}
      <div 
        className={cn(
          "absolute -top-24 w-72 h-72 rounded-full blur-[90px] transition-all duration-700 pointer-events-none",
          isPlayingAudio 
            ? "bg-indigo-500/25 animate-pulse" 
            : isMicActive 
            ? "bg-emerald-500/20" 
            : "bg-slate-700/10"
        )} 
      />

      {/* Voice Visualizer Orb */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Animated Ripple Rings */}
        {(isMicActive || isPlayingAudio) && (
          <>
            <div className={cn(
              "absolute w-36 h-36 rounded-full border animate-ping opacity-25",
              isPlayingAudio ? "border-indigo-400" : "border-emerald-400"
            )} />
            <div className={cn(
              "absolute w-44 h-44 rounded-full border animate-pulse opacity-15",
              isPlayingAudio ? "border-cyan-400" : "border-teal-400"
            )} />
          </>
        )}

        <button
          onClick={onToggleMic}
          aria-label={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
          className={cn(
            "relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl transform active:scale-95 group",
            isMicActive
              ? isPlayingAudio
                ? "bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-indigo-500/40 ring-4 ring-indigo-400/30"
                : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-400/30"
              : "bg-slate-800 hover:bg-slate-750 text-slate-400 border border-white/10 hover:text-white"
          )}
        >
          {isMicActive ? (
            isPlayingAudio ? (
              <Volume2 className="w-9 h-9 animate-bounce" />
            ) : (
              <Mic className="w-9 h-9 animate-pulse" />
            )
          ) : (
            <MicOff className="w-9 h-9" />
          )}

          <span className="text-[10px] font-black uppercase tracking-wider mt-1">
            {isMicActive ? (isPlayingAudio ? "Speaking" : "Listening") : "Mic Muted"}
          </span>
        </button>
      </div>

      {/* Waveform graphic */}
      <div className="flex items-center gap-1.5 h-12 my-2 px-6">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full transition-all duration-150",
              isMicActive || isPlayingAudio
                ? isPlayingAudio 
                  ? "bg-gradient-to-t from-indigo-500 to-cyan-300"
                  : "bg-gradient-to-t from-emerald-500 to-teal-300"
                : "bg-slate-800 h-2"
            )}
            style={{
              height: isMicActive || isPlayingAudio ? `${h}%` : '6px'
            }}
          />
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-white/5 text-[11px] text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          {isMicActive 
            ? "MIC ACTIVE — Real-time 16kHz PCM stream" 
            : "MIC MUTED — Click button above to talk"}
        </span>
      </div>
    </div>
  );
}
