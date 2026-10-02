import { loadSymptomsFromCSV, SymptomCSVRecord } from '../datasets/csv_loader';

// Normalized symptom feature metadata
let cachedFeatureList: string[] | null = null;
let cachedAliasMap: Map<string, string> | null = null;

function initializeSymptomIndex() {
  if (cachedFeatureList && cachedAliasMap) return;

  const symptoms = loadSymptomsFromCSV();
  const aliasMap = new Map<string, string>();
  const featureList: string[] = [];

  for (const sym of symptoms) {
    const canonicalName = sym.symptom_name;
    featureList.push(canonicalName);

    // Direct mappings
    aliasMap.set(canonicalName.toLowerCase(), canonicalName);
    aliasMap.set(sym.symptom_id.toLowerCase(), canonicalName);
    aliasMap.set(sym.medical_term.toLowerCase(), canonicalName);

    // Aliases
    for (const alias of sym.common_aliases) {
      if (alias) {
        aliasMap.set(alias.toLowerCase(), canonicalName);
      }
    }

    // Simplified token key
    const simplified = canonicalName
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    aliasMap.set(simplified, canonicalName);
  }

  cachedFeatureList = featureList;
  cachedAliasMap = aliasMap;
}

export function getAllSymptomFeatures(): string[] {
  initializeSymptomIndex();
  return cachedFeatureList!;
}

/**
 * Normalizes an incoming raw symptom string to a canonical symptom name
 */
export function normalizeSymptomName(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  initializeSymptomIndex();

  const cleaned = raw.toLowerCase().trim();
  if (cachedAliasMap!.has(cleaned)) {
    return cachedAliasMap!.get(cleaned)!;
  }

  // Punctuation stripped match
  const stripped = cleaned.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cachedAliasMap!.has(stripped)) {
    return cachedAliasMap!.get(stripped)!;
  }

  // Token-level substring match
  for (const [key, canonical] of cachedAliasMap!.entries()) {
    if (key.length > 3 && (cleaned.includes(key) || key.includes(cleaned))) {
      return canonical;
    }
  }

  return null;
}

/**
 * Encodes a list of user-provided symptoms into a 2,230-dimensional binary feature vector
 */
export function encodeSymptomVector(selectedSymptoms: string[]): {
  vector: number[];
  recognizedSymptoms: string[];
  unrecognizedSymptoms: string[];
} {
  initializeSymptomIndex();
  const features = cachedFeatureList!;
  const vector = new Array(features.length).fill(0);
  const recognized: string[] = [];
  const unrecognized: string[] = [];

  const featureIndexMap = new Map<string, number>();
  features.forEach((f, idx) => featureIndexMap.set(f.toLowerCase(), idx));

  for (const raw of selectedSymptoms) {
    const canonical = normalizeSymptomName(raw);
    if (canonical && featureIndexMap.has(canonical.toLowerCase())) {
      const idx = featureIndexMap.get(canonical.toLowerCase())!;
      vector[idx] = 1;
      recognized.push(canonical);
    } else {
      unrecognized.push(raw);
    }
  }

  return {
    vector,
    recognizedSymptoms: recognized,
    unrecognizedSymptoms: unrecognized
  };
}
