const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { generateVAPIDKeys } = require('web-push');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
const publicKey = generateVAPIDKeys().publicKey;
(async () => {
 const browser = await chromium.launch({headless:true});
 try { for (const width of [390,1280]) {
  const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>{if(!e.message.includes('Transition was aborted'))errors.push(e.message);});
  await page.addInitScript(() => {
   window.pushPermissionRequests=0; window.pushUnsubscriptions=0;
   window.Notification = class { static permission='default'; static async requestPermission(){ window.pushPermissionRequests++; this.permission='granted'; return 'granted'; } };
   window.PushManager = class {};
   const sub = { options:{}, toJSON:()=>({endpoint:'https://fcm.googleapis.com/fcm/send/fixture',keys:{p256dh:'fixture',auth:'fixture'}}), unsubscribe:async()=>{window.pushUnsubscriptions++;return true;} };
   let current=null;
   const registration = { pushManager:{getSubscription:async()=>current,subscribe:async()=>{current=sub;return sub;}},unregister:async()=>true };
   Object.defineProperty(navigator,'serviceWorker',{value:{register:async()=>registration,ready:Promise.resolve(registration),getRegistrations:async()=>[]},configurable:true});
  });
  let bindings=new Set(),tests=0,signedIn=true,issued=0;
  const calls=[];
  const order={id:'PUSH-ORDER-1',requestedBy:'Fixture Nurse',wardUnit:'ICU',createdAt:new Date().toISOString(),status:'pending',items:[]};
  const token = Buffer.from(JSON.stringify({id:order.id,exp:Date.now()+86400000})).toString('base64url')+'.fixture-signature';
  await page.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url()),path=url.pathname;
   if(path==='/api/push/config')return route.fulfill({json:{ok:true,configured:true,publicKey}});
   if(path.includes('/push/')&&path.includes('subscriptions')){
    calls.push({method:req.method(),path,authorization:req.headers().authorization});
    if(path.endsWith('/test')){tests++;return route.fulfill({status:202,json:{ok:true}});}
    if(req.method()==='POST'){const id=`00000000-0000-0000-0000-${String(++issued).padStart(12,'0')}`;bindings.add(id);return route.fulfill({status:201,json:{ok:true,subscription:{id}}});}
    const id=path.split('/').at(-1);
    if(req.method()==='DELETE'){bindings.delete(id);return route.fulfill({json:{ok:true}});}
    return route.fulfill({json:{ok:true,enabled:bindings.has(id)}});
   }
   if(path==='/api/push/orders/'+order.id)return route.fulfill({json:{ok:true,request:order}});
   if(path==='/api/stock-requests'&&req.method()==='POST')return route.fulfill({json:{ok:true,request:order,orderPushToken:token}});
   if(path==='/api/stock-auth/session')return route.fulfill({json:{authenticated:signedIn,setupRequired:false,...(signedIn?{user:{userNumber:'12345',role:'medical-technologist'}}:{})}});
   return route.fulfill({json:{ok:true,stats:{},summary:[],recentReceipts:[],requests:[],items:[]}});
  });
  await page.goto(base+'/order-stock.html');
  await page.locator('[data-stock-unified-tube="yellow"] [data-stock-card-toggle]').click();
  await page.locator('[data-stock-unified-tube="yellow"] [data-stock-unified-step="1"]').click();
  await page.locator('#openStockCartBtn').click();
  await page.locator('#stockOrderRequesterNameInput').fill('Fixture Nurse');
  const ward=await page.locator('#stockOrderRequesterSelect option').nth(1).getAttribute('value');
  await page.locator('#stockOrderRequesterSelect').selectOption(ward);
  await page.locator('#submitStockOrderBtn').click();
  const toggle=page.locator('#stockOrderSubmissionCard [data-push-toggle]');
  await toggle.waitFor(); await page.waitForFunction(()=>!document.querySelector('#stockOrderSubmissionCard [data-push-toggle]')?.disabled);
  await toggle.click(); await toggle.filter({hasText:'Turn off alerts'}).waitFor();
  assert.equal(await page.evaluate(()=>window.pushPermissionRequests),1);
  assert.ok(calls.find(c=>c.method==='POST'&&c.authorization==='Bearer '+token));
  assert.ok(!page.url().includes(token));
  await page.locator('#stockOrderSubmissionCard [data-push-test]').click();
  await page.locator('.push-controls-status').filter({hasText:'Test alert queued'}).waitFor();assert.equal(tests,1);
  // A tap can open the exact owned order even outside the public list window.
  await page.goto(base+'/track-orders.html?requestId='+order.id+'&openOrder=1');
  await page.locator('#stockRequestDetailsTitle').filter({hasText:order.id}).waitFor();
  await page.locator('#stockRequestDetailsBody [data-push-toggle]').filter({hasText:'Turn off alerts'}).waitFor();
  await page.locator('#stockRequestDetailsBody [data-push-toggle]').click();
  await page.locator('#stockRequestDetailsBody [data-push-toggle]').filter({hasText:'Enable alerts'}).waitFor();
  assert.equal(await page.evaluate(()=>window.pushUnsubscriptions),0);
  await page.goto(base+'/stock-dashboard.html');
  const lab=page.locator('#labPushPanel [data-push-toggle]'); await lab.waitFor();
  await page.waitForFunction(()=>!document.querySelector('#labPushPanel [data-push-toggle]')?.disabled);
  await lab.click(); await lab.filter({hasText:'Turn off alerts'}).waitFor();
  assert.ok(calls.find(c=>c.method==='POST'&&c.path==='/api/lab/push/subscriptions'));
  const labTest=page.locator('#labPushPanel [data-push-test]');
  const labStatus=page.locator('#labPushPanel .push-controls-status');
  assert.equal(await labTest.isEnabled(),true);
  assert.equal(await labTest.evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await labTest.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(230, 207, 140)');
  // A saved subscription must not hide a missing/changed browser permission.
  await page.evaluate(()=>{Notification.permission='default';window.dispatchEvent(new Event('focus'));});
  await labTest.filter({hasText:'Allow notifications & test'}).waitFor();
  assert.match(await labStatus.innerText(),/browser permission is needed/);
  assert.equal(await labTest.isEnabled(),true);
  const beforeTest=tests;
  const beforePermission=await page.evaluate(()=>window.pushPermissionRequests);
  await labTest.click();
  await labStatus.filter({hasText:'Test alert queued'}).waitFor();
  assert.equal(tests,beforeTest+1);
  assert.equal(await page.evaluate(()=>window.pushPermissionRequests),beforePermission+1);
  await page.evaluate(()=>{Notification.permission='denied';window.dispatchEvent(new Event('focus'));});
  await labStatus.filter({hasText:'Notifications are blocked on this browser'}).waitFor();
  assert.equal(await labTest.isDisabled(),true);
  assert.equal(await lab.isEnabled(),true,'Turning off the saved channel remains available');
  assert.doesNotMatch(await labStatus.innerText(),/Alerts are on/);
  await page.evaluate(()=>{Notification.permission='granted';window.dispatchEvent(new Event('focus'));});
  await labStatus.filter({hasText:'Alerts are on'}).waitFor();
  assert.equal(await labTest.isEnabled(),true);
  await page.screenshot({path:`/tmp/fmt-push-controls-${width}.png`});
  await page.evaluate(()=>window.FMT_PUSH.labSessionChanged(false));
  assert.equal(await page.locator('#labPushPanel').isVisible(),false);
  assert.equal(await page.evaluate(()=>window.FMT_PUSH.labEnabled),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>{Notification.permission='denied';window.FMT_PUSH.labSessionChanged(true);});
  await page.locator('#labPushPanel .push-controls-status').filter({hasText:'Notifications are blocked'}).waitFor();
  assert.equal(await lab.isDisabled(),true);
  await page.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{value:'iPhone',configurable:true});window.FMT_PUSH.labSessionChanged(false);window.FMT_PUSH.labSessionChanged(true);});
  await page.locator('#labPushPanel .push-controls-status').filter({hasText:'Add to Home Screen'}).waitFor();
  assert.equal(await lab.isDisabled(),true);
  await page.close(); console.log('Push browser controls passed at '+width+'px');
 }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
