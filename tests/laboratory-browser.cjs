const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
const stations = {
  home: '/index.html',
  tube: '/find-my-tube.html',
  test: '/index.html?tool=find-my-test',
  plan: '/find-my-tube.html?lab=plan',
  stock: '/order-stock.html',
  track: '/track-orders.html',
  dashboard: '/stock-dashboard.html',
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const [station, route] of Object.entries(stations)) {
        await page.goto(base + route);
        await page.locator('.laboratory-viewport canvas').waitFor();
        assert.equal(await page.locator('.laboratory-nav a').count(), 7);
        assert.equal(await page.locator('.laboratory-nav [aria-current]').getAttribute('data-station'), station);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route);
        if (station === 'plan') {
          await page.locator('.laboratory-plan').click();
          await page.locator('#drawModal').waitFor();
          await page.locator('#closeDrawPlannerBtn').click();
        }
      }

      assert.equal(await page.locator('.laboratory-motion').innerText(), 'Enable motion');
      await page.locator('.laboratory-view').click();
      await page.reload();
      assert.equal(await page.locator('.laboratory-viewport canvas').count(), 0);
      await page.locator('.laboratory-view').click();
      await page.locator('.laboratory-viewport canvas').waitFor();
      await page.locator('.laboratory-nav [data-station="tube"]').click();
      await page.waitForURL('**/find-my-tube.html');
      await page.locator('#searchInput').fill('FBC');
      await page.locator('.discovery-card').first().waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }

    const fallback = await browser.newPage();
    await fallback.route('**/assets/vendor/three/**', route => route.abort());
    await fallback.goto(base + stations.tube);
    await fallback.locator('.laboratory-fallback').waitFor();
    assert.equal(await fallback.locator('.laboratory-viewport canvas').count(), 0);
    await fallback.locator('#searchInput').fill('FBC');
    await fallback.locator('.discovery-card').first().waitFor();
    console.log('PASS 3D stations, planner, navigation, reduced motion and fallback at desktop and mobile sizes');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
