import { 
  DiseasePredictionResult, 
  PrescriptionAnalysisResult, 
  MedicalImageAnalysisResult, 
  LiveCameraAnalysisResult 
} from '@/src/types/health';

export async function predictDiseaseAPI(
  selectedSymptoms: string[], 
  userProfile?: any, 
  healthMetrics?: any,
  enginePreference: 'auto' | 'ml' | 'gemini' = 'auto'
): Promise<DiseasePredictionResult> {
  const res = await fetch('/api/ai/predict-disease', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedSymptoms, userProfile, healthMetrics, enginePreference })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI Disease Prediction failed');
  }

  const json = await res.json();
  return json.data;
}

export async function analyzePrescriptionAPI(
  imageBase64: string, 
  mimeType: string, 
  fileName: string
): Promise<PrescriptionAnalysisResult> {
  const res = await fetch('/api/ai/analyze-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, fileName })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Prescription analysis failed');
  }

  const json = await res.json();
  return json.data;
}

export async function analyzeMedicalImageAPI(
  imageBase64: string, 
  mimeType: string, 
  imageType: string
): Promise<MedicalImageAnalysisResult> {
  const res = await fetch('/api/ai/analyze-medical-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, imageType })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Medical image analysis failed');
  }

  const json = await res.json();
  return json.data;
}

export async function liveDiseaseDetectionAPI(
  imageBase64: string, 
  mimeType: string, 
  focusArea: string
): Promise<LiveCameraAnalysisResult> {
  const res = await fetch('/api/ai/live-disease-detection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, focusArea })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Live camera analysis failed');
  }

  const json = await res.json();
  return json.data;
}

export async function chatHealthAssistantAPI(
  message: string, 
  healthContext: any,
  conversationHistory?: any[],
  enginePreference: 'auto' | 'gemini' | 'nlp' = 'auto'
): Promise<{ text: string; engine?: string; engineLabel?: string }> {
  const res = await fetch('/api/ai/health-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, healthContext, conversationHistory, enginePreference })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI Assistant service unavailable');
  }

  const json = await res.json();
  return {
    text: json.text,
    engine: json.engine,
    engineLabel: json.engineLabel
  };
}
