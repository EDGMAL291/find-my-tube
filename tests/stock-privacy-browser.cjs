const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let signedIn = true, inventoryRequests = 0, holdNextInventory = false, releaseInventory, inventoryRequestReached, releaseLogout;
      const inventory = { summary: [{ key: 'yellowTubes', label: 'Yellow tubes', onHand: 987654 }], recentReceipts: [] };
      await page.addInitScript(() => sessionStorage.setItem('fmt-stock-lab-session-token', 'browser-fixture-session'));
      await page.route('**/api/**', async route => {
        const pathname = new URL(route.request().url()).pathname;
        let payload = { ok: true, requests: [], stats: {} };
        if (pathname === '/api/stock-inventory' || pathname === '/api/lab/stock-inventory') {
          inventoryRequests += 1;
          if (holdNextInventory) {
            holdNextInventory = false;
            inventoryRequestReached();
            await new Promise(resolve => { releaseInventory = resolve; });
          }
          payload = { ...inventory, inventoryVisibility: 'staff' };
        }
        if (pathname === '/api/stock-auth/session') payload = { authenticated: signedIn, setupRequired: false,
          ...(signedIn ? { user: { userNumber: '12345', displayName: 'Fixture Lab User', role: 'medical-technologist' } } : {}) };
        if (pathname === '/api/stock-auth/logout') {
          signedIn = false;
          await new Promise(resolve => { releaseLogout = resolve; });
        }
        await route.fulfill({ json: payload });
      });
      await page.goto(`${base}/order-stock.html`);
      await page.locator('.stock-order-item-card').nth(21).waitFor({ state: 'attached' });
      assert.equal(inventoryRequests, 0, 'Public ordering never requests balances, even with a lab session');
      assert.equal(await page.locator('.stock-order-card-availability:visible').count(), 0);
      assert.ok((await page.locator('.stock-order-card-availability').allTextContents()).every(text => text === ''));
      const yellow = page.locator('[data-stock-unified-tube="yellow"]');
      await yellow.locator('[data-stock-card-toggle]').click();
      await yellow.locator('[data-stock-unified-step="1"]').click();
      const payload = await page.evaluate(() => buildStockOrderPayload());
      assert.ok(payload.items.length > 0);
      for (const item of payload.items) {
        for (const key of ['stockOnHand','stockStatus','stockStatusLabel','lowStockThreshold']) assert.equal(Object.hasOwn(item, key), false, key);
      }
      assert.doesNotMatch(payload.requestText, /on hand|no stock available|987654/i);
      // Legacy request metadata must not reveal inventory in the public Details dialog.
      await page.evaluate(() => showStockRequestDetails({ id: 'privacy-fixture', requestedBy: 'Test', wardUnit: 'ICU', status: 'pending', items: [{ id: 'yellow', label: 'Yellow tubes', quantity: 1, unitType: 'tray', stockOnHand: 987654, stockStatus: 'low-stock' }] }));
      assert.equal(await page.locator('#stockRequestDetailsModal .stock-status-badge').count(), 0);
      assert.doesNotMatch(await page.locator('#stockRequestDetailsBody').innerText(), /987654/);
      await page.goto(`${base}/stock-dashboard.html`);
      await page.waitForFunction(() => stockDashboardSession && stockDashboardDatasets.inventorySummary.some(row => row.onHand === 987654));
      assert.equal(await page.locator('#stockDashboardInventoryCard').isVisible(), true);
      assert.match(await page.locator('#stockDashboardInventoryList').innerText(), /987654 left/);
      holdNextInventory = true;
      const requestReached = new Promise(resolve => { inventoryRequestReached = resolve; });
      await page.evaluate(() => { window.privacyInventoryPending = loadStockInventory(); });
      await requestReached;
      assert.ok(releaseInventory, 'A request is genuinely pending before logout');
      await page.locator('#stockDashboardLogoutBtn').click();
      await page.waitForFunction(() => !stockDashboardSession && stockDashboardLogoutInProgress);
      assert.equal(await page.locator('#stockDashboardInventoryCard').isVisible(), false);
      assert.equal(await page.locator('#stockDashboardInventoryList').innerHTML(), '');
      assert.equal(await page.evaluate(() => stockDashboardDatasets.inventorySummary.length), 0);
      releaseInventory();
      await page.evaluate(() => window.privacyInventoryPending);
      assert.equal(await page.evaluate(() => stockDashboardDatasets.inventorySummary.length), 0, 'A late response cannot restore balances after logout');
      assert.equal(await page.locator('#stockDashboardInventoryList').innerHTML(), '');
      assert.ok(releaseLogout);
      const reloaded = page.waitForEvent('load');
      releaseLogout();
      await reloaded;
      await page.waitForFunction(() => typeof stockDashboardSession !== 'undefined' && !stockDashboardSessionRestorePending);
      assert.equal(await page.locator('#stockDashboardInventoryCard').isVisible(), false);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS ${width}px: dashboard-only balances, clean public payload/details, logout clears balances and ignores late responses`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
