const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const crypto=require('node:crypto');
const path=require('node:path');
const {spawn}=require('node:child_process');

test('status updates confirm saved records, preserve concurrent work and collect atomically once', {timeout:15000},async()=>{
  const token='status-fixture';const hash=crypto.createHash('sha256').update(token).digest('hex');
  const now=new Date().toISOString();
  const make=(id,status='pending')=>({id,source:'find-my-tube',requester_name:'Fixture Nurse',ward_or_unit:'ICU',status,created_at:now,updated_at:now,inventory_deducted:false,
    status_history:[{status,updatedAt:now}],stock_request_items:[{item_id:'specimen-jars',item_name:'Specimen jars',quantity:2,unit:'each',inventory_units:2}]});
  const orders=new Map(['normal','concurrent','shortage','missing-rpc','legacy-column','legacy-packed','notice-race'].map(id=>[id,make(id,['shortage','missing-rpc','legacy-packed'].includes(id)?(id==='legacy-packed'?'packed':'ready'):'pending')]));
  let inventory=10,deductions=0,directInventoryWrites=0,statusWrites=0,rpcCalls=0,missingRpc=false;
  const sheetResponses=[];const locks=new Map();
  const fixture=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');let raw='';for await(const chunk of req)raw+=chunk;const body=raw?JSON.parse(raw):null;
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    if(url.pathname==='/sheets'){sheetResponses.push(res);return;}
    if(url.pathname.endsWith('/lab_sessions'))return send(200,url.searchParams.get('token_hash')===`eq.${hash}`?[{id:'session',expires_at:new Date(Date.now()+60000).toISOString(),users:{id:'staff',user_number:'12345',role:'medical-technologist',is_active:true,active_session_token_hash:hash}}]:[]);
    if(url.pathname.endsWith('/audit_logs'))return send(500,{message:'Secondary audit unavailable'});
    if(url.pathname.endsWith('/rpc/transition_stock_request_status')) {
      rpcCalls++;if(missingRpc)return send(404,{code:'PGRST202',message:'Function transition_stock_request_status missing'});
      const prev=locks.get(body.p_request_id)||Promise.resolve();
      const result=prev.then(()=>{
        const row=orders.get(body.p_request_id);const previousStatus=row.status;
        if(previousStatus==='packed' && body.p_next_status!=='ready')return {ok:false,error:'invalid-transition',previousStatus};
        if(!['ready','collected','completed','packed'].includes(previousStatus))return {ok:false,error:'invalid-transition',previousStatus};
        if(body.p_next_status==='ready'){row.status='ready';row.status_history.push({status:'ready',updatedAt:now});return {ok:true,previousStatus};}
        if(row.id==='shortage')return {ok:false,error:'insufficient-stock',previousStatus,shortages:[{label:'Specimen jars',onHand:1,requiredUnits:2,shortBy:1}]};
        if(!row.inventory_deducted){inventory-=2;deductions++;row.inventory_deducted=true;}
        row.status=body.p_next_status;row.updated_at=new Date().toISOString();row.status_history.push({status:row.status,updatedAt:row.updated_at});
        return {ok:true,previousStatus,status:row.status};
      });
      locks.set(body.p_request_id,result.catch(()=>{}));return send(200,await result);
    }
    if(url.pathname.endsWith('/stock_requests')) {
      const id=(url.searchParams.get('id')||'').replace(/^eq\./,'');const row=orders.get(id);
      if(req.method==='PATCH') {
        const fields=['status','status_history','status_updated_by_user_id','updated_at'];
        if('cancelled_at' in body)fields.push('cancelled_at');
        assert.deepEqual(Object.keys(body).sort(),fields.sort());
        if(id==='legacy-column' && 'cancelled_at' in body)return send(400,{message:'column cancelled_at does not exist'});
        if(id==='notice-race' && row.status_history.length===1)row.status_history.push({type:'item-availability-notice',unavailableItemIds:['specimen-jars'],updatedAt:now});
        const oldHistory=url.searchParams.get('status_history');
        const matches=oldHistory==='is.null'?row.status_history==null:JSON.stringify(JSON.parse(oldHistory.replace(/^eq\./,'')))===JSON.stringify(row.status_history);
        if(url.searchParams.get('status')!==`eq.${row.status}`||!matches)return send(200,[]);
        Object.assign(row,body);statusWrites++;return send(200,[{id}]);
      }
      return send(200,row?[row]:[...orders.values()].filter(r=>!id));
    }
    if(/\/(inventory_balances|stock_request_items|inventory_batches)$/.test(url.pathname) && req.method!=='GET')directInventoryWrites++;
    return send(200,[]);
  });
  await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
  const child=spawn(process.execPath,['-e',"const {server}=require('./server');server.listen(0,'127.0.0.1',()=>process.send({port:server.address().port}));"],{cwd:path.resolve(__dirname,'..'),env:{...process.env,NODE_ENV:'production',SUPABASE_URL:`http://127.0.0.1:${fixture.address().port}`,SUPABASE_SERVICE_ROLE_KEY:'fixture-only-key',STOCK_SHEETS_WEBHOOK_URL:`http://127.0.0.1:${fixture.address().port}/sheets`,STOCK_ORDER_SHEETS_WEBHOOK_URL:''},stdio:['ignore','ignore','pipe','ipc']});
  let errors='';child.stderr.on('data',b=>errors+=b);
  try {
    const port=await new Promise((resolve,reject)=>{child.once('message',m=>resolve(m.port));child.once('error',reject);child.once('exit',c=>reject(new Error(`API exit ${c}: ${errors}`)));});
    const base=`http://127.0.0.1:${port}`;const headers={'Content-Type':'application/json',Authorization:`Bearer ${token}`};
    const update=(id,status,expectedStatus,auth=true)=>fetch(`${base}/api/stock-requests/${id}/status`,{method:'PATCH',headers:auth?headers:{'Content-Type':'application/json'},body:JSON.stringify({status,...(expectedStatus?{expectedStatus}:{})}),signal:AbortSignal.timeout(2000)});
    assert.equal((await update('normal','ready','pending',false)).status,401);
    assert.equal((await fetch(`${base}/api/lab/stock-requests/normal`)).status,401);
    assert.equal((await update('concurrent','collected','pending')).status,409,'Collection cannot skip Ready');
    const competing=await Promise.all([update('concurrent','ready','pending'),update('concurrent','cancelled','pending')]);
    assert.deepEqual(competing.map(response=>response.status).sort(),[200,409],'Conflicting next steps cannot both overwrite the same Pending snapshot');
    const ready=await update('normal','ready','pending');assert.equal(ready.status,200,'Stalled Sheets and failed secondary audit must not block confirmation');
    assert.equal((await ready.json()).request.status,'ready');assert.equal(inventory,10);
    const writes=statusWrites;
    assert.equal((await(await update('normal','ready','pending')).json()).unchanged,true);assert.equal(statusWrites,writes);
    const stale=await update('normal','no-stock','pending');assert.equal(stale.status,409);assert.equal((await stale.json()).currentStatus,'ready');
    const conflict=await update('notice-race','ready','pending');assert.equal(conflict.status,409);
    assert.equal(orders.get('notice-race').status,'pending');assert.equal(orders.get('notice-race').status_history.at(-1).type,'item-availability-notice');
    assert.equal((await update('legacy-column','ready','pending')).status,200);
    const beforeStatusWrites=statusWrites;
    const shortage=await update('shortage','collected','ready');assert.equal(shortage.status,409);assert.equal((await shortage.json()).shortages[0].shortBy,1);assert.equal(orders.get('shortage').status,'ready');
    missingRpc=true;const missing=await update('missing-rpc','collected','ready');assert.equal(missing.status,503);assert.equal((await missing.json()).code,'collection_setup_required');missingRpc=false;
    assert.equal(orders.get('missing-rpc').status,'ready');assert.equal(statusWrites,beforeStatusWrites);
    const concurrent=await Promise.all([update('normal','collected','ready'),update('normal','collected','ready')]);
    for(const response of concurrent){assert.equal(response.status,200);assert.equal((await response.json()).request.status,'collected');}
    assert.equal(inventory,8);assert.equal(deductions,1);assert.equal(directInventoryWrites,0);
    const beforeRpc=rpcCalls;
    const retry=await update('normal','collected','ready');assert.equal((await retry.json()).unchanged,true);assert.equal(rpcCalls,beforeRpc);
    const saved=await(await fetch(`${base}/api/lab/stock-requests/normal`,{headers})).json();assert.equal(saved.request.status,'collected');assert.equal(saved.request.inventoryDeducted,true);
    assert.equal((await update('legacy-packed','collected','ready')).status,200);assert.equal(deductions,2);
    assert.equal((await update('normal','ready','collected')).status,409);assert.equal(inventory,6);
    assert.ok(sheetResponses.length>0,'The existing Sheets integration still runs after confirmation');
  } finally {
    for(const res of sheetResponses)if(!res.writableEnded)res.end('{}');
    if(child.exitCode===null){const closed=new Promise(resolve=>child.once('exit',resolve));child.kill();await closed;}
    fixture.closeAllConnections();await new Promise(resolve=>fixture.close(resolve));
  }
});
