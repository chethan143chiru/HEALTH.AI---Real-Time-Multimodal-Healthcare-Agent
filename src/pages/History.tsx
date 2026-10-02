import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History as HistoryIcon, Download, Trash2, Calendar, 
  Activity, ArrowRight, ShieldCheck, ChevronRight, FileDown, X, Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PredictionResult from '@/src/components/PredictionResult';
import { auth, db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;

      if (activeUser) {
        const uid = activeUser.uid || activeUser.id;
        try {
          const q = query(
            collection(db, 'predictions'), 
            where('userId', '==', uid)
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || 0).getTime();
            const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || 0).getTime();
            return dateB - dateA;
          });
          setHistory(data);
        } catch (err) {
          console.error("Fetch history error:", err);
          // Fallback to local if needed, but Firestore is priority
          const local = JSON.parse(localStorage.getItem('medicalHistory') || '[]');
          setHistory(local);
        }
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this medical record?")) {
      try {
        await deleteDoc(doc(db, 'predictions', id));
        setHistory(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        // Fallback local delete
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('medicalHistory', JSON.stringify(updated));
      }
    }
  };

  const handleDownload = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const prediction = record.result;
    const bmiResult = record.bmi;
    
    if (!prediction) return;

    const sanitizedProbability = typeof prediction.probability === 'number' ? (prediction.probability > 1 ? prediction.probability / 100 : prediction.probability) : 0.85;
    const sanitizedScore = typeof prediction.score === 'number' ? prediction.score : 75;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("HEALTH.AI MEDICAL REPORT", 15, 25);
    doc.setFontSize(10);
    doc.text(`Reference: ${record.id} | Date: ${new Date(record.createdAt?.seconds * 1000 || record.date).toLocaleString()}`, 15, 33);
    
    // Disease Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("Diagnostic Analysis", 15, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Category', 'Details']],
      body: [
        ['Predicted Disease', prediction.disease || 'N/A'],
        ['Probability', `${(sanitizedProbability * 100).toFixed(1)}%`],
        ['Risk Level', prediction.risk || 'N/A'],
        ['Health Score', `${sanitizedScore}/100`],
        ['Symptoms', record.symptoms?.join(", ") || 'N/A'],
      ],
      theme: 'grid',
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // BMI Section
    if (bmiResult) {
      doc.setFontSize(18);
      doc.text("Vitals & BMI", 15, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Metric', 'Value', 'Category']],
        body: [
          ['BMI Value', bmiResult.value.toString(), bmiResult.category?.label || 'N/A'],
        ],
        theme: 'striped',
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Recommendations
    doc.setFontSize(18);
    doc.text("Recommendations", 15, currentY);
    doc.setFontSize(11);
    const splitRecommendations = doc.splitTextToSize(prediction.recommendations || "No recommendations provided.", pageWidth - 30);
    doc.text(splitRecommendations, 15, currentY + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("DISCLAIMER: This report is generated by an AI assistant and should not replace professional medical advice.", 15, doc.internal.pageSize.getHeight() - 10);

    doc.save(`Health_AI_Report_${(prediction.disease || 'Result').replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5 text-brand-primary" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Secure Medical Vault</span>
           </div>
           <h1 className="text-5xl font-black font-display tracking-tightest">Activity <span className="text-gradient">History.</span></h1>
        </div>
        
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5">
           <ShieldCheck className="w-4 h-4 text-brand-primary" />
           <span className="text-xs font-bold text-white/40">Data Encrypted & Private</span>
        </div>
      </div>

      <div className="space-y-6">
        {history.length > 0 ? history.map((record, i) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedRecord(record)}
            className="group glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-white/[0.07] transition-all cursor-pointer border border-white/5 hover:border-brand-primary/20"
          >
            <div className="flex items-center gap-8 w-full md:w-auto">
               <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 min-w-[100px]">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-primary/60 mb-1">
                    {new Date(record.createdAt?.seconds * 1000 || record.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-3xl font-black font-display leading-none">
                    {new Date(record.createdAt?.seconds * 1000 || record.date).getDate()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-white/20 mt-1">
                    {new Date(record.createdAt?.seconds * 1000 || record.date).getFullYear()}
                  </span>
               </div>

               <div>
                 <div className="flex items-center gap-3 mb-1">
                   <div className={cn("w-2 h-2 rounded-full", 
                     record.result?.risk === 'High' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : 
                     record.result?.risk === 'Medium' ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : 
                     "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                   )} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{record.result?.risk || 'Low'} Risk Assessment</span>
                 </div>
                 <h3 className="text-2xl font-black mb-2">{record.result?.disease || 'Diagnostic Report'}</h3>
                 <div className="flex flex-wrap items-center gap-3">
                    {record.bmi && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">BMI</span>
                         <span className={cn("text-xs font-black", record.bmi.category?.color || "text-emerald-400")}>
                           {record.bmi.value}
                         </span>
                      </div>
                    )}
                    {record.bmi && <div className="w-1 h-1 rounded-full bg-white/10" />}
                    <div className="flex flex-wrap gap-2">
                       {record.symptoms?.map((s: string) => (
                         <span key={s} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-medium text-white/40 border border-white/5">{s}</span>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
               <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 leading-none">AI Score</span>
                  <div className={cn("text-3xl font-black font-display", 
                    (record.result?.score || 0) > 70 ? "text-emerald-400" : (record.result?.score || 0) > 40 ? "text-amber-400" : "text-red-400"
                  )}>{record.result?.score || 0}</div>
               </div>

               <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDownload(record, e)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary/20 hover:border-brand-primary/40 hover:text-brand-primary transition-all group/btn shadow-lg"
                    title="Download Report"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(record.id, e)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-500 transition-all group/btn shadow-lg"
                    title="Delete Record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="h-12 px-6 rounded-xl bg-white/10 flex items-center gap-2 font-bold text-sm hover:bg-white/20 transition-all">
                     View Full Analysis <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center opacity-40">
             <HistoryIcon className="w-16 h-16 mb-4" />
             <h3 className="text-xl font-bold">No Records Found</h3>
             <p className="text-sm">Start your first analysis on the dashboard.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative"
            >
              <button 
                onClick={() => setSelectedRecord(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <PredictionResult data={selectedRecord.result} onDownload={() => handleDownload(selectedRecord, { stopPropagation: () => {} } as any)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
