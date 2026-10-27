const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { generateVAPIDKeys } = require('web-push');
const { createBrowserPush } = require('../lib/browser-push');

test('HTTP push config reveals only public key; receipt reads use the public order projection', { timeout: 15000 }, async () => {
 const keys = generateVAPIDKeys();
 const push = createBrowserPush({ db: {}, ...keys });
 const token = push.issueOrderToken('PUSH-HTTP');
 const row = { id: 'PUSH-HTTP', status: 'pending', requester_name: 'Fixture Nurse', ward_or_unit: 'Ward', contact_extension: 'private-extension', request_text: 'private-legacy-contact', status_history: [], stock_request_items: [], created_at: new Date().toISOString() };
 let subscriptionWrites=0;
 const fixture = http.createServer(async (req,res) => {
  const url=new URL(req.url,'http://localhost');let text='';for await(const chunk of req)text+=chunk;
  const send=payload=>{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(payload));};
  if(url.pathname.endsWith('/stock_requests'))return send([row]);
  if(url.pathname.endsWith('/web_push_subscriptions')){if(req.method==='POST')subscriptionWrites++;return send([]);}
  return send([]);
 });
 await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
 const child=spawn(process.execPath,['-e',"const {server}=require('./server');server.listen(0,'127.0.0.1',()=>process.send({port:server.address().port}));"],{
  cwd:path.resolve(__dirname,'..'),env:{...process.env,SUPABASE_URL:`http://127.0.0.1:${fixture.address().port}`,SUPABASE_SERVICE_ROLE_KEY:'fixture-only',WEB_PUSH_PUBLIC_KEY:keys.publicKey,WEB_PUSH_PRIVATE_KEY:keys.privateKey,WEB_PUSH_SUBJECT:'https://example.test/about'},stdio:['ignore','ignore','pipe','ipc']
 });
 let errors='';child.stderr.on('data',data=>{errors+=data;});
 try {
  const port=await new Promise((resolve,reject)=>{child.once('message',m=>resolve(m.port));child.once('error',reject);child.once('exit',code=>reject(new Error(`API exited ${code}`)));});
  const base=`http://127.0.0.1:${port}`;
  const config=await(await fetch(base+'/api/push/config')).json();
  assert.deepEqual(config,{ok:true,configured:true,publicKey:keys.publicKey});
  for(const route of ['/api/config','/api/health','/api/stock-requests']) {
   const body=await(await fetch(base+route)).text();assert.ok(!body.includes(keys.privateKey));assert.ok(!body.includes(token));assert.doesNotMatch(body,/private-extension|private-legacy-contact/);
  }
  assert.equal((await fetch(base+'/api/push/orders/PUSH-HTTP')).status,403);
  assert.equal((await fetch(base+'/api/push/orders/OTHER',{headers:{Authorization:`Bearer ${token}`}})).status,403);
  const own=await fetch(base+'/api/push/orders/PUSH-HTTP',{headers:{Authorization:`Bearer ${token}`}});
  assert.equal(own.status,200);const body=await own.text();assert.ok(body.includes('Fixture Nurse'));assert.doesNotMatch(body,/private-extension|private-legacy-contact|contactExtension|requestText/);
  assert.equal((await fetch(base+'/api/lab/push/subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  assert.equal(subscriptionWrites,0);assert.ok(!errors.includes(keys.privateKey));
 } finally {
  await new Promise(resolve=>{child.once('exit',resolve);child.kill();});
  await new Promise(resolve=>fixture.close(resolve));
 }
});
