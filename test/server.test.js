const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  server,
  getStaticFilePath,
  isAllowedOrigin,
  slugifyStatus,
  performAtomicStockTransition,
  normalizeStatusHistory,
  toPublicStockRequest,
  validateContactExtension,
  isAllowedStockStatusTransition,
  sanitizeStockRequestPayload,
  sanitizeStockReceiptPayload,
  validateStockRequestItems,
  validateStockReceiptPayload
} = require("../server");
const stockCatalog = require("../assets/js/stock-catalog-data.js");

test("server derives tray inventory units from the canonical catalogue", () => {
  const payload = sanitizeStockRequestPayload({
    requestedBy: "Tester",
    wardUnit: "ICU",
    items: [{
      id: "yellow-tubes-tray",
      label: "Spoofed label",
      quantity: 2,
      unitType: "each",
      traySize: 1,
      inventoryUnits: 1
    }]
  });

  assert.equal(payload.items[0].label, "Yellow (Gel) tubes");
  assert.equal(payload.items[0].unitType, "tray");
  assert.equal(payload.items[0].traySize, 100);
  assert.equal(payload.items[0].inventoryUnits, 200);
  assert.equal(payload.totalRequestedQuantity, 200);
});

test("stock request validation rejects unknown, fractional, and excessive quantities", () => {
  assert.match(validateStockRequestItems([{ id: "unknown", quantity: 1 }]), /not in the current stock catalogue/i);
  assert.match(validateStockRequestItems([{ id: "specimen-jars", quantity: 1.5 }]), /whole-number/i);
  assert.match(validateStockRequestItems([{ id: "pink-tubes-single", quantity: 6 }]), /limited to 5/i);
  assert.equal(validateStockRequestItems([{ id: "pink-tubes-single", quantity: 5 }]), "");
});

test("receipt validation and normalization use catalogue packet sizes", () => {
  const raw = { items: [{ id: "lab-bags", quantity: 2, inventoryUnits: 2 }] };
  assert.equal(validateStockReceiptPayload(raw), "");
  const payload = sanitizeStockReceiptPayload(raw);
  assert.equal(payload.items[0].packetSize, 50);
  assert.equal(payload.items[0].inventoryUnits, 100);
  assert.equal(payload.totalReceivedQuantity, 100);
});

test("legacy individual green and black needle records keep their original units", () => {
  const greenNeedle = stockCatalog.getItem("vacutainer-needle-green");
  const blackNeedle = stockCatalog.getItem("vacutainer-needle-black");
  assert.equal(greenNeedle.label, "Vacutainer needle (Green)");
  assert.equal(blackNeedle.label, "Vacutainer needle (Black)");
  assert.equal(greenNeedle.unitType, "each");
  assert.equal(blackNeedle.unitType, "each");
  assert.equal(validateStockRequestItems([{ id: greenNeedle.id, quantity: 10 }, { id: blackNeedle.id, quantity: 10 }]), "");
  const payload = sanitizeStockRequestPayload({ items: [
    { id: greenNeedle.id, label: "Spoofed", quantity: 2 },
    { id: blackNeedle.id, label: "Spoofed", quantity: 3 }
  ] });
  assert.deepEqual(payload.items.map((item) => item.label), [greenNeedle.label, blackNeedle.label]);
  assert.equal(payload.totalRequestedQuantity, 5);
});

test("new needle packs and bag packs contain 50 units while bottles and legacy needles stay individual", () => {
  for (const color of ["green", "black"]) {
    const pack = stockCatalog.getItem(`vacutainer-needle-${color}-pack`);
    const old = stockCatalog.getItem(`vacutainer-needle-${color}`);
    assert.equal(old.orderable, false, "Legacy IDs are retained for historical requests and older clients");
    assert.equal(pack.unitType, "packet");
    assert.equal(pack.packetSize, 50);
    const payload = sanitizeStockRequestPayload({ items: [{ id: pack.id, quantity: 2, packetSize: 1, inventoryUnits: 2 }] });
    assert.equal(payload.items[0].inventoryUnits, 100, "The server derives units instead of trusting browser counts");
    assert.equal(payload.items[0].sheetColumnKey, old.id, "Packs use the existing needle inventory balance");
    assert.equal(payload.items[0].formattedQuantity, "2 packs (100 needles)");
    assert.equal(sanitizeStockRequestPayload({ items: [{ id: old.id, quantity: 2 }] }).totalRequestedQuantity, 2);
    assert.equal(sanitizeStockReceiptPayload({ items: [{ id: pack.id, quantity: 2 }] }).totalReceivedQuantity, 100);
  }
  const bags = stockCatalog.getItem("lab-bags");
  assert.equal(stockCatalog.formatQuantity(bags, 2), "2 packs (100 bags)");
  for (const bottle of stockCatalog.items.filter(item => item.id.startsWith("blood-culture-bottle-"))) {
    assert.equal(bottle.unitType, "each");
    assert.equal(stockCatalog.getInventoryUnits(bottle, 2), 2);
    assert.equal(stockCatalog.formatQuantity(bottle, 2), "2 each");
  }
  assert.equal(require('../server').getItemInventoryUnits({ unitType: 'each', quantity: 2, inventoryUnits: 2 }), 2);
});

test("order status transitions preserve the clinical work queue", () => {
  assert.equal(slugifyStatus("packed"), "ready");
  assert.equal(slugifyStatus("processing"), "ready");
  assert.equal(isAllowedStockStatusTransition("pending", "ready"), true);
  assert.equal(isAllowedStockStatusTransition("pending", "packed"), true);
  assert.equal(isAllowedStockStatusTransition("packed", "collected"), true);
  assert.equal(isAllowedStockStatusTransition("packed", "completed"), true);
  assert.equal(isAllowedStockStatusTransition("packed", "pending"), false);
  assert.equal(isAllowedStockStatusTransition("pending", "completed"), false);
  assert.equal(isAllowedStockStatusTransition("ready", "collected"), true);
  assert.equal(isAllowedStockStatusTransition("completed", "pending"), false);
});

test("static file resolver exposes only public app files and assets", () => {
  assert.equal(path.basename(getStaticFilePath("/index.html")), "index.html");
  assert.equal(path.basename(getStaticFilePath("/assets/css/modern.css")), "modern.css");
  assert.equal(getStaticFilePath("/contact-feedback.html"), "");
  assert.equal(getStaticFilePath("/server.js"), "");
  assert.equal(getStaticFilePath("/.git/config"), "");
  assert.equal(getStaticFilePath("/supabase/migrations/20260419_stock_dashboard.sql"), "");
  assert.equal(getStaticFilePath("/%2e%2e/server.js"), "");
});

test("CORS allowlist accepts production and local development only", () => {
  assert.equal(isAllowedOrigin("https://findmytube.co.za"), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:3000"), true);
  assert.equal(isAllowedOrigin("https://malicious.example"), false);
});


test("legacy packed collection uses Ready before the atomic collection RPC", async () => {
  const calls = [];
  const result = await performAtomicStockTransition(async args => {
    calls.push(args.p_next_status);
    if (calls.length === 1) return { data: { ok: false, error: "invalid-transition", previousStatus: "packed" } };
    return { data: { ok: true } };
  }, { p_request_id: "legacy-order", p_next_status: "collected" });
  assert.deepEqual(calls, ["collected", "ready", "collected"]);
  assert.equal(result.data.ok, true);
});

test("atomic transition compatibility preserves shortages and promotion failures", async () => {
  for (const failure of [
    { data: { ok: false, error: "insufficient-stock" } },
    { error: { message: "Database unavailable" } }
  ]) {
    let calls = 0;
    const result = await performAtomicStockTransition(async () => { calls += 1; return failure; }, { p_next_status: "collected" });
    assert.equal(calls, 1);
    assert.equal(result, failure);
  }
  let calls = 0;
  const denied = { data: { ok: false, error: "invalid-transition", previousStatus: "cancelled" } };
  const result = await performAtomicStockTransition(async () => {
    calls += 1;
    return calls === 1 ? { data: { error: "invalid-transition", previousStatus: "packed" } } : denied;
  }, { p_next_status: "collected" });
  assert.equal(calls, 2);
  assert.equal(result, denied);
});


test("reading legacy status history retains the recorded Packed event", () => {
  const history = [{ status: "packed", updatedAt: "2026-10-08T10:02:00Z", updatedBy: "12345" }];
  assert.deepEqual(normalizeStatusHistory(history), history);
});


test("public order projection excludes private contact numbers", () => {
  const request = { id: "order-one", contactExtension: "1234", requestedBy: "Test Nurse", wardUnit: "ICU", status: "ready" };
  const publicRequest = toPublicStockRequest(request);
  assert.equal(Object.hasOwn(publicRequest, "contactExtension"), false);
  assert.equal(request.contactExtension, "1234", "staff records retain the private field");
  assert.equal(publicRequest.status, "ready");
});

test("extensions support phone and speed dial characters while rejecting invalid input", () => {
  for (const contact of ["", "1234", "+27 (21) 799-6290", "*123#"]) assert.equal(validateContactExtension(contact), true);
  for (const contact of ["1234<script>", "x".repeat(25), "1234@example.com"]) assert.equal(validateContactExtension(contact), false);
  const payload = sanitizeStockRequestPayload({ contactExtension: " 1234 " });
  assert.equal(payload.contactExtension, "1234");
});


test("signed-out inventory requests return no balances without requiring database access", async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/stock-inventory`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { summary: [], inventoryVisibility: "private" });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
