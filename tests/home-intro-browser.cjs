const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';

async function swipe(locator, dx, dy = 0) {
  await locator.evaluate((target, { dx, dy }) => {
    const touch = (x, y) => new Touch({ identifier: 1, target, screenX: x, screenY: y });
    target.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [touch(250, 200)] }));
    target.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(250 + dx, 200 + dy)] }));
  }, { dx, dy });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [360, 390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      await page.route('**/api/**', route => route.fulfill({ json: { requests: [], items: [] } }));
      await page.goto(`${base}/index.html`);
      const intro = page.locator('#homeIntroDialog');
      await page.locator('#homeIntroDialog[open]').waitFor();
      assert.equal(await page.locator('#backHomeIntroBtn').isDisabled(), true);
      assert.equal(await page.locator('.home-intro-gesture-dot').evaluate(el => getComputedStyle(el).animationName), 'none');
      const box = await intro.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= 844);
      await page.keyboard.press('Tab');
      assert.equal(await intro.evaluate(el => el.contains(document.activeElement)), true, 'Guide keeps keyboard focus inside');
      await page.locator('#nextHomeIntroBtn').click();
      assert.equal(await page.locator('#homeIntroProgress').innerText(), '2 of 3');
      await page.locator('#backHomeIntroBtn').click();
      await swipe(intro, -140);
      assert.equal(await page.locator('#homeIntroProgress').innerText(), '2 of 3');
      await swipe(intro, 140);
      assert.equal(await page.locator('#homeIntroProgress').innerText(), '1 of 3');
      await page.locator('#nextHomeIntroBtn').click();
      await page.locator('#nextHomeIntroBtn').click();
      assert.equal(await page.locator('#nextHomeIntroBtn').innerText(), 'Get started');
      await page.locator('#nextHomeIntroBtn').click();
      assert.equal(await intro.evaluate(el => el.open), false);
      await page.reload();
      assert.equal(await intro.evaluate(el => el.open), false, 'Completed guide stays dismissed');
      await page.locator('#openHomeIntroBtn').click();
      assert.equal(await page.locator('#homeIntroProgress').innerText(), '1 of 3');
      await page.locator('#skipHomeIntroBtn').click();
      await page.reload();
      assert.equal(await intro.evaluate(el => el.open), false, 'Skipped guide stays dismissed');
      await page.locator('#openHomeIntroBtn').click();
      await page.keyboard.press('Escape');
      assert.equal(await intro.evaluate(el => el.open), false);
      const carousel = page.locator('#homeHeroCarousel');
      await swipe(carousel, -140);
      assert.equal(await carousel.getAttribute('data-hero-tone'), 'lavender');
      await swipe(carousel, -60, 240);
      assert.equal(await carousel.getAttribute('data-hero-tone'), 'lavender', 'Vertical scrolling does not change sections');
      assert.equal(await page.locator('[data-hero-slide]:not(.is-active)').evaluateAll(slides => slides.every(slide => slide.inert)), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (width < 620) assert.equal((await page.locator('.home-hero-swipe-hint').innerText()).replace(/\s+/g, ' '), '↔ Swipe');
      await page.close();
      console.log(`PASS home guide ${width}px: first visit, Next/Back, swipe, complete, Skip, Escape, replay and persistence`);
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${base}/index.html?tool=find-my-test`);
    assert.equal(await page.locator('#homeIntroDialog').evaluate(el => el.open), false);
    assert.equal(await page.locator('.clinical-workup-panel').isVisible(), true);
    await page.goto(`${base}/index.html?tool=collection-desk`);
    assert.equal(await page.locator('#homeIntroDialog').evaluate(el => el.open), false);
    assert.equal(await page.locator('#homeLabDeskPanel').isVisible(), true);
    await page.goto(`${base}/index.html`);
    assert.equal(await page.locator('#homeIntroDialog').evaluate(el => el.open), true, 'Direct tool visits do not consume the first home guide');
    await page.close();
    console.log('PASS direct tool links stay unobstructed');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
