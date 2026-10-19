const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [390,1280]) {
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      let submitted;
      await page.route('**/api/**',route=>{
        if(route.request().method()==='POST') {
          submitted=route.request().postDataJSON();
          return route.fulfill({json:{ok:true,request:{id:'QUANTITY-FIXTURE',status:'pending'}}});
        }
        return route.fulfill({json:{requests:[],items:[],summary:[],inventoryVisibility:'private'}});
      });
      await page.goto(`${base}/order-stock.html`);
      assert.equal(await page.locator('[data-stock-item="vacutainer-needle-green"]').count(),0,'Legacy individual needles are not offered to new orders');
      for(const [id,unit] of [['lab-bags','50 per pack'],['vacutainer-needle-green-pack','50 per pack'],['blood-culture-bottle-aerobic','Each']]) {
        const card=page.locator(`[data-stock-item="${id}"]`);
        assert.equal((await card.locator('.stock-order-item-kicker').innerText()).toLowerCase(),unit.toLowerCase());
        await card.locator('[data-stock-card-toggle]').click();
        assert.equal(await card.locator('.stock-order-item-kicker').isVisible(),true,'Unit remains visible while setting the amount');
        await card.locator('[data-stock-qty-direction="1"]').click();
        await card.locator('[data-stock-qty-direction="1"]').click();
      }
      await page.locator('#openStockCartBtn').click();
      const summary=await page.locator('#stockOrderSummaryItems').innerText();
      assert.match(summary,/2 packs \(100 bags\)/);
      assert.match(summary,/2 packs \(100 needles\)/);
      assert.match(summary,/2 each/);
      await page.locator('#stockOrderRequesterNameInput').fill('Quantity Fixture');
      await page.locator('#stockOrderRequesterSelect').selectOption({index:1});
      await page.screenshot({path:`/tmp/fmt-stock-units-${width}.png`});
      await page.locator('#submitStockOrderBtn').click();
      await page.locator('#stockOrderSubmissionCard:visible').waitFor();
      assert.equal(submitted.totalRequestedQuantity,202);
      assert.equal(submitted.items.find(i=>i.id==='vacutainer-needle-green-pack').inventoryUnits,100);
      assert.equal(submitted.items.find(i=>i.id==='blood-culture-bottle-aerobic').inventoryUnits,2);
      await page.close();
      console.log(`PASS stock units ${width}px: visible packs/each, accurate cart and request units, no legacy quantity reinterpretation`);
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
