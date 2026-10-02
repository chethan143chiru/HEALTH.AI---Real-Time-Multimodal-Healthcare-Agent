import React, { useState, useEffect } from 'react';
import { 
  History, Search, Download, Trash2, Eye, FileText, Stethoscope, FileSearch, Image as ImageIcon, Camera, Calendar, X 
} from 'lucide-react';
import { 
  generateDiseasePDF, generatePrescriptionPDF, generateMedicalImagePDF, generateLiveScanPDF 
} from '@/src/lib/pdfGenerator';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface ReportsHistoryModuleProps {
  userName?: string;
  onSelectReport?: (report: any) => void;
}

export default function ReportsHistoryModule({ userName = 'User' }: ReportsHistoryModuleProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportDetail, setSelectedReportDetail] = useState<any | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    let loaded: any[] = [];

    // LocalStorage backup history
    const local = JSON.parse(localStorage.getItem('medicalHistory') || '[]');
    loaded = [...local];

    // Firestore query if logged in
    try {
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;

      if (activeUser) {
        const q = query(
          collection(db, 'predictions'),
          where('userId', '==', activeUser.uid || activeUser.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          const item = data.result || data;
          item.firestoreId = docSnap.id;
          if (!loaded.some(l => l.id === item.id)) {
            loaded.push(item);
          }
        });
      }
    } catch (err) {
      console.warn("Firestore history query warning:", err);
    }

    setReports(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this report from history?")) return;

    if (item.firestoreId) {
      await deleteDoc(doc(db, 'predictions', item.firestoreId)).catch(() => {});
    }

    const updated = reports.filter(r => r.id !== item.id);
    setReports(updated);
    localStorage.setItem('medicalHistory', JSON.stringify(updated));
  };

  const handleDownloadPDF = (item: any) => {
    if (item.primaryDisease || item.topDiseases) {
      generateDiseasePDF(item, userName);
    } else if (item.medicines) {
      generatePrescriptionPDF(item, userName);
    } else if (item.imageType && item.primaryInterpretation) {
      generateMedicalImagePDF(item, userName);
    } else if (item.conditionCategory) {
      generateLiveScanPDF(item, userName);
    } else {
      alert("PDF generator not configured for this format.");
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterType === 'predict' && !r.primaryDisease) return false;
    if (filterType === 'prescription' && !r.medicines) return false;
    if (filterType === 'medical_image' && !r.imageType) return false;
    if (filterType === 'live_camera' && !r.conditionCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleStr = (r.primaryDisease || r.doctorName || r.imageType || r.conditionCategory || '').toLowerCase();
      return titleStr.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Detail Modal */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl text-white space-y-6 custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black font-display text-emerald-400">
                {selectedReportDetail.primaryDisease || selectedReportDetail.doctorName || selectedReportDetail.imageType || selectedReportDetail.conditionCategory || 'Medical Report Detail'}
              </h3>
              <button onClick={() => setSelectedReportDetail(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(selectedReportDetail, null, 2)}
            </pre>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => handleDownloadPDF(selectedReportDetail)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">Medical Reports & History Hub</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                RECORDS REPOSITORY
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Centralized repository of past AI disease predictions, OCR prescriptions, medical images, and live camera scans.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'predict', label: 'Disease Predictions' },
              { id: 'prescription', label: 'Prescription OCR' },
              { id: 'medical_image', label: 'Radiology Scans' },
              { id: 'live_camera', label: 'Live Camera Scans' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all",
                  filterType === tab.id ? "bg-indigo-500 text-slate-950" : "bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50"
            />
          </div>

        </div>

      </div>

      {/* Reports Grid / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading records repository...</div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-12 text-center text-slate-400 text-xs">
            No report records found in history.
          </div>
        ) : (
          filteredReports.map(item => {
            const isPredict = !!item.primaryDisease;
            const isPrescription = !!item.medicines;
            const isMedicalImg = !!item.imageType && !!item.primaryInterpretation;
            const isLiveScan = !!item.conditionCategory;

            return (
              <div 
                key={item.id}
                className="p-5 rounded-3xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-3 rounded-2xl border shrink-0",
                    isPredict ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                    isPrescription ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    isMedicalImg ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : "bg-pink-500/10 text-pink-400 border-pink-500/30"
                  )}>
                    {isPredict && <Stethoscope className="w-5 h-5" />}
                    {isPrescription && <FileSearch className="w-5 h-5" />}
                    {isMedicalImg && <ImageIcon className="w-5 h-5" />}
                    {isLiveScan && <Camera className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {item.primaryDisease || (item.doctorName ? `Doctor: ${item.doctorName}` : item.imageType) || item.conditionCategory || 'Scan Report'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[9px] font-bold border border-white/10">
                        {isPredict ? 'Disease Prediction' : isPrescription ? 'Prescription OCR' : isMedicalImg ? 'Medical Image' : 'Live Camera'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {item.reasoningSummary || item.extractedText || item.primaryInterpretation || item.educationalExplanation || ''}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedReportDetail(item)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="View Raw Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(item)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
