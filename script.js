const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const cardsContainer = document.getElementById("cardsContainer");
const resultsInfo = document.getElementById("resultsInfo");
const preSearchPanel = document.getElementById("preSearchPanel");
const factCarouselPanel = document.getElementById("factCarouselPanel");
const factCarouselContent = document.getElementById("factCarouselContent");
const toggleFactsBtn = document.getElementById("toggleFactsBtn");
const factText = document.getElementById("factText");
const factDots = document.getElementById("factDots");
const tipText = document.getElementById("tipText");
const tipDots = document.getElementById("tipDots");
const groupChips = document.getElementById("groupChips");
const installHelper = document.getElementById("installHelper");
const installHelperText = document.getElementById("installHelperText");
const installHelperBtn = document.getElementById("installHelperBtn");
const drawModal = document.getElementById("drawModal");
const drawResultCard = document.getElementById("drawResultCard");
const drawPlannerCount = document.getElementById("drawPlannerCount");
const drawGroups = document.getElementById("drawGroups");
const drawPlannerNote = document.getElementById("drawPlannerNote");
const openDrawPlannerBtn = document.getElementById("openDrawPlannerBtn");
const closeDrawPlannerBtn = document.getElementById("closeDrawPlannerBtn");
const drawSearchInput = document.getElementById("drawSearchInput");
const drawSearchClearBtn = document.getElementById("drawSearchClearBtn");
const selectVisibleDrawBtn = document.getElementById("selectVisibleDrawBtn");
const clearDrawSelectionBtn = document.getElementById("clearDrawSelectionBtn");
const drawSelectionList = document.getElementById("drawSelectionList");
const drawSelectionCount = document.getElementById("drawSelectionCount");
const submitDrawSelectionBtn = document.getElementById("submitDrawSelectionBtn");
const profileModal = document.getElementById("profileModal");
const profileModalTitle = document.getElementById("profileModalTitle");
const profileModalList = document.getElementById("profileModalList");
const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");

let deferredInstallPrompt = null;
const selectedTestNames = new Set();
let stagedSelectedTestNames = new Set();
let activeSectionGroup = "";
let drawVisibleCandidateNames = [];
let hasCalculatedDrawPlan = false;

function setResultsInfo(text) {
  if (!resultsInfo) return;
  const message = String(text || "");
  resultsInfo.textContent = message;
  resultsInfo.hidden = message.length === 0;
}

function updateSearchClearButton() {
  if (!searchInput || !searchClearBtn) return;
  const hasQuery = searchInput.value.trim().length > 0;
  searchClearBtn.hidden = !hasQuery;
}

function updateDrawSearchClearButton() {
  if (!drawSearchInput || !drawSearchClearBtn) return;
  const hasQuery = drawSearchInput.value.trim().length > 0;
  drawSearchClearBtn.hidden = !hasQuery;
}

function keepDrawSearchFocus(shouldKeepFocus) {
  if (!shouldKeepFocus || !drawSearchInput) return;
  window.requestAnimationFrame(() => {
    if (drawModal?.hidden) return;
    if (document.activeElement === drawSearchInput) return;
    const cursorEnd = drawSearchInput.value.length;
    drawSearchInput.focus({ preventScroll: true });
    if (typeof drawSearchInput.setSelectionRange === "function") {
      drawSearchInput.setSelectionRange(cursorEnd, cursorEnd);
    }
  });
}

const exactDrawRules = [
  {
    id: "full-blood-and-grouping",
    tests: ["FBC", "ESR", "HbA1c", "Blood Group & Rh"],
    items: [{ key: "Purple", label: "Purple", count: 2 }]
  },
  {
    id: "coagulation-panel",
    tests: ["INR", "Prothrombin Time (PT)", "Partial Thromboplastin Time (PTT)", "D-Dimer"],
    items: [{ key: "Blue", label: "Blue", count: 1 }]
  },
  {
    id: "chemistry-core",
    tests: ["U&E", "CRP", "Liver Function Tests (LFT)", "Lipid Profile / Lipogram"],
    items: [{ key: "Gold/Yellow", label: "Gold/Yellow", count: 1 }]
  },
  {
    id: "thyroid-panel",
    tests: ["TSH", "Free T4", "Free T3", "Thyroid Antibodies (TPO and Tg Ab)"],
    items: [{ key: "Gold/Yellow", label: "Gold/Yellow", count: 1 }]
  },
  {
    id: "cardiac-panel",
    tests: ["Troponin I", "CK Total", "LDH", "NT-proBNP"],
    items: [
      { key: "Green", label: "Green", count: 1, detail: "Preferred tube for most urgent cardiac marker workflows." },
      { key: "Gold/Yellow", label: "Gold/Yellow", count: 1, detail: "Acceptable alternative if local policy uses serum collection." }
    ]
  },
  {
    id: "glucose-ogtt-panel",
    tests: ["Glucose Fasting", "Insulin (Fasting)", "OGTT (2hr)", "HbA1c"],
    items: [
      { key: "Gray", label: "Gray", count: 2, detail: "Second gray tube at 2 hours for OGTT." },
      { key: "Purple", label: "Purple", count: 1 }
    ]
  },
  {
    id: "tumour-markers-core",
    tests: ["PSA", "CEA", "CA 19-9", "CA 125"],
    items: [{ key: "Gold/Yellow", label: "Gold/Yellow", count: 1 }]
  },
  {
    id: "sepsis-culture-panel",
    tests: ["Blood Culture", "Procalcitonin (PCT)", "Lactate", "CRP"],
    items: [
      { key: "Blood Culture Bottles", label: "Blood Culture Bottles", count: 2, detail: "Anaerobic and aerobic bottles." },
      { key: "Gold/Yellow", label: "Gold/Yellow", count: 1 }
    ]
  },
  {
    id: "antenatal-profile",
    tests: ["Antenatal Screen (ANTINV)"],
    items: [
      { key: "Purple", label: "Purple", count: 2, detail: "FBC, blood grouping, and antenatal antibody screen coverage." },
      { key: "Gold/Yellow", label: "Gold/Yellow", count: 3, detail: "Includes dedicated HIV and RPR tubes plus additional antenatal serology." },
      { key: "Gray", label: "Gray", count: 1, detail: "For glucose." }
    ]
  }
];

const profileComponentsByName = {
  "FBC": [
    "Haemoglobin",
    "WBC and Differential Count",
    "RBC Count",
    "Haematocrit (HCT)",
    "MCV",
    "MCH",
    "MCHC",
    "Platelet Count"
  ],
  "Fe Studies": [
    "Serum Iron (Fe)",
    "Ferritin",
    "Transferrin",
    "TIBC",
    "Transferrin Saturation (Calculated)"
  ],
  "DIC Screen": [
    "Prothrombin Time (PT)",
    "Partial Thromboplastin Time (PTT)",
    "Fibrinogen",
    "XDP (D-Dimer)"
  ],
  "Coagulation Studies": [
    "Prothrombin Time (PT)",
    "Partial Thromboplastin Time (PTT)",
    "INR"
  ],
  "Antenatal Screen (ANTINV)": [
    "Blood Group & Rh",
    "RBC Antibody Screen (Antenatal)",
    "FBC",
    "HIV ELISA",
    "RPR (Syphilis Screen)",
    "Hepatitis B Surface Antigen (HBsAg)",
    "Rubella IgG only",
    "Glucose"
  ],
  "Arthritis Profile": [
    "ESR",
    "CRP",
    "Uric Acid",
    "Rheumatoid Factor (RF)",
    "Anti-CCP Antibody"
  ],
  "Malaria Profile": [
    "Malaria Smear (Thick and Thin)",
    "Malaria Smear and Antigen",
    "Malaria PCR (with ID if Positive)"
  ],
  "Lipid Profile / Lipogram": [
    "Cholesterol Total",
    "HDL Cholesterol",
    "LDL Cholesterol",
    "Triglycerides",
    "Non-HDL Cholesterol (Calculated)"
  ],
  "Thyroid Function Test (TFT)": [
    "TSH",
    "Free T4",
    "Free T3"
  ],
  "U&E": ["Urea", "Chloride", "Potassium", "Sodium", "Creatinine", "eGFR (Calculated)"],
  "Blood Gases": ["pH", "pCO2", "pO2", "HCO3-", "Base Excess", "O2 Saturation", "Lactate"],
  "Liver Function Tests (LFT)": [
    "ALT",
    "AST",
    "ALP",
    "GGT",
    "Total Bilirubin",
    "Direct Bilirubin",
    "Indirect Bilirubin",
    "LD (On Request)",
    "Albumin",
    "Total Protein",
    "Globulins"
  ],
  "CMP": [
    "Calcium",
    "Magnesium",
    "Phosphate",
    "Alb",
    "Corrected Calcium"
  ]
};

const facts = [
  "Biochemistry profiles like U&E and LFT are commonly serum-based (gold-top) in routine workflows.",
  "Haematology tests often use EDTA tubes, while coagulation studies generally use citrate tubes.",
  "Microbiology and molecular tests are usually specimen-specific and not tied to one blood tube.",
  "Selecting by lab area first can reduce request form errors before sample collection.",
  "Pre-analytical errors (labeling, timing, and transport) can affect results more than analyzer performance.",
  "Cardiac markers are most useful when interpreted with symptom timing and serial sampling.",
  "In suspected sepsis, blood cultures are ideally collected before antibiotics where clinically feasible.",
  "Specimen handling quality has a major impact on result reliability.",
  "A focused test request often reduces redraws and speeds up clinical decision-making."
];

const factTips = [
  "Label each sample immediately at bedside to reduce ID errors.",
  "Gently invert anticoagulant tubes after collection; do not shake.",
  "Fill citrate tubes to the marked line for accurate coagulation results.",
  "Send time-sensitive specimens promptly to avoid delays in reporting.",
  "Avoid drawing from lines with active infusions unless protocol supports it.",
  "Confirm fasting status for requested profiles when clinically indicated.",
  "Protect light-sensitive specimens per lab policy during transport.",
  "For urgent samples, notify the lab in advance to shorten processing delays.",
  "Document collection time clearly for tests with strict timing requirements."
];

const sectionMeta = {
  chemistry: { label: "Biochemistry" },
  endocrinology: { label: "Endocrinology" },
  tumour_markers: { label: "Tumour Markers" },
  metabolic_genetic: { label: "Metabolic / Genetic Disorders" },
  allergy: { label: "Allergy" },
  haematology: { label: "Haematology" },
  drugs: { label: "Drugs" },
  immunology: { label: "Immunology" },
  micro_virology: { label: "Microbiology / Virology" },
  general: { label: "General" }
};

const sectionIconById = {
  chemistry: `<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/><path d="M8.5 14h7"/></svg>`,
  endocrinology: `<svg viewBox="0 0 24 24"><circle cx="6" cy="8" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="12" cy="16" r="2"/><path d="M8 8h8"/><path d="M7.7 9.2l2.7 4.6"/><path d="M16.3 9.2l-2.7 4.6"/></svg>`,
  tumour_markers: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>`,
  metabolic_genetic: `<svg viewBox="0 0 24 24"><path d="M8 4c4 0 4 4 8 4"/><path d="M16 4c-4 0-4 4-8 4"/><path d="M8 20c4 0 4-4 8-4"/><path d="M16 20c-4 0-4-4-8-4"/><path d="M9.5 7h5"/><path d="M9.5 12h5"/><path d="M9.5 17h5"/></svg>`,
  allergy: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M4 12h3"/><path d="M17 12h3"/><path d="M6.8 6.8l2.1 2.1"/><path d="M15.1 15.1l2.1 2.1"/><path d="M17.2 6.8l-2.1 2.1"/><path d="M8.9 15.1l-2.1 2.1"/></svg>`,
  haematology: `<svg viewBox="0 0 24 24"><path d="M12 3c-3 4-5 6.7-5 9.5A5 5 0 0 0 12 18a5 5 0 0 0 5-5.5C17 9.7 15 7 12 3z"/><circle cx="12" cy="12" r="1.6"/></svg>`,
  drugs: `<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="8" rx="4"/><path d="M9 8l6 8"/></svg>`,
  immunology: `<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6l7-3z"/><path d="M9.5 12l1.7 1.7L14.8 10"/></svg>`,
  micro_virology: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4.8 8h14.4"/><path d="M10 8v8"/><path d="M7 14.5h5"/><path d="M14 14.5h3"/></svg>`,
  general: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/></svg>`
};

function getSectionIconMarkup(groupId) {
  return sectionIconById[groupId] || sectionIconById.general;
}

const chipGroups = [
  "chemistry",
  "haematology",
  "endocrinology",
  "tumour_markers",
  "metabolic_genetic",
  "allergy",
  "drugs",
  "immunology",
  "micro_virology"
];

const aliasByName = {
  "U&E": ["U+E", "UE", "Renal profile", "Kidney function"],
  "CMP": ["CMP profile", "Bone profile", "Calcium magnesium phosphate profile"],
  "FBC": ["CBC", "Complete blood count", "Full blood count"],
  "Lipid Profile / Lipogram": ["Lipid profile", "Lipogram", "Lipid"],
  "Blood Gases": ["ABG", "Blood gas", "Blood gases"],
  "Cholesterol Total": ["Total cholesterol", "TC"],
  "LDL Cholesterol": ["LDL", "Bad cholesterol"],
  "HDL Cholesterol": ["HDL", "Good cholesterol"],
  Triglycerides: ["TG"],
  "Non-HDL Cholesterol (Calculated)": ["Non HDL cholesterol", "Non-HDL", "Non HDL"],
  "Serum Iron (Fe)": ["Serum iron", "Iron", "Fe"],
  Ferritin: ["Iron stores"],
  Transferrin: ["Iron binding protein"],
  TIBC: ["Total iron binding capacity"],
  "Transferrin Saturation (Calculated)": ["TSAT", "Transferrin sat", "Iron saturation"],
  "Uric Acid": ["UA", "Urate"],
  "RBC Count": ["RBC", "Red cell count"],
  "WBC and Differential Count": ["WBC", "White cell count", "Differential"],
  "Platelet Count": ["Platelets", "PLT"],
  "Haematocrit (HCT)": ["HCT", "Hematocrit"],
  "Sodium": ["Na"],
  "Potassium": ["K"],
  "Chloride": ["Cl"],
  "Calcium": ["Ca"],
  "Magnesium": ["Mg"],
  "Phosphate": ["PO4", "PO4-3", "Phos"],
  "Liver Function Tests (LFT)": ["LFT", "Liver profile", "Hepatic profile"],
  "INR": ["PT INR", "Clotting ratio", "INR calculated"],
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin"],
  "Blood Group & Rh": ["ABO", "Rh factor", "Group "],
  "Thyroid Function Test (TFT)": [
    "Thyroid function",
    "TFT",
    "Thyroid profile",
    "TSH / Thyroid Profile",
    "Thyroid function test"
  ],
  "DIC Screen": ["DIC", "DIC profile", "Disseminated intravascular coagulation"],
  "Coagulation Studies": ["Coag profile", "Coagulation profile", "Clotting profile"],
  "Antenatal Screen (ANTINV)": ["Antenatal screen", "Antenatal profile", "ANTINV", "Antinv", "Antinatal screen"],
  "Arthritis Profile": [
    "Arthritis panel",
    "Arthritis screen",
    "Arthritis Profile (ESR, CRP, UA, RF, CCP)",
    "Autoimmune Profile",
    "Autoimmune Profile (FBC, ESR, CRP, RF, CCP, ANA Screen)"
  ],
  "Malaria Profile": ["Malaria panel", "Malaria screen", "Malaria studies"],
  "Parathyroid Hormone (PTH)": ["PTH", "Parathyroid hormone", "Parathormone"],
  "Fe Studies": ["Iron Studies", "Iron", "Fe", "Fe Studies"],
  "Ammonia": ["NH3", "Ammonia plasma"],
  "TB PCR (GeneXpert)": ["Xpert", "GeneXpert"],
  "Urine MCS": ["Urine culture", "MC&S"],
  "Sputum MCS": ["Sputum culture", "MC&S"],
  "faeces MCS": ["Stool culture", "MC&S"],
  "Swab MCS": ["Swab culture", "MC&S"],
  "fluid MCS": ["Fluid culture", "MC&S"],
  "tissue MCS": ["Tissue culture", "MC&S"],
  "CSF MCS": ["CSF culture", "MC&S"],
  "D-Dimer": ["D dimer"],
  "Prothrombin Time (PT)": ["PT"],
  "Partial Thromboplastin Time (PTT)": ["APTT", "aPTT"]
};

const clinicalProfileByName = {
  "Fe Studies": {
    use: "Workup for iron deficiency anaemia and microcytic anaemia.",
    keywords: ["iron deficiency anaemia", "iron deficiency anemia", "microcytic anaemia", "low iron", "fatigue"]
  },
  "FBC": {
    use: "Baseline screen for anaemia, infection, inflammation, and platelet disorders.",
    keywords: ["anaemia", "anemia", "infection", "platelets", "low hb", "fatigue", "leukemia"]
  },
  "Thyroid Function Test (TFT)": {
    use: "Core thyroid function profile with TSH and Free T4; add Free T3 when clinically requested.",
    keywords: ["thyroid function", "tft", "hypothyroidism", "hyperthyroidism", "thyroid profile"]
  },
  "Arthritis Profile": {
    use: "Combined inflammatory and rheumatoid workup profile for suspected inflammatory arthritis.",
    keywords: ["arthritis", "joint pain", "rheumatoid", "inflammatory arthritis"]
  },
  "Antenatal Screen (ANTINV)": {
    use: "Booking antenatal profile for blood group, antibodies, key infections, and baseline screening.",
    keywords: ["antenatal", "pregnancy booking", "antinv", "maternal screen", "prenatal profile"]
  },
  "Troponin I": {
    use: "Primary marker for suspected acute coronary syndrome / heart attack.",
    keywords: ["heart attack", "myocardial infarction", "chest pain", "acs", "coronary syndrome"]
  },
  "CK Total": {
    use: "Adjunct cardiac/muscle injury marker in chest pain and myopathy contexts.",
    keywords: ["muscle injury", "myopathy", "chest pain"]
  },
  "D-Dimer": {
    use: "Rule-out support test in suspected venous thromboembolism.",
    keywords: ["pulmonary embolism", "dvt", "thrombosis", "clot"]
  },
  "PSA": {
    use: "Prostate disease marker used in prostate cancer evaluation and monitoring.",
    keywords: ["prostate cancer", "prostate tumour", "prostate tumor"]
  },
  "HIV ELISA": {
    use: "Initial serology screen for HIV infection.",
    keywords: ["hiv", "immunodeficiency", "retroviral infection"]
  },
  "HIV Viral Load (PCR)": {
    use: "Quantifies HIV RNA for treatment monitoring and progression tracking.",
    keywords: ["hiv monitoring", "hiv treatment response", "viral suppression"]
  },
  "HbA1c": {
    use: "Diagnosis and long-term monitoring of diabetes mellitus.",
    keywords: ["diabetes", "high sugar", "hyperglycaemia", "hyperglycemia"]
  },
  "Ammonia": {
    use: "Urgent evaluation of hyperammonaemia and hepatic encephalopathy risk.",
    keywords: ["hepatic encephalopathy", "liver failure", "confusion", "hyperammonaemia", "hyperammonemia"]
  }
};

const clinicalProfileBySubsection = {
  "Blood Gases": {
    use: "Acid-base and oxygenation assessment in urgent/critical care contexts.",
    keywords: ["blood gas", "abg", "acid base", "oxygenation", "ventilation"]
  },
  "Cardiac Markers": {
    use: "Used for suspected myocardial injury, heart attack, and cardiac stress.",
    keywords: ["heart attack", "myocardial infarction", "chest pain", "cardiac injury"]
  },
  "Lipids": {
    use: "Cardiovascular risk profiling and dyslipidaemia assessment.",
    keywords: ["cholesterol", "cardiovascular risk", "hyperlipidaemia", "hyperlipidemia"]
  },
  "Kidney Function (U+E)": {
    use: "Assessment of kidney function, dehydration, and renal impairment.",
    keywords: ["kidney failure", "renal disease", "dehydration", "uremia"]
  },
  "Liver Function And Pancreas": {
    use: "Evaluation of hepatitis, liver injury, cholestasis, and pancreatic inflammation.",
    keywords: ["hepatitis", "jaundice", "liver disease", "pancreatitis"]
  },
  "Diabetes": {
    use: "Diagnosis and monitoring of glucose regulation disorders.",
    keywords: ["diabetes", "hyperglycaemia", "hypoglycaemia", "insulin resistance"]
  },
  "Inflammation / Immune": {
    use: "Inflammatory response and infection-support marker panel.",
    keywords: ["infection", "sepsis", "inflammation", "immune response"]
  },
  "Coagulation": {
    use: "Bleeding/clotting risk assessment and anticoagulation monitoring.",
    keywords: ["bleeding", "clotting", "warfarin monitoring", "coagulopathy"]
  },
  "General": {
    use: "Broad blood profile for anaemia, infection, and haematologic abnormalities.",
    keywords: ["anaemia", "infection", "blood disorder"]
  },
  "Blood Grouping": {
    use: "Transfusion and compatibility testing.",
    keywords: ["transfusion", "crossmatch", "blood group"]
  },
  "Serum Markers": {
    use: "Tumour marker panel for cancer screening support and follow-up.",
    keywords: ["cancer", "tumour", "tumor", "oncology", "malignancy"]
  },
  "Autoimmune / Serology": {
    use: "Autoimmune and infectious serologic screening.",
    keywords: ["autoimmune disease", "connective tissue disease", "serology"]
  },
  "MC&S / PCR / Virology": {
    use: "Pathogen detection and antimicrobial guidance.",
    keywords: ["infection source", "pathogen", "sepsis workup", "viral infection"]
  }
};

function normalizeForSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTurnaroundTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "N/A";

  const normalized = raw
    .replace(/\s*to\s*/gi, " to ")
    .replace(/\s*-\s*/g, "-")
    .replace(/same day/gi, "Same day");

  return normalized
    .replace(/\bhrs?\b/gi, "hours")
    .replace(/\bhours?\b/gi, "hours")
    .replace(/\bday\b/gi, "day")
    .replace(/\bdays\b/gi, "days")
    .replace(/\b(\d+)\s*h\b/gi, "$1 hours")
    .replace(/\b(\d+)\s*d\b/gi, (_, n) => `${n} ${Number(n) === 1 ? "day" : "days"}`);
}

function normalizeTubeColor(value) {
  const map = {
    grey: "Gray",
    gray: "Gray",
    yellow: "Gold/Yellow",
    "yellow/gold": "Gold/Yellow",
    "gold/yellow": "Gold/Yellow",
    lavender: "Lavender",
    purple: "Purple",
    pink: "Pink",
    black: "Black",
    gold: "Gold/Yellow"
  };

  const raw = String(value || "").trim();
  const key = raw.toLowerCase();
  return map[key] || raw;
}

function getTubeGroups(tubeColorValue) {
  const text = String(tubeColorValue || "").toLowerCase();
  const groups = [];
  const colorPatterns = [
    { key: "Purple", pattern: /\bpurple\b|\blavender\b/ },
    { key: "Pink", pattern: /\bpink\b/ },
    { key: "Blue", pattern: /\blight blue\b|\bblue\b|citrate/ },
    { key: "Gold/Yellow", pattern: /\bgold\b|\byellow\b|sst|serum separator/ },
    { key: "Green", pattern: /\bgreen\b|heparin/ },
    { key: "Gray", pattern: /\bgray\b|\bgrey\b|fluoride/ },
    { key: "Red", pattern: /\bred\b|plain serum/ },
    { key: "Black", pattern: /\bblack\b/ }
  ];

  colorPatterns.forEach((entry) => {
    if (entry.pattern.test(text)) groups.push(entry.key);
  });

  return [...new Set(groups)];
}

function getTubeSwatchColor(tubeGroup) {
  const swatch = {
    Purple: "#8b5cf6",
    Pink: "#ec4899",
    Blue: "#89CFF0",
    "Gold/Yellow": "#facc15",
    Green: "#22c55e",
    Gray: "#9ca3af",
    Red: "#ef4444",
    Black: "#111827",
    "Blood Culture Bottles": "#a16207"
  };

  return swatch[tubeGroup] || "#94a3b8";
}

function getSelectedTests() {
  return enrichedTests.filter((test) => selectedTestNames.has(test.name));
}

const profileNames = Object.keys(profileComponentsByName);
const profileQueryTermsByName = Object.fromEntries(
  profileNames.map((profileName) => {
    const terms = [profileName, ...(aliasByName[profileName] || [])];
    return [profileName, new Set(terms.map((term) => normalizeForSearch(term)).filter(Boolean))];
  })
);

function getMatchedProfileQuery(normalizedQuery) {
  if (!normalizedQuery) return "";
  for (const profileName of profileNames) {
    if (profileQueryTermsByName[profileName]?.has(normalizedQuery)) return profileName;
  }
  return "";
}

function getExactNameMatches(normalizedQuery, testList = enrichedTests) {
  if (!normalizedQuery) return [];
  return testList.filter((test) => normalizeForSearch(test.name) === normalizedQuery);
}

function collapseProfileSelections(selectionSet) {
  profileNames.forEach((profileName) => {
    const components = profileComponentsByName[profileName] || [];
    const hasProfile = selectionSet.has(profileName);
    const hasAllComponents = components.length > 0 && components.every((name) => selectionSet.has(name));
    if (!hasProfile && !hasAllComponents) return;
    selectionSet.add(profileName);
    components.forEach((name) => selectionSet.delete(name));
  });
}

function renderDrawSelectionList() {
  if (!drawSelectionList) return;
  const query = drawSearchInput?.value || "";
  updateDrawSearchClearButton();
  const normalizedQuery = normalizeForSearch(query);
  const matchedProfileName = getMatchedProfileQuery(normalizedQuery);
  const exactNameMatches = getExactNameMatches(normalizedQuery);

  let candidates = enrichedTests;
  if (matchedProfileName) {
    candidates = enrichedTests.filter((test) => test.name === matchedProfileName);
  } else if (exactNameMatches.length) {
    candidates = exactNameMatches;
  } else {
    candidates = enrichedTests.filter((test) => !query || matchesQuery(test, query));
  }
  candidates = candidates.sort((a, b) => a.name.localeCompare(b.name));
  drawVisibleCandidateNames = candidates.map((test) => test.name);

  if (!candidates.length) {
    drawSelectionList.innerHTML = `<p class="draw-selection-empty">No tests match this search.</p>`;
    renderDrawSelectionSummary();
    return;
  }

  drawSelectionList.innerHTML = candidates
    .map((test) => `
      <button
        type="button"
        class="draw-selection-item${stagedSelectedTestNames.has(test.name) ? " selected" : ""}"
        data-draw-test="${encodeURIComponent(test.name)}"
        aria-pressed="${stagedSelectedTestNames.has(test.name) ? "true" : "false"}"
      >
        <span class="draw-selection-main">
          <span class="draw-selection-name">${test.name}</span>
        </span>
        <span class="draw-selection-state${stagedSelectedTestNames.has(test.name) ? " active" : ""}">
          ${stagedSelectedTestNames.has(test.name) ? "Included" : "Include"}
        </span>
      </button>
    `)
    .join("");

  drawSelectionList.querySelectorAll("button[data-draw-test]").forEach((toggleBtn) => {
    toggleBtn.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });
    toggleBtn.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    toggleBtn.addEventListener("click", () => {
      const testName = decodeURIComponent(toggleBtn.getAttribute("data-draw-test") || "");
      const currentScrollTop = drawSelectionList.scrollTop;
      const shouldKeepFocus = document.activeElement === drawSearchInput;
      if (!testName) return;
      if (stagedSelectedTestNames.has(testName)) {
        stagedSelectedTestNames.delete(testName);
      } else {
        stagedSelectedTestNames.add(testName);
      }
      collapseProfileSelections(stagedSelectedTestNames);
      renderDrawSelectionList();
      drawSelectionList.scrollTop = currentScrollTop;
      keepDrawSearchFocus(shouldKeepFocus);
      if (hasCalculatedDrawPlan) refreshDrawPlanFromStaged();
    });
  });

  renderDrawSelectionSummary();
}

function updateDrawSelectionTools() {
  if (selectVisibleDrawBtn) {
    const allVisibleSelected = drawVisibleCandidateNames.length > 0
      && drawVisibleCandidateNames.every((name) => stagedSelectedTestNames.has(name));
    selectVisibleDrawBtn.disabled = drawVisibleCandidateNames.length === 0 || allVisibleSelected;
  }

  if (clearDrawSelectionBtn) {
    clearDrawSelectionBtn.disabled = stagedSelectedTestNames.size === 0;
  }
}

function renderDrawSelectionSummary() {
  if (!drawSelectionCount) return;
  const count = stagedSelectedTestNames.size;
  drawSelectionCount.textContent = `${count} test${count !== 1 ? "s" : ""} selected`;
  updateDrawSelectionTools();
}

function syncSelectedTestsFromStaged() {
  selectedTestNames.clear();
  stagedSelectedTestNames.forEach((name) => selectedTestNames.add(name));
  collapseProfileSelections(selectedTestNames);
}

function refreshDrawPlanFromStaged() {
  syncSelectedTestsFromStaged();
  renderDrawResult();
  renderCards(getFilteredTests());
}

function animateDrawResultCard() {
  if (!drawResultCard) return;
  drawResultCard.classList.remove("draw-result-updated");
  void drawResultCard.offsetWidth;
  drawResultCard.classList.add("draw-result-updated");
}

function moveFocusToDrawResult() {
  if (!drawResultCard || drawResultCard.hidden) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  drawResultCard.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
    inline: "nearest"
  });
  drawResultCard.focus({ preventScroll: true });
}

function dismissActiveInputIfNeeded() {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tag = String(activeEl.tagName || "").toLowerCase();
  const isEditable = tag === "input" || tag === "textarea" || activeEl.isContentEditable;
  if (!isEditable) return false;
  if (typeof activeEl.blur === "function") activeEl.blur();
  return true;
}

function openDrawModal() {
  if (!drawModal) return;
  stagedSelectedTestNames = new Set(selectedTestNames);
  drawModal.hidden = false;
  document.body.classList.add("modal-open");
  if (drawResultCard) {
    drawResultCard.hidden = !hasCalculatedDrawPlan;
    if (hasCalculatedDrawPlan) renderDrawResult();
  }
  renderDrawSelectionList();
  if (drawSearchInput) drawSearchInput.focus();
  syncModalOpenClass();
}

function closeDrawModal() {
  if (!drawModal) return;
  drawModal.hidden = true;
  syncModalOpenClass();
}

function openProfileModal(testName) {
  if (!profileModal || !profileModalList || !profileModalTitle) return;
  const components = profileComponentsByName[testName] || [];
  if (!components.length) return;

  profileModalTitle.textContent = `${testName} Includes`;
  profileModalList.innerHTML = components.map((item) => `<li>${item}</li>`).join("");
  profileModal.hidden = false;
  syncModalOpenClass();
}

function closeProfileModal() {
  if (!profileModal) return;
  profileModal.hidden = true;
  syncModalOpenClass();
}

function syncModalOpenClass() {
  const drawOpen = Boolean(drawModal && !drawModal.hidden);
  const profileOpen = Boolean(profileModal && !profileModal.hidden);
  document.body.classList.toggle("modal-open", drawOpen || profileOpen);
}

function normalizeNameKey(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalDrawRuleName(value) {
  const key = normalizeNameKey(value);
  if (key === "xdp (d-dimer)" || key === "xdp d dimer" || key === "xdp") return "d-dimer";
  return key;
}

function findExactDrawRule(selectedTests) {
  const selected = new Set(selectedTests.map((test) => canonicalDrawRuleName(test.name)));

  return exactDrawRules.find((rule) => {
    if (selected.size !== rule.tests.length) return false;
    return rule.tests.every((name) => selected.has(canonicalDrawRuleName(name)));
  }) || null;
}

function getDefaultPlanItems(selectedTests) {
  const grouped = new Map();
  const manual = [];

  selectedTests.forEach((test) => {
    const groups = getTubeGroups(test.tubeColor);
    if (!groups.length) {
      manual.push(test.name);
      return;
    }

    groups.forEach((group) => {
      if (!grouped.has(group)) {
        grouped.set(group, { key: group, label: group, count: 1, tests: new Set() });
      }
      grouped.get(group).tests.add(test.name);
    });
  });

  const items = [...grouped.values()]
    .map((item) => ({ ...item, tests: [...item.tests] }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { items, manual, ruleId: null };
}

function isDedicatedGoldTubeTest(test) {
  const name = String(test.name || "").toLowerCase();
  const tubeGroups = getTubeGroups(test.tubeColor);
  const isGold = tubeGroups.includes("Gold/Yellow");
  if (!isGold) return false;

  return (
    name.includes("rheumatoid factor") ||
    /\brf\b/.test(name) ||
    name.includes("rpr") ||
    name.includes("hiv")
  );
}

function applyDedicatedGoldTubeRule(plan, selectedTests) {
  const dedicatedTests = selectedTests.filter((test) => isDedicatedGoldTubeTest(test));
  if (!dedicatedTests.length) return "";

  const dedicatedNames = new Set(dedicatedTests.map((test) => test.name));
  const hasOtherGoldTests = selectedTests.some((test) => {
    const tubeGroups = getTubeGroups(test.tubeColor);
    return tubeGroups.includes("Gold/Yellow") && !dedicatedNames.has(test.name);
  });

  const requiredGoldCount = dedicatedTests.length + (hasOtherGoldTests ? 1 : 0);
  let goldItem = plan.items.find((item) => item.key === "Gold/Yellow");
  if (!goldItem) {
    goldItem = { key: "Gold/Yellow", label: "Gold/Yellow", count: requiredGoldCount, tests: [] };
    plan.items.push(goldItem);
  } else {
    goldItem.count = Math.max(goldItem.count, requiredGoldCount);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "RF/RPR/HIV rule applied: each needs its own Gold/Yellow tube.";
}

function applyPurpleVolumeRule(plan, selectedTests) {
  const purpleTestCount = selectedTests.filter((test) => {
    const tubeGroups = getTubeGroups(test.tubeColor);
    return tubeGroups.includes("Purple");
  }).length;

  if (purpleTestCount < 3) return "";

  let purpleItem = plan.items.find((item) => item.key === "Purple");
  if (!purpleItem) {
    purpleItem = { key: "Purple", label: "Purple", count: 2, tests: [] };
    plan.items.push(purpleItem);
  } else {
    purpleItem.count = Math.max(purpleItem.count, 2);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "Purple rule applied: 3 or more purple-top tests require 2 x Purple tubes.";
}

function getLabDrawPlan(selectedTests) {
  const exactRule = findExactDrawRule(selectedTests);
  if (exactRule) {
    return {
      ruleId: exactRule.id,
      items: exactRule.items.map((item) => ({ ...item, tests: [...selectedTests.map((test) => test.name)] })),
      manual: []
    };
  }

  return getDefaultPlanItems(selectedTests);
}

function renderDrawResult() {
  if (!drawResultCard || !drawPlannerCount || !drawGroups || !drawPlannerNote) return;

  const selectedTests = getSelectedTests();
  if (!selectedTests.length) {
    drawResultCard.hidden = false;
    drawPlannerCount.textContent = "0 selected tests";
    drawGroups.innerHTML = `
      <article class="draw-group-card">
        <p class="draw-group-tests">No tests selected yet. Select tests above to build a tube plan.</p>
      </article>
    `;
    drawPlannerNote.textContent = "Result card updates after calculation.";
    animateDrawResultCard();
    return;
  }

  const plan = getLabDrawPlan(selectedTests);
  const dedicatedTubeNote = applyDedicatedGoldTubeRule(plan, selectedTests);
  const purpleRuleNote = applyPurpleVolumeRule(plan, selectedTests);
  drawResultCard.hidden = false;
  drawPlannerCount.textContent = `${selectedTests.length} selected test${selectedTests.length > 1 ? "s" : ""}`;

  drawGroups.innerHTML = plan.items
    .map((item) => `
      <article class="draw-group-card">
        <div class="draw-group-top">
          <span class="tube-icon" style="--tube-color: ${getTubeSwatchColor(item.key)};" aria-hidden="true"></span>
          <div>
            <h3>${item.label}</h3>
            <p>Draw ${item.count} x ${item.label}</p>
          </div>
        </div>
        ${item.detail ? `<p class="draw-group-detail">${item.detail}</p>` : ""}
      </article>
    `)
    .join("");

  const guidanceNotes = [dedicatedTubeNote, purpleRuleNote].filter(Boolean);
  if (plan.manual.length) {
    const manualNote = `Manual review needed for: ${plan.manual.join(", ")}.`;
    drawPlannerNote.textContent = guidanceNotes.length
      ? `${manualNote} ${guidanceNotes.join(" ")}`
      : manualNote;
  } else if (guidanceNotes.length) {
    drawPlannerNote.textContent = guidanceNotes.join(" ");
  } else if (plan.ruleId) {
    drawPlannerNote.textContent = "Lab draw rule matched for this exact set.";
  } else {
    drawPlannerNote.textContent = "Default estimate applied.";
  }

  animateDrawResultCard();
}

function inferCriticalPrep(test) {
  const name = test.name.toLowerCase();
  const specimen = String(test.specimen || "").toLowerCase();
  const tube = String(test.tubeColor || "").toLowerCase();

  if (name.includes("blood culture")) return "Collect aseptically before antibiotics where possible.";
  if (name.includes("inr") || name.includes("pt") || name.includes("ptt") || name.includes("d-dimer") || tube.includes("light blue")) {
    return "Fill citrate tube to the line and invert gently; underfilling may invalidate results.";
  }
  if (tube.includes("purple") || specimen.includes("edta")) return "Mix gently by inversion immediately after collection to avoid clots.";
  if (specimen.includes("serum") || tube.includes("gold")) return "Allow blood to clot fully before centrifugation (follow local protocol timing).";
  if (specimen.includes("stool") || specimen.includes("urine") || specimen.includes("swab")) return "Use the correct sterile container/swab and transport promptly.";
  return "Confirm patient prep and specimen handling against local lab protocol.";
}

function inferSpecimenGuide(test) {
  const text = `${test.name} ${test.specimen} ${test.tubeColor} ${test.notes}`.toLowerCase();

  if (text.includes("urine")) return "Urine specimen (sterile container or urine swab/collection protocol as required).";
  if (text.includes("stool") || text.includes("fecal")) return "Stool specimen (clean stool container).";
  if (text.includes("swab")) return "Swab specimen (site-specific swab: nasal, throat, vaginal, ulcer, or wound as indicated).";
  if (text.includes("csf")) return "CSF specimen (sterile CSF container).";
  if (text.includes("sputum") || text.includes("respiratory")) return "Respiratory specimen (e.g., sputum, NP swab, or lower respiratory sample).";
  if (text.includes("blood culture")) return "Blood culture bottles (aseptic blood specimen collection).";
  if (text.includes("blood")) return "Blood specimen (container depends on requested microbiology/virology test).";
  return "Specimen-specific collection required (confirm exact sample type with lab protocol).";
}

function getClinicalProfile(testName, grouping) {
  if (clinicalProfileByName[testName]) return clinicalProfileByName[testName];
  if (clinicalProfileBySubsection[grouping.subsection]) return clinicalProfileBySubsection[grouping.subsection];

  return {
    use: "General diagnostic support test interpreted with clinical context.",
    keywords: ["diagnosis", "clinical workup"]
  };
}

function getTestGrouping(testName) {
  const name = testName.toLowerCase();

  if (name.includes("blood gases")) return { sectionId: "chemistry", subsection: "Blood Gases" };

  if (
    name.includes("alcohol") ||
    name.includes("ethanol") ||
    name.includes("cannabis") ||
    name.includes("opiates") ||
    name.includes("amphetamine") ||
    name.includes("cocaine") ||
    name.includes("drug screen") ||
    name.includes("drugs of abuse")
  ) return { sectionId: "drugs", subsection: "Drugs Of Abuse" };

  if (
    name.includes("valproate") ||
    name.includes("phenytoin") ||
    name.includes("lithium") ||
    name.includes("digoxin") ||
    name.includes("gentamicin") ||
    name.includes("vancomycin") ||
    name.includes("carbamazepine") ||
    name.includes("therapeutic")
  ) return { sectionId: "drugs", subsection: "Drug Monitoring" };

  if (
    name.includes("pcr") ||
    name.includes("genexpert") ||
    name.includes("viral load") ||
    name.includes("mcs") ||
    name.includes("culture") ||
    name.includes("virology") ||
    name.includes("stool") ||
    name.includes("sputum") ||
    name.includes("csf") ||
    name.includes("urine")
  ) return { sectionId: "micro_virology", subsection: "MC&S / PCR / Virology" };

  if (
    name.includes("tumour") ||
    name.includes("cea") ||
    name.includes("afp") ||
    name.includes("ca 19") ||
    name.includes("ca 125") ||
    name.includes("ca 15") ||
    name.includes("psa") ||
    name.includes("beta-hcg")
  ) return { sectionId: "tumour_markers", subsection: "Serum Markers" };

  if (
    name.includes("porphyria") ||
    name.includes("thal") ||
    name.includes("genetic") ||
    name.includes("metabolic")
  ) return { sectionId: "metabolic_genetic", subsection: "Inherited Disorder Screen" };

  if (
    name.includes("allergy") ||
    /\bige\b/.test(name) ||
    name.includes("ige total") ||
    name.includes("mast") ||
    name.includes("phadiatop") ||
    name.includes("inhalant") ||
    name.includes("inhalation") ||
    name.includes("food allergy") ||
    name.includes("food screen") ||
    name.includes("skin prick")
  ) return { sectionId: "allergy", subsection: "Allergy Profile" };

  if (
    name.includes("arthritis profile") ||
    name.includes("ana") ||
    name.includes("ena") ||
    name.includes("rheumatoid") ||
    name.includes("anti-ccp") ||
    name.includes("anca") ||
    name.includes("dsdna") ||
    name.includes("complement") ||
    name.includes("celiac") ||
    name.includes("hepatitis") ||
    name.includes("hiv elisa") ||
    name.includes("rpr") ||
    name.includes("treponema")
  ) return { sectionId: "immunology", subsection: "Autoimmune / Serology" };

  if (name.includes("blood group") || name.includes("crossmatch") || name.includes("coombs")) {
    return { sectionId: "haematology", subsection: "Blood Grouping" };
  }

  if (name.includes("antenatal") || name.includes("antinv")) {
    return { sectionId: "haematology", subsection: "Blood Grouping" };
  }

  if (
    name.includes("coagulation studies") ||
    name.includes("coagulation profile") ||
    name.includes("clotting profile") ||
    name.includes("inr") ||
    name.includes("prothrombin") ||
    name.includes("ptt") ||
    name.includes("fibrinogen") ||
    name.includes("d-dimer") ||
    name.includes("von willebrand") ||
    name.includes("dic") ||
    name.includes("lupus anticoagulant")
  ) return { sectionId: "haematology", subsection: "Coagulation" };

  if (
    name.includes("fbc") ||
    name.includes("retic") ||
    name.includes("malaria") ||
    name.includes("hb electrophoresis") ||
    name.includes("ferritin") ||
    name.includes("transferrin") ||
    name.includes("tibc") ||
    name.includes("iron saturation") ||
    name.includes("serum iron") ||
    name.includes("iron studies") ||
    name.includes("fe studies") ||
    name.includes("esr")
  ) return { sectionId: "haematology", subsection: "General" };

  if (
    name.includes("thyroid function test") ||
    /\btft\b/.test(name) ||
    name.includes("tsh") ||
    name.includes("t4") ||
    name.includes("t3") ||
    name.includes("fsh") ||
    name.includes("lh") ||
    name.includes("prolactin") ||
    name.includes("progesterone") ||
    name.includes("estradiol") ||
    name.includes("dheas") ||
    name.includes("cortisol") ||
    name.includes("thyroid antibod") ||
    name.includes("tsh receptor")
  ) return { sectionId: "endocrinology", subsection: "Thyroid / Reproductive / Adrenal" };

  if (name.includes("u&e") || name.includes("creatinine") || name.includes("urea")) {
    return { sectionId: "chemistry", subsection: "Kidney Function (U+E)" };
  }

  if (
    name.includes("cmp") ||
    name.includes("parathyroid") ||
    name.includes("pth") ||
    name.includes("calcium") ||
    name.includes("phosphate") ||
    name.includes("magnesium") ||
    name.includes("vitamin d")
  ) return { sectionId: "chemistry", subsection: "Bone (CMP Profile)" };

  if (
    name.includes("sodium") ||
    name.includes("potassium") ||
    name.includes("chloride") ||
    name.includes("electrolyte")
  ) return { sectionId: "chemistry", subsection: "Kidney Function (U+E)" };

  if (
    name.includes("liver") ||
    name.includes("lft") ||
    name.includes("alt") ||
    name.includes("ast") ||
    name.includes("ggt") ||
    name.includes("alp") ||
    name.includes("bilirubin") ||
    name.includes("ammonia") ||
    name.includes("amylase") ||
    name.includes("lipase")
  ) return { sectionId: "chemistry", subsection: "Liver Function And Pancreas" };

  if (name.includes("troponin") || name.includes("nt-probnp") || name.includes("ck") || name.includes("ldh")) {
    return { sectionId: "chemistry", subsection: "Cardiac Markers" };
  }

  if (name.includes("lipid") || name.includes("cholesterol") || name.includes("triglyceride")) {
    return { sectionId: "chemistry", subsection: "Lipids" };
  }

  if (name.includes("glucose") || name.includes("hba1c") || name.includes("c-peptide")) {
    return { sectionId: "chemistry", subsection: "Diabetes" };
  }

  if (name.includes("crp") || name.includes("procalcitonin")) {
    return { sectionId: "chemistry", subsection: "Inflammation / Immune" };
  }

  return { sectionId: "general", subsection: "General" };
}

function enrichTest(test) {
  const grouping = getTestGrouping(test.name);
  const section = sectionMeta[grouping.sectionId] || sectionMeta.general;
  const aliases = aliasByName[test.name] || [];
  const ironFeSynonyms = /\b(iron|fe)\b/i.test(test.name)
    ? ["iron", "fe", "iron studies", "fe studies"]
    : [];
  const clinicalProfile = getClinicalProfile(test.name, grouping);

  const normalized = {
    ...test,
    tubeColor: normalizeTubeColor(test.tubeColor),
    turnaroundTime: normalizeTurnaroundTime(test.turnaroundTime),
    notes: String(test.notes || "").trim(),
    criticalPrep: String(test.criticalPrep || "").trim() || inferCriticalPrep(test),
    specimenGuide: grouping.sectionId === "micro_virology"
      ? (String(test.specimenGuide || "").trim() || inferSpecimenGuide(test))
      : "",
    clinicalUse: clinicalProfile.use,
    clinicalKeywords: clinicalProfile.keywords,
    grouping,
    section,
    aliases
  };

  normalized.searchBlob = normalizeForSearch([
    normalized.name,
    normalized.tubeColor,
    normalized.specimen,
    normalized.turnaroundTime,
    normalized.notes,
    normalized.criticalPrep,
    normalized.specimenGuide,
    normalized.clinicalUse,
    section.label,
    grouping.subsection,
    ...aliases,
    ...ironFeSynonyms,
    ...normalized.clinicalKeywords
  ].join(" "));

  return normalized;
}

function dedupeTestsByName(testList) {
  const seen = new Set();
  const unique = [];

  testList.forEach((test) => {
    const key = normalizeNameKey(test.name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(test);
  });

  return unique;
}

const sourceTests = dedupeTestsByName(tests);
if (sourceTests.length !== tests.length) {
  console.warn(`Find My Tube: removed ${tests.length - sourceTests.length} duplicate test entries by name.`);
}
const enrichedTests = sourceTests.map(enrichTest);

function startCarousel(items, textElement, dotsElement, intervalMs = 4200) {
  if (!textElement || !dotsElement || !items.length) return;

  let current = 0;
  textElement.textContent = items[current];
  dotsElement.innerHTML = items
    .map((_, index) => `<span class="fact-dot${index === 0 ? " active" : ""}"></span>`)
    .join("");

  setInterval(() => {
    current = (current + 1) % items.length;
    textElement.textContent = items[current];
    [...dotsElement.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === current);
    });
  }, intervalMs);
}

function renderFactsCarousel() {
  startCarousel(facts, factText, factDots, 7600);
  startCarousel(factTips, tipText, tipDots, 8200);
}

function setFactsPanelState(isCollapsed) {
  if (!factCarouselPanel || !toggleFactsBtn) return;
  factCarouselPanel.classList.toggle("is-collapsed", isCollapsed);
  toggleFactsBtn.textContent = isCollapsed ? "Show tips & facts" : "Hide tips & facts";
  toggleFactsBtn.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
}

function applyFactsPanelMode(isMobile) {
  if (!factCarouselPanel || !toggleFactsBtn || !factCarouselContent) return;

  if (isMobile) {
    factCarouselPanel.classList.add("mobile-facts");
    toggleFactsBtn.hidden = false;
    if (!factCarouselPanel.dataset.mobileInit) {
      setFactsPanelState(true);
      factCarouselPanel.dataset.mobileInit = "1";
    } else {
      const collapsed = factCarouselPanel.classList.contains("is-collapsed");
      setFactsPanelState(collapsed);
    }
    return;
  }

  delete factCarouselPanel.dataset.mobileInit;
  factCarouselPanel.classList.remove("mobile-facts", "is-collapsed");
  toggleFactsBtn.hidden = true;
  toggleFactsBtn.setAttribute("aria-expanded", "true");
}

function initFactsPanel() {
  if (!factCarouselPanel || !toggleFactsBtn || !factCarouselContent) return;

  const mediaQuery = window.matchMedia("(max-width: 600px)");
  const onModeChange = () => applyFactsPanelMode(mediaQuery.matches);

  toggleFactsBtn.addEventListener("click", () => {
    const isCollapsed = factCarouselPanel.classList.contains("is-collapsed");
    const nextCollapsed = !isCollapsed;
    setFactsPanelState(nextCollapsed);

    if (!nextCollapsed && factCarouselPanel.classList.contains("mobile-facts")) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        factCarouselContent.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }, 40);
    }
  });

  onModeChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onModeChange);
  } else {
    mediaQuery.addListener(onModeChange);
  }
}

function renderGroupChips() {
  if (!groupChips) return;

  groupChips.innerHTML = chipGroups
    .map((groupId) => {
      const group = sectionMeta[groupId];
      return `
        <button class="group-chip" type="button" data-group="${groupId}">
          <span class="group-chip-label">${group.label}</span>
          <span class="group-chip-icon" aria-hidden="true">${getSectionIconMarkup(groupId)}</span>
        </button>
      `;
    })
    .join("");

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const groupId = chip.getAttribute("data-group");
      activeSectionGroup = activeSectionGroup === groupId ? "" : groupId;
      applyFilters();
    });
  });
}

function matchesQuery(test, rawQuery) {
  const query = normalizeForSearch(rawQuery);
  if (!query) return true;

  const tokens = query.split(" ").filter(Boolean);
  return tokens.every((token) => {
    const pattern = new RegExp(`\\b${escapeRegExp(token)}\\b`);
    return pattern.test(test.searchBlob);
  });
}

function hasProfileComponents(test) {
  return (profileComponentsByName[test.name] || []).length > 0;
}

function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = activeSectionGroup || "";
  const normalizedQuery = normalizeForSearch(query);
  const matchedProfileName = getMatchedProfileQuery(normalizedQuery);
  const exactNameMatches = getExactNameMatches(normalizedQuery);
  const shouldBypassSectionFilter = Boolean(matchedProfileName || exactNameMatches.length);
  const isInflammatoryShortcut = normalizedQuery === "inflammatory" || normalizedQuery === "inflammation";
  const isHeartAttackShortcut = ["heart attack", "myocardial infarction", "acs", "acute coronary syndrome"]
    .includes(normalizedQuery);

  const filtered = enrichedTests.filter((test) => {
    if (selectedSection && !shouldBypassSectionFilter && test.grouping.sectionId !== selectedSection) return false;
    if (isInflammatoryShortcut) {
      return test.name === "CRP" || test.name === "Procalcitonin (PCT)";
    }
    if (isHeartAttackShortcut) {
      return test.name === "Troponin I" || test.name === "CK Total";
    }
    if (matchedProfileName) {
      return test.name === matchedProfileName;
    }
    if (exactNameMatches.length) {
      return exactNameMatches.some((match) => match.name === test.name);
    }
    return matchesQuery(test, query);
  });

  if (!selectedSection) return filtered;

  return filtered.sort((a, b) => {
    const aIsProfile = hasProfileComponents(a);
    const bIsProfile = hasProfileComponents(b);
    if (aIsProfile !== bIsProfile) return aIsProfile ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function renderCards(filteredTests) {
  cardsContainer.innerHTML = "";

  if (filteredTests.length === 0) {
    setResultsInfo("0 tests found");
    cardsContainer.innerHTML = `
      <div class="no-results">
        No matching test found. Try searching by test, section, alias, or condition (e.g. iron deficiency anaemia, heart attack, prostate cancer).
      </div>
    `;
    return;
  }

  setResultsInfo(`${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`);

  filteredTests.forEach((test) => {
    const isMicro = test.grouping.sectionId === "micro_virology";
    const card = document.createElement("div");
    card.className = "card";
    const isSelected = selectedTestNames.has(test.name);
    card.classList.toggle("card-selected", isSelected);
    const profileComponents = profileComponentsByName[test.name] || [];
    const hasProfileComponents = profileComponents.length > 0;
    const tubeGroups = getTubeGroups(test.tubeColor);
    const tubeIconSizeClass = tubeGroups.length >= 4
      ? " tube-icon-mini"
      : tubeGroups.length >= 3
        ? " tube-icon-sm"
        : "";
    const tubeOptionsMarkup = tubeGroups.length
      ? `
      <div class="tube-option-grid${tubeGroups.length >= 3 ? " compact" : ""}${tubeGroups.length >= 4 ? " dense" : ""}">
        ${tubeGroups.map((group) => `
          <span class="tube-option">
            <span class="tube-icon${tubeIconSizeClass}" style="--tube-color: ${getTubeSwatchColor(group)};" aria-hidden="true"></span>
            <span class="tube-option-label">${group}</span>
          </span>
        `).join("")}
      </div>
      `
      : `<span>${test.tubeColor}</span>`;
    const normalizedTubeText = normalizeForSearch(normalizeTubeColor(test.tubeColor));
    const normalizedSingleGroup = normalizeForSearch(tubeGroups[0] || "");
    const showTubeChoiceNote = tubeGroups.length > 1
      ? /(preferred|acceptable|alternate|alternative|or|\/)/i.test(String(test.tubeColor || ""))
      : tubeGroups.length === 1 && normalizedTubeText && normalizedTubeText !== normalizedSingleGroup;
    const hasTubeOptions = tubeGroups.length > 0;
    const specimenValue = String(isMicro ? test.specimenGuide : test.specimen || "").trim();
    const isNonBloodSpecimen = /(urine|stool|faec|swab|csf|sputum|respiratory|semen|fluid|tissue|bone marrow|aspirate|saliva|synovial|pleural|ascitic|vaginal|nasopharyngeal|throat)/i
      .test(specimenValue);
    const showSpecimenField = isMicro || isNonBloodSpecimen || !hasTubeOptions;
    const specimenField = isMicro
      ? `
      <div class="field">
        <span class="label">Specimen</span>
        <span>${specimenValue}</span>
      </div>
      `
      : `
      ${hasTubeOptions ? `
      <div class="field">
        <span class="label">Tube Colour</span>
        <div class="tube-color-row${tubeGroups.length > 1 ? " multiple" : ""}">
          ${tubeOptionsMarkup}
        </div>
        ${showTubeChoiceNote ? `<span class="tube-choice-note">${test.tubeColor}</span>` : ""}
      </div>
      ` : ""}
      ${showSpecimenField ? `
      <div class="field">
        <span class="label">Specimen</span>
        <span>${specimenValue}</span>
      </div>
      ` : ""}
      `;

    card.innerHTML = `
      <h2>${test.name}</h2>
      <div class="card-meta-row">
        <div class="test-group-badge">${test.section.label}</div>
        ${hasProfileComponents ? `<button class="profile-tests-btn" type="button" data-profile-name="${test.name}">Tests</button>` : ""}
      </div>
      ${specimenField}
      <div class="card-extra">
        <div class="test-subgroup-badge">${test.grouping.subsection}</div>
        <div class="field critical-prep-field">
          <span class="label">Critical Preparation</span>
          <span>${test.criticalPrep}</span>
        </div>
        <div class="field">
          <span class="label">Clinical Use</span>
          <span>${test.clinicalUse}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-toggle-btn" type="button" aria-expanded="false">See more</button>
        <button class="draw-select-btn${isSelected ? " active" : ""}" type="button">${isSelected ? "Included in Tube Count" : "Include in Tube Count"}</button>
      </div>
    `;

    const toggleBtn = card.querySelector(".card-toggle-btn");
    const drawSelectBtn = card.querySelector(".draw-select-btn");
    const profileTestsBtn = card.querySelector(".profile-tests-btn");
    toggleBtn.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      toggleBtn.textContent = expanded ? "See less" : "See more";
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    drawSelectBtn.addEventListener("click", () => {
      if (selectedTestNames.has(test.name)) {
        selectedTestNames.delete(test.name);
      } else {
        selectedTestNames.add(test.name);
      }
      collapseProfileSelections(selectedTestNames);

      renderDrawSelectionList();
      renderCards(getFilteredTests());
    });

    if (profileTestsBtn) {
      profileTestsBtn.addEventListener("click", () => {
        const name = profileTestsBtn.getAttribute("data-profile-name");
        openProfileModal(name);
      });
    }

    cardsContainer.appendChild(card);
  });
}

function applyFilters() {
  const hasQuery = (searchInput?.value || "").trim().length > 0;
  const hasSectionFilter = Boolean(activeSectionGroup);
  preSearchPanel.style.display = hasQuery || hasSectionFilter ? "none" : "grid";

  if (!hasQuery && !hasSectionFilter) {
    setResultsInfo("");
    cardsContainer.innerHTML = "";
    return;
  }

  renderCards(getFilteredTests());
}

function bindEvents() {
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      updateSearchClearButton();
      applyFilters();
    });
  }

  if (searchInput && searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      updateSearchClearButton();
      applyFilters();
      searchInput.focus();
    });
  }

  if (openDrawPlannerBtn) {
    openDrawPlannerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (drawModal && !drawModal.hidden) return;
      openDrawModal();
    });
  }

  if (closeDrawPlannerBtn) {
    closeDrawPlannerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeDrawModal();
    });
  }

  if (drawSearchInput) {
    drawSearchInput.addEventListener("input", () => {
      updateDrawSearchClearButton();
      renderDrawSelectionList();
    });
  }

  if (drawSearchInput && drawSearchClearBtn) {
    drawSearchClearBtn.addEventListener("click", () => {
      drawSearchInput.value = "";
      updateDrawSearchClearButton();
      renderDrawSelectionList();
      drawSearchInput.focus();
    });
  }

  if (selectVisibleDrawBtn) {
    selectVisibleDrawBtn.addEventListener("click", () => {
      drawVisibleCandidateNames.forEach((name) => stagedSelectedTestNames.add(name));
      collapseProfileSelections(stagedSelectedTestNames);
      renderDrawSelectionList();
      if (hasCalculatedDrawPlan) refreshDrawPlanFromStaged();
    });
  }

  if (clearDrawSelectionBtn) {
    clearDrawSelectionBtn.addEventListener("click", () => {
      stagedSelectedTestNames.clear();
      hasCalculatedDrawPlan = true;
      renderDrawSelectionList();
      refreshDrawPlanFromStaged();
    });
  }

  if (submitDrawSelectionBtn) {
    submitDrawSelectionBtn.addEventListener("click", () => {
      hasCalculatedDrawPlan = true;
      refreshDrawPlanFromStaged();
      const dismissedInput = dismissActiveInputIfNeeded();
      window.setTimeout(() => {
        moveFocusToDrawResult();
      }, dismissedInput ? 320 : 60);
    });
  }

  if (drawModal) {
    drawModal.addEventListener("click", (event) => {
      if (event.target !== drawModal) return;
      closeDrawModal();
    });
  }

  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeProfileModal();
    });
  }

  if (profileModal) {
    profileModal.addEventListener("click", (event) => {
      if (event.target !== profileModal) return;
      closeProfileModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (profileModal && !profileModal.hidden) {
      closeProfileModal();
      return;
    }
    if (drawModal && !drawModal.hidden) {
      closeDrawModal();
    }
  });
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  return { isIOS, isAndroid };
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function renderInstallHelper() {
  if (!installHelper || !installHelperText || !installHelperBtn) return;

  if (isStandaloneMode()) {
    installHelper.hidden = true;
    return;
  }

  const { isIOS, isAndroid } = detectPlatform();
  installHelper.hidden = false;

  if (isIOS) {
    installHelperText.textContent = "Install on iPhone: tap Share, then Add to Home Screen.";
    installHelperBtn.hidden = true;
    return;
  }

  if (isAndroid) {
    if (deferredInstallPrompt) {
      installHelperText.textContent = "Install this app for faster access and offline use.";
      installHelperBtn.hidden = false;
      return;
    }

    installHelperText.textContent = "On Android, open browser menu and choose Add to Home screen or Install app.";
    installHelperBtn.hidden = true;
    return;
  }

  installHelperText.textContent = "On desktop, use your browser menu and choose Install app.";
  installHelperBtn.hidden = deferredInstallPrompt ? false : true;
}

function initInstallHelper() {
  if (!installHelperBtn) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallHelper();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    renderInstallHelper();
  });

  installHelperBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    renderInstallHelper();
  });

  renderInstallHelper();
}

renderFactsCarousel();
initFactsPanel();
renderGroupChips();
bindEvents();
initInstallHelper();
applyFilters();
updateSearchClearButton();
renderDrawSelectionList();
updateDrawSearchClearButton();
