import React, { useState } from 'react';
import { 
  Activity, Scale, Ruler, HeartPulse, TrendingUp, Save, Check, RefreshCw, AlertCircle 
} from 'lucide-react';
import { UserHealthMetrics } from '@/src/types/health';
import { cn } from '@/src/lib/utils';

interface MyHealthMetricsModuleProps {
  metrics: UserHealthMetrics;
  onSaveMetrics: (updated: UserHealthMetrics) => void;
}

const BMI_CATEGORIES = [
  { range: [0, 18.5], label: "Underweight", color: "text-blue-400", tip: "Increase calorie intake with nutrient-dense foods." },
  { range: [18.5, 25], label: "Normal weight", color: "text-emerald-400", tip: "Great job! Keep maintaining balanced diet and active lifestyle." },
  { range: [25, 30], label: "Overweight", color: "text-amber-400", tip: "Balanced diet and 30 mins daily aerobic activity recommended." },
  { range: [30, 100], label: "Obese", color: "text-red-400", tip: "Consult a healthcare professional for a tailored wellness plan." }
];

export default function MyHealthMetricsModule({ metrics, onSaveMetrics }: MyHealthMetricsModuleProps) {
  const [height, setHeight] = useState(metrics.heightCm.toString());
  const [weight, setWeight] = useState(metrics.weightKg.toString());
  const [bpSystolic, setBpSystolic] = useState(metrics.bloodPressureSystolic.toString());
  const [bpDiastolic, setBpDiastolic] = useState(metrics.bloodPressureDiastolic.toString());
  const [bloodSugar, setBloodSugar] = useState(metrics.bloodSugarMgDl.toString());
  const [cholesterol, setCholesterol] = useState(metrics.cholesterolMgDl.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate live BMI
  const hM = (parseFloat(height) || 170) / 100;
  const wKg = parseFloat(weight) || 70;
  const computedBmi = parseFloat((wKg / (hM * hM)).toFixed(1));
  const bmiCatObj = BMI_CATEGORIES.find(c => computedBmi >= c.range[0] && computedBmi < c.range[1]) || BMI_CATEGORIES[1];

  const handleSave = () => {
    const updated: UserHealthMetrics = {
      heightCm: parseFloat(height) || 170,
      weightKg: parseFloat(weight) || 70,
      bmi: computedBmi,
      bmiCategory: bmiCatObj.label,
      bloodPressureSystolic: parseInt(bpSystolic) || 120,
      bloodPressureDiastolic: parseInt(bpDiastolic) || 80,
      bloodSugarMgDl: parseInt(bloodSugar) || 95,
      cholesterolMgDl: parseInt(cholesterol) || 180,
      heartRateBpm: 72,
      oxygenSatPercent: 98,
      lastUpdated: new Date().toISOString()
    };

    onSaveMetrics(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">My Health Vitals & BMI Dashboard</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                BIOMETRICS LOG
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Log and track your fundamental physiological health indicators, body mass index, and vitals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" /> Physiological Vitals Entry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Height */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5 text-emerald-400" /> Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* BP Systolic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> BP Systolic (mmHg)
                </label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-rose-500/50"
                />
              </div>

              {/* BP Diastolic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> BP Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-rose-500/50"
                />
              </div>

              {/* Fasting Sugar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Cholesterol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Total Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-purple-500/50"
                />
              </div>

            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-slate-950" />
                  <span>Vitals Updated Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Updated Vitals</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Computed BMI Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Computed Body Mass Index</div>
            
            <div className="text-6xl font-black text-amber-400 font-display">{computedBmi}</div>

            <div className={cn("inline-block px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider", bmiCatObj.color, "bg-slate-950 border-white/10")}>
              {bmiCatObj.label} Category
            </div>

            <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/5 italic">
              "{bmiCatObj.tip}"
            </p>

            {/* Scale Spectrum Bar */}
            <div className="space-y-2 pt-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BMI Spectrum Ranges</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">&lt;18.5 Under</div>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">18.5-24.9 Normal</div>
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">25-29.9 Over</div>
                <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">&gt;30 Obese</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
