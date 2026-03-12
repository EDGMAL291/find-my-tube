const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const cardsContainer = document.getElementById("cardsContainer");
const resultsInfo = document.getElementById("resultsInfo");
const preSearchPanel = document.getElementById("preSearchPanel");
const brandHomeBtn = document.getElementById("brandHomeBtn");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuPanel = document.getElementById("menuPanel");
const toggleQuickToolsBtn = document.getElementById("toggleQuickToolsBtn");
const factCarouselPanel = document.getElementById("factCarouselPanel");
const factCarouselContent = document.getElementById("factCarouselContent");
const toggleFactsBtn = document.getElementById("toggleFactsBtn");
const tipText = document.getElementById("tipText");
const groupChips = document.getElementById("groupChips");
const installHelper = document.getElementById("installHelper");
const installHelperText = document.getElementById("installHelperText");
const installHelperBtn = document.getElementById("installHelperBtn");
const drawModal = document.getElementById("drawModal");
const drawResultCard = document.getElementById("drawResultCard");
const drawPlannerCount = document.getElementById("drawPlannerCount");
const drawPlannerAlerts = document.getElementById("drawPlannerAlerts");
const drawGroups = document.getElementById("drawGroups");
const drawPlannerNote = document.getElementById("drawPlannerNote");
const openDrawPlannerBtn = document.getElementById("openDrawPlannerBtn");
const closeDrawPlannerBtn = document.getElementById("closeDrawPlannerBtn");
const clearDrawSelectionBtn = document.getElementById("clearDrawSelectionBtn");
const drawSelectionCount = document.getElementById("drawSelectionCount");
const drawSelectedList = document.getElementById("drawSelectedList");
const returnToSearchBtn = document.getElementById("returnToSearchBtn");
const selectionCartBar = document.getElementById("selectionCartBar");
const selectionCartCount = document.getElementById("selectionCartCount");
const profileModal = document.getElementById("profileModal");
const profileModalTitle = document.getElementById("profileModalTitle");
const profileModalList = document.getElementById("profileModalList");
const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");

let deferredInstallPrompt = null;
const selectedTestNames = new Set();
let activeSectionGroup = "";
const CONDITION_SHORTCUT_DISCLAIMER = "Common initial request shortcut only. Confirm with local protocol, senior review, and patient context.";

function setResultsInfo(text) {
  if (!resultsInfo) return;
  const message = String(text || "");
  resultsInfo.textContent = message;
  resultsInfo.hidden = message.length === 0;
}

function getHistoryStateForSection(sectionId = "") {
  if (sectionId && sectionMeta[sectionId]) {
    return { view: "section", section: sectionId };
  }

  return { view: "home" };
}

function syncHistoryState(sectionId = "", replace = false) {
  if (!window.history || typeof window.history.pushState !== "function") return;

  const nextState = getHistoryStateForSection(sectionId);
  const currentState = window.history.state || {};
  if (currentState.view === nextState.view && currentState.section === nextState.section) return;

  const method = replace ? "replaceState" : "pushState";
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  window.history[method](nextState, "", currentUrl);
}

function updateSearchClearButton() {
  if (!searchInput || !searchClearBtn) return;
  const hasQuery = searchInput.value.trim().length > 0;
  searchClearBtn.hidden = !hasQuery;
}

function isMenuOpen() {
  return Boolean(menuPanel && !menuPanel.hidden);
}

function setMenuOpen(isOpen) {
  if (!menuPanel || !menuToggleBtn) return;
  menuPanel.hidden = !isOpen;
  menuToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeMenu() {
  setMenuOpen(false);
}

function goHome() {
  closeMenu();
  closeDrawModal();
  closeProfileModal();

  setSectionView("", { historyMode: "push", scrollToTop: true, clearSearch: true });
}

function focusMainSearchField() {
  if (!searchInput) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = searchInput.closest(".search-box") || searchInput;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    const cursorEnd = searchInput.value.length;
    searchInput.focus({ preventScroll: true });
    if (typeof searchInput.setSelectionRange === "function") {
      searchInput.setSelectionRange(cursorEnd, cursorEnd);
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
    "FBC",
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
  "Autoimmune Profile": [
    "ESR",
    "FBC",
    "CRP",
    "Rheumatoid Factor (RF)",
    "Anti-CCP Antibody",
    "ANA Screen and Reflex ENA Antibodies"
  ],
  "Malaria Profile": [
    "Malaria Smear (Thick and Thin)",
    "Malaria Smear and Antigen",
    "Malaria PCR"
  ],
  "Lipid Profile / Lipogram": [
    "Cholesterol Total",
    "HDL Cholesterol",
    "LDL Cholesterol",
    "Triglycerides",
    "Non-HDL Cholesterol (Calculated)"
  ],
  "Menopausal Screen": [
    "FSH",
    "LH",
    "Estradiol"
  ],
  "Drugs of Abuse / Overdose Screen": [
    "Drugs of Abuse Screen (Urine)",
    "Amphetamine (Urine)",
    "Barbiturate (Urine)",
    "Benzodiazepine (Urine)",
    "Cannabis (Urine)",
    "Cocaine (Urine)",
    "Mandrax (Urine)",
    "Methcathinone CAT (Urine)",
    "Opiates (Urine)",
    "Ethanol (Blood)",
    "Paracetamol (Blood)",
    "Salicylate (Blood)"
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
  immunology: { label: "Immunology / Serology" },
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
  Haptoglobin: ["Haptoglobin level"],
  "Malaria PCR": ["Malaria PCR (with ID if Positive)"],
  "INR": ["PT INR", "Clotting ratio", "INR calculated"],
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin"],
  "Blood Group & Rh": ["ABO", "Rh factor", "Group "],
  "Protein Electrophoresis with Immunofixation": [
    "Protein electrophoresis",
    "Serum protein electrophoresis",
    "SPEP",
    "Immunofixation",
    "Myeloma screen"
  ],
  "Free Light Chains (Serum)": [
    "Serum free light chains",
    "Free light chains",
    "SFLC",
    "Kappa lambda light chains"
  ],
  "Bence-Jones Protein (Urine)": [
    "Urine light chains",
    "Urine free light chains",
    "Urine bence jones",
    "Bence jones protein",
    "Bence-Jones"
  ],
  "Beta-2 Microglobulin": [
    "B2 microglobulin",
    "Beta 2 microglobulin",
    "B2M",
    "b2 microalbumin"
  ],
  "5-HIAA (24hr Urine)": [
    "5-HIAA",
    "5 HIAA",
    "24 hour urine 5-HIAA",
    "24hr urine 5-HIAA"
  ],
  "Metanephrines (24hr Urine)": [
    "Metanephrines",
    "Urine metanephrines",
    "24 hour urine metanephrines",
    "24hr urine metanephrines"
  ],
  "Menopausal Screen": [
    "Menopausal Screen Profile",
    "Menopause profile",
    "Menopausal profile",
    "Menopause screen",
    "Menopausal screen",
    "Monopausal screen profile",
    "Monopausal profile"
  ],
  "Drugs of Abuse / Overdose Screen": [
    "Drugs of Abuse / Overdose Profile",
    "Drug abuse profile",
    "Drug abuse screen",
    "Drugs of abuse profile",
    "Drugs of abuse screen",
    "Overdose profile",
    "Overdose screen",
    "Toxicology profile",
    "Toxicology screen",
    "Tox screen",
    "Urine drug screen"
  ],
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
    "Arthritis Profile (ESR, CRP, UA, RF, CCP)"
  ],
  "Autoimmune Profile": [
    "Autoimmune panel",
    "Autoimmune screen",
    "Autoimmune Profile (ESR, FBC, CRP, RF, CCP, ANA Screen)",
    "Autoimmune Profile (FBC, ESR, CRP, RF, CCP, ANA Screen)"
  ],
  "ANA Screen and Reflex ENA Antibodies": ["ANA Screen", "ANA Reflex ENA", "ANA Screen and Reflex ENA"],
  "Anti-CCP Antibody": ["CCP", "ACCP", "Anti CCP"],
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
  "Menopausal Screen": {
    use: "Menopausal endocrine profile combining FSH, LH, and estradiol for ovarian function / menopausal status assessment.",
    keywords: ["menopause", "menopausal", "perimenopause", "hot flushes", "amenorrhoea", "amenorrhea"]
  },
  "Drugs of Abuse / Overdose Screen": {
    use: "Combined toxicology screen pairing urine drugs-of-abuse testing with common overdose blood levels.",
    keywords: ["drug abuse", "drugs of abuse", "overdose", "toxicology", "tox screen", "poisoning"]
  },
  "Thyroid Function Test (TFT)": {
    use: "Core thyroid function profile with TSH and Free T4; add Free T3 when clinically requested.",
    keywords: ["thyroid function", "tft", "hypothyroidism", "hyperthyroidism", "thyroid profile"]
  },
  "Arthritis Profile": {
    use: "Combined inflammatory and rheumatoid workup profile for suspected inflammatory arthritis.",
    keywords: ["arthritis", "joint pain", "rheumatoid", "inflammatory arthritis"]
  },
  "Autoimmune Profile": {
    use: "Broad autoimmune screening profile combining inflammation markers, blood count, rheumatoid serology, and ANA screening.",
    keywords: ["autoimmune", "autoimmune screen", "connective tissue disease", "rheumatology", "ana screen"]
  },
  Haptoglobin: {
    use: "Supports haemolysis workup alongside LDH, bilirubin, reticulocytes, and direct antiglobulin testing.",
    keywords: ["haemolysis", "hemolysis", "hemolytic anaemia", "hemolytic anemia"]
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
  },
  "Protein Electrophoresis with Immunofixation": {
    use: "Monoclonal protein / paraprotein screen used in myeloma and plasma-cell dyscrasia workup.",
    keywords: ["myeloma", "paraprotein", "monoclonal gammopathy", "m protein", "multiple myeloma"]
  },
  "Free Light Chains (Serum)": {
    use: "Serum kappa/lambda free light chain assessment used in myeloma and plasma-cell disorder evaluation.",
    keywords: ["myeloma", "free light chains", "kappa lambda", "plasma cell dyscrasia", "multiple myeloma"]
  },
  "Bence-Jones Protein (Urine)": {
    use: "Urine light chain test used in myeloma and paraprotein disorder assessment.",
    keywords: ["bence jones", "urine light chains", "myeloma", "paraprotein", "multiple myeloma"]
  },
  "Beta-2 Microglobulin": {
    use: "Tumour burden / prognostic marker used in myeloma and lymphoproliferative disorders.",
    keywords: ["beta 2 microglobulin", "b2m", "myeloma", "lymphoma", "multiple myeloma"]
  },
  "5-HIAA (24hr Urine)": {
    use: "24-hour urine neuroendocrine marker used in carcinoid syndrome workup.",
    keywords: ["5-hiaa", "carcinoid", "neuroendocrine tumour", "neuroendocrine tumor", "flushing"]
  },
  "Metanephrines (24hr Urine)": {
    use: "24-hour urine catecholamine metabolite test used in pheochromocytoma / paraganglioma workup.",
    keywords: ["metanephrines", "pheochromocytoma", "paraganglioma", "catecholamine tumour", "catecholamine tumor"]
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

function getTubeAdditiveLabel(tubeGroup) {
  const additiveByGroup = {
    Purple: "EDTA",
    Pink: "EDTA",
    Blue: "Sodium citrate",
    "Gold/Yellow": "SST / clot activator",
    Green: "Heparin",
    Gray: "Fluoride / oxalate",
    Red: "Plain",
    Black: "Sodium citrate",
    "Blood Culture Bottles": "Culture media"
  };

  return additiveByGroup[tubeGroup] || "";
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

// Keep these shortcuts conservative: they should point to common initial lab requests,
// not attempt to replace local pathways or diagnostic reasoning.
const conditionShortcutDefinitions = [
  {
    id: "acute-coronary-syndrome",
    label: "suspected acute coronary syndrome",
    terms: ["heart attack", "heartattack", "myocardial infarction", "acute coronary syndrome", "acs", "nstemi", "stemi"],
    tests: ["Troponin I"]
  },
  {
    id: "venous-thromboembolism",
    label: "suspected DVT / PE",
    terms: [
      "dvt",
      "deep vein thrombosis",
      "pe",
      "pulmonary embolism",
      "venous thromboembolism",
      "vte",
      "suspected pe",
      "suspected dvt"
    ],
    tests: ["D-Dimer"]
  },
  {
    id: "heart-failure",
    label: "suspected heart failure",
    terms: ["heart failure", "cardiac failure", "congestive heart failure", "chf", "suspected heart failure"],
    tests: ["NT-proBNP"]
  },
  {
    id: "iron-deficiency-anaemia",
    label: "suspected iron deficiency anaemia",
    terms: ["iron deficiency anaemia", "iron deficiency anemia", "ida", "microcytic anaemia", "microcytic anemia"],
    tests: ["FBC", "Fe Studies"]
  },
  {
    id: "diabetes",
    label: "suspected diabetes mellitus",
    terms: ["diabetes", "diabetes mellitus", "prediabetes", "hyperglycaemia", "hyperglycemia", "high blood sugar"],
    tests: ["HbA1c", "Glucose Fasting", "OGTT (2hr)"]
  },
  {
    id: "thyroid-dysfunction",
    label: "suspected thyroid dysfunction",
    terms: [
      "thyroid dysfunction",
      "hypothyroidism",
      "hyperthyroidism",
      "thyrotoxicosis",
      "overactive thyroid",
      "underactive thyroid"
    ],
    tests: ["TSH", "Free T4", "Free T3"]
  },
  {
    id: "sepsis",
    label: "suspected sepsis",
    terms: ["sepsis", "septic shock", "suspected sepsis"],
    tests: ["Blood Culture", "Lactate"]
  },
  {
    id: "chronic-kidney-disease",
    label: "suspected chronic kidney disease",
    terms: ["chronic kidney disease", "ckd", "chronic renal disease", "chronic renal failure"],
    tests: ["U&E", "Albumin:Creatinine Ratio (Random Urine)"]
  },
  {
    id: "pancreatitis",
    label: "suspected acute pancreatitis",
    terms: ["pancreatitis", "acute pancreatitis"],
    tests: ["Lipase", "Amylase"]
  },
  {
    id: "coeliac-disease",
    label: "suspected coeliac disease",
    terms: ["coeliac disease", "celiac disease", "coeliac sprue", "celiac sprue"],
    tests: ["Celiac Screen", "Immunoglobulin A (IgA)"]
  },
  {
    id: "inflammatory-arthritis",
    label: "suspected inflammatory arthritis / rheumatoid arthritis",
    terms: ["rheumatoid arthritis", "inflammatory arthritis", "early inflammatory arthritis", "polyarthritis"],
    tests: ["Arthritis Profile"]
  },
  {
    id: "myeloma",
    label: "suspected myeloma / monoclonal gammopathy",
    terms: [
      "multiple myeloma",
      "myeloma",
      "plasma cell dyscrasia",
      "monoclonal gammopathy",
      "paraproteinaemia",
      "paraproteinemia"
    ],
    tests: [
      "Protein Electrophoresis with Immunofixation",
      "Free Light Chains (Serum)",
      "Bence-Jones Protein (Urine)",
      "Beta-2 Microglobulin"
    ]
  },
  {
    id: "pheochromocytoma",
    label: "suspected pheochromocytoma / paraganglioma",
    terms: ["pheochromocytoma", "paraganglioma", "ppgl"],
    tests: ["Metanephrines (24hr Urine)"]
  },
  {
    id: "carcinoid-syndrome",
    label: "suspected carcinoid syndrome",
    terms: ["carcinoid syndrome", "carcinoid tumour", "carcinoid tumor"],
    tests: ["5-HIAA (24hr Urine)"]
  },
  {
    id: "ovarian-cancer",
    label: "possible ovarian cancer",
    terms: ["ovarian cancer", "suspected ovarian cancer", "ovarian tumour", "ovarian tumor"],
    tests: ["CA 125"]
  },
  {
    id: "prostate-cancer",
    label: "possible prostate cancer",
    terms: ["prostate cancer", "suspected prostate cancer", "prostate tumour", "prostate tumor"],
    tests: ["PSA"]
  }
];

const conditionShortcutById = Object.fromEntries(
  conditionShortcutDefinitions.map((shortcut) => [shortcut.id, {
    ...shortcut,
    normalizedTerms: new Set(shortcut.terms.map((term) => normalizeForSearch(term)).filter(Boolean))
  }])
);

function getMatchedProfileQuery(normalizedQuery) {
  if (!normalizedQuery) return "";
  for (const profileName of profileNames) {
    if (profileQueryTermsByName[profileName]?.has(normalizedQuery)) return profileName;
  }
  return "";
}

function getMatchedConditionShortcut(normalizedQuery) {
  if (!normalizedQuery) return null;

  for (const shortcut of Object.values(conditionShortcutById)) {
    for (const term of shortcut.normalizedTerms) {
      if (normalizedQuery === term) return shortcut;
      if (normalizedQuery.length > term.length) {
        const phrasePattern = new RegExp(`(?:^| )${escapeRegExp(term)}(?:$| )`);
        if (phrasePattern.test(normalizedQuery)) return shortcut;
      }
    }
  }

  return null;
}

function getExactNameMatches(normalizedQuery, testList = enrichedTests) {
  if (!normalizedQuery) return [];
  return testList.filter((test) => normalizeForSearch(test.name) === normalizedQuery);
}

function getTestsByNames(testNames = []) {
  return testNames
    .map((testName) => enrichedTests.find((test) => test.name === testName))
    .filter(Boolean);
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

function updateDrawSelectionTools() {
  if (clearDrawSelectionBtn) {
    clearDrawSelectionBtn.disabled = selectedTestNames.size === 0;
  }
}

function renderDrawSelectionSummary() {
  if (!drawSelectionCount) return;
  const count = selectedTestNames.size;
  drawSelectionCount.textContent = count
    ? `${count} test${count !== 1 ? "s" : ""} selected`
    : "No tests selected yet";
  updateDrawSelectionTools();
}

function renderSelectedTestsCart() {
  if (!drawSelectedList) return;
  const selectedTests = getSelectedTests();

  if (!selectedTests.length) {
    drawSelectedList.innerHTML = `
      <p class="draw-selected-empty">
        Your selected tests will appear here. Use the main search to add more tests.
      </p>
    `;
    return;
  }

  drawSelectedList.innerHTML = selectedTests
    .map((test) => `
      <div class="draw-selected-chip">
        <span class="draw-selected-chip-name">${test.name}</span>
        <button
          type="button"
          class="draw-selected-chip-remove"
          data-remove-selected="${encodeURIComponent(test.name)}"
          aria-label="Remove ${test.name} from rack"
        >
          Remove
        </button>
      </div>
    `)
    .join("");

  drawSelectedList.querySelectorAll("button[data-remove-selected]").forEach((removeBtn) => {
    removeBtn.addEventListener("click", () => {
      const testName = decodeURIComponent(removeBtn.getAttribute("data-remove-selected") || "");
      if (!testName) return;
      removeSelectedTest(testName);
    });
  });
}

function updateSelectionCartBar() {
  if (!selectionCartBar || !selectionCartCount) return;

  const count = selectedTestNames.size;
  if (!count) {
    selectionCartBar.hidden = true;
    document.body.classList.remove("has-selection-cart");
    return;
  }

  const selectedTests = getSelectedTests();
  const { plan } = getResolvedDrawPlan(selectedTests);
  const totalTubes = plan.items.reduce((sum, item) => sum + item.count, 0);
  const badgeCount = count > 99 ? "99+" : String(count);

  selectionCartBar.hidden = false;
  selectionCartCount.textContent = badgeCount;
  selectionCartBar.setAttribute(
    "aria-label",
    `Rack. ${count} selected test${count !== 1 ? "s" : ""}, ${totalTubes} tube${totalTubes !== 1 ? "s" : ""} estimated.`
  );
  selectionCartBar.title = `${count} selected test${count !== 1 ? "s" : ""}`;
  document.body.classList.add("has-selection-cart");
}

function updateSelectionCartViewportPosition() {
  if (!selectionCartBar) return;

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const baseOffset = isMobile ? 10 : 18;
  let keyboardOffset = 0;

  if (isMobile && window.visualViewport) {
    const activeEl = document.activeElement;
    const tag = String(activeEl?.tagName || "").toLowerCase();
    const isEditable = tag === "input" || tag === "textarea" || activeEl?.isContentEditable;
    const viewportOverlap = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);

    if (isEditable && viewportOverlap > 80) {
      keyboardOffset = viewportOverlap;
    }
  }

  selectionCartBar.style.bottom = `calc(env(safe-area-inset-bottom) + ${baseOffset + keyboardOffset}px)`;
}

function initSelectionCartViewportSync() {
  updateSelectionCartViewportPosition();

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateSelectionCartViewportPosition);
    window.visualViewport.addEventListener("scroll", updateSelectionCartViewportPosition);
  }

  window.addEventListener("resize", updateSelectionCartViewportPosition);
  document.addEventListener("focusin", () => {
    window.setTimeout(updateSelectionCartViewportPosition, 40);
  });
  document.addEventListener("focusout", () => {
    window.setTimeout(updateSelectionCartViewportPosition, 120);
  });
}

function refreshSelectionUi({ rerenderCards = true } = {}) {
  renderDrawSelectionSummary();
  renderSelectedTestsCart();
  renderDrawResult();
  updateSelectionCartBar();
  updateDrawPlannerToggleState();
  if (rerenderCards) applyFilters();
}

function setSelectedTests(nextSelection, options = {}) {
  selectedTestNames.clear();
  nextSelection.forEach((name) => selectedTestNames.add(name));
  collapseProfileSelections(selectedTestNames);
  refreshSelectionUi(options);
}

function toggleSelectedTest(testName, options = {}) {
  const nextSelection = new Set(selectedTestNames);
  if (nextSelection.has(testName)) {
    nextSelection.delete(testName);
  } else {
    nextSelection.add(testName);
  }
  setSelectedTests(nextSelection, options);
}

function removeSelectedTest(testName, options = {}) {
  if (!selectedTestNames.has(testName)) return;
  const nextSelection = new Set(selectedTestNames);
  nextSelection.delete(testName);
  setSelectedTests(nextSelection, options);
}

function animateDrawResultCard() {
  if (!drawResultCard) return;
  drawResultCard.classList.remove("draw-result-updated");
  void drawResultCard.offsetWidth;
  drawResultCard.classList.add("draw-result-updated");
}

function isDrawPlannerOpen() {
  return Boolean(drawModal && !drawModal.hidden);
}

function updateQuickToolsToggleState() {
  if (!toggleQuickToolsBtn) return;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  if (!isMobile) {
    toggleQuickToolsBtn.setAttribute("aria-expanded", "false");
    return;
  }

  const isOpen = isDrawPlannerOpen();
  const count = selectedTestNames.size;
  toggleQuickToolsBtn.textContent = isOpen
    ? "Hide rack"
    : count
      ? `View rack (${count})`
      : "Show rack";
  toggleQuickToolsBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function updateDrawPlannerToggleState() {
  if (!openDrawPlannerBtn) return;
  const isOpen = isDrawPlannerOpen();
  const count = selectedTestNames.size;
  openDrawPlannerBtn.textContent = isOpen
    ? "Hide Rack"
    : count
      ? `Rack (${count})`
      : "Rack";
  openDrawPlannerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  updateQuickToolsToggleState();
}

function openDrawModal() {
  if (!drawModal) return;
  closeMenu();
  drawModal.hidden = false;
  updateDrawPlannerToggleState();
  refreshSelectionUi({ rerenderCards: false });
  if (closeDrawPlannerBtn) {
    window.requestAnimationFrame(() => {
      closeDrawPlannerBtn.focus({ preventScroll: true });
    });
  }
  syncModalOpenClass();
}

function closeDrawModal() {
  if (!drawModal) return;
  drawModal.hidden = true;
  updateDrawPlannerToggleState();
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

function getRequiredSharedGoldTubeCount(selectedTests) {
  const sharedGoldTests = selectedTests.filter((test) => {
    const tubeGroups = getTubeGroups(test.tubeColor);
    return tubeGroups.includes("Gold/Yellow") && !isDedicatedGoldTubeTest(test);
  });

  if (!sharedGoldTests.length) return 0;

  const goldProfileCount = sharedGoldTests.filter((test) =>
    Object.prototype.hasOwnProperty.call(profileComponentsByName, test.name)
  ).length;

  return goldProfileCount >= 4 ? 2 : 1;
}

function applyDedicatedGoldTubeRule(plan, selectedTests) {
  const dedicatedTests = selectedTests.filter((test) => isDedicatedGoldTubeTest(test));
  if (!dedicatedTests.length) return "";

  const requiredGoldCount = dedicatedTests.length + getRequiredSharedGoldTubeCount(selectedTests);
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

function applyGoldProfileVolumeRule(plan, selectedTests) {
  const requiredGoldCount = getRequiredSharedGoldTubeCount(selectedTests);
  if (requiredGoldCount < 2) return "";

  let goldItem = plan.items.find((item) => item.key === "Gold/Yellow");
  if (!goldItem) {
    goldItem = { key: "Gold/Yellow", label: "Gold/Yellow", count: requiredGoldCount, tests: [] };
    plan.items.push(goldItem);
  } else {
    goldItem.count = Math.max(goldItem.count, requiredGoldCount);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "Gold rule applied: 4 or more gold-top profiles require 2 x Gold/Yellow tubes.";
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

function getResolvedDrawPlan(selectedTests) {
  const plan = getLabDrawPlan(selectedTests);
  const guidanceNotes = [
    applyDedicatedGoldTubeRule(plan, selectedTests),
    applyGoldProfileVolumeRule(plan, selectedTests),
    applyPurpleVolumeRule(plan, selectedTests)
  ].filter(Boolean);

  return { plan, guidanceNotes };
}

function getDrawPlannerAlerts(selectedTests) {
  return selectedTests.flatMap((test) => {
    if (test.name !== "Ammonia") return [];

    return [{
      id: "ammonia-handling",
      tone: "urgent",
      title: "Important guidelines for Ammonia",
      items: [
        "Use a Green (Heparin) tube for heparin plasma.",
        "Call PathCare courier first.",
        "Draw the sample only when the courier is on-site waiting.",
        "Separate plasma immediately after collection.",
        "Dispatch without delay."
      ]
    }];
  });
}

function renderDrawResult() {
  if (!drawResultCard || !drawPlannerCount || !drawPlannerAlerts || !drawGroups || !drawPlannerNote) return;

  const selectedTests = getSelectedTests();
  if (!selectedTests.length) {
    drawResultCard.hidden = false;
    drawPlannerCount.textContent = "0 selected tests";
    drawPlannerAlerts.hidden = true;
    drawPlannerAlerts.innerHTML = "";
    drawGroups.innerHTML = `
      <article class="draw-group-card">
        <p class="draw-group-tests">No tests selected yet. Add tests to build a tube plan.</p>
      </article>
    `;
    drawPlannerNote.textContent = "Your tube estimate updates as you add or remove tests.";
    animateDrawResultCard();
    return;
  }

  const { plan, guidanceNotes } = getResolvedDrawPlan(selectedTests);
  const plannerAlerts = getDrawPlannerAlerts(selectedTests);
  drawResultCard.hidden = false;
  drawPlannerCount.textContent = `${selectedTests.length} selected test${selectedTests.length > 1 ? "s" : ""}`;
  drawPlannerAlerts.hidden = plannerAlerts.length === 0;
  drawPlannerAlerts.innerHTML = plannerAlerts
    .map((alert) => `
      <article class="draw-planner-alert draw-planner-alert-${alert.tone}">
        <h4>${alert.title}</h4>
        <ul>
          ${alert.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `)
    .join("");

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
    name.includes("barbiturate") ||
    name.includes("benzodiazepine") ||
    name.includes("cocaine") ||
    name.includes("mandrax") ||
    name.includes("methcathinone") ||
    name.includes("paracetamol") ||
    name.includes("salicylate") ||
    name.includes("overdose") ||
    name.includes("toxicology") ||
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
    name.includes("beta-hcg") ||
    name.includes("protein electrophoresis") ||
    name.includes("immunofixation") ||
    name.includes("free light chains") ||
    name.includes("bence-jones") ||
    name.includes("beta-2 microglobulin") ||
    name.includes("5-hiaa") ||
    name.includes("metanephrines")
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
    name.includes("autoimmune") ||
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
    name.includes("haptoglobin") ||
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
    name.includes("menopausal screen profile") ||
    name.includes("menopause profile") ||
    name.includes("menopausal profile") ||
    name.includes("menopause screen") ||
    name.includes("menopausal screen") ||
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
  if (!textElement || !items.length) return;

  let current = 0;
  textElement.textContent = items[current];
  if (dotsElement) {
    dotsElement.innerHTML = items
      .map((_, index) => `<span class="fact-dot${index === 0 ? " active" : ""}"></span>`)
      .join("");
  }

  setInterval(() => {
    current = (current + 1) % items.length;
    textElement.textContent = items[current];
    if (dotsElement) {
      [...dotsElement.children].forEach((dot, index) => {
        dot.classList.toggle("active", index === current);
      });
    }
  }, intervalMs);
}

function renderFactsCarousel() {
  startCarousel(factTips, tipText, null, 8200);
}

function applyQuickToolsPanelMode(isMobile) {
  if (!toggleQuickToolsBtn) return;
  toggleQuickToolsBtn.hidden = true;
}

function initQuickToolsPanel() {
  if (!toggleQuickToolsBtn) return;

  const mediaQuery = window.matchMedia("(max-width: 600px)");
  const onModeChange = () => applyQuickToolsPanelMode(mediaQuery.matches);

  toggleQuickToolsBtn.addEventListener("click", () => {
    if (isDrawPlannerOpen()) {
      closeDrawModal();
      return;
    }
    openDrawModal();
  });

  onModeChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onModeChange);
  } else {
    mediaQuery.addListener(onModeChange);
  }
}

function setFactsPanelState(isCollapsed) {
  if (!factCarouselPanel || !toggleFactsBtn) return;
  factCarouselPanel.classList.toggle("is-collapsed", isCollapsed);
  toggleFactsBtn.textContent = isCollapsed ? "Show tips" : "Hide tips";
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

function updateGroupChipState() {
  if (!groupChips) return;

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    const groupId = chip.getAttribute("data-group") || "";
    const isActive = activeSectionGroup === groupId;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderGroupChips() {
  if (!groupChips) return;

  groupChips.innerHTML = chipGroups
    .map((groupId) => {
      const group = sectionMeta[groupId];
      return `
        <button
          class="group-chip${activeSectionGroup === groupId ? " active" : ""}"
          type="button"
          data-group="${groupId}"
          aria-pressed="${activeSectionGroup === groupId ? "true" : "false"}"
        >
          <span class="group-chip-label">${group.label}</span>
          <span class="group-chip-icon" aria-hidden="true">${getSectionIconMarkup(groupId)}</span>
        </button>
      `;
    })
    .join("");

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const groupId = chip.getAttribute("data-group") || "";
      const nextSectionGroup = activeSectionGroup === groupId ? "" : groupId;
      const replaceHistory = nextSectionGroup === "";
      setSectionView(nextSectionGroup, { historyMode: replaceHistory ? "replace" : "push", scrollToTop: true });
    });
  });

  updateGroupChipState();
}

function setSectionView(sectionId = "", { historyMode = "none", scrollToTop = false, clearSearch = false } = {}) {
  activeSectionGroup = sectionMeta[sectionId] ? sectionId : "";

  if (clearSearch && searchInput) searchInput.value = "";
  updateSearchClearButton();
  updateGroupChipState();
  applyFilters();

  if (historyMode === "push") syncHistoryState(activeSectionGroup, false);
  if (historyMode === "replace") syncHistoryState(activeSectionGroup, true);

  if (!scrollToTop) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = activeSectionGroup ? (resultsInfo || cardsContainer) : preSearchPanel;
  window.requestAnimationFrame(() => {
    target?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
}

function initSectionNavigation() {
  syncHistoryState(activeSectionGroup, true);

  window.addEventListener("popstate", (event) => {
    const nextSectionGroup = event.state?.view === "section" && sectionMeta[event.state.section]
      ? event.state.section
      : "";
    setSectionView(nextSectionGroup, { clearSearch: nextSectionGroup === "", scrollToTop: true });
  });
}

function matchesQuery(test, rawQuery) {
  const query = normalizeForSearch(rawQuery);
  if (!query) return true;

  const tokens = query.split(" ").filter(Boolean);
  return tokens.every((token) => {
    // Prefix match each query token against any word in the search blob.
    const pattern = new RegExp(`\\b${escapeRegExp(token)}`);
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
  const matchedConditionShortcut = getMatchedConditionShortcut(normalizedQuery);
  const exactNameMatches = getExactNameMatches(normalizedQuery);
  const isInflammatoryShortcut = normalizedQuery === "inflammatory" || normalizedQuery === "inflammation";
  const shouldBypassSectionFilter = Boolean(
    matchedProfileName || matchedConditionShortcut || exactNameMatches.length || isInflammatoryShortcut
  );

  if (matchedConditionShortcut) {
    return getTestsByNames(matchedConditionShortcut.tests);
  }

  const filtered = enrichedTests.filter((test) => {
    if (selectedSection && !shouldBypassSectionFilter && test.grouping.sectionId !== selectedSection) return false;
    if (isInflammatoryShortcut) {
      return test.name === "CRP" || test.name === "Procalcitonin (PCT)";
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
  const normalizedQuery = normalizeForSearch(searchInput?.value || "");
  const matchedConditionShortcut = getMatchedConditionShortcut(normalizedQuery);

  if (filteredTests.length === 0) {
    setResultsInfo(
      matchedConditionShortcut
        ? `Condition shortcut: ${matchedConditionShortcut.label}. 0 tests found. ${CONDITION_SHORTCUT_DISCLAIMER}`
        : "0 tests found"
    );
    cardsContainer.innerHTML = `
      <div class="no-results">
        No matching test found. Try searching by test, department, alias, or condition (e.g. iron deficiency anaemia, heart attack, prostate cancer).
      </div>
    `;
    return;
  }

  setResultsInfo(
    matchedConditionShortcut
      ? `Condition shortcut: ${matchedConditionShortcut.label}. ${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found. ${CONDITION_SHORTCUT_DISCLAIMER}`
      : `${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`
  );

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
            <span class="tube-option-copy">
              <span class="tube-option-label">${group}</span>
              ${getTubeAdditiveLabel(group) ? `<span class="tube-option-additive">${getTubeAdditiveLabel(group)}</span>` : ""}
            </span>
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
    const summaryFields = isMicro
      ? `
      <div class="field card-summary-field">
        <span class="label">Specimen</span>
        <span class="card-summary-value">${specimenValue}</span>
      </div>
      `
      : `
      ${hasTubeOptions ? `
      <div class="field card-summary-field">
        <span class="label">Tube</span>
        <div class="tube-color-row${tubeGroups.length > 1 ? " multiple" : ""}">
          ${tubeOptionsMarkup}
        </div>
      </div>
      ` : ""}
      ${showSpecimenField ? `
      <div class="field card-summary-field">
        <span class="label">Specimen</span>
        <span class="card-summary-value">${specimenValue}</span>
      </div>
      ` : ""}
      `;
    const summaryFieldCount = isMicro
      ? 1
      : Number(hasTubeOptions) + Number(showSpecimenField);
    const cardMetaRow = hasProfileComponents
      ? `
      <div class="card-meta-row">
        <button class="profile-tests-btn" type="button" data-profile-name="${test.name}">Tests</button>
      </div>
      `
      : "";

    card.innerHTML = `
      <div class="card-head">
        <h2>${test.name}</h2>
        <button class="draw-select-btn${isSelected ? " active" : ""}" type="button">${isSelected ? "Added to Rack" : "Add to Rack"}</button>
      </div>
      ${cardMetaRow}
      <div class="card-summary-grid${summaryFieldCount <= 1 ? " single" : ""}">
        ${summaryFields}
      </div>
      <div class="card-extra">
        <div class="test-subgroup-badge">${test.grouping.subsection}</div>
        ${showTubeChoiceNote ? `
        <div class="field">
          <span class="label">Tube Note</span>
          <span>${test.tubeColor}</span>
        </div>
        ` : ""}
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
      toggleSelectedTest(test.name);
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

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", () => {
      setMenuOpen(!isMenuOpen());
    });
  }

  if (brandHomeBtn) {
    brandHomeBtn.addEventListener("click", () => {
      goHome();
    });
  }

  if (openDrawPlannerBtn) {
    openDrawPlannerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (isDrawPlannerOpen()) {
        closeDrawModal();
        return;
      }
      openDrawModal();
    });
  }

  if (selectionCartBar) {
    selectionCartBar.addEventListener("click", () => {
      if (isDrawPlannerOpen()) {
        closeDrawModal();
        return;
      }
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

  if (clearDrawSelectionBtn) {
    clearDrawSelectionBtn.addEventListener("click", () => {
      setSelectedTests(new Set());
    });
  }

  if (returnToSearchBtn) {
    returnToSearchBtn.addEventListener("click", () => {
      closeDrawModal();
      focusMainSearchField();
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
    if (isMenuOpen()) {
      closeMenu();
      return;
    }
    if (profileModal && !profileModal.hidden) {
      closeProfileModal();
      return;
    }
    if (drawModal && !drawModal.hidden) {
      closeDrawModal();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) return;
    if (menuPanel?.contains(event.target) || menuToggleBtn?.contains(event.target)) return;
    closeMenu();
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
    closeMenu();
  });

  renderInstallHelper();
}

renderFactsCarousel();
initQuickToolsPanel();
initFactsPanel();
initSectionNavigation();
renderGroupChips();
bindEvents();
initSelectionCartViewportSync();
initInstallHelper();
applyFilters();
updateSearchClearButton();
refreshSelectionUi({ rerenderCards: false });
