const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.FMT_TEST_URL||'http://127.0.0.1:3000';
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [390,1280]) {
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const now=new Date().toISOString();
      const order={id:'AVAIL-BROWSER',requestedBy:'Fixture Nurse',wardUnit:'ICU',status:'pending',createdAt:now,updatedAt:now,contactExtension:'987654',statusHistory:[],availabilityNotice:null,
        items:[{id:'yellow-tubes-tray',label:'Yellow tubes',quantity:1,unitType:'tray',traySize:100},
          {id:'blood-culture-bottle-aerobic',label:'Aerobic bottle',quantity:2,unitType:'each'},
          {id:'swabs-transport-media',label:'Swabs',quantity:2,unitType:'each'},
          {id:'lab-bags',label:'Lab bags',quantity:2,unitType:'packet',packetSize:50}]};
      let failNext=true;let writes=0;
      await page.route('**/api/**',async route=>{
        const request=route.request();const path=new URL(request.url()).pathname;
        if(path.endsWith('/availability')) {
          if(failNext){failNext=false;return route.fulfill({status:503,json:{error:'private database 999999'}});}
          const body=request.postDataJSON();
          assert.equal(body.expectedRevision,order.availabilityNotice?.revision||0);
          assert.deepEqual(Object.keys(body).sort(),['expectedRevision','unavailableItemIds']);
          writes++;
          order.availabilityNotice={unavailableItemIds:body.unavailableItemIds,updatedAt:new Date().toISOString(),revision:writes};
          return route.fulfill({json:{ok:true,request:order}});
        }
        if(path==='/api/stock-auth/session')return route.fulfill({json:{authenticated:true,setupRequired:false,user:{userNumber:'12345',displayName:'Fixture Staff',role:'medical-technologist'}}});
        if(path==='/api/lab/stock-inventory')return route.fulfill({json:{summary:[{key:'lab-bags',label:'Lab bags',onHand:999999}],recentReceipts:[]}});
        if(path==='/api/stock-requests'){
          const {contactExtension,...publicOrder}=order;
          return route.fulfill({json:{requests:[publicOrder]}});
        }
        return route.fulfill({json:{ok:true,requests:[order],activeRequests:[order],stats:{},summary:[],items:[]}});
      });
      await page.goto(`${base}/stock-dashboard.html`);
      await page.waitForFunction(()=>stockDashboardSession && stockDashboardDatasets.stockRequests.length);
      await page.locator('[data-stock-request-view="AVAIL-BROWSER"]').first().click();
      const editor=page.locator('.stock-availability-editor');
      await editor.locator('input[value="lab-bags"]').check();
      await editor.locator('[data-publish-availability]').click();
      await editor.locator('.stock-availability-editor-status').filter({hasText:'The notice could not be confirmed'}).waitFor();
      assert.equal(await editor.locator('input[value="lab-bags"]').isChecked(),true);
      assert.doesNotMatch(await editor.innerText(),/999999/);
      await editor.locator('[data-publish-availability]').click();
      await page.getByText('Notice published to Track Orders.',{exact:true}).waitFor();
      assert.deepEqual(order.availabilityNotice.unavailableItemIds,['lab-bags']);
      assert.equal(order.status,'pending');
      assert.equal(order.items[3].quantity,2);
      await page.screenshot({path:`/tmp/fmt-availability-staff-${width}.png`});

      await page.goto(`${base}/track-orders.html`);
      const row=page.locator('.track-orders-row');
      await row.locator('.stock-availability-notice').waitFor();
      assert.match(await row.locator('.stock-availability-notice').innerText(),/Unavailable: Lab bags/,'A shortage beyond the three-item summary is still visible');
      assert.equal(await page.locator('.stock-availability-editor').count(),0,'Public tracking has no publishing controls');
      assert.doesNotMatch(await page.locator('body').innerText(),/999999|987654/);
      await row.locator('[data-stock-request-view]').click();
      await page.locator('#stockRequestDetailsModal').waitFor({state:'visible'});
      assert.equal(await page.locator('.stock-item-unavailable').count(),1);
      const unavailableItem=page.locator('.stock-request-detail-item').filter({has:page.locator('.stock-item-unavailable')});
      assert.match(await unavailableItem.innerText(),/Lab bags/);
      assert.match(await unavailableItem.innerText(),/2 packs \(100 bags\)/);
      assert.doesNotMatch(await page.locator('#stockRequestDetailsBody').innerText(),/999999|987654/);
      await page.screenshot({path:`/tmp/fmt-availability-client-${width}.png`});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);

      await page.goto(`${base}/stock-dashboard.html`);
      await page.locator('[data-stock-request-view="AVAIL-BROWSER"]').first().click();
      await page.locator('.stock-availability-editor input[value="lab-bags"]').uncheck();
      await page.locator('[data-publish-availability]').click();
      await page.getByText('Unavailable-item notices cleared.',{exact:true}).waitFor();
      await page.goto(`${base}/track-orders.html`);
      await page.locator('.track-orders-row').waitFor();
      assert.equal(await page.locator('.stock-availability-notice').count(),0);
      assert.equal(writes,2);
      assert.deepEqual(errors,[]);
      await page.close();
      console.log(`PASS availability ${width}px: publish, retry, item-specific client notice, unchanged quantities, private balances, clear and persistence`);
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
