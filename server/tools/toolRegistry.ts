/**
 * HEALTH.AI Tool Registry
 * Explicit function declarations and server-side tool execution handlers.
 *
 * HARD RULE: No tool may fabricate clinical data.
 *  - Vision tools call the real Gemini vision service with an actual image.
 *  - Health-data tools read the authenticated user's real Firestore records.
 *  - When data is missing, tools return an honest `available: false` result
 *    so the agent can tell the user the information is not available.
 *
 * User identity is supplied by the server (verified session), never trusted
 * from model-generated arguments.
 */

import { predictDiseaseLocalML } from '../../ml_service/services/disease_inference_engine.ts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  analyzePrescriptionVision,
  analyzeMedicalImageVision,
  analyzeLiveVisualVision
} from '../ai/visionService.ts';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolExecutionContext {
  /** Server-verified user id. Never taken from model arguments. */
  userId: string;
  userName: string;
  userEmail: string;
  healthContext?: any;
  /** Most recent camera frame (base64) for vision tools, if any. */
  lastImageBase64?: string;
  /** Firestore client for authorized health-data reads. */
  db?: any;
}

export interface ToolResult {
  success: boolean;
  tool: string;
  available?: boolean;
  data: any;
  summaryMessage: string;
}

export const liveHealthcareToolDeclarations = [
  {
    name: "emergencySafetyCheck",
    description: "Evaluates severe or life-threatening symptoms (e.g. chest pain, breathing difficulty, severe bleeding, stroke symptoms) for immediate urgent care referral.",
    parameters: {
      type: "OBJECT",
      properties: {
        symptoms: { type: "ARRAY", items: { type: "STRING" }, description: "Reported acute symptoms" },
        urgencyDescription: { type: "STRING", description: "Brief description of the urgent concern" }
      },
      required: ["symptoms"]
    }
  },
  {
    name: "predictDisease",
    description: "Screens reported clinical symptoms against the local clinical ML model and medical condition database using differential screening and Bayesian inference.",
    parameters: {
      type: "OBJECT",
      properties: {
        symptoms: { type: "ARRAY", items: { type: "STRING" }, description: "List of observed or reported symptoms (e.g. fever, dry cough, headache)" },
        duration: { type: "STRING", description: "Duration of symptoms (e.g., 3 days, 1 week)" }
      },
      required: ["symptoms"]
    }
  },
  {
    name: "analyzePrescription",
    description: "Extracts and analyzes medication details (name, active ingredient, dosage, frequency, food relation) from the prescription the patient has shown to the camera.",
    parameters: {
      type: "OBJECT",
      properties: {
        summaryQuery: { type: "STRING", description: "Specific question about the prescription or medicines" }
      }
    }
  },
  {
    name: "analyzeMedicalImage",
    description: "Provides radiologic screening and anatomical pattern evaluation for X-rays, scans, and clinical medical imagery.",
    parameters: {
      type: "OBJECT",
      properties: {
        modality: { type: "STRING", description: "Image type: chest X-ray, musculoskeletal scan, CT, MRI, etc." },
        clinicalNotes: { type: "STRING", description: "Clinical background or question regarding the scan" }
      }
    }
  },
  {
    name: "analyzeLiveVisual",
    description: "Screens surface dermatology or visible external health features captured via the live camera.",
    parameters: {
      type: "OBJECT",
      properties: {
        bodyPart: { type: "STRING", description: "Visible anatomical region (e.g. forearm, face, throat, skin lesion)" },
        observation: { type: "STRING", description: "User description of visible symptoms" }
      }
    }
  },
  {
    name: "getHealthMetrics",
    description: "Retrieves the authenticated patient's recorded health metrics (blood pressure, heart rate, BMI, blood sugar) from their health record. Returns unavailable if none have been recorded.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "getHealthHistory",
    description: "Retrieves the authenticated patient's actual past screening records. Returns unavailable if none exist.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: { type: "NUMBER", description: "Number of past records to retrieve (default 5)" }
      }
    }
  },
  {
    name: "getHealthAnalytics",
    description: "Retrieves wellness analytics derived only from the authenticated patient's real recorded screening history.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "generateHealthReport",
    description: "Compiles a clinical summary report from the authenticated patient's real screening records and vitals for physician review.",
    parameters: {
      type: "OBJECT",
      properties: {
        reportType: { type: "STRING", description: "Type of report: 'screening_summary', 'vitals_overview', or 'full_clinical_export'" }
      }
    }
  }
];

const DISCLAIMER =
  "This is an AI clinical screening result, not a definitive diagnosis. Clinical evaluation by a qualified medical professional is recommended.";

function unavailable(tool: string, summaryMessage: string, data: any = null): ToolResult {
  return { success: false, available: false, tool, data, summaryMessage };
}

/** Reads the user's Firestore profile document (source of recorded vitals). */
async function getUserProfile(db: any, userId: string): Promise<any | null> {
  if (!db || !userId) return null;
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
    let data: any = null;
    snap.forEach((d: any) => { if (!data) data = { id: d.id, ...d.data() }; });
    if (data) return data;
  } catch {
    /* fall through to id-based lookup */
  }
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
    let data: any = null;
    snap.forEach((d: any) => { if (!data) data = { id: d.id, ...d.data() }; });
    return data;
  } catch {
    return null;
  }
}

/** Reads the user's real screening/prediction records ordered newest first. */
async function getUserPredictions(db: any, userId: string, max: number): Promise<any[]> {
  if (!db || !userId) return [];
  try {
    const snap = await getDocs(query(collection(db, 'predictions'), where('userId', '==', userId)));
    const records: any[] = [];
    snap.forEach((d: any) => records.push({ firestoreId: d.id, ...d.data() }));
    records.sort((a, b) => {
      const at = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0).getTime();
      return bt - at;
    });
    return records.slice(0, max);
  } catch (e: any) {
    console.warn('[ToolRegistry] Prediction history read warning:', e?.message || e);
    return [];
  }
}

function extractRecordedMetrics(profile: any): any | null {
  if (!profile) return null;
  const m = profile.healthMetrics || profile.metrics || profile.vitals;
  if (!m || typeof m !== 'object') return null;
  const hasAnyValue = Object.values(m).some(v => v !== null && v !== undefined && v !== '');
  return hasAnyValue ? m : null;
}

export async function executeHealthcareTool(
  toolName: string,
  args: any,
  sessionContext: ToolExecutionContext
): Promise<ToolResult> {
  console.log(`[ToolRegistry] Executing tool '${toolName}' for user ${sessionContext.userName} (${sessionContext.userId})`);

  switch (toolName) {
    case "emergencySafetyCheck": {
      const symptoms: string[] = Array.isArray(args?.symptoms) ? args.symptoms : [];
      const isCritical = symptoms.some((s: string) =>
        /chest pain|breath|shortness|stroke|unconscious|bleeding|seizure|suicid|self harm|anaphyla|overdose|numbness on one side|slurred speech/i.test(s)
      );

      return {
        success: true,
        available: true,
        tool: "emergencySafetyCheck",
        data: {
          emergencyDetected: isCritical,
          flaggedSymptoms: symptoms,
          guidance: isCritical
            ? "URGENT: Immediate in-person emergency care is recommended. Contact your local emergency number (112 in India, 911 in the US) or go to the nearest emergency department now."
            : "No immediately life-threatening red flags were identified from the described symptoms. Monitor closely and consult a clinician if things worsen.",
          hotlines: ["Emergency: 112 (India) / 911 (US)", "National Health Helpline (India): 1075"]
        },
        summaryMessage: isCritical
          ? "URGENT: These symptoms may require immediate emergency medical attention. Please contact emergency services or go to the nearest emergency department now. I will not attempt a diagnosis for these symptoms."
          : "Emergency screening complete. No immediate life-threatening markers detected, but continued clinical monitoring is recommended."
      };
    }

    case "predictDisease": {
      const rawSymptoms: string[] = Array.isArray(args?.symptoms) && args.symptoms.length
        ? args.symptoms
        : [];
      if (!rawSymptoms.length) {
        return unavailable("predictDisease", "I need at least one symptom before I can run a screening. Could you describe what you are feeling?");
      }

      try {
        const userProfile = sessionContext.healthContext || {};
        const localResult = predictDiseaseLocalML(rawSymptoms, userProfile, userProfile);
        return {
          success: true,
          available: true,
          tool: "predictDisease",
          data: {
            symptoms: rawSymptoms,
            primaryCondition: localResult.primaryDisease || null,
            riskLevel: localResult.primaryRisk || null,
            healthScore: typeof localResult.healthScore === 'number' ? localResult.healthScore : null,
            differentialDiagnoses: localResult.topDiseases?.slice(0, 4) || [],
            recommendations: localResult.preventionTips || [],
            engine: 'local_clinical_ml',
            disclaimer: DISCLAIMER
          },
          summaryMessage: `Local clinical screening suggests a possible correlation with ${localResult.primaryDisease || 'the reported symptoms'}${
            localResult.primaryRisk ? ` (risk level: ${localResult.primaryRisk})` : ''
          }. This is a screening ranking, not a diagnosis.`
        };
      } catch (e: any) {
        console.warn('[ToolRegistry] Local ML prediction warning:', e?.message || e);
        return unavailable("predictDisease", "I couldn't complete the symptom screening right now. Please try again shortly.");
      }
    }

    case "analyzePrescription": {
      const image = sessionContext.lastImageBase64;
      if (!image) {
        return unavailable(
          "analyzePrescription",
          "I don't have a prescription image to read yet. Please show the prescription clearly to the camera and ask me again."
        );
      }
      try {
        const data = await analyzePrescriptionVision(image, 'image/jpeg');
        const meds = Array.isArray(data?.medicines) ? data.medicines : [];
        return {
          success: true,
          available: true,
          tool: "analyzePrescription",
          data: { ...data, engine: 'gemini_3.8_flash' },
          summaryMessage: meds.length
            ? `Prescription analyzed. I identified ${meds.length} medicine${meds.length > 1 ? 's' : ''}: ${meds.map((m: any) => m.name).filter(Boolean).join(', ')}. Please confirm dosages with your pharmacist.`
            : "I analyzed the image but could not read clear medicine details. A clearer photo may help."
        };
      } catch (e: any) {
        console.warn('[ToolRegistry] Prescription vision error:', e?.message || e);
        return unavailable("analyzePrescription", "Prescription analysis is temporarily unavailable. Please try again shortly.");
      }
    }

    case "analyzeMedicalImage": {
      const image = sessionContext.lastImageBase64;
      if (!image) {
        return unavailable(
          "analyzeMedicalImage",
          "I don't have a medical image to analyze yet. Please upload or show the scan, then ask me again."
        );
      }
      try {
        const data = await analyzeMedicalImageVision(image, 'image/jpeg', args?.modality, args?.clinicalNotes);
        return {
          success: true,
          available: true,
          tool: "analyzeMedicalImage",
          data: { ...data, engine: 'gemini_3.8_flash' },
          summaryMessage: data?.primaryInterpretation
            ? `Screening review complete. ${data.primaryInterpretation} This is an AI screening interpretation and requires professional radiological confirmation.`
            : "Screening review complete. Please share the result with a qualified clinician for confirmation."
        };
      } catch (e: any) {
        console.warn('[ToolRegistry] Medical image vision error:', e?.message || e);
        return unavailable("analyzeMedicalImage", "Medical image analysis is temporarily unavailable. Please try again shortly.");
      }
    }

    case "analyzeLiveVisual": {
      const image = sessionContext.lastImageBase64;
      if (!image) {
        return unavailable(
          "analyzeLiveVisual",
          "I can't see anything from the camera yet. Please enable the camera and point it at the area you'd like me to look at."
        );
      }
      try {
        const data = await analyzeLiveVisualVision(image, 'image/jpeg', args?.bodyPart);
        return {
          success: true,
          available: true,
          tool: "analyzeLiveVisual",
          data: { ...data, engine: 'gemini_3.8_flash' },
          summaryMessage: data?.possibleConditions?.[0]?.condition
            ? `Camera screening suggests a possible pattern of ${data.possibleConditions[0].condition}. This is a visual screening only and is not a diagnosis.`
            : "Camera screening complete. Share the finding with a clinician for proper evaluation."
        };
      } catch (e: any) {
        console.warn('[ToolRegistry] Live visual vision error:', e?.message || e);
        return unavailable("analyzeLiveVisual", "Live visual screening is temporarily unavailable. Please try again shortly.");
      }
    }

    case "getHealthMetrics": {
      const profile = await getUserProfile(sessionContext.db, sessionContext.userId);
      const metrics = extractRecordedMetrics(profile);
      if (!metrics) {
        return unavailable(
          "getHealthMetrics",
          "I don't currently have any recorded vitals (blood pressure, heart rate, BMI) for your account. You can add them in Health Metrics, and I'll be able to read them next time."
        );
      }
      const bp = metrics.bloodPressure ||
        (metrics.bloodPressureSystolic && metrics.bloodPressureDiastolic
          ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic} mmHg`
          : null);
      return {
        success: true,
        available: true,
        tool: "getHealthMetrics",
        data: { ...metrics, bloodPressure: bp },
        summaryMessage: `Here are your recorded vitals${bp ? `: blood pressure ${bp}` : ''}. These are the values stored in your health record.`
      };
    }

    case "getHealthHistory": {
      const limit = Number(args?.limit) > 0 ? Number(args.limit) : 5;
      const records = await getUserPredictions(sessionContext.db, sessionContext.userId, limit);
      if (!records.length) {
        return unavailable(
          "getHealthHistory",
          "I couldn't find any previous screening records on your account yet. Once you complete a screening, it will appear here."
        );
      }
      return {
        success: true,
        available: true,
        tool: "getHealthHistory",
        data: { records },
        summaryMessage: `I found ${records.length} recent record${records.length > 1 ? 's' : ''} in your health history.`
      };
    }

    case "getHealthAnalytics": {
      const records = await getUserPredictions(sessionContext.db, sessionContext.userId, 50);
      if (records.length < 2) {
        return unavailable(
          "getHealthAnalytics",
          "There isn't enough recorded history yet to identify a reliable trend. Complete a few more screenings and I'll be able to summarize your progress."
        );
      }
      const riskCounts: Record<string, number> = {};
      for (const r of records) {
        const risk = r?.result?.primaryRisk || r?.primaryRisk || 'Unknown';
        riskCounts[risk] = (riskCounts[risk] || 0) + 1;
      }
      return {
        success: true,
        available: true,
        tool: "getHealthAnalytics",
        data: {
          totalScreenings: records.length,
          riskDistribution: riskCounts,
          latestScreening: records[0]?.createdAt || null
        },
        summaryMessage: `Across your ${records.length} recorded screenings, the risk breakdown is ${Object.entries(riskCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}.`
      };
    }

    case "generateHealthReport": {
      const profile = await getUserProfile(sessionContext.db, sessionContext.userId);
      const records = await getUserPredictions(sessionContext.db, sessionContext.userId, 10);
      const metrics = extractRecordedMetrics(profile);

      if (!records.length && !metrics) {
        return unavailable(
          "generateHealthReport",
          "I don't have any screening results or recorded vitals for your account yet, so there is nothing I can put into a report. Complete a screening or add your metrics first."
        );
      }

      const reportId = `REP-${Date.now().toString(36).toUpperCase()}`;
      return {
        success: true,
        available: true,
        tool: "generateHealthReport",
        data: {
          reportId,
          generatedAt: new Date().toISOString(),
          patientName: sessionContext.userName || 'Verified Patient',
          metrics: metrics || null,
          recordsIncluded: records.length,
          records,
          disclaimer: DISCLAIMER
        },
        summaryMessage: `I've compiled a report (${reportId}) from your ${records.length} screening record${records.length === 1 ? '' : 's'}${metrics ? ' and recorded vitals' : ''}. You can review it and share it with your clinician.`
      };
    }

    default:
      return unavailable(toolName, `The requested tool '${toolName}' is not available.`);
  }
}
