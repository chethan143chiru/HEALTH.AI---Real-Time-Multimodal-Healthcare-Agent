import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '@/src/components/dashboard/TopNavbar';
import WelcomeBanner from '@/src/components/dashboard/WelcomeBanner';
import HealthOverviewPanel from '@/src/components/dashboard/HealthOverviewPanel';
import QuickActionPanel from '@/src/components/dashboard/QuickActionPanel';
import PersonalizedInsights from '@/src/components/dashboard/PersonalizedInsights';
import UniversalSearchModal from '@/src/components/dashboard/UniversalSearchModal';

// AI Modules
import DiseasePredictionModule from '@/src/components/modules/DiseasePredictionModule';
import PrescriptionAnalyzerModule from '@/src/components/modules/PrescriptionAnalyzerModule';
import MedicalImageAnalyzerModule from '@/src/components/modules/MedicalImageAnalyzerModule';
import LiveDiseaseDetectionModule from '@/src/components/modules/LiveDiseaseDetectionModule';
import MyHealthMetricsModule from '@/src/components/modules/MyHealthMetricsModule';
import AIHealthAssistantModule from '@/src/components/modules/AIHealthAssistantModule';
import ReportsHistoryModule from '@/src/components/modules/ReportsHistoryModule';
import HealthAnalyticsModule from '@/src/components/modules/HealthAnalyticsModule';

import { UserHealthMetrics, HealthNotification } from '@/src/types/health';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { logUserActivity } from '@/src/lib/activity';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Active module tab
  const [activeModule, setActiveModule] = useState<string>('overview');

  // Universal Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [preselectedSymptom, setPreselectedSymptom] = useState<string | null>(null);

  // User Vitals & Metrics State
  const [healthMetrics, setHealthMetrics] = useState<UserHealthMetrics>({
    heightCm: 175,
    weightKg: 72,
    bmi: 23.5,
    bmiCategory: 'Normal weight',
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    bloodSugarMgDl: 95,
    cholesterolMgDl: 185,
    heartRateBpm: 72,
    oxygenSatPercent: 98,
    lastUpdated: new Date().toISOString()
  });

  const [healthScore, setHealthScore] = useState<number>(92);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [totalPredictionsCount, setTotalPredictionsCount] = useState<number>(0);

  // Notifications
  const [notifications, setNotifications] = useState<HealthNotification[]>([
    {
      id: 'n1',
      title: 'Welcome to HEALTH.AI',
      message: 'Your AI Patient Workspace is active with comprehensive diagnostic tools.',
      timestamp: 'Just now',
      isRead: false,
      type: 'system'
    },
    {
      id: 'n2',
      title: 'Vitals Status Check',
      message: 'Your current BMI index of 23.5 sits in the optimal normal range.',
      timestamp: '1 hour ago',
      isRead: false,
      type: 'recommendation'
    }
  ]);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const fbUser = auth.currentUser;
      const bypassStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassStr ? JSON.parse(bypassStr) : null;

      const active = fbUser || bypassUser;
      if (active) {
        try {
          const uDoc = await getDoc(doc(db, 'users', active.uid || active.id));
          if (uDoc.exists()) {
            setUser({ ...active, ...uDoc.data() });
          } else {
            setUser(active);
          }
        } catch (e) {
          setUser(active);
        }
      }

      // Check local history
      const localHistory = JSON.parse(localStorage.getItem('medicalHistory') || '[]');
      setTotalPredictionsCount(localHistory.length);
      if (localHistory.length > 0) {
        setLatestPrediction(localHistory[0]);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authBypassUser');
    localStorage.removeItem('health_ai_admin_auth');
    sessionStorage.clear();
    try {
      if (user) {
        const uid = user.uid || user.id;
        const name = user.displayName || user.name || 'User';
        logUserActivity(uid, name, 'logout', 'User explicitly signed out of the dashboard session').catch(() => {});
      }
      signOut(auth).catch(() => {});
    } catch (e) {
      console.warn("Logout notice:", e);
    }
    window.location.href = '/';
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handlePredictionComplete = (result: any) => {
    setLatestPrediction(result);
    setTotalPredictionsCount(prev => prev + 1);
    
    // Add notification
    const newNotif: HealthNotification = {
      id: `notif-${Date.now()}`,
      title: 'New AI Diagnostic Generated',
      message: `Diagnostic result for ${result.primaryDisease || 'Condition'} has been saved to history.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSaveMetrics = (updated: UserHealthMetrics) => {
    setHealthMetrics(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      
      {/* Sticky Top Navbar */}
      <TopNavbar
        user={user}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAssistant={() => setActiveModule('assistant')}
        onOpenProfile={() => navigate('/profile')}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Module Sub-Header Navigation if not overview */}
        {activeModule !== 'overview' && (
          <div className="mb-6 flex items-center justify-between bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => {
                setActiveModule('overview');
                setPreselectedSymptom(null);
              }}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard Overview
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Active Module:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase">
                {activeModule.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Module Render */}
        {activeModule === 'overview' && (
          <>
            <WelcomeBanner user={user} healthScore={healthScore} />
            
            <HealthOverviewPanel
              user={user}
              healthMetrics={healthMetrics}
              healthScore={healthScore}
              totalPredictionsCount={totalPredictionsCount}
              latestPredictionName={latestPrediction?.primaryDisease || latestPrediction?.disease || 'No recent scans'}
              onEditMetrics={() => setActiveModule('vitals')}
            />

            <QuickActionPanel
              activeModule={activeModule}
              setActiveModule={setActiveModule}
            />

            <PersonalizedInsights
              healthMetrics={healthMetrics}
              latestPrediction={latestPrediction}
              onOpenModule={(mod) => setActiveModule(mod)}
            />
          </>
        )}

        {/* Part 3: AI Disease Prediction (500+ Symptoms & Explainable AI) */}
        {activeModule === 'predict' && (
          <DiseasePredictionModule
            userProfile={user}
            healthMetrics={healthMetrics}
            onPredictionComplete={handlePredictionComplete}
            preselectedSymptom={preselectedSymptom}
          />
        )}

        {/* Part 4: AI Prescription OCR Analyzer */}
        {activeModule === 'prescription' && (
          <PrescriptionAnalyzerModule
            userName={user?.name || 'Patient'}
            onAnalysisComplete={handlePredictionComplete}
          />
        )}

        {/* Part 5: AI Medical Image Analyzer (Radiology) */}
        {activeModule === 'medical_image' && (
          <MedicalImageAnalyzerModule
            userName={user?.name || 'Patient'}
            onAnalysisComplete={handlePredictionComplete}
          />
        )}

        {/* Part 6: AI Live Disease Detection (Camera) */}
        {activeModule === 'live_camera' && (
          <LiveDiseaseDetectionModule
            userName={user?.name || 'Patient'}
            onAnalysisComplete={handlePredictionComplete}
          />
        )}

        {/* My Health Vitals */}
        {activeModule === 'vitals' && (
          <MyHealthMetricsModule
            metrics={healthMetrics}
            onSaveMetrics={handleSaveMetrics}
          />
        )}

        {/* AI Health Companion Chatbot */}
        {activeModule === 'assistant' && (
          <AIHealthAssistantModule
            userProfile={user}
            healthMetrics={healthMetrics}
            latestPrediction={latestPrediction}
          />
        )}

        {/* History & PDF Repository */}
        {activeModule === 'history' && (
          <ReportsHistoryModule
            userName={user?.name || 'Patient'}
          />
        )}

        {/* Health Analytics & Recharts Trends */}
        {activeModule === 'analytics' && (
          <HealthAnalyticsModule
            healthMetrics={healthMetrics}
          />
        )}

      </main>

      {/* Universal Search Modal (Ctrl + K) */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSymptom={(symptomName) => {
          setPreselectedSymptom(symptomName);
          setActiveModule('predict');
        }}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

    </div>
  );
}
