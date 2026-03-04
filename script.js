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

let deferredInstallPrompt = null;

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
  chemistry: { label: "Chemistry", hint: "Kidney function (U+E), Bone (CMP profile), liver function and pancreas" },
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
  "FBC": ["CBC", "Complete blood count", "Full blood count"],
  "Liver Function Tests (LFT)": ["LFT", "Liver profile", "Hepatic profile"],
  "INR": ["PT INR", "Clotting ratio"],
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin"],
  "Blood Group & Rh": ["ABO", "Rh factor", "Group "],
  "TSH / Thyroid Profile": ["Thyroid function", "TFT"],
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
  "Iron Studies": {
    use: "Workup for iron deficiency anaemia and microcytic anaemia.",
    keywords: ["iron deficiency anaemia", "iron deficiency anemia", "microcytic anaemia", "low iron", "fatigue"]
  },
  "FBC": {
    use: "Baseline screen for anaemia, infection, inflammation, and platelet disorders.",
    keywords: ["anaemia", "anemia", "infection", "platelets", "low hb", "fatigue", "leukemia"]
  },
  "Troponin T HS": {
    use: "Primary marker for suspected acute coronary syndrome / heart attack.",
    keywords: ["heart attack", "myocardial infarction", "chest pain", "acs", "coronary syndrome"]
  },
  "CK Total": {
    use: "Adjunct cardiac/muscle injury marker in chest pain and myopathy contexts.",
    keywords: ["heart attack", "muscle injury", "myopathy", "chest pain"]
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
    yellow: "Gold",
    lavender: "Lavender",
    purple: "Purple",
    pink: "Pink",
    black: "Black",
    gold: "Gold"
  };

  const raw = String(value || "").trim();
  const key = raw.toLowerCase();
  return map[key] || raw;
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

function getProfileEmoji(testName) {
  const name = testName.toLowerCase();

  if (name.includes("liver") || name.includes("lft")) return "🧪";
  if (name.includes("u&e") || name === "u&e") return "🫘";
  return "";
}

function enrichTest(test) {
  const grouping = getTestGrouping(test.name);
  const section = sectionMeta[grouping.sectionId] || sectionMeta.general;
  const aliases = aliasByName[test.name] || [];
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
    ...normalized.clinicalKeywords
  ].join(" "));

  return normalized;
}

const enrichedTests = tests.map(enrichTest);

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
  return tokens.every((token) => test.searchBlob.includes(token));
}

function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = sectionFilter?.value || "";
  const selectedSubsection = subsectionFilter?.value || "";

  return enrichedTests.filter((test) => {
    if (selectedSection && test.grouping.sectionId !== selectedSection) return false;
    if (selectedSubsection && test.grouping.subsection !== selectedSubsection) return false;
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
    `Critical Prep: ${test.criticalPrep}`,
    `Notes: ${test.notes}`
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
    const searchEmoji = getProfileEmoji(test.name);
    const card = document.createElement("div");
    card.className = "card";

    const specimenField = isMicro
      ? `
      <div class="field">
        <span class="label">Required Specimen</span>
        <span>${test.specimenGuide}</span>
      </div>
      `
      : `
      <div class="field">
        <span class="label">Tube Color</span>
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
      <h2>${test.name}${searchEmoji ? ` <span class="profile-emoji" aria-hidden="true">${searchEmoji}</span>` : ""}</h2>
      <div class="test-group-badge">${test.section.label}</div>
      ${specimenField}
      <div class="field">
        <span class="label">Turnaround Time</span>
        <span>${test.turnaroundTime}</span>
      </div>
      <div class="card-extra">
        <div class="test-subgroup-badge">${test.grouping.subsection}</div>
        <div class="field critical-prep-field">
          <span class="label">Critical Prep</span>
          <span>${test.criticalPrep}</span>
        </div>
        <div class="field">
          <span class="label">Clinical Use</span>
          <span>${test.clinicalUse}</span>
        </div>
        <div class="field">
          <span class="label">Notes</span>
          <span>${test.notes}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-toggle-btn" type="button" aria-expanded="false">See more</button>
        <button class="copy-btn" type="button">Copy Summary</button>
      </div>
    `;

    const toggleBtn = card.querySelector(".card-toggle-btn");
    const copyBtn = card.querySelector(".copy-btn");
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
