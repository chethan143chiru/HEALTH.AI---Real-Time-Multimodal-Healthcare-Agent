import React, { useState } from 'react';
import { 
  Radio, Send, AlertTriangle, CheckCircle2, Info, Bell, Trash2, 
  Users, Calendar, Clock, ShieldCheck 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MOCK_BROADCASTS } from '@/src/data/mockAdminData';
import { BroadcastAnnouncement } from '@/src/types/admin';

interface BroadcastCenterTabProps {
  onAuditLog: (action: string, details: string) => void;
}

export default function BroadcastCenterTab({ onAuditLog }: BroadcastCenterTabProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>(MOCK_BROADCASTS);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'alert' | 'success'>('info');
  const [targetAudience, setTargetAudience] = useState<'all' | 'verified' | 'unverified' | 'active' | 'inactive'>('all');

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newBrd: BroadcastAnnouncement = {
      id: `brd-${Date.now()}`,
      title,
      message,
      type,
      targetAudience,
      author: 'Super Administrator',
      createdAt: new Date().toISOString(),
      isPublished: true,
      deliveryCount: 1980,
      readCount: 0
    };

    setBroadcasts(prev => [newBrd, ...prev]);
    onAuditLog('PUBLISH_BROADCAST', `Published system broadcast announcement: "${title}" to target "${targetAudience}"`);
    
    setTitle('');
    setMessage('');
    alert('System announcement published successfully! Banner active on patient dashboards.');
  };

  const handleDeleteBroadcast = (id: string, brdTitle: string) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
    onAuditLog('DELETE_BROADCAST', `Retired broadcast announcement: "${brdTitle}"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">Broadcast Center & System Announcements</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] uppercase tracking-widest">
              Live Messaging
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Publish health awareness campaigns, emergency alerts, or scheduled maintenance notices to user dashboards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PUBLISH FORM */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" /> Create New Announcement
          </h3>

          <form onSubmit={handlePublishBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 uppercase">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Seasonal Flu Vaccination Screening Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 uppercase">Message Content</label>
              <textarea
                placeholder="Detailed announcement instructions for patients..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 uppercase">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  <option value="info">🔵 Information</option>
                  <option value="warning">🟡 Maintenance Warning</option>
                  <option value="alert">🔴 Emergency Alert</option>
                  <option value="success">🟢 Health Tips</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  <option value="all">All Patients (1,980)</option>
                  <option value="verified">Verified Users Only</option>
                  <option value="unverified">Unverified Users Only</option>
                  <option value="active">Active Online Patients</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Send className="w-4 h-4" /> Publish Broadcast Now
            </button>
          </form>
        </div>

        {/* BROADCAST HISTORY TABLE */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" /> Active System Broadcast History
          </h3>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {broadcasts.map((brd) => (
              <div key={brd.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                      brd.type === 'info' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                      brd.type === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      brd.type === 'alert' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {brd.type}
                    </span>
                    <h4 className="text-xs font-bold text-white">{brd.title}</h4>
                  </div>

                  <button
                    onClick={() => handleDeleteBroadcast(brd.id, brd.title)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Retire Broadcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{brd.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
                  <span>Author: {brd.author}</span>
                  <span>Target: {brd.targetAudience.toUpperCase()} ({brd.deliveryCount} delivered)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
