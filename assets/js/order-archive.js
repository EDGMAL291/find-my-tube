(function (root, factory) {
  const policy = factory();
  if (typeof module === "object" && module.exports) module.exports = policy;
  else root.FMT_ORDER_ARCHIVE = policy;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const inactivityMs = 14 * 24 * 60 * 60 * 1000;
  function lastActivity(request) {
    const history = request?.statusHistory || request?.status_history || [];
    const candidates = [request?.updatedAt, request?.updated_at,
      request?.statusUpdatedAt, request?.createdAt, request?.created_at,
      request?.submittedAt, request?.submitted_at, request?.cancelledAt,
      request?.cancelled_at, request?.inventoryDeductedAt];
    for (const entry of Array.isArray(history) ? history : []) {
      candidates.push(entry?.updatedAt, entry?.timestamp);
    }
    const times = candidates.filter(Boolean).map(value => Date.parse(value)).filter(Number.isFinite);
    return times.length ? Math.max(...times) : null;
  }
  function isInactive(request, now = Date.now()) {
    const activity = lastActivity(request);
    return activity !== null && now - activity >= inactivityMs;
  }
  function isArchived(request, now = Date.now()) {
    return ["collected", "completed", "sent", "no-stock"].includes(request?.status)
      || isInactive(request, now);
  }
  return Object.freeze({ inactivityMs, lastActivity, isInactive, isArchived });
});
