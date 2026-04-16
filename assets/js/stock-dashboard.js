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
const stockDashboardCreateUserModal = document.getElementById("stockDashboardCreateUserModal");
const stockDashboardCloseCreateUserModalBtn = document.getElementById("stockDashboardCloseCreateUserModalBtn");
const stockDashboardCreateUserForm = document.getElementById("stockDashboardCreateUserForm");
const stockDashboardCreateUserNameInput = document.getElementById("stockDashboardCreateUserNameInput");
const stockDashboardCreateUserNumberInput = document.getElementById("stockDashboardCreateUserNumberInput");
const stockDashboardCreateUserPinInput = document.getElementById("stockDashboardCreateUserPinInput");
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
const stockDashboardReceiptGrid = document.getElementById("stockDashboardReceiptGrid");
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
const STOCK_DASHBOARD_STATUS_ORDER = ["received", "packed", "collected", "completed", "cancelled"];
const STOCK_DASHBOARD_BROWSER_ALERTS_KEY = "fmt-stock-browser-alerts";
const STOCK_DASHBOARD_LAST_SEEN_PREFIX = "fmt-stock-last-seen";
const STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX = "fmt-stock-last-notified";
const STOCK_DASHBOARD_OWNER_SEEN_KEY = "fmt-stock-owner-seen";
const STOCK_DASHBOARD_POLL_MS = 30000;

let stockDashboardSession = null;
let stockDashboardToken = localStorage.getItem(STOCK_DASHBOARD_TOKEN_KEY) || "";
let stockDashboardPollTimer = 0;
let stockDashboardLatestRequestMarker = "";
let stockDashboardUnreadCount = 0;
let stockDashboardSetupRequired = false;
let stockDashboardLoginModalFocusTimer = 0;

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

function stockDashboardGetUserHeading(user) {
  const displayName = stockDashboardGetDisplayName(user);
  if (user?.isOwner) return displayName ? `${displayName} · Admin` : "Admin";
  return displayName || "Lab user";
}

function stockDashboardGetSignedInLabel(user) {
  const displayName = stockDashboardGetDisplayName(user);
  if (user?.isOwner) return displayName ? `Signed in as ${displayName} (Admin).` : "Signed in as Admin.";
  return displayName ? `Signed in as ${displayName}.` : "Signed in.";
}

function stockDashboardNormalizeStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "completed";
  return safeStatus || "received";
}

function stockDashboardGetQueueStatusMeta(status) {
  const safeStatus = stockDashboardNormalizeStatus(status);
  if (safeStatus === "received") return { label: "New", stage: "new" };
  if (safeStatus === "processing" || safeStatus === "in-progress") return { label: "In progress", stage: "in-progress" };
  if (safeStatus === "packed") return { label: "Packed", stage: "packed" };
  if (safeStatus === "collected" || safeStatus === "completed") return { label: "Delivered", stage: "delivered" };
  if (safeStatus === "cancelled" || safeStatus === "rejected" || safeStatus === "failed") return { label: "Cancelled", stage: "cancelled" };
  return { label: "In progress", stage: "in-progress" };
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

function stockDashboardBuildAuditRows(request) {
  const history = Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  if (!history.length) return "";

  return history.map((entry) => `
    <div class="stock-dashboard-audit-item">
      ${stockDashboardEscapeHtml(stockDashboardFormatStatus(entry.status))}
      · ${stockDashboardEscapeHtml(stockDashboardFormatDateTime(entry.updatedAt))}
      ${entry.updatedBy ? ` · Lab user ${stockDashboardEscapeHtml(entry.updatedBy)}` : ""}
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
      : "Signed-in lab users can review live stock balances here.";
  }
}

function stockDashboardRenderReceipts(receipts = []) {
  renderDashboardList(stockDashboardReceiptList, receipts, (receipt) => {
    const items = Array.isArray(receipt.items) ? receipt.items : [];
    const summary = items.map((item) => `${stockDashboardGetDisplayLabel(item)}: ${stockDashboardGetItemQuantityLabel(item)}`).join("\n");

    return `
      <div class="stock-dashboard-request-card">
        <div class="stock-dashboard-request-top">
          <div>
            <p class="stock-order-kicker">${stockDashboardEscapeHtml(receipt.id || "Receipt")}</p>
            <h4>${stockDashboardEscapeHtml(receipt.supplierName || "Supplier")}</h4>
          </div>
          <span class="stock-order-status-badge" data-status="received">Received</span>
        </div>
        <div class="stock-dashboard-request-meta">
          <span>${stockDashboardEscapeHtml(receipt.reference || "No reference")}</span>
          <span>${stockDashboardEscapeHtml(stockDashboardFormatDateTime(receipt.createdAt))}</span>
          <span>${receipt.receivedBy ? `Lab user ${stockDashboardEscapeHtml(receipt.receivedBy)}` : ""}</span>
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

function stockDashboardRenderNotificationState() {
  if (stockDashboardNotificationCard) {
    stockDashboardNotificationCard.hidden = !stockDashboardSession;
  }

  if (!stockDashboardSession) {
    if (stockDashboardNotificationTitle) stockDashboardNotificationTitle.textContent = "No new requests";
    if (stockDashboardNotificationStatus) stockDashboardNotificationStatus.textContent = "Alerts work for signed-in lab users while this dashboard stays open.";
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
      stockDashboardNotificationStatus.textContent = "Alerts work for signed-in lab users while this dashboard stays open.";
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
      : "Lab user";
  }

  if (clearStockDataBtn) {
    clearStockDataBtn.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);
  }

  if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = isAuthenticated
      ? stockDashboardGetSignedInLabel(stockDashboardSession)
      : stockDashboardSetupRequired
        ? "No lab admin is set up yet. Enter a user number and 4-digit PIN to create the first admin."
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
  const userNumber = String(stockDashboardUserNumberInput?.value || "").replace(/\D+/g, "").slice(0, 12);
  const pin = String(stockDashboardPinInput?.value || "").replace(/\D+/g, "").slice(0, 4);
  return { userNumber, pin };
}

function stockDashboardSetBusy(isBusy) {
  [
    stockDashboardLoginBtn,
    stockDashboardLogoutBtn,
    stockDashboardRefreshBtn,
    stockDashboardCreateUserBtn,
    stockDashboardManualSubmitBtn,
    stockDashboardManualResetBtn,
    stockDashboardReceiptSubmitBtn,
    stockDashboardReceiptResetBtn
  ].forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = isBusy;
    }
  });
}

async function stockDashboardSendAuthRequest(url) {
  const { userNumber, pin } = stockDashboardGetCredentials();
  if (userNumber.length < 3 || pin.length !== 4) {
    if (stockDashboardAuthStatus) {
      stockDashboardAuthStatus.textContent = "Use a lab user number of at least 3 digits and a 4-digit PIN.";
    }
    return;
  }

  stockDashboardSetBusy(true);
  if (stockDashboardAuthStatus) stockDashboardAuthStatus.textContent = "Checking details...";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ userNumber, pin })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.token || !payload?.user) {
      const errorMessage = payload?.error || (stockDashboardSetupRequired ? "Could not create admin." : "Could not sign in");
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
  } catch (error) {
    stockDashboardSetSession("", null);
    if (stockDashboardAuthStatus) {
      stockDashboardAuthStatus.textContent = error instanceof Error ? error.message : "Could not sign in.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
}

async function loadStockDashboardUsers() {
  if (!stockDashboardSession?.isOwner || !stockDashboardUserList) return;

  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = "Loading lab users...";
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
      throw new Error("Could not load lab users");
    }

    const payload = await response.json();
    const users = Array.isArray(payload?.users) ? payload.users : [];
    stockDashboardUserList.innerHTML = users.length
      ? users.map((user) => `
        <div class="stock-dashboard-list-row">
          <span>${stockDashboardEscapeHtml(stockDashboardGetDisplayName(user) || "Lab user")}${stockDashboardSession?.userNumber === user.userNumber ? " · You" : ""}</span>
        </div>
      `).join("")
      : '<p class="stock-dashboard-empty">No lab users yet.</p>';

    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = `${users.length} lab user${users.length === 1 ? "" : "s"} saved.`;
    }
  } catch {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Could not load lab users.";
    }
  }
}

async function createStockDashboardUser() {
  if (!stockDashboardSession?.isOwner) return;

  const displayName = String(stockDashboardCreateUserNameInput?.value || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const userNumber = String(stockDashboardCreateUserNumberInput?.value || "").replace(/\D+/g, "").slice(0, 12);
  const pin = String(stockDashboardCreateUserPinInput?.value || "").replace(/\D+/g, "").slice(0, 4);
  if (displayName.length < 2 || userNumber.length < 3 || pin.length !== 4) {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Use a display name, a user number of at least 3 digits, and a 4-digit PIN.";
    }
    return;
  }

  stockDashboardSetBusy(true);
  if (stockDashboardUserAdminStatus) {
    stockDashboardUserAdminStatus.textContent = "Creating lab user...";
  }

  try {
    const response = await fetch(STOCK_DASHBOARD_USERS_URL, {
      method: "POST",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ displayName, userNumber, pin })
    });

    if (response.status === 401 || response.status === 403) {
      stockDashboardSetSession("", null);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not create lab user");
    }

    if (stockDashboardCreateUserForm) stockDashboardCreateUserForm.reset();
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = `${displayName} (${userNumber}) created.`;
    }
    stockDashboardSetCreateUserModalOpen(false);
    await loadStockDashboardUsers();
  } catch (error) {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = error instanceof Error ? error.message : "Could not create lab user.";
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
  stockDashboardSetEditorState(stockDashboardReceiptState);
  if (stockDashboardReceiptForm) stockDashboardReceiptForm.reset();
  stockDashboardRenderEditorGrid(stockDashboardReceiptGrid, stockDashboardReceiptState, "receipt");
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
  const items = stockDashboardGetSelectedItems(stockDashboardReceiptState);

  if (!supplierName || !items.length) {
    if (stockDashboardReceiptStatus) {
      stockDashboardReceiptStatus.textContent = "Add the supplier and at least one item.";
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
      stockDashboardReceiptStatus.textContent = payload?.receipt?.id
        ? `Supplier receipt ${payload.receipt.id} saved.`
        : "Received stock saved.";
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
      stockDashboardReceiptList.innerHTML = '<p class="stock-dashboard-empty">No supplier receipts yet.</p>';
    }
  }
}

function initStockDashboardTools() {
  if (!Array.isArray(stockConsumableItems)) return;

  stockDashboardSetEditorState(stockDashboardManualState);
  stockDashboardSetEditorState(stockDashboardReceiptState);
  stockDashboardPopulateWardOptions();
  stockDashboardRenderEditorGrid(stockDashboardManualGrid, stockDashboardManualState, "manual");
  stockDashboardRenderEditorGrid(stockDashboardReceiptGrid, stockDashboardReceiptState, "receipt");
  stockDashboardAttachGridEvents(stockDashboardManualGrid, stockDashboardManualState);
  stockDashboardAttachGridEvents(stockDashboardReceiptGrid, stockDashboardReceiptState);
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
  if (safeStatus === "completed") {
    const confirmed = window.confirm("Mark this order as completed? This should only be done once it has been fully issued or distributed.");
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
  createStockDashboardUser();
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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!stockDashboardCreateUserModal?.hidden) {
    stockDashboardSetCreateUserModalOpen(false);
    return;
  }
  if (stockDashboardAccessCard?.hidden) return;
  stockDashboardReturnToPreviousPage();
});

checkStockDashboardSession();
