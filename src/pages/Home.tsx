import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, Brain, Shield, ArrowRight, Activity, 
  Sparkles, CheckCircle2, Star, Users, Phone, Mail, MapPin,
  ChevronRight, PlayCircle, Globe, Award, Zap, MessageSquare, Send, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import heroImage from '../assets/images/ai_health_hologram_1780391849950.png';

export default function Home() {
  const navigate = useNavigate();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: 'Active Users', value: '50,000+', icon: Users },
    { label: 'AI Accuracy', value: '98.4%', icon: Zap },
    { label: 'Clinical Data', value: '55M+', icon: Globe },
    { label: 'Secure Reports', value: '1M+', icon: Shield },
  ];

  const coreFeatures = [
    {
      title: "Diagnostic Intelligence",
      desc: "Advanced neural networks capable of identifying 2,000+ medical conditions with high precision.",
      icon: Brain,
      color: "bg-blue-500"
    },
    {
      title: "Secure Vault",
      desc: "Your data is encrypted using military-grade AES-256 protocols, ensuring complete medical confidentiality.",
      icon: Shield,
      color: "bg-emerald-500"
    },
    {
      title: "Real-time Insights",
      desc: "Get instant risk assessment scores and clinical recommendations in milliseconds.",
      icon: Activity,
      color: "bg-amber-500"
    }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAssistantChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          healthContext: { userName: 'Visitor' }
        })
      });
      const data = await res.json();
      const aiText = data.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);

      // Save feedback/message to Firestore
      await addDoc(collection(db, 'feedback'), {
        message: userMessage,
        aiResponse: aiText,
        createdAt: serverTimestamp(),
        type: 'chatbot_interaction'
      }).catch(() => {});

    } catch (err) {
      console.error("Assistant Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having some trouble connecting. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-0 relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Trusted by 50,000+ Professionals
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tightest leading-none">
              Your Health, <br />
              <span className="text-blue-500">AI Empowered.</span>
            </h1>
            
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-xl">
              Experience the future of preventative medicine. Our AI-driven platform provides instant clinical insights, secure medical history tracking, and intelligent health monitoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth" className="btn-primary flex items-center justify-center gap-3 py-4 px-10 text-lg group">
                Begin Analysis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => navigate('/about')}
                className="flex items-center justify-center gap-3 px-10 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold"
              >
                <PlayCircle className="w-5 h-5" /> How it Works
              </button>
            </div>

            <div className="flex items-center gap-6 pt-10 border-t border-white/5">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" alt="User" />
                  ))}
               </div>
               <div>
                  <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1 italic">"The most accurate AI health assistant I've used."</p>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
             <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
             <div className="glass-card relative z-10 p-4 border-2 border-blue-500/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src={heroImage} 
                  className="rounded-xl w-full h-full object-cover aspect-square grayscale hover:grayscale-0 transition-all duration-700"
                  alt="AI Health App"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-10 -left-10 glass-card p-6 shadow-2xl">
                   <HeartPulse className="w-10 h-10 text-blue-500 mb-2" />
                   <div className="text-xl font-black">98.4%</div>
                   <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Precision Score</div>
                </div>
                <div className="absolute bottom-10 -right-10 glass-card p-6 shadow-2xl animate-pulse">
                   <Activity className="w-10 h-10 text-emerald-500 mb-2" />
                   <div className="text-xl font-black">Live</div>
                   <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">System Health</div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                 <stat.icon className="w-8 h-8 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                 <div className="text-4xl font-black font-display mb-1">{stat.value}</div>
                 <div className="text-xs uppercase font-black tracking-widest text-slate-500">{stat.label}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
               <h2 className="text-4xl md:text-6xl font-black font-display tracking-tightest">Advanced Medical <span className="text-blue-500">Core.</span></h2>
               <p className="text-slate-500 max-w-2xl mx-auto">Our modular architecture combines multiple specialist AI agents into one cohesive diagnostic engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {coreFeatures.map((f, i) => (
                 <div key={i} className="glass-card p-12 border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform", f.color)}>
                       <f.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                    <div className="pt-8">
                       <button 
                        onClick={() => navigate('/about')}
                        className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 group-hover:gap-4 transition-all"
                       >
                          View details <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10" />
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative rounded-3xl overflow-hidden glass-card p-2 border-2 border-white/5">
                <img src="https://picsum.photos/seed/tech/800/800" className="rounded-2xl w-full" alt="Tech" />
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center">
                   <div className="glass-card p-10 max-w-sm text-center">
                      <Award className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-black mb-4">Certified Intelligence</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 leading-relaxed">Health.ai meets global medical technology standards for decision support systems.</p>
                   </div>
                </div>
            </div>
            <div className="space-y-8">
               <h2 className="text-5xl font-black font-display tracking-tightest">Democratizing Global <span className="text-blue-500">Wellness.</span></h2>
               <p className="text-slate-500 leading-relaxed text-lg">
                  We believe that advanced medical diagnostics shouldn't be a luxury. Our platform is built to provide high-level health insights to everyone, regardless of their location or socioeconomic status.
               </p>
               <div className="space-y-4">
                  {[
                    "AI-Driven Diagnostic Assistance",
                    "Voice-Activated Symptom Logging",
                    "Global Health Trend Analysis",
                    "Seamless Doctor Handoff Reports"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 group-hover:text-white" />
                       </div>
                       <span className="font-bold text-slate-400">{item}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Platform Summary Footer */}
      <section className="py-20 bg-slate-950/50 border-t border-white/5 px-6">
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black font-display text-white">Ready for a healthier tomorrow?</h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base">
              Experience the power of real-time clinical AI diagnostics, multimodal screening, and continuous health intelligence.
            </p>
          </div>
        </section>

      {/* AI Assistant Chat Bubble */}
      <div className="fixed bottom-12 right-6 z-[100]">
        <AnimatePresence>
          {isAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-80 md:w-96 glass-card border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-brand-primary p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">Health.ai Assistant</span>
                </div>
                <button onClick={() => setIsAssistantOpen(false)} className="hover:bg-white/10 p-1 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-10">
                    Hello! How can I help you today? You can ask about our system or leave feedback.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[80%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      m.role === 'user' ? "bg-brand-primary text-white" : "bg-white/10 text-slate-300"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-1 items-center p-2 text-slate-500">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleAssistantChat} className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                />
                <button type="submit" className="p-2 bg-brand-primary rounded-xl text-white hover:opacity-90 active:scale-95 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white relative z-50 group overflow-hidden"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
          {isAssistantOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}
