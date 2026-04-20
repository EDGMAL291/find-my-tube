(function initTrackOrdersPage() {
  if (document.body?.dataset?.appPage !== "track-orders") return;

  const table = document.getElementById("trackOrdersTable");
  const meta = document.getElementById("trackOrdersMeta");
  const count = document.getElementById("trackOrdersCount");
  const form = document.getElementById("trackOrdersFiltersForm");
  const refreshBtn = document.getElementById("trackOrdersRefreshBtn");
  const clearBtn = document.getElementById("trackOrdersClearFiltersBtn");
  const requestIdInput = document.getElementById("trackOrdersRequestIdInput");
  const requestedByInput = document.getElementById("trackOrdersRequestedByInput");
  const wardInput = document.getElementById("trackOrdersWardInput");
  const statusSelect = document.getElementById("trackOrdersStatusSelect");

  if (!table || !meta || !count || !requestIdInput || !requestedByInput || !wardInput || !statusSelect) return;

  const params = new URLSearchParams(window.location.search || "");
  const highlightedRequestId = String(params.get("requestId") || "").trim().toLowerCase();
  let trackOrders = [];
  let pollTimer = 0;

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
    return safe || "received";
  }

  function getStatusMeta(status) {
    const safe = normalizeStatus(status);
    if (safe === "received") return { key: "received", label: "Submitted", stage: "submitted" };
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

  function getItemsSummary(items) {
    const safeItems = Array.isArray(items) ? items : [];
    if (!safeItems.length) return "No items listed";

    const labels = safeItems.slice(0, 3).map((item) => {
      const label = String(item?.label || "Stock item").trim();
      const quantity = String(item?.formattedQuantity || item?.quantity || "").trim();
      return quantity ? `${label}: ${quantity}` : label;
    });

    if (safeItems.length > 3) {
      labels.push(`+${safeItems.length - 3} more`);
    }

    return labels.join(" | ");
  }

  function getApiUrl() {
    if (typeof buildStockApiUrl === "function") {
      return buildStockApiUrl("/api/stock-requests?limit=250");
    }
    return `${window.location.origin}/api/stock-requests?limit=250`;
  }

  function filteredOrders() {
    const requestIdFilter = String(requestIdInput.value || "").trim().toLowerCase();
    const requestedByFilter = String(requestedByInput.value || "").trim().toLowerCase();
    const wardFilter = String(wardInput.value || "").trim().toLowerCase();
    const statusFilter = normalizeStatus(statusSelect.value || "");

    return trackOrders.filter((order) => {
      const id = String(order?.id || "").trim().toLowerCase();
      const requestedBy = String(order?.requestedBy || "").trim().toLowerCase();
      const ward = String(order?.wardUnit || "").trim().toLowerCase();
      const normalizedStatus = normalizeStatus(order?.status);

      if (requestIdFilter && !id.includes(requestIdFilter)) return false;
      if (requestedByFilter && !requestedBy.includes(requestedByFilter)) return false;
      if (wardFilter && !ward.includes(wardFilter)) return false;
      if (statusFilter && normalizedStatus !== statusFilter) return false;
      return true;
    });
  }

  function renderRows() {
    const rows = filteredOrders();

    count.textContent = `${rows.length} request${rows.length === 1 ? "" : "s"}`;

    if (!rows.length) {
      table.innerHTML = '<p class="stock-dashboard-empty">No matching requests found for these filters.</p>';
      return;
    }

    const header = `
      <div class="track-orders-header" role="row">
        <span>Request ID</span>
        <span>Requested by</span>
        <span>Ward / Unit</span>
        <span>Date / Time</span>
        <span>Items requested</span>
        <span>Status</span>
      </div>
    `;

    const body = rows.map((request) => {
      const statusMeta = getStatusMeta(request?.status);
      const requestId = String(request?.id || "Request");
      const isHighlighted = highlightedRequestId && requestId.toLowerCase() === highlightedRequestId;
      return `
        <div class="track-orders-row${isHighlighted ? " is-highlighted" : ""}" role="row">
          <span class="track-orders-cell" data-label="Request ID">${escapeHtml(requestId)}</span>
          <span class="track-orders-cell" data-label="Requested by">${escapeHtml(request?.requestedBy || "Unknown requester")}</span>
          <span class="track-orders-cell" data-label="Ward / Unit">${escapeHtml(request?.wardUnit || "Ward not set")}</span>
          <span class="track-orders-cell" data-label="Date / Time">${escapeHtml(formatDateTime(request?.createdAt || request?.submittedAt))}</span>
          <span class="track-orders-cell" data-label="Items requested">${escapeHtml(getItemsSummary(request?.items))}</span>
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
      renderRows();
      meta.textContent = `Live updates every 20 seconds. Last refresh: ${formatDateTime(new Date().toISOString())}.`;
    } catch (error) {
      table.innerHTML = '<p class="stock-dashboard-empty">Tracking is unavailable right now. Please refresh and try again.</p>';
      meta.textContent = error instanceof Error ? error.message : "Tracking is unavailable right now.";
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  function applyQueryParamsToFilters() {
    const requestId = String(params.get("requestId") || "").trim();
    const requestedBy = String(params.get("requestedBy") || "").trim();
    const ward = String(params.get("ward") || "").trim();
    const status = normalizeStatus(params.get("status") || "");

    if (requestId) requestIdInput.value = requestId;
    if (requestedBy) requestedByInput.value = requestedBy;
    if (ward) wardInput.value = ward;
    if (status && ["received", "ready", "collected", "cancelled"].includes(status)) {
      statusSelect.value = status;
    }
  }

  applyQueryParamsToFilters();

  form?.addEventListener("input", () => {
    renderRows();
  });

  refreshBtn?.addEventListener("click", () => {
    loadOrders();
  });

  clearBtn?.addEventListener("click", () => {
    requestIdInput.value = "";
    requestedByInput.value = "";
    wardInput.value = "";
    statusSelect.value = "";
    renderRows();
  });

  pollTimer = window.setInterval(() => {
    loadOrders({ silent: true });
  }, 20000);

  window.addEventListener("beforeunload", () => {
    window.clearInterval(pollTimer);
  });

  loadOrders();
})();
