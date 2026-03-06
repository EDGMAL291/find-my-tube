const searchInput = document.getElementById("searchInput");
const sectionFilter = document.getElementById("sectionFilter");
const subsectionFilter = document.getElementById("subsectionFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const cardsContainer = document.getElementById("cardsContainer");
const resultsInfo = document.getElementById("resultsInfo");
const preSearchPanel = document.getElementById("preSearchPanel");
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
  }
];

const profileComponentsByName = {
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
  "Selecting by lab section first can reduce request form errors before sample collection.",
  "Pre-analytical errors (labeling, timing, and transport) can affect results more than analyzer performance.",
  "Cardiac markers are most useful when interpreted with symptom timing and serial sampling.",
  "In suspected sepsis, blood cultures are ideally collected before antibiotics where clinically feasible.",
  "Turnaround time differs by method: routine chemistry is faster than many culture-based tests.",
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
  chemistry: { label: "Biochemistry", hint: "Kidney function (U+E), Bone (CMP profile), liver function and pancreas" },
  endocrinology: { label: "Endocrinology", hint: "Thyroid, reproductive, adrenal, diabetes hormones" },
  tumour_markers: { label: "Tumour Markers", hint: "PSA, AFP, CEA, CA markers, beta-hCG" },
  metabolic_genetic: { label: "Metabolic / Genetic Disorders", hint: "Porphyria and inherited disorder screens" },
  allergy: { label: "Allergy", hint: "IgE and allergy component profiles" },
  haematology: { label: "Haematology", hint: "General, coagulation, blood grouping" },
  drugs: { label: "Drugs", hint: "Drugs of abuse and therapeutic drug monitoring" },
  immunology: { label: "Immunology", hint: "Autoimmune and infectious serology" },
  micro_virology: { label: "Microbiology / Virology", hint: "MC&S, PCR, virology" },
  general: { label: "General", hint: "Other routine tests" }
};

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
  "CMP": ["Comprehensive Metabolic Panel", "CMP profile"],
  "FBC": ["CBC", "Complete blood count", "Full blood count"],
  "Sodium": ["Na"],
  "Potassium": ["K"],
  "Chloride": ["Cl"],
  "Calcium": ["Ca"],
  "Magnesium": ["Mg"],
  "Phosphate": ["PO4", "PO4-3", "Phos"],
  "Liver Function Tests (LFT)": ["LFT", "Liver profile", "Hepatic profile"],
  "INR": ["PT INR", "Clotting ratio"],
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin"],
  "Blood Group & Rh": ["ABO", "Rh factor", "Group "],
  "TSH / Thyroid Profile": ["Thyroid function", "TFT"],
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

const ueComponentTests = ["Urea", "Chloride", "Potassium", "Sodium", "Creatinine"];

function collapseUESelection(selectionSet) {
  const hasProfile = selectionSet.has("U&E");
  const hasAllComponents = ueComponentTests.every((name) => selectionSet.has(name));

  if (hasProfile || hasAllComponents) {
    selectionSet.add("U&E");
    ueComponentTests.forEach((name) => selectionSet.delete(name));
  }
}

function renderDrawSelectionList() {
  if (!drawSelectionList) return;
  const query = drawSearchInput?.value || "";

  const candidates = enrichedTests
    .filter((test) => !query || matchesQuery(test, query))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!candidates.length) {
    drawSelectionList.innerHTML = `<p class="draw-selection-empty">No tests match this search.</p>`;
    return;
  }

  drawSelectionList.innerHTML = candidates
    .map((test) => `
      <label class="draw-selection-item">
        <input type="checkbox" data-draw-test="${test.name}" ${stagedSelectedTestNames.has(test.name) ? "checked" : ""} />
        <span>${test.name}</span>
      </label>
    `)
    .join("");

  drawSelectionList.querySelectorAll("input[data-draw-test]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const testName = checkbox.getAttribute("data-draw-test");
      if (checkbox.checked) {
        stagedSelectedTestNames.add(testName);
      } else {
        stagedSelectedTestNames.delete(testName);
      }
      collapseUESelection(stagedSelectedTestNames);
      renderDrawSelectionSummary();
    });
  });

  renderDrawSelectionSummary();
}

function renderDrawSelectionSummary() {
  if (!drawSelectionCount) return;
  const count = stagedSelectedTestNames.size;
  drawSelectionCount.textContent = `${count} test${count !== 1 ? "s" : ""} selected`;
}

function animateDrawResultCard() {
  if (!drawResultCard) return;
  drawResultCard.classList.remove("draw-result-updated");
  void drawResultCard.offsetWidth;
  drawResultCard.classList.add("draw-result-updated");
}

function openDrawModal() {
  if (!drawModal) return;
  stagedSelectedTestNames = new Set(selectedTestNames);
  drawModal.hidden = false;
  document.body.classList.add("modal-open");
  if (drawResultCard) drawResultCard.hidden = true;
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

function applyHivRprRule(plan, selectedTests) {
  const selectedLower = selectedTests.map((test) => test.name.toLowerCase());
  const hasHiv = selectedLower.some((name) => name.includes("hiv"));
  const hasRpr = selectedLower.some((name) => name.includes("rpr"));
  const withOtherTests = selectedTests.length > 1;
  if (!withOtherTests || (!hasHiv && !hasRpr)) return "";

  let goldItem = plan.items.find((item) => item.key === "Gold/Yellow");
  if (!goldItem) {
    goldItem = { key: "Gold/Yellow", label: "Gold/Yellow", count: 2, tests: [] };
    plan.items.push(goldItem);
  } else {
    goldItem.count = Math.max(goldItem.count, 2);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "HIV/RPR rule applied: use 2 x Gold/Yellow when requested with other tests.";
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
        <p class="draw-group-tests">No tests selected yet. Tick tests above and submit selection.</p>
      </article>
    `;
    drawPlannerNote.textContent = "Result card updates after submit.";
    animateDrawResultCard();
    return;
  }

  const plan = getLabDrawPlan(selectedTests);
  const hivRprNote = applyHivRprRule(plan, selectedTests);
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

  if (plan.manual.length) {
    drawPlannerNote.textContent = `Manual review needed for: ${plan.manual.join(", ")}.`;
  } else if (hivRprNote) {
    drawPlannerNote.textContent = hivRprNote;
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

  if (
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
    name.includes("iron studies") ||
    name.includes("fe studies") ||
    name.includes("esr")
  ) return { sectionId: "haematology", subsection: "General" };

  if (
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

function getSubsectionsForSection(sectionId) {
  const found = new Set(
    enrichedTests
      .filter((test) => !sectionId || test.grouping.sectionId === sectionId)
      .map((test) => test.grouping.subsection)
  );

  return [...found].sort((a, b) => a.localeCompare(b));
}

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

function renderGroupChips() {
  if (!groupChips) return;

  groupChips.innerHTML = chipGroups
    .map((groupId) => {
      const group = sectionMeta[groupId];
      return `
        <button class="group-chip" type="button" data-group="${groupId}">
          <span>
            <strong>${group.label}</strong>
            <small>${group.hint}</small>
          </span>
        </button>
      `;
    })
    .join("");

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const groupId = chip.getAttribute("data-group");
      sectionFilter.value = groupId;
      refreshSubsectionOptions();
      subsectionFilter.value = "";
      applyFilters();
    });
  });
}

function renderSectionOptions() {
  if (!sectionFilter) return;

  sectionFilter.innerHTML = `
    <option value="">All sections</option>
    ${chipGroups
      .map((id) => `<option value="${id}">${sectionMeta[id].label}</option>`)
      .join("")}
    <option value="general">General</option>
  `;
}

function refreshSubsectionOptions() {
  if (!subsectionFilter) return;

  const selectedSection = sectionFilter?.value || "";
  const options = getSubsectionsForSection(selectedSection);
  const current = subsectionFilter.value;

  subsectionFilter.innerHTML = `
    <option value="">All subsections</option>
    ${options.map((name) => `<option value="${name}">${name}</option>`).join("")}
  `;

  const stillValid = options.includes(current);
  subsectionFilter.value = stillValid ? current : "";
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

function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = sectionFilter?.value || "";
  const selectedSubsection = subsectionFilter?.value || "";
  const normalizedQuery = normalizeForSearch(query);
  const isInflammatoryShortcut = normalizedQuery === "inflammatory" || normalizedQuery === "inflammation";
  const isHeartAttackShortcut = ["heart attack", "myocardial infarction", "acs", "acute coronary syndrome"]
    .includes(normalizedQuery);
  const isUEProfileShortcut = [
    "u plus e",
    "u and e",
    "u e",
    "kidney function",
    "renal profile"
  ].includes(normalizedQuery);

  return enrichedTests.filter((test) => {
    if (selectedSection && test.grouping.sectionId !== selectedSection) return false;
    if (selectedSubsection && test.grouping.subsection !== selectedSubsection) return false;
    if (isInflammatoryShortcut) {
      return test.name === "CRP" || test.name === "Procalcitonin (PCT)";
    }
    if (isHeartAttackShortcut) {
      return test.name === "Troponin I" || test.name === "CK Total";
    }
    if (isUEProfileShortcut) {
      return test.name === "U&E";
    }
    return matchesQuery(test, query);
  });
}

function getCopySummary(test) {
  const specimenLine = test.grouping.sectionId === "micro_virology"
    ? `Required Specimen: ${test.specimenGuide}`
    : `Tube: ${test.tubeColor}\nSpecimen: ${test.specimen}`;

  return [
    `${test.name}`,
    `Section: ${test.section.label} > ${test.grouping.subsection}`,
    `Clinical Use: ${test.clinicalUse}`,
    specimenLine,
    `Turnaround: ${test.turnaroundTime}`,
    `Critical Preparation: ${test.criticalPrep}`
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function renderCards(filteredTests) {
  cardsContainer.innerHTML = "";

  if (filteredTests.length === 0) {
    resultsInfo.textContent = "0 tests found";
    cardsContainer.innerHTML = `
      <div class="no-results">
        No matching test found. Try searching by test, section, alias, or condition (e.g. iron deficiency anaemia, heart attack, prostate cancer).
      </div>
    `;
    return;
  }

  resultsInfo.textContent = `${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`;

  filteredTests.forEach((test) => {
    const isMicro = test.grouping.sectionId === "micro_virology";
    const card = document.createElement("div");
    card.className = "card";
    const isSelected = selectedTestNames.has(test.name);
    card.classList.toggle("card-selected", isSelected);
    const profileComponents = profileComponentsByName[test.name] || [];
    const hasProfileComponents = profileComponents.length > 0;
    const specimenField = isMicro
      ? `
      <div class="field">
        <span class="label">Required Specimen</span>
        <span>${test.specimenGuide}</span>
      </div>
      `
      : `
      <div class="field">
        <span class="label">Tube Colour</span>
        <div class="tube-color-row">
          <span class="tube-icon" style="--tube-color: ${test.borderColor};" aria-hidden="true"></span>
          <span>${test.tubeColor}</span>
        </div>
      </div>
      <div class="field">
        <span class="label">Specimen</span>
        <span>${test.specimen}</span>
      </div>
      `;

    card.innerHTML = `
      <h2>${test.name}</h2>
      <div class="card-meta-row">
        <div class="test-group-badge">${test.section.label}</div>
        ${hasProfileComponents ? `<button class="profile-tests-btn" type="button" data-profile-name="${test.name}">Tests</button>` : ""}
      </div>
      ${specimenField}
      <div class="field">
        <span class="label">Turnaround Time</span>
        <span>${test.turnaroundTime}</span>
      </div>
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
        <button class="draw-select-btn${isSelected ? " active" : ""}" type="button">${isSelected ? "Selected for Draw Bloods" : "Add to Draw Bloods"}</button>
        <button class="copy-btn" type="button">Copy Summary</button>
      </div>
    `;

    const toggleBtn = card.querySelector(".card-toggle-btn");
    const drawSelectBtn = card.querySelector(".draw-select-btn");
    const copyBtn = card.querySelector(".copy-btn");
    const profileTestsBtn = card.querySelector(".profile-tests-btn");
    toggleBtn.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      toggleBtn.textContent = expanded ? "See less" : "See more";
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    copyBtn.addEventListener("click", async () => {
      const original = copyBtn.textContent;
      try {
        await copyText(getCopySummary(test));
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1200);
      } catch (_) {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1400);
      }
    });

    drawSelectBtn.addEventListener("click", () => {
      if (selectedTestNames.has(test.name)) {
        selectedTestNames.delete(test.name);
      } else {
        selectedTestNames.add(test.name);
      }
      collapseUESelection(selectedTestNames);

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
  const hasSectionFilter = Boolean(sectionFilter?.value);
  const hasSubsectionFilter = Boolean(subsectionFilter?.value);
  preSearchPanel.style.display = hasQuery || hasSectionFilter || hasSubsectionFilter ? "none" : "grid";

  if (!hasQuery && !hasSectionFilter && !hasSubsectionFilter) {
    resultsInfo.textContent = "Start typing a test or use filters to narrow results.";
    cardsContainer.innerHTML = "";
    return;
  }

  renderCards(getFilteredTests());
}

function bindEvents() {
  searchInput.addEventListener("input", applyFilters);

  sectionFilter.addEventListener("change", () => {
    refreshSubsectionOptions();
    applyFilters();
  });

  subsectionFilter.addEventListener("change", applyFilters);

  resetFiltersBtn.addEventListener("click", () => {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    if (typeof searchInput.blur === "function") {
      searchInput.blur();
    }

    searchInput.value = "";
    sectionFilter.value = "";
    refreshSubsectionOptions();
    subsectionFilter.value = "";
    applyFilters();
  });

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
    drawSearchInput.addEventListener("input", renderDrawSelectionList);
  }

  if (submitDrawSelectionBtn) {
    submitDrawSelectionBtn.addEventListener("click", () => {
      selectedTestNames.clear();
      stagedSelectedTestNames.forEach((name) => selectedTestNames.add(name));
      collapseUESelection(selectedTestNames);
      renderDrawResult();
      renderCards(getFilteredTests());
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
renderGroupChips();
renderSectionOptions();
refreshSubsectionOptions();
bindEvents();
initInstallHelper();
applyFilters();
renderDrawSelectionList();
