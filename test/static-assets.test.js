const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

test("service worker core asset list points to files that exist", () => {
  const source = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  const match = source.match(/const CORE_ASSETS = (\[[\s\S]*?\]);/);
  assert.ok(match, "CORE_ASSETS declaration should exist");
  const assets = vm.runInNewContext(match[1]);
  const missing = assets
    .map((asset) => String(asset).split("?")[0].replace(/^\.\//, ""))
    .filter((asset) => asset && !fs.existsSync(path.join(root, asset)));
  assert.equal(missing.length, 0, `Missing core assets: ${missing.join(", ")}`);
});

test("every dynamic page loads the shared stock catalogue before the main script", () => {
  const pages = ["index.html", "find-my-tube.html", "order-stock.html", "track-orders.html", "stock-dashboard.html"];
  pages.forEach((page) => {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    const catalogIndex = html.indexOf("assets/js/stock-catalog-data.js");
    const mainIndex = html.indexOf("assets/js/script.js");
    assert.ok(catalogIndex >= 0, `${page} should load the shared stock catalogue`);
    assert.ok(catalogIndex < mainIndex, `${page} should load the catalogue before script.js`);
  });
});

test("cache-busted shell versions are synchronized", () => {
  const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  for (const asset of ['assets/css/modern.css', 'assets/css/discovery.css', 'assets/js/script.js', 'assets/js/stock-catalog-data.js']) {
    const html = fs.readFileSync(path.join(root, 'find-my-tube.html'), 'utf8');
    const versioned = html.match(new RegExp(asset.replaceAll('.', '\\.') + '\\?v=[^"\\s]+'))?.[0];
    assert.ok(versioned, `${asset} must be versioned`);
    assert.ok(worker.includes(versioned), `${asset} version must match the service worker`);
  }
});

test("service worker registrations share the current cache-busting URL", () => {
  const pages = ["index.html", "find-my-tube.html", "order-stock.html", "stock-dashboard.html"];
  const registrations = pages.map((page) => {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    const scriptUrl = html.match(/service-worker\.js\?v=[^"']+/)?.[0];
    assert.ok(scriptUrl, `${page} must register a versioned service worker`);
    return scriptUrl;
  });
  assert.equal(new Set(registrations).size, 1, `Service worker registration versions differ: ${registrations.join(", ")}`);
});

test("all card surfaces use the canonical ten-percent frost", () => {
  const modern = fs.readFileSync(path.join(root, "assets/css/modern.css"), "utf8");
  assert.match(modern, /--fmt-card-frost-background: rgba\(255, 255, 255, \.10\)/);
  assert.match(modern, /--fmt-card-frost-filter: blur\(8px\) saturate\(1\.04\)/);
  [
    ".discovery-card",
    ".draw-modal-card",
    ".draw-result-card",
    ".profile-modal-card",
    ".clinical-workup-test-card",
    ".home-collection-checklist-card",
    ".stock-order-item-card",
    ".stock-order-request-card",
    ".stock-dashboard-session-card",
    ".track-orders-row",
    ".footer-card"
  ].forEach((selector) => assert.ok(modern.includes(selector), `${selector} should use the canonical card frost`));
});
