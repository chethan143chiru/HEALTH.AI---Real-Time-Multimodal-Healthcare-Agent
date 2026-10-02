import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, Loader2, RefreshCw, Trash2, HeartPulse, Stethoscope, Brain, Cpu 
} from 'lucide-react';
import { chatHealthAssistantAPI } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

interface AIHealthAssistantModuleProps {
  userProfile: any;
  healthMetrics: any;
  latestPrediction?: any;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  engine?: string;
  engineLabel?: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  "What do my current BMI & blood pressure numbers indicate?",
  "Can you explain the difference between viral and bacterial fever?",
  "What dietary modifications help manage elevated cholesterol?",
  "How should I prepare for a routine annual health checkup?"
];

export default function AIHealthAssistantModule({
  userProfile,
  healthMetrics,
  latestPrediction
}: AIHealthAssistantModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${userProfile?.name || 'there'}! I am your AI Health Companion. I have real-time context over your vitals (BMI ${healthMetrics?.bmi || 'N/A'}, BP ${healthMetrics?.bloodPressureSystolic || '120'}/${healthMetrics?.bloodPressureDiastolic || '80'}) and latest diagnostic history. How can I assist your health journey today?`,
      engine: 'gemini_ai',
      engineLabel: 'Gemini 3.7 Flash AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enginePreference, setEnginePreference] = useState<'auto' | 'gemini' | 'nlp'>('auto');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const healthContext = {
        userProfile,
        healthMetrics,
        latestPrediction
      };

      const history = [...messages, userMsg].slice(-6);
      const res = await chatHealthAssistantAPI(query, healthContext, history, enginePreference);

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        engine: res.engine,
        engineLabel: res.engineLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: "I am experiencing temporary network latency. Please try sending your question again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Conversation reset. How else can I help you, ${userProfile?.name || 'Patient'}?`,
        engine: 'gemini_ai',
        engineLabel: 'Gemini 3.7 Flash AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight font-display">AI Health Buddy Assistant</h2>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Ask any medical questions or request advice tailored to your active vitals & health records.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 transition-colors shrink-0"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl flex flex-col h-[550px]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map(m => (
            <div
              key={m.id}
              className={cn(
                "flex gap-3 max-w-2xl text-xs leading-relaxed",
                m.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                m.sender === 'user' ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold" : "bg-teal-500/20 text-teal-400 border-teal-500/30"
              )}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={cn(
                "p-4 rounded-3xl border space-y-1",
                m.sender === 'user'
                  ? "bg-emerald-500/10 border-emerald-500/30 text-white rounded-tr-none"
                  : "bg-slate-950/80 border-white/10 text-slate-200 rounded-tl-none"
              )}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className="text-[9px] text-slate-500 block text-right mt-1">{m.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-md mr-auto text-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 text-teal-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Health Assistant is reasoning...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="py-3 border-t border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Prompts:</span>
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-teal-500/40 text-[11px] font-semibold shrink-0 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your health question (e.g. explain fever remedies, BP numbers)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500/50 transition-all"
          />
          <button
            disabled={!input.trim() || loading}
            onClick={() => handleSend()}
            className="p-3.5 rounded-2xl bg-teal-500 text-slate-950 hover:bg-teal-400 disabled:opacity-40 transition-all font-bold shadow-lg shadow-teal-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
