/**
 * HEALTH.AI Realtime Session Client Service
 * Manages WebSocket connection to /ws/live-health-agent,
 * message dispatch, streaming audio/video, and tool activity synchronization.
 */

export interface LiveTranscriptItem {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface LiveToolActivityItem {
  id: string;
  toolName: string;
  status: 'executing' | 'completed' | 'failed';
  startedAt: string;
  result?: any;
}

export interface EmergencyAlertData {
  isUrgent: boolean;
  title: string;
  description: string;
  hotlines: { label: string; number: string }[];
}

export class LiveSessionService {
  private ws: WebSocket | null = null;
  private isExplicitlyClosed: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  public onStatusChange?: (status: string, message?: string) => void;
  public onAudioReceived?: (base64Audio: string) => void;
  public onTranscriptReceived?: (item: LiveTranscriptItem) => void;
  public onToolStart?: (toolName: string, args: any) => void;
  public onToolResult?: (toolName: string, result: any) => void;
  public onEmergencyAlert?: (alert: EmergencyAlertData) => void;
  public onInterrupted?: () => void;

  constructor() {}

  public connect(userContext: {
    uid: string;
    name: string;
    email: string;
    /** Firebase ID token — verified server-side to derive the real identity. */
    idToken?: string;
    healthContext?: any;
  }): Promise<void> {
    this.isExplicitlyClosed = false;
    this.onStatusChange?.('CONNECTING', 'Initiating secure realtime health channel...');

    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/live-health-agent`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.onStatusChange?.('CONNECTED', 'Live Health Agent online and listening.');

          // Send initialization handshake with the verified ID token.
          // The server derives identity from this token, not from these fields.
          this.send({
            type: 'init',
            idToken: userContext.idToken,
            user: {
              uid: userContext.uid,
              name: userContext.name,
              email: userContext.email
            },
            healthContext: userContext.healthContext || {}
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (e: any) {
            console.warn("[LiveSessionService] Incoming message parse error:", e.message);
          }
        };

        this.ws.onclose = () => {
          if (!this.isExplicitlyClosed) {
            this.handleReconnect(userContext);
          } else {
            this.onStatusChange?.('DISCONNECTED', 'Session cleanly closed.');
          }
        };

        this.ws.onerror = (err) => {
          console.warn("[LiveSessionService] Socket error:", err);
          if (!this.isExplicitlyClosed) {
            this.onStatusChange?.('RECONNECTING', 'Network jitter detected. Reconnecting...');
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleServerMessage(data: any) {
    switch (data.type) {
      case 'session_ready':
      case 'agent_status':
        this.onStatusChange?.(data.status || 'CONNECTED', data.message);
        break;

      case 'audio':
        if (data.data && this.onAudioReceived) {
          this.onAudioReceived(data.data);
        }
        break;

      case 'transcript':
        if (data.text && this.onTranscriptReceived) {
          this.onTranscriptReceived({
            id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            role: data.role || 'agent',
            text: data.text,
            timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        break;

      case 'tool_start':
        this.onStatusChange?.('PROCESSING', `Invoking tool: ${data.tool}...`);
        this.onToolStart?.(data.tool, data.args);
        break;

      case 'tool_result':
        this.onStatusChange?.('RESPONDING', `Synthesizing ${data.tool} results...`);
        this.onToolResult?.(data.tool, data.result);
        break;

      case 'interrupted':
        this.onInterrupted?.();
        break;

      case 'emergency_alert':
        if (data.alert && this.onEmergencyAlert) {
          this.onEmergencyAlert(data.alert);
        }
        break;

      default:
        break;
    }
  }

  public sendAudioChunk(base64Pcm16: string) {
    this.send({ type: 'audio', data: base64Pcm16 });
  }

  public sendVideoFrame(base64Jpeg: string) {
    this.send({ type: 'video', data: base64Jpeg });
  }

  public sendTextMessage(text: string) {
    this.send({ type: 'text', data: text });
    if (this.onTranscriptReceived) {
      this.onTranscriptReceived({
        id: `tr-user-${Date.now()}`,
        role: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  private send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private handleReconnect(userContext: any) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.onStatusChange?.('RECONNECTING', `Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      setTimeout(() => {
        this.connect(userContext).catch(() => {});
      }, 2000);
    } else {
      this.onStatusChange?.('DISCONNECTED', 'Connection lost. Please click Reconnect.');
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.send({ type: 'end_session' });
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChange?.('DISCONNECTED', 'Session ended.');
  }
}
