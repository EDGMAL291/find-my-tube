const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => {
        if (error.message !== 'Transition was aborted because of invalid state. ViewTransition opt-in disabled') errors.push(error.message);
      });
      await page.route('**/api/**', route => route.fulfill({ json: { requests: [], items: [] } }));
      await page.goto(`${base}/index.html`);
      await page.locator('#homeLabPanorama img').evaluate(image => image.decode());
      assert.equal(await page.locator('#homeLabPanorama').getAttribute('data-lab-focus'), 'overview');
      assert.match(await page.locator('#homeLabPanorama img').getAttribute('style'), /scale\(1\)/);
      const imageSource = await page.locator('#homeLabPanorama img').getAttribute('src');
      for (const [index, focus] of [[1, 'tubes'], [2, 'tests'], [3, 'stock'], [0, 'overview']]) {
        await page.locator('[data-hero-dot]').nth(index).click();
        await page.waitForFunction(focus => document.querySelector('#homeLabPanorama').dataset.labFocus === focus, focus);
        assert.equal(await page.locator('#homeLabPanorama img').getAttribute('src'), imageSource, 'Every section uses the same room');
        assert.equal(await page.locator('[data-hero-slide]:not(.is-active)').evaluateAll(slides => slides.every(slide => slide.inert)), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      }
      assert.ok(await page.locator('#homeLabPanorama img').evaluate(image => parseFloat(getComputedStyle(image).transitionDuration) < .01));
      await page.locator('#homeHeroCarousel').evaluate(carousel => {
        const touch = x => new Touch({ identifier: 1, target: carousel, screenX: x, screenY: 200 });
        carousel.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [touch(300)] }));
        carousel.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(100)] }));
      });
      await page.waitForFunction(() => document.querySelector('#homeLabPanorama').dataset.labFocus === 'tubes');
      await page.locator('#homeHeroCarousel').dispatchEvent('wheel', { deltaX: 100, deltaY: 0 });
      await page.waitForFunction(() => document.querySelector('#homeLabPanorama').dataset.labFocus === 'tests');

      await page.goto(`${base}/find-my-tube.html`);
      await page.waitForFunction(() => document.querySelector('.lab-world-scene').dataset.labFocus === 'tubes');
      await page.locator('#searchInput').fill('HIV');
      await page.locator('[data-test-name="HIV ELISA"] .discovery-select').click();
      await page.locator('#selectionCartBar').click();
      await page.waitForFunction(() => document.querySelector('#drawModal .lab-modal-scene').dataset.labFocus === 'plan');
      assert.equal(await page.locator('#drawModal img.lab-scene-camera').getAttribute('src'), imageSource);
      await page.locator('#closeDrawPlannerBtn').click();
      await page.waitForFunction(() => document.querySelector('.lab-world-scene').dataset.labFocus === 'tubes');

      for (const [route, focus] of [['index.html?tool=find-my-test', 'tests'], ['order-stock.html', 'stock'], ['track-orders.html', 'dispatch'], ['stock-dashboard.html', 'operations']]) {
        await page.goto(`${base}/${route}`);
        await page.waitForFunction(focus => document.querySelector('.lab-world-scene').dataset.labFocus === focus, focus);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS lab panorama ${width}px: whole overview, shared zoom areas, Tube Plan, reduced motion and tool routes`);
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'no-preference' });
    await page.goto(`${base}/index.html`);
    assert.equal(await page.locator('#homeLabPanorama img').evaluate(image => getComputedStyle(image).transitionDuration), '1.2s');
    await page.locator('[data-hero-dot]').nth(2).click();
    await page.waitForFunction(() => document.querySelector('#homeLabPanorama').dataset.labFocus === 'tests');
    await page.locator('[data-hero-dot]').nth(0).click();
    await page.waitForFunction(() => document.querySelector('#homeLabPanorama').dataset.labFocus === 'overview');
    await page.close();
    console.log('PASS lab panorama animated navigation and return to overview');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
