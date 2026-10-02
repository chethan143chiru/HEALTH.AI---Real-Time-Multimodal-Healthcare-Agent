import React, { useRef, useEffect } from 'react';
import { MessageSquare, Bot, User, Copy, Check, Trash2, Sparkles } from 'lucide-react';
import { LiveTranscriptItem } from '@/src/services/liveSessionService';
import { cn } from '@/src/lib/utils';

interface LiveTranscriptProps {
  transcript: LiveTranscriptItem[];
  onClearTranscript: () => void;
  onSendPresetMessage: (text: string) => void;
}

export default function LiveTranscript({
  transcript,
  onClearTranscript,
  onSendPresetMessage
}: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 flex flex-col h-[400px] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Health Dialogue</h4>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">
            {transcript.length} turns
          </span>
        </div>

        {transcript.length > 0 && (
          <button
            onClick={onClearTranscript}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
            title="Clear transcript"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-xs font-bold text-slate-300 mb-1">Live Multimodal Health Channel</p>
            <p className="text-[11px] text-slate-500 max-w-xs mb-4">
              Speak naturally via microphone or pick a starter query below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm text-left">
              {[
                "I've had a fever and cough for three days.",
                "Can you review my recent health metrics?",
                "Analyze this prescription for side effects.",
                "Look at this skin condition on my camera."
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPresetMessage(query)}
                  className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-300 text-left transition-all leading-tight"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          transcript.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2",
                item.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                  item.role === 'user'
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                )}
              >
                {item.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-3 border",
                  item.role === 'user'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-slate-200 rounded-tr-sm"
                    : "bg-slate-950 border-white/10 text-slate-200 rounded-tl-sm"
                )}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    {item.role === 'user' ? 'You' : 'HEALTH.AI Agent'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{item.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
