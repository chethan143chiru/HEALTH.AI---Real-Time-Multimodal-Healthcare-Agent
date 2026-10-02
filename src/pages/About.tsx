import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, Sparkles, BrainCircuit, ShieldCheck, 
  Target, HeartPulse, Microscope, Activity,
  Phone, Mail, MapPin, ExternalLink, Globe, Database
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function About() {
  const features = [
    {
      title: "Advanced AI Diagnostics",
      desc: "Our system utilizes 300+ machine learning models trained on millions of clinical data points to provide instant, high-accuracy disease predictions based on user-reported symptoms.",
      icon: BrainCircuit,
    },
    {
      title: "Secure Medical Vault",
      desc: "Patient privacy is our top priority. We use end-to-end encryption for all medical records and adhere to global HIPAA and GDPR standards for data protection.",
      icon: ShieldCheck,
    },
    {
      title: "Real-time Wellness Monitoring",
      desc: "Continuously track your health metrics, mood, and daily activities to receive personalized wellness tips and early warning signs.",
      icon: Activity,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-24 mt-12 mb-24">
      {/* Introduction Section */}
      <section className="text-center space-y-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.5 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest"
        >
           <Sparkles className="w-3 h-3" /> Redefining Healthcare
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black font-display tracking-tightest leading-none">
          What is <span className="text-blue-500">Health.ai?</span>
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
           <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
             Health.ai is a next-generation AI Health Prediction System designed to bridge the gap between initial symptoms and professional medical consultation. We combine cutting-edge artificial intelligence with clinical medical logic to empower individuals with instant, data-driven health insights.
           </p>
           <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
             Our mission is to democratize high-level medical intelligence, making diagnostic assistance accessible to everyone, anywhere, at any time. By analyzing complex symptom patterns, we help users understand their health risks and take proactive steps toward recovery.
           </p>
        </div>
      </section>

      {/* Why Collaborative AI? */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         <div className="space-y-8">
            <h2 className="text-4xl font-black font-display tracking-tighter">Why Collaborative AI?</h2>
            <div className="space-y-6">
               {[
                 { title: "Instant Analysis", text: "No waiting rooms. Get a clinically backed assessment in seconds." },
                 { title: "2000+ Symptoms", text: "From common colds to rare metabolic conditions, our AI covers it all." },
                 { title: "Actionable Insights", text: "Get more than just a name; receive dietary advice and doctor tips." }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-400">{item.title}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="glass-card relative overflow-hidden group p-12">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Microscope className="w-48 h-48" />
            </div>
            <div className="relative z-10">
               <blockquote className="text-2xl font-bold font-display italic text-slate-400 leading-normal mb-8">
                 "Our goal is not to replace doctors, but to provide them with better-informed patients and provide patients with the confidence to seek the right help early."
               </blockquote>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 p-0.5">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Medic" className="w-full h-full rounded-full bg-slate-900" alt="Founder" />
                  </div>
                  <div>
                     <div className="font-bold">Team Health.ai</div>
                     <div className="text-xs text-slate-500 uppercase tracking-widest font-black">Clinical Engineering Group</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Core Technology */}
      <section className="space-y-12">
         <div className="text-center">
            <h2 className="text-4xl font-black font-display tracking-tight uppercase">The Technology Stack</h2>
            <p className="text-slate-500 mt-2">Built on the world's most advanced AI infrastructure.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {features.map((f, i) => (
             <div key={i} className="glass-card p-10 hover:border-blue-500/50 transition-all group">
                <f.icon className="w-12 h-12 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
             </div>
           ))}
         </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Symptoms Cataloged', value: '2,000+', icon: Globe },
          { label: 'Accuracy Rating', value: '98.2%', icon: Target },
          { label: 'Datasets Analyzed', value: '55M+', icon: Database },
          { label: 'Active Users', value: '50k+', icon: Activity }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 text-center space-y-2">
             <stat.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
             <div className="text-3xl font-black font-display">{stat.value}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Quick Team Access */}
      <section className="glass-card p-12 bg-blue-500/5 border-blue-500/20 text-center space-y-12">
         <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black font-display tracking-tight">Need dedicated support?</h2>
            <p className="text-slate-500 leading-relaxed uppercase tracking-widest text-xs font-bold">Our engineering and medical team is available 24/7 to ensure system integrity.</p>
         </div>
         <div className="flex flex-wrap justify-center gap-8">
            <a href="tel:+919900399845" className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors font-bold group">
               <Phone className="w-4 h-4" /> +91 99003 99845 <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </a>
            <a href="mailto:contact@health.ai" className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors font-bold group">
               <Mail className="w-4 h-4" /> contact@health.ai <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=Pandavapura" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors font-bold group">
               <MapPin className="w-4 h-4" /> India Development Hub <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </a>
         </div>
      </section>
    </div>
  );
}
