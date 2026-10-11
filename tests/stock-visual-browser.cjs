const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'fmt-stock-'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [360, 390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      // Keep this visual regression independent of real inventory or deployment state.
      await page.route('**/api/**', route => route.fulfill({ json: { items: [], requests: [] } }));
      await page.goto(`${base}/order-stock.html`);
      await page.locator('.stock-order-item-card').nth(21).waitFor({ state: 'attached' });
      assert.equal(await page.locator('.stock-order-item-card:visible').count(), 22);
      const images = await page.locator('.stock-order-item-card:visible img').evaluateAll(async elements => {
        return Promise.all(elements.map(async image => {
          image.loading = 'eager';
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          const corners = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]];
          return {
            src: image.getAttribute('src'),
            alpha: corners.map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]),
            background: getComputedStyle(image).backgroundColor,
            parentBackground: getComputedStyle(image.parentElement).backgroundColor
          };
        }));
      });
      assert.equal(images.length, 22, 'Every stock item has a photographic cutout');
      for (const image of images) {
        assert.ok(image.alpha.every(alpha => alpha === 0), `Opaque image corners: ${image.src}`);
        assert.equal(image.background, 'rgba(0, 0, 0, 0)', `Image tile: ${image.src}`);
        assert.equal(image.parentBackground, 'rgba(0, 0, 0, 0)', `Wrapper tile: ${image.src}`);
      }
      const yellow = page.locator('[data-stock-unified-tube="yellow"]');
      await yellow.locator('[data-stock-card-toggle]').click();
      await yellow.locator('[data-stock-unified-step="1"]').click();
      assert.equal(await yellow.locator('[data-stock-unified-input]').inputValue(), '1');
      await yellow.locator('[data-stock-mode="each"]').click();
      assert.equal(await yellow.locator('[data-stock-mode="each"]').getAttribute('aria-pressed'), 'true');
      await yellow.locator('[data-stock-unified-step="1"]').click();
      const controls = await page.locator('.stock-catalog-filter, .stock-order-item-trigger, .stock-tube-mode-toggle .group-chip, .stock-order-qty-btn, .stock-order-qty-input, .stock-tube-qty-readout, #stockOrderRequesterSelect').evaluateAll(elements => elements
        .filter(element => element.getClientRects().length)
        .map(element => ({ name: element.id || element.className, background: getComputedStyle(element).backgroundColor })));
      for (const control of controls) assert.equal(control.background, 'rgba(0, 0, 0, 0)', control.name);
      await page.screenshot({ path: path.join(screenshots, `selectors-${width}.png`) });
      for (const filter of ['paediatric', 'cultures', 'supplies']) {
        await page.locator(`[data-stock-filter="${filter}"]`).click();
        await page.locator('.stock-order-item-card:visible').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(screenshots, `${filter}-${width}.png`) });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${filter} overflow at ${width}px`);
      }
      await page.close();
      console.log(`PASS stock ${width}px: 22 transparent product cutouts, clear selectors, quantity controls, filters`);
    }
    console.log(`Screenshots: ${screenshots}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
