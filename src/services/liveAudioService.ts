/**
 * HEALTH.AI Realtime Audio Service
 * Captures 16kHz raw PCM little-endian audio for Gemini Live API input.
 * Plays 24kHz raw PCM audio chunks gaplessly with real-time barge-in interruption.
 */

export class LiveAudioService {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private nextStartTime: number = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  public isRecording: boolean = false;
  public isPlaying: boolean = false;

  private onAudioDataCallback: ((base64Pcm: string) => void) | null = null;

  constructor() {}

  /**
   * Initializes microphone capture and streams 16kHz PCM chunks
   */
  public async startRecording(onAudioData: (base64Pcm: string) => void): Promise<void> {
    this.onAudioDataCallback = onAudioData;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Target 16kHz AudioContext for recording
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioContext = new AudioCtx({ sampleRate: 16000 });
      this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);

      // ScriptProcessor with 2048 buffer size gives ~128ms chunks at 16kHz
      this.processorNode = this.inputAudioContext.createScriptProcessor(2048, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = this.float32ToPcm16(inputData);
        const base64 = this.arrayBufferToBase64(pcm16.buffer);
        if (this.onAudioDataCallback) {
          this.onAudioDataCallback(base64);
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.inputAudioContext.destination);
      this.isRecording = true;
    } catch (err: any) {
      console.error("[LiveAudioService] Failed to initialize microphone:", err);
      throw new Error(err.message || "Microphone access denied or unavailable.");
    }
  }

  /**
   * Stops recording and releases microphone track resources
   */
  public stopRecording(): void {
    this.isRecording = false;
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      this.inputAudioContext.close().catch(() => {});
      this.inputAudioContext = null;
    }
  }

  /**
   * Plays incoming 24kHz PCM audio chunks from Gemini Live model turn
   */
  public playAudioChunk(base64Pcm: string): void {
    try {
      if (!this.outputAudioContext || this.outputAudioContext.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      }

      if (this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume().catch(() => {});
      }

      const pcmBytes = this.base64ToArrayBuffer(base64Pcm);
      const float32Data = this.pcm16ToFloat32(new Int16Array(pcmBytes));

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      // Schedule gapless playback
      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.isPlaying = true;

      this.activeSourceNodes.push(source);

      source.onended = () => {
        const idx = this.activeSourceNodes.indexOf(source);
        if (idx !== -1) {
          this.activeSourceNodes.splice(idx, 1);
        }
        if (this.activeSourceNodes.length === 0) {
          this.isPlaying = false;
        }
      };
    } catch (err: any) {
      console.warn("[LiveAudioService] Playback chunk error:", err.message);
    }
  }

  /**
   * Immediate interruption (barge-in): stops all active and scheduled audio nodes
   */
  public stopPlayback(): void {
    this.isPlaying = false;
    for (const source of this.activeSourceNodes) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    }
    this.activeSourceNodes = [];
    if (this.outputAudioContext) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  /**
   * Full cleanup on session end
   */
  public cleanup(): void {
    this.stopRecording();
    this.stopPlayback();
    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      this.outputAudioContext.close().catch(() => {});
      this.outputAudioContext = null;
    }
  }

  // --- Audio Format Conversion Utilities ---

  private float32ToPcm16(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private pcm16ToFloat32(input: Int16Array): Float32Array {
    const output = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] / 32768.0;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
