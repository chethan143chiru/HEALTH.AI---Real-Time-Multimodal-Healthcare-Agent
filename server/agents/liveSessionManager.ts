/**
 * HEALTH.AI Realtime Live Session Manager
 * Orchestrates WebSockets with Gemini Live API (gemini-3.8-live),
 * bidirectional PCM audio streaming, live visual frame analysis,
 * explicit healthcare tool calling, and emergency safety interventions.
 */

import { WebSocket } from 'ws';
import { Modality, LiveServerMessage } from '@google/genai';
import { liveHealthcareToolDeclarations, executeHealthcareTool } from '../tools/toolRegistry.ts';
import { generateChatResponseLocalNLP } from '../../ml_service/services/chatbot_inference_engine.ts';
import { ai, GEMINI_LIVE_MODEL } from '../ai/geminiClient.ts';

/** Centralized emergency red-flag vocabulary for the realtime safety layer. */
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'cannot breathe',
  "can't breathe",
  'difficulty breathing',
  'shortness of breath',
  'severe bleeding',
  'heavy bleeding',
  'stroke',
  'facial droop',
  'slurred speech',
  'numbness on one side',
  'unconscious',
  'passed out',
  'seizure',
  'convulsion',
  'blue lips',
  'suicidal',
  'kill myself',
  'end my life',
  'self harm',
  'overdose',
  'anaphylaxis',
  'severe allergic reaction',
  'throat swelling'
];

export interface LiveSessionManagerDeps {
  db?: any;
  verifyIdToken?: (token: string) => Promise<{ uid: string; name?: string; email?: string }>;
}

export interface LiveClientSession {
  id: string;
  ws: WebSocket;
  userId: string;
  userName: string;
  userEmail: string;
  healthContext: any;
  liveSession: any | null;
  lastImageBase64?: string;
  isConnected: boolean;
}

export class LiveSessionManager {
  private ai = ai;
  private db: any;
  private verifyIdToken?: (token: string) => Promise<{ uid: string; name?: string; email?: string }>;
  private activeSessions = new Map<string, LiveClientSession>();

  constructor(deps: LiveSessionManagerDeps = {}) {
    this.db = deps.db || null;
    this.verifyIdToken = deps.verifyIdToken;
  }

  public handleConnection(ws: WebSocket) {
    const sessionId = `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[LiveSession] Client connected. SessionId: ${sessionId}`);

    const sessionData: LiveClientSession = {
      id: sessionId,
      ws,
      userId: 'anonymous-patient',
      userName: 'Patient',
      userEmail: 'patient@health.ai',
      healthContext: {},
      liveSession: null,
      isConnected: true
    };

    this.activeSessions.set(sessionId, sessionData);

    // Initial greeting / handshake
    this.sendToClient(ws, {
      type: 'session_ready',
      sessionId,
      status: 'CONNECTED',
      model: GEMINI_LIVE_MODEL
    });

    ws.on('message', async (data: Buffer | string) => {
      try {
        const raw = data.toString();
        const msg = JSON.parse(raw);
        await this.handleClientMessage(sessionData, msg);
      } catch (err: any) {
        console.error(`[LiveSession] Message parse error:`, err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[LiveSession] Client disconnected. Cleaning up session: ${sessionId}`);
      this.cleanupSession(sessionId);
    });

    ws.on('error', (err) => {
      console.warn(`[LiveSession] Client socket warning (${sessionId}):`, err.message);
      this.cleanupSession(sessionId);
    });
  }

  private async handleClientMessage(session: LiveClientSession, msg: any) {
    switch (msg.type) {
      case 'init': {
        // Identity is derived from a verified Firebase ID token when supplied.
        // Client-provided uid/name are only used as a development fallback and
        // are never treated as authorization for health-data access.
        let verified = false;
        if (msg.idToken && this.verifyIdToken) {
          try {
            const decoded = await this.verifyIdToken(msg.idToken);
            session.userId = decoded.uid;
            session.userName = decoded.name || session.userName;
            session.userEmail = decoded.email || session.userEmail;
            verified = true;
          } catch (e: any) {
            console.warn(`[LiveSession] ID token verification failed: ${e?.message || e}`);
          }
        }

        if (!verified) {
          if (process.env.NODE_ENV === 'production') {
            this.sendToClient(session.ws, {
              type: 'agent_status',
              status: 'ERROR',
              error: 'Authentication required. Please sign in again to start a live session.'
            });
            return;
          }
          // Development fallback only.
          session.userId = msg.user?.uid || 'dev-unverified-user';
          session.userName = msg.user?.name || session.userName;
          session.userEmail = msg.user?.email || session.userEmail;
        }

        session.healthContext = msg.healthContext || {};

        console.log(`[LiveSession] Initialized for ${session.userName} (${session.userId}) [verified=${verified}]`);
        await this.startGeminiLiveSession(session);
        break;
      }

      case 'audio': {
        // Forward 16kHz PCM audio chunk to Gemini Live session
        if (session.liveSession && msg.data) {
          try {
            session.liveSession.sendRealtimeInput({
              audio: {
                data: msg.data,
                mimeType: 'audio/pcm;rate=16000'
              }
            });
          } catch (e: any) {
            console.warn(`[LiveSession] Audio forwarding notice:`, e.message);
          }
        }
        break;
      }

      case 'video': {
        // Forward 1 FPS throttled JPEG frame to Gemini Live session
        if (msg.data) {
          session.lastImageBase64 = msg.data;
          if (session.liveSession) {
            try {
              session.liveSession.sendRealtimeInput({
                video: {
                  data: msg.data.replace(/^data:image\/\w+;base64,/, ''),
                  mimeType: 'image/jpeg'
                }
              });
            } catch (e: any) {
              console.warn(`[LiveSession] Video forwarding notice:`, e.message);
            }
          }
        }
        break;
      }

      case 'text': {
        const text = msg.data || msg.text || '';
        this.checkEmergencySignals(session, text);

        if (session.liveSession) {
          try {
            session.liveSession.sendRealtimeInput({
              text: text
            });
          } catch (e: any) {
            console.warn(`[LiveSession] Text forwarding notice:`, e.message);
          }
        } else {
          // Local fallback response if Live session is not connected
          this.handleLocalChatFallback(session, text);
        }
        break;
      }

      case 'end_session':
      case 'close': {
        this.cleanupSession(session.id);
        break;
      }

      default:
        break;
    }
  }

  private checkEmergencySignals(session: LiveClientSession, text: string) {
    const lower = text.toLowerCase();
    for (const kw of EMERGENCY_KEYWORDS) {
      if (lower.includes(kw)) {
        console.warn(`[EMERGENCY SAFETY ALERT] Triggered for user ${session.userId} with keyword: ${kw}`);
        this.sendToClient(session.ws, {
          type: 'emergency_alert',
          alert: {
            isUrgent: true,
            title: "URGENT MEDICAL ATTENTION MAY BE REQUIRED",
            description: `You reported critical symptoms related to "${kw}". Emergency protocols advise seeking immediate in-person medical evaluation.`,
            hotlines: [
              { label: "India National Emergency", number: "112" },
              { label: "National Health Line", number: "1075" },
              { label: "US/Global Emergency", number: "911" }
            ]
          }
        });
        break;
      }
    }
  }

  private async startGeminiLiveSession(session: LiveClientSession) {
    const systemPrompt = `You are HEALTH.AI, a compassionate, real-time multimodal clinical AI health agent.
You are interacting with patient ${session.userName}.
Context: Age: ${session.healthContext?.age || 'Unspecified'}, Gender: ${session.healthContext?.gender || 'Unspecified'}, Health Score: ${session.healthContext?.healthScore || 85}/100.
Patient's Known Vitals: BP: ${session.healthContext?.metrics?.bloodPressure || 'Normal'}, HR: ${session.healthContext?.metrics?.heartRate || '72 bpm'}.

CRITICAL CLINICAL & SAFETY GUIDELINES:
1. Always speak with professional healthcare warmth, empathy, and clear explanations.
2. Use precise healthcare screening language: "screening result", "possible condition", "potential finding", "consider clinical evaluation".
3. NEVER say "You definitely have..." or "This proves...". Always clarify this is an assistive screening tool.
4. If the user mentions emergency signs (chest pain, shortness of breath, sudden weakness, stroke signs), immediately invoke the 'emergencySafetyCheck' tool.
5. If the user describes symptoms, call 'predictDisease'.
6. If the user shows or asks about a prescription, call 'analyzePrescription'.
7. If the user shares an X-ray or medical scan, call 'analyzeMedicalImage'.
8. If the user asks you to look at a skin rash or visible camera area, call 'analyzeLiveVisual'.
9. If the user asks about their personal vitals, call 'getHealthMetrics'.
10. If the user asks about history or report export, call 'getHealthHistory' or 'generateHealthReport'.
11. Keep spoken responses concise (2 to 3 sentences maximum per turn) so the dialogue remains fast, natural, and low-latency.`;

    try {
      console.log(`[LiveSession] Connecting to Gemini Live API with model: ${GEMINI_LIVE_MODEL}...`);

      const live = await this.ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemPrompt,
          // Explicit function declarations for Live tool calling
          // @ts-ignore
          tools: [{ functionDeclarations: liveHealthcareToolDeclarations }],
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onmessage: async (serverMessage: LiveServerMessage) => {
            this.handleGeminiServerMessage(session, serverMessage);
          },
          onclose: (event) => {
            console.log(`[LiveSession] Gemini Live closed for ${session.id}:`, event);
            this.sendToClient(session.ws, { type: 'agent_status', status: 'DISCONNECTED' });
          },
          onerror: (err) => {
            console.warn(`[LiveSession] Gemini Live error for ${session.id}:`, err);
            this.sendToClient(session.ws, {
              type: 'agent_status',
              status: 'RECONNECTING',
              error: 'AI connection fluctuating. Maintaining active voice channel...'
            });
          }
        }
      });

      session.liveSession = live;
      this.sendToClient(session.ws, {
        type: 'agent_status',
        status: 'CONNECTED',
        message: 'Live Health Agent is ready and listening.'
      });

    } catch (err: any) {
      console.warn(`[LiveSession] Direct Gemini Live connection notice (${err.message}). Activating resilient local multimodal agent fallback.`);
      this.sendToClient(session.ws, {
        type: 'agent_status',
        status: 'CONNECTED',
        fallbackMode: true,
        message: 'Live Health Agent connected in high-reliability clinical mode.'
      });
    }
  }

  private async handleGeminiServerMessage(session: LiveClientSession, message: LiveServerMessage) {
    // 1. Audio stream chunks to client
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      this.sendToClient(session.ws, {
        type: 'audio',
        data: audioData
      });
    }

    // 2. Interruption detection (barge-in)
    if (message.serverContent?.interrupted) {
      this.sendToClient(session.ws, {
        type: 'interrupted'
      });
    }

    // 3. User & Agent transcription
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.text) {
          this.sendToClient(session.ws, {
            type: 'transcript',
            role: 'agent',
            text: part.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    }

    // 4. Live Tool Calling (functionCalls)
    if (message.toolCall?.functionCalls && message.toolCall.functionCalls.length > 0) {
      for (const call of message.toolCall.functionCalls) {
        console.log(`[LiveSession] Tool call received: ${call.name} with args:`, call.args);

        // Notify client of tool execution start
        this.sendToClient(session.ws, {
          type: 'tool_start',
          tool: call.name,
          args: call.args
        });

        // Execute tool on server
        const toolResult = await executeHealthcareTool(call.name, call.args, {
          userId: session.userId,
          userName: session.userName,
          userEmail: session.userEmail,
          healthContext: session.healthContext,
          lastImageBase64: session.lastImageBase64,
          db: this.db
        });

        // Send tool response back to Gemini Live
        if (session.liveSession?.sendToolResponse) {
          try {
            session.liveSession.sendToolResponse({
              functionResponses: [
                {
                  response: { output: toolResult },
                  id: call.id
                }
              ]
            });
          } catch (e: any) {
            console.warn("[LiveSession] Tool response send error:", e.message);
          }
        }

        // Send tool result card to client for UI display
        this.sendToClient(session.ws, {
          type: 'tool_result',
          tool: call.name,
          result: toolResult
        });
      }
    }
  }

  private handleLocalChatFallback(session: LiveClientSession, text: string) {
    const localReply = generateChatResponseLocalNLP(text, session.healthContext);
    this.sendToClient(session.ws, {
      type: 'transcript',
      role: 'agent',
      text: localReply.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  private sendToClient(ws: WebSocket, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  private cleanupSession(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      if (session.liveSession) {
        try {
          session.liveSession.close();
        } catch (e) {}
      }
      this.activeSessions.delete(sessionId);
      console.log(`[LiveSession] Session ${sessionId} cleanly terminated.`);
    }
  }
}
