const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('path').join(__dirname, '../assets/js/script.js'), 'utf8');
const start = source.indexOf('  bindPressAction(submitStockOrderBtn, async () => {');
const end = source.indexOf('  bindPressAction(copyStockOrderBtn', start);
function setup(response, blocked = '') {
  let release;
  const gate = new Promise(resolve => release = resolve);
  const state = {calls:0, resets:0, notices:[], release};
  const ctx = {isSubmittingStockOrder:false, lastStockSubmitErrorMessage:'', submittedStockOrderRecord:null,
    stockOrderStatusMode:'ready', submitStockOrderBtn:{}, STOCK_ORDER_SUBMIT_URL:'/api/stock-requests',
    AbortController, Error, TypeError, setTimeout, clearTimeout, console:{error(){}},
    bindPressAction:(_, fn)=>state.submit=fn, updateStockOrderPreview(){},
    loadStockDuplicateCheckRequests:()=>gate, getStockSubmitBlockedReason:()=>blocked,
    buildStockOrderPayload:()=>({requestedBy:'Diagnostic',wardUnit:'Test',items:[{id:'yellow',quantity:1}]}),
    fetch:async()=>{state.calls++;return response}, showSelectionNotice:m=>state.notices.push(m),
    addHomeRecentActivity(){}, resetStockOrderForm(){state.resets++},
    showStockOrderSubmissionConfirmation:r=>state.confirmed=r.id, hideStockOrderSubmissionConfirmation(){}
  };
  vm.runInNewContext(source.slice(start,end),ctx); return {ctx,state};
}
(async()=>{
  let {ctx,state}=setup({ok:true,json:async()=>({ok:true,request:{id:'TEST-1'}})});
  const first=state.submit();const second=state.submit();assert.equal(ctx.isSubmittingStockOrder,true);state.release();await Promise.all([first,second]);assert.equal(state.calls,1);assert.equal(state.resets,1);assert.equal(state.confirmed,'TEST-1');assert.equal(ctx.isSubmittingStockOrder,false);
  ({ctx,state}=setup({ok:false,status:409,json:async()=>({error:'Already ordered for this ward.',detail:'Check Track Orders.'})}));state.release();await state.submit();assert.equal(state.resets,0);assert.match(ctx.lastStockSubmitErrorMessage,/Already ordered/);
  ({ctx,state}=setup({ok:true,json:async()=>({})}));state.release();await state.submit();assert.equal(state.resets,0);assert.match(ctx.lastStockSubmitErrorMessage,/did not confirm/);
  ({ctx,state}=setup({},'Already ordered'));state.release();await state.submit();assert.equal(state.calls,0);assert.equal(ctx.isSubmittingStockOrder,false);
  console.log('PASS: concurrent clicks, saved confirmation, conflict explanation, invalid success response, blocked-order unlock');
})().catch(e=>{console.error(e);process.exitCode=1});
