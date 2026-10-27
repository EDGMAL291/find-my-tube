const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const {spawn} = require('node:child_process');

test('staff publish and clear item notices; public tracking stays private and concurrent updates are preserved', {timeout:15000}, async()=>{
  const token='availability-fixture-session';
  const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
  const now=new Date().toISOString();
  const row={id:'AVAIL-TEST',source:'find-my-tube',requester_name:'Fixture Nurse',ward_or_unit:'ICU',status:'pending',
    contact_extension:'987654',request_text:'private legacy text',created_at:now,updated_at:now,status_history:[{status:'pending',updatedAt:now}],
    stock_request_items:[{item_id:'lab-bags',item_name:'Lab bags',quantity:2,unit:'packet',packet_size:50,inventory_units:100},
      {item_id:'blood-culture-bottle-aerobic',item_name:'Aerobic bottle',quantity:2,unit:'each',inventory_units:2}]};
  let writes=0,otherWrites=0,failWrite=false,collide=false,activeSession=true;
  const fixture=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');let text='';for await(const chunk of req)text+=chunk;
    const body=text?JSON.parse(text):null;
    const send=(status,payload)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(payload));};
    if(url.pathname.endsWith('/lab_sessions')) {
      if(activeSession && url.searchParams.get('token_hash')===`eq.${tokenHash}`)return send(200,[{id:'session',user_id:'staff',expires_at:new Date(Date.now()+60000).toISOString(),users:{id:'staff',user_number:'12345',role:'medical-technologist',is_active:true,active_session_token_hash:tokenHash}}]);
      return send(200,[]);
    }
    if(url.pathname.endsWith('/stock_requests')) {
      const id=(url.searchParams.get('id')||'').replace(/^eq\./,'');
      if(req.method==='PATCH') {
        if(failWrite)return send(500,{message:'Fixture write failure'});
        assert.deepEqual(Object.keys(body).sort(),['status_history','updated_at'],'Only audit history and activity time can change');
        if(collide==='notice') {
          row.status_history.push({type:'item-availability-notice',unavailableItemIds:['blood-culture-bottle-aerobic'],updatedAt:new Date().toISOString()});collide=false;
        } else if(collide){collide=false;row.status='ready';row.status_history.push({status:'ready',updatedAt:new Date().toISOString()});}
        const historyFilter=url.searchParams.get('status_history')||'';
        const historyMatches=historyFilter==='is.null' ? row.status_history==null
          : JSON.stringify(JSON.parse(historyFilter.replace(/^eq\./,'')))===JSON.stringify(row.status_history);
        if(id!==row.id || url.searchParams.get('status')!==`eq.${row.status}` || !historyMatches)return send(200,[]);
        writes++;Object.assign(row,body);return send(200,[{id:row.id}]);
      }
      if(req.method!=='GET')otherWrites++;
      return send(200,!id||id===row.id?[row]:[]);
    }
    if(req.method!=='GET' && /\/(stock_request_items|inventory_balances|inventory_batches)$/.test(url.pathname))otherWrites++;
    return send(200,[]);
  });
  await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
  const child=spawn(process.execPath,['-e',"const {server}=require('./server');server.listen(0,'127.0.0.1',()=>process.send({port:server.address().port}));"],{
    cwd:path.resolve(__dirname,'..'),env:{...process.env,NODE_ENV:'production',SUPABASE_URL:`http://127.0.0.1:${fixture.address().port}`,SUPABASE_SERVICE_ROLE_KEY:'fixture-only-key'},stdio:['ignore','ignore','pipe','ipc']});
  let errors='';child.stderr.on('data',b=>errors+=b);
  try {
    const port=await new Promise((resolve,reject)=>{child.once('message',m=>resolve(m.port));child.once('error',reject);child.once('exit',code=>reject(new Error(`API exited ${code}: ${errors}`)));});
    const base=`http://127.0.0.1:${port}`;
    const update=(body,auth=true,id=row.id)=>fetch(`${base}/api/lab/stock-requests/${id}/availability`,{method:'PATCH',headers:{'Content-Type':'application/json',...(auth?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
    const payload=(ids,revision=0)=>({unavailableItemIds:ids,expectedRevision:revision,stockOnHand:999999,notes:'must not be stored'});
    assert.equal((await update(payload(['lab-bags']),false)).status,401);
    activeSession=false;assert.equal((await update(payload(['lab-bags']))).status,401);activeSession=true;
    for(const body of [payload(['unknown']),payload(['lab-bags','lab-bags']),{unavailableItemIds:['lab-bags']},payload('lab-bags'),payload([{}])])assert.equal((await update(body)).status,400);
    assert.equal((await update(payload(['lab-bags']),true,'MISSING')).status,404);
    failWrite=true;assert.equal((await update(payload(['lab-bags']))).status,500);failWrite=false;
    assert.equal(writes,0);
    const saved=await update(payload(['lab-bags']));assert.equal(saved.status,200);
    const record=(await saved.json()).request;
    assert.deepEqual(record.availabilityNotice.unavailableItemIds,['lab-bags']);
    assert.equal(record.availabilityNotice.revision,2);
    assert.equal(row.status,'pending');assert.equal(row.stock_request_items[0].quantity,2);
    assert.equal(row.stock_request_items[0].inventory_units,100);
    const publicPayload=await(await fetch(`${base}/api/stock-requests`)).json();
    assert.deepEqual(publicPayload.requests[0].availabilityNotice.unavailableItemIds,['lab-bags']);
    assert.doesNotMatch(JSON.stringify(publicPayload),/987654|999999|private legacy|must not be stored/);
    assert.equal((await update(payload([],0))).status,409,'Stale notices cannot replace newer notices');
    const repeat=await update(payload(['lab-bags'],2));assert.equal((await repeat.json()).unchanged,true);assert.equal(writes,1);
    collide=true;assert.equal((await update(payload([],2))).status,409,'A concurrent status transition survives');
    assert.equal(row.status,'ready');assert.equal(row.status_history.at(-1).status,'ready');
    const cleared=await update(payload([],2));assert.equal(cleared.status,200);
    const clearRecord=(await cleared.json()).request;
    assert.deepEqual(clearRecord.availabilityNotice.unavailableItemIds,[]);
    assert.equal(clearRecord.availabilityNotice.revision,4);
    assert.equal(row.status_history[1].type,'item-availability-notice','Earlier notices remain in the audit');
    collide='notice';assert.equal((await update(payload(['lab-bags'],4))).status,409,'A concurrent notice with the same status survives');
    assert.deepEqual(row.status_history.at(-1).unavailableItemIds,['blood-culture-bottle-aerobic']);
    row.status='completed';assert.equal((await update(payload(['lab-bags'],5))).status,409);
    row.status='pending';row.updated_at=new Date(Date.now()-15*86400000).toISOString();row.created_at=row.updated_at;
    row.status_history=[];assert.equal((await update(payload(['lab-bags']))).status,409,'Inactive archived orders cannot be edited');
    row.created_at=now;row.updated_at=now;row.status_history=null;
    const legacy=await update(payload(['lab-bags']));assert.equal(legacy.status,200);
    assert.equal((await legacy.json()).request.availabilityNotice.revision,1,'Legacy null history needs no migration');
    assert.equal(writes,3);assert.equal(otherWrites,0,'No item quantities or inventory are written');
  } finally {
    if(child.exitCode===null){const closed=new Promise(resolve=>child.once('exit',resolve));child.kill();await closed;}
    await new Promise(resolve=>fixture.close(resolve));
  }
});
