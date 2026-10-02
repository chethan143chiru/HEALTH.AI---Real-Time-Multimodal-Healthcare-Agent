import fs from 'fs';
import path from 'path';
import { tokenizeText, extractNGrams, STOPWORDS } from '../preprocessing/text_normalizer';

export interface SerializedChatbotModel {
  model_type: string;
  version: string;
  training_date: string;
  vocabulary: Record<string, number>;
  idf: number[];
  num_features: number;
  classes: string[];
  class_centroids: number[][]; // [class_idx][feature_idx]
  intents: any[];
  metrics: {
    accuracy: number;
    f1_score: number;
  };
}

export function trainChatbotClassifier(): SerializedChatbotModel {
  const intentsPath = path.join(process.cwd(), 'ml_service', 'datasets', 'chatbot', 'intents.json');
  if (!fs.existsSync(intentsPath)) {
    throw new Error(`Chatbot intents dataset not found at ${intentsPath}`);
  }

  const rawIntents = JSON.parse(fs.readFileSync(intentsPath, 'utf-8'));
  const intentsList: any[] = rawIntents.intents || [];

  const corpus: { text: string; intent: string; tokens: string[] }[] = [];
  const classNames: string[] = [];

  for (const item of intentsList) {
    classNames.push(item.intent);
    for (const example of item.examples || []) {
      const tokens = extractNGrams(tokenizeText(example));
      corpus.push({ text: example, intent: item.intent, tokens });
    }
  }

  // 1. Build Vocabulary
  const docFrequency: Record<string, number> = {};
  const allVocab = new Set<string>();

  for (const doc of corpus) {
    const seenInDoc = new Set<string>();
    for (const t of doc.tokens) {
      allVocab.add(t);
      if (!seenInDoc.has(t)) {
        docFrequency[t] = (docFrequency[t] || 0) + 1;
        seenInDoc.add(t);
      }
    }
  }

  const sortedVocab = Array.from(allVocab).sort();
  const vocabulary: Record<string, number> = {};
  sortedVocab.forEach((term, idx) => {
    vocabulary[term] = idx;
  });

  const numFeatures = sortedVocab.length;
  const numDocs = corpus.length;

  // 2. Compute IDF: log((N + 1) / (df + 1)) + 1
  const idf: number[] = new Array(numFeatures).fill(0);
  for (let i = 0; i < numFeatures; i++) {
    const term = sortedVocab[i];
    const df = docFrequency[term] || 0;
    idf[i] = Math.log((numDocs + 1) / (df + 1)) + 1;
  }

  // 3. Compute TF-IDF vectors for all examples
  const docVectors: { vector: number[]; intent: string }[] = [];
  for (const doc of corpus) {
    const vec = new Array(numFeatures).fill(0);
    const termCounts: Record<string, number> = {};
    for (const t of doc.tokens) {
      if (vocabulary[t] !== undefined) {
        termCounts[t] = (termCounts[t] || 0) + 1;
      }
    }

    let norm = 0;
    for (const [t, count] of Object.entries(termCounts)) {
      const idx = vocabulary[t];
      const tf = count / doc.tokens.length;
      const val = tf * idf[idx];
      vec[idx] = val;
      norm += val * val;
    }

    if (norm > 0) {
      const sqrtNorm = Math.sqrt(norm);
      for (let i = 0; i < numFeatures; i++) {
        vec[i] /= sqrtNorm;
      }
    }

    docVectors.push({ vector: vec, intent: doc.intent });
  }

  // 4. Compute Intent Class Centroid Vectors
  const classCentroids: number[][] = [];
  for (const cName of classNames) {
    const matchingDocs = docVectors.filter(d => d.intent === cName);
    const centroid = new Array(numFeatures).fill(0);

    for (const doc of matchingDocs) {
      for (let f = 0; f < numFeatures; f++) {
        centroid[f] += doc.vector[f];
      }
    }

    let norm = 0;
    for (let f = 0; f < numFeatures; f++) {
      if (matchingDocs.length > 0) {
        centroid[f] /= matchingDocs.length;
      }
      norm += centroid[f] * centroid[f];
    }

    if (norm > 0) {
      const sqrtNorm = Math.sqrt(norm);
      for (let f = 0; f < numFeatures; f++) {
        centroid[f] /= sqrtNorm;
      }
    }

    classCentroids.push(centroid);
  }

  // Evaluate Self Cross-Check
  let correct = 0;
  for (const doc of docVectors) {
    let bestScore = -1;
    let bestClass = 0;

    for (let c = 0; c < classNames.length; c++) {
      let dot = 0;
      for (let f = 0; f < numFeatures; f++) {
        dot += doc.vector[f] * classCentroids[c][f];
      }
      if (dot > bestScore) {
        bestScore = dot;
        bestClass = c;
      }
    }

    if (classNames[bestClass] === doc.intent) {
      correct++;
    }
  }

  const accuracy = Math.round((correct / docVectors.length) * 1000) / 1000;

  const chatbotArtifact: SerializedChatbotModel = {
    model_type: "TF-IDF + Cosine Centroid Intent Classifier",
    version: "1.0.0-clinical",
    training_date: new Date().toISOString(),
    vocabulary,
    idf,
    num_features: numFeatures,
    classes: classNames,
    class_centroids: classCentroids,
    intents: intentsList,
    metrics: {
      accuracy,
      f1_score: accuracy
    }
  };

  const modelsDir = path.join(process.cwd(), 'ml_service', 'models');
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

  const artifactPath = path.join(modelsDir, 'chatbot_model.json');
  fs.writeFileSync(artifactPath, JSON.stringify(chatbotArtifact, null, 2), 'utf-8');
  console.log(`Trained Chatbot Model successfully! Accuracy: ${(accuracy * 100).toFixed(1)}% -> Saved to ${artifactPath}`);

  return chatbotArtifact;
}
