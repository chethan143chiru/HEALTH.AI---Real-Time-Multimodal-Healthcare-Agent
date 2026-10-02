// Stopwords list for healthcare NLP
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such',
  't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you',
  'your', 'yours', 'yourself', 'yourselves'
]);

export interface TFIDFModel {
  vocabulary: Record<string, number>;
  idf: number[];
  numFeatures: number;
}

/**
 * Cleans and tokenizes natural language queries
 */
export function tokenizeText(text: string, removeStopwords = true): string[] {
  if (!text) return [];

  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (removeStopwords) {
    return tokens.filter(t => !STOPWORDS.has(t));
  }
  return tokens;
}

/**
 * Extracts unigrams and bigrams for rich semantic vectorization
 */
export function extractNGrams(tokens: string[]): string[] {
  const ngrams: string[] = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return ngrams;
}

/**
 * Creates TF-IDF vector from tokens using a fitted TFIDFModel
 */
export function transformTFIDF(text: string, model: TFIDFModel): number[] {
  const tokens = extractNGrams(tokenizeText(text));
  const vector = new Array(model.numFeatures).fill(0);

  if (tokens.length === 0) return vector;

  // Calculate Term Frequency (TF)
  const termCounts: Record<string, number> = {};
  for (const token of tokens) {
    if (model.vocabulary[token] !== undefined) {
      termCounts[token] = (termCounts[token] || 0) + 1;
    }
  }

  // Multiply TF by IDF: tf * idf
  let norm = 0;
  for (const [token, count] of Object.entries(termCounts)) {
    const idx = model.vocabulary[token];
    const tf = count / tokens.length;
    const tfidf = tf * model.idf[idx];
    vector[idx] = tfidf;
    norm += tfidf * tfidf;
  }

  // L2 Normalization (Cosine unit vector)
  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= sqrtNorm;
    }
  }

  return vector;
}

/**
 * Computes cosine similarity between two unit vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}
