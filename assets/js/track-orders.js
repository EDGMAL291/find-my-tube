(function initTrackOrdersPage() {
  if (document.body?.dataset?.appPage !== "track-orders") return;

  const table = document.getElementById("trackOrdersTable");
  const meta = document.getElementById("trackOrdersMeta");
  const count = document.getElementById("trackOrdersCount");
  const form = document.getElementById("trackOrdersFiltersForm");
  const refreshBtn = document.getElementById("trackOrdersRefreshBtn");
  const clearBtn = document.getElementById("trackOrdersClearFiltersBtn");
  const requestedByInput = document.getElementById("trackOrdersRequestedByInput");
  const wardInput = document.getElementById("trackOrdersWardInput");

  if (!table || !meta || !count || !requestedByInput || !wardInput) return;

  const params = new URLSearchParams(window.location.search || "");
  const highlightedRequestId = String(params.get("requestId") || "").trim().toLowerCase();
  let trackOrders = [];
  let pollTimer = 0;
  let wardFetchDebounceTimer = 0;
  let lastRefreshIso = "";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeStatus(status) {
    const safe = String(status || "").trim().toLowerCase();
    if (safe === "sent" || safe === "completed") return "collected";
    if (safe === "packed" || safe === "in-progress" || safe === "processing") return "ready";
    if (safe === "received") return "submitted";
    return safe || "submitted";
  }

  function getStatusMeta(status) {
    const safe = normalizeStatus(status);
    if (safe === "submitted") return { key: "submitted", label: "Submitted", stage: "submitted" };
    if (safe === "ready") return { key: "ready", label: "Ready for Collection", stage: "ready" };
    if (safe === "collected") return { key: "collected", label: "Collected", stage: "collected" };
    if (safe === "cancelled") return { key: "cancelled", label: "Cancelled", stage: "cancelled" };
    return {
      key: safe,
      label: safe.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      stage: "submitted"
    };
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function getApiUrl() {
    if (typeof buildStockApiUrl === "function") {
      return buildStockApiUrl("/api/stock-requests?limit=250");
    }
    return `${window.location.origin}/api/stock-requests?limit=250`;
  }

  function getCurrentFilters() {
    return {
      requestedBy: String(requestedByInput.value || "").trim().toLowerCase(),
      ward: String(wardInput.value || "").trim().toLowerCase()
    };
  }

  function getLastRefreshText() {
    if (!lastRefreshIso) return "";
    return `Last refresh: ${formatDateTime(lastRefreshIso)}.`;
  }

  function sortByNewestFirst(rows = []) {
    return [...rows].sort((a, b) => {
      const aTime = new Date(a?.createdAt || a?.submittedAt || 0).getTime() || 0;
      const bTime = new Date(b?.createdAt || b?.submittedAt || 0).getTime() || 0;
      return bTime - aTime;
    });
  }

  function filteredOrders() {
    const filters = getCurrentFilters();
    const visibleStatuses = new Set(["submitted", "ready", "collected"]);

    const filtered = trackOrders.filter((order) => {
      const requestedBy = String(order?.requestedBy || "").trim().toLowerCase();
      const ward = String(order?.wardUnit || "").trim().toLowerCase();
      const normalizedStatus = normalizeStatus(order?.status);

      if (filters.requestedBy && !requestedBy.includes(filters.requestedBy)) return false;
      if (filters.ward && !ward.includes(filters.ward)) return false;
      if (!visibleStatuses.has(normalizedStatus)) return false;

      return true;
    });

    return sortByNewestFirst(filtered);
  }

  function getActiveCount(rows) {
    return rows.filter((row) => {
      const status = normalizeStatus(row?.status);
      return status !== "collected" && status !== "cancelled";
    }).length;
  }

  function renderRows() {
    const rows = filteredOrders();
    const filters = getCurrentFilters();

    count.textContent = `${rows.length} request${rows.length === 1 ? "" : "s"}`;

    if (!rows.length) {
      table.innerHTML = '<p class="stock-dashboard-empty">No matching requests found for these filters.</p>';
      if (filters.ward) {
        meta.textContent = `Showing requests for ${String(wardInput.value || "").trim()} (0 active). ${getLastRefreshText()}`.trim();
      }
      return;
    }

    if (filters.ward) {
      meta.textContent = `Showing requests for ${String(wardInput.value || "").trim()} (${getActiveCount(rows)} active). ${getLastRefreshText()}`.trim();
    }

    const header = `
      <div class="track-orders-header" role="row">
        <span>Requested by</span>
        <span>Ward / Unit</span>
        <span>Date</span>
        <span>Status</span>
      </div>
    `;

    const body = rows.map((request) => {
      const statusMeta = getStatusMeta(request?.status);
      const requestId = String(request?.id || "Request");
      const isHighlighted = highlightedRequestId && requestId.toLowerCase() === highlightedRequestId;
      return `
        <div class="track-orders-row${isHighlighted ? " is-highlighted" : ""}" role="row">
          <span class="track-orders-cell" data-label="Requested by">${escapeHtml(request?.requestedBy || "Unknown requester")}</span>
          <span class="track-orders-cell" data-label="Ward / Unit">${escapeHtml(request?.wardUnit || "Ward not set")}</span>
          <span class="track-orders-cell" data-label="Date">${escapeHtml(formatDateTime(request?.createdAt || request?.submittedAt))}</span>
          <span class="track-orders-cell" data-label="Status">
            <span class="track-orders-status-badge" data-stage="${escapeHtml(statusMeta.stage)}">${escapeHtml(statusMeta.label)}</span>
          </span>
        </div>
      `;
    }).join("");

    table.innerHTML = `<div class="track-orders-grid" role="table">${header}${body}</div>`;
  }

  async function loadOrders({ silent = false } = {}) {
    if (!silent) {
      meta.textContent = "Loading requests...";
    }
    if (refreshBtn) refreshBtn.disabled = true;

    try {
      const response = await fetch(getApiUrl(), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not load requests (${response.status})`);
      }

      const payload = await response.json().catch(() => ({}));
      trackOrders = Array.isArray(payload?.requests) ? payload.requests : [];
      lastRefreshIso = new Date().toISOString();
      renderRows();

      if (!String(wardInput.value || "").trim()) {
        meta.textContent = `Live updates every 30 seconds. ${getLastRefreshText()}`.trim();
      }
    } catch (error) {
      table.innerHTML = '<p class="stock-dashboard-empty">Tracking is unavailable right now. Please refresh and try again.</p>';
      meta.textContent = error instanceof Error ? error.message : "Tracking is unavailable right now.";
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  function applyQueryParamsToFilters() {
    const requestedBy = String(params.get("requestedBy") || "").trim();
    const ward = String(params.get("ward") || "").trim();

    if (ward) wardInput.value = ward;
    if (requestedBy) requestedByInput.value = requestedBy;
  }

  applyQueryParamsToFilters();

  form?.addEventListener("input", (event) => {
    renderRows();

    const target = event.target instanceof Element ? event.target : null;
    if (target?.id === "trackOrdersWardInput") {
      window.clearTimeout(wardFetchDebounceTimer);
      wardFetchDebounceTimer = window.setTimeout(() => {
        loadOrders({ silent: true });
      }, 300);
    }
  });

  refreshBtn?.addEventListener("click", () => {
    loadOrders();
  });

  clearBtn?.addEventListener("click", () => {
    wardInput.value = "";
    requestedByInput.value = "";
    renderRows();
  });

  pollTimer = window.setInterval(() => {
    loadOrders({ silent: true });
  }, 30000);

  window.addEventListener("beforeunload", () => {
    window.clearInterval(pollTimer);
    window.clearTimeout(wardFetchDebounceTimer);
  });

  loadOrders();
})();
