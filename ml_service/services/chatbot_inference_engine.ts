import fs from 'fs';
import path from 'path';
import { tokenizeText, extractNGrams, transformTFIDF, cosineSimilarity } from '../preprocessing/text_normalizer';
import { SerializedChatbotModel } from '../training/train_chatbot';

let cachedChatbotModel: SerializedChatbotModel | null = null;

function getLoadedChatbotModel(): SerializedChatbotModel {
  if (cachedChatbotModel) return cachedChatbotModel;

  const modelPath = path.join(process.cwd(), 'ml_service', 'models', 'chatbot_model.json');
  if (fs.existsSync(modelPath)) {
    const raw = fs.readFileSync(modelPath, 'utf-8');
    cachedChatbotModel = JSON.parse(raw);
    return cachedChatbotModel!;
  }

  // Fallback lazy train
  const { trainChatbotClassifier } = require('../training/train_chatbot');
  cachedChatbotModel = trainChatbotClassifier();
  return cachedChatbotModel!;
}

// Emergency safety red-flag trigger keywords
const EMERGENCY_KEYWORDS = [
  'crushing chest pain',
  'cannot breathe',
  'difficulty breathing',
  'stroke',
  'facial droop',
  'unconscious',
  'heavy bleeding',
  'choking',
  'blue lips',
  'cyanosis',
  'suicide',
  'severe burn'
];

export function generateChatResponseLocalNLP(
  message: string,
  healthContext?: any
): { text: string; intent: string; confidence: number } {
  if (!message || !message.trim()) {
    return {
      text: "Hello! I am Health Buddy, your AI Medical Assistant. How can I assist with your health and wellness questions today?",
      intent: "greeting",
      confidence: 1.0
    };
  }

  const cleanMessage = message.trim().toLowerCase();

  // 1. Emergency Safety Filter Check
  for (const kw of EMERGENCY_KEYWORDS) {
    if (cleanMessage.includes(kw)) {
      return {
        text: "CRITICAL ALERT: Your query mentions potential emergency symptoms. If you or someone nearby is experiencing acute chest pain, severe shortness of breath, sudden facial or limb weakness, or heavy bleeding, please call emergency services (911 or 112) or go to the nearest emergency room immediately!",
        intent: "emergency_guidance",
        confidence: 1.0
      };
    }
  }

  // 2. TF-IDF + Cosine Centroid Intent Classification
  const model = getLoadedChatbotModel();
  const inputVector = transformTFIDF(message, {
    vocabulary: model.vocabulary,
    idf: model.idf,
    numFeatures: model.num_features
  });

  let bestScore = -1;
  let bestIntentIdx = 0;

  for (let c = 0; c < model.classes.length; c++) {
    const score = cosineSimilarity(inputVector, model.class_centroids[c]);
    if (score > bestScore) {
      bestScore = score;
      bestIntentIdx = c;
    }
  }

  const bestIntent = model.classes[bestIntentIdx];
  const confidence = Math.min(1.0, Math.max(0.0, Math.round(bestScore * 100) / 100));

  // 3. Retrieve response from Knowledge Base
  const matchingIntentObj = model.intents.find(i => i.intent === bestIntent);
  let baseResponse = "I am monitoring your health profile. Feel free to ask about any symptoms, diet tips, exercise recommendations, or disease predictions.";

  if (matchingIntentObj && matchingIntentObj.responses && matchingIntentObj.responses.length > 0) {
    const responses = matchingIntentObj.responses;
    baseResponse = responses[Math.floor(Math.random() * responses.length)];
  }

  // 4. Patient Context Personalization (if context available)
  let contextualPrefix = "";
  if (healthContext?.userName && (bestIntent === 'greeting' || bestIntent === 'prediction_explanation')) {
    contextualPrefix = `Hello ${healthContext.userName}! `;
  }

  let contextualSuffix = "";
  if (healthContext?.latestPrediction && (bestIntent === 'prediction_explanation' || bestIntent === 'fever_information' || bestIntent === 'cough_information')) {
    contextualSuffix = ` Based on your recent health screening showing ${healthContext.latestPrediction}, remember to track any changes in your vitals.`;
  }

  // 5. Low confidence fallback (below 0.15 similarity)
  if (confidence < 0.15) {
    return {
      text: "I am Health Buddy, your AI Health Assistant. I can assist with symptom explanations, dietary guidance, hydration, physical activity, sleep hygiene, and understanding your disease prediction reports. What specific health topic would you like to explore?",
      intent: "unknown_fallback",
      confidence: confidence
    };
  }

  return {
    text: `${contextualPrefix}${baseResponse}${contextualSuffix}`.trim(),
    intent: bestIntent,
    confidence: confidence
  };
}
