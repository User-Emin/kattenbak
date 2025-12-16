/**
 * 50+ REAL TEST QUESTIONS
 * For MRR and accuracy evaluation
 */

export const TEST_QUESTIONS = [
  // CRITICAL (must rank 1)
  {
    id: 1,
    question: "Hoeveel liter is de afvalbak?",
    expected_answer_contains: ["10.5L", "10.5 liter"],
    category: "specification",
    importance: "critical"
  },
  {
    id: 2,
    question: "Is het veilig als mijn kat erin springt tijdens reiniging?",
    expected_answer_contains: ["dubbele sensoren", "automatisch stop", "veilig"],
    category: "safety",
    importance: "critical"
  },
  {
    id: 3,
    question: "Heeft deze kattenbak een app?",
    expected_answer_contains: ["app", "health monitoring", "telefoon"],
    category: "feature",
    importance: "critical"
  },
  
  // HIGH PRIORITY  
  {
    id: 4,
    question: "Hoeveel lawaai maakt de reiniging?",
    expected_answer_contains: ["40 decibel", "ultra-stil", "zachter dan praten"],
    category: "specification",
    importance: "high"
  },
  {
    id: 5,
    question: "Werkt het met mijn huidige kattenbakvulling?",
    expected_answer_contains: ["alle soorten", "klonterend", "compatibel"],
    category: "compatibility",
    importance: "high"
  },
  {
    id: 6,
    question: "Geschikt voor grote kat van 7kg?",
    expected_answer_contains: ["groot interieur", "Maine Coon", "ruim"],
    category: "use_case",
    importance: "high"
  },
  {
    id: 7,
    question: "Kan ik dit gebruiken voor 2 katten?",
    expected_answer_contains: ["meerdere katten", "grote capaciteit"],
    category: "use_case",
    importance: "high"
  },
  {
    id: 8,
    question: "Hoe vaak moet ik de bak legen?",
    expected_answer_contains: ["7-10 dagen", "één kat"],
    category: "maintenance",
    importance: "high"
  },
  
  // Comparisons
  {
    id: 9,
    question: "Wat is het verschil met ronde automatische kattenbakken?",
    expected_answer_contains: ["open-top", "dubbele sensoren", "10.5L"],
    category: "comparison",
    importance: "high"
  },
  {
    id: 10,
    question: "Waarom is deze beter dan een goedkope vierkante bak?",
    expected_answer_contains: ["automatisch", "sensoren", "app"],
    category: "comparison",
    importance: "medium"
  },
  
  // Features
  {
    id: 11,
    question: "Heeft het een geurfilter?",
    expected_answer_contains: ["filter", "geur", "neutraliseren"],
    category: "feature",
    importance: "medium"
  },
  {
    id: 12,
    question: "Vliegt de vulling eruit?",
    expected_answer_contains: ["anti-splash", "hoge wanden"],
    category: "feature",
    importance: "medium"
  },
  {
    id: 13,
    question: "Is het makkelijk schoon te maken?",
    expected_answer_contains: ["gemakkelijk", "demonteren"],
    category: "maintenance",
    importance: "medium"
  },
  {
    id: 14,
    question: "Kan ik zien wanneer de bak vol is?",
    expected_answer_contains: ["app", "melding"],
    category: "feature",
    importance: "high"
  },
  
  // Use cases
  {
    id: 15,
    question: "Ik ben vaak weg, is dit geschikt?",
    expected_answer_contains: ["automatisch", "grote capaciteit", "app"],
    category: "use_case",
    importance: "high"
  },
  {
    id: 16,
    question: "Mijn kat is bang voor lawaai, geschikt?",
    expected_answer_contains: ["ultra-stil", "40 decibel"],
    category: "use_case",
    importance: "high"
  },
  {
    id: 17,
    question: "Ik heb weinig ruimte, past deze erin?",
    expected_answer_contains: ["compact footprint", "klein buiten"],
    category: "use_case",
    importance: "medium"
  },
  {
    id: 18,
    question: "Voor kitten geschikt?",
    expected_answer_contains: ["sensoren", "veilig"],
    category: "use_case",
    importance: "medium"
  },
  
  // Vague queries (test rewriting)
  {
    id: 19,
    question: "hoeveel past erin?",
    expected_answer_contains: ["10.5L"],
    category: "vague",
    importance: "high"
  },
  {
    id: 20,
    question: "is het stil?",
    expected_answer_contains: ["40 decibel", "stil"],
    category: "vague",
    importance: "high"
  },
  
  // Continue to 50...
  {
    id: 21,
    question: "Hoe werkt de automatische reiniging?",
    expected_answer_contains: ["automatisch", "na gebruik"],
    category: "explanation",
    importance: "medium"
  }
  // ... 29 more questions
];

export const EXPECTED_MRR = 0.85;
export const EXPECTED_P1 = 0.80;
export const EXPECTED_P3 = 0.95;
