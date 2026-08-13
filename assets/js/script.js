// Provides the slide transition on browsers without native cross-document view transitions.
const supportsNativeWorkspaceTransitions = typeof document.startViewTransition === "function";
const workspaceNavigationTargets = {
  home: "./index.html",
  tube: "./find-my-tube.html",
  "find-my-test": "./index.html?tool=find-my-test",
  stock: "./order-stock.html",
  "stock-dashboard": "./stock-dashboard.html",
  "track-orders": "./track-orders.html"
};
let workspaceNavigationPending = false;

function navigateWithWorkspaceMotion(targetUrl) {
  if (!targetUrl || workspaceNavigationPending) return;

  const destination = new URL(targetUrl, window.location.href);
  if (destination.origin !== window.location.origin) {
    window.location.assign(destination.href);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (supportsNativeWorkspaceTransitions || prefersReducedMotion) {
    window.location.assign(destination.href);
    return;
  }

  workspaceNavigationPending = true;
  try {
    window.sessionStorage.setItem("fmt-workspace-arriving", "1");
  } catch {
    // Navigation remains functional when storage is unavailable.
  }
  document.documentElement.classList.add("fmt-workspace-leaving");
  window.setTimeout(() => window.location.assign(destination.href), 300);
}

if (!supportsNativeWorkspaceTransitions) {
  try {
    if (window.sessionStorage.getItem("fmt-workspace-arriving") === "1") {
      window.sessionStorage.removeItem("fmt-workspace-arriving");
      document.documentElement.classList.add("fmt-workspace-arriving");
      window.setTimeout(() => document.documentElement.classList.remove("fmt-workspace-arriving"), 500);
    }
  } catch {
    // The page can enter normally when storage is unavailable.
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const link = target.closest("a[href]");
    if (link && !link.hasAttribute("download") && (!link.target || link.target === "_self")) {
      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin === window.location.origin
        && `${destination.pathname}${destination.search}` !== `${window.location.pathname}${window.location.search}`
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateWithWorkspaceMotion(destination.href);
      }
      return;
    }

    const menuButton = target.closest("button[data-menu-action]");
    const menuAction = String(menuButton?.getAttribute("data-menu-action") || "").trim();
    const menuDestination = workspaceNavigationTargets[menuAction];
    if (!menuDestination) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateWithWorkspaceMotion(menuDestination);
  }, true);
}

// Cache shared DOM nodes once so the rest of the app can treat the page as one UI surface.
const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const headerIntroText = document.getElementById("headerIntroText");
const headerSettings = document.getElementById("headerSettings");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const siteMenuPanel = document.getElementById("siteMenuPanel");
const siteMenuLinks = document.querySelectorAll("[data-menu-action]");
const themeSettingsBtn = document.getElementById("themeSettingsBtn");
const themeSwitcherPanel = document.getElementById("themeSwitcherPanel");
const surfacePanelBackdrop = document.getElementById("surfacePanelBackdrop");
const themeModeButtons = document.querySelectorAll("[data-theme-mode]");
const homeHub = document.getElementById("homeHub");
const homeTipCard = document.querySelector(".home-tip-card");
const homeTipText = document.getElementById("homeTipText");
const homeRecentActivityList = document.getElementById("homeRecentActivityList");
const homeRecentEmpty = document.getElementById("homeRecentEmpty");
const homeStatusList = document.getElementById("homeStatusList");
const homeStatusTrackOrdersBtn = document.getElementById("homeStatusTrackOrdersBtn");
const heroDrawPlanBtn = document.getElementById("heroDrawPlanBtn");
const heroOrderStockBtn = document.getElementById("heroOrderStockBtn");
const tubeLookupPanel = document.getElementById("tubeLookupPanel");
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
const sectionBrowseModal = document.getElementById("sectionBrowseModal");
const sectionBrowseModalTitle = document.getElementById("sectionBrowseModalTitle");
const sectionBrowseModalCopy = document.getElementById("sectionBrowseModalCopy");
const sectionBrowseModalGrid = document.getElementById("sectionBrowseModalGrid");
const closeSectionBrowseModalBtn = document.getElementById("closeSectionBrowseModalBtn");
const stockOrderPanel = document.getElementById("stockOrderPanel");
const stockOrderForm = document.getElementById("stockOrderForm");
const stockOrderRequesterNameInput = document.getElementById("stockOrderRequesterNameInput");
const stockOrderRequesterSelect = document.getElementById("stockOrderRequesterSelect");
const stockOrderNoteInput = document.getElementById("stockOrderNoteInput");
const stockOrderGrid = document.getElementById("stockOrderGrid");
const stockOrderStatusBadge = document.getElementById("stockOrderStatusBadge");
const stockOrderRequestMeta = document.getElementById("stockOrderRequestMeta");
const stockOrderSummaryItems = document.getElementById("stockOrderSummaryItems");
const stockOrderRepeatWarning = document.getElementById("stockOrderRepeatWarning");
const stockOrderRepeatBadge = document.getElementById("stockOrderRepeatBadge");
const stockOrderRepeatMessage = document.getElementById("stockOrderRepeatMessage");
const stockOrderRepeatReasonWrap = document.getElementById("stockOrderRepeatReasonWrap");
const stockOrderRepeatReasonSelect = document.getElementById("stockOrderRepeatReasonSelect");
const stockOrderRepeatTrackLink = document.getElementById("stockOrderRepeatTrackLink");
const stockOrderRequestPreview = document.getElementById("stockOrderRequestPreview");
const submitStockOrderBtn = document.getElementById("submitStockOrderBtn");
const copyStockOrderBtn = document.getElementById("copyStockOrderBtn");
const shareStockOrderWhatsappBtn = document.getElementById("shareStockOrderWhatsappBtn");
const resetStockOrderBtn = document.getElementById("resetStockOrderBtn");
const refreshStockTrackingBtn = document.getElementById("refreshStockTrackingBtn");
const stockOrderTrackingMeta = document.getElementById("stockOrderTrackingMeta");
const stockOrderTrackingList = document.getElementById("stockOrderTrackingList");
const stockOrderSubmissionCard = document.getElementById("stockOrderSubmissionCard");
const stockOrderSubmissionRequestId = document.getElementById("stockOrderSubmissionRequestId");
const stockOrderSubmissionMessage = document.getElementById("stockOrderSubmissionMessage");
const stockOrderTrackOrderBtn = document.getElementById("stockOrderTrackOrderBtn");
const aboutPanel = document.getElementById("aboutPanel");
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
const contactFeedbackModal = document.getElementById("contactFeedbackModal");
const closeContactFeedbackBtn = document.getElementById("closeContactFeedbackBtn");
const legalDocButtons = document.querySelectorAll("[data-legal-doc]");
const SEARCH_PLACEHOLDER_BASE = "Search test or profile";
const SEARCH_PLACEHOLDER_HINT = `${SEARCH_PLACEHOLDER_BASE} (e.g. CRP or LFT)`;
const GOLD_VOLUME_PROFILE_NAMES = new Set([
  "U&E", // 1
  "Liver Function Tests (LFT)", // 2
  "CMP", // 3
  "CRP", // 4
  "Cardiac Profile", // 5
  "Lipid Profile / Lipogram", // 6
  "Fe Studies" // 9
]);
const GOLD_HORMONE_OR_ENZYME_NAME_HINTS = [
  "bhcg",
  "beta hcg",
  "free t4",
  "free t3",
  "tsh",
  "insulin",
  "prolactin",
  "progesterone",
  "estradiol",
  "cortisol",
  "testosterone",
  "shbg",
  "fsh",
  "lh",
  "17 oh progesterone",
  "amylase",
  "lipase",
  "alt",
  "ast",
  "ggt",
  "alp",
  "ck total",
  "ck mb"
];
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
let isThemePanelOpen = false;
let isSiteMenuOpen = false;
let selectionNoticeHideTimeoutId = 0;
let activeSectionBrowseModalSectionId = "";
let lastSectionBrowseModalTrigger = null;
const CONDITION_SHORTCUT_DISCLAIMER = "Common initial request shortcut only. Confirm with local protocol, senior review, and patient context.";
const CLINICAL_WORKUP_DISCLAIMER = "Reference-only test support. Confirm urgent, paediatric, transfusion, and site-specific requests with local protocol or senior review.";
const RACK_HINT_STORAGE_KEY = "fmt-rack-hint-dismissed";
const AUTO_EXPAND_CRITICAL_NOTE_TESTS = new Set(["Ammonia", "Blood Bank / Transfusion", "ACTH", "Plasma Homocysteine"]);
const selectedClinicalChipIds = new Set();
let hasDismissedRackHint = false;
let lastLegalModalTrigger = null;
let lastContactFeedbackTrigger = null;
let aboutInfoModal = null;
let closeAboutInfoModalBtn = null;
let aboutInfoLegalButtons = [];
let lastAboutInfoTrigger = null;
let clinicalWorkupOutput = null;
const stockOrderState = Object.create(null);
let stockOrderStatusMode = "draft";
let isSubmittingStockOrder = false;
let submittedStockOrderRecord = null;
let lastStockSubmitErrorMessage = "";
let hasLoadedStockTrackingOnce = false;
const stockTrackedRequestStatuses = Object.create(null);
const currentPageParams = new URLSearchParams(window.location.search);
const currentAppPage = currentPageParams.get("tool") === "find-my-test"
  ? "find-my-test"
  : (document.body.dataset.appPage || "home");
const initialSearchQuery = String(currentPageParams.get("q") || currentPageParams.get("search") || "")
  .trim()
  .slice(0, 120);
const isHomePage = currentAppPage === "home";
const isFindMyTubePage = currentAppPage === "find-my-tube";
const isFindMyTestPage = currentAppPage === "find-my-test";
const isStockOrderPage = currentAppPage === "stock-order";
const isStockDashboardPage = currentAppPage === "stock-dashboard";
const isTrackOrdersPage = currentAppPage === "track-orders";
const MENU_MAIN_ACTION_ORDER = ["home", "tube", "find-my-test", "draw", "stock", "stock-dashboard", "track-orders"];
const MENU_SECONDARY_ACTION_ORDER = ["settings", "about"];
const MENU_ACTION_ORDER = [...MENU_MAIN_ACTION_ORDER, ...MENU_SECONDARY_ACTION_ORDER];
const MENU_ACTION_ORDER_INDEX = MENU_ACTION_ORDER.reduce((acc, action, index) => {
  acc[action] = index;
  return acc;
}, Object.create(null));
const SITE_MENU_CLOSE_DURATION_MS = 190;
const MENU_ACTION_ICONS = Object.freeze({
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tube: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v8.6c0 1.7.9 3.3 2.4 4.2l.3.2a5 5 0 0 1 2.3 4.2V21H9v-.8a5 5 0 0 1 2.3-4.2l.3-.2A5 5 0 0 0 14 11.6V3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  "find-my-test": '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 11h10M9.5 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/></svg>',
  draw: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 16c4.5 0 4.5-8 9-8s4.5 8 9 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="16" r="1.4" stroke="currentColor" stroke-width="1.8"/><circle cx="13" cy="8" r="1.4" stroke="currentColor" stroke-width="1.8"/><circle cx="22" cy="16" r="1.4" stroke="currentColor" stroke-width="1.8"/></svg>',
  stock: '<svg viewBox="0 0 24 24" fill="none"><path d="M3.8 8.2 12 4l8.2 4.2M3.8 8.2V16L12 20l8.2-4V8.2M3.8 8.2 12 12.4m8.2-4.2L12 12.4m0 0V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  "stock-dashboard": '<svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16M6 9h5v8H6zM14 9h4v3h-4zM14 15h4v2h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  "track-orders": '<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h10v8H5zM15 10h3.5l2 2.4V15H15zM7.5 18a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM17.5 18a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 13.2v-2.4l2-.7.6-1.4-.9-1.9 1.7-1.7 1.9.9 1.4-.6.7-2h2.4l.7 2 1.4.6 1.9-.9 1.7 1.7-.9 1.9.6 1.4 2 .7v2.4l-2 .7-.6 1.4.9 1.9-1.7 1.7-1.9-.9-1.4.6-.7 2h-2.4l-.7-2-1.4-.6-1.9.9-1.7-1.7.9-1.9-.6-1.4-2-.7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
});
const MENU_ACTION_META = Object.freeze({
  home: "Start screen and quick actions",
  tube: "Match tests to tube colours",
  "find-my-test": "Symptoms and signs to suggested tests",
  draw: "Review selected tubes before collection",
  stock: "Request tubes and consumables",
  "stock-dashboard": "Manage requests and stock levels",
  "track-orders": "Check active request status",
  settings: "Theme and display preferences",
  about: "Reference use and app information"
});
const MOBILE_BOTTOM_NAV_BREAKPOINT = 860;
const MOBILE_BOTTOM_NAV_HIDE_MIN_SCROLL_Y = 88;
const MOBILE_BOTTOM_NAV_HIDE_SCROLL_DELTA = 54;
const MOBILE_BOTTOM_NAV_SHOW_SCROLL_DELTA = 24;
const MOBILE_BOTTOM_NAV_DEADZONE = 4;
const MOBILE_BOTTOM_NAV_PAGES = new Set(["home", "find-my-tube", "find-my-test", "stock-order", "stock-dashboard", "track-orders"]);
const MOBILE_BOTTOM_NAV_KEY_BY_MENU_ACTION = Object.freeze({
  home: "home",
  tube: "tube",
  "find-my-test": "test",
  stock: "order",
  "stock-dashboard": "order",
  "track-orders": "order"
});
const MOBILE_BOTTOM_MENU_CLOSE_DURATION_MS = 420;
const HOME_STATUS_MAX_ITEMS = 3;
const sharedPlanToken = currentPageParams.get("plan") || "";
const APP_HOME_TITLE = "Find My Tube | Specimen Tubes, Find My Test, and Collection Guidance";
const FIND_MY_TUBE_PAGE_TITLE = "Find My Tube | Match Lab Tests to the Correct Collection Tube";
const FIND_MY_TEST_PAGE_TITLE = "Find My Test | Suggested Tests from Symptoms, Signs, and Clinical Concerns";
const STOCK_ORDER_PAGE_TITLE = "Order My Stock | Find My Tube";
const STOCK_DASHBOARD_PAGE_TITLE = "Stock Dashboard | Find My Tube";
const TRACK_ORDERS_PAGE_TITLE = "Track Lab Orders | Find My Tube";
const APP_HOME_APP_TITLE = "Find My Tube";
const FIND_MY_TUBE_APP_TITLE = "Find My Tube";
const FIND_MY_TEST_APP_TITLE = "Find My Test";
const STOCK_ORDER_APP_TITLE = "Order My Stock";
const STOCK_DASHBOARD_APP_TITLE = "Stock Dashboard";
const TRACK_ORDERS_APP_TITLE = "Track Orders";
const APP_HOME_HEADER_COPY = "The right tube. The right test. Right now.";
const FIND_MY_TUBE_HEADER_COPY = "The right tube. The right test. Right now.";
const FIND_MY_TEST_HEADER_COPY = "Symptoms, signs, and clinical concern to suggested tests and Tube Plan. Do not enter patient identifiers.";
const STOCK_ORDER_HEADER_COPY = "Consumables, stock requests, and order status.";
const STOCK_DASHBOARD_HEADER_COPY = "Local request dashboard, status tracking, and quick stats.";
const TRACK_ORDERS_HEADER_COPY = "Track stock request status by ward, status, and requester.";
const DRAW_PLAN_SHARE_PARAM = "plan";
const STOCK_ORDER_HOME_URL = "./order-stock.html";
const STOCK_DASHBOARD_URL = "./stock-dashboard.html";
const TRACK_ORDERS_URL = "./track-orders.html";
const HOME_RECENT_ACTIVITY_KEY = "fmt-home-recent-activity";
const HOME_RECENT_ACTIVITY_MAX_ITEMS = 3;
const THEME_STORAGE_KEY = "fmt-theme-mode";
const THEME_COLOR_BY_MODE = {
  light: "#0f766e",
  neutral: "#6b7c7a",
  dark: "#122028"
};
const appleMobileAppTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const appleMobileStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
const ALLOWED_THEME_MODES = new Set(["light", "neutral", "dark"]);
let currentTheme = ALLOWED_THEME_MODES.has(document.documentElement.dataset.theme)
  ? document.documentElement.dataset.theme
  : "neutral";
let mobileBottomNav = null;
let mobileBottomNavButtons = Object.create(null);
let mobileBottomNavLastScrollY = 0;
let mobileBottomNavDownDistance = 0;
let mobileBottomNavUpDistance = 0;
let mobileBottomNavIsHidden = false;
let mobileBottomMenuSheet = null;
let mobileBottomMenuBackdrop = null;
let mobileBottomMenuOpen = false;
let mobileBottomMenuOriginX = 0;
let mobileBottomMenuOriginY = 0;
let mobileBottomMenuCloseTimeoutId = 0;
let siteMenuCloseTimeoutId = 0;
let homeDashboardStockSnapshot = null;
let homeRecentTestSearchTimer = 0;
const STOCK_API_CONFIGURED_BASE_URL = typeof window !== "undefined"
  ? String(window.FMT_APP_CONFIG?.stockApiBaseUrl || "").trim()
  : "";
const STOCK_API_CONFIGURED_SUBMIT_URL = typeof window !== "undefined"
  ? String(window.FMT_APP_CONFIG?.stockOrderSubmitUrl || "").trim()
  : "";

// Resolves the local stock API origin for both direct backend use and static preview ports.
function getStockApiBaseUrl() {
  if (typeof window === "undefined") return "";

  if (STOCK_API_CONFIGURED_BASE_URL) {
    return STOCK_API_CONFIGURED_BASE_URL.replace(/\/+$/g, "");
  }

  const currentOrigin = window.location.origin || "";
  const currentHostname = window.location.hostname || "";
  const currentPort = window.location.port || "";
  const isLikelyLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(currentHostname)
    || currentHostname.endsWith(".local")
    || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(currentHostname);

  if (!isLikelyLocalHost) {
    return currentOrigin;
  }

  // For local runs, use the same origin as the page by default.
  if (currentPort) {
    return currentOrigin;
  }

  return `${window.location.protocol}//${currentHostname}:3000`;
}

function buildStockApiUrl(path) {
  const safePath = String(path || "").startsWith("/") ? path : `/${String(path || "")}`;
  return `${getStockApiBaseUrl()}${safePath}`;
}

const STOCK_ORDER_SUBMIT_URL = typeof window !== "undefined"
  ? String(STOCK_API_CONFIGURED_SUBMIT_URL || buildStockApiUrl("/api/stock-requests")).trim()
  : "";
const STOCK_ORDER_TRACKING_URL = buildStockApiUrl("/api/stock-requests?limit=2");
const STOCK_ORDER_DUPLICATE_CHECK_URL = buildStockApiUrl("/api/stock-requests?limit=100&includeArchived=true&includeCancelled=true");
const STOCK_ORDER_INVENTORY_URL = buildStockApiUrl("/api/stock-inventory");
const STOCK_LOW_STOCK_DEFAULT_THRESHOLD = 5;
const stockOrderInventoryByKey = new Map();
let stockOrderRecentRequestsForChecks = [];

function stockRequestsNeedConfiguredBackend() {
  if (typeof window === "undefined") return false;
  if (STOCK_API_CONFIGURED_BASE_URL || STOCK_API_CONFIGURED_SUBMIT_URL) return false;

  const hostname = window.location.hostname || "";
  const port = window.location.port || "";
  const isLikelyLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname)
    || hostname.endsWith(".local")
    || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);

  return !isLikelyLocalHost && port !== "3000";
}

function getStockSubmitBlockedReason() {
  if (stockRequestsNeedConfiguredBackend()) {
    return "Live stock submit needs the local backend on localhost:3000 or a configured stockApiBaseUrl.";
  }
  if (!stockOrderRequesterSelect) return "";

  const selectedItems = typeof getSelectedStockConsumables === "function" ? getSelectedStockConsumables() : [];
  const repeatAnalysis = typeof analyzeStockRepeatRequest === "function"
    ? analyzeStockRepeatRequest({
      wardUnit: String(stockOrderRequesterSelect.value || "").trim(),
      items: selectedItems.map((item) => ({
        ...item,
        inventoryUnits: typeof getStockInventoryUnits === "function" ? getStockInventoryUnits(item) : Number(item?.inventoryUnits || 0)
      }))
    })
    : { activeBlock: null, recentWarnings: [] };
  if (repeatAnalysis.activeBlock) return "Already ordered for this ward. Please check Track Orders before requesting more.";
  if (repeatAnalysis.recentWarnings.length && !getStockRepeatOverrideReason()) {
    return "Stock was received within the last 48 hours. Please give a reason if more stock is genuinely needed.";
  }
  return "";
}

// Updates theme meta.
function updateThemeMeta(theme) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", THEME_COLOR_BY_MODE[theme] || THEME_COLOR_BY_MODE.light);
  }

  if (appleMobileStatusBarMeta) {
    appleMobileStatusBarMeta.setAttribute("content", theme === "dark" ? "black-translucent" : "default");
  }
}

// Updates theme switcher state.
function updateThemeSwitcherState() {
  themeModeButtons.forEach((button) => {
    const mode = button.getAttribute("data-theme-mode") || "";
    const isActive = mode === currentTheme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// Sets theme panel open state.
function setThemePanelOpen(isOpen) {
  isThemePanelOpen = Boolean(isOpen);
  if (themeSwitcherPanel) {
    themeSwitcherPanel.hidden = !isThemePanelOpen;
  }
  if (themeSettingsBtn) {
    themeSettingsBtn.setAttribute("aria-expanded", isThemePanelOpen ? "true" : "false");
    themeSettingsBtn.classList.toggle("active", isThemePanelOpen);
  }
  syncSurfacePanelState();
  updateMenuActiveState();
}

// Sets site menu open state.
function setSiteMenuOpen(isOpen) {
  if (Boolean(isOpen) && shouldShowMobileBottomNav() && isMobileBottomNavViewport()) {
    setMobileBottomMenuOpen(true);
    return;
  }
  const nextOpen = Boolean(isOpen);
  isSiteMenuOpen = nextOpen;

  window.clearTimeout(siteMenuCloseTimeoutId);
  siteMenuCloseTimeoutId = 0;

  if (siteMenuPanel) {
    if (nextOpen) {
      siteMenuPanel.hidden = false;
      siteMenuPanel.classList.remove("is-closing");
      window.requestAnimationFrame(() => {
        siteMenuPanel?.classList.add("is-open");
      });
    } else {
      siteMenuPanel.classList.remove("is-open");
      if (!siteMenuPanel.hidden) {
        siteMenuPanel.classList.add("is-closing");
        siteMenuCloseTimeoutId = window.setTimeout(() => {
          if (siteMenuPanel) {
            siteMenuPanel.hidden = true;
            siteMenuPanel.classList.remove("is-closing");
          }
          siteMenuCloseTimeoutId = 0;
        }, SITE_MENU_CLOSE_DURATION_MS);
      }
    }
  }
  if (menuToggleBtn) {
    menuToggleBtn.setAttribute("aria-expanded", isSiteMenuOpen ? "true" : "false");
    menuToggleBtn.setAttribute("aria-label", isSiteMenuOpen ? "Close menu" : "Open menu");
    menuToggleBtn.classList.toggle("active", isSiteMenuOpen);
  }
  syncSurfacePanelState();
  updateMenuActiveState();
}

function normalizeMenuAction(action) {
  const safeAction = String(action || "").trim();
  if (safeAction === "start-draw") return "draw";
  return safeAction;
}

function getMenuActionIconSvg(action) {
  return MENU_ACTION_ICONS[normalizeMenuAction(action)] || MENU_ACTION_ICONS.home;
}

function enhanceMenuButton(button, actionAttribute) {
  if (!(button instanceof HTMLElement) || button.dataset.menuEnhanced === "true") return;
  const action = normalizeMenuAction(button.getAttribute(actionAttribute));
  const label = String(button.textContent || "").trim();
  const meta = MENU_ACTION_META[action] || "";
  button.dataset.menuEnhanced = "true";
  button.innerHTML = `
    <span class="menu-action-icon" aria-hidden="true">${getMenuActionIconSvg(action)}</span>
    <span class="menu-action-copy">
      <span class="menu-action-label">${label}</span>
      ${meta ? `<span class="menu-action-meta">${meta}</span>` : ""}
    </span>
  `;
}

function getCurrentPageMenuAction() {
  if (isThemePanelOpen) return "settings";
  if (isTrackOrdersPage) return "track-orders";
  if (isStockDashboardPage) return "stock-dashboard";
  if (isStockOrderPage) return "stock";
  if (isFindMyTestPage) return "find-my-test";
  if (isFindMyTubePage) return "tube";
  return "home";
}

function updateMenuActiveState() {
  const activeAction = getCurrentPageMenuAction();

  const headerMenuButtons = siteMenuPanel
    ? Array.from(siteMenuPanel.querySelectorAll(".site-menu-link[data-menu-action]"))
    : [];
  headerMenuButtons.forEach((button) => {
    const action = normalizeMenuAction(button.getAttribute("data-menu-action"));
    const isActive = action === activeAction;
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-secondary", MENU_SECONDARY_ACTION_ORDER.includes(action));
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (!mobileBottomMenuSheet) return;
  const mobileMenuButtons = Array.from(mobileBottomMenuSheet.querySelectorAll(".mobile-bottom-menu-item[data-mobile-menu-action]"));
  mobileMenuButtons.forEach((button) => {
    const action = normalizeMenuAction(button.getAttribute("data-mobile-menu-action"));
    const isActive = action === activeAction;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function enhanceSiteMenuStructure() {
  if (!siteMenuPanel) return;
  const siteMenuList = siteMenuPanel.querySelector(".site-menu-list");
  if (!(siteMenuList instanceof HTMLElement)) return;

  const buttons = Array.from(siteMenuList.querySelectorAll(".site-menu-link[data-menu-action]"));
  if (!buttons.length) return;

  buttons.sort((a, b) => {
    const actionA = normalizeMenuAction(a.getAttribute("data-menu-action"));
    const actionB = normalizeMenuAction(b.getAttribute("data-menu-action"));
    const indexA = Number.isInteger(MENU_ACTION_ORDER_INDEX[actionA]) ? MENU_ACTION_ORDER_INDEX[actionA] : 999;
    const indexB = Number.isInteger(MENU_ACTION_ORDER_INDEX[actionB]) ? MENU_ACTION_ORDER_INDEX[actionB] : 999;
    return indexA - indexB;
  });

  const mainButtons = [];
  const secondaryButtons = [];
  buttons.forEach((button) => {
    const action = normalizeMenuAction(button.getAttribute("data-menu-action"));
    enhanceMenuButton(button, "data-menu-action");
    if (MENU_SECONDARY_ACTION_ORDER.includes(action)) {
      button.dataset.menuGroup = "secondary";
      secondaryButtons.push(button);
      return;
    }
    button.dataset.menuGroup = "main";
    mainButtons.push(button);
  });

  siteMenuList.innerHTML = "";

  const mainGroup = document.createElement("div");
  mainGroup.className = "site-menu-group";
  mainGroup.dataset.group = "main";
  mainGroup.setAttribute("role", "none");
  mainGroup.innerHTML = '<p class="site-menu-group-title" role="presentation">Main Navigation</p>';
  mainButtons.forEach((button) => mainGroup.appendChild(button));
  siteMenuList.appendChild(mainGroup);

  if (secondaryButtons.length) {
    const secondaryGroup = document.createElement("div");
    secondaryGroup.className = "site-menu-group";
    secondaryGroup.dataset.group = "secondary";
    secondaryGroup.setAttribute("role", "none");
    secondaryGroup.innerHTML = '<p class="site-menu-group-title" role="presentation">Secondary</p>';
    secondaryButtons.forEach((button) => secondaryGroup.appendChild(button));
    siteMenuList.appendChild(secondaryGroup);
  }

  [...mainButtons, ...secondaryButtons].forEach((button, index) => {
    button.style.setProperty("--menu-item-index", String(index));
  });
}

// Synchronizes the shared surface-panel backdrop.
function syncSurfacePanelState() {
  const hasSurfacePanelOpen = isThemePanelOpen || isSiteMenuOpen;
  if (surfacePanelBackdrop) {
    surfacePanelBackdrop.hidden = !hasSurfacePanelOpen;
  }
  document.body.classList.toggle("surface-panel-open", hasSurfacePanelOpen);
}

// Applies theme.
function applyTheme(theme) {
  currentTheme = ALLOWED_THEME_MODES.has(theme) ? theme : "neutral";
  document.documentElement.dataset.theme = currentTheme;
  updateThemeMeta(currentTheme);
  updateThemeSwitcherState();
}

// Initializes theme.
function initTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  applyTheme(ALLOWED_THEME_MODES.has(storedTheme) ? storedTheme : currentTheme);
  setThemePanelOpen(false);

  themeModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = button.getAttribute("data-theme-mode") || "neutral";
      applyTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      setThemePanelOpen(false);
    });
  });

  if (themeSettingsBtn) {
    themeSettingsBtn.addEventListener("click", () => {
      setSiteMenuOpen(false);
      setThemePanelOpen(!isThemePanelOpen);
    });
  }

  document.addEventListener("click", (event) => {
    if (!isThemePanelOpen || !headerSettings) return;
    if (headerSettings.contains(event.target)) return;
    setThemePanelOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isThemePanelOpen) return;
    setThemePanelOpen(false);
    themeSettingsBtn?.focus();
  });
}

document.body.classList.toggle("find-my-test-page", isFindMyTestPage);
document.body.classList.toggle("find-my-tube-page", isFindMyTubePage);
document.body.classList.toggle("stock-order-page", isStockOrderPage);
document.title = isFindMyTestPage
  ? FIND_MY_TEST_PAGE_TITLE
  : isFindMyTubePage
    ? FIND_MY_TUBE_PAGE_TITLE
    : isStockOrderPage
      ? STOCK_ORDER_PAGE_TITLE
      : isStockDashboardPage
        ? STOCK_DASHBOARD_PAGE_TITLE
        : isTrackOrdersPage
          ? TRACK_ORDERS_PAGE_TITLE
          : APP_HOME_TITLE;
if (headerIntroText) {
  headerIntroText.textContent = isFindMyTestPage
    ? FIND_MY_TEST_HEADER_COPY
    : isFindMyTubePage
      ? FIND_MY_TUBE_HEADER_COPY
      : isStockOrderPage
        ? STOCK_ORDER_HEADER_COPY
        : isStockDashboardPage
          ? STOCK_DASHBOARD_HEADER_COPY
          : isTrackOrdersPage
            ? TRACK_ORDERS_HEADER_COPY
            : APP_HOME_HEADER_COPY;
}
if (appleMobileAppTitleMeta) {
  appleMobileAppTitleMeta.setAttribute(
    "content",
    isFindMyTestPage
      ? FIND_MY_TEST_APP_TITLE
      : isFindMyTubePage
        ? FIND_MY_TUBE_APP_TITLE
        : isStockOrderPage
          ? STOCK_ORDER_APP_TITLE
          : isStockDashboardPage
            ? STOCK_DASHBOARD_APP_TITLE
            : isTrackOrdersPage
              ? TRACK_ORDERS_APP_TITLE
              : APP_HOME_APP_TITLE
  );
}

if (isFindMyTubePage && searchInput && initialSearchQuery) {
  searchInput.value = initialSearchQuery;
}

// Dispatches find my tube event.
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

// Sets results info.
function setResultsInfo(text) {
  if (!resultsInfo) return;
  const message = String(text || "");
  resultsInfo.textContent = message;
  resultsInfo.hidden = message.length === 0;
  updateResultsToolbar();
}

// Updates results toolbar.
function updateResultsToolbar() {
  if (!resultsToolbar) return;

  const hasMessage = Boolean(resultsInfo && !resultsInfo.hidden);
  resultsToolbar.hidden = !hasMessage;
  updateBackToTopVisibility();
}

// Updates back to top visibility.
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

// Encodes bytes to base64url.
function bytesToBase64Url(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// Decodes base64url to string.
function base64UrlToString(value) {
  if (!value) return "";
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return window.atob(padded);
}

// Encodes a share plan token from selected names.
function encodeDrawPlanShareToken(testNames = []) {
  const names = Array.from(new Set(testNames.map((name) => String(name || "").trim()).filter(Boolean)));
  if (!names.length) return "";
  const json = JSON.stringify(names);
  return bytesToBase64Url(new TextEncoder().encode(json));
}

// Decodes a share plan token into valid test names.
function decodeDrawPlanShareToken(token = "") {
  if (!token) return [];

  try {
    const decodedText = new TextDecoder().decode(Uint8Array.from(base64UrlToString(token), (char) => char.charCodeAt(0)));
    const parsed = JSON.parse(decodedText);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((name) => String(name || "").trim())
      .filter((name) => name && enrichedTests.some((test) => test.name === name));
  } catch {
    return [];
  }
}

// Builds a shareable draw plan URL.
function getDrawPlanShareUrl(testNames = getSelectedTestNamesList()) {
  const shareToken = encodeDrawPlanShareToken(testNames);
  const url = new URL(window.location.pathname, window.location.origin);
  if (shareToken) {
    url.searchParams.set(DRAW_PLAN_SHARE_PARAM, shareToken);
  }
  return url.toString();
}

// Loads a shared draw plan from URL.
function loadSharedDrawPlanFromUrl() {
  if (!sharedPlanToken || isFindMyTestPage) return;

  const sharedTestNames = decodeDrawPlanShareToken(sharedPlanToken);
  if (!sharedTestNames.length) return;

  setSelectedTests(new Set(sharedTestNames), { rerenderCards: false });
  window.requestAnimationFrame(() => {
    openDrawModal();
    showSelectionNotice("Shared Tube Plan loaded.");
  });
}

// Checks whether renderable element.
function isRenderableElement(element) {
  if (!element || element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Gets add to plan animation target.
function getAddToPlanAnimationTarget() {
  if (isRenderableElement(selectionCartBar)) return selectionCartBar;
  if (isRenderableElement(openDrawPlannerBtn)) return openDrawPlannerBtn;
  return null;
}

// Pulses plan target.
function pulsePlanTarget(target) {
  if (!target) return;
  target.classList.remove("plan-target-catch");
  void target.offsetWidth;
  target.classList.add("plan-target-catch");
  target.addEventListener("animationend", () => {
    target.classList.remove("plan-target-catch");
  }, { once: true });
}

// Gets plan animation tube group.
function getPlanAnimationTubeGroup(tubeColorValue) {
  return getTubeGroups(tubeColorValue)[0] || "";
}

// Animates add to plan feedback.
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

// Dismisses rack hint.
function dismissRackHint() {
  if (hasDismissedRackHint) return;
  hasDismissedRackHint = true;
  try {
    localStorage.setItem(RACK_HINT_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures and continue without persistence.
  }
}

// Gets history state for section.
function getHistoryStateForSection(sectionId = "") {
  if (sectionId && sectionMeta[sectionId]) {
    const browseId = getActiveBrowseGroup(sectionId);
    return { view: "section", section: sectionId, browse: browseId };
  }

  return { view: "home" };
}

// Synchronizes history state.
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

// Updates search clear button.
function updateSearchClearButton() {
  if (!searchInput || !searchClearBtn) return;
  const hasQuery = searchInput.value.trim().length > 0;
  searchClearBtn.hidden = !hasQuery;
}

// Refreshes search placeholder.
function refreshSearchPlaceholder() {
  if (!searchInput) return;
  if (searchInput.value.trim()) return;
  searchInput.placeholder = document.activeElement === searchInput
    ? SEARCH_PLACEHOLDER_BASE
    : SEARCH_PLACEHOLDER_HINT;
}

// Scrolls home viewport to top.
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

// Gets the dedicated Find My Tube page URL.
function getFindMyTubePageUrl() {
  return "./find-my-tube.html";
}

// Scrolls a specific panel into view.
function scrollPanelIntoView(panel) {
  if (!panel) return;

  panel.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  });
}

// Opens home lookup view.
function openLookupHomeView() {
  if (isHomePage || isFindMyTestPage) {
    window.location.assign(getFindMyTubePageUrl());
    return;
  }

  if (!isFindMyTubePage || !tubeLookupPanel || tubeLookupPanel.hidden) {
    window.location.assign(getFindMyTubePageUrl());
    return;
  }

  closeDrawModal();
  closeProfileModal();
  closeAboutInfoModal({ restoreFocus: false });
  closeLegalModal({ restoreFocus: false });
  scrollPanelIntoView(tubeLookupPanel || preSearchPanel);
  focusMainSearchField({ scroll: "if-needed" });
  setMobileBottomNavActiveState();
}

// Opens stock section.
function openStockSection() {
  if (!isStockOrderPage) {
    window.location.assign(STOCK_ORDER_HOME_URL);
    return;
  }

  if (!stockOrderPanel || stockOrderPanel.hidden) {
    window.location.assign(STOCK_ORDER_HOME_URL);
    return;
  }

  closeDrawModal();
  closeProfileModal();
  closeLegalModal({ restoreFocus: false });
  scrollPanelIntoView(stockOrderPanel);
  setMobileBottomNavActiveState();
}

// Opens the stock dashboard page.
function openStockDashboard() {
  window.location.assign(STOCK_DASHBOARD_URL);
}

function openTrackOrders(params = {}) {
  const url = new URL(TRACK_ORDERS_URL, window.location.href);
  Object.entries(params || {}).forEach(([key, value]) => {
    const safeValue = String(value || "").trim();
    if (!safeValue) return;
    url.searchParams.set(key, safeValue);
  });
  window.location.assign(url.pathname + url.search);
}

// Formats a stock request timestamp for the tracking list.
function formatStockRequestDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatStockRequestDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium"
  }).format(date);
}

// Normalizes legacy stock request statuses to the current UI model.
function normalizeStockRequestStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "completed";
  if (safeStatus === "received" || safeStatus === "submitted") return "pending";
  if (safeStatus === "processing" || safeStatus === "in-progress") return "packed";
  if (safeStatus === "no_stock" || safeStatus === "no stock" || safeStatus === "out-of-stock" || safeStatus === "out of stock") return "no-stock";
  return safeStatus || "pending";
}

function formatStockRequestStatusLabel(status) {
  const normalizedStatus = normalizeStockRequestStatus(status);
  if (normalizedStatus === "pending") return "Pending";
  if (normalizedStatus === "packed") return "Packed";
  if (normalizedStatus === "ready") return "Ready";
  if (normalizedStatus === "collected") return "Collected";
  if (normalizedStatus === "completed") return "Completed";
  if (normalizedStatus === "no-stock") return "No Stock";
  if (normalizedStatus === "cancelled") return "Cancelled";
  return normalizedStatus.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Keeps local tracking state in sync without blocking the visible request list.
function syncTrackedStockRequestStatuses(requests) {
  if (!Array.isArray(requests)) return;

  requests.forEach((request) => {
    const requestId = String(request?.id || "").trim();
    if (!requestId) return;
    stockTrackedRequestStatuses[requestId] = normalizeStockRequestStatus(request?.status);
  });
  hasLoadedStockTrackingOnce = true;
}

const stockBloodCultureBottleMetaById = Object.freeze({
  "blood-culture-bottle-aerobic": Object.freeze({
    displayName: "Aerobic Blood Culture Bottle (Blue)",
    accentColor: "#2563eb",
    accentSoftColor: "#dbeafe"
  }),
  "blood-culture-bottle-anaerobic": Object.freeze({
    displayName: "Anaerobic Blood Culture Bottle (Orange)",
    accentColor: "#f97316",
    accentSoftColor: "#ffedd5"
  }),
  "blood-culture-bottle-paediatric-aerobic": Object.freeze({
    displayName: "Paediatric Aerobic Blood Culture Bottle (Yellow)",
    accentColor: "#eab308",
    accentSoftColor: "#fef9c3"
  }),
  "blood-culture-bottle-mycobacterial-tb": Object.freeze({
    displayName: "Mycobacterial Blood Culture Bottle (Red)",
    accentColor: "#dc2626",
    accentSoftColor: "#fee2e2"
  }),
  "blood-culture-bottle-fungal-mycology": Object.freeze({
    displayName: "Fungal / Mycology Blood Culture Bottle (Green)",
    accentColor: "#16a34a",
    accentSoftColor: "#dcfce7"
  })
});

const stockBloodCultureBottleIdByLegacyLabel = Object.freeze({
  "blood culture bottle - aerobic": "blood-culture-bottle-aerobic",
  "blood culture bottle - anaerobic": "blood-culture-bottle-anaerobic",
  "blood culture bottle - paediatric aerobic": "blood-culture-bottle-paediatric-aerobic",
  "blood culture bottle - mycobacterial / tb": "blood-culture-bottle-mycobacterial-tb",
  "blood culture bottle - fungal / mycology": "blood-culture-bottle-fungal-mycology",
  "aerobic blood culture bottle (blue)": "blood-culture-bottle-aerobic",
  "anaerobic blood culture bottle (orange)": "blood-culture-bottle-anaerobic",
  "paediatric aerobic blood culture bottle (yellow)": "blood-culture-bottle-paediatric-aerobic",
  "mycobacterial blood culture bottle (red)": "blood-culture-bottle-mycobacterial-tb",
  "fungal / mycology blood culture bottle (green)": "blood-culture-bottle-fungal-mycology"
});

function normalizeStockLabelKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getBloodCultureBottleMetadata(itemOrId) {
  const safeId = typeof itemOrId === "string"
    ? String(itemOrId || "").trim()
    : String(itemOrId?.id || "").trim();

  if (safeId && stockBloodCultureBottleMetaById[safeId]) {
    return stockBloodCultureBottleMetaById[safeId];
  }

  const safeLabel = typeof itemOrId === "string"
    ? ""
    : normalizeStockLabelKey(itemOrId?.label);
  const mappedId = safeLabel ? stockBloodCultureBottleIdByLegacyLabel[safeLabel] : "";
  return mappedId ? stockBloodCultureBottleMetaById[mappedId] || null : null;
}

function isBloodCultureBottleItem(itemOrId) {
  return Boolean(getBloodCultureBottleMetadata(itemOrId));
}

function getBloodCultureBottleGlyphSvg() {
  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M9 3.5h6" />
      <path d="M10 3.5v3.2l-1.9 2.1v8.3a2.4 2.4 0 0 0 2.4 2.4h3a2.4 2.4 0 0 0 2.4-2.4V8.8L14 6.7V3.5" />
      <path d="M8.1 9.4h7.8" />
      <path d="M8.8 12.9h6.4" />
    </svg>
  `;
}

function getStockTubeGroup(item) {
  const safeId = String(item?.id || "").trim().toLowerCase();
  const safeLabel = String(item?.label || "").trim().toLowerCase();
  const safeSheetKey = String(item?.sheetColumnKey || "").trim().toLowerCase();

  if (
    safeId.startsWith("yellow-")
    || safeId.includes("paediatric-yellow")
    || safeLabel.includes("yellow")
    || safeSheetKey.includes("yellow")
  ) return "Gold/Yellow";
  if (
    safeId.startsWith("grey-")
    || safeId.includes("paediatric-grey")
    || safeLabel.includes("grey")
    || safeLabel.includes("fluoride")
    || safeSheetKey.includes("grey")
  ) return "Gray";
  if (
    safeId.startsWith("purple-")
    || safeId.includes("paediatric-purple")
    || safeLabel.includes("purple")
    || safeLabel.includes("edta")
    || safeSheetKey.includes("purple")
  ) return "Purple";
  if (
    safeId.startsWith("green-")
    || safeLabel.includes("green")
    || safeLabel.includes("heparin")
    || safeSheetKey.includes("green")
  ) return "Green";
  if (
    safeId.startsWith("blue-")
    || safeLabel.includes("blue")
    || safeLabel.includes("citrate")
    || safeSheetKey.includes("blue")
  ) return "Blue";
  if (
    safeId.startsWith("pearl-")
    || safeLabel.includes("pearl")
    || safeSheetKey.includes("pearl")
  ) return "Pearl/White";
  if (
    safeId.startsWith("tan-")
    || safeLabel.includes("tan")
    || safeSheetKey.includes("tan")
  ) return "Tan";
  if (
    safeId.startsWith("pink-")
    || safeLabel.includes("pink")
    || safeSheetKey.includes("pink")
  ) return "Pink";

  return "";
}

function toConsistentNameCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment
      .split(/([-'])/)
      .map((part) => {
        if (part === "-" || part === "'") return part;
        const lower = part.toLowerCase();
        return lower ? `${lower.charAt(0).toUpperCase()}${lower.slice(1)}` : "";
      })
      .join(""))
    .join(" ");
}

function formatRequesterName(value) {
  const safeValue = String(value || "").trim().replace(/\s+/g, " ");
  if (!safeValue) return "";

  const parts = safeValue.split(" ").filter(Boolean);
  if (parts.length === 1) return toConsistentNameCase(parts[0]);

  const rank = toConsistentNameCase(parts[0]);
  const initials = parts.slice(1, -1)
    .map((part) => {
      const safePart = String(part || "").trim();
      if (!safePart) return "";
      if (/^[A-Za-z]\.$/.test(safePart)) return `${safePart.charAt(0).toUpperCase()}.`;
      if (/^[A-Za-z]{1,3}$/.test(safePart)) return safePart.toUpperCase();
      return toConsistentNameCase(safePart);
    })
    .filter(Boolean)
    .join(" ");
  const surname = toConsistentNameCase(parts[parts.length - 1]);
  return [rank, initials, surname].filter(Boolean).join(" ").trim();
}

function getStockItemGlyphMarkup(item, options = {}) {
  const meta = getBloodCultureBottleMetadata(item);
  const glyphClassName = String(options.glyphClassName || "").trim();
  const classSuffix = glyphClassName ? ` ${glyphClassName}` : "";

  if (meta) {
    const safeAccentColor = escapeHtml(meta.accentColor || "#2563eb");
    const safeAccentSoft = escapeHtml(meta.accentSoftColor || "#dbeafe");

    return `
      <span class="stock-item-glyph stock-item-glyph-blood-culture${classSuffix}" style="--stock-item-glyph-color:${safeAccentColor};--stock-item-glyph-bg:${safeAccentSoft};" aria-hidden="true">
        ${getBloodCultureBottleGlyphSvg()}
      </span>
    `;
  }

  const tubeGroup = getStockTubeGroup(item);
  if (!tubeGroup) return "";
  const tubeColor = escapeHtml(getTubeSwatchColor(tubeGroup));

  return `
    <span class="stock-item-glyph stock-item-glyph-tube${classSuffix}" style="--stock-item-glyph-color:${tubeColor};" aria-hidden="true">
      ${getTubeVisualMarkup(tubeGroup, " tube-icon-mini")}
    </span>
  `;
}

function getStockDisplayLabelMarkup(item, label, options = {}) {
  const safeLabel = escapeHtml(label || "Stock item");
  const glyphMarkup = getStockItemGlyphMarkup(item, options);
  if (!glyphMarkup) return safeLabel;

  const wrapperClassName = String(options.wrapperClassName || "").trim();
  const classSuffix = wrapperClassName ? ` ${wrapperClassName}` : "";
  return `<span class="stock-item-title-row${classSuffix}">${glyphMarkup}<span>${safeLabel}</span></span>`;
}

// Gets a consistent stock item label for cards, summaries, and payload previews.
function getStockDisplayLabel(item) {
  const bloodCultureMeta = getBloodCultureBottleMetadata(item);
  const label = String(bloodCultureMeta?.displayName || item?.label || "").trim();
  const variantLabel = String(item?.variantLabel || "").trim();
  if (label && variantLabel) return `${label} - ${variantLabel}`;
  return label || "Stock item";
}

function getStockInventoryKeyForItem(item) {
  return String(item?.sheetColumnKey || item?.id || item?.label || "").trim();
}

function getStockLowStockThreshold(item = null) {
  const explicit = Number(item?.lowStockThreshold);
  return Number.isFinite(explicit) && explicit > 0
    ? explicit
    : STOCK_LOW_STOCK_DEFAULT_THRESHOLD;
}

function getStockStatusFromBalance(onHand, threshold = STOCK_LOW_STOCK_DEFAULT_THRESHOLD) {
  const quantity = Math.max(0, Number(onHand) || 0);
  const lowThreshold = Math.max(1, Number(threshold) || STOCK_LOW_STOCK_DEFAULT_THRESHOLD);
  if (quantity <= 0) return "no-stock";
  if (quantity <= lowThreshold) return "low-stock";
  return "in-stock";
}

function getStockStatusLabel(status) {
  if (status === "no-stock") return "No Stock";
  if (status === "low-stock") return "Low stock";
  return "In stock";
}

function getStockStatusTone(status) {
  if (status === "no-stock") return "danger";
  if (status === "low-stock") return "warning";
  return "success";
}

function getStockStatusForItem(item) {
  const key = getStockInventoryKeyForItem(item);
  const balance = key ? stockOrderInventoryByKey.get(key) : null;
  const threshold = Math.max(1, Number(balance?.lowStockThreshold || getStockLowStockThreshold(item)) || STOCK_LOW_STOCK_DEFAULT_THRESHOLD);
  const onHand = Math.max(0, Number(balance?.onHand) || 0);
  const status = getStockStatusFromBalance(onHand, threshold);
  return {
    key,
    onHand,
    status,
    label: getStockStatusLabel(status),
    tone: getStockStatusTone(status),
    lowStockThreshold: threshold,
    isKnown: Boolean(balance)
  };
}

function getStockStatusBadgeMarkup(stockStatus, options = {}) {
  const safeStatus = String(stockStatus?.status || "no-stock");
  const safeTone = String(stockStatus?.tone || getStockStatusTone(safeStatus));
  const safeLabel = escapeHtml(stockStatus?.label || getStockStatusLabel(safeStatus));
  const className = options.className ? ` ${escapeHtml(options.className)}` : "";
  return `<span class="stock-status-badge${className}" data-stock-status="${escapeHtml(safeStatus)}" data-stock-tone="${escapeHtml(safeTone)}">${safeLabel}</span>`;
}

function getStockStatusLineMarkup(item, stockStatus = getStockStatusForItem(item)) {
  const countLabel = stockStatus.status === "no-stock"
    ? "0 available"
    : `${stockStatus.onHand} available`;
  const detail = stockStatus.status === "no-stock"
    ? "Request only - no stock available"
    : stockStatus.status === "low-stock"
      ? `Low stock - ${countLabel}`
      : countLabel;
  return `
    <div class="stock-status-line" data-stock-status="${escapeHtml(stockStatus.status)}">
      ${getStockStatusBadgeMarkup(stockStatus)}
      <span>${escapeHtml(detail)}</span>
    </div>
  `;
}

const stockRequestDetailsByKey = new Map();

function getStockRequestStatusLabel(status) {
  const normalizedStatus = normalizeStockRequestStatus(status);
  if (normalizedStatus === "pending") return "Pending";
  if (normalizedStatus === "packed") return "Packed";
  if (normalizedStatus === "ready") return "Ready";
  if (normalizedStatus === "collected") return "Collected";
  if (normalizedStatus === "completed") return "Completed";
  if (normalizedStatus === "no-stock") return "No Stock";
  if (normalizedStatus === "cancelled") return "Cancelled";
  return normalizedStatus.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStockItemTextName(item) {
  const rawLabel = String(item?.label || getStockDisplayLabel(item) || "Stock item").trim();
  const compactLabel = rawLabel
    .replace(/\s*-\s*(Tray|Each|Singles)$/i, "")
    .replace(/\s+tubes?$/i, "")
    .trim();
  const variant = String(item?.variantLabel || "").trim();
  if (variant && !/^(tray|each|singles)$/i.test(variant) && !compactLabel.toLowerCase().includes(variant.toLowerCase())) {
    return `${compactLabel || rawLabel} ${variant}`.trim();
  }
  return compactLabel || rawLabel;
}

function getStockItemQuantityText(item) {
  const quantity = Math.max(0, Number(item?.quantity) || 0);
  const unitType = String(item?.unitType || item?.unit || "").trim().toLowerCase();
  const formatted = String(item?.formattedQuantity || "").trim();
  const isTube = /tube|microtainer/i.test(`${item?.id || ""} ${item?.label || ""} ${item?.sheetColumnKey || ""}`);

  if (unitType === "tray") return `${quantity} tray${quantity === 1 ? "" : "s"}`;
  if (unitType === "packet") return `${quantity} packet${quantity === 1 ? "" : "s"}`;
  if (isTube) return `${quantity} tube${quantity === 1 ? "" : "s"}`;
  if (formatted) return formatted.replace(/\s*\([^)]*\)\s*$/g, "");
  return `${quantity} each`;
}

function getCompactStockItemText(item) {
  return `${getStockItemTextName(item)} × ${getStockItemQuantityText(item)}`;
}

function requestHasRepeatOverride(request) {
  return /48h override|repeat request/i.test(String(request?.notes || request?.requestText || ""));
}

function getStockDuplicateItemKey(item) {
  return String(item?.sheetColumnKey || item?.sheetTrayColumnKey || item?.sheetSingleColumnKey || item?.id || item?.label || "")
    .trim()
    .toLowerCase();
}

function isStockHighVolumeItem(item) {
  const unitType = String(item?.unitType || item?.unit || "").trim().toLowerCase();
  const quantity = Math.max(0, Number(item?.quantity) || 0);
  const inventoryUnits = Math.max(0, Number(item?.inventoryUnits) || getStockInventoryUnits(item) || 0);
  return unitType === "tray" && quantity >= 1 || inventoryUnits >= 50 || quantity >= 50;
}

function isStockRequestWithinHours(request, hours = 48) {
  const submittedAt = new Date(request?.createdAt || request?.submittedAt || request?.updatedAt || "");
  if (Number.isNaN(submittedAt.getTime())) return false;
  return Date.now() - submittedAt.getTime() <= hours * 60 * 60 * 1000;
}

function getStockRequestDetailUrl(request) {
  const url = new URL(TRACK_ORDERS_URL, window.location.href);
  if (request?.id) url.searchParams.set("requestId", String(request.id));
  if (request?.requestedBy) url.searchParams.set("requestedBy", formatRequesterName(request.requestedBy));
  if (request?.wardUnit) url.searchParams.set("ward", String(request.wardUnit));
  return `${url.pathname}${url.search}`;
}

function analyzeStockRepeatRequest(payload, requests = stockOrderRecentRequestsForChecks) {
  const ward = String(payload?.wardUnit || "").trim().toLowerCase();
  const selectedItems = Array.isArray(payload?.items) ? payload.items : [];
  if (!ward || !selectedItems.length || !Array.isArray(requests)) {
    return { activeBlock: null, recentWarnings: [] };
  }

  const selectedKeys = new Map(selectedItems
    .map((item) => [getStockDuplicateItemKey(item), item])
    .filter(([key]) => key));
  const activeStatuses = new Set(["pending", "packed", "ready"]);
  const fulfilledStatuses = new Set(["completed", "collected"]);
  let activeBlock = null;
  const recentWarnings = [];
  const warnedKeys = new Set();

  requests.forEach((request) => {
    if (!request || String(request.wardUnit || "").trim().toLowerCase() !== ward) return;
    if (!isStockRequestWithinHours(request, 48)) return;

    const status = normalizeStockRequestStatus(request.status);
    const requestItems = Array.isArray(request.items) ? request.items : [];
    requestItems.forEach((requestItem) => {
      const key = getStockDuplicateItemKey(requestItem);
      if (!key || !selectedKeys.has(key)) return;

      if (!activeBlock && activeStatuses.has(status)) {
        activeBlock = {
          type: "active",
          request,
          item: selectedKeys.get(key),
          matchedItem: requestItem,
          message: `Stock already ordered by ${formatRequesterName(request.requestedBy) || "this requester"} for ${request.wardUnit || "this ward"}. Please check Track Orders before requesting more.`
        };
        return;
      }

      if (fulfilledStatuses.has(status) && !warnedKeys.has(key) && isStockHighVolumeItem(requestItem)) {
        warnedKeys.add(key);
        recentWarnings.push({
          type: "recent-high-volume",
          request,
          item: selectedKeys.get(key),
          matchedItem: requestItem,
          message: `${request.wardUnit || "This ward"} received ${getStockItemTextName(requestItem)} within the last 48 hours. Please give a reason if more stock is genuinely needed.`
        });
      }
    });
  });

  return { activeBlock, recentWarnings };
}

function getStockRepeatOverrideReason() {
  return String(stockOrderRepeatReasonSelect?.value || "").trim();
}

function registerStockRequestForDetails(request) {
  const key = String(request?.id || `request-${stockRequestDetailsByKey.size + 1}`).trim();
  if (key) stockRequestDetailsByKey.set(key, request);
  return key;
}

function getStockRequestCompactItemsMarkup(request, maxItems = 3) {
  const items = Array.isArray(request?.items) ? request.items : [];
  if (!items.length) return '<p class="stock-request-compact-empty">No items listed</p>';

  const visibleItems = items.slice(0, maxItems);
  const extraCount = Math.max(0, items.length - visibleItems.length);
  return `
    <div class="stock-request-compact-items">
      <p class="stock-request-compact-title">Items ordered</p>
      <ul>
        ${visibleItems.map((item) => `<li>${escapeHtml(getCompactStockItemText(item))}</li>`).join("")}
        ${extraCount ? `<li class="stock-request-compact-more">+ ${extraCount} more</li>` : ""}
      </ul>
    </div>
  `;
}

function getStockRequestItemStatus(item) {
  if (item?.stockStatus || item?.stockStatusLabel) {
    const status = String(item.stockStatus || "").trim() || "in-stock";
    return {
      status,
      label: String(item.stockStatusLabel || getStockStatusLabel(status)),
      tone: getStockStatusTone(status),
      onHand: Math.max(0, Number(item.stockOnHand) || 0)
    };
  }
  if (typeof stockDashboardGetInventoryStatusForItem === "function") return stockDashboardGetInventoryStatusForItem(item);
  if (typeof getStockStatusForItem === "function") {
    const status = getStockStatusForItem(item);
    return status?.isKnown ? status : null;
  }
  return null;
}

function ensureStockRequestDetailsModal() {
  let modal = document.getElementById("stockRequestDetailsModal");
  if (modal) return modal;

  modal = document.createElement("section");
  modal.id = "stockRequestDetailsModal";
  modal.className = "stock-request-detail-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="stock-request-detail-backdrop" data-stock-request-close></div>
    <div class="stock-request-detail-card" role="dialog" aria-modal="true" aria-labelledby="stockRequestDetailsTitle">
      <div class="stock-request-detail-head">
        <div>
          <p class="stock-order-kicker">Order details</p>
          <h3 id="stockRequestDetailsTitle">Stock request</h3>
        </div>
        <button type="button" class="profile-modal-close-btn" data-stock-request-close>Close</button>
      </div>
      <div class="stock-request-detail-body" id="stockRequestDetailsBody"></div>
    </div>
  `;
  modal.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest("[data-stock-request-close]")) return;
    modal.hidden = true;
    document.body.classList.remove("stock-request-detail-open");
  });
  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    modal.hidden = true;
    document.body.classList.remove("stock-request-detail-open");
  });
  document.body.appendChild(modal);
  return modal;
}

function showStockRequestDetails(requestOrKey) {
  const request = typeof requestOrKey === "string"
    ? stockRequestDetailsByKey.get(requestOrKey)
    : requestOrKey;
  if (!request) return;

  const modal = ensureStockRequestDetailsModal();
  const body = modal.querySelector("#stockRequestDetailsBody");
  const title = modal.querySelector("#stockRequestDetailsTitle");
  const items = Array.isArray(request.items) ? request.items : [];
  const statusLabel = getStockRequestStatusLabel(request.status);
  const submittedAt = formatStockRequestDateTime(request.createdAt || request.submittedAt);
  const requester = formatRequesterName(request.requestedBy) || "Unknown requester";
  const repeatOverrideBadge = requestHasRepeatOverride(request)
    ? '<span class="stock-order-repeat-mini-badge">48h override</span>'
    : "";

  if (title) title.textContent = request.id ? `Order ${request.id}` : "Stock request";
  if (body) {
    body.innerHTML = `
      <div class="stock-request-detail-grid">
        <div><span>Requester</span><strong>${escapeHtml(requester)}</strong></div>
        <div><span>Ward / Unit</span><strong>${escapeHtml(request.wardUnit || "Ward not set")}</strong></div>
        <div><span>Date submitted</span><strong>${escapeHtml(submittedAt)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(statusLabel)}</strong>${repeatOverrideBadge}</div>
      </div>
      ${request.notes ? `<div class="stock-request-detail-notes"><span>Notes</span><p>${escapeHtml(request.notes)}</p></div>` : ""}
      <div class="stock-request-detail-items">
        <h4>Items ordered</h4>
        ${items.length ? items.map((item) => {
          const stockStatus = getStockRequestItemStatus(item);
          return `
            <div class="stock-request-detail-item">
              <div>
                <strong>${escapeHtml(getStockItemTextName(item))}</strong>
                <span>${escapeHtml(getStockItemQuantityText(item))}</span>
              </div>
              ${stockStatus ? getStockStatusBadgeMarkup(stockStatus) : ""}
            </div>
          `;
        }).join("") : '<p class="stock-dashboard-empty">No items listed.</p>'}
      </div>
      ${request.statusUpdatedAt || request.updatedAt ? `<p class="stock-request-detail-admin">Last update ${escapeHtml(formatStockRequestDateTime(request.statusUpdatedAt || request.updatedAt))}${request.statusUpdatedBy ? ` by lab user ${escapeHtml(request.statusUpdatedBy)}` : ""}</p>` : ""}
    `;
  }

  modal.hidden = false;
  document.body.classList.add("stock-request-detail-open");
  modal.querySelector("button[data-stock-request-close]")?.focus?.({ preventScroll: true });
}

function handleStockRequestDetailsClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-stock-request-view]");
  if (!(button instanceof HTMLElement)) return;
  showStockRequestDetails(button.getAttribute("data-stock-request-view") || "");
}

async function loadStockOrderInventory() {
  if (!stockOrderGrid) return;

  try {
    const response = await fetch(STOCK_ORDER_INVENTORY_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Inventory fetch failed with status ${response.status}`);
    const payload = await response.json().catch(() => ({}));
    const rows = Array.isArray(payload?.summary) ? payload.summary : [];
    stockOrderInventoryByKey.clear();
    rows.forEach((row) => {
      const key = String(row?.key || "").trim();
      if (!key) return;
      stockOrderInventoryByKey.set(key, {
        key,
        label: String(row?.label || ""),
        onHand: Math.max(0, Number(row?.onHand) || 0),
        status: String(row?.status || ""),
        statusLabel: String(row?.statusLabel || ""),
        lowStockThreshold: Math.max(1, Number(row?.lowStockThreshold) || STOCK_LOW_STOCK_DEFAULT_THRESHOLD),
        updatedAt: String(row?.updatedAt || "")
      });
    });
  } catch (error) {
    console.warn("Stock inventory status unavailable", error);
  } finally {
    renderStockOrderItems();
    updateStockOrderPreview();
    if (typeof window !== "undefined" && typeof window.applyUnifiedTubeUi === "function") {
      window.applyUnifiedTubeUi();
    }
    if (typeof window !== "undefined" && typeof window.syncUnifiedTubeInputs === "function") {
      window.syncUnifiedTubeInputs();
    }
  }
}

// Renders the stock tracking list on the order page.
function renderStockTrackingList(requests) {
  if (!stockOrderTrackingList) return;

  const visibleRequests = Array.isArray(requests) ? requests.slice(0, 2) : [];

  if (!visibleRequests.length) {
    stockOrderTrackingList.innerHTML = `
      <p class="stock-dashboard-empty">No requests yet. Once you submit an order, it will appear here.</p>
    `;
    return;
  }

  stockOrderTrackingList.innerHTML = visibleRequests.map((request) => {
    const normalizedStatus = normalizeStockRequestStatus(request?.status);
    const detailKey = registerStockRequestForDetails(request);
    const statusLabel = getStockRequestStatusLabel(normalizedStatus);
    const repeatBadge = requestHasRepeatOverride(request)
      ? '<span class="stock-order-repeat-mini-badge">48h override</span>'
      : "";

    return `
      <button
        type="button"
        class="stock-dashboard-request-card stock-request-compact-card stock-order-recent-trigger"
        data-stock-request-view="${escapeHtml(detailKey)}"
        aria-label="View order from ${escapeHtml(formatRequesterName(request.requestedBy) || "Unknown requester")}, ${escapeHtml(request.wardUnit || "ward not set")}, ${escapeHtml(formatStockRequestDateOnly(request.createdAt || request.submittedAt))}"
      >
        <span class="stock-request-compact-identity">
          <strong>${escapeHtml(formatRequesterName(request.requestedBy) || "Unknown requester")}</strong>
          <span>${escapeHtml(request.wardUnit || "Ward not set")} · ${escapeHtml(formatStockRequestDateOnly(request.createdAt || request.submittedAt))}</span>
        </span>
        <span class="stock-request-compact-state">
          ${repeatBadge}
          <span class="stock-order-status-badge" data-status="${escapeHtml(normalizedStatus)}">${escapeHtml(statusLabel)}</span>
        </span>
      </button>
    `;
  }).join("");
}

// Loads recent stock requests for the order page tracking section.
async function loadStockTrackingList() {
  if (!stockOrderTrackingList || !stockOrderTrackingMeta) return;

  stockOrderTrackingMeta.textContent = "Loading recent requests...";
  if (refreshStockTrackingBtn) refreshStockTrackingBtn.disabled = true;

  try {
    const response = await fetch(STOCK_ORDER_TRACKING_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Tracking fetch failed with status ${response.status}`);
    }

    const payload = await response.json();
    const requests = Array.isArray(payload?.requests) ? payload.requests : [];
    syncTrackedStockRequestStatuses(requests);
    renderStockTrackingList(requests);
    const visibleCount = Math.min(requests.length, 2);
    stockOrderTrackingMeta.textContent = visibleCount
      ? `${visibleCount} recent order${visibleCount === 1 ? "" : "s"}.`
      : "No requests yet.";
  } catch (error) {
    console.error("Stock tracking load failed", error);
    renderStockTrackingList([]);
    stockOrderTrackingMeta.textContent = "Tracking is unavailable right now. Use Refresh to try again.";
  } finally {
    if (refreshStockTrackingBtn) refreshStockTrackingBtn.disabled = false;
  }
}

async function loadStockDuplicateCheckRequests() {
  try {
    const response = await fetch(STOCK_ORDER_DUPLICATE_CHECK_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Duplicate check fetch failed with status ${response.status}`);
    const payload = await response.json().catch(() => ({}));
    stockOrderRecentRequestsForChecks = Array.isArray(payload?.requests) ? payload.requests : [];
    syncTrackedStockRequestStatuses(stockOrderRecentRequestsForChecks);
  } catch (error) {
    console.warn("Stock repeat check unavailable", error);
    stockOrderRecentRequestsForChecks = [];
  } finally {
    updateStockOrderPreview();
  }
}

// Gets current consumables request lines.
function getSelectedStockConsumables() {
  return stockConsumableItems
    .map((item) => ({ ...item, quantity: Number(stockOrderState[item.id] || 0) }))
    .filter((item) => item.quantity > 0);
}

function getStockInventoryUnits(item) {
  const quantity = Math.max(0, Number(item?.quantity) || 0);
  if (!quantity) return 0;

  if (item.unitType === "tray") {
    return quantity * Math.max(0, Number(item.traySize) || 0);
  }

  if (item.unitType === "packet") {
    return quantity * Math.max(0, Number(item.packetSize) || 0);
  }

  return quantity;
}

// Formats a consumables quantity line.
function formatStockQuantity(item) {
  if (item.unitType === "tray") {
    const tubeCount = item.quantity * item.traySize;
    return `${item.quantity} tray${item.quantity === 1 ? "" : "s"} (${tubeCount} tubes)`;
  }

  if (item.unitType === "packet") {
    const itemCount = item.quantity * item.packetSize;
    return `${item.quantity} packet${item.quantity === 1 ? "" : "s"} (${itemCount} bags)`;
  }

  return `${item.quantity} each`;
}

// Builds a structured consumables payload for integrations.
function buildStockOrderPayload() {
  const requesterName = toConsistentNameCase(stockOrderRequesterNameInput?.value);
  const requesterWard = String(stockOrderRequesterSelect?.value || "").trim();
  const notes = String(stockOrderNoteInput?.value || "").trim();
  const selectedItems = getSelectedStockConsumables();
  const preliminaryPayload = {
    wardUnit: requesterWard,
    items: selectedItems.map((item) => ({
      ...item,
      inventoryUnits: getStockInventoryUnits(item)
    }))
  };
  const repeatAnalysis = analyzeStockRepeatRequest(preliminaryPayload);
  const repeatOverrideReason = repeatAnalysis.recentWarnings.length ? getStockRepeatOverrideReason() : "";
  const repeatNote = repeatOverrideReason
    ? `48h override: ${repeatOverrideReason}`
    : "";
  const finalNotes = [notes, repeatNote].filter(Boolean).join("\n");

  return {
    source: "find-my-tube",
    submittedAt: new Date().toISOString(),
    requestedBy: requesterName,
    wardUnit: requesterWard,
    notes: finalNotes,
    repeatOverrideReason,
    repeatOverrideItems: repeatAnalysis.recentWarnings.map((warning) => getStockItemTextName(warning.matchedItem || warning.item)),
    lineItemCount: selectedItems.length,
    totalRequestedQuantity: selectedItems.reduce((sum, item) => sum + getStockInventoryUnits(item), 0),
    requestText: buildStockOrderRequestText(),
    items: selectedItems.map((item) => ({
      id: item.id,
      label: item.label,
      variantLabel: item.variantLabel || "",
      quantity: item.quantity,
      unitType: item.unitType,
      traySize: item.traySize || null,
      packetSize: item.packetSize || null,
      formattedQuantity: formatStockQuantity(item),
      inventoryUnits: getStockInventoryUnits(item),
      sheetColumnKey: item.sheetColumnKey || "",
      sheetTrayColumnKey: item.sheetTrayColumnKey || "",
      sheetSingleColumnKey: item.sheetSingleColumnKey || "",
      stockStatus: getStockStatusForItem(item).status,
      stockStatusLabel: getStockStatusForItem(item).label,
      stockOnHand: getStockStatusForItem(item).onHand,
      lowStockThreshold: getStockStatusForItem(item).lowStockThreshold
    }))
  };
}

// Gets a stock item config by id.
function getStockConsumableItem(itemId) {
  return stockConsumableItems.find((item) => item.id === itemId) || null;
}

// Gets the maximum allowed quantity for a stock item.
function getStockItemMaxQuantity(itemId) {
  const item = getStockConsumableItem(itemId);
  return Number(item?.maxQuantity || 0) || Infinity;
}

// Gets the current consumables status label.
function getStockOrderStatusLabel() {
  const requesterName = toConsistentNameCase(stockOrderRequesterNameInput?.value);
  const requesterWard = String(stockOrderRequesterSelect?.value || "").trim();
  const selectedItems = getSelectedStockConsumables();

  if (isSubmittingStockOrder) return "Submitting";
  if (stockOrderStatusMode === "submitted") {
    const submittedStatus = normalizeStockRequestStatus(submittedStockOrderRecord?.status);
    if (submittedStatus === "pending") return "Pending";
    if (submittedStatus === "packed") return "Packed";
    if (submittedStatus === "ready") return "Ready";
    if (submittedStatus === "collected") return "Collected";
    if (submittedStatus === "completed") return "Completed";
    if (submittedStatus === "no-stock") return "No Stock";
    if (submittedStatus === "cancelled") return "Cancelled";
    return "Pending";
  }
  if (stockOrderStatusMode === "submit-failed") return "Submit failed";
  if (stockOrderStatusMode === "copied") return "Copied";
  if (stockOrderStatusMode === "shared") return "Shared";
  if (requesterName && requesterWard && selectedItems.length) return "Ready";
  return "Draft";
}

// Gets the concise ordered items summary.
function getStockOrderItemsSummary(selectedItems = getSelectedStockConsumables()) {
  if (!selectedItems.length) return "No items selected";

  return selectedItems
    .map((item) => {
      const status = getStockStatusForItem(item);
      const suffix = status.status === "no-stock"
        ? " - No Stock"
        : status.status === "low-stock"
          ? " - Low stock"
          : "";
      return `${getStockDisplayLabel(item)} x ${formatStockQuantity(item)}${suffix}`;
    })
    .join("\n");
}

function getStockOrderSelectedItemsMarkup(selectedItems = getSelectedStockConsumables()) {
  if (!selectedItems.length) return "No items selected";

  return `
    <div class="stock-order-selected-list" aria-label="Selected consumables">
      ${selectedItems.map((item) => {
        const label = getStockDisplayLabel(item);
        return `
          <article class="stock-order-selected-card">
            <div class="stock-order-selected-main">
              <span class="stock-order-selected-name">${getStockDisplayLabelMarkup(item, label, {
                wrapperClassName: "stock-item-title-row-compact",
                glyphClassName: "stock-item-glyph-compact"
              })}</span>
              <span class="stock-order-selected-quantity">${escapeHtml(formatStockQuantity(item))}</span>
            </div>
            <button type="button" class="stock-order-selected-remove" data-stock-summary-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(label)}">Remove</button>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

// Builds the consumables request text.
function buildStockOrderRequestText() {
  const requesterName = toConsistentNameCase(stockOrderRequesterNameInput?.value);
  const requesterWard = String(stockOrderRequesterSelect?.value || "").trim();
  const notes = String(stockOrderNoteInput?.value || "").trim();
  const selectedItems = getSelectedStockConsumables();
  const repeatAnalysis = analyzeStockRepeatRequest({
    wardUnit: requesterWard,
    items: selectedItems.map((item) => ({
      ...item,
      inventoryUnits: getStockInventoryUnits(item)
    }))
  });
  const repeatOverrideReason = repeatAnalysis.recentWarnings.length ? getStockRepeatOverrideReason() : "";

  const lines = ["Consumables request"];

  lines.push(`Status: ${getStockOrderStatusLabel()}`);
  if (requesterName) lines.push(`Requested by: ${requesterName}`);
  if (requesterWard) lines.push(`Ward / Unit: ${requesterWard}`);

  if (!selectedItems.length) {
    lines.push("");
    lines.push("No consumables selected yet.");
  } else {
    lines.push("");
    lines.push("Items:");
    selectedItems.forEach((item) => {
      const status = getStockStatusForItem(item);
      lines.push(`- ${getStockDisplayLabel(item)}: ${formatStockQuantity(item)} (${status.label}, ${status.onHand} on hand)`);
      if (status.status === "no-stock") {
        lines.push("  Request only - no stock available.");
      }
    });
  }

  if (notes) {
    lines.push("");
    lines.push(`Notes: ${notes}`);
  }
  if (repeatOverrideReason) {
    lines.push("");
    lines.push(`48h override: ${repeatOverrideReason}`);
  }

  return lines.join("\n");
}

function updateStockRepeatWarningPanel(repeatAnalysis) {
  if (!stockOrderRepeatWarning || !stockOrderRepeatMessage) return;

  const activeBlock = repeatAnalysis?.activeBlock || null;
  const warnings = Array.isArray(repeatAnalysis?.recentWarnings) ? repeatAnalysis.recentWarnings : [];
  const hasWarning = Boolean(activeBlock || warnings.length);
  stockOrderRepeatWarning.hidden = !hasWarning;
  stockOrderRepeatWarning.dataset.repeatMode = activeBlock ? "blocked" : warnings.length ? "override" : "";
  if (!hasWarning) return;

  if (activeBlock) {
    const request = activeBlock.request || {};
    const itemName = getStockItemTextName(activeBlock.matchedItem || activeBlock.item);
    const statusLabel = getStockRequestStatusLabel(request.status);
    const dateLabel = formatStockRequestDateOnly(request.createdAt || request.submittedAt);
    stockOrderRepeatBadge.textContent = "Already ordered";
    stockOrderRepeatMessage.textContent = `${request.wardUnit || "This ward"} already has an active ${itemName} request. ${formatRequesterName(request.requestedBy) || "Requester"} · ${dateLabel} · ${statusLabel}.`;
    if (stockOrderRepeatReasonWrap) stockOrderRepeatReasonWrap.hidden = true;
    if (stockOrderRepeatTrackLink) {
      stockOrderRepeatTrackLink.hidden = false;
      stockOrderRepeatTrackLink.href = getStockRequestDetailUrl(request);
    }
    return;
  }

  const firstWarning = warnings[0];
  const itemList = warnings
    .map((warning) => getStockItemTextName(warning.matchedItem || warning.item))
    .filter(Boolean)
    .join(", ");
  stockOrderRepeatBadge.textContent = "48h override";
  stockOrderRepeatMessage.textContent = `${firstWarning?.request?.wardUnit || "This ward"} received ${itemList || "this stock"} within the last 48 hours. Request again only if stock is finished, damaged, or patient load was unusually high.`;
  if (stockOrderRepeatReasonWrap) stockOrderRepeatReasonWrap.hidden = false;
  if (stockOrderRepeatTrackLink) stockOrderRepeatTrackLink.hidden = true;
}

// Updates the consumables request preview.
function updateStockOrderPreview() {
  if (!stockOrderRequestPreview || !stockOrderRequestMeta) return;

  const requesterName = toConsistentNameCase(stockOrderRequesterNameInput?.value);
  const requesterWard = String(stockOrderRequesterSelect?.value || "").trim();
  const selectedItems = getSelectedStockConsumables();
  const itemCount = selectedItems.reduce((sum, item) => sum + getStockInventoryUnits(item), 0);
  const hasRequest = Boolean(requesterName && requesterWard && selectedItems.length);
  const repeatAnalysis = analyzeStockRepeatRequest({
    wardUnit: requesterWard,
    items: selectedItems.map((item) => ({
      ...item,
      inventoryUnits: getStockInventoryUnits(item)
    }))
  });
  const requestText = buildStockOrderRequestText();
  const statusLabel = getStockOrderStatusLabel();
  const blockedReason = getStockSubmitBlockedReason();

  stockOrderRequestPreview.value = requestText;
  updateStockRepeatWarningPanel(repeatAnalysis);
  if (stockOrderStatusBadge) {
    stockOrderStatusBadge.textContent = statusLabel;
    stockOrderStatusBadge.dataset.status = statusLabel.toLowerCase();
  }
  if (stockOrderSummaryItems) {
    stockOrderSummaryItems.innerHTML = getStockOrderSelectedItemsMarkup(selectedItems);
  }
  stockOrderRequestMeta.textContent = hasRequest
    ? blockedReason
      ? blockedReason
      : stockOrderStatusMode === "submit-failed"
        ? (lastStockSubmitErrorMessage || "Request could not be submitted. Please try again or contact the lab.")
        : stockOrderStatusMode === "submitted" && submittedStockOrderRecord?.id
          ? `Request ${submittedStockOrderRecord.id} saved. ${selectedItems.length} line item${selectedItems.length === 1 ? "" : "s"}, ${itemCount} total quantity requested.`
          : `${selectedItems.length} line item${selectedItems.length === 1 ? "" : "s"}, ${itemCount} total quantity requested.`
    : "Add your name, ward / unit, and at least one item.";

  if (submitStockOrderBtn) {
    submitStockOrderBtn.disabled = !hasRequest || isSubmittingStockOrder || Boolean(blockedReason);
    submitStockOrderBtn.textContent = isSubmittingStockOrder ? "Submitting..." : "Submit Request";
    submitStockOrderBtn.setAttribute("aria-disabled", submitStockOrderBtn.disabled ? "true" : "false");
    submitStockOrderBtn.setAttribute("aria-busy", isSubmittingStockOrder ? "true" : "false");
  }
  stockOrderPanel?.setAttribute("aria-busy", isSubmittingStockOrder ? "true" : "false");
  if (copyStockOrderBtn) {
    copyStockOrderBtn.disabled = !hasRequest;
  }
  if (shareStockOrderWhatsappBtn) {
    shareStockOrderWhatsappBtn.classList.toggle("is-disabled", !hasRequest);
    shareStockOrderWhatsappBtn.setAttribute("aria-disabled", hasRequest ? "false" : "true");
    shareStockOrderWhatsappBtn.href = hasRequest
      ? `https://wa.me/?text=${encodeURIComponent(requestText)}`
      : "#";
    shareStockOrderWhatsappBtn.tabIndex = hasRequest ? 0 : -1;
  }
  bindStockOrderSummaryControls();
  if (typeof window.refreshStockCatalogFilters === "function") {
    window.refreshStockCatalogFilters();
  }
}

// Sets a consumables quantity.
function setStockItemQuantity(itemId, quantity) {
  const maxQuantity = getStockItemMaxQuantity(itemId);
  const safeQuantity = Math.min(maxQuantity, Math.max(0, Number(quantity) || 0));
  stockOrderState[itemId] = safeQuantity;
  if (["copied", "shared", "submitted", "submit-failed"].includes(stockOrderStatusMode)) {
    stockOrderStatusMode = "ready";
    submittedStockOrderRecord = null;
    lastStockSubmitErrorMessage = "";
  }

  const input = stockOrderGrid?.querySelector(`[data-stock-qty-input="${itemId}"]`);
  if (input) {
    input.value = String(safeQuantity);
  }

  syncStockOrderItemState(itemId);
  updateStockOrderPreview();
}

function bindStockOrderSummaryControls() {
  if (!stockOrderSummaryItems || stockOrderSummaryItems.dataset.summaryControlsBound === "1") return;
  stockOrderSummaryItems.dataset.summaryControlsBound = "1";

  stockOrderSummaryItems.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const removeBtn = target.closest("[data-stock-summary-remove]");
    if (removeBtn) {
      setStockItemQuantity(removeBtn.getAttribute("data-stock-summary-remove") || "", 0);
      return;
    }

    const stepBtn = target.closest("[data-stock-summary-step]");
    if (stepBtn) {
      const itemId = stepBtn.getAttribute("data-stock-summary-step") || "";
      const direction = Number(stepBtn.getAttribute("data-stock-summary-direction") || "0");
      setStockItemQuantity(itemId, Number(stockOrderState[itemId] || 0) + direction);
    }
  });

  stockOrderSummaryItems.addEventListener("input", (event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target || !target.matches("[data-stock-summary-input]")) return;
    setStockItemQuantity(target.getAttribute("data-stock-summary-input") || "", target.value);
  });
}

// Binds a control for both mobile taps and standard clicks without double-firing.
function bindPressAction(target, handler) {
  if (!target || typeof handler !== "function") return;

  let lastTouchPressAt = 0;

  target.addEventListener("pointerup", (event) => {
    if (!(event instanceof PointerEvent) || event.pointerType === "mouse") return;
    lastTouchPressAt = Date.now();
    handler(event);
  });

  target.addEventListener("click", (event) => {
    if (Date.now() - lastTouchPressAt < 700) return;
    handler(event);
  });
}

function getStockOrderCardSelectionLabel(item, quantity) {
  const safeQuantity = Math.max(0, Number(quantity) || 0);
  if (!safeQuantity) return "";
  if (item?.unitType === "tray") return `${safeQuantity} tray${safeQuantity === 1 ? "" : "s"}`;
  if (item?.unitType === "packet") return `${safeQuantity} packet${safeQuantity === 1 ? "" : "s"}`;
  return `${safeQuantity} each`;
}

function setStockOrderCardExpanded(card, expanded) {
  if (!(card instanceof HTMLElement)) return;

  if (expanded) {
    stockOrderGrid?.querySelectorAll(".stock-order-item-card.is-expanded").forEach((otherCard) => {
      if (otherCard === card) return;
      setStockOrderCardExpanded(otherCard, false);
    });
  }

  const trigger = card.querySelector("[data-stock-card-toggle]");
  const controls = card.querySelector(".stock-order-item-controls");
  card.classList.toggle("is-expanded", expanded);
  card.dataset.stockExpanded = expanded ? "true" : "false";
  trigger?.setAttribute("aria-expanded", expanded ? "true" : "false");
  if (controls instanceof HTMLElement) controls.hidden = !expanded;
}

function syncStockOrderCardSelection(itemId) {
  const card = stockOrderGrid?.querySelector(`[data-stock-item="${itemId}"]`);
  if (!(card instanceof HTMLElement)) return;

  const item = stockConsumableItems.find((candidate) => candidate.id === itemId);
  const quantity = Math.max(0, Number(stockOrderState[itemId] || 0));
  const selection = card.querySelector("[data-stock-card-selection]");
  const prompt = card.querySelector("[data-stock-card-prompt]");
  if (selection instanceof HTMLElement) {
    selection.textContent = getStockOrderCardSelectionLabel(item, quantity);
    selection.hidden = quantity <= 0;
  }
  if (prompt instanceof HTMLElement) {
    prompt.hidden = quantity > 0;
  }
  card.classList.toggle("has-selection", quantity > 0);
}

// Syncs disabled and visual max state for a stock item card.
function syncStockOrderItemState(itemId) {
  if (!stockOrderGrid) return;

  const card = stockOrderGrid.querySelector(`[data-stock-item="${itemId}"]`);
  const increaseBtn = stockOrderGrid.querySelector(`[data-stock-qty-step="${itemId}"][data-stock-qty-direction="1"]`);
  const quantityInput = stockOrderGrid.querySelector(`[data-stock-qty-input="${itemId}"]`);
  const maxQuantity = getStockItemMaxQuantity(itemId);
  const currentValue = Number(stockOrderState[itemId] || 0);
  const isMaxed = Number.isFinite(maxQuantity) && currentValue >= maxQuantity;

  card?.classList.toggle("is-maxed", isMaxed);

  if (increaseBtn instanceof HTMLButtonElement) {
    increaseBtn.disabled = isMaxed;
    increaseBtn.setAttribute("aria-disabled", isMaxed ? "true" : "false");
  }

  if (quantityInput instanceof HTMLInputElement && Number.isFinite(maxQuantity)) {
    quantityInput.max = String(maxQuantity);
  }

  syncStockOrderCardSelection(itemId);
}

// Renders consumables cards.
function renderStockOrderItems() {
  if (!stockOrderGrid) return;

  stockOrderGrid.innerHTML = stockConsumableItems
    .map((item) => {
      const cardLabel = getStockDisplayLabel(item);
      const cardLabelMarkup = getStockDisplayLabelMarkup(item, cardLabel);
      const stockStatus = getStockStatusForItem(item);
      const availabilityMarkup = stockStatus.isKnown
        ? `<span class="stock-order-card-availability" data-stock-status="${escapeHtml(stockStatus.status)}">${escapeHtml(stockStatus.label)} · ${stockStatus.onHand} available</span>`
        : "";
      const cardKicker = item.variantLabel
        ? item.unitType === "tray"
          ? `${item.variantLabel} · Tray of ${item.traySize}`
          : item.unitType === "packet"
          ? `${item.variantLabel} · Packet of ${item.packetSize}`
          : item.variantLabel
        : item.unitType === "tray"
        ? `Tray of ${item.traySize}`
        : item.unitType === "packet"
        ? `Packet of ${item.packetSize}`
        : "Each";

      return `
      <article class="stock-order-card stock-order-item-card" data-stock-item="${item.id}" data-stock-expanded="false">
        <button
          type="button"
          class="stock-order-item-trigger"
          data-stock-card-toggle
          aria-expanded="false"
          aria-controls="stock-order-controls-${escapeHtml(item.id)}"
        >
          <span class="stock-order-card-copy">
            <span class="stock-order-item-kicker">${cardKicker}</span>
            <span class="stock-order-card-title">${cardLabelMarkup}</span>
            ${availabilityMarkup}
          </span>
          <span class="stock-order-card-action">
            <span class="stock-order-card-selection" data-stock-card-selection hidden></span>
            <span data-stock-card-prompt>Set amount</span>
            <span class="stock-order-card-plus" aria-hidden="true">+</span>
          </span>
        </button>
        <div class="stock-order-item-controls" id="stock-order-controls-${escapeHtml(item.id)}" hidden>
          <div class="stock-order-qty-row">
            <button
              type="button"
              class="stock-order-qty-btn"
              data-stock-qty-step="${item.id}"
              data-stock-qty-direction="-1"
              aria-label="Reduce ${escapeHtml(cardLabel)}"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              step="1"
              value="0"
              inputmode="numeric"
              pattern="[0-9]*"
              class="stock-order-qty-input"
              data-stock-qty-input="${item.id}"
              ${item.maxQuantity ? `max="${item.maxQuantity}"` : ""}
              aria-label="${cardLabel} quantity"
            />
            <button
              type="button"
              class="stock-order-qty-btn"
              data-stock-qty-step="${item.id}"
              data-stock-qty-direction="1"
              aria-label="Increase ${escapeHtml(cardLabel)}"
            >
              +
            </button>
          </div>
          ${item.note ? `<p class="stock-order-item-copy">${item.note}</p>` : ""}
        </div>
      </article>
    `;
    })
    .join("");

  stockOrderGrid.querySelectorAll("[data-stock-qty-step]").forEach((button) => {
    bindPressAction(button, () => {
      const itemId = button.getAttribute("data-stock-qty-step") || "";
      const direction = Number(button.getAttribute("data-stock-qty-direction") || "0");
      const currentValue = Number(stockOrderState[itemId] || 0);
      setStockItemQuantity(itemId, currentValue + direction);
    });
  });

  stockOrderGrid.querySelectorAll("[data-stock-qty-input]").forEach((input) => {
    input.addEventListener("input", () => {
      const itemId = input.getAttribute("data-stock-qty-input") || "";
      setStockItemQuantity(itemId, input.value);
    });
  });

  stockOrderGrid.querySelectorAll("[data-stock-card-toggle]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const card = trigger.closest(".stock-order-item-card");
      if (!(card instanceof HTMLElement)) return;
      setStockOrderCardExpanded(card, !card.classList.contains("is-expanded"));
    });
  });

  stockConsumableItems.forEach((item) => {
    syncStockOrderItemState(item.id);
  });
}

// Populates requester options.
function populateStockRequesterOptions() {
  if (!stockOrderRequesterSelect) return;

  stockRequesterGroups.forEach((group) => {
    const optionGroup = document.createElement("optgroup");
    optionGroup.label = group.label;

    group.options.forEach((optionLabel) => {
      const option = document.createElement("option");
      option.value = optionLabel;
      option.textContent = optionLabel;
      optionGroup.appendChild(option);
    });

    stockOrderRequesterSelect.appendChild(optionGroup);
  });
}

// Clears the consumables request form.
function resetStockOrderForm() {
  stockConsumableItems.forEach((item) => {
    stockOrderState[item.id] = 0;
  });
  stockOrderStatusMode = "draft";
  submittedStockOrderRecord = null;
  lastStockSubmitErrorMessage = "";
  if (stockOrderRepeatReasonSelect) stockOrderRepeatReasonSelect.value = "";

  if (stockOrderForm) {
    stockOrderForm.reset();
  }

  if (stockOrderGrid) {
    stockOrderGrid.querySelectorAll("[data-stock-qty-input]").forEach((input) => {
      input.value = "0";
    });
  }

  updateStockOrderPreview();
}

function showStockOrderSubmissionConfirmation(record = null, payload = null) {
  if (!stockOrderSubmissionCard) return;

  const requestId = String(record?.id || "").trim();
  const requestedBy = formatRequesterName(record?.requestedBy || payload?.requestedBy || "");
  const wardUnit = String(record?.wardUnit || payload?.wardUnit || "").trim();

  stockOrderSubmissionCard.hidden = !requestId;
  if (!requestId) return;

  if (stockOrderSubmissionRequestId) {
    stockOrderSubmissionRequestId.textContent = requestId;
  }

  if (stockOrderSubmissionMessage) {
    stockOrderSubmissionMessage.textContent = "Request pending with the lab. Use Track Orders to follow status updates.";
  }

  if (stockOrderTrackOrderBtn) {
    const targetUrl = new URL(TRACK_ORDERS_URL, window.location.href);
    targetUrl.searchParams.set("requestId", requestId);
    if (requestedBy) targetUrl.searchParams.set("requestedBy", requestedBy);
    if (wardUnit) targetUrl.searchParams.set("ward", wardUnit);
    stockOrderTrackOrderBtn.setAttribute("href", `${targetUrl.pathname}${targetUrl.search}`);
  }
}

function hideStockOrderSubmissionConfirmation() {
  if (!stockOrderSubmissionCard) return;
  stockOrderSubmissionCard.hidden = true;
}

// Initializes the consumables order panel.
function initStockOrderPanel() {
  if (!stockOrderPanel || !stockOrderRequesterNameInput || !stockOrderRequesterSelect || !stockOrderGrid) return;

  stockOrderForm?.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  stockConsumableItems.forEach((item) => {
    stockOrderState[item.id] = 0;
  });
  stockOrderStatusMode = "draft";
  submittedStockOrderRecord = null;
  lastStockSubmitErrorMessage = "";
  hideStockOrderSubmissionConfirmation();

  populateStockRequesterOptions();
  renderStockOrderItems();
  updateStockOrderPreview();
  loadStockOrderInventory();
  loadStockDuplicateCheckRequests();

  stockOrderRequesterNameInput.addEventListener("input", () => {
    hideStockOrderSubmissionConfirmation();
    if (["copied", "shared", "submitted", "submit-failed"].includes(stockOrderStatusMode)) {
      stockOrderStatusMode = "ready";
      submittedStockOrderRecord = null;
      lastStockSubmitErrorMessage = "";
    }
    updateStockOrderPreview();
  });

  stockOrderRequesterSelect.addEventListener("change", () => {
    hideStockOrderSubmissionConfirmation();
    if (["copied", "shared", "submitted", "submit-failed"].includes(stockOrderStatusMode)) {
      stockOrderStatusMode = "ready";
      submittedStockOrderRecord = null;
      lastStockSubmitErrorMessage = "";
    }
    updateStockOrderPreview();
  });
  stockOrderNoteInput?.addEventListener("input", () => {
    hideStockOrderSubmissionConfirmation();
    if (["copied", "shared", "submitted", "submit-failed"].includes(stockOrderStatusMode)) {
      stockOrderStatusMode = "ready";
      submittedStockOrderRecord = null;
      lastStockSubmitErrorMessage = "";
    }
    updateStockOrderPreview();
  });
  stockOrderRepeatReasonSelect?.addEventListener("change", () => {
    hideStockOrderSubmissionConfirmation();
    if (["copied", "shared", "submitted", "submit-failed"].includes(stockOrderStatusMode)) {
      stockOrderStatusMode = "ready";
      submittedStockOrderRecord = null;
      lastStockSubmitErrorMessage = "";
    }
    updateStockOrderPreview();
  });

  bindPressAction(submitStockOrderBtn, async () => {
    if (isSubmittingStockOrder) return;

    await loadStockDuplicateCheckRequests();

    const blockedReason = getStockSubmitBlockedReason();
    if (blockedReason) {
      showSelectionNotice(blockedReason);
      return;
    }

    const payload = buildStockOrderPayload();
    if (!payload.requestedBy || !payload.wardUnit || !payload.items.length) {
      showSelectionNotice("Add your name, ward / unit, and at least one item first.");
      return;
    }

    lastStockSubmitErrorMessage = "";
    isSubmittingStockOrder = true;
    updateStockOrderPreview();

    try {
      const response = await fetch(STOCK_ORDER_SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const serverMessage = String(result?.error || "").trim();
        const detailMessage = String(result?.detail || "").trim();
        const combinedMessage = [serverMessage, detailMessage].filter(Boolean).join(" - ");
        throw new Error(combinedMessage || `Submit failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => ({}));
      submittedStockOrderRecord = result?.request || null;
      stockOrderStatusMode = "submitted";
      const sheetSyncWarning = result?.sheetSync && result.sheetSync.ok === false
        ? " Order saved, but Google Sheets still needs attention."
        : "";
      const submittedRecord = submittedStockOrderRecord;
      addHomeRecentActivity({
        type: "stock-submit",
        title: `Last order: ${payload.wardUnit || "Ward not set"}`,
        detail: submittedStockOrderRecord?.id
          ? `${submittedStockOrderRecord.id} • Pending`
          : "Pending",
        actionType: "menu",
        actionValue: "stock"
      });
      showSelectionNotice(submittedStockOrderRecord?.id
        ? `Consumables request submitted. ID ${submittedStockOrderRecord.id}.${sheetSyncWarning}`
        : `Consumables request submitted.${sheetSyncWarning}`);
      resetStockOrderForm();
      showStockOrderSubmissionConfirmation(submittedRecord, payload);
      loadStockDuplicateCheckRequests();
    } catch (error) {
      submittedStockOrderRecord = null;
      stockOrderStatusMode = "submit-failed";
      hideStockOrderSubmissionConfirmation();
      const message = error instanceof Error ? error.message : "Unknown error";
      lastStockSubmitErrorMessage = "Request could not be submitted. Please try again or contact the lab.";
      console.error("Stock order submit failed", {
        submitUrl: STOCK_ORDER_SUBMIT_URL,
        requestedBy: payload?.requestedBy || "",
        wardUnit: payload?.wardUnit || "",
        lineItemCount: payload?.lineItemCount || 0,
        totalRequestedQuantity: payload?.totalRequestedQuantity || 0,
        error: message
      });
      showSelectionNotice(lastStockSubmitErrorMessage);
    } finally {
      isSubmittingStockOrder = false;
      updateStockOrderPreview();
    }
  });

  bindPressAction(copyStockOrderBtn, async () => {
    const requestText = buildStockOrderRequestText();
    if (copyStockOrderBtn.disabled) return;

    try {
      await navigator.clipboard.writeText(requestText);
      stockOrderStatusMode = "copied";
      updateStockOrderPreview();
      showSelectionNotice("Consumables request copied.");
    } catch {
      showSelectionNotice("Could not copy the consumables request on this device.");
    }
  });

  shareStockOrderWhatsappBtn?.addEventListener("click", (event) => {
    if (shareStockOrderWhatsappBtn.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }

    stockOrderStatusMode = "shared";
    updateStockOrderPreview();
  });

  bindPressAction(resetStockOrderBtn, () => {
    resetStockOrderForm();
    hideStockOrderSubmissionConfirmation();
  });

}

// Opens about section.
function openAboutSection(trigger = null) {
  closeDrawModal();
  closeProfileModal();
  closeSectionBrowseModal();
  closeContactFeedbackModal({ restoreFocus: false });
  closeLegalModal({ restoreFocus: false });
  openAboutInfoModal(trigger);
}

// Navigates home.
function goHome() {
  if (!isHomePage) {
    window.location.assign("./index.html");
    return;
  }

  closeDrawModal();
  closeProfileModal();
  closeLegalModal({ restoreFocus: false });
  setSiteMenuOpen(false);
  setThemePanelOpen(false);
  clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: false, clearStatus: true });

  setSectionView("", { historyMode: "push", scrollToTop: false, clearSearch: true });
  setMobileBottomNavActiveState();
  scrollHomeViewportToTop();
}

// Checks whether scroll search field into view.
function shouldScrollSearchFieldIntoView(target) {
  if (!target || typeof target.getBoundingClientRect !== "function") return true;

  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!viewportHeight) return true;

  const topMargin = 18;
  const bottomMargin = 18;
  return rect.top < topMargin || rect.bottom > viewportHeight - bottomMargin;
}

// Focuses main search field.
function focusMainSearchField({ scroll = "always" } = {}) {
  if (!searchInput) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const target = searchInput.closest(".search-box") || searchInput;
  const shouldScroll = scroll === "always"
    || (scroll === "if-needed" && shouldScrollSearchFieldIntoView(target));
  // Focuses input.
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

// Scrolls to results top.
function scrollToResultsTop() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });
}

// Checks whether preserve search focus on mobile.
function shouldPreserveSearchFocusOnMobile() {
  return Boolean(
    searchInput &&
    document.activeElement === searchInput &&
    window.matchMedia("(max-width: 600px)").matches
  );
}

// Restores search focus without scroll.
function restoreSearchFocusWithoutScroll() {
  if (!searchInput) return;
  const cursorEnd = searchInput.value.length;
  searchInput.focus({ preventScroll: true });
  if (typeof searchInput.setSelectionRange === "function") {
    searchInput.setSelectionRange(cursorEnd, cursorEnd);
  }
}

// Clears search for next plan entry.
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
    items: [{ key: "choice:Green|Gold/Yellow", label: "Green or Gold/Yellow", count: 1 }]
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
    "Differential Count (WBC)",
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
const HOME_TIP_CYCLE_MS = 8200;
const HOME_TIP_FALLBACK = "Label each sample immediately at bedside to reduce ID errors.";

const stockRequesterGroups = [
  {
    label: "Military sickbays / clinics",
    options: [
      "IMM (Institute for Maritime Medicine)",
      "Wingfield",
      "Ysterplaat",
      "Youngsfield",
      "Overberg",
      "Gordon's Bay",
      "Eerste Rivier",
      "Langebaan",
      "Saldanha"
    ]
  },
  {
    label: "Hospital wards / units",
    options: [
      "Ward 7 / Paeds",
      "Ward 8",
      "Ward 9",
      "Ward 11",
      "Casualty",
      "ICU",
      "MOPD",
      "GOPD",
      "Gynae",
      "Maternity Ward",
      "Theatre",
      "Oncology"
    ]
  }
];

function createTubeConsumableItems(colorKey, label, options = {}) {
  const {
    traySize = 100,
    maxTrays = 1,
    maxSingles = 99,
    note = "",
    singlesOnly = false
  } = options;
  const sheetPrefix = `${colorKey}Tube`;
  const items = [];

  if (!singlesOnly) {
    items.push({
      id: `${colorKey}-tubes-tray`,
      label,
      variantLabel: "Tray",
      unitType: "tray",
      traySize,
      maxQuantity: maxTrays,
      note: `${note} Tray orders are limited to ${maxTrays} ${maxTrays === 1 ? "tray" : "trays"}.`,
      sheetColumnKey: `${colorKey}Tubes`,
      sheetTrayColumnKey: `${sheetPrefix}Trays`
    });
  }

  items.push({
    id: `${colorKey}-tubes-single`,
    label,
    variantLabel: "Singles",
    unitType: "each",
    maxQuantity: maxSingles,
    note: singlesOnly
      ? `${note} Maximum ${maxSingles} tube${maxSingles === 1 ? "" : "s"} per request.`
      : "Order single tubes when a full tray is not needed.",
    sheetColumnKey: `${colorKey}Tubes`,
    sheetSingleColumnKey: `${sheetPrefix}Singles`
  });

  return items;
}

const stockConsumableItems = [
  ...createTubeConsumableItems("yellow", "Yellow (Gel) tubes", { maxTrays: 2, note: "Serum tubes." }),
  ...createTubeConsumableItems("grey", "Grey (Fluoride) tubes", { note: "Fluoride tubes." }),
  ...createTubeConsumableItems("purple", "Purple (EDTA) tubes", { note: "EDTA tubes." }),
  ...createTubeConsumableItems("green", "Green (Heparin) tubes", { note: "Heparin tubes." }),
  ...createTubeConsumableItems("blue", "Blue (Citrate) tubes", { note: "Citrate tubes." }),
  ...createTubeConsumableItems("pearl", "Pearl tubes", { note: "Pearl/PPT tubes." }),
  ...createTubeConsumableItems("tan", "Tan tubes", { note: "Tan tubes." }),
  ...createTubeConsumableItems("pink", "Pink (Blood Bank) tubes", {
    singlesOnly: true,
    maxSingles: 5,
    note: "Blood bank tubes must go with the blood bank form."
  }),
  {
    id: "paediatric-yellow-microtainer",
    label: "Paediatric Yellow (Gel) microtainer",
    unitType: "each",
    maxQuantity: 50,
    note: "Requested individually.",
    sheetColumnKey: "PaediatricYellowMicrotainer"
  },
  {
    id: "paediatric-purple-microtainer",
    label: "Paediatric Purple (EDTA) microtainer",
    unitType: "each",
    maxQuantity: 50,
    note: "Requested individually.",
    sheetColumnKey: "PaediatricPurpleMicrotainer"
  },
  {
    id: "paediatric-grey-microtainer",
    label: "Paediatric Grey (Fluoride) microtainer",
    unitType: "each",
    maxQuantity: 50,
    note: "Requested individually.",
    sheetColumnKey: "PaediatricGreyMicrotainer"
  },
  { id: "specimen-jars", label: "Specimen jars", unitType: "each", maxQuantity: 50, note: "Requested individually." },
  { id: "lab-bags", label: "Lab bags", unitType: "packet", packetSize: 50, note: "Packed in 50s." },
  { id: "blood-culture-bottle-aerobic", label: "Aerobic Blood Culture Bottle (Blue)", unitType: "each", note: "Requested individually." },
  { id: "blood-culture-bottle-paediatric-aerobic", label: "Paediatric Aerobic Blood Culture Bottle (Yellow)", unitType: "each", note: "Requested individually." },
  { id: "blood-culture-bottle-anaerobic", label: "Anaerobic Blood Culture Bottle (Orange)", unitType: "each", note: "Requested individually." },
  { id: "blood-culture-bottle-fungal-mycology", label: "Fungal / Mycology Blood Culture Bottle (Green)", unitType: "each", note: "Requested individually." },
  { id: "blood-culture-bottle-mycobacterial-tb", label: "Mycobacterial Blood Culture Bottle (Red)", unitType: "each", note: "Requested individually." },
  { id: "blood-gas-syringes", label: "Blood gas syringes", unitType: "each", note: "Requested individually." },
  { id: "swabs-transport-media", label: "Swabs with transport media", unitType: "each", note: "Requested individually." }
];

// Section metadata drives the browse chips, labels, and icons shown on the home screen.
const sectionMeta = {
  chemistry: { label: "Biochemistry" },
  haematology: { label: "Haematology" },
  micro_virology: { label: "Microbiology" },
  immunology: { label: "Serology" },
  metabolic_genetic: { label: "Molecular Biology / Genetics" },
  cytohistology: { label: "Cytology / Histology" },
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
  cytohistology: `<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9 6V4h6v2"/><path d="M9 10h6"/><circle cx="10" cy="13.5" r="1.7"/><circle cx="15" cy="13.5" r="1.2"/></svg>`,
  cytology: `<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="10" cy="12" r="2.2"/><circle cx="15" cy="12" r="1.5"/><path d="M7 18v2"/><path d="M17 18v2"/></svg>`,
  histology: `<svg viewBox="0 0 24 24"><path d="M5 6h14v12H5z"/><path d="M9 6V4h6v2"/><path d="M9 10h6"/><path d="M9 14h6"/></svg>`,
  general: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/></svg>`
};

const sectionFilterIdsBySection = {
  cytohistology: ["cytology", "histology"]
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

// Gets section icon markup.
function getSectionIconMarkup(groupId) {
  return sectionIconById[groupId] || sectionIconById.general;
}

// Checks whether section browse groups.
function hasSectionBrowseGroups(sectionId = activeSectionGroup) {
  return Boolean(sectionBrowseGroups[sectionId]?.length);
}

// Gets active browse group.
function getActiveBrowseGroup(sectionId = activeSectionGroup) {
  return activeBrowseGroupBySection[sectionId] || "";
}

// Gets active browse subsections.
function getActiveBrowseSubsections(sectionId = activeSectionGroup) {
  const activeBrowseGroup = getActiveBrowseGroup(sectionId);
  return sectionBrowseGroupById[sectionId]?.[activeBrowseGroup]?.subsections || [];
}

// Gets active browse group label.
function getActiveBrowseGroupLabel(sectionId = activeSectionGroup) {
  const activeBrowseGroup = getActiveBrowseGroup(sectionId);
  return sectionBrowseGroupById[sectionId]?.[activeBrowseGroup]?.label || "";
}

// Checks whether browse overview visible.
function isBrowseOverviewVisible(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  return hasSectionBrowseGroups(sectionId) && !String(query || "").trim() && !getActiveBrowseGroup(sectionId);
}

// Checks whether keep pre search panel visible.
function shouldKeepPreSearchPanelVisible(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  return isBrowseOverviewVisible(sectionId, query);
}

// Checks whether clinical workup state.
function hasClinicalWorkupState() {
  return !isFindMyTestPage && Boolean(clinicalWorkupOutput);
}

// Checks whether results view active.
function isResultsViewActive(sectionId = activeSectionGroup, query = searchInput?.value || "") {
  if (String(query || "").trim()) return true;
  if (!sectionId && hasClinicalWorkupState()) return true;
  if (!sectionId) return false;
  return !isBrowseOverviewVisible(sectionId, query);
}

// Gets results context label.
function getResultsContextLabel(sectionId = activeSectionGroup) {
  if (!sectionId || !sectionMeta[sectionId]) return "";

  const sectionLabel = sectionMeta[sectionId].label;
  const browseLabel = getActiveBrowseGroupLabel(sectionId);
  return browseLabel ? `${sectionLabel}: ${browseLabel}` : sectionLabel;
}

// Updates section context bar.
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

// Opens section browse modal.
function openSectionBrowseModal(sectionId, trigger = null) {
  if (!sectionBrowseModal || !sectionBrowseModalTitle || !sectionBrowseModalCopy || !sectionBrowseModalGrid) return false;

  const section = sectionMeta[sectionId];
  const browseGroups = sectionBrowseGroups[sectionId] || [];
  if (!section || !browseGroups.length) return false;

  const activeBrowseGroup = getActiveBrowseGroup(sectionId);
  activeSectionBrowseModalSectionId = sectionId;
  lastSectionBrowseModalTrigger = trigger || document.activeElement;
  sectionBrowseModal.dataset.section = sectionId;
  sectionBrowseModalTitle.textContent = section.label;
  sectionBrowseModalCopy.textContent = `Choose a section to browse ${section.label.toLowerCase()} tests.`;
  sectionBrowseModalGrid.innerHTML = browseGroups.map((group) => `
    <button
      type="button"
      class="section-browse-option${activeBrowseGroup === group.id ? " active" : ""}"
      data-section-modal-browse="${group.id}"
      data-section-modal-parent="${sectionId}"
      aria-pressed="${activeBrowseGroup === group.id ? "true" : "false"}"
    >
      <span class="section-browse-option-icon" aria-hidden="true">${group.icon}</span>
      <span class="section-browse-option-label">${group.label}</span>
    </button>
  `).join("");

  sectionBrowseModalGrid.querySelectorAll("button[data-section-modal-browse]").forEach((button) => {
    button.addEventListener("click", () => {
      const browseId = button.getAttribute("data-section-modal-browse") || "";
      const parentSectionId = button.getAttribute("data-section-modal-parent") || "";
      if (!parentSectionId || !browseId) return;

      closeSectionBrowseModal({ restoreFocus: false });
      setSectionView(parentSectionId, {
        browseGroup: browseId,
        historyMode: "push",
        scrollToTop: true
      });
    });
  });

  sectionBrowseModal.hidden = false;
  updateGroupChipState();
  syncModalOpenClass();

  const firstOption = sectionBrowseModalGrid.querySelector(".section-browse-option");
  window.requestAnimationFrame(() => {
    firstOption?.focus({ preventScroll: true });
  });

  return true;
}

// Closes section browse modal.
function closeSectionBrowseModal({ restoreFocus = true } = {}) {
  if (!sectionBrowseModal) return;

  sectionBrowseModal.hidden = true;
  delete sectionBrowseModal.dataset.section;
  activeSectionBrowseModalSectionId = "";
  syncModalOpenClass();
  updateGroupChipState();

  if (restoreFocus && lastSectionBrowseModalTrigger && typeof lastSectionBrowseModalTrigger.focus === "function") {
    window.requestAnimationFrame(() => {
      lastSectionBrowseModalTrigger.focus({ preventScroll: true });
    });
  }

  lastSectionBrowseModalTrigger = null;
}

const chipGroups = [
  "chemistry",
  "haematology",
  "micro_virology",
  "immunology",
  "metabolic_genetic",
  "cytohistology"
];

const aliasByName = {
  "U&E": ["U+E", "UE", "Renal profile", "Kidney function", "U and E"],
  "CMP": ["CMP profile", "Bone profile", "Calcium magnesium phosphate profile"],
  "FBC": ["CBC", "Complete blood count", "Full blood count"],
  "Blood Smear / Peripheral Blood Film": [
    "Smear",
    "Blood smear",
    "Peripheral smear",
    "Peripheral blood smear",
    "Blood film",
    "Peripheral blood film",
    "PBF",
    "PBS",
    "Morphology",
    "Blood morphology",
    "Film review",
    "Manual film"
  ],
  "Differential Count (WBC)": [
    "Diff",
    "Differential",
    "Differential count",
    "WBC differential",
    "White cell differential",
    "White blood cell differential",
    "Leucocyte differential",
    "Leukocyte differential",
    "Full differential",
    "Manual differential",
    "FBC diff",
    "CBC diff"
  ],
  "Coeliac Disease Screen (Anti-tTG IgA)": [
    "Coeliac",
    "Celiac",
    "Coeliac disease",
    "Celiac disease",
    "Coeliac screen",
    "Celiac screen",
    "Coeliac serology",
    "Celiac serology",
    "Anti transglutaminase",
    "Anti-transglutaminase",
    "Anti tissue transglutaminase",
    "Anti-tissue transglutaminase",
    "Tissue transglutaminase antibody",
    "Transglutaminase antibody",
    "tTG",
    "tTG IgA",
    "TTGA",
    "Anti tTG IgA",
    "Gluten antibody",
    "Gluten sensitivity blood test"
  ],
  "Plasma Homocysteine": [
    "Homocysteine",
    "Homocystiene",
    "Homocystein",
    "Homocystine",
    "Plasma homocysteine",
    "Total homocysteine",
    "Fasting homocysteine",
    "HCY",
    "Hcy"
  ],
  "Anti-Parietal Cell Antibody (APCA)": [
    "Anti parietal cell antibody",
    "Anti-parietal cell antibody",
    "Parietal cell antibody",
    "Parietal cell antibodies",
    "Gastric parietal cell antibody",
    "Gastric parietal cell antibodies",
    "APCA",
    "PCA",
    "GPC antibody",
    "Pernicious anaemia antibody",
    "Pernicious anemia antibody"
  ],
  "Intrinsic Factor Antibody (IFA)": [
    "Intrinsic factor antibody",
    "Intrinsic factor antibodies",
    "Anti intrinsic factor",
    "Anti-intrinsic factor",
    "IF antibody",
    "IF antibodies",
    "IFA",
    "IFAB",
    "GIFAB",
    "Gastric intrinsic factor antibody",
    "Pernicious anaemia antibody",
    "Pernicious anemia antibody"
  ],
  "Lipid Profile / Lipogram": ["Lipid profile", "Lipogram", "Lipid", "Lipids", "Lipid panel"],
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
  "Uric Acid": ["UA", "Urate", "Serum uric acid", "S-urate", "S urate"],
  "RBC Count": ["RBC", "Red cell count"],
  "Platelet Count": ["Platelets", "PLT"],
  "Haematocrit (HCT)": ["HCT", "Hematocrit"],
  "Sodium": ["Na"],
  "Potassium": ["K"],
  "Chloride": ["Cl"],
  "Calcium": ["Ca"],
  "Magnesium": ["Mg"],
  "Phosphate": ["PO4", "PO4-3", "Phos"],
  "Liver Function Tests (LFT)": ["LFT", "Liver profile", "Hepatic profile", "LFTs"],
  Haptoglobin: ["Haptoglobin level"],
  "Fasting Glucose": [
    "Glucose Fasting",
    "Glucose",
    "Fasting",
    "Fasting sugar",
    "Blood sugar fasting",
    "Fasting glucose",
    "F glucose"
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
  "HbA1c": ["A1c", "Glycated haemoglobin", "Glycated hemoglobin", "HBA1C", "HbA1C"],
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
    "Thyroid function test",
    "Thy funct",
    "TSH+T4",
    "T4+TSH"
  ],
  "ACTH": [
    "Adrenocorticotropic hormone",
    "Adreno corticotropic hormone",
    "Corticotropin",
    "ACTH hormone"
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
  "ANA (Antinuclear Antibody)": [
    "ANA",
    "A-NA",
    "ANA test",
    "Antinuclear antibody"
  ],
  "ANA Screen and Reflex ENA Antibodies": [
    "ANA Screen",
    "ANA Reflex ENA",
    "ANA Screen and Reflex ENA",
    "A-NA screen"
  ],
  "Anti-dsDNA": [
    "Anti dsDNA",
    "anti ds dna",
    "anti-ds dna",
    "anti double stranded dna",
    "anti double stranded deoxyribonucleic acid"
  ],
  "dsDNA (Quantitative)": [
    "dsDNA",
    "double stranded dna",
    "double-stranded dna",
    "anti double stranded dna"
  ],
  "Anti-CCP Antibody": ["CCP", "ACCP", "Anti CCP"],
  "Malaria Profile": ["Malaria panel", "Malaria screen", "Malaria studies"],
  "Parathyroid Hormone (PTH)": ["PTH", "Parathyroid hormone", "Parathormone"],
  "Fe Studies": ["Iron Studies", "Iron", "Fe", "Fe Studies", "Iron study", "Fe study"],
  "Ammonia": ["NH3", "Ammonia plasma"],
  "TB PCR (GeneXpert) - Sputum": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR sputum", "GeneXpert sputum"],
  "TB PCR (GeneXpert) - Urine": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR urine", "GeneXpert urine"],
  "TB PCR (GeneXpert) - Fluid": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR fluid", "GeneXpert fluid"],
  "TB PCR (GeneXpert) - Tissue": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR tissue", "GeneXpert tissue"],
  "TB PCR (GeneXpert) - Stool": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR stool", "GeneXpert stool"],
  "TB PCR (GeneXpert) - Swab": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR swab", "GeneXpert swab"],
  "TB PCR (GeneXpert) - CSF": ["TB PCR (GeneXpert)", "TB GeneXpert", "Xpert", "GeneXpert", "TB Xpert", "TB PCR csf", "GeneXpert csf"],
  "TB Culture - Sputum": ["TB Culture", "TB culture sputum", "Mycobacterial culture sputum"],
  "TB Culture - Urine": ["TB Culture", "TB culture urine", "Mycobacterial culture urine"],
  "TB Culture - Fluid": ["TB Culture", "TB culture fluid", "Mycobacterial culture fluid"],
  "TB Culture - Tissue": ["TB Culture", "TB culture tissue", "Mycobacterial culture tissue"],
  "TB Culture - Stool": ["TB Culture", "TB culture stool", "Mycobacterial culture stool"],
  "TB Culture - Swab": ["TB Culture", "TB culture swab", "Mycobacterial culture swab"],
  "TB Culture - CSF": ["TB Culture", "TB culture csf", "Mycobacterial culture csf"],
  "CSF Profile": [
    "LP profile",
    "Lumbar puncture profile",
    "CSF screen",
    "CSF workup"
  ],
  "Urine MCS": ["Urine culture", "MC&S", "Urine MCS", "STI", "STD"],
  "Sputum MCS": ["Sputum culture", "MC&S", "Sputum MCS"],
  "Stool MCS": ["Stool culture", "MC&S", "Faeces MCS", "Feces MCS", "Faecal MCS"],
  "Swab MCS": ["Swab culture", "MC&S", "Swab MCS"],
  "Fluid MCS": ["Fluid culture", "MC&S", "Fluid MCS"],
  "Tissue MCS": ["Tissue culture", "MC&S", "Tissue MCS"],
  "CSF MCS": ["CSF culture", "MC&S"],
  "Blood Culture": ["Blood culture", "Blood MCS", "Blood M/C/S"],
  "Malaria Smear (Thick and Thin)": ["Malaria screen (microscopy)", "Malaria smear", "Malaria blood film"],
  "Total Testosterone (+SHBG if Female)": ["Testosterone", "Testosterone total"],
  "Folate (Serum)": ["Folate", "Folic acid", "Serum folate"],
  "Vitamin B12": ["Vit B12", "Vitamin B12", "VITB12", "B12"],
  "Vitamin D (25OH)": ["Vit D", "Vitamin D", "VitD", "VITD", "25 OH vitamin D", "25-OH vitamin D"],
  "NT-proBNP": ["BNP", "Pro-BNP", "proBNP", "NTproBNP"],
  "Immunoglobulin Profile (IgG, IgA, IgM)": ["Immunoglobulins", "Immunoglobulin profile", "Ig profile", "IgG IgA IgM"],
  "HE4": ["Human epididymis protein 4"],
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
  "XDP (D-Dimer)": [
    "D",
    "DD",
    "Dimer",
    "D-Dimer",
    "D dimer",
    "XDP",
    "XDP D-Dimer",
    "XDP D dimer"
  ],
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

// Escapes reg exp.
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Escapes HTML.
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Normalizes turnaround time.
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

// Normalizes tube color.
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
  { key: "Swab Transport Medium", pattern: /\bswab in transport medium\b|\btransport medium\b/ },
  { key: "Specimen Jar", pattern: /\b(?:dark\s+blue\s+|blue\s+)?(?:sterile\s+)?specimen jar\b/ },
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

// Gets tube groups.
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
  if (groups.includes("Specimen Jar")) {
    return groups.filter((group) => group !== "Blue" && group !== "Urine Container");
  }
  return groups;
}

// Gets tube swatch color.
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
    "Swab Transport Medium": "#0f766e",
    "Specimen Jar": "#1d4ed8",
    "Urine Container": "#f8d66d",
    "24hr Urine Container": "#f59e0b",
    Red: "#ef4444",
    Black: "#111827",
    "Blood Culture Bottles": "#a16207"
  };

  return swatch[tubeGroup] || "#94a3b8";
}

const tubeCardStyleTokens = {
  yellow: {
    background: "rgba(255, 249, 222, 0.9)",
    border: "rgba(202, 138, 4, 0.2)",
    accent: "rgba(202, 138, 4, 0.28)",
    chip: "rgba(254, 243, 199, 0.9)"
  },
  purple: {
    background: "rgba(248, 245, 255, 0.92)",
    border: "rgba(124, 58, 237, 0.16)",
    accent: "rgba(124, 58, 237, 0.22)",
    chip: "rgba(243, 232, 255, 0.78)"
  },
  blue: {
    background: "rgba(238, 248, 253, 0.92)",
    border: "rgba(14, 116, 144, 0.16)",
    accent: "rgba(14, 116, 144, 0.22)",
    chip: "rgba(224, 242, 254, 0.82)"
  },
  green: {
    background: "rgba(240, 253, 246, 0.9)",
    border: "rgba(22, 101, 52, 0.14)",
    accent: "rgba(22, 101, 52, 0.2)",
    chip: "rgba(220, 252, 231, 0.76)"
  },
  grey: {
    background: "rgba(246, 248, 250, 0.92)",
    border: "rgba(100, 116, 139, 0.16)",
    accent: "rgba(100, 116, 139, 0.22)",
    chip: "rgba(241, 245, 249, 0.86)"
  },
  pearl: {
    background: "rgba(248, 247, 252, 0.92)",
    border: "rgba(129, 140, 168, 0.16)",
    accent: "rgba(129, 140, 168, 0.22)",
    chip: "rgba(244, 243, 248, 0.86)"
  },
  tan: {
    background: "rgba(251, 247, 240, 0.92)",
    border: "rgba(146, 104, 63, 0.16)",
    accent: "rgba(146, 104, 63, 0.22)",
    chip: "rgba(245, 235, 220, 0.78)"
  },
  pink: {
    background: "rgba(253, 244, 248, 0.9)",
    border: "rgba(190, 24, 93, 0.14)",
    accent: "rgba(190, 24, 93, 0.2)",
    chip: "rgba(252, 231, 243, 0.74)"
  },
  neutral: {
    background: "rgba(249, 251, 252, 0.88)",
    border: "rgba(100, 116, 139, 0.14)",
    accent: "rgba(100, 116, 139, 0.18)",
    chip: "rgba(248, 250, 252, 0.86)"
  }
};

function getTubeCardStyleKey(tubeGroup) {
  const keyByTubeGroup = {
    Tan: "tan",
    Purple: "purple",
    Pink: "pink",
    Blue: "blue",
    "Gold/Yellow": "yellow",
    "Pearl/White": "pearl",
    Green: "green",
    Gray: "grey"
  };

  return keyByTubeGroup[tubeGroup] || "neutral";
}

function getTubeCardStyleData(tubeGroups = []) {
  const styleKeys = [...new Set(tubeGroups.map(getTubeCardStyleKey).filter(Boolean))];
  const activeStyleKeys = styleKeys.length && styleKeys.length <= 2 ? styleKeys : ["neutral"];
  const firstStyle = tubeCardStyleTokens[activeStyleKeys[0]] || tubeCardStyleTokens.neutral;
  const secondStyle = tubeCardStyleTokens[activeStyleKeys[1]] || firstStyle;
  const isSplit = activeStyleKeys.length === 2;

  return {
    className: `tube-tinted-card${isSplit ? " tube-card-split" : ""}`,
    dataTube: activeStyleKeys[0],
    dataTubes: activeStyleKeys.join(","),
    style: [
      `--tube-card-bg-one: ${firstStyle.background}`,
      `--tube-card-bg-two: ${secondStyle.background}`,
      `--tube-card-border: ${isSplit ? secondStyle.border : firstStyle.border}`,
      `--tube-card-accent-one: ${firstStyle.accent}`,
      `--tube-card-accent-two: ${secondStyle.accent}`,
      `--tube-card-chip-bg: ${firstStyle.chip}`
    ].join("; ")
  };
}

// Gets tube additive label.
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
    "Swab Transport Medium": "Transport medium",
    "Specimen Jar": "Sterile container",
    "Urine Container": "Sterile container",
    "24hr Urine Container": "24-hour collection",
    Red: "Plain",
    Black: "Sodium citrate",
    "Blood Culture Bottles": "Culture media"
  };

  return additiveByGroup[tubeGroup] || "";
}

// Gets tube icon modifier class.
function getTubeIconModifierClass(tubeGroup) {
  if (tubeGroup === "Pearl/White") return " tube-icon-pearl";
  if (tubeGroup === "Swab Transport Medium") return " tube-icon-swab-medium";
  if (tubeGroup === "Specimen Jar") return " tube-icon-specimen-jar";
  if (tubeGroup === "Urine Container") return " tube-icon-urine-container";
  if (tubeGroup === "24hr Urine Container") return " tube-icon-urine-24hr";
  return "";
}

// Gets tube visual markup.
function getTubeVisualMarkup(tubeGroup, sizeClass = "") {
  return `<span class="tube-icon${sizeClass}${getTubeIconModifierClass(tubeGroup)}" style="--tube-color: ${getTubeSwatchColor(tubeGroup)};" aria-hidden="true"></span>`;
}

const NON_TUBE_COLLECTION_GROUPS = new Set([
  "Specimen Jar",
  "Swab Transport Medium",
  "Urine Container",
  "24hr Urine Container",
  "Blood Culture Bottles"
]);

function isTubeLikeCollectionGroup(group) {
  return !NON_TUBE_COLLECTION_GROUPS.has(String(group || "").trim());
}

function getCollectionFieldLabel(groups = []) {
  if (!groups.length) return "Collection";
  return groups.every((group) => isTubeLikeCollectionGroup(group)) ? "Tube" : "Collection";
}

function planIncludesNonTubeItems(plan) {
  return (plan?.items || []).some((item) => {
    const alternativeGroups = getPlanItemAlternativeGroups(item);
    const groups = alternativeGroups.length ? alternativeGroups : [item.key];
    return groups.some((group) => !isTubeLikeCollectionGroup(group));
  });
}

function formatPlanCountLabel(count, plan) {
  const noun = planIncludesNonTubeItems(plan) ? "collection item" : "tube";
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

// Checks whether alternative tube choice.
function isAlternativeTubeChoice(tubeColorValue, tubeGroups = []) {
  if (tubeGroups.length < 2) return false;

  const text = String(tubeColorValue || "");
  if (/\+/.test(text)) return false;

  return /(preferred|acceptable|alternate|alternative|\bor\b|\/)/i.test(text);
}

// Gets selected tests.
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

// Gets expanded profile members.
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

// Gets selected profiles containing test.
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

// Gets already covered selection message.
function getAlreadyCoveredSelectionMessage(testName, selectionSet = selectedTestNames) {
  const coveringProfiles = getSelectedProfilesContainingTest(testName, selectionSet);
  if (!coveringProfiles.length) return "";

  const itemType = Object.prototype.hasOwnProperty.call(profileComponentsByName, testName) ? "profile" : "test";
  const profileList = coveringProfiles.length > 2
    ? `${coveringProfiles.slice(0, 2).join(", ")} +${coveringProfiles.length - 2} more`
    : coveringProfiles.join("\n");

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
    tests: ["NT-proBNP", "Cardiac Profile"]
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
    tests: ["Lipase", "Amylase", "Liver Function Tests (LFT)", "FBC", "CRP"]
  },
  {
    id: "coeliac-disease",
    label: "suspected coeliac disease",
    terms: ["coeliac disease", "celiac disease", "coeliac sprue", "celiac sprue"],
    tests: ["Coeliac Disease Screen (Anti-tTG IgA)", "Immunoglobulin A (IgA)"]
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
  { id: "psychosis", label: "Psychosis / agitation", terms: ["psychosis", "acute psychosis", "hallucinations", "delusions", "behavioural disturbance", "behavioral disturbance", "agitation"] },
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
    tests: ["NT-proBNP", "Cardiac Profile"],
    rationale: "Volume overload or heart-failure concerns often lead to natriuretic peptide testing and may need cardiac marker support.",
    caution: "Interpret NT-proBNP with age, renal function, and the local heart-failure pathway."
  },
  {
    id: "psychosis-substance",
    title: "Psychosis / substance screen support",
    matchAny: ["psychosis", "acute psychosis", "hallucinations", "delusions", "behavioural disturbance", "behavioral disturbance", "agitation", "substance-induced psychosis"],
    tests: ["Drugs of Abuse Screen (Urine)"],
    rationale: "Psychosis or behavioural disturbance may justify a drugs-of-abuse screen when substance exposure is part of the differential.",
    caution: "Use the local mental-health, intoxication, and emergency pathway when agitation, violence, overdose, or reduced consciousness is present."
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
    tests: ["Liver Function Tests (LFT)", "FBC", "Coagulation Studies", "U&E"],
    rationale: "Jaundice or liver injury concerns commonly start with liver tests plus baseline blood count, clotting, and renal support.",
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
    tests: ["Lipase", "Amylase", "Liver Function Tests (LFT)", "FBC", "CRP"],
    rationale: "Pancreatitis-style pain patterns commonly prompt pancreatic enzymes, biliary screen support, and baseline inflammatory markers.",
    caution: "Abdominal emergencies still require direct clinical review and imaging decisions outside this tool; widen the workup further if sepsis or infected necrosis is suspected."
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

// Joins with and.
function joinWithAnd(values = []) {
  const items = dedupeStrings(values);
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Lowercases first character.
function lowercaseFirstCharacter(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// Truncates text.
function truncateText(value, maxLength = 96) {
  const text = String(value || "").trim();
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

// Capitalizes phrase.
function capitalizePhrase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

// Checks whether normalized phrase.
function hasNormalizedPhrase(haystack, phrase) {
  const normalizedHaystack = normalizeForSearch(haystack);
  const normalizedPhrase = normalizeForSearch(phrase);
  if (!normalizedHaystack || !normalizedPhrase) return false;
  if (normalizedHaystack === normalizedPhrase) return true;
  const pattern = new RegExp(`(?:^| )${escapeRegExp(normalizedPhrase)}(?:$| )`);
  return pattern.test(normalizedHaystack);
}

// Gets clinical workup sex label.
function getClinicalWorkupSexLabel(value = "") {
  if (value === "female") return "Female";
  if (value === "male") return "Male";
  if (value === "other") return "Other";
  return "";
}

// Checks whether pregnancy context.
function hasPregnancyContext(input) {
  if (!input) return false;
  return input.pregnancy === "pregnant"
    || hasNormalizedPhrase(input.normalizedBlob, "pregnancy")
    || hasNormalizedPhrase(input.normalizedBlob, "pregnant")
    || hasNormalizedPhrase(input.normalizedBlob, "antenatal")
    || hasNormalizedPhrase(input.normalizedBlob, "prenatal")
    || hasNormalizedPhrase(input.normalizedBlob, "gestational");
}

// Checks whether clinical workup rule demographics.
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

// Evaluates clinical workup rule.
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

// Gets supplemental clinical shortcut rules.
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

// Gets clinical workup recommended tests.
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

// Gets clinical workup input.
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

// Builds clinical workup tags.
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

// Builds clinical workup summary.
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

// Builds clinical workup output.
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

// Checks whether clinical workup suggestions.
function hasClinicalWorkupSuggestions() {
  return Boolean(clinicalWorkupOutput?.tests?.length);
}

// Sets clinical workup status.
function setClinicalWorkupStatus(message = "") {
  if (!clinicalWorkupStatus) return;
  clinicalWorkupStatus.textContent = String(message || "").trim();
}

// Renders clinical workup chips.
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

// Renders clinical workup results.
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
    ? "Suggestions"
    : (output.emptyStateTitle || "No strong match yet");
  clinicalWorkupResultsCopy.textContent = output.summary;
  clinicalWorkupResultTags.innerHTML = "";

  // When suggestions exist, the test rows already carry the matched context.
  if (output.tests.length) {
    clinicalWorkupRuleList.innerHTML = "";
    return;
  }

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

// Clears clinical workup inputs.
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

// Clears clinical workup output.
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

// Sets find my test suggestions.
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

// Prepares find my test results view.
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

// Add tests to plan.
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

// Removes tests from plan.
function removeTestsFromPlan(testNames = [], { openDrawPlan: shouldOpenDrawPlan = false } = {}) {
  const nextSelection = new Set(selectedTestNames);

  testNames.forEach((testName) => nextSelection.delete(testName));
  setSelectedTests(nextSelection);

  if (shouldOpenDrawPlan) {
    openDrawModal();
  }

  return getResolvedDrawPlan(getSelectedTests());
}

// Clears Tube Plan selections.
function clearTubePlan({ openDrawPlan: shouldOpenDrawPlan = false } = {}) {
  setSelectedTests(new Set());

  if (shouldOpenDrawPlan) {
    openDrawModal();
  }

  return getResolvedDrawPlan(getSelectedTests());
}

// Runs clinical workup.
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

// Initializes clinical workup.
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

// Gets matched profile query.
function getMatchedProfileQuery(normalizedQuery) {
  if (!normalizedQuery) return "";
  for (const profileName of profileNames) {
    if (profileQueryTermsByName[profileName]?.has(normalizedQuery)) return profileName;
  }
  return "";
}

// Gets matched condition shortcut.
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

// Builds the Find My Test handoff when a condition search lands in Find My Tube.
function getFindMyTestHandoffMarkup(queryLabel = "") {
  const escapedQuery = escapeHtml(queryLabel || "this condition");

  return `
    <div class="no-results no-results-handoff-card">
      <p class="no-results-handoff">Find My Tube works best for test and profile names.</p>
      <p>Use Find My Test for condition-based searches like <strong>${escapedQuery}</strong>.</p>
      <a class="no-results-link-btn" href="./index.html?tool=find-my-test">Open Find My Test</a>
    </div>
  `;
}

// Gets exact name matches.
function getExactNameMatches(normalizedQuery, testList = enrichedTests) {
  if (!normalizedQuery) return [];
  return testList.filter((test) => {
    const exactTerms = [test.name, ...(aliasByName[test.name] || [])]
      .map((term) => normalizeForSearch(term))
      .filter(Boolean);
    return exactTerms.includes(normalizedQuery);
  });
}

// Gets supplementary profile matches.
function getSupplementaryProfileMatches(normalizedQuery) {
  if (!normalizedQuery) return [];

  if (bloodGasComponentQueryTerms.has(normalizedQuery)) {
    return ["Blood Gases"];
  }

  return [];
}

// Gets tests by names.
function getTestsByNames(testNames = []) {
  return testNames
    .map((testName) => enrichedTests.find((test) => test.name === testName))
    .filter(Boolean);
}

// Collapses profile selections.
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

// Updates draw selection tools.
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
        ? "Confirm clearing all tests from current Tube Plan"
        : "Clear all tests from current Tube Plan"
    );
  }
}

// Resets clear draw selection confirmation.
function resetClearDrawSelectionConfirmation({ update = true } = {}) {
  window.clearTimeout(clearDrawSelectionConfirmTimeoutId);
  isClearDrawSelectionConfirming = false;
  if (update) updateDrawSelectionTools();
}

// Requests clear draw selection confirmation.
function requestClearDrawSelectionConfirmation() {
  if (!selectedTestNames.size) return;
  window.clearTimeout(clearDrawSelectionConfirmTimeoutId);
  isClearDrawSelectionConfirming = true;
  updateDrawSelectionTools();
  clearDrawSelectionConfirmTimeoutId = window.setTimeout(() => {
    resetClearDrawSelectionConfirmation();
  }, 3200);
}

// Renders draw selection summary.
function renderDrawSelectionSummary() {
  if (!drawSelectionCount) return;
  const count = selectedTestNames.size;
  drawSelectionCount.textContent = count
    ? `${count} test${count !== 1 ? "s" : ""} added`
    : "No tests added yet";
  updateDrawSelectionTools();
}

// Updates quick tools panel state.
function updateQuickToolsPanelState() {
  if (!quickToolsPanel || !quickToolsTitle || !quickToolsDescription || !openDrawPlannerBtn) return;

  const selectedTests = getSelectedTests();
  const count = selectedTests.length;
  if (!count) {
    quickToolsPanel.classList.add("inactive-plan");
    quickToolsPanel.classList.remove("active-plan");
    quickToolsTitle.textContent = "Start a Tube Plan";
    quickToolsDescription.textContent = "Add tests as you search to combine tubes and save consumables.";
    if (quickToolsStats) quickToolsStats.hidden = true;
    if (quickToolsTestsStat) quickToolsTestsStat.textContent = "";
    if (quickToolsTubesStat) {
      quickToolsTubesStat.textContent = "";
      quickToolsTubesStat.hidden = true;
    }
    if (quickToolsClearBtn) quickToolsClearBtn.hidden = true;
    openDrawPlannerBtn.textContent = "Plan My Draw";
    openDrawPlannerBtn.setAttribute("aria-controls", "searchInput");
    return;
  }

  quickToolsPanel.classList.remove("inactive-plan");
  quickToolsPanel.classList.add("active-plan");
  quickToolsTitle.textContent = "Current Tube Plan";
  quickToolsDescription.textContent = "Keep searching to add more tests, or open your plan to review the current selections.";
  if (quickToolsStats) quickToolsStats.hidden = false;
  if (quickToolsTestsStat) {
    quickToolsTestsStat.textContent = `${count} test${count !== 1 ? "s" : ""}`;
  }
  if (quickToolsTubesStat) {
    quickToolsTubesStat.textContent = "";
    quickToolsTubesStat.hidden = true;
  }
  if (quickToolsClearBtn) quickToolsClearBtn.hidden = false;
  openDrawPlannerBtn.textContent = "View Plan";
  openDrawPlannerBtn.setAttribute("aria-controls", "drawModal");
}

// Renders selected tests cart.
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

// Updates selection cart bar.
function updateSelectionCartBar() {
  if (!selectionCartBar || !selectionCartCount) return;

  const selectedTests = getSelectedTests();
  const count = selectedTests.length;
  const hasHighAttentionTest = selectedTests.some((test) => AUTO_EXPAND_CRITICAL_NOTE_TESTS.has(test.name));
  if (!count) {
    selectionCartCount.textContent = "0";
    const emptyPlanLabel = "Tube Plan: 0";
    const emptyCartLabel = selectionCartBar.querySelector(".selection-cart-label");
    if (emptyCartLabel) emptyCartLabel.textContent = "Tube Plan";
    selectionCartBar.setAttribute("aria-label", emptyPlanLabel);
    selectionCartBar.title = emptyPlanLabel;
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
  const countLabel = formatPlanCountLabel(totalTubes, plan);
  const badgeCount = count > 99 ? "99+" : String(count);

  selectionCartBar.hidden = false;
  selectionCartCount.textContent = badgeCount;
  const selectionCartLabel = selectionCartBar.querySelector(".selection-cart-label");
  if (selectionCartLabel) selectionCartLabel.textContent = "Tube Plan";
  selectionCartBar.classList.toggle("requires-attention", hasHighAttentionTest);
  selectionCartBar.setAttribute(
    "aria-label",
    `Tube Plan: ${badgeCount}. ${countLabel} estimated.${hasHighAttentionTest ? " Important handling guidance included." : ""}`
  );
  selectionCartBar.title = `Open Tube Plan: ${count} added test${count !== 1 ? "s" : ""}${hasHighAttentionTest ? " with important handling guidance" : ""}`;
  document.body.classList.add("has-selection-cart");
  updateSelectionCartViewportPosition();
}

// Updates selection cart viewport position.
function updateSelectionCartViewportPosition() {
  if (!selectionCartBar) return;

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const hasMobileBottomNav = shouldShowMobileBottomNav()
    && isMobileBottomNavViewport()
    && document.body.classList.contains("has-mobile-bottom-nav");
  const baseOffset = hasMobileBottomNav
    ? 96
    : (isMobile ? 10 : 18);
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

  selectionCartBar.style.top = "auto";
  selectionCartBar.style.bottom = `calc(env(safe-area-inset-bottom) + ${baseOffset + keyboardOffset}px)`;
  document.body.classList.remove("selection-cart-inline");
}

// Initializes selection cart viewport sync.
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

// Refreshes selection UI.
function refreshSelectionUi({ rerenderCards = true } = {}) {
  renderDrawSelectionSummary();
  updateQuickToolsPanelState();
  renderSelectedTestsCart();
  renderDrawResult();
  updateSelectionCartBar();
  updateDrawPlannerToggleState();
  if (rerenderCards) applyFilters();
}

// Gets selected test names list.
function getSelectedTestNamesList() {
  return Array.from(selectedTestNames);
}

// Sets selected tests.
function setSelectedTests(nextSelection, options = {}) {
  resetClearDrawSelectionConfirmation({ update: false });
  selectedTestNames.clear();
  nextSelection.forEach((name) => selectedTestNames.add(name));
  collapseProfileSelections(selectedTestNames);
  if (selectedTestNames.size) {
    recordDrawPlanRecentActivity();
  }
  refreshSelectionUi(options);
  if (isHomePage) {
    renderHomeDashboard();
  }
  dispatchFindMyTubeEvent("findmytube:selectionchange", {
    selectedTestNames: getSelectedTestNamesList()
  });
}

// Toggles selected test.
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

// Removes selected test.
function removeSelectedTest(testName, options = {}) {
  if (!selectedTestNames.has(testName)) return;
  const nextSelection = new Set(selectedTestNames);
  nextSelection.delete(testName);
  setSelectedTests(nextSelection, options);
}

// Animates draw result card.
function animateDrawResultCard() {
  if (!drawResultCard) return;
  drawResultCard.classList.remove("draw-result-updated");
  void drawResultCard.offsetWidth;
  drawResultCard.classList.add("draw-result-updated");
}

// Checks whether draw planner open.
function isDrawPlannerOpen() {
  return Boolean(drawModal && !drawModal.hidden);
}

// Updates quick tools toggle state.
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

// Updates draw planner toggle state.
function updateDrawPlannerToggleState() {
  updateQuickToolsPanelState();
  updateQuickToolsToggleState();
  setMobileBottomNavActiveState();
}

function shouldShowMobileBottomNav() {
  return false;
}

function isMobileBottomNavViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_BOTTOM_NAV_BREAKPOINT}px)`).matches;
}

function setMobileBottomNavHidden(isHidden) {
  if (!mobileBottomNav) return;
  mobileBottomNavIsHidden = Boolean(isHidden);
  mobileBottomNav.classList.toggle("is-hidden", mobileBottomNavIsHidden);
}

function updateMobileBottomMenuOrigin() {
  if (!mobileBottomMenuSheet) return;

  const menuButtonRect = mobileBottomNavButtons.menu?.getBoundingClientRect();
  const fallbackX = Math.max(0, window.innerWidth / 2);
  const fallbackY = Math.max(0, window.innerHeight);
  const nextX = menuButtonRect ? menuButtonRect.left + (menuButtonRect.width / 2) : fallbackX;
  const nextY = menuButtonRect ? menuButtonRect.top + (menuButtonRect.height / 2) : fallbackY;

  mobileBottomMenuOriginX = Math.round(nextX);
  mobileBottomMenuOriginY = Math.round(nextY);
  mobileBottomMenuSheet.style.setProperty("--mobile-menu-origin-x", `${mobileBottomMenuOriginX}px`);
  mobileBottomMenuSheet.style.setProperty("--mobile-menu-origin-y", `${mobileBottomMenuOriginY}px`);
}

function setMobileBottomMenuOpen(isOpen) {
  const nextOpen = Boolean(isOpen);
  if (nextOpen === mobileBottomMenuOpen && mobileBottomMenuSheet) return;
  mobileBottomMenuOpen = nextOpen;

  window.clearTimeout(mobileBottomMenuCloseTimeoutId);
  mobileBottomMenuCloseTimeoutId = 0;

  if (mobileBottomMenuOpen) {
    updateMobileBottomMenuOrigin();
    if (mobileBottomMenuBackdrop) {
      mobileBottomMenuBackdrop.hidden = false;
      mobileBottomMenuBackdrop.classList.add("is-open");
    }
    if (mobileBottomMenuSheet) {
      mobileBottomMenuSheet.hidden = false;
      mobileBottomMenuSheet.classList.remove("is-closing");
      window.requestAnimationFrame(() => {
        mobileBottomMenuSheet?.classList.add("is-open");
        mobileBottomMenuSheet?.querySelector(".mobile-bottom-menu-close")?.focus({ preventScroll: true });
      });
    }
    document.body.classList.add("mobile-bottom-menu-open");
  } else {
    if (mobileBottomMenuBackdrop) {
      mobileBottomMenuBackdrop.classList.remove("is-open");
    }
    if (mobileBottomMenuSheet) {
      mobileBottomMenuSheet.classList.remove("is-open");
      mobileBottomMenuSheet.classList.add("is-closing");
    }
    document.body.classList.remove("mobile-bottom-menu-open");
    mobileBottomMenuCloseTimeoutId = window.setTimeout(() => {
      if (mobileBottomMenuBackdrop) {
        mobileBottomMenuBackdrop.hidden = true;
      }
      if (mobileBottomMenuSheet) {
        mobileBottomMenuSheet.hidden = true;
        mobileBottomMenuSheet.classList.remove("is-closing");
      }
      mobileBottomMenuCloseTimeoutId = 0;
    }, MOBILE_BOTTOM_MENU_CLOSE_DURATION_MS);
  }

  if (mobileBottomMenuOpen) {
    setSiteMenuOpen(false);
    setThemePanelOpen(false);
    closeDrawModal();
    setMobileBottomNavHidden(false);
  }
  if (mobileBottomNavButtons.menu) {
    mobileBottomNavButtons.menu.setAttribute("aria-expanded", mobileBottomMenuOpen ? "true" : "false");
    mobileBottomNavButtons.menu.setAttribute("aria-label", mobileBottomMenuOpen ? "Close menu" : "Open menu");
  }
  setMobileBottomNavActiveState();
  updateMenuActiveState();
}

function resetMobileBottomNavScrollState() {
  mobileBottomNavLastScrollY = Math.max(0, window.scrollY || 0);
  mobileBottomNavDownDistance = 0;
  mobileBottomNavUpDistance = 0;
}

function getMobileBottomNavActiveKey() {
  if (mobileBottomMenuOpen) return "menu";
  const action = getCurrentPageMenuAction();
  return MOBILE_BOTTOM_NAV_KEY_BY_MENU_ACTION[action] || "";
}

function setBottomNavActive(targetKey = "") {
  if (!mobileBottomNav) return;
  const navItems = mobileBottomNav.querySelectorAll("[data-bottom-nav]");
  navItems.forEach((item) => {
    const key = item.getAttribute("data-bottom-nav") || "";
    const isActive = Boolean(targetKey) && key === targetKey;
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function setMobileBottomNavActiveState() {
  setBottomNavActive(getMobileBottomNavActiveKey());
}

function startDrawPlanFromMenu(trigger = null) {
  recordHomeQuickActionActivity("draw");
  if (!isFindMyTubePage) {
    window.location.assign(getFindMyTubePageUrl());
    return;
  }
  closeProfileModal();
  closeLegalModal({ restoreFocus: false });
  closeSectionBrowseModal();
  scrollPanelIntoView(tubeLookupPanel || preSearchPanel);
  if (selectedTestNames.size > 0) {
    openDrawModal();
    return;
  }
  closeDrawModal();
  focusMainSearchField({ scroll: "if-needed" });
}

function openSettingsPanelFromMenu() {
  setMobileBottomMenuOpen(false);
  setSiteMenuOpen(false);
  if (!themeSwitcherPanel) {
    window.location.assign("./index.html");
    return;
  }

  if (isMobileBottomNavViewport() && headerSettings) {
    headerSettings.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
      inline: "nearest"
    });
  }

  setThemePanelOpen(true);
  const firstThemeButton = themeSwitcherPanel?.querySelector("[data-theme-mode]");
  if (firstThemeButton && typeof firstThemeButton.focus === "function") {
    window.requestAnimationFrame(() => {
      firstThemeButton.focus({ preventScroll: true });
    });
  }
}

function handleSiteNavigationAction(action, trigger = null) {
  if (action === "home") {
    goHome();
    return;
  }

  if (action === "draw" || action === "start-draw") {
    startDrawPlanFromMenu(trigger);
    return;
  }

  if (action === "tube") {
    recordHomeQuickActionActivity("tube");
    openLookupHomeView();
    return;
  }

  if (action === "find-my-test") {
    recordHomeQuickActionActivity("find-my-test");
    window.location.assign("./index.html?tool=find-my-test");
    return;
  }

  if (action === "stock") {
    recordHomeQuickActionActivity("stock");
    openStockSection();
    return;
  }

  if (action === "stock-dashboard") {
    openStockDashboard();
    return;
  }

  if (action === "track-orders") {
    openTrackOrders();
    return;
  }

  if (action === "settings") {
    openSettingsPanelFromMenu();
    return;
  }

  if (action === "about") {
    openAboutSection(trigger);
    return;
  }

  if (action === "contact-feedback") {
    openContactFeedbackModal(trigger);
    return;
  }

  if (["privacy", "terms", "disclaimer"].includes(action)) {
    openLegalModal(action, trigger);
  }
}

function handleMobileBottomNavAction(action) {
  setSiteMenuOpen(false);
  setThemePanelOpen(false);
  if (action !== "menu") {
    setMobileBottomMenuOpen(false);
  }

  if (action === "home") {
    setBottomNavActive("home");
    handleSiteNavigationAction("home");
    setMobileBottomNavActiveState();
    return;
  }

  if (action === "tube") {
    setBottomNavActive("tube");
    handleSiteNavigationAction("tube");
    setMobileBottomNavActiveState();
    return;
  }

  if (action === "menu") {
    setMobileBottomMenuOpen(!mobileBottomMenuOpen);
    return;
  }

  if (action === "test") {
    setBottomNavActive("test");
    handleSiteNavigationAction("find-my-test");
    setMobileBottomNavActiveState();
    return;
  }

  if (action === "order") {
    setBottomNavActive("order");
    handleSiteNavigationAction("stock");
    setMobileBottomNavActiveState();
  }
}

function handleMobileBottomNavScroll() {
  if (!mobileBottomNav) return;

  // Keep the bottom navigation visible on all supported mobile pages.
  setMobileBottomNavHidden(false);

  if (!isMobileBottomNavViewport()) {
    setMobileBottomMenuOpen(false);
    resetMobileBottomNavScrollState();
    return;
  }
}

function initMobileBottomNav() {
  if (!shouldShowMobileBottomNav() || mobileBottomNav) return;

  const nav = document.createElement("nav");
  nav.className = "mobile-bottom-nav";
  nav.setAttribute("aria-label", "Main mobile navigation");
  nav.innerHTML = `
    <div class="mobile-bottom-nav-group" data-group="left">
      <button type="button" class="mobile-bottom-nav-btn" data-mobile-nav="home" data-bottom-nav="home" aria-label="Home">
        <span class="mobile-bottom-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="mobile-bottom-nav-label">Home</span>
      </button>
      <button type="button" class="mobile-bottom-nav-btn" data-mobile-nav="tube" data-bottom-nav="tube" aria-label="Tube">
        <span class="mobile-bottom-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v8.6c0 1.7.9 3.3 2.4 4.2l.3.2a5 5 0 0 1 2.3 4.2V21H9v-.8a5 5 0 0 1 2.3-4.2l.3-.2A5 5 0 0 0 14 11.6V3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="mobile-bottom-nav-label">Tube</span>
      </button>
    </div>
    <button type="button" class="mobile-bottom-nav-btn mobile-bottom-nav-menu" data-mobile-nav="menu" data-bottom-nav="menu" aria-label="Open menu" aria-expanded="false" aria-controls="mobileBottomMenuSheet">
      <span class="mobile-bottom-nav-menu-icon" aria-hidden="true">
        <svg class="menu-icon-grid" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="5" height="5" rx="1.3" fill="currentColor"></rect>
          <rect x="14" y="5" width="5" height="5" rx="1.3" fill="currentColor"></rect>
          <rect x="5" y="14" width="5" height="5" rx="1.3" fill="currentColor"></rect>
          <rect x="14" y="14" width="5" height="5" rx="1.3" fill="currentColor"></rect>
        </svg>
        <svg class="menu-icon-close" viewBox="0 0 24 24" fill="none">
          <path d="M6.5 6.5 17.5 17.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>
          <path d="M17.5 6.5 6.5 17.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>
        </svg>
      </span>
      <span class="mobile-bottom-nav-label">Menu</span>
    </button>
    <div class="mobile-bottom-nav-group" data-group="right">
      <button type="button" class="mobile-bottom-nav-btn" data-mobile-nav="test" data-bottom-nav="test" aria-label="Find My Test">
        <span class="mobile-bottom-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 11h10M9.5 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/></svg>
        </span>
        <span class="mobile-bottom-nav-label">Suggest</span>
      </button>
      <button type="button" class="mobile-bottom-nav-btn" data-mobile-nav="order" data-bottom-nav="order" aria-label="Order">
        <span class="mobile-bottom-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3.8 8.2 12 4l8.2 4.2M3.8 8.2V16L12 20l8.2-4V8.2M3.8 8.2 12 12.4m8.2-4.2L12 12.4m0 0V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="mobile-bottom-nav-label">Order</span>
      </button>
    </div>
  `;

  document.body.appendChild(nav);

  const menuBackdrop = document.createElement("button");
  menuBackdrop.type = "button";
  menuBackdrop.className = "mobile-bottom-menu-backdrop";
  menuBackdrop.setAttribute("aria-label", "Close menu");
  menuBackdrop.hidden = true;
  document.body.appendChild(menuBackdrop);

  const menuSheet = document.createElement("section");
  menuSheet.className = "mobile-bottom-menu-sheet";
  menuSheet.id = "mobileBottomMenuSheet";
  menuSheet.hidden = true;
  menuSheet.setAttribute("aria-label", "Main mobile menu");
  menuSheet.setAttribute("role", "dialog");
  menuSheet.setAttribute("aria-modal", "true");
  menuSheet.innerHTML = `
    <div class="mobile-bottom-menu-head">
      <div>
        <p class="mobile-bottom-menu-kicker">Find My Tube</p>
        <p class="mobile-bottom-menu-title">Menu</p>
        <p class="mobile-bottom-menu-subtitle">Navigate, manage stock, and adjust display.</p>
      </div>
      <button type="button" class="mobile-bottom-menu-close" aria-label="Close menu">&times;</button>
    </div>
    <div class="mobile-bottom-menu-list" aria-label="Main menu actions">
      <section class="mobile-bottom-menu-group" data-group="main">
        <p class="mobile-bottom-menu-group-title">Main navigation</p>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="home">Home</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="tube">Find My Tube</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="find-my-test">Find My Test</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="start-draw">Tube Plan</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="stock">Order My Stock</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="stock-dashboard">Stock Dashboard</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="track-orders">Track Orders</button>
      </section>
      <section class="mobile-bottom-menu-group" data-group="secondary">
        <p class="mobile-bottom-menu-group-title">Secondary</p>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="settings">Settings</button>
        <button type="button" class="mobile-bottom-menu-item" data-mobile-menu-action="about">About</button>
      </section>
    </div>
  `;
  document.body.appendChild(menuSheet);

  document.body.classList.add("has-mobile-bottom-nav");
  mobileBottomNav = nav;
  mobileBottomMenuBackdrop = menuBackdrop;
  mobileBottomMenuSheet = menuSheet;
  mobileBottomNavButtons = {
    home: nav.querySelector('[data-mobile-nav="home"]'),
    tube: nav.querySelector('[data-mobile-nav="tube"]'),
    menu: nav.querySelector('[data-mobile-nav="menu"]'),
    test: nav.querySelector('[data-mobile-nav="test"]'),
    order: nav.querySelector('[data-mobile-nav="order"]')
  };

  nav.querySelectorAll("[data-mobile-nav]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const action = button.getAttribute("data-mobile-nav") || "";
      handleMobileBottomNavAction(action);
      if (event.detail !== 0 && typeof button.blur === "function") {
        window.requestAnimationFrame(() => {
          button.blur();
        });
      }
    });
  });

  menuBackdrop.addEventListener("click", () => {
    setMobileBottomMenuOpen(false);
  });
  menuSheet.querySelector(".mobile-bottom-menu-close")?.addEventListener("click", () => {
    setMobileBottomMenuOpen(false);
  });
  menuSheet.querySelectorAll("[data-mobile-menu-action]").forEach((button) => {
    enhanceMenuButton(button, "data-mobile-menu-action");
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-mobile-menu-action") || "";
      setMobileBottomMenuOpen(false);
      handleSiteNavigationAction(action, button);
    });
  });

  const menuItems = Array.from(menuSheet.querySelectorAll(".mobile-bottom-menu-item"));
  menuSheet.style.setProperty("--menu-item-count", String(menuItems.length));
  menuItems.forEach((item, index) => {
    item.style.setProperty("--menu-item-index", String(index));
    item.style.setProperty("--menu-item-reverse-index", String((menuItems.length - 1) - index));
  });

  resetMobileBottomNavScrollState();
  updateMobileBottomMenuOrigin();
  setMobileBottomNavHidden(false);
  setMobileBottomNavActiveState();
  updateMenuActiveState();
  handleMobileBottomNavScroll();

  window.addEventListener("scroll", handleMobileBottomNavScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateMobileBottomMenuOrigin();
    handleMobileBottomNavScroll();
    if (!isMobileBottomNavViewport()) {
      setMobileBottomMenuOpen(false);
    }
    setMobileBottomNavActiveState();
  });
}

function sanitizeDashboardText(value, maxLength = 160) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function readHomeRecentActivity() {
  try {
    const raw = localStorage.getItem(HOME_RECENT_ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        type: sanitizeDashboardText(entry?.type, 40),
        title: sanitizeDashboardText(entry?.title, 120),
        detail: sanitizeDashboardText(entry?.detail, 180),
        actionType: sanitizeDashboardText(entry?.actionType, 24),
        actionValue: sanitizeDashboardText(entry?.actionValue, 800),
        timestamp: sanitizeDashboardText(entry?.timestamp, 40)
      }))
      .filter((entry) => entry.type && entry.title);
  } catch {
    return [];
  }
}

function writeHomeRecentActivity(entries = []) {
  try {
    localStorage.setItem(HOME_RECENT_ACTIVITY_KEY, JSON.stringify(entries.slice(0, HOME_RECENT_ACTIVITY_MAX_ITEMS)));
  } catch {
    // no-op
  }
}

function addHomeRecentActivity(entry) {
  const type = sanitizeDashboardText(entry?.type, 40);
  const title = sanitizeDashboardText(entry?.title, 120);
  if (!type || !title) return;

  const nextEntry = {
    type,
    title,
    detail: sanitizeDashboardText(entry?.detail, 180),
    actionType: sanitizeDashboardText(entry?.actionType, 24),
    actionValue: sanitizeDashboardText(entry?.actionValue, 800),
    timestamp: new Date().toISOString()
  };

  const existing = readHomeRecentActivity().filter((item) => item.type !== type);
  existing.unshift(nextEntry);
  writeHomeRecentActivity(existing);
}

function recordHomeQuickActionActivity(action) {
  const safeAction = String(action || "").trim();
  if (!safeAction) return;
  const actionByKey = {
    tube: { title: "Opened Tube lookup", detail: "Find My Tube", actionType: "menu", actionValue: "tube" },
    "find-my-test": { title: "Opened Find My Test", detail: "Find My Test", actionType: "menu", actionValue: "find-my-test" },
    draw: { title: "Started Tube Plan", detail: "Start Tube Plan", actionType: "menu", actionValue: "draw" },
    stock: { title: "Opened Order My Stock", detail: "Order My Stock", actionType: "menu", actionValue: "stock" }
  };
  const activity = actionByKey[safeAction];
  if (!activity) return;
  addHomeRecentActivity({
    type: "quick-action",
    ...activity
  });
}

function recordDrawPlanRecentActivity() {
  const selectedNames = getSelectedTestNamesList();
  if (!selectedNames.length) return;
  const previewList = selectedNames.slice(0, 2).join(", ");
  const moreCount = Math.max(0, selectedNames.length - 2);
  const detail = moreCount
    ? `${previewList} +${moreCount} more`
    : previewList;
  addHomeRecentActivity({
    type: "draw-plan",
    title: "Last Tube Plan",
    detail: `${selectedNames.length} test${selectedNames.length === 1 ? "" : "s"} • ${detail}`,
    actionType: "url",
    actionValue: getDrawPlanShareUrl(selectedNames)
  });
}

function queueRecordTestSearchActivity(rawQuery) {
  const query = sanitizeDashboardText(rawQuery, 120);
  window.clearTimeout(homeRecentTestSearchTimer);
  if (!query || query.length < 2) return;
  homeRecentTestSearchTimer = window.setTimeout(() => {
    addHomeRecentActivity({
      type: "test-search",
      title: "Last test search",
      detail: query,
      actionType: "menu",
      actionValue: "find-my-test"
    });
  }, 520);
}

function formatDashboardTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildHomeRecentActivityItems() {
  const items = [...readHomeRecentActivity()];
  const lastStockRequest = homeDashboardStockSnapshot?.lastRequest || null;
  if (lastStockRequest?.id) {
    items.unshift({
      type: "stock-request",
      title: `Last order: ${sanitizeDashboardText(lastStockRequest.wardUnit, 80) || "Ward not set"}`,
      detail: `${lastStockRequest.id} • ${formatStockRequestStatusLabel(lastStockRequest.status || "pending")}`,
      actionType: "url",
      actionValue: `./track-orders.html?requestId=${encodeURIComponent(lastStockRequest.id)}`,
      timestamp: sanitizeDashboardText(lastStockRequest.createdAt, 40)
    });
  }
  return items.slice(0, HOME_RECENT_ACTIVITY_MAX_ITEMS);
}

function handleHomeRecentActivityAction(actionType, actionValue) {
  if (!actionType || !actionValue) return;
  if (actionType === "url") {
    window.location.assign(actionValue);
    return;
  }
  if (actionType === "menu") {
    handleSiteNavigationAction(actionValue);
  }
}

function renderHomeRecentActivity() {
  if (!homeRecentActivityList || !homeRecentEmpty) return;

  const items = buildHomeRecentActivityItems();
  if (!items.length) {
    homeRecentActivityList.innerHTML = "";
    homeRecentEmpty.hidden = false;
    return;
  }

  homeRecentEmpty.hidden = true;
  homeRecentActivityList.innerHTML = items.map((item) => {
    const detail = sanitizeDashboardText(item?.detail, 180);
    const timestamp = formatDashboardTimestamp(item?.timestamp);
    const tag = item?.actionType ? "button" : "article";
    const actionAttrs = item?.actionType
      ? ` type="button" data-home-recent-action="${escapeHtml(item.actionType)}" data-home-recent-value="${escapeHtml(item.actionValue || "")}" aria-label="${escapeHtml(item.title)}"`
      : "";

    return `
      <${tag} class="home-recent-item"${actionAttrs}>
        <p class="home-recent-title">${escapeHtml(item.title)}</p>
        ${detail ? `<p class="home-recent-detail">${escapeHtml(detail)}</p>` : ""}
        ${timestamp ? `<p class="home-recent-time">${escapeHtml(timestamp)}</p>` : ""}
      </${tag}>
    `;
  }).join("");
}

function renderHomeStatusSummary() {
  if (!homeStatusList) return;

  const pendingOrders = Array.isArray(homeDashboardStockSnapshot?.pendingOrders)
    ? homeDashboardStockSnapshot.pendingOrders
    : [];

  if (!pendingOrders.length) {
    homeStatusList.innerHTML = '<div class="home-status-chip"><span class="home-status-dot" aria-hidden="true"></span>No recent stock requests</div>';
    return;
  }

  homeStatusList.innerHTML = pendingOrders.slice(0, HOME_STATUS_MAX_ITEMS).map((request) => {
    const requestedBy = sanitizeDashboardText(formatRequesterName(request?.requestedBy), 56) || "Unknown requester";
    const wardUnit = sanitizeDashboardText(request?.wardUnit, 56) || "Ward not set";
    const statusLabel = sanitizeDashboardText(request?.statusLabel, 44) || "Pending";
    const statusKey = sanitizeDashboardText(request?.statusKey, 24)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "") || "pending";
    return `
      <article class="home-status-item">
        <div class="home-status-item-head">
          <span class="home-status-item-requester">${escapeHtml(requestedBy)}</span>
          <span class="home-status-item-ward">${escapeHtml(wardUnit)}</span>
        </div>
        <p class="home-status-item-line">
          <span class="home-status-item-value home-status-item-status" data-status="${escapeHtml(statusKey)}">${escapeHtml(statusLabel)}</span>
        </p>
      </article>
    `;
  }).join("");
}

async function loadHomeDashboardStockSnapshot() {
  if (!isHomePage) return;
  try {
    const response = await fetch(buildStockApiUrl("/api/stock-requests?limit=6"), { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const payload = await response.json();
    const requests = Array.isArray(payload?.requests) ? payload.requests : [];
    const activeRequests = requests.filter((request) => {
      const normalizedStatus = normalizeStockRequestStatus(request?.status);
      return normalizedStatus !== "collected" && normalizedStatus !== "completed" && normalizedStatus !== "cancelled" && normalizedStatus !== "no-stock";
    });
    const pendingOrders = activeRequests.map((request) => {
      const normalizedStatus = normalizeStockRequestStatus(request?.status);
      const statusLabel = normalizedStatus === "pending"
        ? "Pending"
        : normalizedStatus === "processing" || normalizedStatus === "in-progress"
          ? "Packed"
          : normalizedStatus === "packed"
          ? "Packed"
          : normalizedStatus === "ready"
          ? "Ready"
          : normalizedStatus === "collected"
          ? "Collected"
          : normalizedStatus === "completed"
          ? "Completed"
          : normalizedStatus === "no-stock"
          ? "No Stock"
          : normalizedStatus.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
      return {
        requestedBy: request?.requestedBy || "",
        wardUnit: request?.wardUnit || "",
        statusLabel,
        statusKey: normalizedStatus
      };
    });

    homeDashboardStockSnapshot = {
      activeRequests: activeRequests.length,
      lastRequest: requests[0] || null,
      pendingOrders
    };
  } catch {
    homeDashboardStockSnapshot = {
      activeRequests: 0,
      lastRequest: null,
      pendingOrders: []
    };
  }
  renderHomeRecentActivity();
  renderHomeStatusSummary();
}

function renderHomeDashboard() {
  if (!isHomePage) return;
  renderHomeRecentActivity();
  renderHomeStatusSummary();
}

function initHomeDashboard() {
  if (!isHomePage) return;
  renderHomeDashboard();

  if (homeRecentActivityList) {
    homeRecentActivityList.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-home-recent-action]");
      if (!trigger) return;
      handleHomeRecentActivityAction(
        trigger.getAttribute("data-home-recent-action") || "",
        trigger.getAttribute("data-home-recent-value") || ""
      );
    });
  }

  homeStatusTrackOrdersBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    openTrackOrders();
  });

  loadHomeDashboardStockSnapshot();
}

// Opens draw modal.
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

// Closes draw modal.
function closeDrawModal() {
  if (!drawModal) return;
  resetClearDrawSelectionConfirmation({ update: false });
  drawModal.hidden = true;
  updateDrawPlannerToggleState();
  syncModalOpenClass();
}

// Opens profile modal.
function openProfileModal(testName) {
  if (!profileModal || !profileModalList || !profileModalTitle) return;
  const components = profileComponentsByName[testName] || [];
  if (!components.length) return;

  profileModalTitle.textContent = `${testName} Includes`;
  profileModalList.innerHTML = components.map((item) => `<li>${item}</li>`).join("");
  profileModal.hidden = false;
  syncModalOpenClass();
}

// Closes profile modal.
function closeProfileModal() {
  if (!profileModal) return;
  profileModal.hidden = true;
  syncModalOpenClass();
}

// Opens legal modal.
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

// Closes legal modal.
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

function openContactFeedbackModal(trigger = null) {
  if (!contactFeedbackModal) return;
  closeAboutInfoModal({ restoreFocus: false });
  closeLegalModal({ restoreFocus: false });
  lastContactFeedbackTrigger = trigger || document.activeElement;
  contactFeedbackModal.hidden = false;
  syncModalOpenClass();

  if (closeContactFeedbackBtn) {
    window.requestAnimationFrame(() => {
      closeContactFeedbackBtn.focus({ preventScroll: true });
    });
  }
}

function closeContactFeedbackModal({ restoreFocus = true } = {}) {
  if (!contactFeedbackModal) return;
  contactFeedbackModal.hidden = true;
  syncModalOpenClass();

  if (restoreFocus && lastContactFeedbackTrigger && typeof lastContactFeedbackTrigger.focus === "function") {
    window.requestAnimationFrame(() => {
      lastContactFeedbackTrigger.focus({ preventScroll: true });
    });
  }
  lastContactFeedbackTrigger = null;
}

function ensureAboutInfoModal() {
  if (aboutInfoModal) return;

  const modal = document.createElement("section");
  modal.className = "profile-modal about-info-modal";
  modal.id = "aboutInfoModal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="profile-modal-card about-info-modal-card" role="dialog" aria-modal="true" aria-labelledby="aboutInfoTitle">
      <div class="profile-modal-head about-info-modal-head">
        <h3 id="aboutInfoTitle">About</h3>
        <button type="button" class="profile-modal-close-btn" id="closeAboutInfoModalBtn">Close</button>
      </div>
      <div class="about-info-modal-body">
        <p class="about-info-title">About Find My Tube</p>
        <p class="about-info-copy">
          Find My Tube helps clinical teams quickly match tests, tubes, Tube Plans, and consumables requests.
          Reference tool only. Confirm urgent and site-specific actions with local protocol.
        </p>
        <div class="about-info-links" role="list" aria-label="About links">
          <button type="button" class="about-info-link-btn" data-about-legal="privacy">Privacy Policy</button>
          <button type="button" class="about-info-link-btn" data-about-legal="terms">Terms of Use</button>
          <button type="button" class="about-info-link-btn" data-about-legal="disclaimer">Disclaimer</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  aboutInfoModal = modal;
  closeAboutInfoModalBtn = modal.querySelector("#closeAboutInfoModalBtn");
  aboutInfoLegalButtons = Array.from(modal.querySelectorAll("[data-about-legal]"));
}

function openAboutInfoModal(trigger = null) {
  ensureAboutInfoModal();
  if (!aboutInfoModal) return;
  lastAboutInfoTrigger = trigger || document.activeElement;
  aboutInfoModal.hidden = false;
  syncModalOpenClass();

  if (closeAboutInfoModalBtn) {
    window.requestAnimationFrame(() => {
      closeAboutInfoModalBtn.focus({ preventScroll: true });
    });
  }
}

function closeAboutInfoModal({ restoreFocus = true } = {}) {
  if (!aboutInfoModal) return;
  aboutInfoModal.hidden = true;
  syncModalOpenClass();

  if (restoreFocus && lastAboutInfoTrigger && typeof lastAboutInfoTrigger.focus === "function") {
    window.requestAnimationFrame(() => {
      lastAboutInfoTrigger.focus({ preventScroll: true });
    });
  }
  lastAboutInfoTrigger = null;
}

// Synchronizes modal open class.
function syncModalOpenClass() {
  const drawOpen = Boolean(drawModal && !drawModal.hidden);
  const profileOpen = Boolean(profileModal && !profileModal.hidden);
  const legalOpen = Boolean(legalModal && !legalModal.hidden);
  const sectionBrowseOpen = Boolean(sectionBrowseModal && !sectionBrowseModal.hidden);
  const contactFeedbackOpen = Boolean(contactFeedbackModal && !contactFeedbackModal.hidden);
  const aboutInfoOpen = Boolean(aboutInfoModal && !aboutInfoModal.hidden);
  document.body.classList.toggle("modal-open", drawOpen || profileOpen || legalOpen || sectionBrowseOpen || contactFeedbackOpen || aboutInfoOpen);
  updateBackToTopVisibility();
}

// Draw planning starts with exact overrides, then falls back to grouped tube-color logic.
function normalizeNameKey(value) {
  return String(value || "").trim().toLowerCase();
}

// Canonical draw rule name.
function canonicalDrawRuleName(value) {
  const key = normalizeNameKey(value);
  if (key === "xdp (d-dimer)" || key === "xdp d dimer" || key === "xdp") return "d-dimer";
  return key;
}

// Add plan tube group.
function addPlanTubeGroup(grouped, group, testName) {
  if (!grouped.has(group)) {
    grouped.set(group, { key: group, label: group, count: 1, tests: new Set() });
  }
  grouped.get(group).tests.add(testName);
}

// Gets alternative tube support counts.
function getAlternativeTubeSupportCounts(alternativeTests) {
  const supportCounts = new Map();

  alternativeTests.forEach(({ groups }) => {
    groups.forEach((group) => {
      supportCounts.set(group, (supportCounts.get(group) || 0) + 1);
    });
  });

  return supportCounts;
}

// Chooses alternative tube group.
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

// Finds exact draw rule.
function findExactDrawRule(selectedTests) {
  const selected = new Set(selectedTests.map((test) => canonicalDrawRuleName(test.name)));

  return exactDrawRules.find((rule) => {
    if (selected.size !== rule.tests.length) return false;
    return rule.tests.every((name) => selected.has(canonicalDrawRuleName(name)));
  }) || null;
}

// Gets default plan items.
function getDefaultPlanItems(selectedTests) {
  const grouped = new Map();
  const manual = [];
  const alternativeTests = [];
  const dedicatedAlternativeItems = [];

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

  const items = [...grouped.values(), ...dedicatedAlternativeItems]
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

// Checks whether dedicated gold tube test.
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

// Checks whether shared gold tube test.
function isSharedGoldTubeTest(test) {
  const tubeGroups = getTubeGroups(test.tubeColor);
  return tubeGroups.includes("Gold/Yellow") && !isDedicatedGoldTubeTest(test);
}

// Checks whether gold/yellow request is a hormone or enzyme support test.
function isGoldHormoneOrEnzymeTest(test) {
  if (!isSharedGoldTubeTest(test)) return false;

  const summary = normalizeNameKey([
    test?.name || "",
    test?.notes || "",
    test?.clinicalUse || ""
  ].join(" "));

  return summary.includes("hormone")
    || summary.includes("endocrine")
    || summary.includes("endocrinology")
    || summary.includes("enzyme")
    || GOLD_HORMONE_OR_ENZYME_NAME_HINTS.some((term) => {
      const pattern = new RegExp(`(?:^|\\b)${escapeRegExp(term)}(?:\\b|$)`);
      return pattern.test(summary);
    });
}

// Gets required shared gold tube count.
function getRequiredSharedGoldTubeCount(selectedTests) {
  const sharedGoldTests = selectedTests.filter((test) => isSharedGoldTubeTest(test));
  const hasCordBloodProfile = selectedTests.some((test) => normalizeNameKey(test.name) === "cord blood");
  const sharedGoldRequestCount = sharedGoldTests.length + (hasCordBloodProfile ? 1 : 0);

  if (!sharedGoldRequestCount) return 0;

  const listedGoldProfileCount = sharedGoldTests.filter((test) => GOLD_VOLUME_PROFILE_NAMES.has(test.name)).length;
  const hasListedGoldProfile = listedGoldProfileCount > 0;
  const hasHormoneOrEnzymeCompanion = sharedGoldTests.some((test) => (
    !GOLD_VOLUME_PROFILE_NAMES.has(test.name)
    && isGoldHormoneOrEnzymeTest(test)
  ));

  if (hasListedGoldProfile && hasHormoneOrEnzymeCompanion) return 2;

  return listedGoldProfileCount >= 3 && sharedGoldRequestCount > 3 ? 2 : 1;
}

// Applies dedicated gold tube rule.
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

// Applies gold profile volume rule.
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
  return "Gold rule applied: use 2 x Gold/Yellow when a listed yellow profile is combined with a hormone/enzyme request, or when 3 listed profiles are combined with another shared yellow-top test.";
}

// Applies antenatal profile baseline tube minimums.
function applyAntenatalProfileMinimums(plan, selectedTests) {
  const hasAntenatalProfile = selectedTests.some(
    (test) => canonicalDrawRuleName(test?.name) === canonicalDrawRuleName("Antenatal Screen (ANTINV)")
  );
  if (!hasAntenatalProfile) return "";

  const minimums = [
    {
      key: "Purple",
      label: "Purple",
      count: 2,
      detail: "FBC, blood grouping, and antenatal antibody screen coverage."
    },
    {
      key: "Gold/Yellow",
      label: "Gold/Yellow",
      count: 3,
      detail: "Includes dedicated HIV and RPR tubes plus additional antenatal serology."
    },
    {
      key: "Gray",
      label: "Gray",
      count: 1,
      detail: "For glucose."
    }
  ];

  minimums.forEach((minimum) => {
    let planItem = plan.items.find((item) => item.key === minimum.key);
    if (!planItem) {
      planItem = { key: minimum.key, label: minimum.label, count: minimum.count, tests: [] };
      plan.items.push(planItem);
    } else {
      planItem.count = Math.max(planItem.count, minimum.count);
    }

    appendPlanItemDetail(planItem, minimum.detail);
  });

  plan.items.sort((a, b) => a.label.localeCompare(b.label));
  return "Antenatal rule applied: keep baseline draw of 3 x Gold/Yellow, 2 x Purple, and 1 x Gray when ANTINV is included.";
}

// Applies purple volume rule.
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

// Applies OGTT gray tube rule.
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

// Applies tube variant notes.
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

// Gets lab draw plan.
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

// Gets resolved draw plan.
function getResolvedDrawPlan(selectedTests) {
  const plan = getLabDrawPlan(selectedTests);
  const guidanceNotes = [
    applyAntenatalProfileMinimums(plan, selectedTests),
    applyDedicatedGoldTubeRule(plan, selectedTests),
    applyGoldProfileVolumeRule(plan, selectedTests),
    applyPurpleVolumeRule(plan, selectedTests),
    applyOgttGrayTubeRule(plan, selectedTests)
  ].filter(Boolean);

  applyTubeVariantNotes(plan, selectedTests);

  return { plan, guidanceNotes };
}

// Gets draw planner alerts.
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

// Checks whether the plan includes a collection group.
function planIncludesCollectionGroup(plan, groupName) {
  return (plan?.items || []).some((item) => {
    if (item?.key === groupName) return true;
    return getPlanItemAlternativeGroups(item).includes(groupName);
  });
}

// Gets draw planner reminders.
function getDrawPlannerReminders(plan) {
  if (planIncludesCollectionGroup(plan, "Specimen Jar")) {
    return [{
      id: "tube-fill",
      tone: "info",
      title: "Collection reminder",
      items: ["Make sure the specimen container / jar is properly filled and tightly sealed."]
    }];
  }

  return [{
    id: "tube-fill",
    tone: "info",
    title: "Collection reminder",
    items: ["Make sure samples are properly filled and tightly sealed."]
  }];
}

// Gets plan item alternative groups.
function getPlanItemAlternativeGroups(item) {
  const key = String(item?.key || "").trim();
  if (!key.startsWith("choice:")) return [];

  return key
    .slice("choice:".length)
    .split("|")
    .map((group) => String(group || "").trim())
    .filter(Boolean);
}

// Renders draw result.
function renderDrawResult() {
  if (!drawResultCard || !drawPlannerCount || !drawPlannerAlerts || !drawGroups || !drawPlannerNote) return;

  const selectedTests = getSelectedTests();
  if (!selectedTests.length) {
    drawResultCard.hidden = false;
    drawPlannerCount.textContent = "0 tests";
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
  const plannerAlerts = [
    ...getDrawPlannerReminders(plan),
    ...getDrawPlannerAlerts(selectedTests)
  ];
  drawResultCard.hidden = false;
  drawPlannerCount.textContent = `${selectedTests.length} test${selectedTests.length > 1 ? "s" : ""}`;
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
  if (specimen.includes("stool") || specimen.includes("urine")) return "Use the correct sterile container and transport promptly.";
  if (specimen.includes("swab")) return "Use the correct swab in transport medium and transport promptly.";
  return "Confirm patient prep and specimen handling against local lab protocol.";
}

// Infers specimen guide.
function inferSpecimenGuide(test) {
  const text = `${test.name} ${test.specimen} ${test.tubeColor} ${test.notes}`.toLowerCase();

  if (text.includes("urine")) return "Urine specimen (sterile container or urine swab/collection protocol as required).";
  if (text.includes("stool") || text.includes("fecal")) return "Stool specimen (clean stool container).";
  if (text.includes("swab")) return "Swab specimen in transport medium (site-specific swab: nasal, throat, vaginal, ulcer, or wound as indicated).";
  if (text.includes("csf")) return "CSF specimen (sterile tan tube).";
  if (text.includes("sputum") || text.includes("respiratory")) return "Respiratory specimen (e.g., sputum, NP swab, or lower respiratory sample).";
  if (text.includes("blood culture")) return "Blood culture bottles (aseptic blood specimen collection).";
  if (text.includes("blood")) return "Blood specimen (container depends on requested microbiology/virology test).";
  return "Specimen-specific collection required (confirm exact sample type with lab protocol).";
}

// Gets card specimen value.
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

// Gets concise collection tips for the card summary.
function getCardCollectionTips(test) {
  const primaryValue = String(test.criticalPrep || "").trim();
  if (primaryValue) return primaryValue;
  return String(test.notes || "").trim();
}

// Checks whether hide specimen on card.
function shouldHideSpecimenOnCard(test) {
  return test.name === "HIV Viral Load";
}

// Gets micro specimen bucket.
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

// Gets micro subsection.
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

// Gets micro clinical profile.
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

// Gets clinical profile.
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

// Gets test grouping.
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
    name.includes("coeliac") ||
    name.includes("parietal cell") ||
    name.includes("intrinsic factor") ||
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
    name.includes("differential count") ||
    name.includes("blood smear") ||
    name.includes("haemolytic profile")
  ) return { sectionId: "haematology", subsection: "General" };

  if (
    name.includes("menopausal screen profile") ||
    name.includes("menopause profile") ||
    name.includes("menopausal profile") ||
    name.includes("menopause screen") ||
    name.includes("menopausal screen") ||
    name.includes("acth") ||
    name.includes("adrenocorticotropic") ||
    name.includes("corticotropin") ||
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

// Enriches test.
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

// Deduplicates tests by name.
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

// Starts carousel.
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

function startHomeTipRotation() {
  if (!homeTipText) return;
  const tips = factTips.length ? factTips : [HOME_TIP_FALLBACK];
  homeTipText.textContent = tips[0] || HOME_TIP_FALLBACK;
  if (tips.length < 2) return;

  let current = 0;
  const shouldAnimate = !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  window.setInterval(() => {
    current = (current + 1) % tips.length;
    if (!shouldAnimate) {
      homeTipText.textContent = tips[current] || HOME_TIP_FALLBACK;
      return;
    }

    homeTipText.classList.add("is-changing");
    window.setTimeout(() => {
      homeTipText.textContent = tips[current] || HOME_TIP_FALLBACK;
      homeTipText.classList.remove("is-changing");
    }, 180);
  }, HOME_TIP_CYCLE_MS);
}

// Renders facts carousel.
function renderFactsCarousel() {
  startCarousel(factTips, tipText, null, HOME_TIP_CYCLE_MS);
  startHomeTipRotation();
  homeTipCard?.classList.remove("is-orbiting");
}

// Applies quick tools panel mode.
function applyQuickToolsPanelMode(isMobile) {
  if (!toggleQuickToolsBtn) return;
  toggleQuickToolsBtn.hidden = true;
}

// Initializes quick tools panel.
function initQuickToolsPanel() {
  if (!toggleQuickToolsBtn) return;

  const mediaQuery = window.matchMedia("(max-width: 600px)");
  // On mode change.
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

// Applies facts panel mode.
function applyFactsPanelMode(isMobile) {
  if (!factCarouselPanel || !factCarouselContent) return;

  if (isMobile) {
    factCarouselPanel.classList.add("mobile-facts");
    return;
  }

  factCarouselPanel.classList.remove("mobile-facts");
}

// Initializes facts panel.
function initFactsPanel() {
  if (!factCarouselPanel || !factCarouselContent) return;

  const mediaQuery = window.matchMedia("(max-width: 600px)");
  // On mode change.
  const onModeChange = () => applyFactsPanelMode(mediaQuery.matches);

  onModeChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onModeChange);
  } else {
    mediaQuery.addListener(onModeChange);
  }
}

// Updates group chip state.
function updateGroupChipState() {
  if (!groupChips) return;

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    const groupId = chip.getAttribute("data-group") || "";
    const isActive = activeSectionGroup === groupId || activeSectionBrowseModalSectionId === groupId;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// Gets section browse panel markup.
function getSectionBrowsePanelMarkup(sectionId) {
  if (isFindMyTubePage) return "";
  const browseGroups = sectionBrowseGroups[sectionId] || [];
  if (!browseGroups.length) return "";

  const isOpen = activeSectionGroup === sectionId;
  const activeBrowseGroup = activeBrowseGroupBySection[sectionId] || "";
  const panelId = `${sectionId}BrowsePanel`;

  return `
    <div
      class="chemistry-browse-panel${isOpen ? " is-open" : ""}"
      id="${panelId}"
      aria-hidden="${isOpen ? "false" : "true"}"
    >
      <div class="chemistry-browse-panel-inner">
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
              <span class="chemistry-browse-chip-label">${group.label}</span>
              <span class="chemistry-browse-chip-icon" aria-hidden="true">${group.icon}</span>
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
      const hasBrowsePanel = !isFindMyTubePage && hasSectionBrowseGroups(groupId);
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
      if (isFindMyTubePage && hasSectionBrowseGroups(groupId)) {
        openSectionBrowseModal(groupId, chip);
        return;
      }

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

// Sets section view.
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
  if (sectionBrowseModal && !sectionBrowseModal.hidden && (browseGroup || !activeSectionGroup)) {
    closeSectionBrowseModal({ restoreFocus: false });
  }
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

// Initializes section navigation.
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
    if (isFindMyTubePage && nextSectionGroup && hasSectionBrowseGroups(nextSectionGroup) && !nextBrowseGroup) {
      openSectionBrowseModal(nextSectionGroup);
    }
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

// Checks whether profile components.
function hasProfileComponents(test) {
  return (profileComponentsByName[test.name] || []).length > 0;
}

// Checks whether auto expand critical note.
function shouldAutoExpandCriticalNote(testName, isSelected) {
  return isSelected && AUTO_EXPAND_CRITICAL_NOTE_TESTS.has(testName);
}

// Checks whether prioritize profiles first.
function shouldPrioritizeProfilesFirst(selectedSection, normalizedQuery) {
  return Boolean(selectedSection) || normalizedQuery === "csf" || /\bcardiac\b/.test(normalizedQuery);
}

// Gets filtered tests.
function getFilteredTests() {
  const query = searchInput?.value || "";
  const selectedSection = activeSectionGroup || "";
  const selectedSectionFilterIds = sectionFilterIdsBySection[selectedSection] || [selectedSection];
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery && !selectedSection && hasClinicalWorkupState()) {
    return Array.isArray(clinicalWorkupOutput?.tests)
      ? clinicalWorkupOutput.tests
      : [];
  }
  const activeBrowseSubsectionSet = new Set(getActiveBrowseSubsections(selectedSection));
  const matchedProfileName = getMatchedProfileQuery(normalizedQuery);
  const exactNameMatches = getExactNameMatches(normalizedQuery);
  const supplementaryProfileMatches = getSupplementaryProfileMatches(normalizedQuery);
  const supplementaryProfileMatchSet = new Set(supplementaryProfileMatches);
  const isInflammatoryShortcut = normalizedQuery === "inflammatory" || normalizedQuery === "inflammation";
  const shouldBypassSectionFilter = Boolean(
    matchedProfileName
    || exactNameMatches.length
    || supplementaryProfileMatches.length
    || isInflammatoryShortcut
  );

  const filtered = enrichedTests.filter((test) => {
    if (
      selectedSection
      && !shouldBypassSectionFilter
      && !selectedSectionFilterIds.includes(test.grouping.sectionId)
    ) return false;
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

// Renders cards.
function renderCards(filteredTests) {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = "";
  const rawQuery = String(searchInput?.value || "").trim();
  const normalizedQuery = normalizeForSearch(rawQuery);
  const matchedConditionShortcut = getMatchedConditionShortcut(normalizedQuery);
  const isClinicalSuggestionsMode = !normalizedQuery && !activeSectionGroup && hasClinicalWorkupState();
  const shouldShowFindMyTestHandoff = !isClinicalSuggestionsMode && Boolean(matchedConditionShortcut);
  const clinicalModeLabel = clinicalWorkupOutput?.modeLabel || "Find My Test";
  const resultsContextLabel = !normalizedQuery && activeSectionGroup
    ? getResultsContextLabel(activeSectionGroup)
    : "";
  const resultsPrefix = resultsContextLabel ? `${resultsContextLabel}. ` : "";

  if (filteredTests.length === 0) {
    setResultsInfo(
      isClinicalSuggestionsMode
        ? `${clinicalModeLabel}. 0 tests found. ${CLINICAL_WORKUP_DISCLAIMER}`
        : shouldShowFindMyTestHandoff
        ? `${resultsPrefix}Find My Tube is test-first. Use Find My Test for condition-based suggestions.`
        : `${resultsPrefix}0 tests found`
    );
    cardsContainer.innerHTML = isClinicalSuggestionsMode
      ? `
        <div class="no-results">
          No strong direct match yet. Add more specific symptoms or signs, or switch to the main search.
        </div>
      `
      : shouldShowFindMyTestHandoff
      ? getFindMyTestHandoffMarkup(rawQuery || matchedConditionShortcut?.label || "this condition")
      : `
        <div class="no-results">
          No matching test found. Try searching by test or profile (e.g. CRP or Liver function tests).
        </div>
      `;
    return;
  }

  setResultsInfo(
    isClinicalSuggestionsMode
      ? `${clinicalModeLabel}. ${filteredTests.length} suggested test${filteredTests.length > 1 ? "s" : ""} found. ${CLINICAL_WORKUP_DISCLAIMER}`
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
    const tubeCardStyleData = getTubeCardStyleData(tubeGroups);
    card.classList.add(...tubeCardStyleData.className.split(" "));
    card.dataset.tube = tubeCardStyleData.dataTube;
    card.dataset.tubes = tubeCardStyleData.dataTubes;
    card.setAttribute("style", tubeCardStyleData.style);
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
    const collectionFieldLabel = getCollectionFieldLabel(tubeGroups);
    const specimenValue = getCardSpecimenValue(test, { isMicro });
    const hasSpecimenValue = Boolean(specimenValue);
    const showRequestedSpecimen = hasSpecimenValue && !shouldHideSpecimenOnCard(test);
    const collectionTipsValue = getCardCollectionTips(test);
    const hasCollectionTipsValue = Boolean(collectionTipsValue);
    const showRackHint = !hasDismissedRackHint && !isSelected && filteredTests[0]?.name === test.name;
    // Renders summary field.
    const renderSummaryField = ({ label, content, isAction = false, className = "" }) => {
      if (!isAction) {
        return `
        <div class="field card-summary-field${className ? ` ${className}` : ""}">
          <span class="label">${label}</span>
          ${content}
        </div>
        `;
      }

      return `
      <button
        type="button"
        class="field card-summary-field card-summary-action${className ? ` ${className}` : ""}${isSelected ? " selected" : ""}${showRackHint ? " hinted" : ""}"
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
    const summaryFields = `
      ${hasTubeOptions
        ? renderSummaryField({
          label: collectionFieldLabel,
          content: `<div class="tube-color-row${tubeGroups.length > 1 ? " multiple" : ""}">
            ${tubeOptionsMarkup}
          </div>`,
          isAction: true
        })
        : ""}
      ${showRequestedSpecimen
        ? renderSummaryField({
          label: "Requested Specimen",
          content: `<span class="card-summary-value">${specimenValue}</span>`
        })
        : ""}
      ${hasCollectionTipsValue
        ? renderSummaryField({
          label: "Collection Tips",
          content: `<span class="card-summary-value">${collectionTipsValue}</span>`,
          className: "card-summary-field-wide"
        })
        : ""}
    `;
    const summaryFieldCount = Number(hasTubeOptions) + Number(showRequestedSpecimen) + Number(hasCollectionTipsValue);
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
      <div class="card-extra">
        <div class="test-subgroup-badge">${test.grouping.subsection}</div>
        ${showTubeChoiceNote ? `
        <div class="field">
          <span class="label">${collectionFieldLabel} Note</span>
          <span>${test.tubeColor}</span>
        </div>
        ` : ""}
        ${tubeVariantValue ? `
        <div class="field">
          <span class="label">${collectionFieldLabel} Type</span>
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

    // Preserve search focus on press.
    const preserveSearchFocusOnPress = (event) => {
      if (!shouldPreserveSearchFocusOnMobile()) return;
      event.preventDefault();
    };

    // Handles select.
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

// Applies filters.
function applyFilters() {
  if (!preSearchPanel || !cardsContainer) {
    if (siteFooter) siteFooter.hidden = false;
    updateBackToTopVisibility();
    updateSelectionCartViewportPosition();
    return;
  }

  const hasQuery = (searchInput?.value || "").trim().length > 0;
  const hasSectionFilter = Boolean(activeSectionGroup);
  const hasClinicalState = hasClinicalWorkupState();
  const hasResultsView = isResultsViewActive(activeSectionGroup, searchInput?.value || "");
  const keepPreSearchVisible = shouldKeepPreSearchPanelVisible(activeSectionGroup, searchInput?.value || "");
  const shouldHidePreSearch = hasQuery || hasClinicalState || (hasSectionFilter && !keepPreSearchVisible);
  preSearchPanel.style.display = shouldHidePreSearch ? "none" : (isFindMyTubePage ? "block" : "grid");
  if (siteFooter) {
    siteFooter.hidden = hasResultsView;
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

    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchInput.focus({ preventScroll: false });
    });

    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim() && clinicalWorkupOutput) {
        clearClinicalWorkupOutput({ preserveInputs: true, rerenderCards: false, clearStatus: true });
      }
      if (isFindMyTestPage) {
        queueRecordTestSearchActivity(searchInput.value);
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
        if (isFindMyTubePage && hasSectionBrowseGroups(activeSectionGroup)) {
          const nextSectionGroup = activeSectionGroup;
          setSectionView(nextSectionGroup, {
            browseGroup: "",
            historyMode: "replace",
            scrollToTop: true
          });
          openSectionBrowseModal(nextSectionGroup, sectionContextBackBtn);
          return;
        }

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
    brandHomeBtn.dataset.coreBound = "1";
    brandHomeBtn.addEventListener("click", () => {
      goHome();
    });
  }

  if (menuToggleBtn) {
    menuToggleBtn.dataset.coreBound = "1";
    menuToggleBtn.addEventListener("click", () => {
      if (shouldShowMobileBottomNav() && isMobileBottomNavViewport()) {
        handleMobileBottomNavAction("menu");
        return;
      }
      setThemePanelOpen(false);
      setSiteMenuOpen(!isSiteMenuOpen);
    });
  }

  if (siteMenuLinks.length) {
    siteMenuLinks.forEach((button) => {
      button.addEventListener("click", (event) => {
        if (button instanceof HTMLAnchorElement) {
          event.preventDefault();
        }
        const action = button.getAttribute("data-menu-action") || "";
        setSiteMenuOpen(false);
        handleSiteNavigationAction(action, button);
      });
    });
  }

  if (heroDrawPlanBtn) {
    heroDrawPlanBtn.addEventListener("click", () => {
      openLookupHomeView();
    });
  }

  if (heroOrderStockBtn) {
    heroOrderStockBtn.addEventListener("click", () => {
      openStockSection();
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

      if (isFindMyTestPage) {
        const findMyTestTarget = clinicalWorkupResults && !clinicalWorkupResults.hidden
          ? clinicalWorkupResults
          : clinicalWorkupPanel;

        findMyTestTarget?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
        return;
      }

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

  if (closeSectionBrowseModalBtn) {
    closeSectionBrowseModalBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeSectionBrowseModal();
    });
  }

  if (sectionBrowseModal) {
    sectionBrowseModal.addEventListener("click", (event) => {
      if (event.target !== sectionBrowseModal) return;
      closeSectionBrowseModal();
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

  if (closeAboutInfoModalBtn) {
    closeAboutInfoModalBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeAboutInfoModal();
    });
  }

  if (aboutInfoModal) {
    aboutInfoModal.addEventListener("click", (event) => {
      if (event.target !== aboutInfoModal) return;
      closeAboutInfoModal();
    });
  }

  if (aboutInfoLegalButtons.length) {
    aboutInfoLegalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const docId = button.getAttribute("data-about-legal") || "";
        if (!docId) return;
        closeAboutInfoModal({ restoreFocus: false });
        openLegalModal(docId, button);
      });
    });
  }

  if (closeContactFeedbackBtn) {
    closeContactFeedbackBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeContactFeedbackModal();
    });
  }

  if (contactFeedbackModal) {
    contactFeedbackModal.addEventListener("click", (event) => {
      if (event.target !== contactFeedbackModal) return;
      closeContactFeedbackModal();
    });
  }

  if (surfacePanelBackdrop) {
    surfacePanelBackdrop.addEventListener("click", () => {
      if (isThemePanelOpen) {
        setThemePanelOpen(false);
      }
      if (isSiteMenuOpen) {
        setSiteMenuOpen(false);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (mobileBottomMenuOpen) {
      setMobileBottomMenuOpen(false);
      return;
    }
    if (isSiteMenuOpen) {
      setSiteMenuOpen(false);
      return;
    }
    if (legalModal && !legalModal.hidden) {
      closeLegalModal();
      return;
    }
    if (aboutInfoModal && !aboutInfoModal.hidden) {
      closeAboutInfoModal();
      return;
    }
    if (contactFeedbackModal && !contactFeedbackModal.hidden) {
      closeContactFeedbackModal();
      return;
    }
    if (profileModal && !profileModal.hidden) {
      closeProfileModal();
      return;
    }
    if (sectionBrowseModal && !sectionBrowseModal.hidden) {
      closeSectionBrowseModal();
      return;
    }
    if (drawModal && !drawModal.hidden) {
      closeDrawModal();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isSiteMenuOpen || !headerSettings) return;
    if (headerSettings.contains(event.target)) return;
    setSiteMenuOpen(false);
  });
}

// Expose the small public API that the Find My Test module uses to share search and draw-plan state.
function updateFindMyTubePublicApi() {
  window.findMyTubeApp = {
    version: "2026-03-23.1",
    assetVersion: "20260728p",
    normalizeForSearch,
    escapeHtml,
    getTestsByNames,
    getTubeGroups,
    getSelectedTestNames: getSelectedTestNamesList,
    getResolvedDrawPlan,
    estimateDrawPlanForTests,
    addTestsToPlan,
    removeTestsFromPlan,
    clearTubePlan,
    openDrawPlan: openDrawModal,
    prepareFindMyTestResultsView,
    setFindMyTestSuggestions,
    clearFindMyTestSuggestions: clearClinicalWorkupOutput
  };
}

enhanceSiteMenuStructure();
initTheme();
updateFindMyTubePublicApi();
renderFactsCarousel();
initStockOrderPanel();
initQuickToolsPanel();
initFactsPanel();
initSectionNavigation();
initMobileBottomNav();
initHomeDashboard();
ensureAboutInfoModal();
renderGroupChips();
refreshSearchPlaceholder();
bindEvents();
updateMenuActiveState();
initSelectionCartViewportSync();
applyFilters();
updateSearchClearButton();
refreshSelectionUi({ rerenderCards: false });
loadSharedDrawPlanFromUrl();
