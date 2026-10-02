import fs from 'fs';
import path from 'path';

export interface DiseaseCSVRecord {
  disease_id: string;
  disease_name: string;
  icd10_code: string;
  category: string;
  risk_level: "Low" | "Moderate" | "High" | "Critical";
  severity: "Mild" | "Moderate" | "Severe";
  prevalence_rate: string;
  common_symptoms: string[];
  key_diagnostic_markers: string;
  prevention_guidelines: string;
  diet_recommendations: string;
  exercise_recommendations: string;
  urgent_warning_signs: string;
}

export interface SymptomCSVRecord {
  symptom_id: string;
  symptom_name: string;
  medical_term: string;
  category: string;
  body_system: string;
  severity_weight: number;
  urgency_level: "Low" | "Moderate" | "High" | "Critical";
  common_aliases: string[];
  description: string;
}

export interface DiseaseSymptomMatrixRecord {
  disease_id: string;
  disease_name: string;
  symptom_id: string;
  symptom_name: string;
  association_weight: number;
  is_primary_symptom: boolean;
}

/**
 * Robust CSV parser supporting quotes, commas, and newlines
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVFile(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  return lines.map(parseCSVLine);
}

// In-memory cache
let cachedDiseases: DiseaseCSVRecord[] | null = null;
let cachedSymptoms: SymptomCSVRecord[] | null = null;
let cachedMatrix: DiseaseSymptomMatrixRecord[] | null = null;

const DATASET_DIR = path.join(process.cwd(), 'datasets', 'kaggle_medical_500plus');

/**
 * Load all 500+ Diseases from CSV
 */
export function loadDiseasesFromCSV(): DiseaseCSVRecord[] {
  if (cachedDiseases) return cachedDiseases;

  const filePath = path.join(DATASET_DIR, 'diseases_500_plus.csv');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Diseases CSV not found at: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSVFile(fileContent);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase());
  const records: DiseaseCSVRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 5) continue;

    const symString = cols[7] || '';
    const symList = symString
      .split(';')
      .map(s => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);

    records.push({
      disease_id: cols[0],
      disease_name: cols[1],
      icd10_code: cols[2],
      category: cols[3],
      risk_level: (cols[4] as any) || 'Moderate',
      severity: (cols[5] as any) || 'Moderate',
      prevalence_rate: cols[6] || 'Uncommon',
      common_symptoms: symList,
      key_diagnostic_markers: cols[8] || 'Clinical evaluation and lab analysis',
      prevention_guidelines: cols[9] || 'Maintain healthy lifestyle and routine checkups',
      diet_recommendations: cols[10] || 'Balanced nutrient-dense diet and hydration',
      exercise_recommendations: cols[11] || 'Light to moderate exercise as tolerated',
      urgent_warning_signs: cols[12] || 'Severe pain, high fever, or shortness of breath'
    });
  }

  cachedDiseases = records;
  console.log(`[CSV Loader] Successfully loaded ${cachedDiseases.length} diseases from diseases_500_plus.csv`);
  return cachedDiseases;
}

/**
 * Load all 2000+ Symptoms from CSV
 */
export function loadSymptomsFromCSV(): SymptomCSVRecord[] {
  if (cachedSymptoms) return cachedSymptoms;

  const filePath = path.join(DATASET_DIR, 'symptoms_2000_plus.csv');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Symptoms CSV not found at: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSVFile(fileContent);
  if (rows.length < 2) return [];

  const records: SymptomCSVRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 4) continue;

    const aliases = (cols[7] || '')
      .split(';')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);

    records.push({
      symptom_id: cols[0],
      symptom_name: cols[1],
      medical_term: cols[2],
      category: cols[3],
      body_system: cols[4] || cols[3],
      severity_weight: parseFloat(cols[5]) || 5,
      urgency_level: (cols[6] as any) || 'Low',
      common_aliases: aliases,
      description: cols[8] || ''
    });
  }

  cachedSymptoms = records;
  console.log(`[CSV Loader] Successfully loaded ${cachedSymptoms.length} symptoms from symptoms_2000_plus.csv`);
  return cachedSymptoms;
}

/**
 * Load Disease-Symptom Co-occurrence Matrix from CSV
 */
export function loadMatrixFromCSV(): DiseaseSymptomMatrixRecord[] {
  if (cachedMatrix) return cachedMatrix;

  const filePath = path.join(DATASET_DIR, 'disease_symptoms_matrix_kaggle.csv');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Matrix CSV not found at: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSVFile(fileContent);
  if (rows.length < 2) return [];

  const records: DiseaseSymptomMatrixRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 4) continue;

    records.push({
      disease_id: cols[0],
      disease_name: cols[1],
      symptom_id: cols[2],
      symptom_name: cols[3],
      association_weight: parseFloat(cols[4]) || 0.5,
      is_primary_symptom: cols[5] === '1' || cols[5] === 'true'
    });
  }

  cachedMatrix = records;
  console.log(`[CSV Loader] Successfully loaded ${cachedMatrix.length} association edges from disease_symptoms_matrix_kaggle.csv`);
  return cachedMatrix;
}
