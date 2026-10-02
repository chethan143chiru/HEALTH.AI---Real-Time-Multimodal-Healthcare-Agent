/**
 * HEALTH.AI Vision Analysis Service
 * Real Gemini (gemini-3.8-flash) vision workflows reused by both the
 * HTTP AI endpoints and the realtime Live Agent tool registry.
 *
 * IMPORTANT: These functions NEVER fabricate clinical findings.
 * If the model is unavailable or returns unparseable output, they throw —
 * callers must surface an honest "unavailable" state to the user.
 */

import { ai, GEMINI_FLASH_MODEL } from './geminiClient.ts';

function stripDataUrl(imageBase64: string): string {
  return imageBase64.replace(/^data:[^;]+;base64,/, '');
}

function parseModelJson(text: string | undefined): any {
  const clean = (text || '').replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

/**
 * Prescription OCR + pharmacology extraction from a real uploaded/captured image.
 */
export async function analyzePrescriptionVision(imageBase64: string, mimeType?: string): Promise<any> {
  const prompt = `You are a specialized medical OCR and pharmacology AI assistant.
Analyze this medical prescription image or document.
Extract all readable handwriting, printed text, doctor information, and prescribed medications.

Output ONLY valid JSON matching this schema:
{
  "doctorName": "Dr. Full Name or 'Unspecified'",
  "clinicName": "Clinic/Hospital Name or 'Unspecified'",
  "dateDetected": "YYYY-MM-DD or 'Unspecified'",
  "extractedText": "Complete raw extracted OCR text transcript from prescription",
  "medicines": [
    {
      "id": "med-1",
      "name": "Brand/Trade Name",
      "genericName": "Generic Active Ingredient",
      "purpose": "Condition treated",
      "dosage": "500 mg",
      "timing": "Morning & Night (1-0-1)",
      "relationToFood": "After Food",
      "confidence": "High" | "Medium" | "Low",
      "commonSideEffects": ["Mild nausea"],
      "precautions": "Do not exceed recommended dose.",
      "storageGuidance": "Store in a cool dry place."
    }
  ],
  "unreadableSections": ["Highlighted illegible handwriting lines or unclear dosage notes"],
  "overallConfidence": "High" | "Medium" | "Low",
  "generalSafetyGuidance": ["Always verify dosages with a licensed pharmacist before consumption."]
}`;

  const response = await ai.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: stripDataUrl(imageBase64)
        }
      },
      prompt
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      systemInstruction:
        'You are an accurate medical OCR vision system. Extract prescription details with precision. Return ONLY valid JSON.'
    }
  });

  return parseModelJson(response.text);
}

/**
 * Radiological / clinical image screening (X-ray, CT, MRI, ultrasound).
 */
export async function analyzeMedicalImageVision(
  imageBase64: string,
  mimeType?: string,
  imageType?: string,
  clinicalNotes?: string
): Promise<any> {
  const prompt = `You are a radiological and clinical visual AI assistant.
Analyze this medical image (Category: ${imageType || 'General Medical Scan'}).
${clinicalNotes ? `Clinical notes from the user: ${clinicalNotes}` : ''}
Evaluate image quality, visual patterns, structural features, and provide educational clinical findings.

Output ONLY valid JSON matching this schema:
{
  "qualityCheck": {
    "resolutionRating": "Good" | "Fair" | "Poor",
    "contrastAdequacy": true,
    "brightnessAdequacy": true,
    "blurDetected": false,
    "overallSuitable": true,
    "qualityScore": 92
  },
  "confidenceLevel": "High" | "Moderate" | "Low",
  "primaryInterpretation": "Clear, plain language clinical description of key visual findings.",
  "plainLanguageExplanation": "Detailed educational explanation suitable for patient understanding.",
  "possibleConditions": [
    { "condition": "Condition Name", "relativeConfidence": 85, "description": "Brief explanation of pattern correlation." }
  ],
  "annotations": [
    { "id": "region-1", "label": "Observed Area", "x": 45, "y": 40, "width": 25, "height": 20, "confidence": 88, "note": "Note regarding visual variation" }
  ],
  "generalHealthGuidance": [
    "This AI visual analysis is for educational and screening assistance only.",
    "Always consult a qualified radiologist or specialist for official diagnostic confirmation."
  ]
}`;

  const response = await ai.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: stripDataUrl(imageBase64)
        }
      },
      prompt
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      systemInstruction: 'You are a medical radiology visual AI assistant. Output ONLY valid JSON.'
    }
  });

  return parseModelJson(response.text);
}

/**
 * Live camera surface / dermatology screening.
 */
export async function analyzeLiveVisualVision(
  imageBase64: string,
  mimeType?: string,
  focusArea?: string
): Promise<any> {
  const prompt = `You are a dermatology and surface clinical AI assistant.
Analyze this live camera capture of a visible skin or external condition (User focus area: ${focusArea || 'General External'}).
Perform quality assessment, feature identification, and educational analysis.

Output ONLY valid JSON matching this schema:
{
  "conditionCategory": "${focusArea || 'Skin & External Condition'}",
  "qualityCheck": { "brightness": "Good" | "Poor", "sharpness": "Good" | "Blurry", "lighting": "Good" | "Dark", "overallSuitable": true },
  "confidenceLevel": "High" | "Moderate" | "Low",
  "observedFeatures": ["Erythematous papules with mild scaling"],
  "possibleConditions": [
    { "condition": "Condition Name", "relativeConfidence": 80, "overview": "Educational overview of the visible pattern." }
  ],
  "annotations": [
    { "id": "ann-1", "label": "Primary Lesion Area", "x": 50, "y": 48, "width": 30, "height": 30, "confidence": 85, "note": "Concentrated redness and localized skin irritation" }
  ],
  "educationalExplanation": "Clear educational explanation of what is observed in the photo.",
  "generalCareGuidance": ["Keep the affected area clean and dry."],
  "urgentWarningSigns": ["Rapidly spreading redness or warmth", "Fever or systemic illness"]
}`;

  const response = await ai.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: stripDataUrl(imageBase64)
        }
      },
      prompt
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      systemInstruction: 'You are an educational visual dermatology AI assistant. Output ONLY valid JSON.'
    }
  });

  return parseModelJson(response.text);
}
