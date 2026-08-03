(function initTrackOrdersPage() {
  if (document.body?.dataset?.appPage !== "track-orders") return;

  const table = document.getElementById("trackOrdersTable");
  const archiveTable = document.getElementById("trackOrdersArchiveTable");
  const meta = document.getElementById("trackOrdersMeta");
  const count = document.getElementById("trackOrdersCount");
  const archiveCount = document.getElementById("trackOrdersArchiveCount");
  const form = document.getElementById("trackOrdersFiltersForm");
  const refreshBtn = document.getElementById("trackOrdersRefreshBtn");
  const clearBtn = document.getElementById("trackOrdersClearFiltersBtn");
  const requestedByInput = document.getElementById("trackOrdersRequestedByInput");
  const wardInput = document.getElementById("trackOrdersWardInput");

  if (!table || !archiveTable || !meta || !count || !archiveCount || !requestedByInput || !wardInput) return;

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

  function getDisplayRequesterName(value) {
    if (typeof formatRequesterName === "function") return formatRequesterName(value);

    const safeValue = String(value || "").trim().replace(/\s+/g, " ");
    if (!safeValue) return "";
    const titleCase = (part) => String(part || "")
      .split(/([-'])/)
      .map((piece) => {
        if (piece === "-" || piece === "'") return piece;
        const lower = piece.toLowerCase();
        return lower ? `${lower.charAt(0).toUpperCase()}${lower.slice(1)}` : "";
      })
      .join("");
    const parts = safeValue.split(" ").filter(Boolean);
    if (parts.length === 1) return titleCase(parts[0]);
    const initials = parts.slice(1, -1)
      .map((part) => {
        const safePart = String(part || "").trim();
        if (!safePart) return "";
        if (/^[A-Za-z]\.$/.test(safePart)) return `${safePart.charAt(0).toUpperCase()}.`;
        if (/^[A-Za-z]{1,3}$/.test(safePart)) return safePart.toUpperCase();
        return titleCase(safePart);
      })
      .filter(Boolean)
      .join(" ");
    return [titleCase(parts[0]), initials, titleCase(parts[parts.length - 1])]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function normalizeStatus(status) {
    const safe = String(status || "").trim().toLowerCase();
    if (safe === "sent") return "completed";
    if (safe === "packed" || safe === "in-progress" || safe === "processing") return "packed";
    if (safe === "received" || safe === "submitted") return "pending";
    if (safe === "no_stock" || safe === "no stock" || safe === "out-of-stock" || safe === "out of stock") return "no-stock";
    return safe || "pending";
  }

  function getStatusMeta(status) {
    const safe = normalizeStatus(status);
    if (safe === "pending") return { key: "pending", label: "Pending", stage: "pending" };
    if (safe === "packed") return { key: "packed", label: "Packed", stage: "processing" };
    if (safe === "ready") return { key: "ready", label: "Ready", stage: "ready" };
    if (safe === "collected") return { key: "collected", label: "Collected", stage: "completed" };
    if (safe === "completed") return { key: "completed", label: "Completed", stage: "completed" };
    if (safe === "no-stock") return { key: "no-stock", label: "No Stock", stage: "no-stock" };
    if (safe === "cancelled") return { key: "cancelled", label: "Cancelled", stage: "cancelled" };
    return {
      key: safe,
      label: safe.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      stage: "pending"
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

  function formatDateOnly(value) {
    if (typeof formatStockRequestDateOnly === "function") return formatStockRequestDateOnly(value);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium"
    }).format(date);
  }

  function getApiUrl() {
    if (typeof buildStockApiUrl === "function") {
      return buildStockApiUrl("/api/stock-requests?limit=250&includeArchived=true");
    }
    return `${window.location.origin}/api/stock-requests?limit=250&includeArchived=true`;
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

  function filterByInputs(rows) {
    const filters = getCurrentFilters();

    return rows.filter((order) => {
      const requestedBy = String(order?.requestedBy || "").trim().toLowerCase();
      const ward = String(order?.wardUnit || "").trim().toLowerCase();

      if (filters.requestedBy && !requestedBy.includes(filters.requestedBy)) return false;
      if (filters.ward && !ward.includes(filters.ward)) return false;

      return true;
    });
  }

  function filteredOrders() {
    const activeOrders = trackOrders.filter((order) => {
      const normalizedStatus = normalizeStatus(order?.status);
      return normalizedStatus !== "collected" && normalizedStatus !== "completed" && normalizedStatus !== "cancelled" && normalizedStatus !== "no-stock";
    });

    return sortByNewestFirst(filterByInputs(activeOrders));
  }

  function filteredArchivedOrders() {
    const archivedOrders = trackOrders.filter((order) => ["collected", "completed", "no-stock"].includes(normalizeStatus(order?.status)));
    return sortByNewestFirst(filterByInputs(archivedOrders));
  }

  function getActiveCount(rows) {
    return rows.filter((row) => {
      const status = normalizeStatus(row?.status);
      return status !== "collected" && status !== "completed" && status !== "cancelled" && status !== "no-stock";
    }).length;
  }

  function buildRowsTable(rows, emptyText) {
    if (!rows.length) {
      return `<p class="stock-dashboard-empty">${escapeHtml(emptyText)}</p>`;
    }

    const header = `
      <div class="track-orders-header" role="row">
        <span>Requested by</span>
        <span>Ward / Unit</span>
        <span>Date</span>
        <span>Status</span>
        <span>Items ordered</span>
      </div>
    `;

    const body = rows.map((request) => {
      const statusMeta = getStatusMeta(request?.status);
      const requestId = String(request?.id || "Request");
      const isHighlighted = highlightedRequestId && requestId.toLowerCase() === highlightedRequestId;
      const detailKey = typeof registerStockRequestForDetails === "function" ? registerStockRequestForDetails(request) : requestId;
      const itemSummary = typeof getStockRequestCompactItemsMarkup === "function"
        ? getStockRequestCompactItemsMarkup(request, 3)
        : '<p class="stock-request-compact-empty">No items listed</p>';
      return `
        <div class="track-orders-row${isHighlighted ? " is-highlighted" : ""}" role="row">
          <span class="track-orders-cell" data-label="Requested by">${escapeHtml(getDisplayRequesterName(request?.requestedBy) || "Unknown requester")}</span>
          <span class="track-orders-cell" data-label="Ward / Unit">${escapeHtml(request?.wardUnit || "Ward not set")}</span>
          <span class="track-orders-cell" data-label="Date">${escapeHtml(formatDateOnly(request?.createdAt || request?.submittedAt))}</span>
          <span class="track-orders-cell" data-label="Status">
            <span class="track-orders-status-badge" data-stage="${escapeHtml(statusMeta.stage)}">${escapeHtml(statusMeta.label)}</span>
          </span>
          <span class="track-orders-cell track-orders-items-cell" data-label="Items ordered">
            ${itemSummary}
            <button type="button" class="quick-tool-clear-btn stock-request-view-btn" data-stock-request-view="${escapeHtml(detailKey)}">View order</button>
          </span>
        </div>
      `;
    }).join("");

    return `<div class="track-orders-grid" role="table">${header}${body}</div>`;
  }

  function renderRows() {
    const rows = filteredOrders();
    const archivedRows = filteredArchivedOrders();
    const filters = getCurrentFilters();

    count.textContent = `${rows.length} active request${rows.length === 1 ? "" : "s"}`;
    archiveCount.textContent = `${archivedRows.length} archived`;
    table.innerHTML = buildRowsTable(rows, "No active requests found for these filters.");
    archiveTable.innerHTML = buildRowsTable(archivedRows, "No completed orders in Archives yet.");

    if (filters.ward) {
      meta.textContent = `Showing requests for ${String(wardInput.value || "").trim()} (${getActiveCount(rows)} active). ${getLastRefreshText()}`.trim();
    }
  }

  async function loadOrders({ silent = false } = {}) {
    table.setAttribute("aria-busy", "true");
    archiveTable.setAttribute("aria-busy", "true");
    if (!silent) {
      meta.textContent = "Loading requests...";
      table.innerHTML = '<div class="stock-loading-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>';
      archiveTable.innerHTML = '<div class="stock-loading-skeleton" aria-hidden="true"><span></span><span></span></div>';
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
      table.setAttribute("aria-busy", "false");
      archiveTable.setAttribute("aria-busy", "false");
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

  table.addEventListener("click", handleStockRequestDetailsClick);
  archiveTable.addEventListener("click", handleStockRequestDetailsClick);

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
