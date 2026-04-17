const stockDashboardRefreshBtn = document.getElementById("stockDashboardRefreshBtn");
const stockDashboardStatus = document.getElementById("stockDashboardStatus");
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
const stockDashboardSessionUser = document.getElementById("stockDashboardSessionUser");
const stockDashboardUserAdminCard = document.getElementById("stockDashboardUserAdminCard");
const stockDashboardUserAdminStatus = document.getElementById("stockDashboardUserAdminStatus");
const stockDashboardOpenCreateUserBtn = document.getElementById("stockDashboardOpenCreateUserBtn");
const stockDashboardUserDebugStatus = document.getElementById("stockDashboardUserDebugStatus");
const stockDashboardUserDebugList = document.getElementById("stockDashboardUserDebugList");
const stockDashboardRefreshDebugUsersBtn = document.getElementById("stockDashboardRefreshDebugUsersBtn");
const stockDashboardCopyDebugUsersBtn = document.getElementById("stockDashboardCopyDebugUsersBtn");
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
const stockDashboardInventoryCard = document.getElementById("stockDashboardInventoryCard");
const stockDashboardInventoryStatus = document.getElementById("stockDashboardInventoryStatus");
const stockDashboardInventoryList = document.getElementById("stockDashboardInventoryList");
const stockDashboardReceiptList = document.getElementById("stockDashboardReceiptList");
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

const STOCK_DASHBOARD_TOKEN_KEY = "fmt-stock-lab-token";
const STOCK_DASHBOARD_STATUS_ORDER = ["received", "packed", "collected", "cancelled"];
const STOCK_DASHBOARD_BROWSER_ALERTS_KEY = "fmt-stock-browser-alerts";
const STOCK_DASHBOARD_LAST_SEEN_PREFIX = "fmt-stock-last-seen";
const STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX = "fmt-stock-last-notified";
const STOCK_DASHBOARD_OWNER_SEEN_KEY = "fmt-stock-owner-seen";
const STOCK_DASHBOARD_POLL_MS = 30000;
const STOCK_DASHBOARD_INACTIVITY_WARNING_MS = 9 * 60 * 1000;
const STOCK_DASHBOARD_INACTIVITY_LOGOUT_MS = 10 * 60 * 1000;
const STOCK_DASHBOARD_LOGIN_TIMEOUT_MS = 12000;
const STOCK_DASHBOARD_INVALID_LOGIN_TEXT = "Login details not recognised.";
const STOCK_DASHBOARD_INACTIVITY_WARNING_TEXT = "You will be logged out in 1 minute due to inactivity.";
const STOCK_DASHBOARD_INACTIVITY_LOGOUT_TEXT = "You were logged out due to inactivity.";

let stockDashboardSession = null;
let stockDashboardToken = localStorage.getItem(STOCK_DASHBOARD_TOKEN_KEY) || "";
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

function stockDashboardGetApiBaseUrl() {
  if (typeof window === "undefined") return "";

  const configuredBaseUrl = String(window.FMT_APP_CONFIG?.stockApiBaseUrl || "").trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/g, "");
  }

  const currentOrigin = window.location.origin || "";
  const currentHostname = window.location.hostname || "";
  const currentPort = window.location.port || "";
  const isDirectBackendOrigin = currentPort === "3000";
  const isLikelyLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(currentHostname)
    || currentHostname.endsWith(".local")
    || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(currentHostname);

  if (isDirectBackendOrigin || !isLikelyLocalHost) {
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
const STOCK_DASHBOARD_STATS_URL = stockDashboardBuildApiUrl("/api/lab/stock-stats");
const STOCK_DASHBOARD_SESSION_URL = stockDashboardBuildApiUrl("/api/stock-auth/session");
const STOCK_DASHBOARD_LOGIN_URL = stockDashboardBuildApiUrl("/api/stock-auth/login");
const STOCK_DASHBOARD_BOOTSTRAP_URL = stockDashboardBuildApiUrl("/api/stock-auth/bootstrap");
const STOCK_DASHBOARD_LOGOUT_URL = stockDashboardBuildApiUrl("/api/stock-auth/logout");
const STOCK_DASHBOARD_CLEAR_DATA_URL = stockDashboardBuildApiUrl("/api/lab/stock-data");
const STOCK_DASHBOARD_USERS_URL = stockDashboardBuildApiUrl("/api/lab/users");
const STOCK_DASHBOARD_USERS_DEBUG_URL = stockDashboardBuildApiUrl("/api/lab/users/debug");
const STOCK_DASHBOARD_MANUAL_REQUEST_URL = stockDashboardBuildApiUrl("/api/lab/stock-requests/manual");
const STOCK_DASHBOARD_RECEIPTS_URL = stockDashboardBuildApiUrl("/api/lab/stock-receipts");
const STOCK_DASHBOARD_INVENTORY_URL = stockDashboardBuildApiUrl("/api/lab/stock-inventory");

const stockDashboardManualState = Object.create(null);
const stockDashboardReceiptRows = [];
let stockDashboardDebugUsers = [];

function stockDashboardEscapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stockDashboardFormatStatus(status) {
  const safeStatus = String(status || "received").trim().toLowerCase();
  if (safeStatus === "received") return "Submitted";
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
    ? "Admin"
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

function stockDashboardGetSignedInLabel(user) {
  const displayName = stockDashboardGetDisplayName(user);
  const roleLabel = stockDashboardGetRoleLabel(user?.role, Boolean(user?.isOwner));
  if (displayName) return `Signed in as ${displayName} (${roleLabel}).`;
  return `Signed in as ${roleLabel}.`;
}

function stockDashboardNormalizeStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "collected";
  if (safeStatus === "completed") return "collected";
  return safeStatus || "received";
}

function stockDashboardGetQueueStatusMeta(status) {
  const safeStatus = stockDashboardNormalizeStatus(status);
  if (safeStatus === "received") return { label: "Submitted", stage: "submitted" };
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
  if (stockDashboardToken) {
    headers.Authorization = `Bearer ${stockDashboardToken}`;
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

function stockDashboardEnsureReceiptRows() {
  if (stockDashboardReceiptRows.length) return;
  if (!stockDashboardReceiptItemCatalog.length) return;

  stockDashboardReceiptRows.push({
    id: `receipt-row-${Date.now()}-0`,
    itemKey: stockDashboardReceiptItemCatalog[0].key,
    unitType: stockDashboardReceiptItemCatalog[0].defaultUnit,
    quantity: ""
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
    quantity: String(initialValues.quantity || "").trim()
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

        <div class="stock-dashboard-receipt-row-actions">
          <button type="button" class="quick-tool-clear-btn" data-receipt-remove-row="${stockDashboardEscapeHtml(row.id)}"${stockDashboardReceiptRows.length <= 1 ? " disabled" : ""}>Remove</button>
          <p class="stock-dashboard-status">Row ${index + 1}</p>
        </div>
      </div>
    `;
  }).join("");

  const preview = stockDashboardBuildReceiptPayload({ validate: false });
  stockDashboardRenderReceiptSummaryRows(preview.summaryRows);
}

function stockDashboardBuildReceiptPayload({ validate = true } = {}) {
  const errors = [];
  const mergedItems = new Map();
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

  return { items, summaryRows, errors };
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

function stockDashboardRenderReceipts(receipts = []) {
  renderDashboardList(stockDashboardReceiptList, receipts, (receipt) => {
    const items = Array.isArray(receipt.items) ? receipt.items : [];
    const summary = items.map((item) => `${stockDashboardGetDisplayLabel(item)}: ${stockDashboardGetItemQuantityLabel(item)}`).join("\n");
    const totalUnitsAdded = items.reduce((sum, item) => sum + Math.max(0, Number(item.inventoryUnits || 0)), 0);
    const receivedBy = String(receipt?.receivedBy || "").trim();
    const supplier = String(receipt?.supplierName || "").trim();
    const reference = String(receipt?.reference || "").trim();
    const metaBits = [
      stockDashboardFormatDateTime(receipt.createdAt),
      supplier ? `Supplier: ${supplier}` : "",
      reference ? `Reference: ${reference}` : "",
      receivedBy ? `Received by: Medical Technologist ${receivedBy}` : "",
      `Total units added: ${totalUnitsAdded}`
    ].filter(Boolean);

    return `
      <div class="stock-dashboard-request-card">
        <div class="stock-dashboard-request-top">
          <div>
            <p class="stock-order-kicker">${stockDashboardEscapeHtml(receipt.id || "Receipt")}</p>
            <h4>${stockDashboardEscapeHtml(supplier || "Received stock")}</h4>
          </div>
          <span class="stock-order-status-badge" data-status="received">Received</span>
        </div>
        <div class="stock-dashboard-request-meta">
          ${metaBits.map((value) => `<span>${stockDashboardEscapeHtml(value)}</span>`).join("")}
        </div>
        <p class="stock-dashboard-request-items">${stockDashboardEscapeHtml(summary || "No items listed")}</p>
        ${receipt.notes ? `<p class="stock-dashboard-request-note">${stockDashboardEscapeHtml(receipt.notes)}</p>` : ""}
      </div>
    `;
  });
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

  if (isOpen && stockDashboardUserNumberInput) {
    stockDashboardLoginModalFocusTimer = window.setTimeout(() => {
      stockDashboardUserNumberInput.focus({ preventScroll: true });
    }, 40);
  }
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

function stockDashboardSetSession(token, user) {
  stockDashboardToken = token || "";
  stockDashboardSession = user ? {
    userNumber: user.userNumber,
    displayName: stockDashboardGetDisplayName(user),
    role: stockDashboardNormalizeUserRole(user.role, Boolean(user.isOwner)),
    isOwner: Boolean(user.isOwner)
  } : null;

  if (stockDashboardToken) {
    localStorage.setItem(STOCK_DASHBOARD_TOKEN_KEY, stockDashboardToken);
  } else {
    localStorage.removeItem(STOCK_DASHBOARD_TOKEN_KEY);
  }
  if (stockDashboardSession?.isOwner) {
    localStorage.setItem(STOCK_DASHBOARD_OWNER_SEEN_KEY, "1");
  }

  const isAuthenticated = Boolean(stockDashboardSession);
  stockDashboardSetAccessModalOpen(!isAuthenticated);
  if (stockDashboardAuthForm) stockDashboardAuthForm.hidden = isAuthenticated;
  if (stockDashboardSessionCard) stockDashboardSessionCard.hidden = !isAuthenticated;
  if (stockDashboardMetrics) stockDashboardMetrics.hidden = !isAuthenticated;
  if (stockDashboardInsights) stockDashboardInsights.hidden = !isAuthenticated;
  if (stockDashboardRequestsCard) stockDashboardRequestsCard.hidden = false;
  if (stockDashboardUserAdminCard) stockDashboardUserAdminCard.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);
  if (stockDashboardOpenCreateUserBtn) {
    stockDashboardOpenCreateUserBtn.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);
  }
  if (stockDashboardManualEntryCard) stockDashboardManualEntryCard.hidden = !isAuthenticated;
  if (stockDashboardReceiptCard) stockDashboardReceiptCard.hidden = !isAuthenticated;
  if (stockDashboardInventoryCard) stockDashboardInventoryCard.hidden = !isAuthenticated;
  if (!isAuthenticated || !stockDashboardSession?.isOwner) {
    stockDashboardSetCreateUserModalOpen(false);
  }

  if (stockDashboardSessionUser) {
    stockDashboardSessionUser.textContent = isAuthenticated
      ? stockDashboardGetUserHeading(stockDashboardSession)
      : "Medical Technologist";
  }

  if (clearStockDataBtn) {
    clearStockDataBtn.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);
  }

  if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = isAuthenticated
      ? stockDashboardGetSignedInLabel(stockDashboardSession)
      : stockDashboardSetupRequired
        ? "No lab admin is set up yet. Enter your eLab user number (2 or 3 digits) and 4-digit PIN to create the first admin."
        : "Sign in to view dashboard data and update request status.";
  }

  if (stockDashboardLoginBtn) {
    stockDashboardLoginBtn.textContent = isAuthenticated
      ? "Log In"
      : stockDashboardSetupRequired
        ? "Create Admin"
        : "Log In";
  }

  if (!isAuthenticated) {
    stockDashboardClearInactivityTimers();
    stockDashboardInactivityWarningShown = false;
    stockDashboardStatusBeforeInactivityWarning = "";
    stockDashboardLatestRequestMarker = "";
    stockDashboardUnreadCount = 0;
    stockDashboardStopPolling();
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Sign in to manage requests. Showing recent submitted requests below.";
    }
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Loading recent submitted requests...</p>';
    }
    if (stockDashboardUserList) {
      stockDashboardUserList.innerHTML = "";
    }
    if (stockDashboardUserDebugList) {
      stockDashboardUserDebugList.innerHTML = "";
    }
    stockDashboardDebugUsers = [];
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = "Temporary testing view. Remove this before using real staff accounts.";
    }
    if (stockDashboardInventoryList) stockDashboardInventoryList.innerHTML = "";
    if (stockDashboardReceiptList) stockDashboardReceiptList.innerHTML = "";
    if (stockDashboardStatusCounts) stockDashboardStatusCounts.innerHTML = "";
    if (stockDashboardTopWards) stockDashboardTopWards.innerHTML = "";
    if (stockDashboardTopItems) stockDashboardTopItems.innerHTML = "";
    if (stockDashboardTotalRequests) stockDashboardTotalRequests.textContent = "0";
    if (stockDashboardOpenRequests) stockDashboardOpenRequests.textContent = "0";
    if (stockDashboardLineItems) stockDashboardLineItems.textContent = "0";
    if (stockDashboardUnitsRequested) stockDashboardUnitsRequested.textContent = "0";
    loadPublicStockDashboardRequests();
  } else {
    stockDashboardBindInactivityHandlers();
    stockDashboardResetInactivityWatch();
    stockDashboardUpdateNotificationPermissionUi();
    stockDashboardRenderNotificationState();
    stockDashboardStartPolling();
  }
}

async function loadPublicStockDashboardRequests() {
  if (!stockDashboardRequestList) return;

  try {
    const response = await fetch(STOCK_DASHBOARD_PUBLIC_REQUESTS_URL, { cache: "no-store" });
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

function stockDashboardSetBusy(isBusy) {
  [
    stockDashboardLoginBtn,
    stockDashboardLogoutBtn,
    stockDashboardRefreshBtn,
    stockDashboardCreateUserBtn,
    stockDashboardManualSubmitBtn,
    stockDashboardManualResetBtn,
    stockDashboardReceiptAddItemBtn,
    stockDashboardReceiptSubmitBtn,
    stockDashboardReceiptResetBtn,
    stockDashboardRefreshDebugUsersBtn,
    stockDashboardCopyDebugUsersBtn
  ].forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = isBusy;
    }
  });
}

async function stockDashboardSendAuthRequest(url) {
  const { userNumber, pin } = stockDashboardGetCredentials();
  if (!stockDashboardIsValidElabUserNumber(userNumber) || !stockDashboardIsValidPin(pin)) {
    if (stockDashboardAuthStatus) {
      stockDashboardAuthStatus.textContent = "Use your eLab user number (2 or 3 digits) and a 4-digit PIN.";
    }
    return;
  }

  stockDashboardSetBusy(true);
  if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = "Checking details...";

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), STOCK_DASHBOARD_LOGIN_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: stockDashboardGetHeaders(true),
        body: JSON.stringify({ userNumber, pin }),
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.token || !payload?.user) {
      const errorMessage = payload?.error || (stockDashboardSetupRequired ? "Could not create admin." : STOCK_DASHBOARD_INVALID_LOGIN_TEXT);
      const setupAlreadyConfigured = url === STOCK_DASHBOARD_BOOTSTRAP_URL
        && response.status === 403
        && /already been configured/i.test(String(errorMessage));
      if (setupAlreadyConfigured) {
        stockDashboardSetupRequired = false;
        await stockDashboardSendAuthRequest(STOCK_DASHBOARD_LOGIN_URL);
        return;
      }
      throw new Error(errorMessage);
    }

    stockDashboardSetupRequired = false;
    stockDashboardSetSession(payload.token, payload.user);
    if (stockDashboardPinInput) stockDashboardPinInput.value = "";
    await loadStockDashboard();
    await loadStockDashboardUsers();
    await loadStockDashboardDebugUsers();
  } catch (error) {
    stockDashboardSetSession("", null);
    if (stockDashboardAuthStatus) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const fallbackMessage = stockDashboardSetupRequired
        ? "Could not create admin."
        : STOCK_DASHBOARD_INVALID_LOGIN_TEXT;
      stockDashboardAuthStatus.textContent = isAbort
        ? "Could not verify details. Please try again."
        : (error instanceof Error ? error.message : fallbackMessage);
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

async function loadStockDashboardUsers() {
  if (!stockDashboardSession?.isOwner || !stockDashboardUserList) return;

  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = "Loading users...";
  }

  try {
    const response = await fetch(STOCK_DASHBOARD_USERS_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load users");
    }

    const payload = await response.json();
    const users = Array.isArray(payload?.users) ? payload.users : [];
    stockDashboardUserList.innerHTML = users.length
      ? users.map((user) => `
        <div class="stock-dashboard-list-row">
          <span>${stockDashboardEscapeHtml(stockDashboardGetDisplayName(user) || "Medical Technologist")}${stockDashboardSession?.userNumber === user.userNumber ? " · You" : ""}</span>
          <strong>${stockDashboardEscapeHtml(stockDashboardGetRoleLabel(user?.role, Boolean(user?.isOwner)))}</strong>
        </div>
      `).join("")
      : '<p class="stock-dashboard-empty">No users yet.</p>';

    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = `${users.length} user${users.length === 1 ? "" : "s"} saved.`;
    }
  } catch {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Could not load users.";
    }
  }
}

function stockDashboardRenderDebugUsers(users = []) {
  if (!stockDashboardUserDebugList) return;

  if (!users.length) {
    stockDashboardUserDebugList.innerHTML = '<p class="stock-dashboard-empty">No saved users found.</p>';
    return;
  }

  // TODO: Remove PIN display before using real staff accounts.
  stockDashboardUserDebugList.innerHTML = users.map((user) => {
    const name = stockDashboardGetDisplayName(user) || "Medical Technologist";
    const displayElabUserNumber = stockDashboardGetDebugElabNumber(user);
    const normalizedElabUserNumber = String(user?.normalizedElabUserNumber || user?.userNumber || "").trim();
    const pin = String(user?.pin || "").trim() || "Not stored";
    const roleLabel = stockDashboardGetRoleLabel(user?.role, Boolean(user?.isOwner));
    const statusLabel = stockDashboardNormalizeUserStatus(user?.status);
    const createdAt = stockDashboardFormatOptionalDate(user?.createdAt);
    const lastLoginAt = stockDashboardFormatOptionalDate(user?.lastLoginAt);
    return `
      <div class="stock-dashboard-list-row">
        <span>
          ${stockDashboardEscapeHtml(name)}
          <br />eLab user number: ${stockDashboardEscapeHtml(displayElabUserNumber || "Not stored")}
          <br />Normalized eLab number: ${stockDashboardEscapeHtml(normalizedElabUserNumber || "Not stored")}
          <br />PIN: ${stockDashboardEscapeHtml(pin)}
          <br />Role: ${stockDashboardEscapeHtml(roleLabel)}
          <br />Status: ${stockDashboardEscapeHtml(statusLabel)}
          <br />Created: ${stockDashboardEscapeHtml(createdAt)}
          <br />Last login: ${stockDashboardEscapeHtml(lastLoginAt)}
        </span>
      </div>
    `;
  }).join("");
}

async function loadStockDashboardDebugUsers() {
  if (!stockDashboardSession?.isOwner || !stockDashboardUserDebugList) return;

  if (stockDashboardUserDebugStatus) {
    stockDashboardUserDebugStatus.textContent = "Loading debug users...";
  }

  try {
    const response = await fetch(STOCK_DASHBOARD_USERS_DEBUG_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load debug users.");
    }

    const payload = await response.json().catch(() => ({}));
    const users = Array.isArray(payload?.users) ? payload.users : [];
    stockDashboardDebugUsers = users;
    stockDashboardRenderDebugUsers(users);
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = users.length
        ? `Showing ${users.length} saved user${users.length === 1 ? "" : "s"}. Storage: server file. localStorage key ${STOCK_DASHBOARD_TOKEN_KEY} is session token only.`
        : "No saved users found.";
    }
  } catch {
    stockDashboardDebugUsers = [];
    stockDashboardRenderDebugUsers([]);
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = "Could not load debug users.";
    }
  }
}

async function stockDashboardCopyDebugUsers() {
  if (!stockDashboardSession?.isOwner) return;

  const users = Array.isArray(stockDashboardDebugUsers) ? stockDashboardDebugUsers : [];
  if (!users.length) {
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = "No saved users found.";
    }
    return;
  }

  const copyText = users.map((user) => {
    const name = stockDashboardGetDisplayName(user) || "Medical Technologist";
    const displayElabUserNumber = stockDashboardGetDebugElabNumber(user) || "Not stored";
    const normalizedElabUserNumber = String(user?.normalizedElabUserNumber || user?.userNumber || "").trim() || "Not stored";
    const pin = String(user?.pin || "").trim() || "Not stored";
    const roleLabel = stockDashboardGetRoleLabel(user?.role, Boolean(user?.isOwner));
    const statusLabel = stockDashboardNormalizeUserStatus(user?.status);
    return [
      `Name: ${name}`,
      `eLab user number: ${displayElabUserNumber}`,
      `Normalized number: ${normalizedElabUserNumber}`,
      `PIN: ${pin}`,
      `Role: ${roleLabel}`,
      `Status: ${statusLabel}`
    ].join("\n");
  }).join("\n\n");

  try {
    await navigator.clipboard.writeText(copyText);
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = "Debug users copied.";
    }
  } catch {
    if (stockDashboardUserDebugStatus) {
      stockDashboardUserDebugStatus.textContent = "Could not copy debug users.";
    }
  }
}

async function createStockDashboardUser() {
  if (!stockDashboardSession?.isOwner) {
    stockDashboardSetCreateUserMessage("Only Admin users can create users.");
    return;
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
    const response = await fetch(STOCK_DASHBOARD_USERS_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ displayName, userNumber, pin, role })
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not create user");
    }

    if (stockDashboardCreateUserForm) stockDashboardCreateUserForm.reset();
    stockDashboardSetCreateUserMessage("User created and saved.");
    if (stockDashboardUserAdminStatus) stockDashboardUserAdminStatus.textContent = "User created and saved.";
    stockDashboardSetCreateUserModalOpen(false);
    await loadStockDashboardUsers();
    await loadStockDashboardDebugUsers();
    if (stockDashboardUserAdminStatus) stockDashboardUserAdminStatus.textContent = "User created and saved.";
  } catch (error) {
    stockDashboardSetCreateUserMessage("User could not be saved. Please check storage or console errors.");
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "User could not be saved. Please check storage or console errors.";
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
  if (stockDashboardReceiptForm) stockDashboardReceiptForm.reset();
  stockDashboardEnsureReceiptRows();
  stockDashboardRenderReceiptItemRows();
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
    const response = await fetch(STOCK_DASHBOARD_MANUAL_REQUEST_URL, {
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
          sheetSingleColumnKey: item.sheetSingleColumnKey || ""
        }))
      })
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
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
    const response = await fetch(STOCK_DASHBOARD_RECEIPTS_URL, {
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

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
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
    const response = await fetch(STOCK_DASHBOARD_INVENTORY_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load inventory");
    }

    const payload = await response.json().catch(() => ({}));
    stockDashboardRenderInventory(Array.isArray(payload?.summary) ? payload.summary : []);
    stockDashboardRenderReceipts(Array.isArray(payload?.recentReceipts) ? payload.recentReceipts : []);
  } catch {
    if (stockDashboardInventoryStatus) {
      stockDashboardInventoryStatus.textContent = "Could not load inventory.";
    }
    if (stockDashboardInventoryList) {
      stockDashboardInventoryList.innerHTML = '<p class="stock-dashboard-empty">Inventory is not available yet.</p>';
    }
    if (stockDashboardReceiptList) {
      stockDashboardReceiptList.innerHTML = '<p class="stock-dashboard-empty">No received stock records yet.</p>';
    }
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
  if (!stats) return;

  if (stockDashboardTotalRequests) stockDashboardTotalRequests.textContent = String(stats.totalRequests || 0);
  if (stockDashboardOpenRequests) stockDashboardOpenRequests.textContent = String(stats.openRequests || 0);
  if (stockDashboardLineItems) stockDashboardLineItems.textContent = String(stats.totalLineItems || 0);
  if (stockDashboardUnitsRequested) stockDashboardUnitsRequested.textContent = String(stats.totalUnitsRequested || 0);

  renderDashboardList(stockDashboardStatusCounts, STOCK_DASHBOARD_STATUS_ORDER.filter((status) => Number(stats.statusCounts?.[status] || 0)), (status) => `
    <span class="stock-dashboard-chip" data-status="${stockDashboardEscapeHtml(status)}">
      ${stockDashboardEscapeHtml(stockDashboardFormatStatus(status))}: ${Number(stats.statusCounts?.[status] || 0)}
    </span>
  `);

  renderDashboardList(stockDashboardTopWards, stats.topWards || [], (ward) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(ward.name)}</span>
      <strong>${Number(ward.count || 0)}</strong>
    </div>
  `);

  renderDashboardList(stockDashboardTopItems, stats.topItems || [], (item) => `
    <div class="stock-dashboard-list-row">
      <span>${stockDashboardEscapeHtml(item.label)}</span>
      <strong>${Number(item.quantity || 0)}</strong>
    </div>
  `);
}

function renderStockDashboardRequests(requests) {
  if (!stockDashboardRequestList) return;

  const activeRequests = Array.isArray(requests) ? requests : [];

  if (!activeRequests.length) {
    stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">No consumables requests yet. New ward requests will appear here automatically.</p>';
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
  if (!stockDashboardStatus || !stockDashboardSession) {
    if (!stockDashboardSession) {
      loadPublicStockDashboardRequests();
    }
    return;
  }
  const { silent = false, fromPoll = false } = options;

  if (!silent) {
    stockDashboardStatus.textContent = "Loading requests...";
    stockDashboardSetBusy(true);
  }

  try {
    const [statsResponse, requestsResponse, inventoryResponse] = await Promise.all([
      fetch(STOCK_DASHBOARD_STATS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() }),
      fetch(STOCK_DASHBOARD_REQUESTS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() }),
      fetch(STOCK_DASHBOARD_INVENTORY_URL, { cache: "no-store", headers: stockDashboardGetHeaders() })
    ]);

    if (
      statsResponse.status === 401 || statsResponse.status === 403
      || requestsResponse.status === 401 || requestsResponse.status === 403
      || inventoryResponse.status === 401 || inventoryResponse.status === 403
    ) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!statsResponse.ok || !requestsResponse.ok || !inventoryResponse.ok) {
      throw new Error("Could not load dashboard data");
    }

    const statsPayload = await statsResponse.json();
    const requestsPayload = await requestsResponse.json();
    const inventoryPayload = await inventoryResponse.json();
    const requests = requestsPayload.requests || [];

    renderStockDashboardStats(statsPayload.stats || {});
    renderStockDashboardRequests(requests);
    stockDashboardRenderInventory(Array.isArray(inventoryPayload?.summary) ? inventoryPayload.summary : []);
    stockDashboardRenderReceipts(Array.isArray(inventoryPayload?.recentReceipts) ? inventoryPayload.recentReceipts : []);
    stockDashboardProcessNotifications(requests, { fromPoll });
    if (!silent) {
      stockDashboardStatus.textContent = `Updated ${stockDashboardFormatDateTime(new Date().toISOString())}`;
    }
  } catch {
    stockDashboardStatus.textContent = "Dashboard data could not load. Please check your connection or refresh the page.";
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Dashboard data could not load. Please check your connection or refresh the page.</p>';
    }
    loadPublicStockDashboardRequests();
  } finally {
    if (!silent) {
      stockDashboardSetBusy(false);
    }
  }
}

async function updateStockDashboardRequestStatus(requestId, status) {
  if (!requestId || !status || !stockDashboardStatus || !stockDashboardSession) return;

  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "collected") {
    const confirmed = window.confirm("Mark this order as collected? Stock on hand will be deducted once.");
    if (!confirmed) return;
  }

  stockDashboardStatus.textContent = `Updating ${requestId}...`;

  try {
    const response = await fetch(stockDashboardBuildApiUrl(`/api/stock-requests/${encodeURIComponent(requestId)}/status`), {
      method: "PATCH",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ status })
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
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
  try {
    const response = await fetch(STOCK_DASHBOARD_SESSION_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    const payload = await response.json().catch(() => ({}));

    stockDashboardSetupRequired = Boolean(payload?.setupRequired);

    if (!response.ok || !payload?.authenticated || !payload?.user) {
      stockDashboardSetSession("", null);
      return;
    }

    stockDashboardSetupRequired = false;
    stockDashboardSetSession(stockDashboardToken, payload.user);
    await loadStockDashboard();
    await loadStockDashboardUsers();
    await loadStockDashboardDebugUsers();
  } catch {
    stockDashboardSetSession("", null);
  }
}

async function logoutStockDashboard() {
  stockDashboardSetBusy(true);
  try {
    await fetch(STOCK_DASHBOARD_LOGOUT_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders()
    });
  } finally {
    stockDashboardLatestRequestMarker = "";
    stockDashboardUnreadCount = 0;
    stockDashboardSetSession("", null);
    stockDashboardSetBusy(false);
  }
}

async function clearStockDashboardData() {
  if (!stockDashboardSession?.isOwner || !clearStockDataBtn) return;

  const confirmed = window.confirm("Clear all saved stock request history? This cannot be undone.");
  if (!confirmed) return;

  stockDashboardSetBusy(true);
  if (stockDashboardStatus) {
    stockDashboardStatus.textContent = "Clearing saved request history...";
  }

  try {
    const response = await fetch(STOCK_DASHBOARD_CLEAR_DATA_URL, {
      method: "DELETE",
      headers: stockDashboardGetHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
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

stockDashboardLogoutBtn?.addEventListener("click", () => {
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

stockDashboardRefreshDebugUsersBtn?.addEventListener("click", () => {
  loadStockDashboardDebugUsers();
});

stockDashboardCopyDebugUsersBtn?.addEventListener("click", () => {
  stockDashboardCopyDebugUsers();
});

stockDashboardRequestList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-request-id][data-request-status]");
  if (!(button instanceof HTMLButtonElement)) return;

  const requestId = button.getAttribute("data-request-id") || "";
  const status = button.getAttribute("data-request-status") || "";
  updateStockDashboardRequestStatus(requestId, status);
});

stockDashboardAccessCloseBtn?.addEventListener("click", () => {
  stockDashboardReturnToPreviousPage();
});

stockDashboardAccessCard?.addEventListener("click", (event) => {
  if (event.target !== stockDashboardAccessCard) return;
  stockDashboardReturnToPreviousPage();
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
  if (!stockDashboardSession?.isOwner) return;
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

stockDashboardReceiptItemsRows?.addEventListener("change", (event) => {
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
    stockDashboardRenderReceiptItemRows();
    return;
  }

  if (field === "unit" && target instanceof HTMLSelectElement) {
    row.unitType = target.value;
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
  if (field !== "quantity" || !(target instanceof HTMLInputElement)) return;
  row.quantity = target.value;
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
checkStockDashboardSession();
