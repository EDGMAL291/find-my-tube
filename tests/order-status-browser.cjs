const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.FMT_TEST_URL||'http://127.0.0.1:3000';
async function waitForGate(getGate) {
 const deadline=Date.now()+5000;
 while(!getGate()){if(Date.now()>deadline)throw new Error('Expected test request did not start');await new Promise(resolve=>setTimeout(resolve,10));}
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {for(const width of [390,1280]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>{if(!e.message.includes('Transition was aborted'))errors.push(e.message)});
  let order,posts=0,deductions=0,mode='normal',holdList=false,releaseList,releasePost,holdRead=false,releaseRead,readFails=false,refreshFails=false,signedIn=true;
  const reset=()=>{const now=new Date().toISOString();order={id:'STATUS-TEST',requestedBy:'Fixture Nurse',wardUnit:'ICU',createdAt:now,updatedAt:now,status:'pending',inventoryDeducted:false,statusHistory:[{status:'pending',updatedAt:now}],items:[{id:'specimen-jars',label:'Specimen jars',quantity:2,unitType:'each'}]};};reset();
  await page.route('**/api/**',async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;
   if(path.endsWith('/STATUS-TEST/status')) {
    posts++;const body=req.postDataJSON();assert.equal(body.expectedStatus,'ready'===body.status?'pending':'ready');
    if(mode==='hold')await new Promise(resolve=>releasePost=resolve);
    if(mode==='shortage')return route.fulfill({status:409,json:{ok:false,error:'Not enough stock',shortages:[{label:'Specimen jars',onHand:1,shortBy:1}]}});
    if(mode==='unknown')return route.abort('connectionreset');
    if(mode==='invalid')return route.fulfill({json:{ok:true}});
    if(mode==='conflict')return route.fulfill({status:409,json:{error:'This order was updated by another staff member.'}});
    order.status=body.status;order.updatedAt=new Date().toISOString();order.statusHistory.push({status:body.status,updatedAt:order.updatedAt});if(body.status==='collected'){order.inventoryDeducted=true;deductions++;}
    if(mode==='lost')return route.abort('connectionreset');
    return route.fulfill({json:{ok:true,request:order}});
   }
   if(path==='/api/lab/stock-requests/STATUS-TEST') {
    const snapshot=structuredClone(order);
    if(holdRead){holdRead=false;await new Promise(resolve=>releaseRead=resolve);}
    return readFails?route.fulfill({status:503,json:{error:'unavailable'}}):route.fulfill({json:{ok:true,request:snapshot}});
   }
   if(path==='/api/stock-auth/session')return route.fulfill({json:{authenticated:signedIn,setupRequired:false,...(signedIn?{user:{userNumber:'12345',role:'medical-technologist'}}:{})}});
   if(path==='/api/lab/stock-stats' && refreshFails)return route.fulfill({status:503,json:{error:'Stats unavailable'}});
   if(path==='/api/lab/stock-requests') {
    const snapshot=structuredClone(order);
    if(holdList){holdList=false;await new Promise(resolve=>releaseList=resolve);}
    return route.fulfill({json:{requests:[snapshot],activeRequests:[snapshot]}});
   }
   return route.fulfill({json:{ok:true,stats:{},summary:[],recentReceipts:[],requests:[]}});
  });
  const load=async()=>{await page.goto(`${base}/stock-dashboard.html`);await page.locator('[data-request-status="ready"]').waitFor();};
  await load();
  holdList=true;await page.evaluate(()=>{window.statusOldLoad=loadStockDashboard({silent:true,fromPoll:true});});
  await page.waitForFunction(()=>document.readyState==='complete');
  await waitForGate(()=>releaseList);
  mode='hold';const before=posts;
  await page.evaluate(()=>{void updateStockDashboardRequestStatus('STATUS-TEST','ready');void updateStockDashboardRequestStatus('STATUS-TEST','ready');});
  await page.locator('[data-request-status="ready"][disabled]').waitFor();
  await waitForGate(()=>releasePost);
  assert.equal(posts,before+1,'Repeated taps produce one write');
  refreshFails=true;releasePost();
  await page.locator('.stock-dashboard-request-feedback').filter({hasText:'Ready saved'}).waitFor();
  await page.locator('[data-request-status="collected"]').waitFor();
  releaseList();await page.evaluate(()=>window.statusOldLoad);
  assert.equal(await page.locator('.stock-dashboard-queue-status-badge').innerText(),'Ready','Older polling cannot undo the confirmed display');
  assert.equal(await page.locator('[data-request-status="completed"]').count(),0,'One clear collection action is offered');
  refreshFails=false;mode='shortage';
  await page.locator('[data-request-status="collected"]').click();
  assert.equal(posts,before+1,'Collection requires a separate explicit confirmation');
  await page.locator('[data-status-keep]').click();
  await page.locator('[data-request-status="collected"]').click();
  await page.locator('[data-status-confirmed]').click();
  await page.locator('.stock-dashboard-request-feedback').filter({hasText:'short by 1'}).waitFor();
  assert.equal(order.status,'ready');assert.equal(deductions,0);
  await page.screenshot({path:`/tmp/fmt-status-shortage-${width}.png`});
  mode='lost';await page.locator('[data-request-status="collected"]').click();await page.locator('[data-status-confirmed]').click();
  await page.locator('.stock-dashboard-update-receipt').filter({hasText:'Collected saved'}).waitFor();
  assert.equal(deductions,1);assert.equal(await page.locator('[data-dashboard-request="STATUS-TEST"]').count(),0);
  await page.locator('.stock-dashboard-update-receipt [data-stock-request-view]').click();
  assert.match(await page.locator('#stockRequestDetailsBody').innerText(),/Collected/);

  reset();mode='unknown';readFails=true;await load();await page.locator('[data-request-status="ready"]').click();
  await page.locator('[data-check-request-status]').waitFor();
  const unknownPosts=posts;await page.evaluate(()=>updateStockDashboardRequestStatus('STATUS-TEST','ready'));assert.equal(posts,unknownPosts,'Unconfirmed changes cannot be blindly retried');
  readFails=false;order.status='ready';order.statusHistory.push({status:'ready'});mode='normal';await page.locator('[data-check-request-status]').click();
  await page.locator('.stock-dashboard-request-feedback').filter({hasText:'Ready saved'}).waitFor();assert.equal(posts,unknownPosts,'Checking a late save never repeats the write');
  order.status='cancelled';order.statusHistory.push({status:'cancelled'});mode='conflict';await page.locator('[data-request-status="collected"]').click();await page.locator('[data-status-confirmed]').click();
  await page.locator('.stock-dashboard-update-receipt').filter({hasText:'Saved status: Cancelled'}).waitFor();
  assert.equal(await page.locator('[data-dashboard-request="STATUS-TEST"]').count(),0);

  reset();mode='invalid';await load();await page.locator('[data-request-status="ready"]').click();
  await page.locator('.stock-dashboard-request-feedback').filter({hasText:'did not confirm'}).waitFor();
  assert.equal(await page.locator('.stock-dashboard-queue-status-badge').innerText(),'Pending');
  assert.equal(await page.locator('.stock-dashboard-update-receipt').count(),0,'An invalid success body is not shown as a save');
  await page.screenshot({path:`/tmp/fmt-status-pending-${width}.png`});

  reset();mode='unknown';readFails=true;await load();await page.locator('[data-request-status="ready"]').click();
  await page.locator('[data-check-request-status]').waitFor();
  readFails=false;order.status='ready';order.statusHistory.push({status:'ready'});
  await page.evaluate(()=>loadStockDashboard({silent:true,fromPoll:true}));
  await page.locator('.stock-dashboard-update-receipt').filter({hasText:'Ready confirmed from the saved order'}).waitFor();
  holdRead=true;releaseRead=null;await page.locator('[data-request-status="collected"]').click();await page.locator('[data-status-confirmed]').click();
  await waitForGate(()=>releaseRead);
  order.status='cancelled';order.statusHistory.push({status:'cancelled'});
  await page.evaluate(()=>loadStockDashboard({silent:true,fromPoll:true}));
  releaseRead();await page.locator('.stock-dashboard-update-receipt').filter({hasText:'Saved status: Cancelled'}).waitFor();
  assert.equal(await page.locator('[data-dashboard-request="STATUS-TEST"]').count(),0,'A late verification read cannot restore an older status');

  reset();mode='hold';await load();releasePost=null;await page.locator('[data-request-status="ready"]').click();
  await waitForGate(()=>releasePost);
  signedIn=false;await page.evaluate(()=>stockDashboardClearSession('session_expired'));releasePost();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#stockDashboardRequestsCard').isVisible(),false,'A late response cannot restore a signed-out queue');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.close();console.log(`PASS status ${width}px: single save, stale polling, explicit collection, shortages, lost acknowledgement, uncertain state, conflicts, malformed replies and logout`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
