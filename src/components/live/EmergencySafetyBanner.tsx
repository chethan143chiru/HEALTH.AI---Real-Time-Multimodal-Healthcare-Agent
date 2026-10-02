import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { EmergencyAlertData } from '@/src/services/liveSessionService';

interface EmergencySafetyBannerProps {
  alert: EmergencyAlertData;
  onDismiss: () => void;
}

export default function EmergencySafetyBanner({ alert, onDismiss }: EmergencySafetyBannerProps) {
  if (!alert.isUrgent) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-950/90 border-2 border-rose-500/80 p-5 shadow-2xl shadow-rose-950/80 animate-in fade-in slide-in-from-top-4 relative my-4">
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 text-rose-300 hover:text-white p-1 rounded-lg bg-rose-900/40 hover:bg-rose-900"
        title="Dismiss Alert"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center flex-shrink-0 text-rose-400">
          <AlertOctagon className="w-7 h-7 animate-pulse text-rose-300" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-rose-200 tracking-wider uppercase">
              {alert.title}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-extrabold text-[10px]">
              TRIAGE LEVEL 1
            </span>
          </div>

          <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
            {alert.description}
          </p>

          <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Contacts:
            </span>

            {alert.hotlines?.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number}`}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>{h.label}:</span>
                <span className="text-amber-300">{h.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
