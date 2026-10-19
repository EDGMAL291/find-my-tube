const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      let submittedPayload;
      let rejectExtension = false;
      await page.route('**/api/**', route => {
        if (route.request().method() === 'POST' && route.request().url().includes('/stock-requests')) {
          submittedPayload = route.request().postDataJSON();
          if (rejectExtension && submittedPayload.contactExtension) {
            return route.fulfill({ status: 503, json: { ok: false, code: 'contact_storage_unavailable', error: 'Contact storage unavailable' } });
          }
          return route.fulfill({ json: { ok: true, request: { id: 'STK-CART-TEST', status: 'pending' } } });
        }
        return route.fulfill({ json: { requests: [], items: [] } });
      });
      await page.goto(`${base}/order-stock.html`);
      await page.locator('[data-stock-unified-tube="yellow"] [data-stock-card-toggle]').click();
      await page.locator('[data-stock-unified-tube="yellow"] [data-stock-unified-step="1"]').click();
      assert.equal(await page.locator('#stockCartBar').isVisible(), true);
      assert.match(await page.locator('#stockCartCount').innerText(), /^1 item/);

      await page.locator('#openStockCartBtn').click();
      assert.equal(await page.locator('#stockOrderCartDialog').evaluate(dialog => dialog.open), true);
      assert.equal(await page.locator('#stockCartPreviewSlot #stockOrderSummaryItems .stock-order-selected-card').count(), 1);
      await page.locator('#stockOrderRequesterNameInput').fill('Capt Test');
      const ward = await page.locator('#stockOrderRequesterSelect option').nth(1).getAttribute('value');
      await page.locator('#stockOrderRequesterSelect').selectOption(ward);
      await page.locator('#stockOrderExtensionInput').fill('1234');
      assert.equal(await page.locator('#submitStockOrderBtn').isEnabled(), true);

      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#stockOrderCartDialog').evaluate(dialog => dialog.open), false);
      assert.equal(await page.locator('#stockOrderRequesterNameInput').inputValue(), 'Capt Test');
      await page.locator('#openStockCartBtn').click();
      await page.locator('#submitStockOrderBtn').click();
      await page.locator('#stockOrderSubmissionCard:visible').waitFor();
      assert.equal(await page.locator('#stockOrderSubmissionRequestId').innerText(), 'STK-CART-TEST');
      assert.equal(submittedPayload.contactExtension, '1234');
      assert.equal(submittedPayload.items.length, 1);
      assert.equal(await page.locator('#stockCartBar').isVisible(), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

      rejectExtension = true;
      if (!await page.locator('[data-stock-unified-tube="yellow"] [data-stock-unified-step="1"]').isVisible()) {
        await page.locator('[data-stock-unified-tube="yellow"] [data-stock-card-toggle]').click();
      }
      await page.locator('[data-stock-unified-tube="yellow"] [data-stock-unified-step="1"]').click();
      await page.locator('#openStockCartBtn').click();
      await page.locator('#stockOrderRequesterNameInput').fill('Capt Test');
      await page.locator('#stockOrderRequesterSelect').selectOption(ward);
      await page.locator('#stockOrderExtensionInput').fill('1234');
      await page.locator('#submitStockOrderBtn').click();
      await page.locator('#stockOrderRequestMeta').filter({ hasText: /Your order was not saved because the extension could not be stored/ }).waitFor();
      assert.equal(await page.locator('#stockOrderCartDialog').evaluate(dialog => dialog.open), true);
      assert.equal(await page.locator('#stockOrderExtensionInput').inputValue(), '1234');
      assert.equal(await page.locator('#stockCartPreviewSlot #stockOrderSummaryItems .stock-order-selected-card').count(), 1);
      await page.locator('#stockOrderExtensionInput').fill('');
      await page.locator('#submitStockOrderBtn').click();
      await page.locator('#stockOrderSubmissionCard:visible').waitFor();
      assert.equal(submittedPayload.contactExtension, '');
      assert.equal(await page.locator('#stockOrderCartDialog').evaluate(dialog => dialog.open), false);
      await page.close();
      console.log(`PASS stock cart ${width}px: select, review, retain details, submit, confirmation, recover from unavailable contact storage`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
