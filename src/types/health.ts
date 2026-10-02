export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface SymptomItem {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
}

export interface DiseaseProbability {
  disease: string;
  probability: number; // 0 to 100
  confidence: number; // 0 to 100
  risk: RiskLevel;
  severity: string;
  confidenceExplanation: string;
}

export interface SymptomContribution {
  symptom: string;
  contribution: 'High' | 'Medium' | 'Low';
  importanceScore: number;
}

export interface DiseasePredictionResult {
  id: string;
  createdAt: string;
  engineUsed?: 'local_ml' | 'gemini_ai' | 'hybrid';
  engineLabel?: string;
  topDiseases: DiseaseProbability[];
  primaryDisease: string;
  primaryRisk: RiskLevel;
  primaryProbability: number;
  healthScore: number;
  reasoningSummary: string;
  contributingSymptoms: SymptomContribution[];
  selectedSymptoms: string[];
  
  // Disease Details & Educational Info
  overview: string;
  commonCauses: string[];
  preventionTips: string[];
  
  // Personalized Guidance
  lifestyleSuggestions: string[];
  dietRecommendations: {
    foodsToInclude: string[];
    foodsToLimit: string[];
    hydrationTips: string;
    mealPlanSummary: string;
  };
  exerciseRecommendations: {
    activities: string[];
    frequency: string;
    precautions: string;
  };
  followUpAdvice: {
    monitoringTips: string[];
    routineCheckup: string;
    urgentWarningSigns: string[];
  };
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  genericName?: string;
  purpose: string;
  dosage: string;
  timing: string; // e.g., "1-0-1 (Morning & Evening)"
  relationToFood: string; // e.g., "After Food"
  confidence: 'High' | 'Medium' | 'Low';
  commonSideEffects: string[];
  precautions: string;
  storageGuidance: string;
}

export interface PrescriptionAnalysisResult {
  id: string;
  createdAt: string;
  fileName: string;
  fileUrl?: string;
  doctorName?: string;
  clinicName?: string;
  dateDetected?: string;
  extractedText: string;
  medicines: PrescriptionMedicine[];
  unreadableSections: string[];
  overallConfidence: 'High' | 'Medium' | 'Low';
  generalSafetyGuidance: string[];
}

export interface ImageAnnotationRegion {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  confidence: number;
  note: string;
}

export interface MedicalImageAnalysisResult {
  id: string;
  createdAt: string;
  fileName: string;
  imageType: string; // e.g. "Chest X-Ray", "Skin Lesion", "Brain MRI"
  imageUrl?: string;
  qualityCheck: {
    resolutionRating: 'Good' | 'Fair' | 'Poor';
    contrastAdequacy: boolean;
    brightnessAdequacy: boolean;
    blurDetected: boolean;
    overallSuitable: boolean;
    qualityScore: number; // 0 to 100
  };
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  primaryInterpretation: string;
  plainLanguageExplanation: string;
  possibleConditions: Array<{
    condition: string;
    relativeConfidence: number; // 0 to 100
    description: string;
  }>;
  annotations: ImageAnnotationRegion[];
  generalHealthGuidance: string[];
}

export interface LiveCameraAnalysisResult {
  id: string;
  createdAt: string;
  conditionCategory: string; // e.g. "Skin Rash / Eczema", "Acne", "Minor Wound"
  capturedImageUrl?: string;
  qualityCheck: {
    brightness: 'Good' | 'Poor';
    sharpness: 'Good' | 'Blurry';
    lighting: 'Good' | 'Dark';
    overallSuitable: boolean;
  };
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  observedFeatures: string[];
  possibleConditions: Array<{
    condition: string;
    relativeConfidence: number;
    overview: string;
  }>;
  annotations: ImageAnnotationRegion[];
  educationalExplanation: string;
  generalCareGuidance: string[];
  urgentWarningSigns: string[];
}

export interface UserHealthMetrics {
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodSugarMgDl: number;
  cholesterolMgDl: number;
  heartRateBpm: number;
  oxygenSatPercent: number;
  lastUpdated: string;
}

export interface HealthMetricHistoryPoint {
  date: string;
  weight: number;
  bmi: number;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  cholesterol: number;
  healthScore: number;
}

export interface HealthNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'checkup' | 'alert' | 'system';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ActivityItem {
  id: string;
  type: 'prediction' | 'prescription' | 'image_analysis' | 'live_scan' | 'profile_update' | 'chat';
  title: string;
  description: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  recordId?: string;
}
