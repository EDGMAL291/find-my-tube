const stockDashboardRefreshBtn = document.getElementById("stockDashboardRefreshBtn");
const stockDashboardStatus = document.getElementById("stockDashboardStatus");
const stockDashboardStatsControls = document.getElementById("stockDashboardStatsControls");
const stockDashboardToggleStatsBtn = document.getElementById("stockDashboardToggleStatsBtn");
const stockDashboardStatsPanel = document.getElementById("stockDashboardStatsPanel");
const stockDashboardStatsEmpty = document.getElementById("stockDashboardStatsEmpty");
const stockDashboardAccessCard = document.getElementById("stockDashboardAccessCard");
const stockDashboardAuthStatus = document.getElementById("stockDashboardAuthStatus");
const stockDashboardNotificationCard = document.getElementById("stockDashboardNotificationCard");
const stockDashboardNotificationTitle = document.getElementById("stockDashboardNotificationTitle");
const stockDashboardNotificationStatus = document.getElementById("stockDashboardNotificationStatus");
const stockDashboardAlertBadge = document.getElementById("stockDashboardAlertBadge");
const stockDashboardEnableAlertsBtn = document.getElementById("stockDashboardEnableAlertsBtn");
const stockDashboardMarkSeenBtn = document.getElementById("stockDashboardMarkSeenBtn");
const stockDashboardAuthForm = document.getElementById("stockDashboardAuthForm");
const stockDashboardUserNumberInput = document.getElementById("stockDashboardUserNumberInput");
const stockDashboardPinInput = document.getElementById("stockDashboardPinInput");
const stockDashboardLoginBtn = document.getElementById("stockDashboardLoginBtn");
const stockDashboardAccessCloseBtn = document.getElementById("stockDashboardAccessCloseBtn");
const stockDashboardLogoutBtn = document.getElementById("stockDashboardLogoutBtn");
const clearStockDataBtn = document.getElementById("clearStockDataBtn");
const stockDashboardSessionCard = document.getElementById("stockDashboardSessionCard");
const stockDashboardSessionKicker = document.getElementById("stockDashboardSessionKicker");
const stockDashboardSessionUser = document.getElementById("stockDashboardSessionUser");
const stockDashboardSessionMessage = document.getElementById("stockDashboardSessionMessage");
const stockDashboardSessionLoginBtn = document.getElementById("stockDashboardSessionLoginBtn");
const stockDashboardUserAdminCard = document.getElementById("stockDashboardUserAdminCard");
const stockDashboardUserAdminStatus = document.getElementById("stockDashboardUserAdminStatus");
const stockDashboardOpenCreateUserBtn = document.getElementById("stockDashboardOpenCreateUserBtn");
const stockDashboardCreateUserModal = document.getElementById("stockDashboardCreateUserModal");
const stockDashboardCloseCreateUserModalBtn = document.getElementById("stockDashboardCloseCreateUserModalBtn");
const stockDashboardCreateUserForm = document.getElementById("stockDashboardCreateUserForm");
const stockDashboardCreateUserNameInput = document.getElementById("stockDashboardCreateUserNameInput");
const stockDashboardCreateUserNumberInput = document.getElementById("stockDashboardCreateUserNumberInput");
const stockDashboardCreateUserPinInput = document.getElementById("stockDashboardCreateUserPinInput");
const stockDashboardCreateUserRoleInput = document.getElementById("stockDashboardCreateUserRoleInput");
const stockDashboardCreateUserModalStatus = document.getElementById("stockDashboardCreateUserModalStatus");
const stockDashboardCreateUserBtn = document.getElementById("stockDashboardCreateUserBtn");
const stockDashboardUserList = document.getElementById("stockDashboardUserList");
const stockDashboardManualEntryCard = document.getElementById("stockDashboardManualEntryCard");
const stockDashboardManualEntryStatus = document.getElementById("stockDashboardManualEntryStatus");
const stockDashboardManualEntryForm = document.getElementById("stockDashboardManualEntryForm");
const stockDashboardManualRequesterInput = document.getElementById("stockDashboardManualRequesterInput");
const stockDashboardManualWardSelect = document.getElementById("stockDashboardManualWardSelect");
const stockDashboardManualNoteInput = document.getElementById("stockDashboardManualNoteInput");
const stockDashboardManualGrid = document.getElementById("stockDashboardManualGrid");
const stockDashboardManualSubmitBtn = document.getElementById("stockDashboardManualSubmitBtn");
const stockDashboardManualResetBtn = document.getElementById("stockDashboardManualResetBtn");
const stockDashboardReceiptCard = document.getElementById("stockDashboardReceiptCard");
const stockDashboardReceiptStatus = document.getElementById("stockDashboardReceiptStatus");
const stockDashboardReceiptForm = document.getElementById("stockDashboardReceiptForm");
const stockDashboardReceiptSupplierInput = document.getElementById("stockDashboardReceiptSupplierInput");
const stockDashboardReceiptReferenceInput = document.getElementById("stockDashboardReceiptReferenceInput");
const stockDashboardReceiptNoteInput = document.getElementById("stockDashboardReceiptNoteInput");
const stockDashboardReceiptAddItemBtn = document.getElementById("stockDashboardReceiptAddItemBtn");
const stockDashboardReceiptItemsRows = document.getElementById("stockDashboardReceiptItemsRows");
const stockDashboardReceiptSummaryList = document.getElementById("stockDashboardReceiptSummaryList");
const stockDashboardReceiptSubmitBtn = document.getElementById("stockDashboardReceiptSubmitBtn");
const stockDashboardReceiptResetBtn = document.getElementById("stockDashboardReceiptResetBtn");
const stockDashboardReceiptToggleBtn = document.getElementById("stockDashboardReceiptToggleBtn");
const stockDashboardReceiptFormWrap = document.getElementById("stockDashboardReceiptFormWrap");
const stockDashboardInventoryCard = document.getElementById("stockDashboardInventoryCard");
const stockDashboardInventoryStatus = document.getElementById("stockDashboardInventoryStatus");
const stockDashboardInventoryList = document.getElementById("stockDashboardInventoryList");
const stockDashboardDataCard = document.getElementById("stockDashboardDataCard");
const stockDashboardDataStatus = document.getElementById("stockDashboardDataStatus");
const stockDashboardViewRequestsDataBtn = document.getElementById("stockDashboardViewRequestsDataBtn");
const stockDashboardViewReceiptsDataBtn = document.getElementById("stockDashboardViewReceiptsDataBtn");
const stockDashboardExportDataBtn = document.getElementById("stockDashboardExportDataBtn");
const stockDashboardClearOldDataBtn = document.getElementById("stockDashboardClearOldDataBtn");
const stockDashboardMetrics = document.getElementById("stockDashboardMetrics");
const stockDashboardInsights = document.getElementById("stockDashboardInsights");
const stockDashboardRequestsCard = document.getElementById("stockDashboardRequestsCard");
const stockDashboardTotalRequests = document.getElementById("stockDashboardTotalRequests");
const stockDashboardOpenRequests = document.getElementById("stockDashboardOpenRequests");
const stockDashboardLineItems = document.getElementById("stockDashboardLineItems");
const stockDashboardUnitsRequested = document.getElementById("stockDashboardUnitsRequested");
const stockDashboardStatusCounts = document.getElementById("stockDashboardStatusCounts");
const stockDashboardTopWards = document.getElementById("stockDashboardTopWards");
const stockDashboardTopItems = document.getElementById("stockDashboardTopItems");
const stockDashboardRequestList = document.getElementById("stockDashboardRequestList");

const STOCK_DASHBOARD_STATUS_ORDER = ["submitted", "packed", "collected", "cancelled"];
const STOCK_DASHBOARD_LEGACY_TOKEN_KEY = "fmt-stock-lab-token";
const STOCK_DASHBOARD_BROWSER_ALERTS_KEY = "fmt-stock-browser-alerts";
const STOCK_DASHBOARD_LAST_SEEN_PREFIX = "fmt-stock-last-seen";
const STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX = "fmt-stock-last-notified";
const STOCK_DASHBOARD_SIGNED_OUT_KEY = "fmt-stock-auth-signed-out";
const STOCK_DASHBOARD_ACTIVE_AUTH_KEY = "fmt-stock-auth-active";
const STOCK_DASHBOARD_AUTH_STATE_KEYS = Object.freeze([
  STOCK_DASHBOARD_LEGACY_TOKEN_KEY,
  STOCK_DASHBOARD_ACTIVE_AUTH_KEY,
  "fmt-stock-lab-user",
  "fmt-stock-lab-user-number",
  "fmt-stock-lab-role",
  "fmt-stock-lab-session",
  "fmt-stock-lab-auth",
  "fmt-stock-admin-user",
  "fmt-stock-admin-role",
  "fmt-stock-dashboard-admin",
  "fmt-stock-dashboard-session"
]);
const STOCK_DASHBOARD_POLL_MS = 30000;
const STOCK_DASHBOARD_INACTIVITY_WARNING_MS = 9 * 60 * 1000;
const STOCK_DASHBOARD_INACTIVITY_LOGOUT_MS = 10 * 60 * 1000;
const STOCK_DASHBOARD_LOGIN_TIMEOUT_MS = 5000;
const STOCK_DASHBOARD_SESSION_CHECK_MS = 20000;
const STOCK_DASHBOARD_INVALID_LOGIN_TEXT = "Incorrect user number or PIN.";
const STOCK_DASHBOARD_LOGIN_GENERIC_ERROR_TEXT = "Login failed. Please try again.";
const STOCK_DASHBOARD_LOGIN_UNAVAILABLE_TEXT = "Login service is unavailable.";
const STOCK_DASHBOARD_LOGIN_CONFIG_TEXT = "Server configuration error.";
const STOCK_DASHBOARD_SAVE_USER_ERROR_TEXT = "Could not save user. Please try again.";
const STOCK_DASHBOARD_REPLACED_MESSAGE = "You were logged out because this account was signed in somewhere else.";
const STOCK_DASHBOARD_INACTIVITY_WARNING_TEXT = "You will be logged out in 1 minute due to inactivity.";
const STOCK_DASHBOARD_INACTIVITY_LOGOUT_TEXT = "You were logged out due to inactivity.";
const STOCK_DASHBOARD_AUTH_DEBUG = true;
const STOCK_DASHBOARD_AUTH_BROADCAST_NAME = "fmt-stock-auth-sync";
const STOCK_DASHBOARD_AUTH_SYNC_EVENT_KEY = "fmt-stock-auth-sync-event";
const STOCK_DASHBOARD_AUTH_FLASH_MESSAGE_KEY = "fmt-stock-auth-flash";
const STOCK_DASHBOARD_PROD_API_BY_HOST = Object.freeze({
  "findmytube.co.za": "https://find-my-tube-api.onrender.com",
  "www.findmytube.co.za": "https://find-my-tube-api.onrender.com"
});

let stockDashboardSession = null;
let stockDashboardPollTimer = 0;
let stockDashboardLatestRequestMarker = "";
let stockDashboardUnreadCount = 0;
let stockDashboardSetupRequired = false;
let stockDashboardLoginModalFocusTimer = 0;
let stockDashboardInactivityWarningTimer = 0;
let stockDashboardInactivityLogoutTimer = 0;
let stockDashboardInactivityWarningShown = false;
let stockDashboardStatusBeforeInactivityWarning = "";
let stockDashboardLastActivityResetAt = 0;
let stockDashboardInactivityHandlersBound = false;
let stockDashboardAuthState = "idle";
let stockDashboardLoginAbortController = null;
let stockDashboardLoginTimeoutTimer = 0;
let stockDashboardLoginAttemptId = 0;
let stockDashboardLogoutInProgress = false;
let stockDashboardAuthGeneration = 0;
let stockDashboardLastFocusedElement = null;
let stockDashboardSessionCheckTimer = 0;
let stockDashboardAuthSyncChannel = null;
let stockDashboardHandlingRemoteLogout = false;

function stockDashboardLogAuthDebug(stage, details = {}) {
  if (!STOCK_DASHBOARD_AUTH_DEBUG) return;
  try {
    console.info(`[stock-dashboard][auth] ${stage}`, details);
  } catch {
    // no-op
  }
}

function stockDashboardBumpAuthGeneration() {
  stockDashboardAuthGeneration += 1;
  return stockDashboardAuthGeneration;
}

function stockDashboardGetApiBaseUrl() {
  if (typeof window === "undefined") return "";

  const configuredBaseUrl = String(window.FMT_APP_CONFIG?.stockApiBaseUrl || "").trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/g, "");
  }

  const currentOrigin = window.location.origin || "";
  const currentHostname = window.location.hostname || "";
  const explicitProdApi = STOCK_DASHBOARD_PROD_API_BY_HOST[currentHostname];
  if (explicitProdApi) {
    return explicitProdApi;
  }
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

function stockDashboardBuildApiUrl(path) {
  const safePath = String(path || "").startsWith("/") ? path : `/${String(path || "")}`;
  return `${stockDashboardGetApiBaseUrl()}${safePath}`;
}

const STOCK_DASHBOARD_REQUESTS_URL = stockDashboardBuildApiUrl("/api/lab/stock-requests?limit=30");
const STOCK_DASHBOARD_PUBLIC_REQUESTS_URL = stockDashboardBuildApiUrl("/api/stock-requests?limit=30");
const STOCK_DASHBOARD_CONFIG_URL = stockDashboardBuildApiUrl("/api/config");
const STOCK_DASHBOARD_STATS_URL = stockDashboardBuildApiUrl("/api/lab/stock-stats");
const STOCK_DASHBOARD_SESSION_URL = stockDashboardBuildApiUrl("/api/stock-auth/session");
const STOCK_DASHBOARD_LOGIN_URL = stockDashboardBuildApiUrl("/api/stock-auth/login");
const STOCK_DASHBOARD_BOOTSTRAP_URL = stockDashboardBuildApiUrl("/api/stock-auth/bootstrap");
const STOCK_DASHBOARD_LOGOUT_URL = stockDashboardBuildApiUrl("/api/stock-auth/logout");
const STOCK_DASHBOARD_CLEAR_DATA_URL = stockDashboardBuildApiUrl("/api/lab/stock-data");
const STOCK_DASHBOARD_USERS_URL = stockDashboardBuildApiUrl("/api/lab/users");
const STOCK_DASHBOARD_MANUAL_REQUEST_URL = stockDashboardBuildApiUrl("/api/lab/stock-requests/manual");
const STOCK_DASHBOARD_RECEIPTS_URL = stockDashboardBuildApiUrl("/api/lab/stock-receipts");
const STOCK_DASHBOARD_INVENTORY_URL = stockDashboardBuildApiUrl("/api/lab/stock-inventory");
const STOCK_DASHBOARD_BATCH_LOOKUP_URL = stockDashboardBuildApiUrl("/api/lab/stock-batches/lookup");

async function stockDashboardFetch(url, options = {}) {
  const nextOptions = {
    ...options,
    credentials: "include"
  };
  const response = await window.fetch(url, nextOptions);
  if (response.status === 401) {
    const payload = await response.clone().json().catch(() => ({}));
    if (String(payload?.reason || "").trim().toLowerCase() === "session_replaced") {
      stockDashboardHandleSessionReplaced(payload?.error || STOCK_DASHBOARD_REPLACED_MESSAGE, { broadcast: true, reload: true });
    }
  }
  return response;
}

const stockDashboardManualState = Object.create(null);
const stockDashboardReceiptRows = [];
const stockDashboardBatchLookupCache = new Map();
let stockDashboardManagedUsers = [];
let stockDashboardApiConfig = null;
let stockDashboardReceiptFormOpen = false;
let stockDashboardIsSummaryOpen = false;
const stockDashboardDatasets = {
  stockRequests: [],
  receivedStock: [],
  activeWorkQueue: [],
  archivedCompletedRequests: []
};

async function stockDashboardLoadApiConfig() {
  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_CONFIG_URL, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`Config fetch failed with status ${response.status}`);
    }
    const payload = await response.json().catch(() => ({}));
    stockDashboardApiConfig = payload;
    return payload;
  } catch (error) {
    console.error("Could not load stock dashboard API config", error);
    stockDashboardApiConfig = null;
    return null;
  }
}

function stockDashboardEscapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stockDashboardFormatStatus(status) {
  const safeStatus = String(status || "submitted").trim().toLowerCase();
  if (safeStatus === "submitted" || safeStatus === "received") return "Submitted";
  if (safeStatus === "packed") return "Ready for Collection";
  if (safeStatus === "ready") return "Ready for Collection";
  if (safeStatus === "collected" || safeStatus === "completed" || safeStatus === "sent") return "Collected";
  return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
}

function stockDashboardFormatDateTime(value) {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function stockDashboardGetDisplayName(user) {
  return String(user?.displayName || "").trim();
}

function stockDashboardGetDebugElabNumber(user) {
  const candidates = [
    user?.displayElabUserNumber,
    user?.eLabUserNumber,
    user?.elabUserNumber,
    user?.userNumber
  ];
  for (const candidate of candidates) {
    const safeValue = String(candidate || "").trim();
    if (/^\d+$/.test(safeValue)) return safeValue;
  }
  return "";
}

function stockDashboardNormalizeUserRole(role, isAdmin = false) {
  if (isAdmin) return "admin";
  const safeRole = String(role || "").trim().toLowerCase();
  if (safeRole === "admin") return "admin";
  if (
    safeRole === "labuser"
    || safeRole === "lab-user"
    || safeRole === "medical-technologist"
    || safeRole === "medical technologist"
    || safeRole === "medical_technologist"
    || safeRole === "technologist"
    || safeRole === "user"
  ) return "labUser";
  return "labUser";
}

function stockDashboardGetRoleLabel(role, isAdmin = false) {
  return stockDashboardNormalizeUserRole(role, isAdmin) === "admin"
    ? "Administrator"
    : "Medical Technologist";
}

function stockDashboardNormalizeUserStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "disabled" || safeStatus === "inactive" || safeStatus === "suspended") {
    return "Disabled";
  }
  return "Active";
}

function stockDashboardFormatOptionalDate(value) {
  if (!value) return "Not recorded";
  return stockDashboardFormatDateTime(value);
}

function stockDashboardGetUserHeading(user) {
  const displayName = stockDashboardGetDisplayName(user);
  const roleLabel = stockDashboardGetRoleLabel(user?.role, Boolean(user?.isOwner));
  if (displayName) return `${displayName} · ${roleLabel}`;
  return roleLabel;
}

function stockDashboardGetSignedInStatusText(session) {
  if (!session) return "Not signed in";
  const role = stockDashboardNormalizeUserRole(session?.role, Boolean(session?.isOwner));
  if (role === "admin") return "Signed in as Administrator";
  const displayName = stockDashboardGetDisplayName(session);
  if (displayName) return `Signed in as Medical Technologist – ${displayName}`;
  return "Signed in as Medical Technologist";
}

function stockDashboardBuildUserApiUrlById(userId) {
  const safeId = String(userId || "").trim();
  return stockDashboardBuildApiUrl(`/api/lab/users/by-id/${encodeURIComponent(safeId)}`);
}

function stockDashboardNormalizeStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "collected";
  if (safeStatus === "completed") return "collected";
  if (safeStatus === "received") return "submitted";
  return safeStatus || "submitted";
}

function stockDashboardGetQueueStatusMeta(status) {
  const safeStatus = stockDashboardNormalizeStatus(status);
  if (safeStatus === "submitted") return { label: "Submitted", stage: "submitted" };
  if (safeStatus === "processing" || safeStatus === "in-progress") return { label: "Ready for Collection", stage: "ready" };
  if (safeStatus === "packed") return { label: "Ready for Collection", stage: "ready" };
  if (safeStatus === "ready") return { label: "Ready for Collection", stage: "ready" };
  if (safeStatus === "collected") return { label: "Collected", stage: "collected" };
  if (safeStatus === "cancelled" || safeStatus === "rejected" || safeStatus === "failed") return { label: "Cancelled", stage: "cancelled" };
  return { label: "Submitted", stage: "submitted" };
}

function stockDashboardGetHeaders(includeJson = false) {
  const headers = {};
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

function stockDashboardSetCreateUserModalOpen(isOpen) {
  if (!stockDashboardCreateUserModal) return;

  const nextState = Boolean(isOpen);
  stockDashboardCreateUserModal.hidden = !nextState;
  document.body.classList.toggle("modal-open", nextState);

  if (nextState) {
    stockDashboardLastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (stockDashboardCreateUserModalStatus) {
      stockDashboardCreateUserModalStatus.textContent = "Use a display name, the same 2- or 3-digit eLab user number, and a 4-digit PIN.";
    }
    window.requestAnimationFrame(() => {
      stockDashboardCreateUserNameInput?.focus();
    });
    return;
  }

  if (stockDashboardCreateUserForm) stockDashboardCreateUserForm.reset();
  if (stockDashboardLastFocusedElement) {
    stockDashboardLastFocusedElement.focus();
  }
  stockDashboardLastFocusedElement = null;
}

function stockDashboardSetCreateUserMessage(message) {
  const text = String(message || "").trim();
  if (stockDashboardCreateUserModalStatus) {
    stockDashboardCreateUserModalStatus.textContent = text;
  }
  if (stockDashboardUserAdminStatus && text) {
    stockDashboardUserAdminStatus.textContent = text;
  }
}

function stockDashboardGetDisplayLabel(item) {
  const label = String(item?.label || "").trim();
  const variantLabel = String(item?.variantLabel || "").trim();
  return variantLabel ? `${label} - ${variantLabel}` : label;
}

function stockDashboardGetItemQuantityLabel(item) {
  if (typeof formatStockQuantity === "function") {
    return formatStockQuantity(item);
  }
  return String(item?.quantity || 0);
}

function stockDashboardSetEditorState(editorState) {
  stockConsumableItems.forEach((item) => {
    editorState[item.id] = 0;
  });
}

function stockDashboardGetSelectedItems(editorState) {
  return stockConsumableItems
    .map((item) => ({ ...item, quantity: Number(editorState[item.id] || 0) }))
    .filter((item) => item.quantity > 0);
}

function stockDashboardBuildReceiptItemCatalog() {
  if (!Array.isArray(stockConsumableItems)) return [];

  const rows = [];
  const byLabel = new Map();

  stockConsumableItems.forEach((item) => {
    const label = String(item?.label || "").trim();
    if (!label) return;

    let row = byLabel.get(label);
    if (!row) {
      row = {
        key: label,
        label,
        options: []
      };
      byLabel.set(label, row);
      rows.push(row);
    }

    if (item.unitType === "tray") {
      row.options.push({
        value: "tray",
        sourceItem: item,
        label: `Tray (${Number(item.traySize || 0) || 100} each)`
      });
      return;
    }

    if (item.unitType === "packet") {
      row.options.push({
        value: "packet",
        sourceItem: item,
        label: `Packet (${Number(item.packetSize || 0) || 50} each)`
      });
      return;
    }

    row.options.push({
      value: "each",
      sourceItem: item,
      label: "Each"
    });
  });

  return rows.map((entry) => {
    const trayOption = entry.options.find((option) => option.value === "tray");
    const eachOption = entry.options.find((option) => option.value === "each");
    const packetOption = entry.options.find((option) => option.value === "packet");
    const options = [];
    if (trayOption) options.push(trayOption);
    if (eachOption) options.push(eachOption);
    if (packetOption) options.push(packetOption);

    return {
      ...entry,
      options,
      defaultUnit: options[0]?.value || "each"
    };
  }).filter((entry) => entry.options.length > 0);
}

const stockDashboardReceiptItemCatalog = stockDashboardBuildReceiptItemCatalog();

function stockDashboardGetReceiptCatalogItem(itemKey) {
  const safeKey = String(itemKey || "");
  return stockDashboardReceiptItemCatalog.find((item) => item.key === safeKey) || null;
}

function stockDashboardGetReceiptUnitOption(catalogItem, unitType) {
  if (!catalogItem) return null;
  const safeUnitType = String(unitType || "");
  return catalogItem.options.find((option) => option.value === safeUnitType) || catalogItem.options[0] || null;
}

function stockDashboardGetReceiptRowSourceItem(row) {
  const catalogItem = stockDashboardGetReceiptCatalogItem(row?.itemKey);
  const unitOption = stockDashboardGetReceiptUnitOption(catalogItem, row?.unitType);
  return unitOption?.sourceItem || null;
}

function stockDashboardBuildBatchLookupCacheKey(itemKey, batchNumber) {
  return `${String(itemKey || "").trim().toLowerCase()}::${String(batchNumber || "").trim().toLowerCase()}`;
}

async function stockDashboardLookupReceiptBatch(row) {
  if (!row || !stockDashboardSession) return;

  const sourceItem = stockDashboardGetReceiptRowSourceItem(row);
  const batchNumber = String(row.batchNumber || "").trim();
  if (!sourceItem || !batchNumber) {
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
    return;
  }

  const itemKey = String(sourceItem.sheetColumnKey || sourceItem.id || sourceItem.label || "").trim();
  if (!itemKey) return;

  const cacheKey = stockDashboardBuildBatchLookupCacheKey(itemKey, batchNumber);
  let payload = stockDashboardBatchLookupCache.get(cacheKey) || null;
  if (!payload) {
    const lookupUrl = new URL(STOCK_DASHBOARD_BATCH_LOOKUP_URL, window.location.origin);
    lookupUrl.searchParams.set("itemKey", itemKey);
    lookupUrl.searchParams.set("itemId", String(sourceItem.id || ""));
    lookupUrl.searchParams.set("itemLabel", String(sourceItem.label || ""));
    lookupUrl.searchParams.set("batchNumber", batchNumber);

    const response = await stockDashboardFetch(lookupUrl.toString(), {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not validate batch expiry.");
    }
    stockDashboardBatchLookupCache.set(cacheKey, payload);
  }

  if (!payload?.exists || !payload?.batch) {
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
    return;
  }

  const existingExpiryDate = String(payload.batch.expiryDate || "").trim();
  if (!existingExpiryDate) {
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "This lot already exists but has no recorded expiry yet.";
    return;
  }

  row.lockedExpiryDate = existingExpiryDate;
  row.batchExpiryLocked = true;
  row.expiryDate = existingExpiryDate;
  row.batchExpiryMessage = `Existing lot detected. Expiry fixed to ${existingExpiryDate}.`;
}

function stockDashboardEnsureReceiptRows() {
  if (stockDashboardReceiptRows.length) return;
  if (!stockDashboardReceiptItemCatalog.length) return;

  stockDashboardReceiptRows.push({
    id: `receipt-row-${Date.now()}-0`,
    itemKey: stockDashboardReceiptItemCatalog[0].key,
    unitType: stockDashboardReceiptItemCatalog[0].defaultUnit,
    quantity: "",
    batchNumber: "",
    expiryDate: "",
    lockedExpiryDate: "",
    batchExpiryLocked: false,
    batchExpiryMessage: ""
  });
}

function stockDashboardAddReceiptRow(initialValues = {}) {
  const fallback = stockDashboardReceiptItemCatalog[0] || null;
  if (!fallback) return;

  const itemKey = stockDashboardGetReceiptCatalogItem(initialValues.itemKey)?.key || fallback.key;
  const catalogItem = stockDashboardGetReceiptCatalogItem(itemKey) || fallback;
  const nextUnitType = stockDashboardGetReceiptUnitOption(catalogItem, initialValues.unitType)?.value || catalogItem.defaultUnit;

  stockDashboardReceiptRows.push({
    id: `receipt-row-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    itemKey,
    unitType: nextUnitType,
    quantity: String(initialValues.quantity || "").trim(),
    batchNumber: String(initialValues.batchNumber || "").trim(),
    expiryDate: String(initialValues.expiryDate || "").trim(),
    lockedExpiryDate: String(initialValues.lockedExpiryDate || "").trim(),
    batchExpiryLocked: Boolean(initialValues.batchExpiryLocked),
    batchExpiryMessage: String(initialValues.batchExpiryMessage || "").trim()
  });
}

function stockDashboardRenderReceiptSummaryRows(summaryRows = []) {
  if (!stockDashboardReceiptSummaryList) return;

  if (!summaryRows.length) {
    stockDashboardReceiptSummaryList.innerHTML = '<p class="stock-dashboard-empty">Add items to see a live summary before saving.</p>';
    return;
  }

  stockDashboardReceiptSummaryList.innerHTML = summaryRows.map((row) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(row.label)} · ${stockDashboardEscapeHtml(row.quantityLabel)} · ${stockDashboardEscapeHtml(row.unitLabel)}</span>
      <strong>${stockDashboardEscapeHtml(`${row.totalUnits} units`)}</strong>
    </div>
  `).join("");
}

function stockDashboardRenderReceiptItemRows() {
  if (!stockDashboardReceiptItemsRows) return;

  stockDashboardEnsureReceiptRows();

  if (!stockDashboardReceiptRows.length) {
    stockDashboardReceiptItemsRows.innerHTML = '<p class="stock-dashboard-empty">No stock items configured.</p>';
    stockDashboardRenderReceiptSummaryRows([]);
    return;
  }

  stockDashboardReceiptItemsRows.innerHTML = stockDashboardReceiptRows.map((row, index) => {
    const catalogItem = stockDashboardGetReceiptCatalogItem(row.itemKey) || stockDashboardReceiptItemCatalog[0];
    const selectedUnit = stockDashboardGetReceiptUnitOption(catalogItem, row.unitType);
    const unitOptions = (catalogItem?.options || []).map((option) => `
      <option value="${stockDashboardEscapeHtml(option.value)}"${selectedUnit?.value === option.value ? " selected" : ""}>
        ${stockDashboardEscapeHtml(option.label)}
      </option>
    `).join("");
    const safeQuantity = String(row.quantity || "");
    const safeBatchNumber = String(row.batchNumber || "");
    const safeExpiryDate = String(row.expiryDate || "");
    const safeBatchMessage = String(row.batchExpiryMessage || "");

    return `
      <div class="stock-dashboard-receipt-item-row" data-receipt-row-id="${stockDashboardEscapeHtml(row.id)}">
        <label class="stock-order-field">
          <span class="stock-order-field-label">Stock item</span>
          <select data-receipt-field="item">
            ${(stockDashboardReceiptItemCatalog || []).map((item) => `
              <option value="${stockDashboardEscapeHtml(item.key)}"${item.key === catalogItem?.key ? " selected" : ""}>
                ${stockDashboardEscapeHtml(item.label)}
              </option>
            `).join("")}
          </select>
        </label>

        <label class="stock-order-field">
          <span class="stock-order-field-label">Quantity received</span>
          <input type="number" min="1" step="1" inputmode="numeric" pattern="[0-9]*" data-receipt-field="quantity" value="${stockDashboardEscapeHtml(safeQuantity)}" placeholder="0" />
        </label>

        <label class="stock-order-field">
          <span class="stock-order-field-label">Unit</span>
          <select data-receipt-field="unit">
            ${unitOptions}
          </select>
        </label>

        <label class="stock-order-field">
          <span class="stock-order-field-label">Batch / Lot number</span>
          <input type="text" data-receipt-field="batchNumber" value="${stockDashboardEscapeHtml(safeBatchNumber)}" placeholder="Optional batch / lot" />
        </label>

        <label class="stock-order-field">
          <span class="stock-order-field-label">Expiry date</span>
          <input type="date" data-receipt-field="expiryDate" value="${stockDashboardEscapeHtml(safeExpiryDate)}"${row.batchExpiryLocked ? " readonly" : ""} />
        </label>

        <div class="stock-dashboard-receipt-row-actions">
          <button type="button" class="quick-tool-clear-btn" data-receipt-remove-row="${stockDashboardEscapeHtml(row.id)}"${stockDashboardReceiptRows.length <= 1 ? " disabled" : ""}>Remove</button>
          <p class="stock-dashboard-status">Row ${index + 1}</p>
        </div>
        ${safeBatchMessage ? `<p class="stock-dashboard-status">${stockDashboardEscapeHtml(safeBatchMessage)}</p>` : ""}
      </div>
    `;
  }).join("");

  const preview = stockDashboardBuildReceiptPayload({ validate: false });
  stockDashboardRenderReceiptSummaryRows(preview.summaryRows);
}

function stockDashboardBuildReceiptPayload({ validate = true } = {}) {
  const errors = [];
  const mergedItems = new Map();
  const receiptItems = [];
  const batchExpiryByItemAndLot = new Map();
  const summaryRows = [];

  if (!stockDashboardReceiptRows.length) {
    if (validate) errors.push("Add at least one received item.");
    return { items: [], summaryRows, errors };
  }

  stockDashboardReceiptRows.forEach((row) => {
    const catalogItem = stockDashboardGetReceiptCatalogItem(row.itemKey);
    const unitOption = stockDashboardGetReceiptUnitOption(catalogItem, row.unitType);
    if (!catalogItem || !unitOption?.sourceItem) {
      if (validate) errors.push("Select a stock item for every row.");
      return;
    }

    const quantity = Number(String(row.quantity || "").trim());
    if (!Number.isInteger(quantity) || quantity <= 0) {
      if (validate) errors.push("Enter a positive whole number for every quantity.");
      return;
    }

    const sourceItem = unitOption.sourceItem;
    const itemForTotals = {
      ...sourceItem,
      quantity
    };
    const inventoryUnits = typeof getStockInventoryUnits === "function"
      ? getStockInventoryUnits(itemForTotals)
      : (sourceItem.unitType === "tray"
        ? quantity * Math.max(0, Number(sourceItem.traySize || 0))
        : sourceItem.unitType === "packet"
          ? quantity * Math.max(0, Number(sourceItem.packetSize || 0))
          : quantity);
    const batchNumber = String(row.batchNumber || "").trim();
    const expiryDateRaw = String(row.expiryDate || "").trim();
    const expiryDate = /^\d{4}-\d{2}-\d{2}$/.test(expiryDateRaw) ? expiryDateRaw : "";
    if (validate && expiryDateRaw && !expiryDate) {
      errors.push("Use a valid expiry date format (YYYY-MM-DD) for each item.");
      return;
    }
    if (validate && row.batchExpiryLocked && row.lockedExpiryDate && expiryDate && expiryDate !== row.lockedExpiryDate) {
      errors.push(`This lot number already exists for this item with expiry ${row.lockedExpiryDate}. Please use the same expiry date.`);
      return;
    }
    if (validate && batchNumber) {
      const itemBatchKey = `${String(sourceItem.sheetColumnKey || sourceItem.id || sourceItem.label || "").toLowerCase()}::${batchNumber.toLowerCase()}`;
      const knownExpiry = batchExpiryByItemAndLot.get(itemBatchKey) || "";
      if (knownExpiry && expiryDate && knownExpiry !== expiryDate) {
        errors.push(`This lot number already exists for this item with expiry ${knownExpiry}. Please use the same expiry date.`);
        return;
      }
      if (expiryDate) {
        batchExpiryByItemAndLot.set(itemBatchKey, expiryDate);
      }
    }

    receiptItems.push({
      id: sourceItem.id,
      label: sourceItem.label,
      variantLabel: sourceItem.variantLabel || "",
      quantity,
      unitType: sourceItem.unitType,
      traySize: sourceItem.traySize || null,
      packetSize: sourceItem.packetSize || null,
      formattedQuantity: typeof formatStockQuantity === "function"
        ? formatStockQuantity({ ...sourceItem, quantity })
        : String(quantity),
      inventoryUnits,
      sheetColumnKey: sourceItem.sheetColumnKey || "",
      sheetTrayColumnKey: sourceItem.sheetTrayColumnKey || "",
      sheetSingleColumnKey: sourceItem.sheetSingleColumnKey || "",
      batchNumber,
      expiryDate
    });
    const mergedKey = sourceItem.id;

    if (!mergedItems.has(mergedKey)) {
      mergedItems.set(mergedKey, {
        id: sourceItem.id,
        label: sourceItem.label,
        variantLabel: sourceItem.variantLabel || "",
        quantity: 0,
        unitType: sourceItem.unitType,
        traySize: sourceItem.traySize || null,
        packetSize: sourceItem.packetSize || null,
        formattedQuantity: "",
        inventoryUnits: 0,
        sheetColumnKey: sourceItem.sheetColumnKey || "",
        sheetTrayColumnKey: sourceItem.sheetTrayColumnKey || "",
        sheetSingleColumnKey: sourceItem.sheetSingleColumnKey || ""
      });
    }

    const merged = mergedItems.get(mergedKey);
    merged.quantity += quantity;
    merged.inventoryUnits += inventoryUnits;
    merged.formattedQuantity = typeof formatStockQuantity === "function"
      ? formatStockQuantity({ ...sourceItem, quantity: merged.quantity })
      : String(merged.quantity);
  });

  if (!mergedItems.size) {
    if (validate && !errors.length) errors.push("Add at least one received item.");
    return { items: [], summaryRows, errors };
  }

  const items = Array.from(mergedItems.values());
  items.forEach((item) => {
    const unitLabel = item.unitType === "tray"
      ? `Tray (${Number(item.traySize || 0) || 100} each)`
      : item.unitType === "packet"
        ? `Packet (${Number(item.packetSize || 0) || 50} each)`
        : "Each";
    summaryRows.push({
      label: stockDashboardGetDisplayLabel(item),
      quantityLabel: String(item.quantity),
      unitLabel,
      totalUnits: Number(item.inventoryUnits || 0)
    });
  });

  return { items: receiptItems, summaryRows, errors };
}

function stockDashboardBuildAuditRows(request) {
  const history = Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  if (!history.length) return "";

  return history.map((entry) => `
    <div class="stock-dashboard-audit-item">
      ${stockDashboardEscapeHtml(stockDashboardFormatStatus(entry.status))}
      · ${stockDashboardEscapeHtml(stockDashboardFormatDateTime(entry.updatedAt))}
      ${entry.updatedBy ? ` · Medical Technologist ${stockDashboardEscapeHtml(entry.updatedBy)}` : ""}
    </div>
  `).join("");
}

function stockDashboardRenderInventory(summary = []) {
  renderDashboardList(stockDashboardInventoryList, summary, (row) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(row.label)}</span>
      <strong>${Number(row.onHand || 0)} left</strong>
    </div>
  `);

  if (stockDashboardInventoryStatus) {
    const lowRows = summary.filter((row) => Number(row.onHand || 0) <= 0);
    stockDashboardInventoryStatus.textContent = lowRows.length
      ? `${lowRows.length} item${lowRows.length === 1 ? "" : "s"} are at zero or below.`
      : "Signed-in Medical Technologists can review live stock balances here.";
  }
}

function stockDashboardPrepareDatasets(requests = [], recentReceipts = []) {
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeReceipts = Array.isArray(recentReceipts) ? recentReceipts : [];
  const activeWorkQueue = safeRequests.filter((request) => stockDashboardNormalizeStatus(request?.status) !== "collected");
  const archivedCompletedRequests = safeRequests.filter((request) => stockDashboardNormalizeStatus(request?.status) === "collected");

  stockDashboardDatasets.stockRequests = safeRequests;
  stockDashboardDatasets.receivedStock = safeReceipts;
  stockDashboardDatasets.activeWorkQueue = activeWorkQueue;
  stockDashboardDatasets.archivedCompletedRequests = archivedCompletedRequests;
}

function stockDashboardRefreshDataSectionStatus() {
  if (!stockDashboardDataStatus) return;
  const requestCount = stockDashboardDatasets.stockRequests.length;
  const receiptCount = stockDashboardDatasets.receivedStock.length;
  const activeCount = stockDashboardDatasets.activeWorkQueue.length;
  const archivedCount = stockDashboardDatasets.archivedCompletedRequests.length;
  stockDashboardDataStatus.textContent = `Requests: ${requestCount} · Received stock records: ${receiptCount} · Active queue: ${activeCount} · Archived/Collected: ${archivedCount}.`;
}

function stockDashboardRenderEditorGrid(grid, editorState, editorKey) {
  if (!grid) return;

  grid.innerHTML = stockConsumableItems.map((item) => `
    <article class="stock-order-card stock-order-item-card" data-dashboard-editor="${stockDashboardEscapeHtml(editorKey)}" data-dashboard-item="${stockDashboardEscapeHtml(item.id)}">
      <div class="stock-order-item-head">
        <span class="stock-order-item-kicker">${stockDashboardEscapeHtml(stockDashboardGetDisplayLabel(item))}</span>
        <h3>${stockDashboardEscapeHtml(item.unitType === "tray" ? `Tray of ${item.traySize}` : item.unitType === "packet" ? `Packet of ${item.packetSize}` : "Singles")}</h3>
      </div>
      <div class="stock-order-qty-row">
        <button type="button" class="stock-order-qty-btn" data-dashboard-step="${stockDashboardEscapeHtml(item.id)}" data-dashboard-direction="-1">−</button>
        <input
          type="number"
          min="0"
          step="1"
          value="${Number(editorState[item.id] || 0)}"
          inputmode="numeric"
          pattern="[0-9]*"
          class="stock-order-qty-input"
          data-dashboard-input="${stockDashboardEscapeHtml(item.id)}"
          ${item.maxQuantity ? `max="${item.maxQuantity}"` : ""}
        />
        <button type="button" class="stock-order-qty-btn" data-dashboard-step="${stockDashboardEscapeHtml(item.id)}" data-dashboard-direction="1">+</button>
      </div>
      ${item.note ? `<p class="stock-order-item-copy">${stockDashboardEscapeHtml(item.note)}</p>` : ""}
    </article>
  `).join("");
}

function stockDashboardUpdateEditorItem(editorState, grid, itemId, quantity) {
  const config = stockConsumableItems.find((item) => item.id === itemId);
  const maxQuantity = Number(config?.maxQuantity || 0) || Infinity;
  const safeQuantity = Math.min(maxQuantity, Math.max(0, Number(quantity) || 0));
  editorState[itemId] = safeQuantity;
  const input = grid?.querySelector(`[data-dashboard-input="${itemId}"]`);
  if (input) {
    input.value = String(safeQuantity);
  }
}

function stockDashboardAttachGridEvents(grid, editorState) {
  if (!grid) return;

  grid.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-dashboard-step]");
    if (!(button instanceof HTMLButtonElement)) return;
    const itemId = button.getAttribute("data-dashboard-step") || "";
    const direction = Number(button.getAttribute("data-dashboard-direction") || "0");
    stockDashboardUpdateEditorItem(editorState, grid, itemId, Number(editorState[itemId] || 0) + direction);
  });

  grid.addEventListener("input", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const input = target?.closest("[data-dashboard-input]");
    if (!(input instanceof HTMLInputElement)) return;
    const itemId = input.getAttribute("data-dashboard-input") || "";
    stockDashboardUpdateEditorItem(editorState, grid, itemId, input.value);
  });
}

function stockDashboardGetMarker(request) {
  return request?.id && request?.createdAt ? `${request.createdAt}::${request.id}` : "";
}

function stockDashboardGetScopedKey(prefix) {
  return stockDashboardSession?.userNumber ? `${prefix}:${stockDashboardSession.userNumber}` : "";
}

function stockDashboardReadScopedValue(prefix) {
  const key = stockDashboardGetScopedKey(prefix);
  return key ? String(localStorage.getItem(key) || "") : "";
}

function stockDashboardWriteScopedValue(prefix, value) {
  const key = stockDashboardGetScopedKey(prefix);
  if (!key) return;
  localStorage.setItem(key, String(value || ""));
}

function stockDashboardClearScopedValuesForUserNumber(userNumber) {
  const safeUserNumber = String(userNumber || "").trim();
  if (!safeUserNumber) return;
  const keys = [
    `${STOCK_DASHBOARD_LAST_SEEN_PREFIX}:${safeUserNumber}`,
    `${STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX}:${safeUserNumber}`
  ];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    stockDashboardLogAuthDebug("storage-remove", { key });
  });
}

function stockDashboardRemoveStorageKeyFromAllStores(key) {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // no-op
  }
  stockDashboardLogAuthDebug("storage-remove", { key });
}

function stockDashboardClearStorageByPrefixes(prefixes = []) {
  [localStorage, sessionStorage].forEach((store) => {
    try {
      for (let index = store.length - 1; index >= 0; index -= 1) {
        const key = String(store.key(index) || "");
        if (!key) continue;
        if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
        store.removeItem(key);
        stockDashboardLogAuthDebug("storage-remove-prefix", { key });
      }
    } catch {
      // no-op
    }
  });
}

function stockDashboardSetSignedOutOverride(enabled) {
  if (enabled) {
    try {
      localStorage.setItem(STOCK_DASHBOARD_SIGNED_OUT_KEY, "1");
    } catch {
      // no-op
    }
    try {
      sessionStorage.setItem(STOCK_DASHBOARD_SIGNED_OUT_KEY, "1");
    } catch {
      // no-op
    }
    return;
  }
  stockDashboardRemoveStorageKeyFromAllStores(STOCK_DASHBOARD_SIGNED_OUT_KEY);
}

function stockDashboardHasSignedOutOverride() {
  try {
    if (localStorage.getItem(STOCK_DASHBOARD_SIGNED_OUT_KEY) === "1") return true;
  } catch {
    // no-op
  }
  try {
    if (sessionStorage.getItem(STOCK_DASHBOARD_SIGNED_OUT_KEY) === "1") return true;
  } catch {
    // no-op
  }
  return false;
}

function stockDashboardSetActiveAuthMarker(enabled) {
  if (enabled) {
    try {
      localStorage.setItem(STOCK_DASHBOARD_ACTIVE_AUTH_KEY, "1");
    } catch {
      // no-op
    }
    return;
  }
  stockDashboardRemoveStorageKeyFromAllStores(STOCK_DASHBOARD_ACTIVE_AUTH_KEY);
}

function stockDashboardHasActiveAuthMarker() {
  try {
    return localStorage.getItem(STOCK_DASHBOARD_ACTIVE_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

function stockDashboardClearAuthStateStorage() {
  STOCK_DASHBOARD_AUTH_STATE_KEYS.forEach((key) => {
    stockDashboardRemoveStorageKeyFromAllStores(key);
  });
  stockDashboardClearStorageByPrefixes([
    `${STOCK_DASHBOARD_LAST_SEEN_PREFIX}:`,
    `${STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX}:`
  ]);
}

function stockDashboardSetAuthFlashMessage(message) {
  const safe = String(message || "").trim();
  if (!safe) return;
  try {
    sessionStorage.setItem(STOCK_DASHBOARD_AUTH_FLASH_MESSAGE_KEY, safe);
  } catch {
    // no-op
  }
}

function stockDashboardConsumeAuthFlashMessage() {
  try {
    const message = String(sessionStorage.getItem(STOCK_DASHBOARD_AUTH_FLASH_MESSAGE_KEY) || "").trim();
    if (!message) return "";
    sessionStorage.removeItem(STOCK_DASHBOARD_AUTH_FLASH_MESSAGE_KEY);
    return message;
  } catch {
    return "";
  }
}

function stockDashboardApplyAuthFlashMessage() {
  const message = stockDashboardConsumeAuthFlashMessage();
  if (!message) return;
  if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = message;
  if (stockDashboardSessionMessage && !stockDashboardSession) stockDashboardSessionMessage.textContent = message;
}

function stockDashboardBroadcastAuthEvent(type, message = "") {
  const payload = {
    type: String(type || "").trim(),
    message: String(message || "").trim(),
    timestamp: Date.now()
  };
  if (!payload.type) return;
  try {
    stockDashboardAuthSyncChannel?.postMessage(payload);
  } catch {
    // no-op
  }
  try {
    localStorage.setItem(STOCK_DASHBOARD_AUTH_SYNC_EVENT_KEY, JSON.stringify(payload));
    localStorage.removeItem(STOCK_DASHBOARD_AUTH_SYNC_EVENT_KEY);
  } catch {
    // no-op
  }
}

function stockDashboardHandleSessionReplaced(message = STOCK_DASHBOARD_REPLACED_MESSAGE, { broadcast = true, reload = true } = {}) {
  if (stockDashboardHandlingRemoteLogout) return;
  stockDashboardHandlingRemoteLogout = true;
  const safeMessage = String(message || "").trim() || STOCK_DASHBOARD_REPLACED_MESSAGE;
  stockDashboardClearAuthStateStorage();
  stockDashboardSetSignedOutOverride(true);
  stockDashboardSetAuthFlashMessage(safeMessage);
  stockDashboardSetSession(null);
  if (broadcast) {
    stockDashboardBroadcastAuthEvent("session_replaced", safeMessage);
  }
  if (reload) {
    window.location.assign("/stock-dashboard.html");
    return;
  }
  if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = safeMessage;
  if (stockDashboardSessionMessage) stockDashboardSessionMessage.textContent = safeMessage;
  stockDashboardHandlingRemoteLogout = false;
}

function stockDashboardHandleAuthSyncPayload(payload = {}) {
  const type = String(payload?.type || "").trim().toLowerCase();
  const message = String(payload?.message || "").trim();
  if (type === "session_replaced") {
    stockDashboardHandleSessionReplaced(message || STOCK_DASHBOARD_REPLACED_MESSAGE, { broadcast: false, reload: true });
    return;
  }
  if (type === "logout") {
    stockDashboardClearAuthStateStorage();
    stockDashboardSetSignedOutOverride(true);
    stockDashboardSetSession(null);
    window.location.assign("/stock-dashboard.html");
  }
}

function stockDashboardInitAuthSync() {
  if (typeof window === "undefined") return;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      stockDashboardAuthSyncChannel = new BroadcastChannel(STOCK_DASHBOARD_AUTH_BROADCAST_NAME);
      stockDashboardAuthSyncChannel.onmessage = (event) => {
        stockDashboardHandleAuthSyncPayload(event?.data || {});
      };
    } catch {
      stockDashboardAuthSyncChannel = null;
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STOCK_DASHBOARD_AUTH_SYNC_EVENT_KEY || !event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue);
      stockDashboardHandleAuthSyncPayload(payload || {});
    } catch {
      // no-op
    }
  });
}

function stockDashboardHasAdminQueryFlag() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    return params.get("admin") === "1";
  } catch {
    return false;
  }
}

function stockDashboardGetCleanDashboardUrl() {
  return `${window.location.origin}/stock-dashboard.html`;
}

function stockDashboardSanitizeDashboardUrlOnLoad() {
  if (!stockDashboardHasAdminQueryFlag()) return;
  try {
    window.history.replaceState(null, "", stockDashboardGetCleanDashboardUrl());
  } catch {
    // no-op
  }
}

function stockDashboardReturnToPreviousPage() {
  try {
    const referrer = String(document.referrer || "");
    if (referrer) {
      const referrerUrl = new URL(referrer);
      if (referrerUrl.origin === window.location.origin && window.history.length > 1) {
        window.history.back();
        return;
      }
    }
  } catch {
    // Fall through to home.
  }

  window.location.assign("./index.html");
}

function stockDashboardSetAccessModalOpen(isOpen) {
  if (stockDashboardAccessCard) {
    stockDashboardAccessCard.hidden = !isOpen;
  }

  document.body.classList.toggle("stock-dashboard-login-open", isOpen);
  window.clearTimeout(stockDashboardLoginModalFocusTimer);

  if (isOpen && !stockDashboardSession && stockDashboardUserNumberInput) {
    stockDashboardLoginModalFocusTimer = window.setTimeout(() => {
      stockDashboardUserNumberInput.focus({ preventScroll: true });
    }, 40);
  }

  if (isOpen && stockDashboardSession && stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = "Already signed in. Use Log out to switch accounts.";
  }
}

function stockDashboardOpenLoginModal() {
  if (stockDashboardSession && stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = "Already signed in. Use Log out to switch accounts.";
  } else if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = stockDashboardSetupRequired
      ? "No lab admin is set up yet. Enter your eLab user number (2 or 3 digits) and 4-digit PIN to create the first admin."
      : "Sign in to view dashboard data and update request status.";
  }
  stockDashboardSetAccessModalOpen(true);
}

function stockDashboardBrowserAlertsEnabled() {
  return localStorage.getItem(STOCK_DASHBOARD_BROWSER_ALERTS_KEY) === "true";
}

function stockDashboardUpdateNotificationPermissionUi() {
  if (!stockDashboardEnableAlertsBtn) return;

  if (!("Notification" in window)) {
    stockDashboardEnableAlertsBtn.disabled = true;
    stockDashboardEnableAlertsBtn.textContent = "Browser alerts unavailable";
    return;
  }

  if (Notification.permission === "granted") {
    stockDashboardEnableAlertsBtn.disabled = false;
    stockDashboardEnableAlertsBtn.textContent = stockDashboardBrowserAlertsEnabled()
      ? "Browser alerts on"
      : "Use browser alerts";
    return;
  }

  if (Notification.permission === "denied") {
    stockDashboardEnableAlertsBtn.disabled = true;
    stockDashboardEnableAlertsBtn.textContent = "Browser alerts blocked";
    return;
  }

  stockDashboardEnableAlertsBtn.disabled = false;
  stockDashboardEnableAlertsBtn.textContent = "Enable browser alerts";
}

function stockDashboardStartPolling() {
  window.clearInterval(stockDashboardPollTimer);
  stockDashboardPollTimer = 0;

  if (!stockDashboardSession) return;

  stockDashboardPollTimer = window.setInterval(() => {
    loadStockDashboard({ silent: true, fromPoll: true });
  }, STOCK_DASHBOARD_POLL_MS);
}

function stockDashboardStopPolling() {
  window.clearInterval(stockDashboardPollTimer);
  stockDashboardPollTimer = 0;
}

async function stockDashboardValidateSession() {
  if (!stockDashboardSession || stockDashboardLogoutInProgress) return;
  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_SESSION_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && String(payload?.reason || "").trim().toLowerCase() === "session_replaced") {
      stockDashboardHandleSessionReplaced(payload?.error || STOCK_DASHBOARD_REPLACED_MESSAGE, { broadcast: true, reload: true });
      return;
    }
    if (!response.ok || !payload?.authenticated || !payload?.user) {
      stockDashboardSetSession(null);
    }
  } catch {
    // keep existing session on transient network errors
  }
}

function stockDashboardStartSessionValidationPolling() {
  window.clearInterval(stockDashboardSessionCheckTimer);
  stockDashboardSessionCheckTimer = 0;
  if (!stockDashboardSession) return;
  stockDashboardSessionCheckTimer = window.setInterval(() => {
    stockDashboardValidateSession();
  }, STOCK_DASHBOARD_SESSION_CHECK_MS);
}

function stockDashboardStopSessionValidationPolling() {
  window.clearInterval(stockDashboardSessionCheckTimer);
  stockDashboardSessionCheckTimer = 0;
}

function stockDashboardClearInactivityTimers() {
  window.clearTimeout(stockDashboardInactivityWarningTimer);
  window.clearTimeout(stockDashboardInactivityLogoutTimer);
  stockDashboardInactivityWarningTimer = 0;
  stockDashboardInactivityLogoutTimer = 0;
}

function stockDashboardShowInactivityWarning() {
  if (!stockDashboardSession) return;
  stockDashboardInactivityWarningShown = true;
  if (stockDashboardStatus) {
    stockDashboardStatusBeforeInactivityWarning = String(stockDashboardStatus.textContent || "");
    stockDashboardStatus.textContent = STOCK_DASHBOARD_INACTIVITY_WARNING_TEXT;
  }
}

function stockDashboardCancelInactivityWarning() {
  if (!stockDashboardInactivityWarningShown) return;
  stockDashboardInactivityWarningShown = false;
  if (stockDashboardStatus?.textContent === STOCK_DASHBOARD_INACTIVITY_WARNING_TEXT) {
    stockDashboardStatus.textContent = stockDashboardStatusBeforeInactivityWarning || "Session active.";
  }
  stockDashboardStatusBeforeInactivityWarning = "";
}

async function stockDashboardAutoLogoutForInactivity() {
  if (!stockDashboardSession) return;
  stockDashboardClearInactivityTimers();
  stockDashboardInactivityWarningShown = false;
  stockDashboardStatusBeforeInactivityWarning = "";
  await logoutStockDashboard();
  if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = STOCK_DASHBOARD_INACTIVITY_LOGOUT_TEXT;
  }
  if (stockDashboardStatus) {
    stockDashboardStatus.textContent = STOCK_DASHBOARD_INACTIVITY_LOGOUT_TEXT;
  }
}

function stockDashboardResetInactivityWatch() {
  if (!stockDashboardSession) return;
  stockDashboardClearInactivityTimers();
  stockDashboardCancelInactivityWarning();

  stockDashboardInactivityWarningTimer = window.setTimeout(() => {
    stockDashboardShowInactivityWarning();
  }, STOCK_DASHBOARD_INACTIVITY_WARNING_MS);

  stockDashboardInactivityLogoutTimer = window.setTimeout(() => {
    stockDashboardAutoLogoutForInactivity();
  }, STOCK_DASHBOARD_INACTIVITY_LOGOUT_MS);
}

function stockDashboardHandleActivity(event) {
  if (!stockDashboardSession) return;
  const now = Date.now();
  if (event?.type === "mousemove" && !stockDashboardInactivityWarningShown && now - stockDashboardLastActivityResetAt < 1000) {
    return;
  }
  stockDashboardLastActivityResetAt = now;
  stockDashboardResetInactivityWatch();
}

function stockDashboardBindInactivityHandlers() {
  if (stockDashboardInactivityHandlersBound) return;
  stockDashboardInactivityHandlersBound = true;

  [
    "mousemove",
    "click",
    "keydown",
    "scroll",
    "touchstart"
  ].forEach((eventName) => {
    document.addEventListener(eventName, stockDashboardHandleActivity, { passive: true });
  });
}

function stockDashboardRenderNotificationState() {
  if (stockDashboardNotificationCard) {
    stockDashboardNotificationCard.hidden = !stockDashboardSession;
  }

  if (!stockDashboardSession) {
    if (stockDashboardNotificationTitle) stockDashboardNotificationTitle.textContent = "No new requests";
    if (stockDashboardNotificationStatus) stockDashboardNotificationStatus.textContent = "Alerts work for signed-in Medical Technologists while this dashboard stays open.";
    if (stockDashboardAlertBadge) stockDashboardAlertBadge.hidden = true;
    if (stockDashboardMarkSeenBtn) stockDashboardMarkSeenBtn.hidden = true;
    return;
  }

  if (stockDashboardUnreadCount > 0) {
    if (stockDashboardNotificationTitle) {
      stockDashboardNotificationTitle.textContent = stockDashboardUnreadCount === 1
        ? "1 new request waiting"
        : `${stockDashboardUnreadCount} new requests waiting`;
    }
    if (stockDashboardNotificationStatus) {
      stockDashboardNotificationStatus.textContent = "New stock requests have arrived for the lab team.";
    }
    if (stockDashboardAlertBadge) {
      stockDashboardAlertBadge.hidden = false;
      stockDashboardAlertBadge.textContent = stockDashboardUnreadCount === 1 ? "1 new" : `${stockDashboardUnreadCount} new`;
    }
    if (stockDashboardMarkSeenBtn) stockDashboardMarkSeenBtn.hidden = false;
  } else {
    if (stockDashboardNotificationTitle) stockDashboardNotificationTitle.textContent = "No new requests";
    if (stockDashboardNotificationStatus) {
      stockDashboardNotificationStatus.textContent = "Alerts work for signed-in Medical Technologists while this dashboard stays open.";
    }
    if (stockDashboardAlertBadge) stockDashboardAlertBadge.hidden = true;
    if (stockDashboardMarkSeenBtn) stockDashboardMarkSeenBtn.hidden = true;
  }
}

function stockDashboardNotifyBrowser(newRequests) {
  if (!newRequests.length) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!stockDashboardBrowserAlertsEnabled()) return;

  const newestRequest = newRequests[0];
  const body = newRequests.length === 1
    ? `${newestRequest.requestedBy || "A ward"} · ${newestRequest.wardUnit || "No ward"}`
    : `${newRequests.length} new stock requests are waiting in the dashboard.`;

  const notification = new Notification("Find My Tube Lab Alert", {
    body,
    tag: "find-my-tube-stock-alert",
    renotify: true
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

function stockDashboardProcessNotifications(requests, { fromPoll = false } = {}) {
  if (!stockDashboardSession) return;

  const latestMarker = stockDashboardGetMarker(requests[0]);
  const lastSeenMarker = stockDashboardReadScopedValue(STOCK_DASHBOARD_LAST_SEEN_PREFIX);
  const lastNotifiedMarker = stockDashboardReadScopedValue(STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX);
  stockDashboardLatestRequestMarker = latestMarker;

  if (!lastSeenMarker) {
    if (latestMarker) {
      stockDashboardWriteScopedValue(STOCK_DASHBOARD_LAST_SEEN_PREFIX, latestMarker);
      stockDashboardWriteScopedValue(STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX, latestMarker);
    }
    stockDashboardUnreadCount = 0;
    stockDashboardRenderNotificationState();
    return;
  }

  if (!latestMarker || latestMarker === lastSeenMarker) {
    stockDashboardUnreadCount = 0;
    stockDashboardRenderNotificationState();
    return;
  }

  const seenIndex = requests.findIndex((request) => stockDashboardGetMarker(request) === lastSeenMarker);
  const newRequests = seenIndex === -1 ? requests : requests.slice(0, seenIndex);
  stockDashboardUnreadCount = newRequests.length;
  stockDashboardRenderNotificationState();

  if (!newRequests.length) return;
  if (fromPoll && latestMarker !== lastNotifiedMarker) {
    stockDashboardNotifyBrowser(newRequests);
    stockDashboardWriteScopedValue(STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX, latestMarker);
  }
}

function stockDashboardMarkNotificationsSeen() {
  if (!stockDashboardSession || !stockDashboardLatestRequestMarker) return;

  stockDashboardWriteScopedValue(STOCK_DASHBOARD_LAST_SEEN_PREFIX, stockDashboardLatestRequestMarker);
  stockDashboardWriteScopedValue(STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX, stockDashboardLatestRequestMarker);
  stockDashboardUnreadCount = 0;
  stockDashboardRenderNotificationState();
}

function stockDashboardSetSession(user) {
  if (stockDashboardAuthState === "checking") {
    stockDashboardClearLoginPendingWork();
  }

  stockDashboardSession = user ? {
    userNumber: user.userNumber,
    displayName: stockDashboardGetDisplayName(user),
    role: stockDashboardNormalizeUserRole(user.role, Boolean(user.isOwner)),
    isOwner: Boolean(user.isOwner)
  } : null;
  if (stockDashboardSession) {
    stockDashboardSetSignedOutOverride(false);
    stockDashboardSetActiveAuthMarker(true);
  } else {
    stockDashboardSetActiveAuthMarker(false);
  }

  const { isLoggedIn, isAdmin, canViewDashboard } = stockDashboardGetAccessFlags(stockDashboardSession);
  stockDashboardLogAuthDebug("set-session", {
    sessionUser: stockDashboardSession ? {
      userNumber: stockDashboardSession.userNumber,
      role: stockDashboardSession.role,
      isOwner: stockDashboardSession.isOwner
    } : null,
    isLoggedIn,
    isAdmin,
    canViewDashboard
  });
  stockDashboardSetAccessModalOpen(false);
  if (stockDashboardAuthForm) stockDashboardAuthForm.hidden = isLoggedIn;
  if (stockDashboardSessionCard) stockDashboardSessionCard.hidden = false;
  if (stockDashboardSessionLoginBtn) stockDashboardSessionLoginBtn.hidden = isLoggedIn;
  if (stockDashboardLogoutBtn) stockDashboardLogoutBtn.hidden = !isLoggedIn;
  if (stockDashboardStatsControls) stockDashboardStatsControls.hidden = !canViewDashboard;
  if (stockDashboardRequestsCard) stockDashboardRequestsCard.hidden = !canViewDashboard;
  if (stockDashboardUserAdminCard) stockDashboardUserAdminCard.hidden = !isAdmin;
  if (stockDashboardOpenCreateUserBtn) {
    stockDashboardOpenCreateUserBtn.hidden = !isAdmin;
  }
  if (stockDashboardManualEntryCard) stockDashboardManualEntryCard.hidden = !canViewDashboard;
  if (stockDashboardReceiptCard) stockDashboardReceiptCard.hidden = !canViewDashboard;
  if (stockDashboardInventoryCard) stockDashboardInventoryCard.hidden = !canViewDashboard;
  if (stockDashboardDataCard) stockDashboardDataCard.hidden = !canViewDashboard;
  if (stockDashboardClearOldDataBtn) stockDashboardClearOldDataBtn.hidden = !isAdmin;
  if (!canViewDashboard) {
    stockDashboardSetReceiptFormOpen(false);
    stockDashboardSetSummaryOpen(false);
  } else {
    stockDashboardSetSummaryOpen(stockDashboardIsSummaryOpen);
  }
  if (!isAdmin) {
    stockDashboardSetCreateUserModalOpen(false);
  }

  if (stockDashboardSessionKicker) {
    stockDashboardSessionKicker.textContent = "Status";
  }

  if (stockDashboardSessionUser) {
    stockDashboardSessionUser.textContent = stockDashboardGetSignedInStatusText(stockDashboardSession);
  }

  if (stockDashboardSessionMessage) {
    stockDashboardSessionMessage.textContent = isLoggedIn
      ? "You can now view dashboard data and manage stock requests."
      : "Sign in to view dashboard data and manage stock requests.";
  }

  if (clearStockDataBtn) {
    clearStockDataBtn.hidden = !isAdmin;
  }

  if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = isLoggedIn
      ? "Session active. Use Log out to switch accounts."
      : stockDashboardSetupRequired
        ? "No lab admin is set up yet. Enter your eLab user number (2 or 3 digits) and 4-digit PIN to create the first admin."
        : "Sign in to view dashboard data and update request status.";
  }
  stockDashboardSetAuthControlsDisabled(false);
  stockDashboardAuthState = isLoggedIn ? "success" : "idle";

  if (stockDashboardLoginBtn) {
    stockDashboardLoginBtn.textContent = isLoggedIn
      ? "Log In"
      : stockDashboardSetupRequired
        ? "Create Admin"
        : "Log In";
  }

  if (!isLoggedIn) {
    stockDashboardClearInactivityTimers();
    stockDashboardInactivityWarningShown = false;
    stockDashboardStatusBeforeInactivityWarning = "";
    stockDashboardLatestRequestMarker = "";
    stockDashboardUnreadCount = 0;
    stockDashboardStopPolling();
    stockDashboardStopSessionValidationPolling();
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Dashboard locked. Log in to view requests and stock insights.";
    }
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Locked. Log in to view dashboard data.</p>';
    }
    if (stockDashboardUserList) {
      stockDashboardUserList.innerHTML = "";
    }
    stockDashboardManagedUsers = [];
    if (stockDashboardInventoryList) stockDashboardInventoryList.innerHTML = "";
    stockDashboardPrepareDatasets([], []);
    stockDashboardRefreshDataSectionStatus();
    if (stockDashboardStatusCounts) stockDashboardStatusCounts.innerHTML = "";
    if (stockDashboardTopWards) stockDashboardTopWards.innerHTML = "";
    if (stockDashboardTopItems) stockDashboardTopItems.innerHTML = "";
    if (stockDashboardTotalRequests) stockDashboardTotalRequests.textContent = "0";
    if (stockDashboardOpenRequests) stockDashboardOpenRequests.textContent = "0";
    if (stockDashboardLineItems) stockDashboardLineItems.textContent = "0";
    if (stockDashboardUnitsRequested) stockDashboardUnitsRequested.textContent = "0";
  } else {
    stockDashboardBindInactivityHandlers();
    stockDashboardResetInactivityWatch();
    stockDashboardUpdateNotificationPermissionUi();
    stockDashboardRenderNotificationState();
    stockDashboardStartPolling();
    stockDashboardStartSessionValidationPolling();
  }
  stockDashboardApplyAuthFlashMessage();
}

async function loadPublicStockDashboardRequests() {
  if (!stockDashboardRequestList) return;

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_PUBLIC_REQUESTS_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Public requests failed with status ${response.status}`);
    }

    const payload = await response.json().catch(() => ({}));
    const requests = Array.isArray(payload?.requests) ? payload.requests : [];
    renderStockDashboardRequests(requests);

    if (stockDashboardStatus && !stockDashboardSession) {
      stockDashboardStatus.textContent = requests.length
        ? `Showing ${requests.length} recent submitted request${requests.length === 1 ? "" : "s"}. Sign in to manage statuses.`
        : "No consumables requests yet. New ward requests will appear here automatically.";
    }
  } catch {
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Dashboard data could not load. Please check your connection or refresh the page.</p>';
    }
  }
}

function stockDashboardGetCredentials() {
  const userNumber = String(stockDashboardUserNumberInput?.value || "").trim();
  const pin = String(stockDashboardPinInput?.value || "").trim();
  return { userNumber, pin };
}

function stockDashboardIsValidElabUserNumber(userNumber) {
  return /^\d{2,3}$/.test(String(userNumber || "").trim());
}

function stockDashboardIsValidPin(pin) {
  return /^\d{4}$/.test(String(pin || "").trim());
}

function stockDashboardNormalizeElabUserNumber(raw) {
  const typed = String(raw || "").trim();
  if (!/^\d+$/.test(typed)) return "";
  return typed.replace(/^0+(?=\d)/, "");
}

function stockDashboardGetAccessFlags(session) {
  const isLoggedIn = Boolean(session);
  const isAdmin = Boolean(isLoggedIn && session?.role === "admin");
  const canViewDashboard = isLoggedIn;
  return { isLoggedIn, isAdmin, canViewDashboard };
}

function stockDashboardSetSummaryOpen(isOpen) {
  stockDashboardIsSummaryOpen = Boolean(isOpen);
  const canViewDashboard = Boolean(stockDashboardSession);
  const shouldShowPanel = canViewDashboard && stockDashboardIsSummaryOpen;

  if (stockDashboardStatsPanel) {
    stockDashboardStatsPanel.hidden = !shouldShowPanel;
  }
  if (stockDashboardMetrics) {
    stockDashboardMetrics.hidden = !shouldShowPanel;
  }
  if (stockDashboardInsights) {
    stockDashboardInsights.hidden = !shouldShowPanel;
  }
  if (stockDashboardToggleStatsBtn) {
    stockDashboardToggleStatsBtn.textContent = shouldShowPanel ? "Hide summary" : "Show summary";
    stockDashboardToggleStatsBtn.setAttribute("aria-expanded", shouldShowPanel ? "true" : "false");
  }
}

function stockDashboardSetReceiptFormOpen(isOpen) {
  stockDashboardReceiptFormOpen = Boolean(isOpen);
  if (stockDashboardReceiptFormWrap) {
    stockDashboardReceiptFormWrap.hidden = !stockDashboardReceiptFormOpen;
  }
  if (stockDashboardReceiptToggleBtn) {
    stockDashboardReceiptToggleBtn.setAttribute("aria-expanded", stockDashboardReceiptFormOpen ? "true" : "false");
    stockDashboardReceiptToggleBtn.textContent = stockDashboardReceiptFormOpen ? "Hide received stock form" : "Add received stock";
  }
}

function stockDashboardIsAdminSession() {
  return Boolean(stockDashboardSession && stockDashboardSession.role === "admin");
}

function stockDashboardSetAuthControlsDisabled(isDisabled) {
  if (stockDashboardUserNumberInput instanceof HTMLInputElement) {
    stockDashboardUserNumberInput.disabled = isDisabled;
  }
  if (stockDashboardPinInput instanceof HTMLInputElement) {
    stockDashboardPinInput.disabled = isDisabled;
  }
  if (stockDashboardLoginBtn instanceof HTMLButtonElement) {
    stockDashboardLoginBtn.disabled = isDisabled;
  }
}

function stockDashboardSetAuthState(nextState, message = "") {
  stockDashboardAuthState = nextState;
  if (nextState === "checking") {
    stockDashboardSetAuthControlsDisabled(true);
    if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = "Checking details...";
    return;
  }

  stockDashboardSetAuthControlsDisabled(false);
  if (!message) return;
  if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = message;
}

function stockDashboardClearLoginPendingWork() {
  if (stockDashboardLoginTimeoutTimer) {
    window.clearTimeout(stockDashboardLoginTimeoutTimer);
    stockDashboardLoginTimeoutTimer = 0;
  }
  if (stockDashboardLoginAbortController) {
    stockDashboardLoginAbortController.abort();
    stockDashboardLoginAbortController = null;
  }
}

function stockDashboardCancelLoginAttempt({ message = "Login cancelled.", goIdle = true } = {}) {
  if (stockDashboardAuthState !== "checking") return;
  stockDashboardClearLoginPendingWork();
  stockDashboardLoginAttemptId += 1;
  if (goIdle) {
    stockDashboardSetAuthState("idle", message);
    return;
  }
  stockDashboardSetAuthState("error", message);
}

function stockDashboardSetBusy(isBusy) {
  [
    stockDashboardLoginBtn,
    stockDashboardRefreshBtn,
    stockDashboardCreateUserBtn,
    stockDashboardManualSubmitBtn,
    stockDashboardManualResetBtn,
    stockDashboardReceiptAddItemBtn,
    stockDashboardReceiptSubmitBtn,
    stockDashboardReceiptResetBtn
  ].forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = isBusy;
    }
  });
}

function stockDashboardGetAuthErrorMessage(response, payload, { setupRequired = false } = {}) {
  const statusCode = Number(response?.status || 0);
  const errorCode = String(payload?.code || "").trim().toLowerCase();
  const backendMessage = String(payload?.error || "").trim();
  const backendDetail = String(payload?.detail || "").trim().toLowerCase();
  const safeBackendMessage = backendMessage.replace(/\s+/g, " ").trim();

  if (errorCode === "invalid_credentials" || statusCode === 401) {
    return STOCK_DASHBOARD_INVALID_LOGIN_TEXT;
  }

  if (errorCode === "login_service_unavailable" || statusCode === 503) {
    return STOCK_DASHBOARD_LOGIN_UNAVAILABLE_TEXT;
  }

  if (errorCode === "server_configuration_error") {
    return STOCK_DASHBOARD_LOGIN_CONFIG_TEXT;
  }

  if (
    statusCode === 500
    && (
      backendDetail.includes("active_session_token_hash")
      || backendDetail.includes("last_seen_at")
      || backendDetail.includes("last_login_at")
      || backendDetail.includes("relation \"users\"")
    )
  ) {
    return STOCK_DASHBOARD_LOGIN_CONFIG_TEXT;
  }

  if (statusCode === 400 && safeBackendMessage) {
    return safeBackendMessage;
  }

  if (setupRequired && safeBackendMessage) {
    return safeBackendMessage;
  }

  if (statusCode >= 500) {
    return STOCK_DASHBOARD_LOGIN_UNAVAILABLE_TEXT;
  }

  if (safeBackendMessage && safeBackendMessage.toLowerCase() !== "server error") {
    return safeBackendMessage;
  }

  return setupRequired ? "Could not create admin." : STOCK_DASHBOARD_LOGIN_GENERIC_ERROR_TEXT;
}

async function stockDashboardSendAuthRequest(url, options = {}) {
  const forceRelogin = Boolean(options?.forceRelogin);
  if (stockDashboardAuthState === "checking") {
    return;
  }

  if (stockDashboardSession && !forceRelogin) {
    stockDashboardSetAuthState("error", "Already signed in. Use Log out to switch accounts.");
    return;
  }

  const { userNumber, pin } = stockDashboardGetCredentials();
  if (!stockDashboardIsValidElabUserNumber(userNumber)) {
    stockDashboardSetAuthState("error", "Enter a valid 2- or 3-digit eLab user number.");
    return;
  }
  if (!stockDashboardIsValidPin(pin)) {
    stockDashboardSetAuthState("error", "Enter a valid 4-digit PIN.");
    return;
  }

  const typedUserNumber = String(userNumber || "").trim();
  const normalizedUserNumber = stockDashboardNormalizeElabUserNumber(typedUserNumber);
  const apiBaseUrl = stockDashboardGetApiBaseUrl();
  stockDashboardLogAuthDebug("login-attempt", {
    typedUserNumber,
    normalizedUserNumber,
    apiBaseUrl,
    endpoint: url
  });
  if (!normalizedUserNumber) {
    stockDashboardSetAuthState("error", "Enter a valid 2- or 3-digit eLab user number.");
    return;
  }

  const authGenerationAtStart = stockDashboardBumpAuthGeneration();
  stockDashboardSetAuthState("checking");
  const attemptId = ++stockDashboardLoginAttemptId;
  const controller = new AbortController();
  stockDashboardLoginAbortController = controller;
  stockDashboardLoginTimeoutTimer = window.setTimeout(() => {
    if (stockDashboardLoginAttemptId !== attemptId || stockDashboardAuthState !== "checking") return;
    stockDashboardCancelLoginAttempt({ message: STOCK_DASHBOARD_LOGIN_GENERIC_ERROR_TEXT, goIdle: false });
  }, STOCK_DASHBOARD_LOGIN_TIMEOUT_MS);

  try {
    const response = await stockDashboardFetch(url, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({
        userNumber: typedUserNumber,
        normalizedElabUserNumber: normalizedUserNumber,
        displayElabUserNumber: typedUserNumber,
        pin
      }),
      signal: controller.signal
    });
    if (stockDashboardLoginAttemptId !== attemptId) return;
    if (authGenerationAtStart !== stockDashboardAuthGeneration) return;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.user) {
      const errorMessage = stockDashboardGetAuthErrorMessage(response, payload, {
        setupRequired: stockDashboardSetupRequired
      });
      const setupAlreadyConfigured = url === STOCK_DASHBOARD_BOOTSTRAP_URL
        && response.status === 403
        && /already been configured/i.test(String(payload?.error || errorMessage));
      if (setupAlreadyConfigured) {
        stockDashboardSetupRequired = false;
        stockDashboardSetAuthState("idle", "Admin already exists. Checking your login details...");
        await stockDashboardSendAuthRequest(STOCK_DASHBOARD_LOGIN_URL, options);
        return;
      }
      throw new Error(errorMessage);
    }

    stockDashboardSetupRequired = false;
    stockDashboardSetSignedOutOverride(false);
    stockDashboardSetSession(payload.user);
    stockDashboardLogAuthDebug("login-success", {
      sessionUser: payload.user ? {
        userNumber: payload.user.userNumber,
        role: payload.user.role,
        isOwner: payload.user.isOwner
      } : null
    });
    stockDashboardSetAuthState("success", "Signed in.");
    if (stockDashboardPinInput) stockDashboardPinInput.value = "";
    await loadStockDashboard();
    await loadStockDashboardUsers();
  } catch (error) {
    if (stockDashboardLoginAttemptId !== attemptId) return;
    if (error instanceof DOMException && error.name === "AbortError") {
      if (stockDashboardAuthState === "checking") {
        stockDashboardSetAuthState("error", STOCK_DASHBOARD_LOGIN_GENERIC_ERROR_TEXT);
      }
      return;
    }
    const fallbackMessage = stockDashboardSetupRequired ? "Could not create admin." : STOCK_DASHBOARD_LOGIN_GENERIC_ERROR_TEXT;
    const message = error instanceof Error && error.message ? error.message : fallbackMessage;
    stockDashboardSetAuthState("error", message);
    if (!(error instanceof Error && error.message === STOCK_DASHBOARD_INVALID_LOGIN_TEXT)) {
      console.error("Stock Dashboard login error", error);
    }
  } finally {
    if (stockDashboardLoginAttemptId === attemptId) {
      if (stockDashboardLoginTimeoutTimer) {
        window.clearTimeout(stockDashboardLoginTimeoutTimer);
      }
      stockDashboardLoginTimeoutTimer = 0;
      stockDashboardLoginAbortController = null;
      if (stockDashboardAuthState === "checking") {
        stockDashboardSetAuthState("idle", "Sign in to view dashboard data and update request status.");
      }
    }
  }
}

async function loadStockDashboardUsers() {
  if (!stockDashboardIsAdminSession() || !stockDashboardUserList) return;
  const authGenerationAtStart = stockDashboardAuthGeneration;

  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = "Loading users...";
  }

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_USERS_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      if (stockDashboardUserAdminStatus) stockDashboardUserAdminStatus.textContent = "Admin access required.";
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load users");
    }

    const payload = await response.json();
    if (authGenerationAtStart !== stockDashboardAuthGeneration || !stockDashboardIsAdminSession()) {
      return;
    }
    const users = Array.isArray(payload?.users) ? payload.users : [];
    stockDashboardManagedUsers = users;
    stockDashboardUserList.innerHTML = users.length
      ? users.map((user) => {
        const safeUserId = String(user?.id || "").trim();
        const safeUserNumber = String(user?.userNumber || "").trim();
        const isSelf = stockDashboardSession?.userNumber === safeUserNumber;
        const statusLabel = stockDashboardNormalizeUserStatus(user?.status);
        const isDisabled = statusLabel === "Disabled";
        return `
          <article class="stock-dashboard-request-card">
            <div class="stock-dashboard-request-top">
              <div>
                <p class="stock-order-kicker">${stockDashboardEscapeHtml(stockDashboardGetDebugElabNumber(user) || safeUserNumber || "User")}</p>
                <h4>${stockDashboardEscapeHtml(stockDashboardGetDisplayName(user) || "Medical Technologist")}${isSelf ? " · You" : ""}</h4>
              </div>
              <span class="stock-order-status-badge" data-status="${isDisabled ? "cancelled" : "ready"}">${stockDashboardEscapeHtml(statusLabel)}</span>
            </div>
            <div class="stock-dashboard-request-meta">
              <span>Normalized: ${stockDashboardEscapeHtml(safeUserNumber || "Unknown")}</span>
              <span>Created: ${stockDashboardEscapeHtml(stockDashboardFormatOptionalDate(user?.createdAt))}</span>
              <span>Last login: ${stockDashboardEscapeHtml(stockDashboardFormatOptionalDate(user?.lastLoginAt))}</span>
            </div>
            <div class="stock-dashboard-inline-actions">
              <button type="button" class="quick-tool-clear-btn" data-user-action="${isDisabled ? "enable" : "disable"}" data-user-id="${stockDashboardEscapeHtml(safeUserId)}" data-user-number="${stockDashboardEscapeHtml(safeUserNumber)}">${isDisabled ? "Re-enable" : "Disable"}</button>
              <button type="button" class="quick-tool-clear-btn" data-user-action="toggle-role" data-user-id="${stockDashboardEscapeHtml(safeUserId)}" data-user-number="${stockDashboardEscapeHtml(safeUserNumber)}">${stockDashboardNormalizeUserRole(user?.role, Boolean(user?.isOwner)) === "admin" ? "Set as Medical Technologist" : "Set as Administrator"}</button>
              <button type="button" class="quick-tool-clear-btn" data-user-action="reset-pin" data-user-id="${stockDashboardEscapeHtml(safeUserId)}" data-user-number="${stockDashboardEscapeHtml(safeUserNumber)}">Reset PIN</button>
              <button type="button" class="quick-tool-clear-btn" data-user-action="delete" data-user-id="${stockDashboardEscapeHtml(safeUserId)}" data-user-number="${stockDashboardEscapeHtml(safeUserNumber)}">Delete</button>
            </div>
          </article>
        `;
      }).join("")
      : '<p class="stock-dashboard-empty">No users yet.</p>';

    if (stockDashboardUserAdminStatus) {
      const durabilityWarning = String(stockDashboardApiConfig?.storage?.durabilityWarning || "").trim();
      stockDashboardUserAdminStatus.textContent = `${users.length} user${users.length === 1 ? "" : "s"} saved.${durabilityWarning ? ` ${durabilityWarning}` : ""}`;
    }
  } catch {
    stockDashboardManagedUsers = [];
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Could not load users.";
    }
  }
}

async function stockDashboardUpdateUserRecord(userId, updates, successMessage) {
  const response = await stockDashboardFetch(stockDashboardBuildUserApiUrlById(userId), {
    method: "PATCH",
    headers: stockDashboardGetHeaders(true),
    body: JSON.stringify(updates)
  });
  if (response.status === 401) {
    stockDashboardSetSession(null);
    return false;
  }
  if (response.status === 403) {
    throw new Error("Admin access required.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Could not update user");
  }
  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = successMessage;
  }
  return true;
}

async function stockDashboardDeleteUserRecord(userId) {
  const response = await stockDashboardFetch(stockDashboardBuildUserApiUrlById(userId), {
    method: "DELETE",
    headers: stockDashboardGetHeaders()
  });
  if (response.status === 401) {
    stockDashboardSetSession(null);
    return false;
  }
  if (response.status === 403) {
    throw new Error("Admin access required.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Could not delete user");
  }
  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = "User deleted.";
  }
  return true;
}

async function stockDashboardHandleUserAction(action, userId, userNumber) {
  if (!stockDashboardIsAdminSession()) return;
  const safeAction = String(action || "").trim();
  const safeUserId = String(userId || "").trim();
  const safeUserNumber = String(userNumber || "").trim();
  if (!safeAction || !safeUserId) return;

  stockDashboardSetBusy(true);
  try {
    if (safeAction === "disable") {
      const confirmed = window.confirm(`Disable user ${safeUserNumber}?`);
      if (!confirmed) return;
      const changed = await stockDashboardUpdateUserRecord(safeUserId, { status: "disabled" }, "User disabled.");
      if (!changed) return;
    } else if (safeAction === "enable") {
      const changed = await stockDashboardUpdateUserRecord(safeUserId, { status: "active" }, "User re-enabled.");
      if (!changed) return;
    } else if (safeAction === "toggle-role") {
      const currentUser = stockDashboardManagedUsers.find((user) => String(user?.id || "").trim() === safeUserId);
      const currentRole = stockDashboardNormalizeUserRole(currentUser?.role || "labUser");
      const willSetAdmin = currentRole !== "admin";
      const changed = await stockDashboardUpdateUserRecord(
        safeUserId,
        { role: willSetAdmin ? "admin" : "labUser" },
        willSetAdmin ? "Role updated to Administrator." : "Role updated to Medical Technologist."
      );
      if (!changed) return;
    } else if (safeAction === "reset-pin") {
      const pin = window.prompt(`Enter new 4-digit PIN for ${safeUserNumber}:`, "");
      if (pin === null) return;
      if (!stockDashboardIsValidPin(pin)) {
        throw new Error("Use a 4-digit PIN.");
      }
      const changed = await stockDashboardUpdateUserRecord(safeUserId, { pin: String(pin).trim() }, "PIN reset.");
      if (!changed) return;
    } else if (safeAction === "delete") {
      const confirmed = window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.");
      if (!confirmed) return;
      const deleted = await stockDashboardDeleteUserRecord(safeUserId);
      if (!deleted) return;
    } else {
      return;
    }

    await loadStockDashboardUsers();
  } catch (error) {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = error instanceof Error ? error.message : "Could not update user.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

async function createStockDashboardUser() {
  if (!stockDashboardIsAdminSession()) {
    stockDashboardSetCreateUserMessage("Only Admin users can create users.");
    return;
  }

  if (!stockDashboardApiConfig) {
    await stockDashboardLoadApiConfig();
  }
  if (!stockDashboardApiConfig) {
    stockDashboardSetCreateUserMessage("Could not verify server environment. Attempting save with current API connection.");
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Could not verify server environment. Trying to save anyway.";
    }
  }

  const displayName = String(stockDashboardCreateUserNameInput?.value || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const userNumber = String(stockDashboardCreateUserNumberInput?.value || "").trim();
  const pin = String(stockDashboardCreateUserPinInput?.value || "").trim();
  const role = stockDashboardNormalizeUserRole(stockDashboardCreateUserRoleInput?.value || "labUser");
  if (!displayName) {
    stockDashboardSetCreateUserMessage("Enter a user name.");
    return;
  }
  if (!stockDashboardIsValidElabUserNumber(userNumber)) {
    stockDashboardSetCreateUserMessage("Enter a valid 2- or 3-digit eLab user number.");
    return;
  }
  if (!stockDashboardIsValidPin(pin)) {
    stockDashboardSetCreateUserMessage("Enter a valid 4-digit PIN.");
    return;
  }

  stockDashboardSetBusy(true);
  stockDashboardSetCreateUserMessage("Creating user...");

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_USERS_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ displayName, userNumber, pin, role })
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      stockDashboardSetCreateUserMessage("Admin access required.");
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status >= 500) {
        console.error("Stock Dashboard create user failed on server", {
          status: response.status,
          error: payload?.error || ""
        });
        throw new Error(STOCK_DASHBOARD_SAVE_USER_ERROR_TEXT);
      }
      throw new Error(payload?.error || STOCK_DASHBOARD_SAVE_USER_ERROR_TEXT);
    }

    if (stockDashboardCreateUserForm) stockDashboardCreateUserForm.reset();
    stockDashboardSetCreateUserMessage("User created and saved.");
    if (stockDashboardUserAdminStatus) stockDashboardUserAdminStatus.textContent = "User created and saved.";
    stockDashboardSetCreateUserModalOpen(false);
    await loadStockDashboardUsers();
    if (stockDashboardUserAdminStatus) stockDashboardUserAdminStatus.textContent = "User created and saved.";
  } catch (error) {
    const errorText = error instanceof Error ? error.message : "";
    const message = errorText || STOCK_DASHBOARD_SAVE_USER_ERROR_TEXT;
    stockDashboardSetCreateUserMessage(message);
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = message;
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

function stockDashboardPopulateWardOptions() {
  if (!stockDashboardManualWardSelect || !Array.isArray(stockRequesterGroups)) return;
  if (stockDashboardManualWardSelect.dataset.ready === "true") return;

  stockRequesterGroups.forEach((group) => {
    const optionGroup = document.createElement("optgroup");
    optionGroup.label = group.label;

    group.options.forEach((optionLabel) => {
      const option = document.createElement("option");
      option.value = optionLabel;
      option.textContent = optionLabel;
      optionGroup.appendChild(option);
    });

    stockDashboardManualWardSelect.appendChild(optionGroup);
  });

  stockDashboardManualWardSelect.dataset.ready = "true";
}

function stockDashboardResetManualForm() {
  stockDashboardSetEditorState(stockDashboardManualState);
  if (stockDashboardManualEntryForm) stockDashboardManualEntryForm.reset();
  stockDashboardRenderEditorGrid(stockDashboardManualGrid, stockDashboardManualState, "manual");
  if (stockDashboardManualEntryStatus) {
    stockDashboardManualEntryStatus.textContent = "Use this when stock is collected in person and was not ordered in the app.";
  }
}

function stockDashboardResetReceiptForm() {
  stockDashboardReceiptRows.length = 0;
  stockDashboardBatchLookupCache.clear();
  if (stockDashboardReceiptForm) stockDashboardReceiptForm.reset();
  stockDashboardEnsureReceiptRows();
  stockDashboardRenderReceiptItemRows();
  stockDashboardSetReceiptFormOpen(false);
  if (stockDashboardReceiptStatus) {
    stockDashboardReceiptStatus.textContent = "Record tubes and consumables received from suppliers.";
  }
}

async function stockDashboardSubmitManualRequest() {
  if (!stockDashboardSession) return;

  const requestedBy = String(stockDashboardManualRequesterInput?.value || "").trim();
  const wardUnit = String(stockDashboardManualWardSelect?.value || "").trim();
  const notes = String(stockDashboardManualNoteInput?.value || "").trim();
  const items = stockDashboardGetSelectedItems(stockDashboardManualState);

  if (!requestedBy || !wardUnit || !items.length) {
    if (stockDashboardManualEntryStatus) {
      stockDashboardManualEntryStatus.textContent = "Add the requester, ward / unit, and at least one item.";
    }
    return;
  }

  stockDashboardSetBusy(true);
  if (stockDashboardManualEntryStatus) {
    stockDashboardManualEntryStatus.textContent = "Saving walk-in request...";
  }

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_MANUAL_REQUEST_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({
        requestedBy,
        wardUnit,
        notes,
        items: items.map((item) => ({
          id: item.id,
          label: item.label,
          variantLabel: item.variantLabel || "",
          quantity: item.quantity,
          unitType: item.unitType,
          traySize: item.traySize || null,
          packetSize: item.packetSize || null,
          formattedQuantity: stockDashboardGetItemQuantityLabel(item),
          inventoryUnits: typeof getStockInventoryUnits === "function" ? getStockInventoryUnits(item) : Number(item.quantity || 0),
          sheetColumnKey: item.sheetColumnKey || "",
          sheetTrayColumnKey: item.sheetTrayColumnKey || "",
          sheetSingleColumnKey: item.sheetSingleColumnKey || "",
          batchNumber: item.batchNumber || "",
          expiryDate: item.expiryDate || ""
        }))
      })
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      stockDashboardSetSession(null);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not save walk-in request");
    }

    stockDashboardResetManualForm();
    await loadStockDashboard();
    if (stockDashboardManualEntryStatus) {
      stockDashboardManualEntryStatus.textContent = payload?.request?.id
        ? `Walk-in request ${payload.request.id} saved.`
        : "Walk-in request saved.";
    }
  } catch (error) {
    if (stockDashboardManualEntryStatus) {
      stockDashboardManualEntryStatus.textContent = error instanceof Error ? error.message : "Could not save walk-in request.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

async function stockDashboardSubmitReceipt() {
  if (!stockDashboardSession) return;

  const supplierName = String(stockDashboardReceiptSupplierInput?.value || "").trim();
  const reference = String(stockDashboardReceiptReferenceInput?.value || "").trim();
  const notes = String(stockDashboardReceiptNoteInput?.value || "").trim();
  const receiptPayload = stockDashboardBuildReceiptPayload({ validate: true });
  const items = receiptPayload.items;

  if (receiptPayload.errors.length) {
    if (stockDashboardReceiptStatus) {
      stockDashboardReceiptStatus.textContent = receiptPayload.errors[0];
    }
    return;
  }

  stockDashboardSetBusy(true);
  if (stockDashboardReceiptStatus) {
    stockDashboardReceiptStatus.textContent = "Saving received stock...";
  }

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_RECEIPTS_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({
        supplierName,
        reference,
        notes,
        items: items.map((item) => ({
          id: item.id,
          label: item.label,
          variantLabel: item.variantLabel || "",
          quantity: item.quantity,
          unitType: item.unitType,
          traySize: item.traySize || null,
          packetSize: item.packetSize || null,
          formattedQuantity: stockDashboardGetItemQuantityLabel(item),
          inventoryUnits: typeof getStockInventoryUnits === "function" ? getStockInventoryUnits(item) : Number(item.quantity || 0),
          sheetColumnKey: item.sheetColumnKey || "",
          sheetTrayColumnKey: item.sheetTrayColumnKey || "",
          sheetSingleColumnKey: item.sheetSingleColumnKey || ""
        }))
      })
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      stockDashboardSetSession(null);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not save received stock");
    }

    stockDashboardResetReceiptForm();
    await loadStockInventory();
    if (stockDashboardReceiptStatus) {
      stockDashboardReceiptStatus.textContent = "Received stock recorded.";
    }
  } catch (error) {
    if (stockDashboardReceiptStatus) {
      stockDashboardReceiptStatus.textContent = error instanceof Error ? error.message : "Could not save received stock.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

async function loadStockInventory() {
  if (!stockDashboardSession) return;

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_INVENTORY_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      stockDashboardSetSession(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load inventory");
    }

    const payload = await response.json().catch(() => ({}));
    stockDashboardRenderInventory(Array.isArray(payload?.summary) ? payload.summary : []);
    stockDashboardPrepareDatasets(stockDashboardDatasets.stockRequests, Array.isArray(payload?.recentReceipts) ? payload.recentReceipts : []);
    stockDashboardRefreshDataSectionStatus();
  } catch {
    if (stockDashboardInventoryStatus) {
      stockDashboardInventoryStatus.textContent = "Could not load inventory.";
    }
    if (stockDashboardInventoryList) {
      stockDashboardInventoryList.innerHTML = '<p class="stock-dashboard-empty">Inventory is not available yet.</p>';
    }
    stockDashboardPrepareDatasets(stockDashboardDatasets.stockRequests, []);
    stockDashboardRefreshDataSectionStatus();
  }
}

function initStockDashboardTools() {
  if (!Array.isArray(stockConsumableItems)) return;

  stockDashboardSetEditorState(stockDashboardManualState);
  stockDashboardPopulateWardOptions();
  stockDashboardRenderEditorGrid(stockDashboardManualGrid, stockDashboardManualState, "manual");
  stockDashboardEnsureReceiptRows();
  stockDashboardRenderReceiptItemRows();
  stockDashboardAttachGridEvents(stockDashboardManualGrid, stockDashboardManualState);
}

function renderDashboardList(container, rows, renderRow) {
  if (!container) return;

  if (!rows.length) {
    container.innerHTML = '<p class="stock-dashboard-empty">No data yet.</p>';
    return;
  }

  container.innerHTML = rows.map(renderRow).join("");
}

function renderStockDashboardStats(stats) {
  const safeStats = stats || {};
  const totalRequests = Number(safeStats.totalRequests || 0);
  const openRequests = Number(safeStats.openRequests || 0);
  const totalLineItems = Number(safeStats.totalLineItems || 0);
  const totalUnitsRequested = Number(safeStats.totalUnitsRequested || 0);
  const hasBreakdown = STOCK_DASHBOARD_STATUS_ORDER.some((status) => Number(safeStats.statusCounts?.[status] || 0) > 0);
  const hasTopWards = Array.isArray(safeStats.topWards) && safeStats.topWards.length > 0;
  const hasTopItems = Array.isArray(safeStats.topItems) && safeStats.topItems.length > 0;
  const hasAnyStats = totalRequests > 0 || openRequests > 0 || totalLineItems > 0 || totalUnitsRequested > 0 || hasBreakdown || hasTopWards || hasTopItems;

  if (stockDashboardTotalRequests) stockDashboardTotalRequests.textContent = String(totalRequests);
  if (stockDashboardOpenRequests) stockDashboardOpenRequests.textContent = String(openRequests);
  if (stockDashboardLineItems) stockDashboardLineItems.textContent = String(totalLineItems);
  if (stockDashboardUnitsRequested) stockDashboardUnitsRequested.textContent = String(totalUnitsRequested);

  renderDashboardList(stockDashboardStatusCounts, STOCK_DASHBOARD_STATUS_ORDER.filter((status) => Number(safeStats.statusCounts?.[status] || 0)), (status) => `
    <span class="stock-dashboard-chip" data-status="${stockDashboardEscapeHtml(status)}">
      ${stockDashboardEscapeHtml(stockDashboardFormatStatus(status))}: ${Number(safeStats.statusCounts?.[status] || 0)}
    </span>
  `);

  renderDashboardList(stockDashboardTopWards, safeStats.topWards || [], (ward) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(ward.name)}</span>
      <strong>${Number(ward.count || 0)}</strong>
    </div>
  `);

  renderDashboardList(stockDashboardTopItems, safeStats.topItems || [], (item) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(item.label)}</span>
      <strong>${Number(item.quantity || 0)}</strong>
    </div>
  `);

  if (stockDashboardStatsEmpty) {
    stockDashboardStatsEmpty.hidden = hasAnyStats;
  }
  if (stockDashboardInsights) {
    stockDashboardInsights.hidden = !stockDashboardIsSummaryOpen || !hasAnyStats;
  }
  if (stockDashboardMetrics) {
    stockDashboardMetrics.hidden = !stockDashboardIsSummaryOpen || !hasAnyStats;
  }
}

function renderStockDashboardRequests(requests) {
  if (!stockDashboardRequestList) return;

  const activeRequests = Array.isArray(requests)
    ? requests.filter((request) => stockDashboardNormalizeStatus(request?.status) !== "collected")
    : [];

  if (!activeRequests.length) {
    stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">No active consumables requests in the queue.</p>';
    return;
  }

  const queueRows = activeRequests.map((request) => {
    const safeStatus = stockDashboardNormalizeStatus(request?.status);
    const statusMeta = stockDashboardGetQueueStatusMeta(safeStatus);
    const items = Array.isArray(request.items) ? request.items : [];
    const itemSummary = items.map((item) => {
      const label = item.variantLabel ? `${item.label} - ${item.variantLabel}` : item.label;
      return `${label}: ${item.formattedQuantity || item.quantity}`;
    }).join(" | ");
    const statusButtons = STOCK_DASHBOARD_STATUS_ORDER.map((status) => `
      <button
        type="button"
        class="stock-dashboard-status-btn${safeStatus === status ? " active" : ""}"
        data-request-id="${stockDashboardEscapeHtml(request.id)}"
        data-request-status="${stockDashboardEscapeHtml(status)}"
      >
        ${stockDashboardEscapeHtml(stockDashboardFormatStatus(status))}
      </button>
    `).join("");

    return `
      <div class="stock-dashboard-queue-row" role="row" data-dashboard-request="${stockDashboardEscapeHtml(request.id)}">
        <div class="stock-dashboard-queue-cell" data-label="Requested by">${stockDashboardEscapeHtml(request.requestedBy || "Unknown requester")}</div>
        <div class="stock-dashboard-queue-cell" data-label="Ward / Unit">${stockDashboardEscapeHtml(request.wardUnit || "No ward set")}</div>
        <div class="stock-dashboard-queue-cell" data-label="Date / Time">${stockDashboardEscapeHtml(stockDashboardFormatDateTime(request.createdAt))}</div>
        <div class="stock-dashboard-queue-cell stock-dashboard-queue-items" data-label="Items requested">${stockDashboardEscapeHtml(itemSummary || "No items listed")}</div>
        <div class="stock-dashboard-queue-cell" data-label="Status">
          <span class="stock-dashboard-queue-status-badge" data-stage="${stockDashboardEscapeHtml(statusMeta.stage)}">${stockDashboardEscapeHtml(statusMeta.label)}</span>
        </div>
        <div class="stock-dashboard-queue-actions">
          ${statusButtons}
        </div>
      </div>
    `;
  }).join("");

  stockDashboardRequestList.innerHTML = `
    <div class="stock-dashboard-queue" role="table" aria-label="Recent consumables requests queue">
      <div class="stock-dashboard-queue-head" role="row">
        <span>Requested by</span>
        <span>Ward / Unit</span>
        <span>Date / Time</span>
        <span>Items requested</span>
        <span>Status</span>
      </div>
      ${queueRows}
    </div>
  `;
}

async function loadStockDashboard(options = {}) {
  if (!stockDashboardSession) {
    return;
  }
  const authGenerationAtStart = stockDashboardAuthGeneration;
  const requestedForUserNumber = String(stockDashboardSession.userNumber || "");
  const { silent = false, fromPoll = false } = options;

  if (!silent) {
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Loading requests...";
    }
    stockDashboardSetBusy(true);
  }

  try {
    const [statsResponse, requestsResponse, inventoryResponse] = await Promise.all([
      stockDashboardFetch(STOCK_DASHBOARD_STATS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() }),
      stockDashboardFetch(STOCK_DASHBOARD_REQUESTS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() }),
      stockDashboardFetch(STOCK_DASHBOARD_INVENTORY_URL, { cache: "no-store", headers: stockDashboardGetHeaders() })
    ]);

    if (
      statsResponse.status === 401 || statsResponse.status === 403
      || requestsResponse.status === 401 || requestsResponse.status === 403
      || inventoryResponse.status === 401 || inventoryResponse.status === 403
    ) {
      stockDashboardSetSession(null);
      return;
    }

    if (!statsResponse.ok || !requestsResponse.ok || !inventoryResponse.ok) {
      throw new Error("Could not load dashboard data");
    }

    const statsPayload = await statsResponse.json();
    const requestsPayload = await requestsResponse.json();
    const inventoryPayload = await inventoryResponse.json();
    const requests = requestsPayload.requests || [];
    const recentReceipts = Array.isArray(inventoryPayload?.recentReceipts) ? inventoryPayload.recentReceipts : [];
    const authGenerationChanged = authGenerationAtStart !== stockDashboardAuthGeneration;
    const sessionChanged = !stockDashboardSession
      || String(stockDashboardSession.userNumber || "") !== requestedForUserNumber;
    if (authGenerationChanged || sessionChanged || stockDashboardLogoutInProgress) {
      stockDashboardLogAuthDebug("skip-stale-dashboard-render", {
        authGenerationAtStart,
        authGenerationCurrent: stockDashboardAuthGeneration,
        requestedForUserNumber,
        currentUserNumber: String(stockDashboardSession?.userNumber || ""),
        logoutInProgress: stockDashboardLogoutInProgress
      });
      return;
    }

    renderStockDashboardStats(statsPayload.stats || {});
    renderStockDashboardRequests(requests);
    stockDashboardPrepareDatasets(requests, recentReceipts);
    stockDashboardRefreshDataSectionStatus();
    stockDashboardRenderInventory(Array.isArray(inventoryPayload?.summary) ? inventoryPayload.summary : []);
    stockDashboardProcessNotifications(requests, { fromPoll });
    if (!silent) {
      stockDashboardStatus.textContent = `Updated ${stockDashboardFormatDateTime(new Date().toISOString())}`;
    }
  } catch {
    stockDashboardStatus.textContent = "Dashboard data could not load. Please check your connection or refresh the page.";
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Dashboard data could not load. Please check your connection or refresh the page.</p>';
    }
  } finally {
    if (!silent) {
      stockDashboardSetBusy(false);
    }
  }
}

async function updateStockDashboardRequestStatus(requestId, status) {
  if (!requestId || !status || !stockDashboardSession) return;

  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "collected") {
    const confirmed = window.confirm("Mark this order as collected? Stock on hand will be deducted once.");
    if (!confirmed) return;
  }

  stockDashboardStatus.textContent = `Updating ${requestId}...`;

  try {
    const response = await stockDashboardFetch(stockDashboardBuildApiUrl(`/api/stock-requests/${encodeURIComponent(requestId)}/status`), {
      method: "PATCH",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ status })
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      stockDashboardSetSession(null);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 409 && Array.isArray(payload?.shortages) && payload.shortages.length) {
        const shortageLines = payload.shortages
          .map((row) => {
            const label = String(row?.label || "Stock item");
            const shortBy = Number(row?.shortBy || 0);
            const onHand = Number(row?.onHand || 0);
            return `${label}: short by ${shortBy} (on hand: ${onHand})`;
          })
          .join("; ");
        throw new Error(`${payload?.error || "Not enough stock on hand to mark this order as collected."} ${shortageLines}`);
      }
      throw new Error(payload?.error || "Could not update request status");
    }

    await loadStockDashboard();
    if (payload?.sheetSync && payload.sheetSync.ok === false) {
      stockDashboardStatus.textContent = `Updated ${requestId}, but Google Sheets still needs attention.`;
    }
  } catch {
    stockDashboardStatus.textContent = `Could not update ${requestId}.`;
  }
}

async function checkStockDashboardSession() {
  if (stockDashboardHasSignedOutOverride()) {
    stockDashboardSetSession(null);
    return;
  }
  if (!stockDashboardHasActiveAuthMarker()) {
    stockDashboardSetSession(null);
    return;
  }
  const authGenerationAtStart = stockDashboardAuthGeneration;
  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_SESSION_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    const payload = await response.json().catch(() => ({}));

    stockDashboardSetupRequired = Boolean(payload?.setupRequired);
    stockDashboardLogAuthDebug("session-check-response", {
      ok: response.ok,
      authenticated: Boolean(payload?.authenticated),
      setupRequired: stockDashboardSetupRequired,
      resolvedUser: payload?.user ? {
        userNumber: payload.user.userNumber,
        role: payload.user.role,
        isOwner: payload.user.isOwner
      } : null
    });

    if (authGenerationAtStart !== stockDashboardAuthGeneration) {
      stockDashboardLogAuthDebug("session-check-ignored-stale-generation", {
        authGenerationAtStart,
        authGenerationCurrent: stockDashboardAuthGeneration
      });
      return;
    }

    if (!response.ok || !payload?.authenticated || !payload?.user) {
      stockDashboardSetSession(null);
      return;
    }
    if (stockDashboardLogoutInProgress) {
      stockDashboardLogAuthDebug("session-check-ignored-during-logout", {
        resolvedUser: payload?.user?.userNumber || ""
      });
      stockDashboardSetSession(null);
      return;
    }

    stockDashboardSetupRequired = false;
    stockDashboardSetSession(payload.user);
    await loadStockDashboard();
    await loadStockDashboardUsers();
  } catch {
    stockDashboardSetSession(null);
  }
}

async function logoutStockDashboard() {
  stockDashboardLogAuthDebug("logout-clicked", {
    hasSession: Boolean(stockDashboardSession),
    userNumber: String(stockDashboardSession?.userNumber || ""),
    role: String(stockDashboardSession?.role || "")
  });
  if (stockDashboardAuthState === "checking") {
    stockDashboardCancelLoginAttempt({ message: "Login cancelled.", goIdle: true });
  }
  const previousSession = stockDashboardSession ? { ...stockDashboardSession } : null;
  const logoutGeneration = stockDashboardBumpAuthGeneration();
  stockDashboardLogoutInProgress = true;
  stockDashboardSetBusy(true);

  stockDashboardLatestRequestMarker = "";
  stockDashboardUnreadCount = 0;
  stockDashboardClearAuthStateStorage();
  stockDashboardSetSignedOutOverride(true);
  stockDashboardClearScopedValuesForUserNumber(previousSession?.userNumber || "");
  stockDashboardSetAuthFlashMessage("Not signed in");
  stockDashboardSetSession(null);

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_LOGOUT_URL, {
      method: "POST"
    });
    if (!response.ok) {
      stockDashboardLogAuthDebug("logout-response-not-ok", { status: response.status });
    } else {
      stockDashboardLogAuthDebug("logout-response-ok", { status: response.status });
    }

    const verifyResponse = await stockDashboardFetch(STOCK_DASHBOARD_SESSION_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    const verifyPayload = await verifyResponse.json().catch(() => ({}));
    const authenticated = Boolean(verifyResponse.ok && verifyPayload?.authenticated && verifyPayload?.user);
    stockDashboardLogAuthDebug("logout-verify-session", {
      ok: verifyResponse.ok,
      authenticated
    });
    if (authenticated) {
      stockDashboardSetSession(null);
      if (stockDashboardAuthStatus) {
        stockDashboardAuthStatus.textContent = "Sign-out could not be confirmed. Please try again.";
      }
    }
  } catch (error) {
    console.error("[stock-dashboard] Logout request failed, local session still cleared.", error);
  } finally {
    stockDashboardLogoutInProgress = false;
    stockDashboardLogAuthDebug("logout-finished", {
      logoutGeneration,
      authGenerationCurrent: stockDashboardAuthGeneration,
      hasSession: Boolean(stockDashboardSession),
      isLoggedIn: Boolean(stockDashboardSession),
      isAdmin: Boolean(stockDashboardSession?.role === "admin")
    });
    stockDashboardSetBusy(false);
    stockDashboardBroadcastAuthEvent("logout", "Not signed in");
    window.location.assign("/stock-dashboard.html");
  }
}

async function clearStockDashboardData() {
  if (!stockDashboardIsAdminSession() || !clearStockDataBtn) return;

  const confirmed = window.confirm("Clear all saved stock request history? This cannot be undone.");
  if (!confirmed) return;

  stockDashboardSetBusy(true);
  if (stockDashboardStatus) {
    stockDashboardStatus.textContent = "Clearing saved request history...";
  }

  try {
    const response = await stockDashboardFetch(STOCK_DASHBOARD_CLEAR_DATA_URL, {
      method: "DELETE",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401) {
      stockDashboardSetSession(null);
      return;
    }
    if (response.status === 403) {
      if (stockDashboardStatus) stockDashboardStatus.textContent = "Admin access required.";
      return;
    }

    if (!response.ok) {
      throw new Error("Could not clear saved request history");
    }

    await loadStockDashboard();
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Saved request history cleared.";
    }
  } catch {
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Could not clear saved request history.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

stockDashboardLoginBtn?.addEventListener("click", () => {
  stockDashboardSendAuthRequest(stockDashboardSetupRequired ? STOCK_DASHBOARD_BOOTSTRAP_URL : STOCK_DASHBOARD_LOGIN_URL);
});

stockDashboardSessionLoginBtn?.addEventListener("click", () => {
  stockDashboardOpenLoginModal();
});

stockDashboardLogoutBtn?.addEventListener("click", () => {
  stockDashboardLogAuthDebug("logout-button-handler-fired");
  logoutStockDashboard();
});

stockDashboardEnableAlertsBtn?.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    stockDashboardUpdateNotificationPermissionUi();
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem(STOCK_DASHBOARD_BROWSER_ALERTS_KEY, "true");
    }
    stockDashboardUpdateNotificationPermissionUi();
    return;
  }

  if (Notification.permission === "granted") {
    const nextEnabled = !stockDashboardBrowserAlertsEnabled();
    localStorage.setItem(STOCK_DASHBOARD_BROWSER_ALERTS_KEY, nextEnabled ? "true" : "false");
    stockDashboardUpdateNotificationPermissionUi();
  }
});

clearStockDataBtn?.addEventListener("click", () => {
  clearStockDashboardData();
});

stockDashboardRefreshBtn?.addEventListener("click", () => {
  loadStockDashboard();
});

stockDashboardMarkSeenBtn?.addEventListener("click", () => {
  stockDashboardMarkNotificationsSeen();
});

stockDashboardToggleStatsBtn?.addEventListener("click", () => {
  stockDashboardSetSummaryOpen(!stockDashboardIsSummaryOpen);
});

stockDashboardViewRequestsDataBtn?.addEventListener("click", () => {
  if (stockDashboardDataStatus) {
    stockDashboardDataStatus.textContent = `Requests dataset ready: ${stockDashboardDatasets.stockRequests.length} total, ${stockDashboardDatasets.activeWorkQueue.length} active, ${stockDashboardDatasets.archivedCompletedRequests.length} archived/collected.`;
  }
});

stockDashboardViewReceiptsDataBtn?.addEventListener("click", () => {
  if (stockDashboardDataStatus) {
    stockDashboardDataStatus.textContent = `Received stock dataset ready: ${stockDashboardDatasets.receivedStock.length} record${stockDashboardDatasets.receivedStock.length === 1 ? "" : "s"} (includes per-item batch/lot and expiry date fields).`;
  }
});

stockDashboardExportDataBtn?.addEventListener("click", () => {
  if (stockDashboardDataStatus) {
    stockDashboardDataStatus.textContent = "Export to Excel is prepared to include item, quantity, unit, batch/lot, expiry date, supplier, reference, notes, and date received once CSV/XLSX output is wired.";
  }
});

stockDashboardClearOldDataBtn?.addEventListener("click", () => {
  if (!stockDashboardIsAdminSession()) return;
  if (stockDashboardDataStatus) {
    stockDashboardDataStatus.textContent = "Clear old data is reserved for admin cleanup workflow and will be wired in a later step.";
  }
});

stockDashboardReceiptToggleBtn?.addEventListener("click", () => {
  stockDashboardSetReceiptFormOpen(!stockDashboardReceiptFormOpen);
});

stockDashboardUserList?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const actionButton = target?.closest("[data-user-action][data-user-id]");
  if (!(actionButton instanceof HTMLButtonElement)) return;
  const action = actionButton.getAttribute("data-user-action") || "";
  const userId = actionButton.getAttribute("data-user-id") || "";
  const userNumber = actionButton.getAttribute("data-user-number") || "";
  stockDashboardHandleUserAction(action, userId, userNumber);
});

stockDashboardRequestList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-request-id][data-request-status]");
  if (!(button instanceof HTMLButtonElement)) return;

  const requestId = button.getAttribute("data-request-id") || "";
  const status = button.getAttribute("data-request-status") || "";
  updateStockDashboardRequestStatus(requestId, status);
});

stockDashboardAccessCloseBtn?.addEventListener("click", () => {
  if (stockDashboardAuthState === "checking") {
    stockDashboardCancelLoginAttempt({ message: "Login cancelled.", goIdle: true });
    return;
  }
  stockDashboardSetAccessModalOpen(false);
});

stockDashboardAccessCard?.addEventListener("click", (event) => {
  if (event.target !== stockDashboardAccessCard) return;
  if (stockDashboardAuthState === "checking") {
    stockDashboardCancelLoginAttempt({ message: "Login cancelled.", goIdle: true });
    return;
  }
  stockDashboardSetAccessModalOpen(false);
});

stockDashboardAuthForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  stockDashboardSendAuthRequest(stockDashboardSetupRequired ? STOCK_DASHBOARD_BOOTSTRAP_URL : STOCK_DASHBOARD_LOGIN_URL);
});

stockDashboardCreateUserForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  createStockDashboardUser().catch((error) => {
    const message = error instanceof Error ? error.message : "Could not create user.";
    stockDashboardSetCreateUserMessage(message);
  });
});

stockDashboardOpenCreateUserBtn?.addEventListener("click", () => {
  if (!stockDashboardIsAdminSession()) return;
  stockDashboardSetCreateUserModalOpen(true);
});

stockDashboardCloseCreateUserModalBtn?.addEventListener("click", () => {
  stockDashboardSetCreateUserModalOpen(false);
});

stockDashboardCreateUserModal?.addEventListener("click", (event) => {
  if (event.target !== stockDashboardCreateUserModal) return;
  stockDashboardSetCreateUserModalOpen(false);
});

stockDashboardManualEntryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  stockDashboardSubmitManualRequest();
});

stockDashboardManualSubmitBtn?.addEventListener("click", () => {
  stockDashboardSubmitManualRequest();
});

stockDashboardManualResetBtn?.addEventListener("click", () => {
  stockDashboardResetManualForm();
});

stockDashboardReceiptForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  stockDashboardSubmitReceipt();
});

stockDashboardReceiptSubmitBtn?.addEventListener("click", () => {
  stockDashboardSubmitReceipt();
});

stockDashboardReceiptResetBtn?.addEventListener("click", () => {
  stockDashboardResetReceiptForm();
});

stockDashboardReceiptAddItemBtn?.addEventListener("click", () => {
  stockDashboardAddReceiptRow();
  stockDashboardRenderReceiptItemRows();
});

stockDashboardReceiptItemsRows?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const removeButton = target?.closest("[data-receipt-remove-row]");
  if (!(removeButton instanceof HTMLButtonElement)) return;

  const rowId = removeButton.getAttribute("data-receipt-remove-row") || "";
  const index = stockDashboardReceiptRows.findIndex((row) => row.id === rowId);
  if (index === -1) return;

  stockDashboardReceiptRows.splice(index, 1);
  stockDashboardEnsureReceiptRows();
  stockDashboardRenderReceiptItemRows();
});

stockDashboardReceiptItemsRows?.addEventListener("change", async (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const rowElement = target?.closest("[data-receipt-row-id]");
  if (!(rowElement instanceof HTMLElement)) return;
  const row = stockDashboardReceiptRows.find((entry) => entry.id === rowElement.dataset.receiptRowId);
  if (!row) return;

  const field = target?.getAttribute("data-receipt-field");
  if (field === "item" && target instanceof HTMLSelectElement) {
    row.itemKey = target.value;
    const catalogItem = stockDashboardGetReceiptCatalogItem(row.itemKey);
    row.unitType = stockDashboardGetReceiptUnitOption(catalogItem, row.unitType)?.value || catalogItem?.defaultUnit || "each";
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
    if (String(row.batchNumber || "").trim()) {
      try {
        await stockDashboardLookupReceiptBatch(row);
      } catch (error) {
        row.batchExpiryMessage = error instanceof Error ? error.message : "Could not validate batch expiry.";
      }
    }
    stockDashboardRenderReceiptItemRows();
    return;
  }

  if (field === "unit" && target instanceof HTMLSelectElement) {
    row.unitType = target.value;
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
    if (String(row.batchNumber || "").trim()) {
      try {
        await stockDashboardLookupReceiptBatch(row);
      } catch (error) {
        row.batchExpiryMessage = error instanceof Error ? error.message : "Could not validate batch expiry.";
      }
    }
    stockDashboardRenderReceiptItemRows();
    return;
  }

  if (field === "expiryDate" && target instanceof HTMLInputElement) {
    if (row.batchExpiryLocked && row.lockedExpiryDate) {
      row.expiryDate = row.lockedExpiryDate;
      stockDashboardRenderReceiptItemRows();
      return;
    }
    row.expiryDate = target.value;
    return;
  }

  if (field === "batchNumber" && target instanceof HTMLInputElement) {
    row.batchNumber = target.value;
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
    if (String(row.batchNumber || "").trim()) {
      try {
        await stockDashboardLookupReceiptBatch(row);
      } catch (error) {
        row.batchExpiryMessage = error instanceof Error ? error.message : "Could not validate batch expiry.";
      }
    }
    stockDashboardRenderReceiptItemRows();
  }
});

stockDashboardReceiptItemsRows?.addEventListener("input", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const rowElement = target?.closest("[data-receipt-row-id]");
  if (!(rowElement instanceof HTMLElement)) return;
  const row = stockDashboardReceiptRows.find((entry) => entry.id === rowElement.dataset.receiptRowId);
  if (!row) return;

  const field = target?.getAttribute("data-receipt-field");
  if (!(target instanceof HTMLInputElement)) return;
  if (field === "quantity") {
    row.quantity = target.value;
  } else if (field === "batchNumber") {
    row.batchNumber = target.value;
    row.batchExpiryLocked = false;
    row.lockedExpiryDate = "";
    row.batchExpiryMessage = "";
  } else {
    return;
  }
  const preview = stockDashboardBuildReceiptPayload({ validate: false });
  stockDashboardRenderReceiptSummaryRows(preview.summaryRows);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!stockDashboardCreateUserModal?.hidden) {
    stockDashboardSetCreateUserModalOpen(false);
    return;
  }
  if (stockDashboardAccessCard?.hidden) return;
  stockDashboardReturnToPreviousPage();
});

initStockDashboardTools();
stockDashboardInitAuthSync();
stockDashboardSanitizeDashboardUrlOnLoad();
localStorage.removeItem(STOCK_DASHBOARD_LEGACY_TOKEN_KEY);
stockDashboardSetSummaryOpen(false);
stockDashboardLoadApiConfig();
checkStockDashboardSession();
