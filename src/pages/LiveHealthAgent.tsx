import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Activity, ShieldCheck, Download, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AgentStatus from '@/src/components/live/AgentStatus';
import VoiceInterface from '@/src/components/live/VoiceInterface';
import CameraInterface from '@/src/components/live/CameraInterface';
import LiveTranscript from '@/src/components/live/LiveTranscript';
import ToolActivityPanel from '@/src/components/live/ToolActivityPanel';
import HealthContextPanel from '@/src/components/live/HealthContextPanel';
import EmergencySafetyBanner from '@/src/components/live/EmergencySafetyBanner';
import LiveResultsPanel from '@/src/components/live/LiveResultsPanel';
import LiveControls from '@/src/components/live/LiveControls';
import { LiveAudioService } from '@/src/services/liveAudioService';
import { 
  LiveSessionService, 
  LiveTranscriptItem, 
  LiveToolActivityItem, 
  EmergencyAlertData 
} from '@/src/services/liveSessionService';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateDiseasePDF } from '@/src/lib/pdfGenerator';

export default function LiveHealthAgent() {
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to start live session.');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const [transcript, setTranscript] = useState<LiveTranscriptItem[]>([]);
  const [toolActivities, setToolActivities] = useState<LiveToolActivityItem[]>([]);
  const [toolResults, setToolResults] = useState<{ tool: string; result: any; timestamp: string }[]>([]);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlertData | null>(null);

  // User & Health Context — populated only from the authenticated user's real
  // records. No vitals are invented when none have been recorded.
  const [userProfile, setUserProfile] = useState<any>(null);
  const [healthContext, setHealthContext] = useState<any>({});

  const audioServiceRef = useRef<LiveAudioService | null>(null);
  const sessionServiceRef = useRef<LiveSessionService | null>(null);

  // Initialize service singletons on mount
  useEffect(() => {
    let cancelled = false;

    // 1. Resolve active user
    const fbUser = auth.currentUser;
    const bypassUserStr = localStorage.getItem('authBypassUser');
    let bypassUser: any = null;
    try { bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null; } catch { bypassUser = null; }
    const active = fbUser || bypassUser;
    if (!active) return;
    setUserProfile(active);

    // 1b. Load the user's real recorded vitals from Firestore (never fabricated)
    const loadRealHealthContext = async (): Promise<any> => {
      try {
        const uid = active.uid || active.id;
        if (!uid) return {};
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return {};
        const data: any = snap.data();
        const metrics = data.healthMetrics || data.metrics || data.vitals || null;
        return {
          ...(metrics ? { metrics } : {}),
          ...(typeof data.healthScore === 'number' ? { healthScore: data.healthScore } : {})
        };
      } catch (e) {
        console.warn('[LiveHealthAgent] Health context load notice:', e);
        return {};
      }
    };

    let resolvedHealthContext: any = {};
    loadRealHealthContext().then(ctx => {
      resolvedHealthContext = ctx;
      if (!cancelled) setHealthContext(ctx);
    });

    // 2. Initialize audio service
    const audioService = new LiveAudioService();
    audioServiceRef.current = audioService;

    // 3. Initialize live session service
    const sessionService = new LiveSessionService();
    sessionServiceRef.current = sessionService;

    sessionService.onStatusChange = (newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMessage(msg);
    };

    sessionService.onAudioReceived = (base64Audio) => {
      audioService.playAudioChunk(base64Audio);
      setIsPlayingAudio(true);
    };

    sessionService.onTranscriptReceived = (item) => {
      setTranscript(prev => [...prev, item]);
    };

    sessionService.onToolStart = (toolName, args) => {
      const newAct: LiveToolActivityItem = {
        id: `act-${Date.now()}`,
        toolName,
        status: 'executing',
        startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setToolActivities(prev => [newAct, ...prev.slice(0, 7)]);
    };

    sessionService.onToolResult = (toolName, result) => {
      setToolActivities(prev =>
        prev.map(a => a.toolName === toolName && a.status === 'executing' ? { ...a, status: 'completed', result } : a)
      );

      setToolResults(prev => [
        {
          tool: toolName,
          result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    };

    sessionService.onEmergencyAlert = (alertData) => {
      setEmergencyAlert(alertData);
    };

    sessionService.onInterrupted = () => {
      audioService.stopPlayback();
      setIsPlayingAudio(false);
    };

    // Auto-start session for immediate interactive experience
    const bootSession = async () => {
      const ctx = await loadRealHealthContext();
      if (cancelled) return;
      resolvedHealthContext = ctx;
      setHealthContext(ctx);
      await handleStartSession(active, sessionService, ctx);
    };
    bootSession();

    return () => {
      cancelled = true;
      audioService.cleanup();
      sessionService.disconnect();
    };
  }, []);

  const handleStartSession = async (userToUse?: any, serviceToUse?: LiveSessionService, contextToUse?: any) => {
    const svc = serviceToUse || sessionServiceRef.current;
    const u = userToUse || userProfile;
    if (!svc || !u) return;

    // Verified identity: the server trusts this Firebase ID token, not the uid field.
    let idToken: string | undefined;
    try {
      idToken = (await auth.currentUser?.getIdToken()) || undefined;
    } catch (err) {
      console.warn('[LiveHealthAgent] ID token retrieval notice:', err);
    }

    try {
      await svc.connect({
        uid: u.uid || u.id,
        name: u.displayName || u.name || 'Patient',
        email: u.email || '',
        idToken,
        healthContext: contextToUse || healthContext
      });

      // Enable microphone by default after connection
      if (audioServiceRef.current) {
        await audioServiceRef.current.startRecording((base64Pcm) => {
          svc.sendAudioChunk(base64Pcm);
        });
        setIsMicActive(true);
      }
    } catch (err: any) {
      console.warn("[LiveHealthAgent] Connect notice:", err.message);
    }
  };

  const handleEndSession = () => {
    audioServiceRef.current?.cleanup();
    sessionServiceRef.current?.disconnect();
    setIsMicActive(false);
    setIsCameraActive(false);
    setIsPlayingAudio(false);
    setStatus('DISCONNECTED');
    setStatusMessage('Live session ended. Media devices released.');
  };

  const handleToggleMic = async () => {
    if (!audioServiceRef.current || !sessionServiceRef.current) return;

    if (isMicActive) {
      audioServiceRef.current.stopRecording();
      setIsMicActive(false);
    } else {
      try {
        await audioServiceRef.current.startRecording((base64Pcm) => {
          sessionServiceRef.current?.sendAudioChunk(base64Pcm);
        });
        setIsMicActive(true);
      } catch (err: any) {
        alert("Microphone permission required for real-time voice mode.");
      }
    }
  };

  const handleToggleCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  const handleFrameCaptured = (base64Jpeg: string) => {
    sessionServiceRef.current?.sendVideoFrame(base64Jpeg);
  };

  const handleImageUploaded = (base64Data: string, mimeType: string, name: string) => {
    // Send image to live agent session and add user transcript item
    sessionServiceRef.current?.sendVideoFrame(base64Data);
    sessionServiceRef.current?.sendTextMessage(`I have uploaded a medical file: ${name}. Please review it.`);
  };

  const handleSendText = (text: string) => {
    sessionServiceRef.current?.sendTextMessage(text);
  };

  const handleStopAudioPlayback = () => {
    audioServiceRef.current?.stopPlayback();
    setIsPlayingAudio(false);
  };

  const handleClearTranscript = () => {
    setTranscript([]);
  };

  const handleExportPDF = () => {
    const latestDiseaseResult = toolResults.find(r => r.tool === 'predictDisease')?.result?.data;
    if (latestDiseaseResult) {
      generateDiseasePDF(latestDiseaseResult, userProfile?.name || 'Verified Patient');
    } else {
      alert("No diagnostic screening result available to export yet. Ask the agent to screen symptoms first!");
    }
  };

  const isConnected = status !== 'DISCONNECTED' && status !== 'ERROR';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard"
              className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all group"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight font-display">
                  LIVE HEALTH AGENT
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                  PS05 Real-Time Multimodal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bidirectional voice, live video vision, clinical differential screening, and intelligent healthcare tool calling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {toolResults.length > 0 && (
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Report PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <AgentStatus 
          status={status} 
          message={statusMessage} 
        />

        {/* Emergency Safety Alert Banner */}
        {emergencyAlert && (
          <EmergencySafetyBanner 
            alert={emergencyAlert} 
            onDismiss={() => setEmergencyAlert(null)} 
          />
        )}

        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Voice Visualizer & Multimodal Camera (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <VoiceInterface
              isMicActive={isMicActive}
              onToggleMic={handleToggleMic}
              isPlayingAudio={isPlayingAudio}
              status={status}
            />

            <CameraInterface
              isCameraActive={isCameraActive}
              onToggleCamera={handleToggleCamera}
              onFrameCaptured={handleFrameCaptured}
              onImageUploaded={handleImageUploaded}
            />

            <HealthContextPanel 
              user={userProfile} 
              healthContext={healthContext} 
            />
          </div>

          {/* Right Column: Live Transcript, Tool Activity, & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <LiveTranscript
              transcript={transcript}
              onClearTranscript={handleClearTranscript}
              onSendPresetMessage={handleSendText}
            />

            <ToolActivityPanel 
              activities={toolActivities} 
            />

            <LiveResultsPanel 
              toolResults={toolResults} 
              onExportReport={handleExportPDF} 
            />
          </div>

        </div>

        {/* Bottom Floating Control Bar */}
        <div className="sticky bottom-6 z-40">
          <LiveControls
            isConnected={isConnected}
            isMicActive={isMicActive}
            isCameraActive={isCameraActive}
            isPlayingAudio={isPlayingAudio}
            onToggleMic={handleToggleMic}
            onToggleCamera={handleToggleCamera}
            onStopAudioPlayback={handleStopAudioPlayback}
            onSendText={handleSendText}
            onStartSession={() => handleStartSession()}
            onEndSession={handleEndSession}
          />
        </div>

      </div>
    </div>
  );
}
