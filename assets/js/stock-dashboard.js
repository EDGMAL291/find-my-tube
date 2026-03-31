const stockDashboardRefreshBtn = document.getElementById("stockDashboardRefreshBtn");
const stockDashboardStatus = document.getElementById("stockDashboardStatus");
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
const stockDashboardLogoutBtn = document.getElementById("stockDashboardLogoutBtn");
const clearStockDataBtn = document.getElementById("clearStockDataBtn");
const stockDashboardSessionCard = document.getElementById("stockDashboardSessionCard");
const stockDashboardSessionUser = document.getElementById("stockDashboardSessionUser");
const stockDashboardUserAdminCard = document.getElementById("stockDashboardUserAdminCard");
const stockDashboardUserAdminStatus = document.getElementById("stockDashboardUserAdminStatus");
const stockDashboardCreateUserForm = document.getElementById("stockDashboardCreateUserForm");
const stockDashboardCreateUserNumberInput = document.getElementById("stockDashboardCreateUserNumberInput");
const stockDashboardCreateUserPinInput = document.getElementById("stockDashboardCreateUserPinInput");
const stockDashboardCreateUserBtn = document.getElementById("stockDashboardCreateUserBtn");
const stockDashboardUserList = document.getElementById("stockDashboardUserList");
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

const STOCK_DASHBOARD_REQUESTS_URL = "/api/lab/stock-requests?limit=30";
const STOCK_DASHBOARD_STATS_URL = "/api/lab/stock-stats";
const STOCK_DASHBOARD_SESSION_URL = "/api/stock-auth/session";
const STOCK_DASHBOARD_LOGIN_URL = "/api/stock-auth/login";
const STOCK_DASHBOARD_LOGOUT_URL = "/api/stock-auth/logout";
const STOCK_DASHBOARD_CLEAR_DATA_URL = "/api/lab/stock-data";
const STOCK_DASHBOARD_USERS_URL = "/api/lab/users";
const STOCK_DASHBOARD_TOKEN_KEY = "fmt-stock-lab-token";
const STOCK_DASHBOARD_STATUS_ORDER = ["received", "packed", "sent", "completed", "cancelled"];
const STOCK_DASHBOARD_BROWSER_ALERTS_KEY = "fmt-stock-browser-alerts";
const STOCK_DASHBOARD_LAST_SEEN_PREFIX = "fmt-stock-last-seen";
const STOCK_DASHBOARD_LAST_NOTIFIED_PREFIX = "fmt-stock-last-notified";
const STOCK_DASHBOARD_POLL_MS = 30000;

let stockDashboardSession = null;
let stockDashboardToken = localStorage.getItem(STOCK_DASHBOARD_TOKEN_KEY) || "";
let stockDashboardPollTimer = 0;
let stockDashboardLatestRequestMarker = "";
let stockDashboardUnreadCount = 0;

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
    isOwner: Boolean(user.isOwner)
  } : null;

  if (stockDashboardToken) {
    localStorage.setItem(STOCK_DASHBOARD_TOKEN_KEY, stockDashboardToken);
  } else {
    localStorage.removeItem(STOCK_DASHBOARD_TOKEN_KEY);
  }

  const isAuthenticated = Boolean(stockDashboardSession);
  if (stockDashboardAuthForm) stockDashboardAuthForm.hidden = isAuthenticated;
  if (stockDashboardSessionCard) stockDashboardSessionCard.hidden = !isAuthenticated;
  if (stockDashboardMetrics) stockDashboardMetrics.hidden = !isAuthenticated;
  if (stockDashboardInsights) stockDashboardInsights.hidden = !isAuthenticated;
  if (stockDashboardRequestsCard) stockDashboardRequestsCard.hidden = !isAuthenticated;
  if (stockDashboardUserAdminCard) stockDashboardUserAdminCard.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);

  if (stockDashboardSessionUser) {
    stockDashboardSessionUser.textContent = isAuthenticated
      ? stockDashboardSession.isOwner
        ? `Lab user ${stockDashboardSession.userNumber} · Owner`
        : `Lab user ${stockDashboardSession.userNumber}`
      : "Lab user";
  }

  if (clearStockDataBtn) {
    clearStockDataBtn.hidden = !(isAuthenticated && stockDashboardSession?.isOwner);
  }

  if (stockDashboardAuthStatus) {
    stockDashboardAuthStatus.textContent = isAuthenticated
      ? stockDashboardSession.isOwner
        ? `Signed in as owner lab user ${stockDashboardSession.userNumber}.`
        : `Signed in as lab user ${stockDashboardSession.userNumber}.`
      : "Sign in to view dashboard data and update request status.";
  }

  if (!isAuthenticated) {
    stockDashboardLatestRequestMarker = "";
    stockDashboardUnreadCount = 0;
    stockDashboardStopPolling();
    if (stockDashboardStatus) {
      stockDashboardStatus.textContent = "Dashboard is locked until you log in.";
    }
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">Log in to view and manage requests.</p>';
    }
    if (stockDashboardUserList) {
      stockDashboardUserList.innerHTML = "";
    }
    if (stockDashboardStatusCounts) stockDashboardStatusCounts.innerHTML = "";
    if (stockDashboardTopWards) stockDashboardTopWards.innerHTML = "";
    if (stockDashboardTopItems) stockDashboardTopItems.innerHTML = "";
    if (stockDashboardTotalRequests) stockDashboardTotalRequests.textContent = "0";
    if (stockDashboardOpenRequests) stockDashboardOpenRequests.textContent = "0";
    if (stockDashboardLineItems) stockDashboardLineItems.textContent = "0";
    if (stockDashboardUnitsRequested) stockDashboardUnitsRequested.textContent = "0";
  } else {
    stockDashboardUpdateNotificationPermissionUi();
    stockDashboardRenderNotificationState();
    stockDashboardStartPolling();
  }
}

function stockDashboardGetCredentials() {
  const userNumber = String(stockDashboardUserNumberInput?.value || "").replace(/\D+/g, "").slice(0, 12);
  const pin = String(stockDashboardPinInput?.value || "").replace(/\D+/g, "").slice(0, 4);
  return { userNumber, pin };
}

function stockDashboardSetBusy(isBusy) {
  [stockDashboardLoginBtn, stockDashboardLogoutBtn, stockDashboardRefreshBtn, stockDashboardCreateUserBtn].forEach((button) => {
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
      throw new Error(payload?.error || "Could not sign in");
    }

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
          <span>${stockDashboardEscapeHtml(user.userNumber)}${stockDashboardSession?.userNumber === user.userNumber ? " · You" : ""}</span>
          <strong>${stockDashboardEscapeHtml(stockDashboardFormatDateTime(user.createdAt))}</strong>
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

  const userNumber = String(stockDashboardCreateUserNumberInput?.value || "").replace(/\D+/g, "").slice(0, 12);
  const pin = String(stockDashboardCreateUserPinInput?.value || "").replace(/\D+/g, "").slice(0, 4);
  if (userNumber.length < 3 || pin.length !== 4) {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = "Use a user number of at least 3 digits and a 4-digit PIN.";
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
      body: JSON.stringify({ userNumber, pin })
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
      stockDashboardUserAdminStatus.textContent = `Lab user ${userNumber} created.`;
    }
    await loadStockDashboardUsers();
  } catch (error) {
    if (stockDashboardUserAdminStatus) {
      stockDashboardUserAdminStatus.textContent = error instanceof Error ? error.message : "Could not create lab user.";
    }
  } finally {
    stockDashboardSetBusy(false);
  }
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

  if (!requests.length) {
    stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">No requests have been submitted yet.</p>';
    return;
  }

  stockDashboardRequestList.innerHTML = requests.map((request) => {
    const safeStatus = String(request.status || "received").toLowerCase();
    const items = Array.isArray(request.items) ? request.items : [];
    const itemSummary = items.map((item) => `${item.label}: ${item.formattedQuantity || item.quantity}`).join(", ");
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
      <article class="stock-dashboard-request-card" data-dashboard-request="${stockDashboardEscapeHtml(request.id)}">
        <div class="stock-dashboard-request-top">
          <div>
            <p class="stock-order-kicker">${stockDashboardEscapeHtml(request.id)}</p>
            <h4>${stockDashboardEscapeHtml(request.requestedBy || "Unknown requester")}</h4>
          </div>
          <span class="stock-order-status-badge" data-status="${stockDashboardEscapeHtml(safeStatus)}">${stockDashboardEscapeHtml(stockDashboardFormatStatus(safeStatus))}</span>
        </div>
        <div class="stock-dashboard-request-meta">
          <span>${stockDashboardEscapeHtml(request.wardUnit || "No ward set")}</span>
          <span>${stockDashboardEscapeHtml(stockDashboardFormatDateTime(request.createdAt))}</span>
        </div>
        <p class="stock-dashboard-request-items">${stockDashboardEscapeHtml(itemSummary || "No items listed")}</p>
        ${request.notes ? `<p class="stock-dashboard-request-note">${stockDashboardEscapeHtml(request.notes)}</p>` : ""}
        <div class="stock-dashboard-status-row">
          ${statusButtons}
        </div>
      </article>
    `;
  }).join("");
}

async function loadStockDashboard(options = {}) {
  if (!stockDashboardStatus || !stockDashboardSession) return;
  const { silent = false, fromPoll = false } = options;

  if (!silent) {
    stockDashboardStatus.textContent = "Loading requests...";
    stockDashboardSetBusy(true);
  }

  try {
    const [statsResponse, requestsResponse] = await Promise.all([
      fetch(STOCK_DASHBOARD_STATS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() }),
      fetch(STOCK_DASHBOARD_REQUESTS_URL, { cache: "no-store", headers: stockDashboardGetHeaders() })
    ]);

    if (statsResponse.status === 401 || requestsResponse.status === 401) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!statsResponse.ok || !requestsResponse.ok) {
      throw new Error("Could not load dashboard data");
    }

    const statsPayload = await statsResponse.json();
    const requestsPayload = await requestsResponse.json();
    const requests = requestsPayload.requests || [];

    renderStockDashboardStats(statsPayload.stats || {});
    renderStockDashboardRequests(requests);
    stockDashboardProcessNotifications(requests, { fromPoll });
    if (!silent) {
      stockDashboardStatus.textContent = `Updated ${stockDashboardFormatDateTime(new Date().toISOString())}`;
    }
  } catch {
    stockDashboardStatus.textContent = "Could not load dashboard data.";
    if (stockDashboardRequestList) {
      stockDashboardRequestList.innerHTML = '<p class="stock-dashboard-empty">The local backend is not available yet.</p>';
    }
  } finally {
    if (!silent) {
      stockDashboardSetBusy(false);
    }
  }
}

async function updateStockDashboardRequestStatus(requestId, status) {
  if (!requestId || !status || !stockDashboardStatus || !stockDashboardSession) return;

  stockDashboardStatus.textContent = `Updating ${requestId}...`;

  try {
    const response = await fetch(`/api/stock-requests/${encodeURIComponent(requestId)}/status`, {
      method: "PATCH",
      headers: stockDashboardGetHeaders(true),
      body: JSON.stringify({ status })
    });

    if (response.status === 401) {
      stockDashboardSetSession("", null);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not update request status");
    }

    await loadStockDashboard();
  } catch {
    stockDashboardStatus.textContent = `Could not update ${requestId}.`;
  }
}

async function checkStockDashboardSession() {
  if (!stockDashboardToken) {
    stockDashboardSetSession("", null);
    return;
  }

  try {
    const response = await fetch(STOCK_DASHBOARD_SESSION_URL, {
      cache: "no-store",
      headers: stockDashboardGetHeaders()
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.authenticated || !payload?.user) {
      stockDashboardSetSession("", null);
      return;
    }

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
  stockDashboardSendAuthRequest(STOCK_DASHBOARD_LOGIN_URL);
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

stockDashboardAuthForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  stockDashboardSendAuthRequest(STOCK_DASHBOARD_LOGIN_URL);
});

stockDashboardCreateUserForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  createStockDashboardUser();
});

checkStockDashboardSession();
