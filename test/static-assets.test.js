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
  assert.match(worker, /modern\.css\?v=20260930a/);
  assert.match(worker, /script\.js\?v=20260930a/);
  assert.match(worker, /stock-catalog-data\.js\?v=20260930a/);
});
