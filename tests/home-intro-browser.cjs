const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width,height] of [[360,844],[390,844],[1280,900],[844,390]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      let posts = 0;
      await page.route('**/api/**', route => {
        if (route.request().method() === 'POST') posts++;
        return route.fulfill({ json: { requests: [], items: [] } });
      });
      await page.goto(`${base}/index.html`);
      const intro = page.locator('#homeIntroDialog');
      await page.locator('#homeIntroDialog[open]').waitFor();
      assert.equal(await page.locator('#backHomeIntroBtn').isDisabled(), true);
      for (let step=1;step<=11;step++) {
        await page.locator('#homeIntroProgress').filter({hasText:`${step} of 11`}).waitFor();
        await page.waitForTimeout(180);
        assert.equal(await intro.evaluate(el => el.open), true);
        assert.equal(await page.locator('.site-guide-spotlight').isVisible(), true, `Step ${step} highlights a real visible control`);
        const card = await page.locator('.site-guide-panel').boundingBox();
        const spot = await page.locator('.site-guide-spotlight').boundingBox();
        assert.ok(card.x >= 0 && card.x+card.width <= width+1 && card.y >= 0 && card.y+card.height <= height+1, `Step ${step} panel fits ${width}x${height}`);
        assert.ok(card.y+card.height <= spot.y || card.y >= spot.y+spot.height || card.x+card.width <= spot.x || card.x >= spot.x+spot.width, `Step ${step} explanation does not cover its target`);
        await page.keyboard.press('Tab');
        assert.equal(await intro.evaluate(el => el.contains(document.activeElement)), true);
        assert.equal(await page.evaluate(() => typeof getSelectedTests === 'function' ? getSelectedTests().length : 0), 0, 'Guide adds no tests');
        assert.equal(await page.locator('[data-menu-action="find-my-test"], [data-mobile-menu-action="find-my-test"], [data-bottom-nav="test"]').count(), 0);
        if(step===4) assert.equal(await page.locator('#searchInput').inputValue(),'FBC');
        if(step===5) {
          assert.equal(await page.locator('#searchInput').inputValue(),'');
          assert.equal(await page.locator('#drawModal').isVisible(),true);
          await page.locator('#backHomeIntroBtn').click();
          await page.locator('#homeIntroProgress').filter({hasText:'4 of 11'}).waitFor();
          assert.equal(await page.locator('#drawModal').isVisible(),false);
          await page.locator('#nextHomeIntroBtn').click();
          await page.locator('#homeIntroProgress').filter({hasText:'5 of 11'}).waitFor();
        }
        if(step===7) await page.screenshot({path:`/tmp/fmt-stock-guide-${width}.png`});
        if(step===11) assert.equal(await page.locator('#nextHomeIntroBtn').innerText(),'Finish');
        await page.locator('#nextHomeIntroBtn').click();
      }
      assert.equal(posts,0,'Walkthrough never posts an order');
      assert.equal(await intro.evaluate(el=>el.open),false);
      await page.reload();
      assert.equal(await intro.evaluate(el=>el.open),false,'Completion persists');
      await page.locator('#openHomeIntroBtn').click();
      await page.locator('#nextHomeIntroBtn').click();
      await page.locator('#nextHomeIntroBtn').click();
      await page.locator('#homeIntroProgress').filter({hasText:'3 of 11'}).waitFor();
      await page.locator('#backHomeIntroBtn').click();
      await page.locator('#homeIntroProgress').filter({hasText:'2 of 11'}).waitFor();
      await page.locator('#skipHomeIntroBtn').click();
      await page.reload();
      assert.equal(await intro.evaluate(el=>el.open),false,'Skip persists');
      await page.locator('#openHomeIntroBtn').click();
      await page.keyboard.press('Escape');
      assert.equal(await intro.evaluate(el=>el.open),false);
      assert.equal(await page.locator('#openHomeIntroBtn').evaluate(el=>el===document.activeElement),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.close();
      console.log(`PASS guided walkthrough ${width}x${height}: real targets, cross-page Next/Back, no overlap, no orders/tests added, finish, Skip, Escape, replay and persistence`);
    }
    const page = await browser.newPage();
    await page.goto(`${base}/index.html?tool=find-my-test`);
    assert.equal(await page.locator('#homeIntroDialog').evaluate(el=>el.open),false,'Direct tools are not interrupted');
    await page.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
