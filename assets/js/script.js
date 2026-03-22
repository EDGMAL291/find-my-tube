// Cache shared DOM nodes once so the rest of the app can treat the page as one UI surface.
const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const headerIntroText = document.getElementById("headerIntroText");
const sectionContextBar = document.getElementById("sectionContextBar");
const sectionContextBackBtn = document.getElementById("sectionContextBackBtn");
const sectionContextLabel = document.getElementById("sectionContextLabel");
const cardsContainer = document.getElementById("cardsContainer");
const resultsToolbar = document.getElementById("resultsToolbar");
const resultsInfo = document.getElementById("resultsInfo");
const resultsBackToTopBtn = document.getElementById("resultsBackToTopBtn");
const selectionNoticeToast = document.getElementById("selectionNoticeToast");
const clinicalWorkupPanel = document.getElementById("clinicalWorkupPanel");
const clinicalWorkupForm = document.getElementById("clinicalWorkupForm");
const clinicalWorkupChipList = document.getElementById("clinicalWorkupChipList");
const clinicalAgeInput = document.getElementById("clinicalAgeInput");
const clinicalSexSelect = document.getElementById("clinicalSexSelect");
const clinicalPregnancySelect = document.getElementById("clinicalPregnancySelect");
const clinicalSymptomsInput = document.getElementById("clinicalSymptomsInput");
const clinicalSignsInput = document.getElementById("clinicalSignsInput");
const clinicalConcernInput = document.getElementById("clinicalConcernInput");
const clinicalWorkupSubmitBtn = document.getElementById("clinicalWorkupSubmitBtn");
const clinicalWorkupResetBtn = document.getElementById("clinicalWorkupResetBtn");
const clinicalWorkupStatus = document.getElementById("clinicalWorkupStatus");
const clinicalWorkupResults = document.getElementById("clinicalWorkupResults");
const clinicalWorkupResultsTitle = document.getElementById("clinicalWorkupResultsTitle");
const clinicalWorkupResultsCopy = document.getElementById("clinicalWorkupResultsCopy");
const clinicalWorkupResultTags = document.getElementById("clinicalWorkupResultTags");
const clinicalWorkupRuleList = document.getElementById("clinicalWorkupRuleList");
const clearClinicalWorkupResultsBtn = document.getElementById("clearClinicalWorkupResultsBtn");
const preSearchPanel = document.getElementById("preSearchPanel");
const brandHomeBtn = document.getElementById("brandHomeBtn");
const findMyTestHeaderTitle = document.getElementById("findMyTestHeaderTitle");
const toggleQuickToolsBtn = document.getElementById("toggleQuickToolsBtn");
const quickToolsPanel = document.getElementById("quickToolsPanel");
const quickToolsTitle = document.getElementById("quickToolsTitle");
const quickToolsDescription = document.getElementById("quickToolsDescription");
const quickToolsStats = document.getElementById("quickToolsStats");
const quickToolsTestsStat = document.getElementById("quickToolsTestsStat");
const quickToolsTubesStat = document.getElementById("quickToolsTubesStat");
const quickToolsClearBtn = document.getElementById("quickToolsClearBtn");
const factCarouselPanel = document.getElementById("factCarouselPanel");
const factCarouselContent = document.getElementById("factCarouselContent");
const tipText = document.getElementById("tipText");
const groupChips = document.getElementById("groupChips");
const groupHintsPanel = document.querySelector(".group-hints");
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
const SEARCH_PLACEHOLDER_BASE = "Search by test or profile";
const SEARCH_PLACEHOLDER_HINT = `${SEARCH_PLACEHOLDER_BASE} (e.g. CRP or Liver function tests)`;
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
  "OGTT (fasting, 1hr, 2hr)",
  "OGTT Pregnancy (fasting, 1hr, 2hr)"
]);
const selectedTestNames = new Set();
let activeSectionGroup = "";
const activeBrowseGroupBySection = {
  chemistry: "",
  haematology: "",
  immunology: ""
};
let isClearDrawSelectionConfirming = false;
let clearDrawSelectionConfirmTimeoutId = 0;
let selectionNoticeTimeoutId = 0;
let selectionNoticeHideTimeoutId = 0;
const CONDITION_SHORTCUT_DISCLAIMER = "Common initial request shortcut only. Confirm with local protocol, senior review, and patient context.";
const CLINICAL_WORKUP_DISCLAIMER = "Reference-only test support. Confirm urgent, paediatric, transfusion, and site-specific requests with local protocol or senior review.";
const RACK_HINT_STORAGE_KEY = "fmt-rack-hint-dismissed";
const AUTO_EXPAND_CRITICAL_NOTE_TESTS = new Set(["Ammonia", "Blood Bank / Transfusion"]);
const selectedClinicalChipIds = new Set();
let hasDismissedRackHint = false;
let lastLegalModalTrigger = null;
let clinicalWorkupOutput = null;
const currentPageParams = new URLSearchParams(window.location.search);
const isFindMyTestPage = currentPageParams.get("tool") === "find-my-test";
const APP_HOME_TITLE = "Find My Tube";
const FIND_MY_TEST_PAGE_TITLE = "Find My Test";
const APP_HOME_HEADER_COPY = "Find the right test, the right tube and why it's ordered.";
const FIND_MY_TEST_HEADER_COPY = "Symptoms, signs and context to suggested tests and draw plan. Do not enter patient identifiers.";
const appleMobileAppTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');

document.body.classList.toggle("find-my-test-page", isFindMyTestPage);
document.title = isFindMyTestPage ? FIND_MY_TEST_PAGE_TITLE : APP_HOME_TITLE;
if (headerIntroText) {
  headerIntroText.textContent = isFindMyTestPage ? FIND_MY_TEST_HEADER_COPY : APP_HOME_HEADER_COPY;
}
if (appleMobileAppTitleMeta) {
  appleMobileAppTitleMeta.setAttribute("content", isFindMyTestPage ? FIND_MY_TEST_PAGE_TITLE : APP_HOME_TITLE);
}

function dispatchFindMyTubeEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

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

  const hasResultsView = isResultsViewActive(activeSectionGroup, searchInput?.value || "");
  const hasModalOpen = document.body.classList.contains("modal-open");
  const hasScrolledDown = window.scrollY > 40;
  const isVisible = hasResultsView && hasScrolledDown && !hasModalOpen;

  resultsBackToTopBtn.hidden = !hasResultsView;
  resultsBackToTopBtn.classList.toggle("is-visible", isVisible);
  resultsBackToTopBtn.tabIndex = isVisible ? 0 : -1;
  resultsBackToTopBtn.setAttribute("aria-hidden", isVisible ? "false" : "true");
}

// Lightweight interaction helpers keep the shared shell responsive without extra framework state.
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

function isRenderableElement(element) {
  if (!element || element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getAddToPlanAnimationTarget() {
  if (isRenderableElement(selectionCartBar)) return selectionCartBar;
  if (isRenderableElement(openDrawPlannerBtn)) return openDrawPlannerBtn;
  return null;
}

function pulsePlanTarget(target) {
  if (!target) return;
  target.classList.remove("plan-target-catch");
  void target.offsetWidth;
  target.classList.add("plan-target-catch");
  target.addEventListener("animationend", () => {
    target.classList.remove("plan-target-catch");
  }, { once: true });
}

function getPlanAnimationTubeGroup(tubeColorValue) {
  return getTubeGroups(tubeColorValue)[0] || "";
}

function animateAddToPlanFeedback({ sourceRect, tubeColorValue }) {
  if (!sourceRect) return;

  window.requestAnimationFrame(() => {
    const target = getAddToPlanAnimationTarget();
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) return;

    const targetFocusRect = isRenderableElement(selectionCartCount)
      ? selectionCartCount.getBoundingClientRect()
      : targetRect;
    const endX = targetFocusRect.left + (targetFocusRect.width / 2);
    const endY = targetFocusRect.top + (targetFocusRect.height / 2);

    const startX = sourceRect.left + (sourceRect.width / 2);
    const startY = sourceRect.top + (sourceRect.height / 2);
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      pulsePlanTarget(target);
      return;
    }

    const arcLift = Math.max(28, Math.min(88, Math.abs(deltaY) * 0.24 + Math.abs(deltaX) * 0.05));
    const flyer = document.createElement("div");
    flyer.className = "plan-fly-token";
    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;

    const visual = document.createElement("div");
    visual.className = "plan-fly-token-visual";
    visual.innerHTML = getTubeVisualMarkup(getPlanAnimationTubeGroup(tubeColorValue), " tube-icon-mini");
    flyer.appendChild(visual);
    document.body.appendChild(flyer);

    if (typeof flyer.animate !== "function" || typeof visual.animate !== "function") {
      pulsePlanTarget(target);
      flyer.remove();
      return;
    }

    const flight = flyer.animate(
      [
        { transform: "translate(0px, 0px)" },
        { transform: `translate(${deltaX * 0.76}px, ${deltaY * 0.68 - arcLift}px)`, offset: 0.72 },
        { transform: `translate(${deltaX}px, ${deltaY}px)`, offset: 1 }
      ],
      {
        duration: 760,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      }
    );

    visual.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.72) rotate(-12deg)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.02) rotate(2deg)", opacity: 1, offset: 0.18 },
        { transform: "translate(-50%, -50%) scale(0.96) rotate(-4deg)", opacity: 1, offset: 0.72 },
        { transform: "translate(-50%, -50%) scale(0.4) rotate(10deg)", opacity: 0, offset: 1 }
      ],
      {
        duration: 760,
        easing: "cubic-bezier(0.18, 0.9, 0.28, 1)",
        fill: "forwards"
      }
    );

    window.setTimeout(() => pulsePlanTarget(target), 470);
    flight.finished
      .catch(() => {})
      .finally(() => {
        flyer.remove();
      });
  });
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
    const browseId = getActiveBrowseGroup(sectionId);
    return { view: "section", section: sectionId, browse: browseId };
  }

  return { view: "home" };
}

function syncHistoryState(sectionId = "", replace = false) {
  if (!window.history || typeof window.history.pushState !== "function") return;

  const nextState = getHistoryStateForSection(sectionId);
  const currentState = window.history.state || {};
  if (
    currentState.view === nextState.view
    && currentState.section === nextState.section
    && (currentState.browse || "") === (nextState.browse || "")
  ) return;

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
  if (isFindMyTestPage) {
    window.location.assign(window.location.pathname);
    return;
  }

  closeDrawModal();
  closeProfileModal();
  closeLegalModal({ restoreFocus: false });
  clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: false, clearStatus: true });

  setSectionView("", { historyMode: "push", scrollToTop: false, clearSearch: true });
  scrollHomeViewportToTop();
}

function handleFindMyTestHeaderAction() {
  clearClinicalWorkupOutput({ preserveInputs: false, rerenderCards: true, clearStatus: true });
  clinicalWorkupPanel?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  });
}

function shouldScrollSearchFieldIntoView(target) {
  if (!target || typeof target.getBoundingClientRect !== "function") return true;

  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!viewportHeight) return true;

  const topMargin = 18;
  const bottomMargin = 18;
  return rect.top < topMargin || rect.bottom > viewportHeight - bottomMargin;
}

function focusMainSearchField({ scroll = "always" } = {}) {
  if (!searchInput) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const target = searchInput.closest(".search-box") || searchInput;
  const shouldScroll = scroll === "always"
    || (scroll === "if-needed" && shouldScrollSearchFieldIntoView(target));
  const focusInput = () => {
    const cursorEnd = searchInput.value.length;
    searchInput.focus({ preventScroll: true });
    if (typeof searchInput.setSelectionRange === "function") {
      searchInput.setSelectionRange(cursorEnd, cursorEnd);
    }
  };

  // Mobile browsers usually require focus to happen during the tap gesture
  // for the on-screen keyboard to open reliably.
  if (isMobile) {
    focusInput();
  }

  if (!shouldScroll) {
    if (!isMobile) focusInput();
    return;
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    if (!isMobile) {
      focusInput();
    }
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

function clearSearchForNextPlanEntry() {
  if (!searchInput) return;
  if (!searchInput.value.trim()) return;
  searchInput.value = "";
  updateSearchClearButton();
  applyFilters();
}

// Exact planner overrides cover combinations where tube counts are fixed by local collection rules.
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
    tests: ["Cardiac Profile"],
    items: [
      { key: "choice:Green|Gold/Yellow", label: "Green or Gold/Yellow", count: 1, detail: "Use 1 x Green tube or 1 x Gold/Yellow tube for Cardiac Profile." }
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
  "ANCA Profile": [
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
  "Total Serum Bilirubin (TSB)": [
    "Total Bilirubin",
    "Conjugated Bilirubin (Direct)",
    "Unconjugated Bilirubin (Indirect, Calculated)"
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

// Section metadata drives the browse chips, labels, and icons shown on the home screen.
const sectionMeta = {
  chemistry: { label: "Biochemistry" },
  haematology: { label: "Haematology" },
  micro_virology: { label: "Microbiology" },
  immunology: { label: "Serology" },
  metabolic_genetic: { label: "Molecular Biology / Genetics" },
  cytology: { label: "Cytology" },
  histology: { label: "Histology" },
  general: { label: "General" }
};

const sectionIconById = {
  chemistry: `<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/><path d="M8.5 14h7"/></svg>`,
  metabolic_genetic: `<svg viewBox="0 0 24 24"><path d="M8 4c4 0 4 4 8 4"/><path d="M16 4c-4 0-4 4-8 4"/><path d="M8 20c4 0 4-4 8-4"/><path d="M16 20c-4 0-4-4-8-4"/><path d="M9.5 7h5"/><path d="M9.5 12h5"/><path d="M9.5 17h5"/></svg>`,
  haematology: `<svg viewBox="0 0 24 24"><path d="M12 3c-3 4-5 6.7-5 9.5A5 5 0 0 0 12 18a5 5 0 0 0 5-5.5C17 9.7 15 7 12 3z"/><circle cx="12" cy="12" r="1.6"/></svg>`,
  immunology: `<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6l7-3z"/><path d="M9.5 12l1.7 1.7L14.8 10"/></svg>`,
  micro_virology: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4.8 8h14.4"/><path d="M10 8v8"/><path d="M7 14.5h5"/><path d="M14 14.5h3"/></svg>`,
  cytology: `<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="10" cy="12" r="2.2"/><circle cx="15" cy="12" r="1.5"/><path d="M7 18v2"/><path d="M17 18v2"/></svg>`,
  histology: `<svg viewBox="0 0 24 24"><path d="M5 6h14v12H5z"/><path d="M9 6V4h6v2"/><path d="M9 10h6"/><path d="M9 14h6"/></svg>`,
  general: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/></svg>`
};

const chemistryBrowseGroups = [
  {
    id: "kidney",
    label: "Kidney",
    subsections: ["Kidney Function (U+E)"],
    icon: `<svg viewBox="0 0 24 24"><path d="M9.5 5.5C6.6 5.5 4.5 7.8 4.5 10.9S6.5 16 9.5 16c1.1 0 2-.2 2.5-.6"/><path d="M14.5 5.5c2.9 0 5 2.3 5 5.4S17.5 16 14.5 16c-1.1 0-2-.2-2.5-.6"/><path d="M12 8v8"/></svg>`
  },
  {
    id: "liver",
    label: "Liver",
    subsections: ["Liver Function And Pancreas"],
    icon: `<svg viewBox="0 0 24 24"><path d="M4 11c1.8-4 5.2-6 10.2-6 3.2 0 5.1 1.2 5.8 3.8V14c-1 2-3 3.2-5.9 3.2H10c-3.3 0-6-2.7-6-6.2z"/><path d="M13 7.5c-.2 2.7 1 4.5 3.8 5.5"/><path d="M9.2 12.6h4.6"/></svg>`
  },
  {
    id: "bones-minerals",
    label: "Bones and Minerals",
    subsections: ["Bone (CMP Profile)"],
    icon: `<svg viewBox="0 0 24 24"><path d="M8 4h8l4 4v8l-4 4H8l-4-4V8z"/><circle cx="12" cy="12" r="2.2"/><path d="M12 6.8v1.4"/><path d="M6.8 12H8.2"/><path d="M15.8 12h1.4"/></svg>`
  },
  {
    id: "cardiac",
    label: "Cardiac",
    subsections: ["Cardiac Markers"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 20s-6.8-4.4-8.4-8C2.3 9.3 3.9 6.8 6.9 6.8c2 0 3.2 1 4.1 2.2.9-1.2 2.1-2.2 4.1-2.2 3 0 4.6 2.5 3.3 5.2C18.8 15.6 12 20 12 20z"/><path d="M7.8 12h2.2l1.1-2.1 1.6 4 1.1-1.9H16"/></svg>`
  },
  {
    id: "lipids",
    label: "Lipids",
    subsections: ["Lipids"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 4c3.1 3.4 5 5.8 5 8.6A5 5 0 1 1 7 12.6C7 9.8 8.9 7.4 12 4z"/><path d="M9.3 11.6h5.4"/><path d="M8.8 14.6c1.2.8 5.2.8 6.4 0"/></svg>`
  }
];

const haematologyBrowseGroups = [
  {
    id: "haem-general",
    label: "General",
    subsections: ["General"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 4c-2.8 3.6-4.5 6-4.5 8.2A4.5 4.5 0 0 0 12 17a4.5 4.5 0 0 0 4.5-4.8C16.5 10 14.8 7.6 12 4z"/><path d="M7 19h10"/><path d="M9.2 14.4h5.6"/></svg>`
  },
  {
    id: "haem-coagulation",
    label: "Coagulation",
    subsections: ["Coagulation"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 4c-3 3.9-4.8 6.5-4.8 8.8A4.8 4.8 0 0 0 12 18a4.8 4.8 0 0 0 4.8-5.2C16.8 10.5 15 7.9 12 4z"/><path d="M9 12.4l2 2 4-4"/></svg>`
  },
  {
    id: "haem-blood-grouping",
    label: "Blood Grouping",
    subsections: ["Blood Grouping"],
    icon: `<svg viewBox="0 0 24 24"><rect x="5" y="6" width="14" height="12" rx="2"/><path d="M9 10h6"/><path d="M9 14h3"/><circle cx="16" cy="14" r="2"/></svg>`
  }
];

const serologyBrowseGroups = [
  {
    id: "serology-general",
    label: "General",
    subsections: ["General Serology"],
    icon: `<svg viewBox="0 0 24 24"><path d="M5 8.5h14"/><path d="M7.5 5.5h9"/><path d="M7 8.5v8a2.5 2.5 0 0 0 2.5 2.5h5A2.5 2.5 0 0 0 17 16.5v-8"/><path d="M10 12h4"/><path d="M12 10v4"/></svg>`
  },
  {
    id: "serology-immunology",
    label: "Immunology",
    subsections: ["Immunology"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6l7-3z"/><path d="M9.5 12l1.7 1.7L14.8 10"/></svg>`
  },
  {
    id: "serology-allergy",
    label: "Allergy",
    subsections: ["Allergy Profile"],
    icon: `<svg viewBox="0 0 24 24"><path d="M12 4c3.2 3.4 5.2 6.1 5.2 8.9A5.2 5.2 0 0 1 12 18a5.2 5.2 0 0 1-5.2-5.1C6.8 10.1 8.8 7.4 12 4z"/><path d="M9.6 13.2c.8-1.8 4-1.8 4.8 0"/><path d="M10.1 10.7h.01"/><path d="M13.9 10.7h.01"/></svg>`
  }
];

const sectionBrowseGroups = {
  chemistry: chemistryBrowseGroups,
  haematology: haematologyBrowseGroups,
  immunology: serologyBrowseGroups
};

// Section browsing helpers decide whether the user is looking at home, a department, or a subgroup.
const sectionBrowseGroupById = Object.fromEntries(
  Object.entries(sectionBrowseGroups).map(([sectionId, groups]) => [
    sectionId,
    Object.fromEntries(groups.map((group) => [group.id, group]))
  ])
);

const sectionBrowseTitleById = {
  chemistry: "Biochemistry Focus Areas",
  haematology: "Haematology Groups",
  immunology: "Serology Groups"
};

function getSectionIconMarkup(groupId) {
  return sectionIconById[groupId] || sectionIconById.general;
}

function hasSectionBrowseGroups(sectionId = activeSectionGroup) {
  return Boolean(sectionBrowseGroups[sectionId]?.length);
}

function getActiveBrowseGroup(sectionId = activeSectionGroup) {
  return activeBrowseGroupBySection[sectionId] || "";
}

function getActiveBrowseSubsections(sectionId = activeSectionGroup) {
  const activeBrowseGroup = getActiveBrowseGroup(sectionId);
  return sectionBrowseGroupById[sectionId]?.[activeBrowseGroup]?.subsections || [];
}

function getActiveBrowseGroupLabel(sectionId = activeSectionGroup) {
  const activeBrowseGroup = getActiveBrowseGroup(sectionId);
  return sectionBrowseGroupById[sectionId]?.[activeBrowseGroup]?.label || "";
}

function isBrowseOverviewVisible(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  return hasSectionBrowseGroups(sectionId) && !String(query || "").trim() && !getActiveBrowseGroup(sectionId);
}

function shouldKeepPreSearchPanelVisible(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  return isBrowseOverviewVisible(sectionId, query);
}

function hasClinicalWorkupState() {
  return !isFindMyTestPage && Boolean(clinicalWorkupOutput);
}

function isResultsViewActive(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  if (String(query || "").trim()) return true;
  if (!sectionId && hasClinicalWorkupState()) return true;
  if (!sectionId) return false;
  return !isBrowseOverviewVisible(sectionId, query);
}

function getResultsContextLabel(sectionId = activeSectionGroup) {
  if (!sectionId || !sectionMeta[sectionId]) return "";

  const sectionLabel = sectionMeta[sectionId].label;
  const browseLabel = getActiveBrowseGroupLabel(sectionId);
  return browseLabel ? `${sectionLabel}: ${browseLabel}` : sectionLabel;
}

function updateSectionContextBar() {
  if (!sectionContextBar || !sectionContextBackBtn || !sectionContextLabel) return;

  if (!activeSectionGroup || !sectionMeta[activeSectionGroup]) {
    sectionContextBar.hidden = true;
    sectionContextLabel.textContent = "";
    return;
  }

  const sectionLabel = sectionMeta[activeSectionGroup].label;
  const browseLabel = getActiveBrowseGroupLabel(activeSectionGroup);
  const hasBrowseGroup = Boolean(getActiveBrowseGroup(activeSectionGroup));

  sectionContextBackBtn.textContent = hasBrowseGroup
    ? `Back to ${sectionLabel}`
    : "Back to departments";
  sectionContextLabel.textContent = browseLabel
    ? `${sectionLabel} / ${browseLabel}`
    : sectionLabel;
  sectionContextBar.hidden = false;
}

const chipGroups = [
  "chemistry",
  "haematology",
  "micro_virology",
  "immunology",
  "metabolic_genetic",
  "cytology",
  "histology"
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
  "Total Serum Bilirubin (TSB)": [
    "TSB",
    "Total serum bilirubin",
    "Total bilirubin",
    "Conjugated bilirubin",
    "Direct bilirubin",
    "Unconjugated bilirubin",
    "Indirect bilirubin",
    "Newborn bilirubin",
    "Neonatal bilirubin",
    "Newborn jaundice bilirubin"
  ],
  "OGTT (fasting, 1hr, 2hr)": [
    "OGTT",
    "GTT",
    "Oral glucose tolerance test",
    "75 g OGTT",
    "Glucose tolerance test"
  ],
  "OGTT Pregnancy (fasting, 1hr, 2hr)": [
    "Pregnancy OGTT",
    "Gestational OGTT",
    "75 g pregnancy OGTT",
    "Pregnancy glucose tolerance test",
    "GTT pregnancy"
  ],
  "BHCG (Beta-HCG)": [
    "BHCG",
    "Beta-HCG",
    "Beta HCG",
    "bHCG",
    "Serum BHCG",
    "Serum beta hcg",
    "Pregnancy test",
    "Quantitative HCG"
  ],
  "HIV Viral Load": ["HIV Viral Load (PCR)", "HIV VL", "viral load hiv"],
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
  "ANCA Profile": [
    "ANCA",
    "ANCA profile",
    "ANCA vasculitis profile",
    "ANCA (PR3, MPO, p- and c-ANCA, GBM IIF)",
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
  "Antenatal Screen (ANTINV)": ["Antenatal screen", "Antenatal screening", "Antenatal profile", "Antenatal booking", "Booking bloods", "First antenatal visit", "First antenatal bloods", "First pregnancy bloods", "Pregnancy booking", "Prenatal booking", "ANTINV", "Antinv", "Antinatal screen"],
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
  "Urine MCS": ["Urine culture", "MC&S", "STI", "STD"],
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
  "ANCA Profile": {
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
    use: "Booking antenatal profile for the first antenatal visit, ideally in the first trimester, covering blood group, antibodies, key infections, and baseline screening.",
    keywords: ["antenatal", "antenatal screen", "antenatal screening", "antenatal booking", "pregnancy booking", "booking bloods", "first antenatal visit", "first antenatal bloods", "first pregnancy bloods", "antinv", "maternal screen", "prenatal profile"]
  },
  "BHCG (Beta-HCG)": {
    use: "Serum beta-HCG supports pregnancy assessment, confirmation, and follow-up when clinically indicated.",
    keywords: ["bhcg", "beta-hcg", "beta hcg", "serum hcg", "serum pregnancy test", "pregnancy test", "quantitative hcg"]
  },
  "Cord Blood": {
    use: "Cord blood profile including TSH and RPR for newborn screening workflow.",
    keywords: ["cord blood", "newborn screening", "neonatal screening", "tsh cord blood", "rpr cord blood"]
  },
  "Total Serum Bilirubin (TSB)": {
    use: "Preferred bilirubin profile for newborn and infant jaundice monitoring, with total bilirubin and conjugated/direct bilirubin; unconjugated/indirect bilirubin is calculated. Usually collected in a gold/yellow paeds microtainer.",
    keywords: ["tsb", "total serum bilirubin", "total bilirubin", "conjugated bilirubin", "direct bilirubin", "unconjugated bilirubin", "indirect bilirubin", "newborn jaundice", "neonatal jaundice", "infant jaundice", "baby jaundice", "bilirubin newborn", "paeds microtainer", "peds microtainer", "microtainer"]
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
  "HIV Viral Load": {
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
  "OGTT (fasting, 1hr, 2hr)": {
    use: "Oral glucose tolerance test using fasting, 1 hour, and 2 hour fluoride samples.",
    keywords: ["ogtt", "gtt", "glucose tolerance test", "prediabetes", "diabetes", "fasting 1 hour 2 hour"]
  },
  "OGTT Pregnancy (fasting, 1hr, 2hr)": {
    use: "Pregnancy oral glucose tolerance test using fasting, 1 hour, and 2 hour fluoride samples.",
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
  "Urine MCS": {
    use: "Urine microbiology culture and sensitivity request using a sterile urine container.",
    keywords: ["urine mcs", "urine culture", "mc&s", "mcs", "sti", "std"]
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
  "Molecular Biology": {
    use: "Molecular nucleic-acid based testing for organism detection, quantification, and selected targeted assays.",
    keywords: ["molecular biology", "pcr", "viral load", "nucleic acid testing", "molecular assay"]
  },
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
  "Thyroid / Reproductive / Adrenal": {
    use: "Hormonal and endocrine assessment for thyroid, fertility, reproductive, and adrenal disorders.",
    keywords: ["endocrine", "thyroid disease", "fertility", "hormones", "adrenal disorder"]
  },
  "Bone (CMP Profile)": {
    use: "Bone and mineral metabolism assessment using calcium, phosphate, magnesium, vitamin D, and related markers.",
    keywords: ["bone metabolism", "calcium", "phosphate", "vitamin d", "parathyroid"]
  },
  "Diabetes": {
    use: "Diagnosis and monitoring of glucose regulation disorders.",
    keywords: ["diabetes", "hyperglycaemia", "hypoglycaemia", "insulin resistance"]
  },
  "Inflammation / Immune": {
    use: "Inflammatory response and infection-support marker panel.",
    keywords: ["infection", "sepsis", "inflammation", "immune response"]
  },
  "General Chemistry": {
    use: "General chemistry and nutrition-related assessment for protein status, micronutrients, and broad metabolic support.",
    keywords: ["metabolic assessment", "nutrition", "protein status", "vitamin deficiency", "general chemistry"]
  },
  "Drug Monitoring": {
    use: "Therapeutic drug monitoring used to keep medicine levels effective and non-toxic.",
    keywords: ["therapeutic drug monitoring", "drug level", "toxicity", "dose adjustment", "trough level"]
  },
  "Drugs Of Abuse": {
    use: "Toxicology screen for recreational, overdose, or non-prescribed drug exposure.",
    keywords: ["toxicology", "substance exposure", "overdose", "drug screen", "drugs of abuse"]
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
  "Allergy Profile": {
    use: "Allergen sensitisation screening using IgE-based testing and profile panels.",
    keywords: ["allergy", "ige", "allergen", "sensitisation", "allergy screen"]
  },
  "General Serology": {
    use: "Infectious serology, exposure, and immunity screening using antibody-based testing.",
    keywords: ["serology", "infectious screen", "immunity", "exposure", "antibody testing"]
  },
  "Immunology": {
    use: "Autoimmune, immune-mediated, and immune status assessment using antibody and immune marker testing.",
    keywords: ["immunology", "autoimmune disease", "immune status", "autoantibodies", "immune mediated"]
  },
  "Autoimmune / Serology": {
    use: "Autoimmune and infectious serologic screening.",
    keywords: ["autoimmune disease", "connective tissue disease", "serology"]
  },
  "MC&S / PCR / Virology": {
    use: "Pathogen detection and antimicrobial guidance.",
    keywords: ["infection source", "pathogen", "sepsis workup", "viral infection"]
  },
  "Inherited Disorder Screen": {
    use: "Molecular, genetic, and metabolic screening for inherited disorders and selected genotype-based workups.",
    keywords: ["genetics", "molecular testing", "inherited disorder", "metabolic disorder", "genotype"]
  },
  "Cytology": {
    use: "Cell-based microscopic assessment for malignant or abnormal cells in selected fluid specimens.",
    keywords: ["cytology", "malignant cells", "cell morphology", "fluid cytology", "cancer workup"]
  },
  "Histology": {
    use: "Morphologic pathology review of tissue or marrow specimens requiring specialist interpretation.",
    keywords: ["histology", "pathology", "bone marrow", "morphology", "pathologist review"]
  }
};

// Shared normalization helpers keep search, shortcut matching, and tube parsing consistent.
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  { key: "Blood Culture Bottles", pattern: /\bblood culture\b|\bculture bottles?\b/ },
  { key: "Tan", pattern: /\btan\b/ },
  { key: "Purple", pattern: /\bpurple\b|\blavender\b/ },
  { key: "Pink", pattern: /\bpink\b/ },
  { key: "Blue", pattern: /\blight blue\b|\bblue\b|citrate/ },
  { key: "Gold/Yellow", pattern: /\bgold\b|\byellow\b|sst|serum separator/ },
  { key: "Pearl/White", pattern: /\bpear\b|\bpearl\b|\bwhite\b|\bppt\b|plasma preparation tube/ },
  { key: "Green", pattern: /\bgreen\b|heparin/ },
  { key: "Gray", pattern: /\bgray\b|\bgrey\b|fluoride/ },
  { key: "24hr Urine Container", pattern: /\b24\s*hr\b.*\burine\b|\b24-hour\b.*\burine\b/ },
  { key: "Urine Container", pattern: /\bsterile urine container\b|\burine container\b/ },
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

  const groups = [...new Set(orderedMatches.map((entry) => entry.key))];
  if (groups.includes("24hr Urine Container")) {
    return groups.filter((group) => group !== "Urine Container");
  }
  return groups;
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
    "Urine Container": "#f8d66d",
    "24hr Urine Container": "#f59e0b",
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
    "Pearl/White": "EDTA with gel",
    Green: "Heparin",
    Gray: "Fluoride / oxalate",
    "Urine Container": "Sterile container",
    "24hr Urine Container": "24-hour collection",
    Red: "Plain",
    Black: "Sodium citrate",
    "Blood Culture Bottles": "Culture media"
  };

  return additiveByGroup[tubeGroup] || "";
}

function getTubeIconModifierClass(tubeGroup) {
  if (tubeGroup === "Pearl/White") return " tube-icon-pearl";
  if (tubeGroup === "Urine Container") return " tube-icon-urine-container";
  if (tubeGroup === "24hr Urine Container") return " tube-icon-urine-24hr";
  return "";
}

function getTubeVisualMarkup(tubeGroup, sizeClass = "") {
  return `<span class="tube-icon${sizeClass}${getTubeIconModifierClass(tubeGroup)}" style="--tube-color: ${getTubeSwatchColor(tubeGroup)};" aria-hidden="true"></span>`;
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
    tests: ["HbA1c", "Fasting Glucose", "OGTT (fasting, 1hr, 2hr)", "Albumin:Creatinine Ratio (Random Urine)"]
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

const clinicalWorkupChipDefinitions = [
  { id: "chest-pain", label: "Chest pain", terms: ["chest pain", "angina", "tight chest", "pressure chest"] },
  { id: "shortness-breath", label: "Shortness of breath", terms: ["shortness of breath", "dyspnoea", "dyspnea"] },
  { id: "fever-sepsis", label: "Fever / sepsis", terms: ["fever", "febrile", "sepsis", "rigors", "septic"] },
  { id: "fatigue-pallor", label: "Fatigue / pallor", terms: ["fatigue", "pallor", "anaemia", "anemia", "weakness", "low hb"] },
  { id: "bleeding", label: "Bleeding / bruising", terms: ["bleeding", "bruising", "epistaxis", "petechiae", "melena"] },
  { id: "clot", label: "Leg swelling / clot", terms: ["leg swelling", "calf swelling", "dvt", "pulmonary embolism", "pleuritic chest pain"] },
  { id: "jaundice", label: "Jaundice", terms: ["jaundice", "icterus", "yellow eyes", "dark urine"] },
  { id: "upper-abdominal", label: "Epigastric / upper abdominal pain", terms: ["epigastric pain", "upper abdominal pain"] },
  { id: "hyperglycaemia", label: "Polyuria / thirst", terms: ["polyuria", "polydipsia", "hyperglycaemia", "hyperglycemia", "high sugar"] },
  { id: "oedema-proteinuria", label: "Oedema / proteinuria", terms: ["oedema", "edema", "frothy urine", "proteinuria", "albuminuria"] },
  { id: "joint-pain", label: "Joint pain / stiffness", terms: ["joint pain", "joint swelling", "morning stiffness", "arthritis"] },
  { id: "vaginal-discharge", label: "STI", terms: ["sti", "std", "urethral discharge", "chlamydia", "gonorrhoea", "gonorrhea", "cervicitis"] },
  { id: "amenorrhoea", label: "Amenorrhoea / irregular periods", terms: ["amenorrhoea", "amenorrhea", "irregular periods", "missed periods", "oligomenorrhoea"] },
  { id: "infertility", label: "Infertility", terms: ["infertility", "subfertility", "difficulty conceiving", "anovulation"] },
  { id: "hirsutism", label: "Hirsutism / acne", terms: ["hirsutism", "facial hair", "pcos", "androgen excess", "acne"] },
  { id: "confusion", label: "Confusion / encephalopathy", terms: ["confusion", "altered mental state", "drowsy", "encephalopathy"] },
  { id: "pregnancy-booking", label: "Pregnancy / booking", terms: ["pregnancy", "antenatal", "booking", "prenatal", "gestational"] }
];

const clinicalWorkupChipById = Object.fromEntries(
  clinicalWorkupChipDefinitions.map((chip) => [chip.id, chip])
);

// Keep these suggestions conservative and tied to tests already present in Find My Tube.
const clinicalWorkupRuleDefinitions = [
  {
    id: "acute-coronary",
    title: "Chest pain / myocardial injury support",
    matchAny: ["chest pain", "angina", "tight chest", "pressure chest", "acute coronary syndrome", "acs", "nstemi", "stemi", "radiating chest pain"],
    tests: ["Cardiac Profile"],
    rationale: "Chest pain or suspected ACS commonly triggers a cardiac marker workup from the current catalogue.",
    caution: "Serial sampling timing, ECG interpretation, and emergency pathway decisions must follow local chest pain protocol."
  },
  {
    id: "heart-failure",
    title: "Heart failure / fluid overload support",
    matchAny: ["heart failure", "cardiac failure", "orthopnoea", "orthopnea", "pnd", "paroxysmal nocturnal dyspnoea", "paroxysmal nocturnal dyspnea", "pulmonary oedema", "pulmonary edema", "raised jvp", "bilateral leg swelling"],
    tests: ["NT-proBNP"],
    rationale: "Volume overload or heart-failure concerns often lead to natriuretic peptide testing.",
    caution: "Interpret NT-proBNP with age, renal function, and the local heart-failure pathway."
  },
  {
    id: "respiratory-distress",
    title: "Respiratory distress / acid-base support",
    matchAny: ["respiratory distress", "hypoxia", "cyanosis", "acidosis", "shock", "oxygenation failure"],
    tests: ["Blood Gases", "Lactate"],
    rationale: "Severe respiratory or perfusion concerns commonly need urgent blood gas and lactate support.",
    caution: "Urgent bedside escalation and local emergency pathways take priority over this reference tool."
  },
  {
    id: "venous-thromboembolism",
    title: "DVT / PE rule-out support",
    matchAny: ["dvt", "deep vein thrombosis", "pulmonary embolism", "venous thromboembolism", "pleuritic chest pain", "unilateral leg swelling", "calf swelling"],
    tests: ["D-Dimer"],
    rationale: "Possible venous thromboembolism frequently prompts D-dimer as part of a rule-out pathway.",
    caution: "Use only within the local pretest-probability pathway and escalate immediately if the patient is unstable."
  },
  {
    id: "sepsis",
    title: "Fever / sepsis support",
    matchAny: ["fever", "febrile", "sepsis", "septic", "rigors", "hypotension", "tachycardia", "toxic looking"],
    tests: ["Blood Culture", "Lactate", "CRP", "Procalcitonin (PCT)"],
    rationale: "Fever, rigors, hypotension, or suspected sepsis commonly trigger culture, perfusion, and inflammatory markers.",
    caution: "Obtain cultures before antibiotics where possible and follow urgent sepsis protocol."
  },
  {
    id: "anaemia",
    title: "Anaemia / iron deficiency support",
    matchAny: ["anaemia", "anemia", "fatigue", "pallor", "low hb", "microcytic", "weakness"],
    tests: ["FBC", "Fe Studies"],
    rationale: "Fatigue, pallor, or suspected anaemia often start with a blood count plus iron studies.",
    caution: "Interpret with bleeding history, chronic disease, pregnancy status, and local referral thresholds."
  },
  {
    id: "bleeding",
    title: "Bleeding / bruising support",
    matchAny: ["bleeding", "bruising", "epistaxis", "petechiae", "melena", "haematemesis", "hematemesis", "coagulopathy"],
    tests: ["FBC", "Coagulation Studies"],
    rationale: "Active bleeding or unusual bruising commonly triggers blood count and coagulation screening.",
    caution: "Major bleeding is an emergency; local urgent, theatre, or transfusion pathways take priority."
  },
  {
    id: "renal-proteinuria",
    title: "Kidney / proteinuria support",
    matchAny: ["proteinuria", "albuminuria", "frothy urine", "kidney disease", "renal disease", "ckd", "oedema", "edema"],
    tests: ["U&E", "Albumin:Creatinine Ratio (Random Urine)", "Protein:Creatinine Ratio (Random Urine)"],
    rationale: "Renal impairment or proteinuria concerns often pair core chemistry with urine protein assessment.",
    caution: "Use local nephrology and hypertension pathways for significant oedema, AKI, or nephrotic presentations."
  },
  {
    id: "diabetes",
    title: "Hyperglycaemia / diabetes support",
    matchAny: ["polyuria", "polydipsia", "high sugar", "hyperglycaemia", "hyperglycemia", "diabetes", "glycosuria"],
    tests: ["Random Glucose", "HbA1c"],
    rationale: "Symptomatic hyperglycaemia commonly starts with a plasma glucose test and HbA1c.",
    caution: "If the patient is acutely ill or in possible DKA/HHS, use emergency metabolic pathways rather than this tool alone."
  },
  {
    id: "gestational-diabetes",
    title: "Pregnancy glucose screening support",
    matchAny: ["gestational diabetes", "gdm", "pregnancy glucose", "screening glucose", "high sugar", "hyperglycaemia", "hyperglycemia"],
    tests: ["OGTT Pregnancy (fasting, 1hr, 2hr)"],
    requiresPregnancyContext: true,
    rationale: "Pregnancy glucose concerns may need the dedicated antenatal OGTT listed in the current catalogue.",
    caution: "Timing and eligibility for OGTT in pregnancy must follow the local antenatal guideline."
  },
  {
    id: "thyroid",
    title: "Thyroid dysfunction support",
    matchAny: ["thyroid", "goitre", "goiter", "thyrotoxicosis", "hypothyroidism", "hyperthyroidism", "heat intolerance", "cold intolerance", "palpitations"],
    tests: ["Thyroid Function Test (TFT)"],
    rationale: "Possible thyroid dysfunction often begins with a core thyroid function profile.",
    caution: "Interpret with pregnancy status, medication history, and the local endocrine pathway."
  },
  {
    id: "liver",
    title: "Jaundice / liver injury support",
    matchAny: ["jaundice", "icterus", "dark urine", "hepatitis", "liver disease", "transaminitis", "hepatomegaly"],
    tests: ["Liver Function Tests (LFT)"],
    rationale: "Jaundice or liver injury concerns commonly start with liver function testing.",
    caution: "Severe jaundice, confusion, or coagulopathy needs urgent escalation and direct senior review."
  },
  {
    id: "hepatitis-b",
    title: "Acute hepatitis B support",
    matchAny: ["viral hepatitis", "hepatitis exposure", "hepatitis b", "acute hepatitis"],
    tests: ["Hepatitis B (Acute)"],
    rationale: "Documented hepatitis exposure or acute viral-hepatitis concern may need the acute hepatitis B profile in the catalogue.",
    caution: "Use the local infectious-disease and occupational-exposure pathway where relevant."
  },
  {
    id: "pancreatitis",
    title: "Pancreatitis support",
    matchAny: ["pancreatitis", "epigastric pain", "radiates to back", "upper abdominal pain"],
    tests: ["Lipase", "Amylase"],
    rationale: "Pancreatitis-style pain patterns commonly prompt pancreatic enzyme testing.",
    caution: "Abdominal emergencies still require direct clinical review and imaging decisions outside this tool."
  },
  {
    id: "arthritis",
    title: "Inflammatory joint pain support",
    matchAny: ["joint pain", "joint swelling", "morning stiffness", "arthritis", "polyarthritis", "rheumatoid"],
    tests: ["Arthritis Profile"],
    rationale: "Inflammatory small-joint symptoms commonly start with a focused arthritis screen.",
    caution: "Use broader rheumatology assessment if systemic features are present."
  },
  {
    id: "autoimmune",
    title: "Systemic autoimmune support",
    matchAny: ["autoimmune", "vasculitis", "connective tissue disease", "ctd", "malar rash", "photosensitivity"],
    tests: ["Autoimmune Profile"],
    rationale: "Systemic autoimmune or connective-tissue-disease concerns may justify a broader screening profile.",
    caution: "Autoimmune workup should be guided by the clinical pattern and local specialist advice."
  },
  {
    id: "sti",
    title: "STI support",
    matchAny: ["sti", "std", "urethral discharge", "gonorrhoea", "gonorrhea", "chlamydia", "cervicitis"],
    tests: ["Urine MCS"],
    rationale: "STI concerns map to urine MC&S in the current Find My Tube setup.",
    caution: "Follow local sexual-health and microbiology collection protocol for the requested specimen."
  },
  {
    id: "infertility-female",
    title: "Female infertility support",
    matchAny: ["infertility", "subfertility", "difficulty conceiving", "anovulation"],
    tests: ["Infertility Screen (Female)", "Thyroid Function Test (TFT)"],
    allowedSexes: ["female", "other"],
    allowUnspecifiedSex: true,
    rationale: "Infertility or ovulatory concerns often start with a female reproductive hormone profile and thyroid support.",
    caution: "Cycle timing and local fertility workup rules still apply."
  },
  {
    id: "infertility-male",
    title: "Male infertility support",
    matchAny: ["infertility", "subfertility", "difficulty conceiving", "low testosterone"],
    tests: ["Infertility Screen (Male)"],
    allowedSexes: ["male"],
    allowUnspecifiedSex: false,
    rationale: "Male fertility concerns often start with the listed male reproductive hormone profile.",
    caution: "Local fertility pathways may also need semen analysis and targeted endocrine review."
  },
  {
    id: "hirsutism",
    title: "Hirsutism / androgen excess support",
    matchAny: ["hirsutism", "facial hair", "pcos", "androgen excess", "acne"],
    tests: ["Hirsutism Screen (Full)", "Thyroid Function Test (TFT)"],
    allowedSexes: ["female", "other"],
    allowUnspecifiedSex: true,
    rationale: "Hyperandrogen features commonly lead to an androgen-focused hormone profile plus thyroid support.",
    caution: "Interpret with age, menstrual history, and pregnancy context."
  },
  {
    id: "menopause",
    title: "Menopausal hormone support",
    matchAny: ["menopause", "menopausal", "perimenopause", "hot flushes", "hot flashes"],
    tests: ["Menopausal Screen"],
    allowedSexes: ["female", "other"],
    allowUnspecifiedSex: true,
    minAge: 40,
    rationale: "Hot flushes or menopausal concerns may justify the focused menopausal hormone screen in the catalogue.",
    caution: "Use clinical context and medication history when interpreting menopausal labs."
  },
  {
    id: "pregnancy-hormone",
    title: "Pregnancy hormone support",
    matchAny: ["pregnancy"],
    tests: ["BHCG (Beta-HCG)"],
    requiresPregnancyContext: true,
    allowedSexes: ["female", "other"],
    allowUnspecifiedSex: true,
    rationale: "Pregnancy context can justify a serum beta-HCG request from the current catalogue.",
    caution: "Use the local obstetric, ectopic pregnancy, and ultrasound pathway when pain, bleeding, or instability is present."
  },
  {
    id: "antenatal",
    title: "Pregnancy booking support",
    matchAny: ["antenatal", "antenatal screen", "antenatal screening", "antenatal booking", "booking", "booking bloods", "prenatal", "first antenatal visit", "first booking visit", "pregnancy booking", "first antenatal bloods", "first pregnancy bloods"],
    tests: ["Antenatal Screen (ANTINV)"],
    requiresPregnancyContext: true,
    rationale: "Pregnancy booking or first antenatal bloods usually map to the antenatal profile in Find My Tube.",
    caution: "This is usually done at the first antenatal booking visit, ideally early in pregnancy; local maternity pathways still decide the bundle and timing."
  },
  {
    id: "cord-blood",
    title: "Newborn cord blood support",
    matchAny: ["newborn", "neonate", "cord blood", "delivery"],
    tests: ["Cord Blood"],
    maxAge: 1,
    rationale: "Neonatal or delivery context may map to the cord blood profile already listed in the catalogue.",
    caution: "Use the local neonatal and obstetric pathway for timing and identification steps."
  },
  {
    id: "hepatic-encephalopathy",
    title: "Hepatic encephalopathy support",
    requireAllGroups: [
      ["confusion", "altered mental state", "drowsy", "encephalopathy"],
      ["jaundice", "liver failure", "cirrhosis", "hepatic"]
    ],
    tests: ["Ammonia"],
    rationale: "Confusion together with liver-failure features may trigger urgent ammonia handling requirements.",
    caution: "This sample is highly time-sensitive and must follow the critical handling note shown on the test card."
  }
];

const supplementalClinicalShortcutIds = new Set([
  "coeliac-disease",
  "myeloma",
  "pheochromocytoma",
  "carcinoid-syndrome",
  "ovarian-cancer",
  "prostate-cancer"
]);

// These helpers turn loose clinical context into conservative suggested tests from the existing catalogue.
function dedupeStrings(values = []) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function joinWithAnd(values = []) {
  const items = dedupeStrings(values);
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function lowercaseFirstCharacter(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function truncateText(value, maxLength = 96) {
  const text = String(value || "").trim();
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function capitalizePhrase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function hasNormalizedPhrase(haystack, phrase) {
  const normalizedHaystack = normalizeForSearch(haystack);
  const normalizedPhrase = normalizeForSearch(phrase);
  if (!normalizedHaystack || !normalizedPhrase) return false;
  if (normalizedHaystack === normalizedPhrase) return true;
  const pattern = new RegExp(`(?:^| )${escapeRegExp(normalizedPhrase)}(?:$| )`);
  return pattern.test(normalizedHaystack);
}

function getClinicalWorkupSexLabel(value = "") {
  if (value === "female") return "Female";
  if (value === "male") return "Male";
  if (value === "other") return "Other";
  return "";
}

function hasPregnancyContext(input) {
  if (!input) return false;
  return input.pregnancy === "pregnant"
    || hasNormalizedPhrase(input.normalizedBlob, "pregnancy")
    || hasNormalizedPhrase(input.normalizedBlob, "pregnant")
    || hasNormalizedPhrase(input.normalizedBlob, "antenatal")
    || hasNormalizedPhrase(input.normalizedBlob, "prenatal")
    || hasNormalizedPhrase(input.normalizedBlob, "gestational");
}

function passesClinicalWorkupRuleDemographics(rule, input) {
  if (!rule || !input) return false;

  if (rule.minAge != null && input.age != null && input.age < rule.minAge) return false;
  if (rule.maxAge != null && input.age != null && input.age > rule.maxAge) return false;

  if (rule.allowedSexes?.length) {
    if (!input.sex || input.sex === "unspecified") {
      if (rule.allowUnspecifiedSex === false) return false;
    } else if (!rule.allowedSexes.includes(input.sex)) {
      return false;
    }
  }

  if (rule.requiresPregnancyContext && !hasPregnancyContext(input)) return false;

  return true;
}

function evaluateClinicalWorkupRule(rule, input) {
  if (!passesClinicalWorkupRuleDemographics(rule, input)) return null;

  const matchedSignals = [];

  if (rule.matchAny?.length) {
    rule.matchAny.forEach((term) => {
      if (hasNormalizedPhrase(input.normalizedBlob, term)) matchedSignals.push(term);
    });
  }

  if (rule.requireAllGroups?.length) {
    for (const group of rule.requireAllGroups) {
      const matchedTerm = group.find((term) => hasNormalizedPhrase(input.normalizedBlob, term));
      if (!matchedTerm) return null;
      matchedSignals.push(matchedTerm);
    }
  }

  const uniqueSignals = dedupeStrings(matchedSignals);
  if (!uniqueSignals.length) return null;

  return {
    ...rule,
    matchedSignals: uniqueSignals,
    score: uniqueSignals.length + (rule.requireAllGroups?.length || 0)
  };
}

function getSupplementalClinicalShortcutRules(input) {
  const rules = [];

  supplementalClinicalShortcutIds.forEach((shortcutId) => {
    const shortcut = conditionShortcutById[shortcutId];
    if (!shortcut) return;

    const matchedSignals = [...shortcut.normalizedTerms]
      .filter((term) => hasNormalizedPhrase(input.normalizedBlob, term))
      .slice(0, 3);

    if (!matchedSignals.length) return;

    rules.push({
      id: `shortcut-${shortcut.id}`,
      title: capitalizePhrase(shortcut.label),
      tests: shortcut.tests,
      rationale: "This matches an existing conservative condition shortcut already built into Find My Tube.",
      caution: CONDITION_SHORTCUT_DISCLAIMER,
      matchedSignals,
      score: matchedSignals.length + 1
    });
  });

  return rules;
}

function getClinicalWorkupRecommendedTests(matchedRules = []) {
  const recommendedSelection = new Set();

  matchedRules.forEach((rule) => {
    (rule.tests || []).forEach((testName) => recommendedSelection.add(testName));
  });

  collapseProfileSelections(recommendedSelection);

  const selectedNames = Array.from(recommendedSelection);
  const selectedProfiles = new Set(selectedNames.filter((testName) => profileComponentsByName[testName]));
  const coveredComponents = new Set();

  selectedProfiles.forEach((profileName) => {
    (expandedProfileMembersByName[profileName] || new Set()).forEach((memberName) => {
      coveredComponents.add(memberName);
    });
  });

  const visibleNames = selectedNames.filter((testName) => {
    if (selectedProfiles.has(testName)) return true;
    return !coveredComponents.has(testName);
  });

  return getTestsByNames(visibleNames);
}

function getClinicalWorkupInput() {
  const ageValue = Number.parseInt(clinicalAgeInput?.value || "", 10);
  const age = Number.isFinite(ageValue) && ageValue >= 0 ? ageValue : null;
  const selectedChipIds = Array.from(selectedClinicalChipIds);
  const selectedChipLabels = selectedChipIds
    .map((chipId) => clinicalWorkupChipById[chipId]?.label || "")
    .filter(Boolean);
  const selectedChipTerms = selectedChipIds.flatMap((chipId) => clinicalWorkupChipById[chipId]?.terms || []);
  const symptoms = String(clinicalSymptomsInput?.value || "").trim();
  const signs = String(clinicalSignsInput?.value || "").trim();
  const concern = String(clinicalConcernInput?.value || "").trim();
  const pregnancy = clinicalPregnancySelect?.value || "unknown";
  const contextTerms = pregnancy === "pregnant" ? ["pregnancy"] : [];
  const normalizedBlob = normalizeForSearch([
    symptoms,
    signs,
    concern,
    ...selectedChipTerms,
    ...contextTerms
  ].join(" "));

  return {
    age,
    sex: clinicalSexSelect?.value || "unspecified",
    sexLabel: getClinicalWorkupSexLabel(clinicalSexSelect?.value || ""),
    pregnancy,
    symptoms,
    signs,
    concern,
    selectedChipIds,
    selectedChipLabels,
    normalizedBlob
  };
}

function buildClinicalWorkupTags(input) {
  const tags = [];

  if (input.age != null) tags.push(`Age ${input.age}`);
  if (input.sexLabel) tags.push(input.sexLabel);
  if (input.pregnancy === "pregnant") tags.push("Pregnancy context");
  if (input.selectedChipLabels.length) tags.push(...input.selectedChipLabels);

  if (!input.selectedChipLabels.length && input.symptoms) tags.push("Symptoms entered");
  if (input.signs) tags.push("Signs noted");
  if (input.concern) tags.push("Concern entered");

  return dedupeStrings(tags).slice(0, 8);
}

function buildClinicalWorkupSummary(input, tests = []) {
  const summaryParts = [];

  if (input.age != null) summaryParts.push(`age ${input.age}`);
  if (input.sexLabel) summaryParts.push(input.sexLabel.toLowerCase());
  if (input.pregnancy === "pregnant") summaryParts.push("pregnancy context");
  if (input.symptoms) summaryParts.push(`symptoms "${truncateText(input.symptoms, 84)}"`);
  if (input.signs) summaryParts.push(`signs "${truncateText(input.signs, 84)}"`);
  if (input.concern) summaryParts.push(`concern "${truncateText(input.concern, 64)}"`);

  const intro = summaryParts.length
    ? `Based on ${joinWithAnd(summaryParts)}, `
    : "";

  if (tests.length) {
    return `${intro}these are conservative first-line tests from the current catalogue. Tap any test card below to add it to Tube Plan.`;
  }

  return `${intro}there is not a strong direct match yet in the current catalogue. Add a more specific symptom, sign, or concern, or switch to the main search by test or condition.`;
}

function buildClinicalWorkupOutput(input) {
  const matchedRules = [
    ...clinicalWorkupRuleDefinitions
      .map((rule) => evaluateClinicalWorkupRule(rule, input))
      .filter(Boolean),
    ...getSupplementalClinicalShortcutRules(input)
  ].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });

  const tests = getClinicalWorkupRecommendedTests(matchedRules);

  return {
    input,
    matchedRules,
    tests,
    tags: buildClinicalWorkupTags(input),
    summary: buildClinicalWorkupSummary(input, tests)
  };
}

function hasClinicalWorkupSuggestions() {
  return Boolean(clinicalWorkupOutput?.tests?.length);
}

function setClinicalWorkupStatus(message = "") {
  if (!clinicalWorkupStatus) return;
  clinicalWorkupStatus.textContent = String(message || "").trim();
}

function renderClinicalWorkupChips() {
  if (!clinicalWorkupChipList) return;

  clinicalWorkupChipList.innerHTML = clinicalWorkupChipDefinitions
    .map((chip) => `
      <button
        type="button"
        class="clinical-workup-chip${selectedClinicalChipIds.has(chip.id) ? " active" : ""}"
        data-clinical-chip="${chip.id}"
        aria-pressed="${selectedClinicalChipIds.has(chip.id) ? "true" : "false"}"
      >
        ${chip.label}
      </button>
    `)
    .join("");
}

function renderClinicalWorkupResults(output = clinicalWorkupOutput) {
  if (
    !clinicalWorkupResults
    || !clinicalWorkupResultsTitle
    || !clinicalWorkupResultsCopy
    || !clinicalWorkupResultTags
    || !clinicalWorkupRuleList
  ) return;

  if (!output) {
    clinicalWorkupResults.hidden = true;
    clinicalWorkupResultsCopy.textContent = "";
    clinicalWorkupResultTags.innerHTML = "";
    clinicalWorkupRuleList.innerHTML = "";
    return;
  }

  const outputTags = Array.isArray(output.tags) ? output.tags : [];
  const matchedRules = Array.isArray(output.matchedRules) ? output.matchedRules : [];

  clinicalWorkupResults.hidden = false;
  clinicalWorkupResultsTitle.textContent = output.tests.length
    ? (output.resultsTitle || "Suggested tests")
    : (output.emptyStateTitle || "No strong match yet");
  clinicalWorkupResultsCopy.textContent = output.summary;
  clinicalWorkupResultTags.innerHTML = outputTags
    .map((tag) => `<span class="clinical-workup-result-tag">${escapeHtml(tag)}</span>`)
    .join("");

  if (!matchedRules.length) {
    clinicalWorkupRuleList.innerHTML = `
      <article class="clinical-workup-empty-state">
        <p class="clinical-workup-rule-label">${escapeHtml(output.emptyStateLabel || "Next Step")}</p>
        <h4>${escapeHtml(output.emptyStateTitle || "Refine the presentation")}</h4>
        <p>${escapeHtml(output.emptyStateCopy || "Add a more specific symptom, sign, or clinical concern, or switch to the main search by test or condition.")}</p>
      </article>
    `;
    return;
  }

  clinicalWorkupRuleList.innerHTML = matchedRules
    .map((rule) => `
      <article class="clinical-workup-rule-card">
        <p class="clinical-workup-rule-label">${escapeHtml(rule.label || "Matched Presentation")}</p>
        <h4>${escapeHtml(rule.title)}</h4>
        <p>${escapeHtml(rule.rationale)}</p>
        <div class="clinical-workup-rule-tests">
          ${(rule.tests || [])
            .map((testName) => `<span class="clinical-workup-rule-test">${escapeHtml(testName)}</span>`)
            .join("")}
        </div>
        ${rule.caution ? `<p class="clinical-workup-rule-caution">${escapeHtml(rule.caution)}</p>` : ""}
        ${rule.matchedSignals?.length ? `<p class="clinical-workup-rule-match">Triggered by: ${escapeHtml(rule.matchedSignals.slice(0, 3).join(", "))}</p>` : ""}
      </article>
    `)
    .join("");
}

function clearClinicalWorkupInputs() {
  selectedClinicalChipIds.clear();
  if (clinicalAgeInput) clinicalAgeInput.value = "";
  if (clinicalSexSelect) clinicalSexSelect.value = "unspecified";
  if (clinicalPregnancySelect) clinicalPregnancySelect.value = "unknown";
  if (clinicalSymptomsInput) clinicalSymptomsInput.value = "";
  if (clinicalSignsInput) clinicalSignsInput.value = "";
  if (clinicalConcernInput) clinicalConcernInput.value = "";
  renderClinicalWorkupChips();
}

function clearClinicalWorkupOutput({ preserveInputs = true, rerenderCards = true, clearStatus = false } = {}) {
  clinicalWorkupOutput = null;
  renderClinicalWorkupResults(null);

  if (!preserveInputs) {
    clearClinicalWorkupInputs();
  }

  if (clearStatus) {
    setClinicalWorkupStatus("");
  }

  dispatchFindMyTubeEvent("findmytest:clear", {
    preserveInputs,
    clearStatus
  });
  dispatchFindMyTubeEvent("findmytest:statechange", {
    output: null
  });

  if (rerenderCards) {
    applyFilters();
  }
}

function setFindMyTestSuggestions(output, { rerenderCards = true } = {}) {
  clinicalWorkupOutput = output && Array.isArray(output.tests) ? output : null;
  renderClinicalWorkupResults(clinicalWorkupOutput);
  dispatchFindMyTubeEvent("findmytest:statechange", {
    output: clinicalWorkupOutput
  });

  if (rerenderCards) {
    applyFilters();
  }
}

function prepareFindMyTestResultsView() {
  if (activeSectionGroup) {
    setSectionView("", { historyMode: "replace", scrollToTop: false, clearSearch: true });
    return;
  }

  if (searchInput) {
    searchInput.value = "";
    updateSearchClearButton();
    refreshSearchPlaceholder();
  }
}

// Selection helpers collapse profile components so Tube Plan stays readable and avoids duplicate items.
function estimateDrawPlanForTests(testNames = [], { includeExistingSelection = false } = {}) {
  const nextSelection = includeExistingSelection
    ? new Set(selectedTestNames)
    : new Set();

  testNames.forEach((testName) => nextSelection.add(testName));
  collapseProfileSelections(nextSelection);

  return getResolvedDrawPlan(getTestsByNames(Array.from(nextSelection)));
}

function addTestsToPlan(testNames = [], { replace = false, openDrawPlan: shouldOpenDrawPlan = false } = {}) {
  const nextSelection = replace ? new Set() : new Set(selectedTestNames);

  testNames.forEach((testName) => nextSelection.add(testName));
  collapseProfileSelections(nextSelection);
  setSelectedTests(nextSelection);

  if (shouldOpenDrawPlan) {
    openDrawModal();
  }

  return getResolvedDrawPlan(getSelectedTests());
}

function removeTestsFromPlan(testNames = [], { openDrawPlan: shouldOpenDrawPlan = false } = {}) {
  const nextSelection = new Set(selectedTestNames);

  testNames.forEach((testName) => nextSelection.delete(testName));
  setSelectedTests(nextSelection);

  if (shouldOpenDrawPlan) {
    openDrawModal();
  }

  return getResolvedDrawPlan(getSelectedTests());
}

function runClinicalWorkup() {
  const input = getClinicalWorkupInput();
  if (!input.normalizedBlob) {
    clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: true, clearStatus: false });
    setClinicalWorkupStatus("Add at least one symptom, sign, or clinical concern to suggest tests.");
    clinicalSymptomsInput?.focus();
    return;
  }

  if (activeSectionGroup) {
    setSectionView("", { historyMode: "replace", scrollToTop: false, clearSearch: true });
  } else if (searchInput) {
    searchInput.value = "";
    updateSearchClearButton();
    refreshSearchPlaceholder();
  }

  clinicalWorkupOutput = buildClinicalWorkupOutput(input);
  renderClinicalWorkupResults();
  applyFilters();

  setClinicalWorkupStatus(
    clinicalWorkupOutput.tests.length
      ? `${clinicalWorkupOutput.tests.length} suggested test${clinicalWorkupOutput.tests.length === 1 ? "" : "s"} shown below.`
      : "No strong direct match yet. Try adding more specific symptoms, signs, or a clinical concern."
  );

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = clinicalWorkupOutput.tests.length ? clinicalWorkupResults : clinicalWorkupPanel;
  window.requestAnimationFrame(() => {
    target?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
}

function initClinicalWorkup() {
  renderClinicalWorkupChips();

  if (clinicalWorkupChipList) {
    clinicalWorkupChipList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-clinical-chip]");
      if (!button) return;

      const chipId = button.getAttribute("data-clinical-chip") || "";
      if (!chipId || !clinicalWorkupChipById[chipId]) return;

      if (selectedClinicalChipIds.has(chipId)) {
        selectedClinicalChipIds.delete(chipId);
      } else {
        selectedClinicalChipIds.add(chipId);
      }

      renderClinicalWorkupChips();
      setClinicalWorkupStatus("");
    });
  }

  if (clinicalWorkupForm) {
    clinicalWorkupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      runClinicalWorkup();
    });
  }

  if (clinicalWorkupResetBtn) {
    clinicalWorkupResetBtn.addEventListener("click", () => {
      clearClinicalWorkupOutput({ preserveInputs: false, rerenderCards: true, clearStatus: true });
    });
  }

  if (clearClinicalWorkupResultsBtn) {
    clearClinicalWorkupResultsBtn.addEventListener("click", () => {
      clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: true, clearStatus: true });
    });
  }

  [
    clinicalAgeInput,
    clinicalSexSelect,
    clinicalPregnancySelect,
    clinicalSymptomsInput,
    clinicalSignsInput,
    clinicalConcernInput
  ].forEach((field) => {
    field?.addEventListener("input", () => {
      setClinicalWorkupStatus("");
    });
  });
}

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
  const hasSelection = selectedTestNames.size > 0;
  if (!hasSelection) {
    window.clearTimeout(clearDrawSelectionConfirmTimeoutId);
    isClearDrawSelectionConfirming = false;
  }

  if (quickToolsClearBtn) {
    quickToolsClearBtn.hidden = !hasSelection;
    quickToolsClearBtn.disabled = !hasSelection;
    quickToolsClearBtn.classList.toggle("confirming", hasSelection && isClearDrawSelectionConfirming);
    quickToolsClearBtn.textContent = hasSelection && isClearDrawSelectionConfirming
      ? "Confirm clear"
      : "Clear all";
    quickToolsClearBtn.setAttribute(
      "aria-label",
      hasSelection && isClearDrawSelectionConfirming
        ? "Confirm clearing all tests from current draw plan"
        : "Clear all tests from current draw plan"
    );
  }
}

function resetClearDrawSelectionConfirmation({ update = true } = {}) {
  window.clearTimeout(clearDrawSelectionConfirmTimeoutId);
  isClearDrawSelectionConfirming = false;
  if (update) updateDrawSelectionTools();
}

function requestClearDrawSelectionConfirmation() {
  if (!selectedTestNames.size) return;
  window.clearTimeout(clearDrawSelectionConfirmTimeoutId);
  isClearDrawSelectionConfirming = true;
  updateDrawSelectionTools();
  clearDrawSelectionConfirmTimeoutId = window.setTimeout(() => {
    resetClearDrawSelectionConfirmation();
  }, 3200);
}

function renderDrawSelectionSummary() {
  if (!drawSelectionCount) return;
  const count = selectedTestNames.size;
  drawSelectionCount.textContent = count
    ? `${count} test${count !== 1 ? "s" : ""} added`
    : "No tests added yet";
  updateDrawSelectionTools();
}

function updateQuickToolsPanelState() {
  if (!quickToolsPanel || !quickToolsTitle || !quickToolsDescription || !openDrawPlannerBtn) return;

  const selectedTests = getSelectedTests();
  const count = selectedTests.length;
  if (!count) {
    quickToolsPanel.classList.add("inactive-plan");
    quickToolsPanel.classList.remove("active-plan");
    quickToolsTitle.textContent = "Start a Draw Plan";
    quickToolsDescription.textContent = "Add tests as you search to combine tubes and save consumables.";
    if (quickToolsStats) quickToolsStats.hidden = true;
    if (quickToolsTestsStat) quickToolsTestsStat.textContent = "";
    if (quickToolsTubesStat) quickToolsTubesStat.textContent = "";
    if (quickToolsClearBtn) quickToolsClearBtn.hidden = true;
    openDrawPlannerBtn.textContent = "Plan My Draw";
    openDrawPlannerBtn.setAttribute("aria-controls", "searchInput");
    return;
  }

  const { plan } = getResolvedDrawPlan(selectedTests);
  const totalTubes = plan.items.reduce((sum, item) => sum + item.count, 0);
  quickToolsPanel.classList.remove("inactive-plan");
  quickToolsPanel.classList.add("active-plan");
  quickToolsTitle.textContent = "Current Draw Plan";
  quickToolsDescription.textContent = "Keep searching to add more tests, or open your plan to review the current tube count.";
  if (quickToolsStats) quickToolsStats.hidden = false;
  if (quickToolsTestsStat) {
    quickToolsTestsStat.textContent = `${count} test${count !== 1 ? "s" : ""}`;
  }
  if (quickToolsTubesStat) {
    quickToolsTubesStat.textContent = `${totalTubes} tube${totalTubes !== 1 ? "s" : ""}`;
  }
  if (quickToolsClearBtn) quickToolsClearBtn.hidden = false;
  openDrawPlannerBtn.textContent = "View Plan";
  openDrawPlannerBtn.setAttribute("aria-controls", "drawModal");
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
          &times;
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
  const hasHighAttentionTest = selectedTests.some((test) => AUTO_EXPAND_CRITICAL_NOTE_TESTS.has(test.name));
  if (!count) {
    selectionCartCount.textContent = "0";
    selectionCartBar.setAttribute("aria-label", "Tube Plan");
    selectionCartBar.title = "Tube Plan";
    selectionCartBar.hidden = true;
    selectionCartBar.classList.remove("requires-attention");
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
  selectionCartBar.classList.toggle("requires-attention", hasHighAttentionTest);
  selectionCartBar.setAttribute(
    "aria-label",
    `Tube Plan. ${count} added test${count !== 1 ? "s" : ""}, ${totalTubes} tube${totalTubes !== 1 ? "s" : ""} estimated.${hasHighAttentionTest ? " Important handling guidance included." : ""}`
  );
  selectionCartBar.title = `Open Tube Plan: ${count} added test${count !== 1 ? "s" : ""}${hasHighAttentionTest ? " with important handling guidance" : ""}`;
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
  updateQuickToolsPanelState();
  renderSelectedTestsCart();
  renderDrawResult();
  updateSelectionCartBar();
  updateDrawPlannerToggleState();
  if (rerenderCards) applyFilters();
}

function getSelectedTestNamesList() {
  return Array.from(selectedTestNames);
}

function setSelectedTests(nextSelection, options = {}) {
  resetClearDrawSelectionConfirmation({ update: false });
  selectedTestNames.clear();
  nextSelection.forEach((name) => selectedTestNames.add(name));
  collapseProfileSelections(selectedTestNames);
  refreshSelectionUi(options);
  dispatchFindMyTubeEvent("findmytube:selectionchange", {
    selectedTestNames: getSelectedTestNamesList()
  });
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
  updateQuickToolsPanelState();
  updateQuickToolsToggleState();
}

function openDrawModal() {
  if (!drawModal) return;
  resetClearDrawSelectionConfirmation({ update: false });
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
  resetClearDrawSelectionConfirmation({ update: false });
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

// Draw planning starts with exact overrides, then falls back to grouped tube-color logic.
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

// Volume and specimen-specific adjustments refine the base plan after the initial grouping step.
function appendPlanItemDetail(item, detailText) {
  if (!item) return;

  const nextDetail = String(detailText || "").trim();
  if (!nextDetail) return;

  const currentDetail = String(item.detail || "").trim();
  if (!currentDetail) {
    item.detail = nextDetail;
    return;
  }

  if (currentDetail.includes(nextDetail)) return;
  item.detail = `${currentDetail} ${nextDetail}`;
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
  const requiredPurpleCount = Math.ceil(purpleTests.length / 2);
  if (requiredPurpleCount <= 1) return "";

  let purpleItem = plan.items.find((item) => item.key === "Purple");
  if (!purpleItem) {
    purpleItem = { key: "Purple", label: "Purple", count: requiredPurpleCount, tests: [] };
    plan.items.push(purpleItem);
  } else {
    purpleItem.count = Math.max(purpleItem.count, requiredPurpleCount);
  }

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return `Purple rule applied: allow up to 2 purple-top tests per tube, so ${purpleTests.length} purple-top tests need ${requiredPurpleCount} x Purple tubes.`;
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

function applyTubeVariantNotes(plan, selectedTests) {
  const variantRequests = new Map();

  selectedTests.forEach((test) => {
    const tubeVariant = String(test.tubeVariant || "").trim();
    if (!tubeVariant) return;

    const tubeGroups = getTubeGroups(test.tubeColor);
    tubeGroups.forEach((group) => {
      const key = `${group}__${tubeVariant}`;
      if (!variantRequests.has(key)) {
        variantRequests.set(key, {
          group,
          tubeVariant,
          tests: new Set()
        });
      }

      variantRequests.get(key).tests.add(test.name);
    });
  });

  variantRequests.forEach(({ group, tubeVariant, tests }) => {
    const planItem = plan.items.find((item) => item.key === group);
    if (!planItem) return;

    appendPlanItemDetail(
      planItem,
      `Use the ${lowercaseFirstCharacter(tubeVariant)} version of this ${planItem.label} tube for ${joinWithAnd([...tests])}.`
    );
  });
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

  applyTubeVariantNotes(plan, selectedTests);

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

function getPlanItemAlternativeGroups(item) {
  const key = String(item?.key || "").trim();
  if (!key.startsWith("choice:")) return [];

  return key
    .slice("choice:".length)
    .split("|")
    .map((group) => String(group || "").trim())
    .filter(Boolean);
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
    .map((item) => {
      const alternativeGroups = getPlanItemAlternativeGroups(item);
      const headMarkup = alternativeGroups.length
        ? `
          <div class="draw-group-main">
            <div class="tube-option-grid">
              ${alternativeGroups.map((group, index) => `
                ${index > 0 ? `<span class="tube-option-separator">or</span>` : ""}
                <span class="tube-option alternative">
                  ${getTubeVisualMarkup(group)}
                  <span class="tube-option-copy">
                    <span class="tube-option-label">${item.count} x ${group}</span>
                    ${getTubeAdditiveLabel(group) ? `<span class="tube-option-additive">${getTubeAdditiveLabel(group)}</span>` : ""}
                  </span>
                </span>
              `).join("")}
            </div>
          </div>
        `
        : `
          <div class="draw-group-main">
            ${getTubeVisualMarkup(item.key)}
            <h3>${item.label}</h3>
            <span class="draw-group-count-badge">${item.count}x</span>
          </div>
        `;

      return `
        <article class="draw-group-card">
          <div class="draw-group-top">
            ${headMarkup}
          </div>
          ${item.detail ? `<p class="draw-group-detail">${item.detail}</p>` : ""}
        </article>
      `;
    })
    .join("");

  const plannerNoteText = plan.manual.length
    ? `Manual review needed for: ${plan.manual.join(", ")}.`
    : "";

  drawPlannerNote.hidden = !plannerNoteText;
  drawPlannerNote.textContent = plannerNoteText;

  animateDrawResultCard();
}

// Card enrichment turns the raw catalogue into display-ready content for the test cards.
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

function shouldHideSpecimenOnCard(test) {
  return test.name === "HIV Viral Load";
}

function getMicroSpecimenBucket(test) {
  const text = normalizeForSearch([
    test?.name || "",
    test?.specimen || "",
    test?.specimenGuide || ""
  ].join(" "));

  if (text.includes("urine")) return "Urine";
  if (text.includes("blood culture") || text.includes("blood")) return "Blood";
  if (text.includes("fluid")) return "Fluid";
  if (text.includes("sputum") || text.includes("respiratory")) return "Sputum";
  if (text.includes("stool") || text.includes("fecal") || text.includes("faecal")) return "Stool";
  if (text.includes("csf")) return "CSF";
  if (text.includes("tissue")) return "Tissue";
  if (text.includes("swab")) return "Swabs";
  return "Specimen";
}

function getMicroSubsection(test) {
  const text = normalizeForSearch([
    test?.name || "",
    test?.specimen || ""
  ].join(" "));

  if (text.includes("genexpert")) {
    return `GeneXpert • ${getMicroSpecimenBucket(test)}`;
  }

  if (text.includes("mcs") || text.includes("culture")) {
    return `MC&S • ${getMicroSpecimenBucket(test)}`;
  }

  return "";
}

function getMicroClinicalProfile(subsection = "") {
  if (subsection.startsWith("MC&S • ")) {
    return {
      use: "Microbiology culture and sensitivity request for organism detection and antimicrobial guidance on the specified specimen.",
      keywords: ["culture", "mcs", "sensitivity", "microbiology", "infection source"]
    };
  }

  if (subsection.startsWith("GeneXpert • ")) {
    return {
      use: "Rapid molecular pathogen detection request using a GeneXpert workflow on the specified specimen.",
      keywords: ["genexpert", "xpert", "rapid molecular test", "pathogen detection", "microbiology"]
    };
  }

  return null;
}

function getClinicalProfile(testName, grouping) {
  if (clinicalProfileByName[testName]) return clinicalProfileByName[testName];
  if (clinicalProfileBySubsection[grouping.subsection]) return clinicalProfileBySubsection[grouping.subsection];
  if (grouping.sectionId === "micro_virology") {
    const microClinicalProfile = getMicroClinicalProfile(grouping.subsection);
    if (microClinicalProfile) return microClinicalProfile;
  }

  return {
    use: "General diagnostic support test interpreted with clinical context.",
    keywords: ["diagnosis", "clinical workup"]
  };
}

function getTestGrouping(testOrName) {
  const test = typeof testOrName === "string"
    ? { name: testOrName }
    : (testOrName || {});
  const testName = String(test.name || "");
  const name = testName.toLowerCase();
  const microSubsection = getMicroSubsection(test);

  if (name.includes("cytology")) {
    return { sectionId: "cytology", subsection: "Cytology" };
  }

  if (name.includes("bone marrow") || name.includes("trephine") || name.includes("pathologist")) {
    return { sectionId: "histology", subsection: "Histology" };
  }

  if (
    name.includes("factor v leiden") ||
    name.includes("genotyp") ||
    name.includes("haemochromatosis") ||
    name.includes("hemochromatosis") ||
    name.includes("porphyria") ||
    name.includes("porphobilinogen") ||
    name.includes("thal") ||
    name.includes("genetic") ||
    name.includes("metabolic")
  ) return { sectionId: "metabolic_genetic", subsection: "Inherited Disorder Screen" };

  if (name.includes("blood gases") || name.includes("lactate")) {
    return { sectionId: "chemistry", subsection: "Blood Gases" };
  }

  if (
    name.includes("creatinine clearance") ||
    (name.includes("protein") && name.includes("creatinine ratio")) ||
    (name.includes("albumin") && name.includes("creatinine ratio")) ||
    name.includes("daily urine protein") ||
    name.includes("u&e") ||
    name.includes("creatinine") ||
    name.includes("urea") ||
    name.includes("sodium") ||
    name.includes("potassium") ||
    name.includes("chloride") ||
    name.includes("electrolyte")
  ) return { sectionId: "chemistry", subsection: "Kidney Function (U+E)" };

  if (name.includes("cortisol") && name.includes("urine")) {
    return { sectionId: "chemistry", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("aldosterone") || name.includes("renin")) {
    return { sectionId: "chemistry", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("hirsutism") || name.includes("infertility")) {
    return { sectionId: "chemistry", subsection: "Thyroid / Reproductive / Adrenal" };
  }

  if (name.includes("cord blood")) {
    return { sectionId: "chemistry", subsection: "Thyroid / Reproductive / Adrenal" };
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
  ) return { sectionId: "chemistry", subsection: "Drugs Of Abuse" };

  if (
    name.includes("valproate") ||
    name.includes("phenytoin") ||
    name.includes("lithium") ||
    name.includes("digoxin") ||
    name.includes("gentamicin") ||
    name.includes("gentamycin") ||
    name.includes("vancomycin") ||
    name.includes("carbamazepine") ||
    name.includes("levetiracetam") ||
    name.includes("phenobarbit") ||
    name.includes("theophylline") ||
    name.includes("amikacin") ||
    name.includes("tobramycin") ||
    name.includes("therapeutic")
  ) return { sectionId: "chemistry", subsection: "Drug Monitoring" };

  if (name.includes("hiv viral load")) {
    return { sectionId: "metabolic_genetic", subsection: "Molecular Biology" };
  }

  if (name.includes("pcr")) {
    return { sectionId: "metabolic_genetic", subsection: "Molecular Biology" };
  }

  if (
    name.includes("csf cell count and chemistry") ||
    name.includes("csf glucose") ||
    name.includes("csf protein") ||
    name.includes("csf igg index") ||
    name.includes("csf ada") ||
    name.includes("csf oligoclonal")
  ) {
    return { sectionId: "chemistry", subsection: "General Chemistry" };
  }

  if (name.includes("hepatitis c viral load")) {
    return { sectionId: "chemistry", subsection: "General Chemistry" };
  }

  if (
    name.includes("5-hiaa") ||
    name.includes("bence-jones") ||
    name.includes("metanephrines")
  ) {
    return { sectionId: "chemistry", subsection: "Serum Markers" };
  }

  if (name.includes("calcium/phosphate")) {
    return { sectionId: "chemistry", subsection: "Bone (CMP Profile)" };
  }

  if (
    name.includes("b-d-glucan") ||
    name.includes("bd glucan") ||
    name.includes("beta-d-glucan") ||
    name.includes("beta d glucan")
  ) {
    return { sectionId: "chemistry", subsection: "General Chemistry" };
  }

  if (microSubsection) {
    return { sectionId: "micro_virology", subsection: microSubsection };
  }

  if (
    name.includes("genexpert") ||
    name.includes("viral load") ||
    name.includes("virology") ||
    name.includes("mrsa")
  ) return { sectionId: "immunology", subsection: "General Serology" };

  if (
    name.includes("tumour") ||
    name.includes("cea") ||
    name.includes("afp") ||
    name.includes("ca 19") ||
    name.includes("ca 125") ||
    name.includes("ca 15") ||
    name.includes("psa") ||
    name.includes("bhcg") ||
    name.includes("beta-hcg") ||
    name.includes("protein electrophoresis") ||
    name.includes("immunofixation") ||
    name.includes("free light chains") ||
    name.includes("bence-jones") ||
    name.includes("beta-2 microglobulin") ||
    name.includes("5-hiaa") ||
    name.includes("metanephrines") ||
    name.includes("ca 72")
  ) return { sectionId: "chemistry", subsection: "Serum Markers" };

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
  ) return { sectionId: "immunology", subsection: "Allergy Profile" };

  if (
    name.includes("autoimmune") ||
    name.includes("arthritis profile") ||
    name.includes("ana") ||
    name.includes("ena") ||
    name.includes("rheumatoid") ||
    name.includes("anti-ccp") ||
    name.includes("anca") ||
    name.includes("smooth muscle") ||
    name.includes("lkm") ||
    name.includes("sla/lp") ||
    name.includes("soluble liver antigen") ||
    name.includes("dsdna") ||
    name.includes("pr3") ||
    name.includes("mpo") ||
    name.includes("gbm") ||
    name.includes("complement") ||
    name.includes("celiac") ||
    name.includes("immunoglobulin") ||
    name.includes("igg subfraction") ||
    name.includes("systemic sclerosis") ||
    name.includes("interleukin") ||
    name.includes("cd4")
  ) return { sectionId: "immunology", subsection: "Immunology" };

  if (
    name.includes("asot") ||
    name.includes("dnase") ||
    name.includes("streptolysin") ||
    name.includes("cryptococcal") ||
    name.includes("pylori") ||
    name.includes("difficile") ||
    name.includes("fta") ||
    name.includes("hepatitis") ||
    name.includes("hiv elisa") ||
    name.includes("brucella") ||
    name.includes("rickettsia") ||
    name.includes("schistosoma") ||
    name.includes("rubella") ||
    name.includes("toxoplasma") ||
    name.includes("ebv") ||
    name.includes("cmv") ||
    name.includes("hsv") ||
    name.includes("measles") ||
    name.includes("mumps") ||
    name.includes("parvovirus") ||
    name.includes("varicella") ||
    name.includes("rpr") ||
    name.includes("treponema") ||
    name.includes("sars-cov-2") ||
    name.includes("herpes simplex") ||
    name.includes("widal") ||
    name.includes("syphilis")
  ) return { sectionId: "immunology", subsection: "General Serology" };

  if (
    name.includes("blood group") ||
    name.includes("crossmatch") ||
    name.includes("coombs") ||
    name.includes("blood bank") ||
    name.includes("transfusion") ||
    name.includes("antibody identification") ||
    name.includes("antibody titration")
  ) {
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
    name.includes("lupus anticoagulant") ||
    name.includes("inherited thrombotic") ||
    name.includes("pfa-200")
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
    name.includes("esr") ||
    name.includes("haemoglobin") ||
    name.includes("rbc count") ||
    name.includes("haematocrit") ||
    name.includes("mcv") ||
    name.includes("mch") ||
    name.includes("mchc") ||
    name.includes("platelet count") ||
    name.includes("wbc and differential") ||
    name.includes("haemolytic profile")
  ) return { sectionId: "haematology", subsection: "General" };

  if (
    name.includes("menopausal screen profile") ||
    name.includes("menopause profile") ||
    name.includes("menopausal profile") ||
    name.includes("menopause screen") ||
    name.includes("menopausal screen") ||
    name.includes("dexamethasone suppression") ||
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
    /^e2\b/.test(name) ||
    name.includes("dheas") ||
    name.includes("cortisol") ||
    name.includes("testosterone") ||
    name.includes("shbg") ||
    name.includes("thyroid antibod") ||
    name.includes("tsh receptor") ||
    name.includes("thyroglobulin")
  ) return { sectionId: "chemistry", subsection: "Thyroid / Reproductive / Adrenal" };

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
    name.includes("liver") ||
    name.includes("lft") ||
    name.includes("alt") ||
    name.includes("ast") ||
    name.includes("ggt") ||
    name.includes("alp") ||
    name.includes("bilirubin") ||
    name.includes("ammonia") ||
    name.includes("amylase") ||
    name.includes("lipase") ||
    name.includes("steatocrit")
  ) return { sectionId: "chemistry", subsection: "Liver Function And Pancreas" };

  if (
    name.includes("cardiac profile") ||
    name.includes("cardiac marker") ||
    name.includes("troponin") ||
    name.includes("nt-probnp") ||
    name.includes("ck") ||
    name.includes("ldh") ||
    name.includes("myoglobin")
  ) {
    return { sectionId: "chemistry", subsection: "Cardiac Markers" };
  }

  if (
    name.includes("lipid") ||
    name.includes("cholesterol") ||
    name.includes("triglyceride") ||
    name.includes("lipoprotein") ||
    name.includes("apolipoprotein")
  ) {
    return { sectionId: "chemistry", subsection: "Lipids" };
  }

  if (
    name.includes("glucose") ||
    name.includes("hba1c") ||
    name.includes("c-peptide") ||
    name.includes("ogtt")
  ) {
    return { sectionId: "chemistry", subsection: "Diabetes" };
  }

  if (name.includes("crp") || name.includes("procalcitonin")) {
    return { sectionId: "chemistry", subsection: "Inflammation / Immune" };
  }

  if (
    name.includes("uric acid") ||
    name === "albumin" ||
    name.includes("total protein") ||
    name.includes("pre-albumin") ||
    name.includes("folate") ||
    name.includes("vitamin b12") ||
    name.includes("faecal occult")
  ) {
    return { sectionId: "chemistry", subsection: "General Chemistry" };
  }

  return { sectionId: "chemistry", subsection: "General Chemistry" };
}

function enrichTest(test) {
  const grouping = getTestGrouping(test);
  const section = sectionMeta[grouping.sectionId] || sectionMeta.general;
  const aliases = aliasByName[test.name] || [];
  const ironFeSynonyms = /\b(iron|fe)\b/i.test(test.name)
    ? ["iron", "fe", "iron studies", "fe studies"]
    : [];
  const clinicalProfile = getClinicalProfile(test.name, grouping);

  const normalized = {
    ...test,
    tubeColor: normalizeTubeColor(test.tubeColor),
    tubeVariant: String(test.tubeVariant || "").trim(),
    turnaroundTime: normalizeTurnaroundTime(test.turnaroundTime),
    notes: String(test.notes || "").trim(),
    criticalPrep: String(test.criticalPrep || "").trim() || inferCriticalPrep(test),
    specimenGuide: grouping.sectionId === "micro_virology"
      ? (shouldHideSpecimenOnCard(test)
          ? ""
          : (String(test.specimenGuide || "").trim() || inferSpecimenGuide(test)))
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
    normalized.tubeVariant,
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

function getSectionBrowsePanelMarkup(sectionId) {
  const browseGroups = sectionBrowseGroups[sectionId] || [];
  if (!browseGroups.length) return "";

  const isOpen = activeSectionGroup === sectionId;
  const activeBrowseGroup = activeBrowseGroupBySection[sectionId] || "";
  const panelId = `${sectionId}BrowsePanel`;
  const panelTitle = sectionBrowseTitleById[sectionId] || `${sectionMeta[sectionId]?.label || "Section"} Groups`;

  return `
    <div
      class="chemistry-browse-panel${isOpen ? " is-open" : ""}"
      id="${panelId}"
      aria-hidden="${isOpen ? "false" : "true"}"
    >
      <div class="chemistry-browse-panel-inner">
        <p class="chemistry-browse-title">${panelTitle}</p>
        <div class="chemistry-browse-grid">
          ${browseGroups.map((group) => `
            <button
              type="button"
              class="chemistry-browse-chip${activeBrowseGroup === group.id ? " active" : ""}"
              data-section-browse="${group.id}"
              data-section-browse-parent="${sectionId}"
              aria-pressed="${activeBrowseGroup === group.id ? "true" : "false"}"
              tabindex="${isOpen ? "0" : "-1"}"
            >
              <span class="chemistry-browse-chip-icon" aria-hidden="true">${group.icon}</span>
              <span class="chemistry-browse-chip-label">${group.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Build the department chip UI from metadata so order and browse groups stay centralized.
function renderGroupChips() {
  if (!groupChips) return;

  groupChips.innerHTML = chipGroups
    .map((groupId) => {
      const group = sectionMeta[groupId];
      const isActive = activeSectionGroup === groupId;
      const hasBrowsePanel = hasSectionBrowseGroups(groupId);
      const panelId = `${groupId}BrowsePanel`;
      return `
        <div class="group-chip-stack${hasBrowsePanel && isActive ? " browse-open" : ""}">
          <button
            class="group-chip${isActive ? " active" : ""}"
            type="button"
            data-group="${groupId}"
            aria-pressed="${isActive ? "true" : "false"}"
            ${hasBrowsePanel ? `aria-expanded="${isActive ? "true" : "false"}" aria-controls="${panelId}"` : ""}
          >
            <span class="group-chip-label">${group.label}</span>
            <span class="group-chip-icon" aria-hidden="true">${getSectionIconMarkup(groupId)}</span>
          </button>
          ${hasBrowsePanel ? getSectionBrowsePanelMarkup(groupId) : ""}
        </div>
      `;
    })
    .join("");

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const groupId = chip.getAttribute("data-group") || "";
      const isCurrentSection = activeSectionGroup === groupId;
      const hasActiveBrowseGroup = Boolean(getActiveBrowseGroup(groupId));

      if (isCurrentSection && hasActiveBrowseGroup) {
        setSectionView(groupId, { browseGroup: "", historyMode: "push", scrollToTop: true });
        return;
      }

      const nextSectionGroup = isCurrentSection ? "" : groupId;
      const replaceHistory = nextSectionGroup === "";
      setSectionView(nextSectionGroup, { browseGroup: "", historyMode: replaceHistory ? "replace" : "push", scrollToTop: true });
    });
  });

  groupChips.querySelectorAll("button[data-section-browse]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const browseId = chip.getAttribute("data-section-browse") || "";
      const parentSectionId = chip.getAttribute("data-section-browse-parent") || "";
      if (!parentSectionId) return;

      const nextBrowseGroup = getActiveBrowseGroup(parentSectionId) === browseId ? "" : browseId;
      setSectionView(parentSectionId, {
        browseGroup: nextBrowseGroup,
        historyMode: "push",
        scrollToTop: true
      });
    });
  });

  updateGroupChipState();
  updateSectionContextBar();
}

function setSectionView(sectionId = "", { browseGroup = "", historyMode = "none", scrollToTop = false, clearSearch = false } = {}) {
  activeSectionGroup = sectionMeta[sectionId] ? sectionId : "";
  if (activeSectionGroup && clinicalWorkupOutput) {
    clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: false, clearStatus: true });
  }
  Object.keys(activeBrowseGroupBySection).forEach((browseSectionId) => {
    if (browseSectionId !== activeSectionGroup) {
      activeBrowseGroupBySection[browseSectionId] = "";
    }
  });
  if (activeSectionGroup && hasSectionBrowseGroups(activeSectionGroup)) {
    activeBrowseGroupBySection[activeSectionGroup] = sectionBrowseGroupById[activeSectionGroup]?.[browseGroup]
      ? browseGroup
      : "";
  }

  if (clearSearch && searchInput) searchInput.value = "";
  updateSearchClearButton();
  renderGroupChips();
  applyFilters();

  if (historyMode === "push") syncHistoryState(activeSectionGroup, false);
  if (historyMode === "replace") syncHistoryState(activeSectionGroup, true);

  if (!scrollToTop) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = shouldKeepPreSearchPanelVisible(activeSectionGroup, searchInput?.value || "")
    ? preSearchPanel
    : activeSectionGroup
      ? (resultsInfo || cardsContainer)
      : preSearchPanel;
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
    const nextBrowseGroup = nextSectionGroup && sectionBrowseGroupById[nextSectionGroup]?.[event.state?.browse || ""]
      ? event.state.browse
      : "";
    setSectionView(nextSectionGroup, {
      browseGroup: nextBrowseGroup,
      clearSearch: nextSectionGroup === "",
      scrollToTop: true
    });
  });
}

// Filtering merges search, section browsing, shortcuts, and clinical suggestions into one result set.
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

function shouldPrioritizeProfilesFirst(selectedSection, normalizedQuery) {
  return Boolean(selectedSection) || normalizedQuery === "csf" || /\bcardiac\b/.test(normalizedQuery);
}

function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = activeSectionGroup || "";
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery && !selectedSection && hasClinicalWorkupState()) {
    return Array.isArray(clinicalWorkupOutput?.tests)
      ? clinicalWorkupOutput.tests
      : [];
  }
  const activeBrowseSubsectionSet = new Set(getActiveBrowseSubsections(selectedSection));
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
    if (activeBrowseSubsectionSet.size && !activeBrowseSubsectionSet.has(test.grouping.subsection)) {
      return false;
    }
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

  if (!shouldPrioritizeProfilesFirst(selectedSection, normalizedQuery)) return filtered;

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
  const isClinicalSuggestionsMode = !normalizedQuery && !activeSectionGroup && hasClinicalWorkupState();
  const clinicalModeLabel = clinicalWorkupOutput?.modeLabel || "Find My Test";
  const resultsContextLabel = !normalizedQuery && activeSectionGroup
    ? getResultsContextLabel(activeSectionGroup)
    : "";
  const resultsPrefix = resultsContextLabel ? `${resultsContextLabel}. ` : "";

  if (filteredTests.length === 0) {
    setResultsInfo(
      isClinicalSuggestionsMode
        ? `${clinicalModeLabel}. 0 tests found. ${CLINICAL_WORKUP_DISCLAIMER}`
        : matchedConditionShortcut
        ? `${resultsPrefix}Condition shortcut: ${matchedConditionShortcut.label}. 0 tests found. ${CONDITION_SHORTCUT_DISCLAIMER}`
        : `${resultsPrefix}0 tests found`
    );
    cardsContainer.innerHTML = `
      <div class="no-results">
        ${isClinicalSuggestionsMode
          ? "No strong direct match yet. Add more specific symptoms or signs, or switch to the main search."
          : "No matching test found. Try searching by test or profile (e.g. CRP or Liver function tests)."}
      </div>
    `;
    return;
  }

  setResultsInfo(
    isClinicalSuggestionsMode
      ? `${clinicalModeLabel}. ${filteredTests.length} suggested test${filteredTests.length > 1 ? "s" : ""} found. ${CLINICAL_WORKUP_DISCLAIMER}`
      : matchedConditionShortcut
      ? `${resultsPrefix}Condition shortcut: ${matchedConditionShortcut.label}. ${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found. ${CONDITION_SHORTCUT_DISCLAIMER}`
      : `${resultsPrefix}${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`
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
            ${getTubeVisualMarkup(group, tubeIconSizeClass)}
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
    const tubeVariantValue = String(test.tubeVariant || "").trim();
    const hasTubeOptions = tubeGroups.length > 0;
    const specimenValue = getCardSpecimenValue(test, { isMicro });
    const hasSpecimenValue = Boolean(specimenValue);
    const showRequestedSpecimen = isSelected && hasSpecimenValue && !shouldHideSpecimenOnCard(test);
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
    const summaryFields = hasTubeOptions ? `
      ${renderSummaryField({
        label: "Tube",
        content: `<div class="tube-color-row${tubeGroups.length > 1 ? " multiple" : ""}">
          ${tubeOptionsMarkup}
        </div>`,
        isAction: true
      })}
      ` : "";
    const summaryFieldCount = Number(hasTubeOptions);
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
      ${summaryFieldCount ? `
      <div class="card-summary-grid${summaryFieldCount <= 1 ? " single" : ""}">
        ${summaryFields}
      </div>
      ` : ""}
      ${showRequestedSpecimen ? `
      <div class="card-requested-specimen">
        <span class="label">Requested Specimen</span>
        <span class="card-requested-specimen-value">${specimenValue}</span>
      </div>
      ` : ""}
      <div class="card-extra">
        <div class="test-subgroup-badge">${test.grouping.subsection}</div>
        ${showTubeChoiceNote ? `
        <div class="field">
          <span class="label">Tube Note</span>
          <span>${test.tubeColor}</span>
        </div>
        ` : ""}
        ${tubeVariantValue ? `
        <div class="field">
          <span class="label">Tube Type</span>
          <span>${tubeVariantValue}</span>
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

    const handleSelect = (trigger) => {
      const shouldRestoreSearchFocus = shouldPreserveSearchFocusOnMobile();
      const wasSelected = isSelected;
      const sourceRect = trigger?.getBoundingClientRect
        ? trigger.getBoundingClientRect()
        : null;
      toggleSelectedTest(test.name);
      const wasAddedToPlan = !wasSelected && selectedTestNames.has(test.name);
      if (wasAddedToPlan && sourceRect) {
        animateAddToPlanFeedback({ sourceRect, tubeColorValue: test.tubeColor });
      }
      if (shouldRestoreSearchFocus && wasAddedToPlan) {
        clearSearchForNextPlanEntry();
      }
      if (shouldRestoreSearchFocus) {
        restoreSearchFocusWithoutScroll();
      }
    };

    [titleActionBtn, summaryActionBtn].forEach((trigger) => {
      trigger?.addEventListener("pointerdown", preserveSearchFocusOnPress);
      trigger?.addEventListener("mousedown", preserveSearchFocusOnPress);
      trigger?.addEventListener("click", () => handleSelect(trigger));
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
  const hasClinicalState = hasClinicalWorkupState();
  const keepPreSearchVisible = shouldKeepPreSearchPanelVisible(activeSectionGroup, searchInput?.value || "");
  preSearchPanel.style.display = hasQuery || hasClinicalState || (hasSectionFilter && !keepPreSearchVisible) ? "none" : "grid";
  if (siteFooter) {
    siteFooter.hidden = hasQuery || hasSectionFilter || hasClinicalState;
  }
  updateBackToTopVisibility();
  updateSelectionCartViewportPosition();

  if (!hasQuery && !hasSectionFilter && !hasClinicalState) {
    setResultsInfo("");
    cardsContainer.innerHTML = "";
    return;
  }

  if (isBrowseOverviewVisible(activeSectionGroup, searchInput?.value || "")) {
    setResultsInfo("");
    cardsContainer.innerHTML = "";
    return;
  }

  renderCards(getFilteredTests());
}

// Wire the app shell after all shared helpers are defined.
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
      if (searchInput.value.trim() && clinicalWorkupOutput) {
        clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: false, clearStatus: true });
      }
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

  if (sectionContextBackBtn) {
    sectionContextBackBtn.addEventListener("click", () => {
      if (getActiveBrowseGroup(activeSectionGroup)) {
        setSectionView(activeSectionGroup, {
          browseGroup: "",
          historyMode: "replace",
          scrollToTop: true
        });
        return;
      }

      setSectionView("", {
        browseGroup: "",
        historyMode: "replace",
        scrollToTop: true
      });
    });
  }

  if (brandHomeBtn) {
    brandHomeBtn.addEventListener("click", () => {
      goHome();
    });
  }

  if (findMyTestHeaderTitle) {
    findMyTestHeaderTitle.addEventListener("click", () => {
      handleFindMyTestHeaderAction();
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
      if (selectedTestNames.size > 0) {
        openDrawModal();
        return;
      }
      focusMainSearchField({ scroll: "if-needed" });
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

  if (quickToolsClearBtn) {
    quickToolsClearBtn.addEventListener("click", () => {
      if (!selectedTestNames.size) return;
      if (!isClearDrawSelectionConfirming) {
        requestClearDrawSelectionConfirmation();
        return;
      }
      resetClearDrawSelectionConfirmation({ update: false });
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
}

// Expose the small public API that the Find My Test module uses to share search and draw-plan state.
function updateFindMyTubePublicApi() {
  window.findMyTubeApp = {
    version: "2026-03-22.4",
    assetVersion: "20260322d",
    normalizeForSearch,
    escapeHtml,
    getTestsByNames,
    getTubeGroups,
    getSelectedTestNames: getSelectedTestNamesList,
    getResolvedDrawPlan,
    estimateDrawPlanForTests,
    addTestsToPlan,
    removeTestsFromPlan,
    openDrawPlan: openDrawModal,
    prepareFindMyTestResultsView,
    setFindMyTestSuggestions,
    clearFindMyTestSuggestions: clearClinicalWorkupOutput
  };
}

updateFindMyTubePublicApi();
renderFactsCarousel();
initQuickToolsPanel();
initFactsPanel();
initSectionNavigation();
renderGroupChips();
refreshSearchPlaceholder();
bindEvents();
initSelectionCartViewportSync();
applyFilters();
updateSearchClearButton();
refreshSelectionUi({ rerenderCards: false });
