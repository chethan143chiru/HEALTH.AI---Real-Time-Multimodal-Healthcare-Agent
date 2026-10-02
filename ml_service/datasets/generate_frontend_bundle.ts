import fs from 'fs';
import path from 'path';
import { loadDiseasesFromCSV, loadSymptomsFromCSV } from './csv_loader';

const diseases = loadDiseasesFromCSV();
const symptoms = loadSymptomsFromCSV();

const content = `// Generated from Kaggle Medical 500+ Diseases / 2,000+ Symptoms Dataset CSVs
export interface MasterSymptomRecord {
  id: string;
  name: string;
  medicalTerm: string;
  category: string;
  bodySystem: string;
  severity: number;
  urgency: "Low" | "Moderate" | "High" | "Critical";
  aliases: string[];
  description: string;
}

export interface MasterDiseaseRecord {
  id: string;
  name: string;
  icd10: string;
  category: string;
  risk: "Low" | "Moderate" | "High" | "Critical";
  severity: "Mild" | "Moderate" | "Severe";
  commonSymptoms: string[];
  prevalence: string;
  prevention: string;
  diet: string;
  exercise: string;
  warningSigns: string;
}

export const KAGGLE_DATASET_STATS = {
  totalDiseases: ${diseases.length},
  totalSymptoms: ${symptoms.length},
  csvFolder: "/datasets/kaggle_medical_500plus/",
  files: [
    { name: "diseases_500_plus.csv", count: "${diseases.length} Records", url: "/api/datasets/download/diseases_500_plus.csv" },
    { name: "symptoms_2000_plus.csv", count: "${symptoms.length} Records", url: "/api/datasets/download/symptoms_2000_plus.csv" },
    { name: "disease_symptoms_matrix_kaggle.csv", count: "2,218 Associations", url: "/api/datasets/download/disease_symptoms_matrix_kaggle.csv" }
  ]
};

export const MASTER_SYMPTOMS_2000: MasterSymptomRecord[] = ${JSON.stringify(
  symptoms.map(s => ({
    id: s.symptom_id,
    name: s.symptom_name,
    medicalTerm: s.medical_term,
    category: s.category,
    bodySystem: s.body_system,
    severity: s.severity_weight,
    urgency: s.urgency_level,
    aliases: s.common_aliases,
    description: s.description
  })),
  null,
  2
)};

export const MASTER_DISEASES_500: MasterDiseaseRecord[] = ${JSON.stringify(
  diseases.map(d => ({
    id: d.disease_id,
    name: d.disease_name,
    icd10: d.icd10_code,
    category: d.category,
    risk: d.risk_level,
    severity: d.severity,
    commonSymptoms: d.common_symptoms,
    prevalence: d.prevalence_rate,
    prevention: d.prevention_guidelines,
    diet: d.diet_recommendations,
    exercise: d.exercise_recommendations,
    warningSigns: d.urgent_warning_signs
  })),
  null,
  2
)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'kaggle_medical_500plus.ts'), content, 'utf-8');
console.log(`✓ Wrote src/data/kaggle_medical_500plus.ts with ${diseases.length} diseases and ${symptoms.length} symptoms!`);
