export interface DiseaseClinicalProfile {
  name: string;
  category: string;
  defaultRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  severity: string;
  overview: string;
  commonCauses: string[];
  preventionTips: string[];
  lifestyleSuggestions: string[];
  dietRecommendations: {
    foodsToInclude: string[];
    foodsToLimit: string[];
    hydrationTips: string;
    mealPlanSummary: string;
  };
  exerciseRecommendations: {
    activities: string[];
    frequency: string;
    precautions: string;
  };
  followUpAdvice: {
    monitoringTips: string[];
    routineCheckup: string;
    urgentWarningSigns: string[];
  };
}

export const DISEASE_KNOWLEDGE_BASE: Record<string, DiseaseClinicalProfile> = {
  "Fungal infection": {
    name: "Fungal infection",
    category: "Dermatology",
    defaultRisk: "Low",
    severity: "Mild",
    overview: "A superficial fungal infection affecting the epidermis, caused by dermatophytes or yeast proliferating in warm, moist skin folds.",
    commonCauses: ["Prolonged skin moisture and humidity", "Compromised skin barrier or friction", "Contact with contaminated surfaces or fabrics"],
    preventionTips: ["Keep skin clean, dry, and aerated", "Wear breathable cotton clothing", "Avoid sharing personal towels or footwear"],
    lifestyleSuggestions: ["Change damp workout clothes promptly", "Use antifungal powders in high-friction skin creases", "Wash bedding regularly in hot water"],
    dietRecommendations: {
      foodsToInclude: ["Probiotic kefir, unsweetened yogurt", "Garlic, oregano, and leafy greens", "Zinc and vitamin C rich whole foods"],
      foodsToLimit: ["Refined sugars and high-glycemic baked goods", "Yeasty alcoholic beverages", "Processed convenience snacks"],
      hydrationTips: "Drink 2.5L of water daily to support epidermal metabolic turnover.",
      mealPlanSummary: "Low-sugar, anti-inflammatory Mediterranean diet with probiotic support."
    },
    exerciseRecommendations: {
      activities: ["Low-impact walking", "Yoga in cool ventilated room", "Gentle stretching"],
      frequency: "30 mins daily",
      precautions: "Shower immediately after exercise and dry skin folds thoroughly."
    },
    followUpAdvice: {
      monitoringTips: ["Inspect skin lesions daily for expanding margins or spreading redness", "Monitor for secondary bacterial warmth or purulence"],
      routineCheckup: "Consult a dermatologist if not improving within 7 to 10 days of topical care.",
      urgentWarningSigns: ["Rapidly spreading warm erythema with fever", "Pus drainage or severe localized throbbing pain"]
    }
  },
  "Allergy": {
    name: "Allergy",
    category: "Immunology / Respiratory",
    defaultRisk: "Low",
    severity: "Mild to Moderate",
    overview: "An immune-mediated hypersensitivity reaction to airborne allergens (pollen, dust mites, pet dander) causing histaminic inflammation.",
    commonCauses: ["Environmental airborne allergens", "Seasonal tree/grass pollens", "Indoor mold spores or pet dander"],
    preventionTips: ["Keep windows closed during high pollen counts", "Use HEPA air purifiers in bedroom", "Wash face and change clothes after outdoor activities"],
    lifestyleSuggestions: ["Use saline nasal rinses to clear mucosal passages", "Wear sunglasses outdoors on windy days", "Keep indoor humidity below 50%"],
    dietRecommendations: {
      foodsToInclude: ["Quercetin-rich apples, onions, and berries", "Ginger, turmeric, and citrus fruits", "Omega-3 rich chia seeds and salmon"],
      foodsToLimit: ["Histamine-rich aged cheeses and wine", "Artificial food preservatives", "Excess dairy if mucus congestion occurs"],
      hydrationTips: "Drink 2.5L of warm fluids to thin respiratory mucosal secretions.",
      mealPlanSummary: "Anti-inflammatory, polyphenol-dense whole food diet."
    },
    exerciseRecommendations: {
      activities: ["Indoor cycling", "Pilates and light resistance training", "Swimming in non-chlorinated pools"],
      frequency: "4-5 times weekly for 30 minutes",
      precautions: "Avoid outdoor cardio during peak morning pollen hours (5 AM - 10 AM)."
    },
    followUpAdvice: {
      monitoringTips: ["Track daily allergen exposure triggers and symptom spikes", "Record peak nasal and ocular symptom intensity"],
      routineCheckup: "See an allergist if symptoms recur seasonally or impair sleep quality.",
      urgentWarningSigns: ["Swelling of tongue, lips, or throat", "Wheezing, shortness of breath, or dizziness (anaphylaxis)"]
    }
  },
  "GERD": {
    name: "GERD",
    category: "Gastroenterology",
    defaultRisk: "Low",
    severity: "Mild to Moderate",
    overview: "Gastroesophageal Reflux Disease (GERD) is a chronic digestive condition where stomach acid flows back into the esophagus, irritating the lining.",
    commonCauses: ["Lower esophageal sphincter laxity", "Hiatal hernia or elevated intra-abdominal pressure", "High-fat, spicy, or acidic dietary triggers"],
    preventionTips: ["Avoid eating within 3 hours of lying down", "Elevate the head of your bed by 6 inches", "Maintain a healthy body weight"],
    lifestyleSuggestions: ["Eat smaller, more frequent meals rather than large feasts", "Wear loose-fitting clothing around the waist", "Avoid smoking and late-night snacking"],
    dietRecommendations: {
      foodsToInclude: ["Oatmeal, brown rice, and non-citrus fruits (melons, bananas)", "Lean poultry, baked fish, and steamed vegetables", "Ginger and chamomile herbal teas"],
      foodsToLimit: ["Coffee, citrus juices, tomatoes, and chocolate", "Deep-fried fatty foods and spicy seasonings", "Carbonated fizzy beverages and peppermint"],
      hydrationTips: "Sip water between meals rather than chugging large volumes with food.",
      mealPlanSummary: "Alkaline-friendly, high-fiber, low-fat meal planning."
    },
    exerciseRecommendations: {
      activities: ["Upright brisk walking", "Light bodyweight resistance", "Stationary upright bike"],
      frequency: "30 minutes, 5 days per week",
      precautions: "Avoid inverted yoga poses, heavy crunches, or exercising within 2 hours of meals."
    },
    followUpAdvice: {
      monitoringTips: ["Log food triggers and nocturnal reflux episodes", "Note any difficulty swallowing (dysphagia)"],
      routineCheckup: "Consult a gastroenterologist if symptoms persist despite lifestyle adjustments.",
      urgentWarningSigns: ["Difficulty or pain when swallowing food", "Unexplained weight loss or vomiting coffee-ground material"]
    }
  },
  "Diabetes ": {
    name: "Diabetes",
    category: "Endocrinology",
    defaultRisk: "Moderate",
    severity: "Moderate to Chronic",
    overview: "A metabolic disorder characterized by persistent hyperglycemia resulting from defects in insulin secretion, insulin action, or both.",
    commonCauses: ["Peripheral insulin resistance", "Genetic predisposition and pancreatic beta-cell fatigue", "Sedentary lifestyle and high-glycemic nutritional patterns"],
    preventionTips: ["Engage in regular daily physical movement", "Adopt a low-glycemic, fiber-rich dietary regimen", "Monitor fasting and post-prandial blood glucose levels"],
    lifestyleSuggestions: ["Maintain consistent sleep and meal schedules", "Inspect feet daily for micro-abrasions or sores", "Manage psychological stress to stabilize cortisol"],
    dietRecommendations: {
      foodsToInclude: ["Non-starchy vegetables (spinach, broccoli, cauliflower)", "Legumes, lentils, chia seeds, and whole oats", "Lean proteins (tofu, skinless poultry, wild fish)"],
      foodsToLimit: ["Sugary beverages, sodas, and sweetened syrups", "Refined white flour, pastries, and candy", "High-glycemic tropical dried fruits"],
      hydrationTips: "Drink 3.0L of pure water daily to support renal glucose clearance.",
      mealPlanSummary: "Low glycemic-index (GI) Mediterranean diet with balanced complex carbohydrates."
    },
    exerciseRecommendations: {
      activities: ["Brisk walking (10,000 steps daily)", "Resistance / strength training 3x weekly", "Post-meal 15-minute gentle walks"],
      frequency: "150-180 minutes of moderate activity weekly",
      precautions: "Keep rapid-acting glucose tablets on hand if prone to hypoglycemia."
    },
    followUpAdvice: {
      monitoringTips: ["Check fasting blood sugar and HbA1c every 3 months", "Track blood pressure and lipid profile semi-annually"],
      routineCheckup: "Schedule regular consultations with an endocrinologist and certified diabetes educator.",
      urgentWarningSigns: ["Blood glucose >300 mg/dL with nausea/vomiting (DKA risk)", "Extreme lethargy, confusion, or fruity breath odor"]
    }
  },
  "Bronchial Asthma": {
    name: "Bronchial Asthma",
    category: "Pulmonology",
    defaultRisk: "Moderate",
    severity: "Moderate",
    overview: "A chronic inflammatory disorder of the airways causing bronchial hyper-responsiveness, reversible airflow obstruction, and bronchospasm.",
    commonCauses: ["Environmental allergens, dust mites, or cold dry air", "Respiratory viral infections", "Exercise-induced airway thermal shifts"],
    preventionTips: ["Identify and eliminate personal environmental triggers", "Use dust-mite proof mattress and pillow encasings", "Always carry prescribed quick-relief rescue inhaler"],
    lifestyleSuggestions: ["Check local air quality index (AQI) before outdoor activities", "Perform breathing warm-ups before physical exertion", "Practice pursed-lip diaphragmatic breathing techniques"],
    dietRecommendations: {
      foodsToInclude: ["Magnesium-rich dark leafy greens and seeds", "Vitamin D fortified foods and wild fatty fish", "Antioxidant-dense berries and apples"],
      foodsToLimit: ["Sulfite-containing dried fruits, wines, and pickled foods", "Excessive artificial food colorings", "Heavy cold ice drinks during flareups"],
      hydrationTips: "Drink 2.5L of warm or room-temperature liquids to maintain fluid mucus consistency.",
      mealPlanSummary: "Antioxidant-dense anti-inflammatory meal plan."
    },
    exerciseRecommendations: {
      activities: ["Swimming in warm humid environments", "Walking and gentle hiking", "Controlled indoor cycling"],
      frequency: "30 minutes 4-5 times weekly",
      precautions: "Perform a 10-minute gradual warm-up and avoid exercising in freezing cold air."
    },
    followUpAdvice: {
      monitoringTips: ["Measure peak expiratory flow (PEF) daily using a personal peak flow meter", "Track daytime and nocturnal awakenings"],
      routineCheckup: "Review asthma action plan with a pulmonologist every 6 months.",
      urgentWarningSigns: ["Severe breathlessness with inability to speak in full sentences", "Cyanosis (blueness of lips/fingers) or peak flow <50% of personal best"]
    }
  },
  "Hypertension ": {
    name: "Hypertension",
    category: "Cardiovascular",
    defaultRisk: "Moderate",
    severity: "Moderate to Chronic",
    overview: "A sustained elevation of systemic arterial blood pressure (systolic ≥130 mmHg or diastolic ≥80 mmHg), increasing cardiovascular risk.",
    commonCauses: ["Excess dietary sodium intake", "Arterial stiffness and vascular remodeling", "Chronic psychological stress and sedentary lifestyle"],
    preventionTips: ["Adhere to the DASH (Dietary Approaches to Stop Hypertension) diet", "Restrict daily sodium to less than 1,500 - 2,000 mg", "Maintain a healthy body weight and waist circumference"],
    lifestyleSuggestions: ["Practice daily 15-minute mindfulness or biofeedback", "Limit alcohol consumption to moderate thresholds", "Ensure 7-8 hours of restful restorative sleep"],
    dietRecommendations: {
      foodsToInclude: ["Potassium-rich bananas, avocados, and sweet potatoes", "Leafy green vegetables, beets, and garlic", "Flaxseed, walnuts, and extra-virgin olive oil"],
      foodsToLimit: ["Processed deli meats, canned soups, and salty chips", "Excess caffeine and energy drinks", "Saturated animal fats and trans fats"],
      hydrationTips: "Drink 2.5L of fresh water; avoid sodium-heavy mineral beverages.",
      mealPlanSummary: "DASH dietary pattern rich in whole grains, potassium, magnesium, and calcium."
    },
    exerciseRecommendations: {
      activities: ["Aerobic walking, jogging, or cycling", "Moderate swimming", "Low-intensity interval training"],
      frequency: "30-45 minutes daily (at least 150 mins/week)",
      precautions: "Avoid heavy isometric straining (e.g., maximum-load bench press) that spikes acute BP."
    },
    followUpAdvice: {
      monitoringTips: ["Record home blood pressure readings morning and evening using an upper-arm cuff", "Keep an indexed log for physician review"],
      routineCheckup: "Consult with your primary care physician or cardiologist quarterly.",
      urgentWarningSigns: ["Systolic BP >180 mmHg or diastolic >120 mmHg (Hypertensive Crisis)", "Chest pain, severe occipital headache, or blurred vision"]
    }
  },
  "Migraine": {
    name: "Migraine",
    category: "Neurology",
    defaultRisk: "Low",
    severity: "Moderate",
    overview: "A neurological condition characterized by recurrent, intense throbbing unilateral headaches, frequently accompanied by nausea and sensory sensitivity.",
    commonCauses: ["Neurovascular trigeminal activation", "Hormonal fluctuations or stress triggers", "Sensory overload, flickering lights, or skipped meals"],
    preventionTips: ["Maintain strict consistent sleep and meal schedules", "Identify and avoid dietary triggers (aged cheese, MSG, nitrates)", "Wear polarized sunglasses in bright sunlight"],
    lifestyleSuggestions: ["Rest in a dark, quiet, sound-dampened room during an acute attack", "Apply cold gel packs to forehead or warm packs to neck", "Engage in progressive muscle relaxation daily"],
    dietRecommendations: {
      foodsToInclude: ["Magnesium-rich almonds, pumpkin seeds, and spinach", "Riboflavin (B2) rich eggs and whole grains", "CoQ10 rich lean meats and fish"],
      foodsToLimit: ["Aged cheeses, cured meats with nitrates, and MSG", "Red wines and artificial sweeteners (aspartame)", "Irregular caffeine fluctuations"],
      hydrationTips: "Drink 2.8L of water daily to prevent dehydration-induced cortical spreading depression.",
      mealPlanSummary: "Consistent, low-tyramine, balanced whole-food diet."
    },
    exerciseRecommendations: {
      activities: ["Low-impact aerobic walking", "Gentle yoga and neck stretches", "Tai Chi"],
      frequency: "30 minutes 3-4 times weekly on attack-free days",
      precautions: "Avoid sudden explosive anaerobic bursts that might trigger vascular headaches."
    },
    followUpAdvice: {
      monitoringTips: ["Maintain a headache diary tracking duration, intensity (1-10), and aura symptoms", "Note correlation with sleep, stress, or diet"],
      routineCheckup: "Consult a neurologist for preventative or abortive pharmacological regimens if headaches occur >4 days/month.",
      urgentWarningSigns: ["Sudden explosive 'thunderclap' onset", "Headache with fever, stiff neck, mental confusion, or focal weakness"]
    }
  },
  "Malaria": {
    name: "Malaria",
    category: "Infectious Disease",
    defaultRisk: "High",
    severity: "Severe",
    overview: "A life-threatening mosquito-borne infectious disease caused by Plasmodium parasites transmitted through the bites of infected female Anopheles mosquitoes.",
    commonCauses: ["Bite of infected Anopheles mosquito", "Travel to endemic tropical / subtropical regions", "Rarely, blood transfusion or needle sharing"],
    preventionTips: ["Sleep under insecticide-treated bed nets (ITNs)", "Apply DEET (20-30%) insect repellent to exposed skin", "Take prescribed prophylactic antimalarial medication when traveling to endemic zones"],
    lifestyleSuggestions: ["Wear light-colored, long-sleeved shirts and trousers during dawn/dusk", "Eliminate stagnant standing water pools around residence", "Install fine-mesh window screens"],
    dietRecommendations: {
      foodsToInclude: ["Fresh coconut water and oral rehydration solution (ORS)", "Easily digestible khichdi, rice congee, and clear vegetable broths", "Vitamin C rich citrus fruits to aid hepatic recovery"],
      foodsToLimit: ["Heavy, greasy, deep-fried foods", "Spicy curries and caffeinated drinks", "Processed sugary confectionery"],
      hydrationTips: "Drink 3.0 to 3.5L of fluid daily to replace losses from profuse febrile diaphoresis.",
      mealPlanSummary: "High-calorie, easily assimilable fluid-rich diet."
    },
    exerciseRecommendations: {
      activities: ["Strict bed rest during acute infection", "Short gentle room walks only when afebrile"],
      frequency: "As tolerated after medical clearance",
      precautions: "Avoid any moderate to strenuous physical exertion to protect splenic integrity."
    },
    followUpAdvice: {
      monitoringTips: ["Check body temperature every 4 hours during paroxysms", "Monitor for jaundice, dark urine, or pallor"],
      routineCheckup: "Immediate laboratory diagnostic confirmation (blood smear microscopy or RDT) and physician-directed antimalarial therapy (ACT).",
      urgentWarningSigns: ["Extreme lethargy, altered consciousness, or convulsions (Cerebral Malaria)", "Severe vomiting preventing oral medications, or blackwater urine"]
    }
  },
  "Dengue": {
    name: "Dengue",
    category: "Infectious Disease",
    defaultRisk: "High",
    severity: "Severe",
    overview: "An acute viral infection transmitted by Aedes mosquitoes characterized by high fever, severe retro-orbital headache, arthralgia ('breakbone fever'), and potential thrombocytopenia.",
    commonCauses: ["Bite of infected Aedes aegypti mosquito", "Daytime mosquito biting activity in tropical climates", "Secondary infection with different dengue serotype (increased severe dengue risk)"],
    preventionTips: ["Eliminate all standing water in flowerpots, buckets, and tires", "Use mosquito repellents and install window wire meshes", "Wear protective long-sleeve clothing during daytime hours"],
    lifestyleSuggestions: ["Strict bed rest to promote immunological recovery", "Avoid taking aspirin, ibuprofen, or NSAIDs which worsen bleeding risk", "Use paracetamol only under medical guidance for fever"],
    dietRecommendations: {
      foodsToInclude: ["Fresh papaya leaf extract syrup (under clinical supervision)", "Pomegranate juice, kiwi, and tender coconut water", "High-protein lentil soups and soft boiled eggs"],
      foodsToLimit: ["Red or dark colored foods (to avoid confusing with GI bleeding)", "Deep-fried, spicy, and acidic foods", "Commercial sugary sodas"],
      hydrationTips: "Drink 3.5 to 4.0L of fluids (ORS, coconut water, soups) to counteract plasma leakage.",
      mealPlanSummary: "High-fluid, nutrient-dense soft meal plan."
    },
    exerciseRecommendations: {
      activities: ["Strict bed rest throughout the febrile and critical phases", "Gentle passive mobility only during recovery phase"],
      frequency: "None during active illness",
      precautions: "Avoid physical strain or contact activities to prevent hemorrhagic injury."
    },
    followUpAdvice: {
      monitoringTips: ["Daily complete blood count (CBC) to monitor platelet count and hematocrit levels", "Check skin for petechiae or bruising"],
      routineCheckup: "Daily medical evaluation during the critical phase (days 3-7 of illness).",
      urgentWarningSigns: ["Severe abdominal pain or persistent vomiting", "Bleeding from gums, nose, or skin, or extreme lethargy (Dengue Shock Syndrome)"]
    }
  },
  "Typhoid": {
    name: "Typhoid",
    category: "Infectious Disease",
    defaultRisk: "Moderate",
    severity: "Moderate to Severe",
    overview: "A systemic bacterial infection caused by Salmonella enterica serotype Typhi, transmitted via contaminated food and water.",
    commonCauses: ["Ingestion of fecal-contaminated drinking water or food", "Inadequate food preparation hygiene or unpeeled raw produce", "Carriers handling food without hand sanitation"],
    preventionTips: ["Drink only boiled or certified purified bottled water", "Eat thoroughly cooked piping-hot foods; avoid street-food raw salads", "Receive typhoid conjugate vaccination prior to travel"],
    lifestyleSuggestions: ["Practice rigorous handwashing with soap before eating and after restrooms", "Maintain separate personal utensils and towels", "Sanitize kitchen surfaces thoroughly"],
    dietRecommendations: {
      foodsToInclude: ["Soft cooked rice, boiled potatoes, and porridge", "Custard, clear strained broths, and stewed apples", "Oral rehydration solution and light herbal teas"],
      foodsToLimit: ["High-fiber raw bran, seeds, and uncooked coarse vegetables (to spare inflamed bowel)", "Spicy, oily foods and heavy dairy creams", "Gas-forming foods like cabbage and onions"],
      hydrationTips: "Drink 3.0L of boiled cooled water with electrolytes daily.",
      mealPlanSummary: "Bland, low-residue, high-calorie, easily digestible diet."
    },
    exerciseRecommendations: {
      activities: ["Rest in bed during febrile period", "Short walks only after temperature normalizes for 48 hours"],
      frequency: "Rest-focused",
      precautions: "Avoid heavy lifting or abdominal strain due to risk of intestinal perforation."
    },
    followUpAdvice: {
      monitoringTips: ["Record step-ladder fever trajectory every 6 hours", "Observe stool consistency and monitor for occult bleeding"],
      routineCheckup: "Complete the full antibiotic course prescribed by your physician; follow up with stool culture testing.",
      urgentWarningSigns: ["Severe sudden sharp abdominal pain with rigidity", "Confusion, delirium ('typhoid state'), or passing dark tarry stools"]
    }
  },
  "Common Cold": {
    name: "Common Cold",
    category: "Respiratory",
    defaultRisk: "Low",
    severity: "Mild",
    overview: "A mild, self-limiting viral upper respiratory tract infection predominantly caused by rhinoviruses, causing rhinorrhea, nasal congestion, and mild sore throat.",
    commonCauses: ["Rhinovirus or seasonal coronavirus transmission", "Aerosolized droplets from coughing/sneezing individuals", "Contact with contaminated fomites (doorknobs, handrails)"],
    preventionTips: ["Frequent 20-second hand hygiene with soap and water", "Avoid touching eyes, nose, or mouth with unwashed hands", "Disinfect high-touch workplace and home surfaces"],
    lifestyleSuggestions: ["Get 8-9 hours of restful restorative sleep", "Use saline nasal sprays or warm steam inhalations", "Gargle with warm salt water for throat comfort"],
    dietRecommendations: {
      foodsToInclude: ["Warm chicken bone broth or vegetable stew", "Citrus fruits, kiwi, and bell peppers (Vitamin C)", "Ginger-honey tea and warm spiced turmeric milk"],
      foodsToLimit: ["Ice-cold beverages and ice cream", "Excessive refined sugars", "Caffeinated and alcoholic beverages"],
      hydrationTips: "Drink 2.5 to 3.0L of warm fluids to soothe inflamed mucosal membranes.",
      mealPlanSummary: "Warm, soothing, immune-supportive fluid and soup-based diet."
    },
    exerciseRecommendations: {
      activities: ["Gentle 15-minute walks if symptoms are above the neck", "Gentle stretching and mobility work"],
      frequency: "Light activity only if energy permits",
      precautions: "Rest completely if experiencing fever, chest congestion, or body aches."
    },
    followUpAdvice: {
      monitoringTips: ["Check that symptoms peak around day 3 and steadily resolve by day 7-10", "Monitor for secondary ear pain or sinus fullness"],
      routineCheckup: "Consult a primary care physician if symptoms persist beyond 10-14 days.",
      urgentWarningSigns: ["High unremitting fever >38.9°C (102°F)", "Shortness of breath, chest tightness, or productive green-rusty sputum"]
    }
  },
  "Pneumonia": {
    name: "Pneumonia",
    category: "Pulmonology",
    defaultRisk: "High",
    severity: "Severe",
    overview: "An acute inflammatory infection of one or both lungs' alveoli, filling air sacs with fluid or pus, caused by bacterial, viral, or fungal pathogens.",
    commonCauses: ["Streptococcus pneumoniae or atypical bacterial pathogens", "Respiratory viral complications (Influenza, RSV)", "Aspiration of secretions in vulnerable individuals"],
    preventionTips: ["Receive pneumococcal and annual influenza vaccinations", "Maintain strict respiratory hygiene and handwashing", "Quit smoking and avoid secondhand smoke exposure"],
    lifestyleSuggestions: ["Strict bed rest in a propped-up 30-45 degree posture", "Use an incentive spirometer to expand lung bases", "Keep indoor air humidified and smoke-free"],
    dietRecommendations: {
      foodsToInclude: ["High-protein chicken soups, soft eggs, and pureed lentils", "Antioxidant-rich berries and green smoothies", "Warm electrolyte broths and honeyed teas"],
      foodsToLimit: ["Cold dairy products if they trigger thick phlegm sensation", "Hard-to-chew dry foods", "Excess salt and processed meats"],
      hydrationTips: "Drink 3.0L of warm fluids daily to facilitate expectoration of pulmonary secretions.",
      mealPlanSummary: "High-protein, energy-dense, easy-to-chew healing diet."
    },
    exerciseRecommendations: {
      activities: ["Deep diaphragmatic breathing exercises and supported coughing", "Bedside sitting and minimal transfers"],
      frequency: "Hourly breathing exercises during waking hours",
      precautions: "No aerobic or strenuous exercise until full radiological resolution and doctor approval."
    },
    followUpAdvice: {
      monitoringTips: ["Continuous or frequent pulse oximetry monitoring (SpO2 ≥95%)", "Track respiratory rate and temperature every 4 hours"],
      routineCheckup: "Urgent medical consult with primary physician/pulmonologist for antibiotic/antiviral management and follow-up chest X-ray.",
      urgentWarningSigns: ["Oxygen saturation dropping below 92%", "Severe chest pleuritic pain, cyanosis, or confusion"]
    }
  },
  "Heart attack": {
    name: "Heart attack",
    category: "Cardiology",
    defaultRisk: "Critical",
    severity: "Life-Threatening Emergency",
    overview: "Myocardial Infarction (Heart Attack) occurs when blood flow decreases or stops to a part of the heart muscle, causing cellular ischemia and myocardial necrosis.",
    commonCauses: ["Coronary artery atherosclerotic plaque rupture and thrombosis", "Coronary artery vasospasm", "Severe oxygen supply-demand mismatch"],
    preventionTips: ["Rigorous management of blood pressure, cholesterol, and diabetes", "Zero tobacco use and avoidance of secondhand smoke", "Cardioprotective Mediterranean diet and active lifestyle"],
    lifestyleSuggestions: ["Enroll in supervised Cardiac Rehabilitation following acute recovery", "Implement stress management and cardiac relaxation protocols", "Maintain structured sleep schedules"],
    dietRecommendations: {
      foodsToInclude: ["Omega-3 rich wild salmon, mackerel, and walnuts", "High-fiber oats, legumes, and dark leafy greens", "Extra-virgin olive oil and garlic"],
      foodsToLimit: ["Trans-fats, saturated meats, and deep-fried fast foods", "Sodium >1,500mg daily", "Refined carbohydrates and added sugars"],
      hydrationTips: "Drink 2.0 to 2.5L daily (or as restricted by cardiologist for heart failure).",
      mealPlanSummary: "Cardioprotective Mediterranean Diet."
    },
    exerciseRecommendations: {
      activities: ["Supervised cardiac rehab walking and progressive conditioning only", "Light mobility under physician guidance"],
      frequency: "Structured rehabilitation schedule",
      precautions: "NEVER exercise independently during acute chest discomfort; stop immediately if dizzy or breathless."
    },
    followUpAdvice: {
      monitoringTips: ["Emergency hospitalization required immediately upon symptom onset", "Strict compliance with antiplatelet, statin, and beta-blocker prescriptions"],
      routineCheckup: "Close cardiology follow-up with echocardiography and lipid monitoring.",
      urgentWarningSigns: ["Crushing substernal chest pressure radiating to jaw, neck, arm, or back", "Shortness of breath, cold sweating, lightheadedness, or sudden nausea"]
    }
  }
};

export function getDiseaseClinicalProfile(diseaseName: string): DiseaseClinicalProfile {
  const cleanName = diseaseName.trim();
  if (DISEASE_KNOWLEDGE_BASE[cleanName]) {
    return DISEASE_KNOWLEDGE_BASE[cleanName];
  }

  // Generic clinical profile for other classes
  return {
    name: cleanName,
    category: "General Medicine",
    defaultRisk: cleanName.toLowerCase().includes('heart') || cleanName.toLowerCase().includes('paralysis') || cleanName.toLowerCase().includes('pneumonia') ? "High" : "Low",
    severity: "Moderate",
    overview: `${cleanName} is a clinical condition characterized by pathognomonic symptom clustering. Early evaluation and lifestyle optimization facilitate optimal recovery.`,
    commonCauses: [
      "Microbial pathogen exposure or transient immune compromise",
      "Environmental stress factors and metabolic strain",
      "Lifestyle factors including sleep deprivation or nutritional deficits"
    ],
    preventionTips: [
      "Maintain personal and hand hygiene protocols",
      "Ensure balanced nutrition and adequate hydration",
      "Schedule regular preventative health checkups"
    ],
    lifestyleSuggestions: [
      "Get 7-8 hours of restful sleep daily",
      "Engage in light, restorative movement as physical comfort permits",
      "Avoid smoking and reduce exposure to environmental toxins"
    ],
    dietRecommendations: {
      foodsToInclude: ["Antioxidant-dense leafy vegetables", "Lean proteins and whole grains", "Fresh fruits and clean fluids"],
      foodsToLimit: ["Ultra-processed high-sodium foods", "Refined sugary snacks", "Excess caffeine and alcohol"],
      hydrationTips: "Aim for 2.5 to 3.0 Liters of water daily to support metabolic clearance.",
      mealPlanSummary: "Balanced anti-inflammatory whole-food diet."
    },
    exerciseRecommendations: {
      activities: ["Gentle walking 20-30 mins", "Light stretching and deep breathing"],
      frequency: "Daily as tolerated",
      precautions: "Rest immediately if fatigue or discomfort worsens."
    },
    followUpAdvice: {
      monitoringTips: ["Track symptom severity progression in the app dashboard", "Record daily vitals and notes"],
      routineCheckup: "Consult with a licensed medical practitioner for personalized assessment.",
      urgentWarningSigns: ["High persistent fever (>102.5°F)", "Difficulty breathing, chest pain, or sudden neurological weakness"]
    }
  };
}
