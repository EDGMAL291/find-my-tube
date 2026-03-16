const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const cardsContainer = document.getElementById("cardsContainer");
const resultsToolbar = document.getElementById("resultsToolbar");
const resultsInfo = document.getElementById("resultsInfo");
const resultsBackToTopBtn = document.getElementById("resultsBackToTopBtn");
const selectionNoticeToast = document.getElementById("selectionNoticeToast");
const preSearchPanel = document.getElementById("preSearchPanel");
const brandHomeBtn = document.getElementById("brandHomeBtn");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuPanel = document.getElementById("menuPanel");
const toggleQuickToolsBtn = document.getElementById("toggleQuickToolsBtn");
const factCarouselPanel = document.getElementById("factCarouselPanel");
const factCarouselContent = document.getElementById("factCarouselContent");
const tipText = document.getElementById("tipText");
const groupChips = document.getElementById("groupChips");
const groupHintsPanel = document.querySelector(".group-hints");
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
const siteFooter = document.getElementById("siteFooter");
const profileModal = document.getElementById("profileModal");
const profileModalTitle = document.getElementById("profileModalTitle");
const profileModalList = document.getElementById("profileModalList");
const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");
const legalModal = document.getElementById("legalModal");
const legalModalTitle = document.getElementById("legalModalTitle");
const legalModalBody = document.getElementById("legalModalBody");
const closeLegalModalBtn = document.getElementById("closeLegalModalBtn");
const legalDocButtons = document.querySelectorAll("[data-legal-doc]");
const SEARCH_PLACEHOLDER_BASE = "Search by test or clinical question";
const SEARCH_PLACEHOLDER_HINT = `${SEARCH_PLACEHOLDER_BASE} (e.g. Iron studies or anaemia)`;
const GOLD_VOLUME_PROFILE_NAMES = new Set([
  "U&E", // 1
  "Liver Function Tests (LFT)", // 2
  "CMP", // 3
  "CRP", // 4
  "Cardiac Profile", // 5
  "Lipid Profile / Lipogram", // 6
  "Fe Studies" // 9
]);
const OGTT_MULTI_DRAW_TESTS = new Set([
  "OGTT (2hr)",
  "OGTT Pregnancy (75g, 2hr)"
]);
const PURPLE_VOLUME_TRIGGER_TESTS = new Set([
  "HbA1c" // 8
]);

let deferredInstallPrompt = null;
const selectedTestNames = new Set();
let activeSectionGroup = "";
let selectionNoticeTimeoutId = 0;
let selectionNoticeHideTimeoutId = 0;
const CONDITION_SHORTCUT_DISCLAIMER = "Common initial request shortcut only. Confirm with local protocol, senior review, and patient context.";
const RACK_HINT_STORAGE_KEY = "fmt-rack-hint-dismissed";
const AUTO_EXPAND_CRITICAL_NOTE_TESTS = new Set(["Ammonia", "Blood Bank / Transfusion"]);
let hasDismissedRackHint = false;
let lastLegalModalTrigger = null;

try {
  hasDismissedRackHint = localStorage.getItem(RACK_HINT_STORAGE_KEY) === "1";
} catch {
  hasDismissedRackHint = false;
}

const legalContentById = {
  privacy: {
    title: "Privacy Policy",
    html: `
      <article class="legal-copy">
        <p>Find My Tube is designed as a laboratory reference aid. It should be used without entering patient names, file numbers, ID numbers, or other patient-identifiable information.</p>
      </article>
      <article class="legal-copy">
        <h4>Local Device Data</h4>
        <ul>
          <li>This app may store small on-device items such as cached files for offline use and simple interface preferences.</li>
          <li>These local items are used to help the app load quickly and remember basic UI behavior.</li>
        </ul>
      </article>
      <article class="legal-copy">
        <h4>Operational Data</h4>
        <ul>
          <li>If this site is hosted by a third party, standard technical logs such as IP address, browser type, and access times may be processed by that hosting provider.</li>
          <li>Do not use this app to store or transmit confidential patient data unless a clinic-specific privacy workflow has been formally added.</li>
        </ul>
      </article>
      <p class="legal-copy-note">If you later add analytics, forms, logins, or contact features, update this policy so it matches the real data flow.</p>
    `
  },
  terms: {
    title: "Terms of Use",
    html: `
      <article class="legal-copy">
        <p>By using Find My Tube, you agree that this site is provided as an informational support tool for specimen collection guidance and quick test lookup.</p>
      </article>
      <article class="legal-copy">
        <h4>Use Of Content</h4>
        <ul>
          <li>Local laboratory protocols, clinician judgment, and direct confirmation from the performing laboratory always take precedence.</li>
          <li>Test availability, accepted specimens, additive requirements, and turnaround times may differ between laboratories and may change without notice.</li>
          <li>You are responsible for confirming unusual, urgent, or high-risk requests before collection.</li>
        </ul>
      </article>
      <article class="legal-copy">
        <h4>Scope</h4>
        <ul>
          <li>This site may be updated, corrected, expanded, or withdrawn at any time.</li>
          <li>No right to rely on the site as a sole clinical instruction source is created by using it.</li>
        </ul>
      </article>
    `
  },
  disclaimer: {
    title: "Disclaimer",
    html: `
      <article class="legal-copy">
        <p>Find My Tube does not provide medical advice, emergency advice, blood bank authorization, or a substitute for accredited laboratory instructions.</p>
      </article>
      <article class="legal-copy">
        <h4>Important Limits</h4>
        <ul>
          <li>The content is a practical reference only and may not cover every exception, profile variation, or site-specific workflow.</li>
          <li>Urgent, unusual, transfusion-related, neonatal, and time-critical requests should be confirmed directly with the relevant laboratory or blood bank.</li>
          <li>Clinical decisions must be made by appropriately qualified professionals using full patient context.</li>
        </ul>
      </article>
      <article class="legal-copy">
        <h4>Safety Reminder</h4>
        <p>If a collection requirement, preservative bottle, or handling step is uncertain, pause and verify with the local lab before drawing the sample.</p>
      </article>
    `
  }
};

function setResultsInfo(text) {
  if (!resultsInfo) return;
  const message = String(text || "");
  resultsInfo.textContent = message;
  resultsInfo.hidden = message.length === 0;
  updateResultsToolbar();
}

function updateResultsToolbar() {
  if (!resultsToolbar) return;

  const hasMessage = Boolean(resultsInfo && !resultsInfo.hidden);
  resultsToolbar.hidden = !hasMessage;
  updateBackToTopVisibility();
}

function updateBackToTopVisibility() {
  if (!resultsBackToTopBtn) return;

  const hasResultsView = Boolean(activeSectionGroup || String(searchInput?.value || "").trim());
  const hasModalOpen = document.body.classList.contains("modal-open");
  const hasScrolledDown = window.scrollY > 40;
  const isVisible = hasResultsView && hasScrolledDown && !hasModalOpen;

  resultsBackToTopBtn.hidden = !hasResultsView;
  resultsBackToTopBtn.classList.toggle("is-visible", isVisible);
  resultsBackToTopBtn.tabIndex = isVisible ? 0 : -1;
  resultsBackToTopBtn.setAttribute("aria-hidden", isVisible ? "false" : "true");
}

function showSelectionNotice(message) {
  if (!selectionNoticeToast) return;

  const text = String(message || "").trim();
  if (!text) return;

  window.clearTimeout(selectionNoticeTimeoutId);
  window.clearTimeout(selectionNoticeHideTimeoutId);

  selectionNoticeToast.textContent = text;
  selectionNoticeToast.hidden = false;
  window.requestAnimationFrame(() => {
    selectionNoticeToast.classList.add("visible");
  });

  selectionNoticeTimeoutId = window.setTimeout(() => {
    selectionNoticeToast.classList.remove("visible");
    selectionNoticeHideTimeoutId = window.setTimeout(() => {
      selectionNoticeToast.hidden = true;
    }, 200);
  }, 2600);
}

function dismissRackHint() {
  if (hasDismissedRackHint) return;
  hasDismissedRackHint = true;
  try {
    localStorage.setItem(RACK_HINT_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures and continue without persistence.
  }
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

function refreshSearchPlaceholder() {
  if (!searchInput) return;
  if (searchInput.value.trim()) return;
  searchInput.placeholder = document.activeElement === searchInput
    ? SEARCH_PLACEHOLDER_BASE
    : SEARCH_PLACEHOLDER_HINT;
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

function scrollHomeViewportToTop() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
    brandHomeBtn?.focus({ preventScroll: true });
  });
}

function goHome() {
  closeMenu();
  closeDrawModal();
  closeProfileModal();
  closeLegalModal({ restoreFocus: false });

  setSectionView("", { historyMode: "push", scrollToTop: false, clearSearch: true });
  scrollHomeViewportToTop();
}

function focusMainSearchField() {
  if (!searchInput) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const target = searchInput.closest(".search-box") || searchInput;
  const focusInput = () => {
    const cursorEnd = searchInput.value.length;
    searchInput.focus({ preventScroll: true });
    if (typeof searchInput.setSelectionRange === "function") {
      searchInput.setSelectionRange(cursorEnd, cursorEnd);
    }
  };

  if (isMobile) {
    focusInput();
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    focusInput();
  });
}

function scrollToResultsTop() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });
}

function shouldPreserveSearchFocusOnMobile() {
  return Boolean(
    searchInput &&
    document.activeElement === searchInput &&
    window.matchMedia("(max-width: 600px)").matches
  );
}

function restoreSearchFocusWithoutScroll() {
  if (!searchInput) return;
  const cursorEnd = searchInput.value.length;
  searchInput.focus({ preventScroll: true });
  if (typeof searchInput.setSelectionRange === "function") {
    searchInput.setSelectionRange(cursorEnd, cursorEnd);
  }
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
      { key: "Green", label: "Green", count: 1, detail: "Preferred tube for this cardiac marker set. Gold/Yellow remains an acceptable alternative if local policy uses serum collection." }
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
  "ANCA (PR3, MPO, p- and c-ANCA, GBM IIF)": [
    "PR3 Antibody",
    "MPO Antibody",
    "p-ANCA",
    "c-ANCA",
    "GBM IIF"
  ],
  "Antenatal Screen (ANTINV)": [
    "Blood Group & Rh",
    "RBC Antibody Screen (Antenatal)",
    "FBC",
    "HIV ELISA",
    "RPR (Syphilis Screen)",
    "Hepatitis B Surface Antigen (HBsAg)",
    "Rubella IgG",
    "Random Glucose"
  ],
  "Cord Blood": [
    "TSH",
    "RPR (Syphilis Screen)"
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
  "Hirsutism Screen (Full)": [
    "Total Testosterone (+SHBG if Female)",
    "DHEAS",
    "17-OH Progesterone",
    "Prolactin",
    "FSH",
    "LH"
  ],
  "Infertility Screen (Female)": [
    "FSH",
    "LH",
    "Prolactin",
    "Progesterone",
    "Estradiol"
  ],
  "Infertility Screen (Male)": [
    "FSH",
    "LH",
    "Prolactin",
    "Total Testosterone (+SHBG if Female)",
    "Free Testosterone (Calculated, Male)"
  ],
  "Cardiac Profile": [
    "CK Total",
    "CK-MB Mass",
    "Troponin I"
  ],
  "Drugs of Abuse Screen (Urine)": [
    "Amphetamine (Urine)",
    "Barbiturate (Urine)",
    "Benzodiazepine (Urine)",
    "Cannabis (Urine)",
    "Cocaine (Urine)",
    "Mandrax (Urine)",
    "Methcathinone CAT (Urine)",
    "Opiates (Urine)"
  ],
  "Drugs of Abuse / Overdose Screen": [
    "Drugs of Abuse Screen (Urine)",
    "Ethanol (Blood)",
    "Paracetamol (Blood)",
    "Salicylate (Blood)"
  ],
  "Thyroid Function Test (TFT)": [
    "TSH",
    "Free T4",
    "Free T3"
  ],
  "CSF Profile": [
    "CSF MCS",
    "CSF Cell Count and Chemistry",
    "CSF Cytology"
  ],
  "CSF Cell Count and Chemistry": [
    "CSF Cell Count and Differential",
    "CSF Glucose",
    "CSF Protein",
    "CSF IgG Index",
    "CSF ADA",
    "CSF Oligoclonal Bands"
  ],
  "U&E": ["Urea", "Chloride", "Potassium", "Sodium", "Creatinine", "eGFR (Calculated)"],
  "Blood Gases": ["pH", "pCO2", "pO2", "HCO3-", "Base Excess", "O2 Saturation", "Lactate"],
  "STD PCR": [
    "Chlamydia trachomatis PCR",
    "Neisseria gonorrhoeae PCR",
    "Trichomonas vaginalis PCR",
    "Mycoplasma genitalium PCR"
  ],
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
  "Fasting Glucose": [
    "Glucose Fasting",
    "Glucose",
    "Fasting",
    "Fasting sugar",
    "Blood sugar fasting"
  ],
  "Cord Blood": [
    "Cord blood profile",
    "Cord blood tsh rpr",
    "Neonatal cord blood",
    "Cord blood screening"
  ],
  "OGTT (2hr)": [
    "OGTT",
    "GTT",
    "Oral glucose tolerance test",
    "75 g OGTT",
    "Glucose tolerance test"
  ],
  "OGTT Pregnancy (75g, 2hr)": [
    "Pregnancy OGTT",
    "Gestational OGTT",
    "75 g pregnancy OGTT",
    "Pregnancy glucose tolerance test",
    "GTT pregnancy"
  ],
  "Random Glucose": [
    "Glucose Random",
    "Glucose",
    "Random",
    "Random sugar",
    "Blood sugar random"
  ],
  "Malaria PCR": ["Malaria PCR (with ID if Positive)"],
  "INR": ["PT INR", "Clotting ratio", "INR calculated"],
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin"],
  "Blood Group & Rh": ["ABO", "Rh factor", "Group "],
  "Blood Bank / Transfusion": ["Blood bank", "Blood transfusion", "Transfusion", "Transfusion request"],
  "STD PCR": [
    "STI PCR",
    "STD panel",
    "STI panel",
    "STD screen",
    "STI screen",
    "STD PCR panel",
    "STI PCR panel",
    "Vaginal swab STI PCR",
    "Urine STI PCR"
  ],
  "Chlamydia trachomatis PCR": [
    "Chlamydia PCR",
    "Chlamydia",
    "CT PCR",
    "CT"
  ],
  "Neisseria gonorrhoeae PCR": [
    "Gonorrhoea PCR",
    "Gonorrhea PCR",
    "Gonorrhoea",
    "Gonorrhea",
    "GC PCR",
    "GC"
  ],
  "Trichomonas vaginalis PCR": [
    "Trichomonas PCR",
    "Trichomonas",
    "Trich PCR",
    "Trichomoniasis PCR"
  ],
  "Mycoplasma genitalium PCR": [
    "Mycoplasma genitalium",
    "Mycoplasma PCR",
    "Mgen",
    "Mgen PCR",
    "M genitalium PCR"
  ],
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
  "Protein:Creatinine Ratio (Random Urine)": [
    "Urine protein creatinine ratio",
    "Urine protein:creatinine ratio",
    "Protein creatinine ratio",
    "UPCR",
    "PCR urine"
  ],
  "Albumin:Creatinine Ratio (Random Urine)": [
    "Urine albumin creatinine ratio",
    "Urine albumin:creatinine ratio",
    "Albumin creat ratio",
    "Urine ACR",
    "ACR"
  ],
  "Daily Urine Protein (24hr Urine)": [
    "Daily urine protein",
    "24 hour urine protein",
    "24hr urine protein",
    "24-hour urine protein"
  ],
  "Haemochromatosis PCR": [
    "Hemochromatosis PCR",
    "Hereditary haemochromatosis",
    "Hereditary hemochromatosis",
    "HFE",
    "HFE mutation",
    "HFE gene"
  ],
  "Cardiac Profile": [
    "Cardiac marker profile",
    "Cardiac markers",
    "Cardiac marker",
    "Cardiac enzymes"
  ],
  "Acute Porphyria Attack Screen (Urine)": [
    "Acute porphyria attack screen",
    "Acute porphyria screen",
    "Urine porphyria screen",
    "Urine porphobilinogen",
    "Acute pophyria attack screen"
  ],
  "Full Porphyria Screen (Blood, Urine, Stool)": [
    "Full porphyria screen",
    "Porphyria screen",
    "Full Porphyria Screen (Urine, Blood, Stool)",
    "Blood urine stool porphyria"
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
  "Cortisol (24hr Urine)": [
    "Urine cortisol",
    "24 hour urine cortisol",
    "24hr urine cortisol",
    "24-hour urine cortisol"
  ],
  "Aldosterone:Renin Ratio": [
    "Aldosterone renin ratio",
    "Aldo renin ratio",
    "ARR"
  ],
  "Faecal Occult Blood": [
    "Occult blood",
    "Faecal occult",
    "Fecal occult blood",
    "Fecal occult",
    "FOB",
    "FOBT",
    "FIT",
    "Stool occult blood",
    "Stool blood test"
  ],
  "ASOT": [
    "ASO",
    "ASO titre",
    "Antistreptolysin O",
    "Antistreptolysin O titre"
  ],
  "Anti-DNase B": [
    "Anti DNase B",
    "Anti-DNase",
    "ADNase",
    "Anti streptococcal DNase"
  ],
  "Anti-Smooth Muscle Antibody": [
    "Smooth muscle antibody",
    "Anti smooth muscle antibody",
    "ASMA",
    "Actin smooth muscle antibody"
  ],
  "ANCA (PR3, MPO, p- and c-ANCA, GBM IIF)": [
    "ANCA",
    "ANCA profile",
    "ANCA vasculitis profile",
    "PR3 MPO p ANCA c ANCA GBM"
  ],
  "p-ANCA": [
    "P ANCA",
    "pANCA",
    "Perinuclear ANCA",
    "Perinuclear anti-neutrophil cytoplasmic antibody"
  ],
  "c-ANCA": [
    "C ANCA",
    "cANCA",
    "Cytoplasmic ANCA",
    "Cytoplasmic anti-neutrophil cytoplasmic antibody"
  ],
  "PR3 Antibody": [
    "PR3",
    "Proteinase 3 antibody",
    "Anti-PR3",
    "PR3 antibody"
  ],
  "MPO Antibody": [
    "MPO",
    "Myeloperoxidase antibody",
    "Anti-MPO",
    "MPO antibody"
  ],
  "GBM IIF": [
    "GBM",
    "Anti-GBM",
    "GBM antibody",
    "GBM IIF",
    "Anti-GBM IIF"
  ],
  "CMV IgG": [
    "Cytomegalovirus IgG",
    "CMV antibody IgG",
    "CMV serology IgG"
  ],
  "CMV IgM": [
    "Cytomegalovirus IgM",
    "CMV antibody IgM",
    "CMV serology IgM"
  ],
  "Anti-LKM1 Antibody": [
    "LKM1",
    "LKM-1",
    "Anti LKM1 antibody",
    "Liver kidney microsomal type 1 antibody",
    "Liver-kidney microsomal antibody"
  ],
  "Anti-SLA/LP Antibody": [
    "SLA",
    "LP antibody",
    "SLA/LP",
    "Anti SLA LP antibody",
    "Anti SLA/LP antibody",
    "Soluble liver antigen antibody",
    "Liver pancreas antibody"
  ],
  "Brucella IgM": [
    "Brucella IgM/IgG",
    "Brucella serology"
  ],
  "Brucella IgG": [
    "Brucella IgM/IgG",
    "Brucella serology"
  ],
  "Rickettsia IgM": [
    "Rickettsia IgM/IgG",
    "Rickettsial serology"
  ],
  "Rickettsia IgG": [
    "Rickettsia IgM/IgG",
    "Rickettsial serology"
  ],
  "Rubella IgM": [
    "Rubella IgM only",
    "Rubella IgM/IgG",
    "Rubella serology"
  ],
  "Rubella IgG": [
    "Rubella IgG only",
    "Rubella IgM/IgG",
    "Rubella immunity",
    "Rubella serology"
  ],
  "Toxoplasma IgM": [
    "Toxoplasma IgM/IgG",
    "Toxoplasma serology"
  ],
  "Toxoplasma IgG": [
    "Toxoplasma IgM/IgG",
    "Toxoplasma serology"
  ],
  "Hirsutism Screen (Full)": [
    "Hirsutism profile",
    "Hirsutism screen",
    "Full hirsutism screen",
    "Androgen excess profile"
  ],
  "Infertility Screen (Female)": [
    "Female infertility",
    "Female infertility profile",
    "Female infertility screen",
    "Infertility female",
    "Infertility (Female)"
  ],
  "Infertility Screen (Male)": [
    "Male infertility",
    "Male infertility profile",
    "Male infertility screen",
    "Infertility male",
    "Infertility (Male)"
  ],
  "Hepatitis B (Acute)": [
    "Hepatitis B acute",
    "Acute hepatitis B",
    "Acute hep B",
    "Acute HBV"
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
  "Drugs of Abuse Screen (Urine)": [
    "Drugs of abuse urine screen",
    "Drugs of abuse screen",
    "Urine drug screen profile",
    "DOA screen"
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
  "CSF Profile": [
    "LP profile",
    "Lumbar puncture profile",
    "CSF screen",
    "CSF workup"
  ],
  "Urine MCS": ["Urine culture", "MC&S"],
  "Sputum MCS": ["Sputum culture", "MC&S"],
  "faeces MCS": ["Stool culture", "MC&S"],
  "Swab MCS": ["Swab culture", "MC&S"],
  "fluid MCS": ["Fluid culture", "MC&S"],
  "tissue MCS": ["Tissue culture", "MC&S"],
  "CSF MCS": ["CSF culture", "MC&S"],
  "CSF Cell Count and Chemistry": [
    "Cell count and chemistry",
    "CSF cell count and chemistry",
    "CSF chemistry",
    "CSF cell count chemistry",
    "CSF chemistry profile"
  ],
  "CSF Cell Count and Differential": [
    "CSF cell count",
    "CSF differential",
    "CSF microscopy"
  ],
  "CSF Glucose": [
    "Glucose CSF",
    "CSF sugar"
  ],
  "CSF Protein": [
    "Protein CSF"
  ],
  "CSF Cytology": [
    "Cytology CSF",
    "CSF malignant cells",
    "CSF cytospin"
  ],
  "Cryptococcal Antigen (CSF)": [
    "Cryptococcal antigen",
    "Cryptococcal Ag",
    "CrAg",
    "CSF cryptococcal antigen"
  ],
  "Enterovirus PCR (CSF)": [
    "Enterovirus PCR",
    "CSF enterovirus PCR",
    "Enterovirus"
  ],
  "Mumps PCR (CSF)": [
    "Mumps PCR",
    "CSF mumps PCR"
  ],
  "CSF IgG Index": [
    "IgG index",
    "CSF IgG",
    "CSF immunoglobulin g index"
  ],
  "CSF Oligoclonal Bands": [
    "Oligoclonal bands",
    "OCB",
    "CSF OCB"
  ],
  "CSF ADA": [
    "ADA",
    "Adenosine deaminase",
    "CSF adenosine deaminase"
  ],
  "FTA (CSF)": [
    "CSF FTA",
    "FTA CSF",
    "FTA-ABS CSF",
    "CSF treponemal antibody"
  ],
  "HSV-1 PCR (CSF)": [
    "HSV-1 PCR",
    "HSV 1 PCR",
    "HSV-1",
    "HSV 1",
    "CSF HSV-1 PCR"
  ],
  "HSV-2 PCR (CSF)": [
    "HSV-2 PCR",
    "HSV 2 PCR",
    "HSV-2",
    "HSV 2",
    "CSF HSV-2 PCR"
  ],
  "D-Dimer": ["D dimer"],
  "Prothrombin Time (PT)": ["PT"],
  "Partial Thromboplastin Time (PTT)": ["APTT", "aPTT"]
};

const clinicalProfileByName = {
  "CSF Profile": {
    use: "Combined CSF profile including microbiology, cell count, chemistry, and cytology for lumbar puncture workup.",
    keywords: ["csf", "lumbar puncture", "meningitis", "encephalitis", "antimicrobials"]
  },
  "CSF Cell Count and Chemistry": {
    use: "CSF chemistry profile including cell count and differential, glucose, protein, IgG index, ADA, and oligoclonal bands.",
    keywords: ["csf chemistry", "csf cell count", "lumbar puncture", "meningitis", "igg index", "oligoclonal bands", "ada"]
  },
  "CSF MCS": {
    use: "CSF microbiology culture request; local workflow includes cryptococcal antigen and may reflex it when lymphocytes are above 5/uL or protein is abnormal.",
    keywords: ["csf culture", "meningitis", "antimicrobials", "lumbar puncture", "cryptococcal antigen", "crag"]
  },
  "CSF Cytology": {
    use: "CSF cytology used to assess for malignant or abnormal cells in selected CNS workup.",
    keywords: ["csf cytology", "malignant cells", "leptomeningeal disease", "csf"]
  },
  "Cryptococcal Antigen (CSF)": {
    use: "CSF cryptococcal antigen test used in suspected cryptococcal meningitis.",
    keywords: ["cryptococcal antigen", "crag", "cryptococcal meningitis", "csf"]
  },
  "Enterovirus PCR (CSF)": {
    use: "CSF enterovirus PCR used in suspected viral meningitis or encephalitis.",
    keywords: ["enterovirus", "viral meningitis", "csf", "encephalitis"]
  },
  "Mumps PCR (CSF)": {
    use: "CSF mumps PCR used in suspected mumps meningitis or encephalitis.",
    keywords: ["mumps", "mumps pcr", "csf", "meningitis", "encephalitis"]
  },
  "CSF IgG Index": {
    use: "CSF IgG index used in inflammatory and demyelinating CNS workup.",
    keywords: ["igg index", "multiple sclerosis", "demyelination", "csf"]
  },
  "CSF Oligoclonal Bands": {
    use: "CSF oligoclonal bands used mainly in demyelinating and inflammatory CNS workup, especially multiple sclerosis.",
    keywords: ["oligoclonal bands", "ocb", "multiple sclerosis", "csf", "demyelination"]
  },
  "CSF ADA": {
    use: "CSF ADA used as an adjunct test in selected CNS infection workup such as TB meningitis.",
    keywords: ["ada", "csf ada", "tb meningitis", "tuberculous meningitis"]
  },
  "FTA (CSF)": {
    use: "CSF treponemal antibody test used in selected neurosyphilis workup.",
    keywords: ["fta csf", "csf fta", "treponemal antibody", "neurosyphilis", "csf"]
  },
  "HSV-1 PCR (CSF)": {
    use: "CSF HSV-1 PCR used in suspected herpes simplex encephalitis or meningitis.",
    keywords: ["hsv 1", "hsv-1", "herpes simplex", "encephalitis", "csf"]
  },
  "HSV-2 PCR (CSF)": {
    use: "CSF HSV-2 PCR used in suspected herpes simplex meningitis or encephalitis.",
    keywords: ["hsv 2", "hsv-2", "herpes simplex", "meningitis", "csf"]
  },
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
  "Hirsutism Screen (Full)": {
    use: "Reproductive endocrine profile for hirsutism and androgen excess workup.",
    keywords: ["hirsutism", "androgen excess", "hyperandrogenism", "facial hair", "pcos"]
  },
  "Infertility Screen (Female)": {
    use: "Female reproductive hormone profile for infertility and subfertility assessment.",
    keywords: ["female infertility", "subfertility", "ovulation", "amenorrhoea", "amenorrhea"]
  },
  "Infertility Screen (Male)": {
    use: "Male reproductive hormone profile for infertility and subfertility assessment.",
    keywords: ["male infertility", "subfertility", "fertility workup", "hypogonadism", "low testosterone"]
  },
  "Hepatitis B (Acute)": {
    use: "Acute hepatitis B serology request for suspected recent HBV infection.",
    keywords: ["acute hepatitis b", "hepatitis b acute", "hbv", "jaundice", "viral hepatitis"]
  },
  "Cardiac Profile": {
    use: "Cardiac marker profile including CK Total, CK-MB Mass, and Troponin I.",
    keywords: ["cardiac profile", "cardiac markers", "cardiac marker", "cardiac enzymes", "myocardial injury", "chest pain"]
  },
  "ANCA (PR3, MPO, p- and c-ANCA, GBM IIF)": {
    use: "ANCA-associated vasculitis profile combining PR3, MPO, p-ANCA, c-ANCA, and GBM IIF.",
    keywords: ["anca", "vasculitis", "pr3", "mpo", "p anca", "c anca", "gbm"]
  },
  "Anti-Smooth Muscle Antibody": {
    use: "Autoimmune hepatitis serology marker used in autoimmune liver disease workup.",
    keywords: ["smooth muscle antibody", "asma", "autoimmune hepatitis", "autoimmune liver disease"]
  },
  "p-ANCA": {
    use: "Perinuclear ANCA pattern marker used in vasculitis and selected autoimmune workup.",
    keywords: ["p anca", "perinuclear anca", "vasculitis", "mpo antibody"]
  },
  "c-ANCA": {
    use: "Cytoplasmic ANCA pattern marker used in vasculitis workup.",
    keywords: ["c anca", "cytoplasmic anca", "vasculitis", "pr3 antibody"]
  },
  "PR3 Antibody": {
    use: "Proteinase 3 antibody used in ANCA-associated vasculitis workup.",
    keywords: ["pr3", "proteinase 3", "anca", "vasculitis"]
  },
  "MPO Antibody": {
    use: "Myeloperoxidase antibody used in ANCA-associated vasculitis workup.",
    keywords: ["mpo", "myeloperoxidase", "anca", "vasculitis"]
  },
  "GBM IIF": {
    use: "GBM indirect immunofluorescence test used in selected vasculitis and anti-GBM workup.",
    keywords: ["gbm", "anti gbm", "glomerular basement membrane", "vasculitis"]
  },
  "CMV IgG": {
    use: "CMV IgG serology used for prior exposure and immune status assessment.",
    keywords: ["cmv igg", "cytomegalovirus igg", "cmv exposure", "cmv immunity"]
  },
  "CMV IgM": {
    use: "CMV IgM serology used in recent or acute infection assessment.",
    keywords: ["cmv igm", "cytomegalovirus igm", "acute cmv", "recent cmv infection"]
  },
  "Anti-LKM1 Antibody": {
    use: "Autoimmune hepatitis type 2 serology marker used in autoimmune liver disease workup.",
    keywords: ["lkm1", "lkm 1", "anti lkm1", "autoimmune hepatitis type 2", "autoimmune liver disease"]
  },
  "Anti-SLA/LP Antibody": {
    use: "Soluble liver antigen/liver-pancreas antibody used in autoimmune hepatitis workup.",
    keywords: ["sla", "sla lp", "anti sla lp", "soluble liver antigen", "autoimmune hepatitis"]
  },
  "Drugs of Abuse Screen (Urine)": {
    use: "Urine profile screen for common drugs of abuse.",
    keywords: ["drugs of abuse", "urine drug screen", "doa screen", "toxicology screen", "substance screen"]
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
  "Cord Blood": {
    use: "Cord blood profile including TSH and RPR for newborn screening workflow.",
    keywords: ["cord blood", "newborn screening", "neonatal screening", "tsh cord blood", "rpr cord blood"]
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
  "Fasting Glucose": {
    use: "Fasting plasma glucose test for diabetes screening and glucose regulation assessment.",
    keywords: ["fasting glucose", "fasting sugar", "diabetes", "prediabetes", "high sugar"]
  },
  "OGTT (2hr)": {
    use: "75 g oral glucose tolerance test using fasting, 1 hour, and 2 hour fluoride samples.",
    keywords: ["ogtt", "gtt", "glucose tolerance test", "prediabetes", "diabetes", "fasting 1 hour 2 hour"]
  },
  "OGTT Pregnancy (75g, 2hr)": {
    use: "Pregnancy 75 g oral glucose tolerance test using fasting, 1 hour, and 2 hour fluoride samples.",
    keywords: ["pregnancy ogtt", "gestational diabetes", "gtt pregnancy", "fasting 1 hour 2 hour", "75 g ogtt"]
  },
  "Random Glucose": {
    use: "Random plasma glucose test for symptomatic hyperglycaemia and diabetes screening.",
    keywords: ["random glucose", "random sugar", "diabetes", "high sugar", "hyperglycaemia", "hyperglycemia"]
  },
  "Protein:Creatinine Ratio (Random Urine)": {
    use: "Random urine proteinuria assessment and monitoring.",
    keywords: ["proteinuria", "upcr", "kidney disease", "nephrotic syndrome", "renal disease"]
  },
  "Albumin:Creatinine Ratio (Random Urine)": {
    use: "Random urine albuminuria screening and kidney disease monitoring, especially in diabetes.",
    keywords: ["albuminuria", "microalbuminuria", "acr", "diabetic kidney disease", "renal disease"]
  },
  "Daily Urine Protein (24hr Urine)": {
    use: "24-hour urine protein quantification for significant proteinuria assessment.",
    keywords: ["daily urine protein", "24 hour urine protein", "proteinuria", "nephrotic syndrome"]
  },
  "Haemochromatosis PCR": {
    use: "Genetic test supporting hereditary haemochromatosis / iron overload assessment.",
    keywords: ["haemochromatosis", "hemochromatosis", "iron overload", "hfe mutation", "hereditary haemochromatosis"]
  },
  "Acute Porphyria Attack Screen (Urine)": {
    use: "Urine-based screen used in suspected acute porphyria attacks.",
    keywords: ["acute porphyria", "porphobilinogen", "urine porphyria", "neurovisceral attack", "acute pophyria"]
  },
  "Full Porphyria Screen (Blood, Urine, Stool)": {
    use: "Comprehensive porphyria workup using blood, urine, and stool specimens.",
    keywords: ["porphyria", "acute porphyria", "porphobilinogen", "porphyrin screen", "metabolic disorder"]
  },
  "Ammonia": {
    use: "Urgent evaluation of hyperammonaemia and hepatic encephalopathy risk.",
    keywords: ["hepatic encephalopathy", "liver failure", "confusion", "hyperammonaemia", "hyperammonemia"]
  },
  "Blood Bank / Transfusion": {
    use: "Pre-transfusion blood bank request requiring a pink EDTA sample plus the dedicated request form and urgent courier handling.",
    keywords: ["blood bank", "transfusion", "crossmatch", "blood products", "group and screen"]
  },
  "STD PCR": {
    use: "Molecular STI screen using a vaginal swab or urine specimen.",
    keywords: ["std pcr", "sti pcr", "chlamydia", "gonorrhoea", "gonorrhea", "trichomonas", "mycoplasma genitalium"]
  },
  "Chlamydia trachomatis PCR": {
    use: "Molecular test for Chlamydia trachomatis from a vaginal swab or urine specimen.",
    keywords: ["chlamydia", "ct pcr", "sti", "std"]
  },
  "Neisseria gonorrhoeae PCR": {
    use: "Molecular test for Neisseria gonorrhoeae from a vaginal swab or urine specimen.",
    keywords: ["gonorrhoea", "gonorrhea", "gc pcr", "sti", "std"]
  },
  "Trichomonas vaginalis PCR": {
    use: "Molecular test for Trichomonas vaginalis from a vaginal swab or urine specimen.",
    keywords: ["trichomonas", "trich", "sti", "std"]
  },
  "Mycoplasma genitalium PCR": {
    use: "Molecular test for Mycoplasma genitalium from a vaginal swab or urine specimen.",
    keywords: ["mycoplasma genitalium", "mgen", "sti", "std"]
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
  },
  "Cortisol (24hr Urine)": {
    use: "24-hour urine cortisol measurement used in endocrine workup such as hypercortisolism assessment.",
    keywords: ["urine cortisol", "24 hour urine cortisol", "cushing syndrome", "hypercortisolism"]
  },
  "Aldosterone:Renin Ratio": {
    use: "Endocrine hypertension screen used in suspected primary aldosteronism.",
    keywords: ["aldosterone renin ratio", "aldo renin ratio", "arr", "primary aldosteronism", "resistant hypertension"]
  },
  "Faecal Occult Blood": {
    use: "Stool-based screen for occult gastrointestinal bleeding.",
    keywords: ["occult blood", "fecal occult blood", "faecal occult blood", "fobt", "fit", "gastrointestinal bleeding"]
  },
  "ASOT": {
    use: "Serology marker for recent streptococcal infection.",
    keywords: ["asot", "aso titre", "antistreptolysin o", "streptococcal infection", "post streptococcal disease"]
  },
  "Anti-DNase B": {
    use: "Serology marker for recent streptococcal infection, often paired with ASOT.",
    keywords: ["anti dnase b", "adnase", "streptococcal infection", "post streptococcal disease", "strep serology"]
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
    tan: "Tan",
    yellow: "Gold/Yellow",
    "yellow/gold": "Gold/Yellow",
    "gold/yellow": "Gold/Yellow",
    pear: "Pearl/White",
    pearl: "Pearl/White",
    white: "Pearl/White",
    "pearl/white": "Pearl/White",
    "white/pearl": "Pearl/White",
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

const tubeGroupPatternEntries = [
  { key: "Tan", pattern: /\btan\b/ },
  { key: "Purple", pattern: /\bpurple\b|\blavender\b/ },
  { key: "Pink", pattern: /\bpink\b/ },
  { key: "Blue", pattern: /\blight blue\b|\bblue\b|citrate/ },
  { key: "Gold/Yellow", pattern: /\bgold\b|\byellow\b|sst|serum separator/ },
  { key: "Pearl/White", pattern: /\bpear\b|\bpearl\b|\bwhite\b|\bppt\b|plasma preparation tube/ },
  { key: "Green", pattern: /\bgreen\b|heparin/ },
  { key: "Gray", pattern: /\bgray\b|\bgrey\b|fluoride/ },
  { key: "Red", pattern: /\bred\b|plain serum/ },
  { key: "Black", pattern: /\bblack\b/ }
];

function getTubeGroups(tubeColorValue) {
  const text = String(tubeColorValue || "").toLowerCase();
  const orderedMatches = tubeGroupPatternEntries
    .map((entry) => {
      const matchIndex = text.search(entry.pattern);
      return matchIndex === -1
        ? null
        : { key: entry.key, index: matchIndex };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return [...new Set(orderedMatches.map((entry) => entry.key))];
}

function getTubeSwatchColor(tubeGroup) {
  const swatch = {
    Tan: "#c8a37a",
    Purple: "#8b5cf6",
    Pink: "#ec4899",
    Blue: "#89CFF0",
    "Gold/Yellow": "#facc15",
    "Pearl/White": "#e5e7eb",
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
    Tan: "Sterile",
    Purple: "EDTA",
    Pink: "EDTA",
    Blue: "Sodium citrate",
    "Gold/Yellow": "SST",
    "Pearl/White": "EDTA + gel",
    Green: "Heparin",
    Gray: "Fluoride / oxalate",
    Red: "Plain",
    Black: "Sodium citrate",
    "Blood Culture Bottles": "Culture media"
  };

  return additiveByGroup[tubeGroup] || "";
}

function isAlternativeTubeChoice(tubeColorValue, tubeGroups = []) {
  if (tubeGroups.length < 2) return false;

  const text = String(tubeColorValue || "");
  if (/\+/.test(text)) return false;

  return /(preferred|acceptable|alternate|alternative|\bor\b|\/)/i.test(text);
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
const bloodGasComponentQueryTerms = new Set(
  (profileComponentsByName["Blood Gases"] || [])
    .flatMap((componentName) => [componentName, ...(aliasByName[componentName] || [])])
    .map((term) => normalizeForSearch(term))
    .filter(Boolean)
);

function getExpandedProfileMembers(profileName, seen = new Set()) {
  if (seen.has(profileName)) return new Set();
  seen.add(profileName);

  const members = new Set();
  const components = profileComponentsByName[profileName] || [];
  components.forEach((componentName) => {
    members.add(componentName);
    if (profileComponentsByName[componentName]) {
      getExpandedProfileMembers(componentName, seen).forEach((nestedName) => members.add(nestedName));
    }
  });

  return members;
}

const expandedProfileMembersByName = Object.fromEntries(
  profileNames.map((profileName) => [profileName, getExpandedProfileMembers(profileName)])
);

function getSelectedProfilesContainingTest(testName, selectionSet = selectedTestNames) {
  const matchingProfiles = [];

  selectionSet.forEach((selectedName) => {
    if (selectedName === testName) return;
    const coveredNames = expandedProfileMembersByName[selectedName];
    if (!coveredNames || !coveredNames.has(testName)) return;
    matchingProfiles.push(selectedName);
  });

  return matchingProfiles;
}

function getAlreadyCoveredSelectionMessage(testName, selectionSet = selectedTestNames) {
  const coveringProfiles = getSelectedProfilesContainingTest(testName, selectionSet);
  if (!coveringProfiles.length) return "";

  const itemType = Object.prototype.hasOwnProperty.call(profileComponentsByName, testName) ? "profile" : "test";
  const profileList = coveringProfiles.length > 2
    ? `${coveringProfiles.slice(0, 2).join(", ")} +${coveringProfiles.length - 2} more`
    : coveringProfiles.join(", ");

  return `This ${itemType} is already included in selected profile${coveringProfiles.length === 1 ? "" : "s"}: ${profileList}.`;
}

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
    tests: ["HbA1c", "Fasting Glucose", "OGTT (2hr)", "Albumin:Creatinine Ratio (Random Urine)"]
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
  return testList.filter((test) => {
    const exactTerms = [test.name, ...(aliasByName[test.name] || [])]
      .map((term) => normalizeForSearch(term))
      .filter(Boolean);
    return exactTerms.includes(normalizedQuery);
  });
}

function getSupplementaryProfileMatches(normalizedQuery) {
  if (!normalizedQuery) return [];

  if (bloodGasComponentQueryTerms.has(normalizedQuery)) {
    return ["Blood Gases"];
  }

  return [];
}

function getTestsByNames(testNames = []) {
  return testNames
    .map((testName) => enrichedTests.find((test) => test.name === testName))
    .filter(Boolean);
}

function collapseProfileSelections(selectionSet) {
  let changed = true;

  while (changed) {
    changed = false;

    profileNames.forEach((profileName) => {
      const components = profileComponentsByName[profileName] || [];
      if (!components.length) return;

      const hasProfile = selectionSet.has(profileName);
      const hasAllComponents = components.every((name) => selectionSet.has(name));
      if (!hasProfile && !hasAllComponents) return;

      const hasSelectedComponents = components.some((name) => selectionSet.has(name));
      if (!hasProfile || hasSelectedComponents) {
        changed = true;
      }

      selectionSet.add(profileName);
      components.forEach((name) => selectionSet.delete(name));
    });
  }
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
    ? `${count} test${count !== 1 ? "s" : ""} added`
    : "No tests added yet";
  updateDrawSelectionTools();
}

function renderSelectedTestsCart() {
  if (!drawSelectedList) return;
  const selectedTests = getSelectedTests();

  if (!selectedTests.length) {
    drawSelectedList.innerHTML = `
      <p class="draw-selected-empty">
        Your selected tests will appear here. Add tests from the results to build your Tube Plan.
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
          aria-label="Remove ${test.name} from Tube Plan"
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

  const selectedTests = getSelectedTests();
  const count = selectedTests.length;
  if (!count) {
    selectionCartCount.textContent = "0";
    selectionCartBar.setAttribute("aria-label", "Tube Plan");
    selectionCartBar.title = "Tube Plan";
    selectionCartBar.hidden = true;
    document.body.classList.remove("has-selection-cart");
    document.body.classList.remove("selection-cart-inline");
    selectionCartBar.style.top = "auto";
    selectionCartBar.style.bottom = "";
    return;
  }

  const { plan } = getResolvedDrawPlan(selectedTests);
  const totalTubes = plan.items.reduce((sum, item) => sum + item.count, 0);
  const badgeCount = count > 99 ? "99+" : String(count);

  selectionCartBar.hidden = false;
  selectionCartCount.textContent = badgeCount;
  selectionCartBar.setAttribute(
    "aria-label",
    `Tube Plan. ${count} added test${count !== 1 ? "s" : ""}, ${totalTubes} tube${totalTubes !== 1 ? "s" : ""} estimated.`
  );
  selectionCartBar.title = `Open Tube Plan: ${count} added test${count !== 1 ? "s" : ""}`;
  document.body.classList.add("has-selection-cart");
  updateSelectionCartViewportPosition();
}

function updateSelectionCartViewportPosition() {
  if (!selectionCartBar) return;

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const isPreSearchVisible = Boolean(
    preSearchPanel &&
    window.getComputedStyle(preSearchPanel).display !== "none"
  );
  const baseOffset = isMobile ? 10 : 18;
  let keyboardOffset = 0;
  let useInlineDesktopPosition = false;

  if (isMobile && window.visualViewport) {
    const activeEl = document.activeElement;
    const tag = String(activeEl?.tagName || "").toLowerCase();
    const isEditable = tag === "input" || tag === "textarea" || activeEl?.isContentEditable;
    const viewportOverlap = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);

    if (isEditable && viewportOverlap > 80) {
      keyboardOffset = viewportOverlap;
    }
  }

  if (!isMobile && !selectionCartBar.hidden && isPreSearchVisible && groupHintsPanel) {
    const hintsRect = groupHintsPanel.getBoundingClientRect();
    const cartRect = selectionCartBar.getBoundingClientRect();

    if (hintsRect.height > 0 && cartRect.height > 0) {
      const topOffset = Math.max(18, Math.round(hintsRect.bottom - cartRect.height));
      selectionCartBar.style.top = `${topOffset}px`;
      selectionCartBar.style.bottom = "auto";
      useInlineDesktopPosition = true;
    }
  }

  if (!useInlineDesktopPosition) {
    selectionCartBar.style.top = "auto";
    selectionCartBar.style.bottom = `calc(env(safe-area-inset-bottom) + ${baseOffset + keyboardOffset}px)`;
  }

  document.body.classList.toggle("selection-cart-inline", useInlineDesktopPosition);
}

function initSelectionCartViewportSync() {
  updateSelectionCartViewportPosition();

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateSelectionCartViewportPosition);
    window.visualViewport.addEventListener("scroll", updateSelectionCartViewportPosition);
  }

  window.addEventListener("resize", updateSelectionCartViewportPosition);
  window.addEventListener("scroll", updateSelectionCartViewportPosition, { passive: true });
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
  dismissRackHint();
  const nextSelection = new Set(selectedTestNames);
  if (nextSelection.has(testName)) {
    nextSelection.delete(testName);
  } else {
    const alreadyCoveredMessage = getAlreadyCoveredSelectionMessage(testName, selectedTestNames);
    if (alreadyCoveredMessage) {
      showSelectionNotice(alreadyCoveredMessage);
      return;
    }
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
    ? "Hide Tube Plan"
    : count
      ? `Open Tube Plan (${count})`
      : "Start Tube Plan";
  toggleQuickToolsBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function updateDrawPlannerToggleState() {
  if (!openDrawPlannerBtn) return;
  openDrawPlannerBtn.textContent = "Search Tests";
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

function openLegalModal(docId, trigger = null) {
  if (!legalModal || !legalModalTitle || !legalModalBody) return;
  const documentContent = legalContentById[docId];
  if (!documentContent) return;

  closeMenu();
  lastLegalModalTrigger = trigger || document.activeElement;
  legalModalTitle.textContent = documentContent.title;
  legalModalBody.innerHTML = documentContent.html;
  legalModal.hidden = false;
  syncModalOpenClass();

  if (closeLegalModalBtn) {
    window.requestAnimationFrame(() => {
      closeLegalModalBtn.focus({ preventScroll: true });
    });
  }
}

function closeLegalModal({ restoreFocus = true } = {}) {
  if (!legalModal) return;
  legalModal.hidden = true;
  syncModalOpenClass();

  if (restoreFocus && lastLegalModalTrigger && typeof lastLegalModalTrigger.focus === "function") {
    window.requestAnimationFrame(() => {
      lastLegalModalTrigger.focus({ preventScroll: true });
    });
  }

  lastLegalModalTrigger = null;
}

function syncModalOpenClass() {
  const drawOpen = Boolean(drawModal && !drawModal.hidden);
  const profileOpen = Boolean(profileModal && !profileModal.hidden);
  const legalOpen = Boolean(legalModal && !legalModal.hidden);
  document.body.classList.toggle("modal-open", drawOpen || profileOpen || legalOpen);
  updateBackToTopVisibility();
}

function normalizeNameKey(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalDrawRuleName(value) {
  const key = normalizeNameKey(value);
  if (key === "xdp (d-dimer)" || key === "xdp d dimer" || key === "xdp") return "d-dimer";
  return key;
}

function addPlanTubeGroup(grouped, group, testName) {
  if (!grouped.has(group)) {
    grouped.set(group, { key: group, label: group, count: 1, tests: new Set() });
  }
  grouped.get(group).tests.add(testName);
}

function getAlternativeTubeSupportCounts(alternativeTests) {
  const supportCounts = new Map();

  alternativeTests.forEach(({ groups }) => {
    groups.forEach((group) => {
      supportCounts.set(group, (supportCounts.get(group) || 0) + 1);
    });
  });

  return supportCounts;
}

function chooseAlternativeTubeGroup(groups, grouped, supportCounts) {
  const candidateGroups = groups.filter((group) => grouped.has(group));
  const groupsToRank = candidateGroups.length ? candidateGroups : groups;

  return groupsToRank
    .slice()
    .sort((a, b) => {
      const existingCountDiff = (grouped.get(b)?.tests.size || 0) - (grouped.get(a)?.tests.size || 0);
      if (existingCountDiff) return existingCountDiff;

      const supportDiff = (supportCounts.get(b) || 0) - (supportCounts.get(a) || 0);
      if (supportDiff) return supportDiff;

      return groups.indexOf(a) - groups.indexOf(b);
    })[0];
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
  const alternativeTests = [];

  selectedTests.forEach((test) => {
    const groups = getTubeGroups(test.tubeColor);
    if (!groups.length) {
      manual.push(test.name);
      return;
    }

    if (isAlternativeTubeChoice(test.tubeColor, groups)) {
      alternativeTests.push({ test, groups });
      return;
    }

    groups.forEach((group) => {
      addPlanTubeGroup(grouped, group, test.name);
    });
  });

  if (selectedTests.length === 1 && alternativeTests.length === 1 && grouped.size === 0) {
    const [{ test, groups }] = alternativeTests;
    return {
      items: [{
        key: `choice:${groups.join("|")}`,
        label: groups.join(" or "),
        count: 1,
        tests: [test.name],
        detail: "Either tube is acceptable for this request."
      }],
      manual,
      ruleId: null
    };
  }

  const supportCounts = getAlternativeTubeSupportCounts(alternativeTests);
  alternativeTests.forEach(({ test, groups }) => {
    const chosenGroup = chooseAlternativeTubeGroup(groups, grouped, supportCounts);
    addPlanTubeGroup(grouped, chosenGroup, test.name);
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
    name.includes("cord blood") ||
    name.includes("rheumatoid factor") ||
    /\brf\b/.test(name) ||
    name.includes("rpr") ||
    name.includes("hiv")
  );
}

function isSharedGoldTubeTest(test) {
  const tubeGroups = getTubeGroups(test.tubeColor);
  return tubeGroups.includes("Gold/Yellow") && !isDedicatedGoldTubeTest(test);
}

function getRequiredSharedGoldTubeCount(selectedTests) {
  const sharedGoldTests = selectedTests.filter((test) => isSharedGoldTubeTest(test));
  const hasCordBloodProfile = selectedTests.some((test) => normalizeNameKey(test.name) === "cord blood");
  const sharedGoldRequestCount = sharedGoldTests.length + (hasCordBloodProfile ? 1 : 0);

  if (!sharedGoldRequestCount) return 0;

  const listedGoldProfileCount = sharedGoldTests.filter((test) => GOLD_VOLUME_PROFILE_NAMES.has(test.name)).length;

  return listedGoldProfileCount >= 3 && sharedGoldRequestCount > 3 ? 2 : 1;
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
  return "Gold rule applied: 3 listed profiles fit in 1 Gold/Yellow tube; add any other shared yellow-top test and use 2 x Gold/Yellow tubes.";
}

function applyPurpleVolumeRule(plan, selectedTests) {
  const purpleTests = selectedTests.filter((test) => {
    const tubeGroups = getTubeGroups(test.tubeColor);
    return tubeGroups.includes("Purple");
  });
  const hasPurpleTriggerTest = purpleTests.some((test) => PURPLE_VOLUME_TRIGGER_TESTS.has(test.name));

  if (!hasPurpleTriggerTest || purpleTests.length < 3) return "";

  let purpleItem = plan.items.find((item) => item.key === "Purple");
  if (!purpleItem) {
    purpleItem = { key: "Purple", label: "Purple", count: 2, tests: [] };
    plan.items.push(purpleItem);
  } else {
    purpleItem.count = Math.max(purpleItem.count, 2);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "Purple rule applied: HbA1c plus 2 more purple-top tests require 2 x Purple tubes.";
}

function applyOgttGrayTubeRule(plan, selectedTests) {
  const hasOgtt = selectedTests.some((test) => OGTT_MULTI_DRAW_TESTS.has(test.name));
  if (!hasOgtt) return "";

  let grayItem = plan.items.find((item) => item.key === "Gray");
  if (!grayItem) {
    grayItem = { key: "Gray", label: "Gray", count: 3, tests: [] };
    plan.items.push(grayItem);
  } else {
    grayItem.count = Math.max(grayItem.count, 3);
  }

  grayItem.detail = "Fasting, 1 hour, and 2 hour fluoride samples for OGTT.";
  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "OGTT rule applied: use 3 x Gray tubes for fasting, 1 hour, and 2 hour samples.";
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
    applyPurpleVolumeRule(plan, selectedTests),
    applyOgttGrayTubeRule(plan, selectedTests)
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

function getDrawPlannerReminders() {
  return [{
    id: "tube-fill",
    tone: "info",
    title: "Collection reminder",
    items: [
      "Make sure tubes are properly filled."
    ]
  }];
}

function renderDrawResult() {
  if (!drawResultCard || !drawPlannerCount || !drawPlannerAlerts || !drawGroups || !drawPlannerNote) return;

  const selectedTests = getSelectedTests();
  if (!selectedTests.length) {
    drawResultCard.hidden = false;
    drawPlannerCount.textContent = "0 tests • 0 tubes";
    drawPlannerAlerts.hidden = true;
    drawPlannerAlerts.innerHTML = "";
    drawGroups.innerHTML = `
      <article class="draw-group-card">
        <p class="draw-group-tests">No tests added yet. Add tests to build a tube plan.</p>
      </article>
    `;
    drawPlannerNote.hidden = true;
    drawPlannerNote.textContent = "";
    animateDrawResultCard();
    return;
  }

  const { plan } = getResolvedDrawPlan(selectedTests);
  const totalTubes = plan.items.reduce((sum, item) => sum + item.count, 0);
  const plannerAlerts = [
    ...getDrawPlannerReminders(),
    ...getDrawPlannerAlerts(selectedTests)
  ];
  drawResultCard.hidden = false;
  drawPlannerCount.textContent = `${selectedTests.length} test${selectedTests.length > 1 ? "s" : ""} • ${totalTubes} tube${totalTubes !== 1 ? "s" : ""}`;
  drawPlannerAlerts.hidden = plannerAlerts.length === 0;
  drawPlannerAlerts.innerHTML = plannerAlerts
    .map((alert) => `
      <article class="draw-planner-alert draw-planner-alert-${alert.tone}">
        <h4>${alert.title}</h4>
        ${alert.items.length === 1
          ? `<p>${alert.items[0]}</p>`
          : `<ul>${alert.items.map((item) => `<li>${item}</li>`).join("")}</ul>`}
      </article>
    `)
    .join("");

  drawGroups.innerHTML = plan.items
    .map((item) => `
      <article class="draw-group-card">
        <div class="draw-group-top">
          <div class="draw-group-main">
            <span class="tube-icon" style="--tube-color: ${getTubeSwatchColor(item.key)};" aria-hidden="true"></span>
            <h3>${item.label}</h3>
            <span class="draw-group-count-badge">${item.count}x</span>
          </div>
        </div>
        ${item.detail ? `<p class="draw-group-detail">${item.detail}</p>` : ""}
      </article>
    `)
    .join("");

  const plannerNoteText = plan.manual.length
    ? `Manual review needed for: ${plan.manual.join(", ")}.`
    : "";

  drawPlannerNote.hidden = !plannerNoteText;
  drawPlannerNote.textContent = plannerNoteText;

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
  if (text.includes("csf")) return "CSF specimen (sterile tan tube).";
  if (text.includes("sputum") || text.includes("respiratory")) return "Respiratory specimen (e.g., sputum, NP swab, or lower respiratory sample).";
  if (text.includes("blood culture")) return "Blood culture bottles (aseptic blood specimen collection).";
  if (text.includes("blood")) return "Blood specimen (container depends on requested microbiology/virology test).";
  return "Specimen-specific collection required (confirm exact sample type with lab protocol).";
}

function getCardSpecimenValue(test, { isMicro = false } = {}) {
  const baseValue = String(isMicro ? test.specimenGuide : test.specimen || "").trim();
  const isCsf = /\bcsf\b/i.test(`${test.name} ${test.specimen} ${test.specimenGuide} ${test.tubeColor}`);
  if (!isCsf) return baseValue;

  const conciseValue = String(test.specimen || baseValue)
    .replace(/\s*\((?:sterile\s+)?tan tubes?\)\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return conciseValue || baseValue || "CSF";
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
    name.includes("creatinine clearance") ||
    (name.includes("protein") && name.includes("creatinine ratio")) ||
    (name.includes("albumin") && name.includes("creatinine ratio")) ||
    name.includes("daily urine protein")
  ) return { sectionId: "chemistry", subsection: "Kidney Function (U+E)" };

  if (name.includes("cortisol") && name.includes("urine")) {
    return { sectionId: "endocrinology", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("aldosterone") || name.includes("renin")) {
    return { sectionId: "endocrinology", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("hirsutism") || name.includes("infertility")) {
    return { sectionId: "endocrinology", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("cord blood")) {
    return { sectionId: "endocrinology", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("haemochromatosis") || name.includes("hemochromatosis")) {
    return { sectionId: "metabolic_genetic", subsection: "Inherited Disorder Screen" };
  }

  if (name.includes("porphyria") || name.includes("porphobilinogen")) {
    return { sectionId: "metabolic_genetic", subsection: "Inherited Disorder Screen" };
  }

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
    name.includes("asot") ||
    name.includes("dnase") ||
    name.includes("streptolysin") ||
    name.includes("ena") ||
    name.includes("rheumatoid") ||
    name.includes("anti-ccp") ||
    name.includes("anca") ||
    name.includes("smooth muscle") ||
    name.includes("lkm") ||
    name.includes("sla/lp") ||
    name.includes("soluble liver antigen") ||
    name.includes("dsdna") ||
    name.includes("complement") ||
    name.includes("celiac") ||
    name.includes("hepatitis") ||
    name.includes("hiv elisa") ||
    name.includes("brucella") ||
    name.includes("rickettsia") ||
    name.includes("rubella") ||
    name.includes("toxoplasma") ||
    name.includes("ebv") ||
    name.includes("cmv") ||
    name.includes("measles") ||
    name.includes("mumps") ||
    name.includes("parvovirus") ||
    name.includes("varicella") ||
    name.includes("rpr") ||
    name.includes("treponema")
  ) return { sectionId: "immunology", subsection: "Autoimmune / Serology" };

  if (name.includes("blood group") || name.includes("crossmatch") || name.includes("coombs") || name.includes("blood bank") || name.includes("transfusion")) {
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

  if (
    name.includes("cardiac profile") ||
    name.includes("cardiac marker") ||
    name.includes("troponin") ||
    name.includes("nt-probnp") ||
    name.includes("ck") ||
    name.includes("ldh")
  ) {
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

function applyFactsPanelMode(isMobile) {
  if (!factCarouselPanel || !factCarouselContent) return;

  if (isMobile) {
    factCarouselPanel.classList.add("mobile-facts");
    return;
  }

  factCarouselPanel.classList.remove("mobile-facts");
}

function initFactsPanel() {
  if (!factCarouselPanel || !factCarouselContent) return;

  const mediaQuery = window.matchMedia("(max-width: 600px)");
  const onModeChange = () => applyFactsPanelMode(mediaQuery.matches);

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

function shouldAutoExpandCriticalNote(testName, isSelected) {
  return isSelected && AUTO_EXPAND_CRITICAL_NOTE_TESTS.has(testName);
}

function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = activeSectionGroup || "";
  const normalizedQuery = normalizeForSearch(query);
  const matchedProfileName = getMatchedProfileQuery(normalizedQuery);
  const matchedConditionShortcut = getMatchedConditionShortcut(normalizedQuery);
  const exactNameMatches = getExactNameMatches(normalizedQuery);
  const supplementaryProfileMatches = getSupplementaryProfileMatches(normalizedQuery);
  const supplementaryProfileMatchSet = new Set(supplementaryProfileMatches);
  const isInflammatoryShortcut = normalizedQuery === "inflammatory" || normalizedQuery === "inflammation";
  const shouldBypassSectionFilter = Boolean(
    matchedProfileName
    || matchedConditionShortcut
    || exactNameMatches.length
    || supplementaryProfileMatches.length
    || isInflammatoryShortcut
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
    if (exactNameMatches.length || supplementaryProfileMatches.length) {
      return exactNameMatches.some((match) => match.name === test.name)
        || supplementaryProfileMatchSet.has(test.name);
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
        No matching test found. Try searching by test or clinical question (e.g. Iron studies or anaemia).
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
    const shouldShowCriticalAlert = shouldAutoExpandCriticalNote(test.name, isSelected);
    card.classList.toggle("card-selected", isSelected);
    card.classList.toggle("expanded", shouldShowCriticalAlert);
    card.classList.toggle("card-critical-alert", shouldShowCriticalAlert);
    const profileComponents = profileComponentsByName[test.name] || [];
    const hasProfileComponents = profileComponents.length > 0;
    const tubeGroups = getTubeGroups(test.tubeColor);
    const tubeIconSizeClass = tubeGroups.length >= 4
      ? " tube-icon-mini"
      : tubeGroups.length >= 3
        ? " tube-icon-sm"
        : "";
    const useOrBetweenTubeOptions = isAlternativeTubeChoice(test.tubeColor, tubeGroups);
    const tubeOptionsMarkup = tubeGroups.length
      ? `
      <div class="tube-option-grid${tubeGroups.length >= 3 ? " compact" : ""}${tubeGroups.length >= 4 ? " dense" : ""}">
        ${tubeGroups.map((group, index) => `
          ${index > 0 && useOrBetweenTubeOptions ? `<span class="tube-option-separator">or</span>` : ""}
          <span class="tube-option${useOrBetweenTubeOptions ? " alternative" : ""}">
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
      ? useOrBetweenTubeOptions
      : tubeGroups.length === 1 && normalizedTubeText && normalizedTubeText !== normalizedSingleGroup;
    const hasTubeOptions = tubeGroups.length > 0;
    const specimenValue = getCardSpecimenValue(test, { isMicro });
    const isCsfSpecimenCard = /\bcsf\b/i.test(`${test.name} ${specimenValue} ${test.tubeColor}`);
    const useSpecimenOnlySummary = isMicro && !isCsfSpecimenCard;
    const isNonBloodSpecimen = /(urine|stool|faec|swab|csf|sputum|respiratory|semen|fluid|tissue|bone marrow|aspirate|saliva|synovial|pleural|ascitic|vaginal|nasopharyngeal|throat)/i
      .test(specimenValue);
    const showSpecimenField = isMicro || isNonBloodSpecimen || !hasTubeOptions;
    const showRackHint = !hasDismissedRackHint && !isSelected && filteredTests[0]?.name === test.name;
    const renderSummaryField = ({ label, content, isAction = false }) => {
      if (!isAction) {
        return `
        <div class="field card-summary-field">
          <span class="label">${label}</span>
          ${content}
        </div>
        `;
      }

      return `
      <button
        type="button"
        class="field card-summary-field card-summary-action${isSelected ? " selected" : ""}${showRackHint ? " hinted" : ""}"
        data-card-select="${encodeURIComponent(test.name)}"
        aria-pressed="${isSelected ? "true" : "false"}"
        aria-label="${isSelected ? `Remove ${test.name} from Tube Plan` : `Add ${test.name} to Tube Plan`}"
      >
        <span class="card-summary-action-head">
          <span class="label">${label}</span>
          <span class="card-summary-action-indicator${isSelected ? "" : " is-add"}" aria-hidden="true">${isSelected ? "\u2713" : "+"}</span>
        </span>
        ${content}
        ${showRackHint ? `<span class="card-summary-hint">Tap to add to Tube Plan</span>` : ""}
      </button>
      `;
    };
    const summaryFields = useSpecimenOnlySummary
      ? renderSummaryField({
          label: "Specimen",
          content: `<span class="card-summary-value">${specimenValue}</span>`,
          isAction: true
        })
      : `
      ${hasTubeOptions ? `
      ${renderSummaryField({
        label: "Tube",
        content: `<div class="tube-color-row${tubeGroups.length > 1 ? " multiple" : ""}">
          ${tubeOptionsMarkup}
        </div>`,
        isAction: true
      })}
      ` : ""}
      ${showSpecimenField ? `
      ${renderSummaryField({
        label: "Specimen",
        content: `<span class="card-summary-value">${specimenValue}</span>`,
        isAction: !hasTubeOptions
      })}
      ` : ""}
      `;
    const summaryFieldCount = useSpecimenOnlySummary
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
        <button
          type="button"
          class="card-title-select-btn${isSelected ? " selected" : ""}"
          data-card-select-title="${encodeURIComponent(test.name)}"
          aria-pressed="${isSelected ? "true" : "false"}"
          aria-label="${isSelected ? `Remove ${test.name} from Tube Plan` : `Add ${test.name} to Tube Plan`}"
        >
          <span class="card-title-select-copy">${test.name}</span>
        </button>
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
        <div class="field critical-prep-field${shouldShowCriticalAlert ? " critical-prep-field-alert" : ""}">
          <span class="label">Critical Preparation</span>
          <span>${test.criticalPrep}</span>
        </div>
        <div class="field">
          <span class="label">Clinical Use</span>
          <span>${test.clinicalUse}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-toggle-btn" type="button" aria-expanded="${shouldShowCriticalAlert ? "true" : "false"}">${shouldShowCriticalAlert ? "See less" : "See more"}</button>
      </div>
    `;

    const toggleBtn = card.querySelector(".card-toggle-btn");
    const titleActionBtn = card.querySelector("button[data-card-select-title]");
    const summaryActionBtn = card.querySelector("button[data-card-select]");
    const profileTestsBtn = card.querySelector(".profile-tests-btn");
    toggleBtn.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      toggleBtn.textContent = expanded ? "See less" : "See more";
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    const preserveSearchFocusOnPress = (event) => {
      if (!shouldPreserveSearchFocusOnMobile()) return;
      event.preventDefault();
    };

    const handleSelect = () => {
      const shouldRestoreSearchFocus = shouldPreserveSearchFocusOnMobile();
      toggleSelectedTest(test.name);
      if (shouldRestoreSearchFocus) {
        restoreSearchFocusWithoutScroll();
      }
    };

    [titleActionBtn, summaryActionBtn].forEach((trigger) => {
      trigger?.addEventListener("pointerdown", preserveSearchFocusOnPress);
      trigger?.addEventListener("mousedown", preserveSearchFocusOnPress);
      trigger?.addEventListener("click", handleSelect);
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
  if (siteFooter) {
    siteFooter.hidden = hasQuery || hasSectionFilter;
  }
  updateBackToTopVisibility();
  updateSelectionCartViewportPosition();

  if (!hasQuery && !hasSectionFilter) {
    setResultsInfo("");
    cardsContainer.innerHTML = "";
    return;
  }

  renderCards(getFilteredTests());
}

function bindEvents() {
  if (searchInput) {
    searchInput.addEventListener("focus", () => {
      if (!searchInput.value.trim()) {
        searchInput.placeholder = SEARCH_PLACEHOLDER_BASE;
      }
    });

    searchInput.addEventListener("blur", () => {
      if (!searchInput.value.trim()) {
        refreshSearchPlaceholder();
      }
    });

    searchInput.addEventListener("input", () => {
      updateSearchClearButton();
      refreshSearchPlaceholder();
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

  if (resultsBackToTopBtn) {
    resultsBackToTopBtn.addEventListener("click", () => {
      scrollToResultsTop();
    });
  }

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  window.addEventListener("resize", updateBackToTopVisibility);

  if (openDrawPlannerBtn) {
    openDrawPlannerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      focusMainSearchField();
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

  if (legalDocButtons.length) {
    legalDocButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const docId = button.getAttribute("data-legal-doc") || "";
        openLegalModal(docId, button);
      });
    });
  }

  if (closeLegalModalBtn) {
    closeLegalModalBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeLegalModal();
    });
  }

  if (legalModal) {
    legalModal.addEventListener("click", (event) => {
      if (event.target !== legalModal) return;
      closeLegalModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (isMenuOpen()) {
      closeMenu();
      return;
    }
    if (legalModal && !legalModal.hidden) {
      closeLegalModal();
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
refreshSearchPlaceholder();
bindEvents();
initSelectionCartViewportSync();
initInstallHelper();
applyFilters();
updateSearchClearButton();
refreshSelectionUi({ rerenderCards: false });
