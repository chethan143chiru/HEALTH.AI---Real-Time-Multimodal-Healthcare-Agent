import { MASTER_SYMPTOMS_2000, MASTER_DISEASES_500, KAGGLE_DATASET_STATS, MasterSymptomRecord, MasterDiseaseRecord } from './kaggle_medical_500plus';

export interface Symptom {
  id: string;
  name: string;
  category: string;
  bodySystem?: string;
  description: string;
  keywords: string[];
  severity?: number;
  urgency?: "Low" | "Moderate" | "High" | "Critical";
  medicalTerm?: string;
}

export const SYMPTOM_CATEGORIES = [
  "General Symptoms",
  "General & Systemic",
  "Respiratory",
  "Respiratory & Pulmonary",
  "Cardiovascular",
  "Cardiovascular & Circulatory",
  "Gastrointestinal",
  "Gastrointestinal & Digestive",
  "Neurological",
  "Neurological & Cognitive",
  "Dermatology",
  "Dermatological & Integumentary",
  "Musculoskeletal",
  "Musculoskeletal & Rheumatic",
  "Endocrine",
  "Endocrine & Metabolic",
  "ENT",
  "Otolaryngology & ENT",
  "Ophthalmology",
  "Ophthalmology & Vision",
  "Urology",
  "Renal & Urological",
  "Hematological & Lymphatic",
  "Mental Health",
  "Psychiatric & Behavioral",
  "Immunological & Allergy",
  "Women's Health",
  "Reproductive & Gynecological",
  "Men's Health",
  "Pediatrics"
] as const;

// All 2,230 Clinical Symptoms loaded directly from CSV
export const MASTER_SYMPTOMS: Symptom[] = MASTER_SYMPTOMS_2000.map(s => ({
  id: s.id,
  name: s.name,
  category: s.category,
  bodySystem: s.bodySystem,
  description: s.description,
  keywords: [...s.aliases, s.medicalTerm.toLowerCase(), s.bodySystem.toLowerCase()],
  severity: s.severity,
  urgency: s.urgency,
  medicalTerm: s.medicalTerm
}));

// Quick Search across all 2,230 symptoms
export function searchSymptoms(queryStr: string, selectedCategory?: string): Symptom[] {
  let list = MASTER_SYMPTOMS;
  if (selectedCategory && selectedCategory !== 'All') {
    const catLower = selectedCategory.toLowerCase();
    list = list.filter(s => 
      s.category.toLowerCase().includes(catLower) || 
      (s.bodySystem && s.bodySystem.toLowerCase().includes(catLower))
    );
  }
  if (!queryStr || !queryStr.trim()) return list;

  const q = queryStr.toLowerCase().trim();
  return list.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    (s.medicalTerm && s.medicalTerm.toLowerCase().includes(q)) ||
    s.keywords.some(k => k.toLowerCase().includes(q))
  );
}

export { MASTER_SYMPTOMS_2000, MASTER_DISEASES_500, KAGGLE_DATASET_STATS };
