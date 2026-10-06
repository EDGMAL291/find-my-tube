const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  getStaticFilePath,
  isAllowedOrigin,
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

test("green and black Vacutainer needles are canonical orderable stock items", () => {
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

test("order status transitions preserve the clinical work queue", () => {
  assert.equal(isAllowedStockStatusTransition("pending", "packed"), true);
  assert.equal(isAllowedStockStatusTransition("pending", "completed"), false);
  assert.equal(isAllowedStockStatusTransition("ready", "collected"), true);
  assert.equal(isAllowedStockStatusTransition("completed", "pending"), false);
});

test("static file resolver exposes only public app files and assets", () => {
  assert.equal(path.basename(getStaticFilePath("/index.html")), "index.html");
  assert.equal(path.basename(getStaticFilePath("/assets/css/modern.css")), "modern.css");
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
