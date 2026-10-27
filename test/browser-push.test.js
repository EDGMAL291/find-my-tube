const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');
const { generateVAPIDKeys } = require('web-push');
const { createBrowserPush, validateSubscription, MAX_WATCH_AGE_MS } = require('../lib/browser-push');
const { createPushApi } = require('../lib/push-api');
const keys = generateVAPIDKeys();
function subscription() { const curve = crypto.createECDH('prime256v1'); curve.generateKeys(); return { endpoint: 'https://fcm.googleapis.com/fcm/send/device', keys: { p256dh: curve.getPublicKey().toString('base64url'), auth: crypto.randomBytes(16).toString('base64url') } }; }
const setup = options => createBrowserPush({ db: {}, publicKey: keys.publicKey, privateKey: keys.privateKey, ...options });

test('receipt capabilities are signed, order-specific, expire and require the stable key pair', () => {
 let now = Date.now(); const push = setup({ now: () => now }); const token = push.issueOrderToken('ORDER-1');
 assert.ok(push.verifyOrderToken(token, 'ORDER-1')); assert.equal(push.verifyOrderToken(token, 'ORDER-2'), null);
 assert.equal(push.verifyOrderToken(token + 'x', 'ORDER-1'), null);
 assert.equal(setup({ privateKey: generateVAPIDKeys().privateKey }).issueOrderToken('ORDER-1'), null);
 now += MAX_WATCH_AGE_MS; assert.equal(push.verifyOrderToken(token, 'ORDER-1'), null);
 assert.equal(createBrowserPush().issueOrderToken('ORDER-1'), null);
});

test('subscription validation accepts supported providers and rejects SSRF and invalid curve keys', () => {
 const value = subscription(); assert.deepEqual(validateSubscription(value), value);
 for (const endpoint of ['http://fcm.googleapis.com/x', 'https://127.0.0.1/x', 'https://fcm.googleapis.com.evil.test/x', 'https://user@fcm.googleapis.com/x', 'https://fcm.googleapis.com:444/x', 'https://fcm.googleapis.com/x#fragment']) assert.throws(() => validateSubscription({ ...value, endpoint }));
 assert.throws(() => validateSubscription({ ...value, keys: { ...value.keys, p256dh: Buffer.alloc(65, 4).toString('base64url') } }));
 for (const host of ['updates.push.services.mozilla.com', 'web.push.apple.com', 'wns1.notify.windows.com']) assert.ok(validateSubscription({ ...value, endpoint: `https://${host}/test` }));
});

function fakeDb({ row, jobs = [], error = null } = {}) {
 const writes = []; let claims = 0;
 const db = { writes, get claims() { return claims; }, rpc() { claims++; return query('rpc'); }, from(table) { return query(table); } };
 function query(table) { let action = 'select', value;
  const q = { select() { return q; }, limit() { return q; }, eq() { return q; }, lt() { return q; }, update(v) { action = 'update'; value = v; return q; }, delete() { action = 'delete'; return q; }, abortSignal() { if (action !== 'select') writes.push({ table, action, value }); return Promise.resolve({ data: table === 'rpc' ? jobs : table === 'web_push_subscriptions' && action === 'select' ? row ? [row] : [] : [], error }); } }; return q;
 } return db;
}

test('worker records provider acceptance, retries temporary errors and removes expired endpoints', async () => {
 const raw = subscription(); const row = { id: 's', kind: 'client', order_id: 'ORDER-1', endpoint: raw.endpoint, ...raw.keys, expires_at: new Date(Date.now() + 60000).toISOString() };
 for (const [code, expected] of [[201, 'delivered'], [503, 'pending'], [400, 'failed'], [410, 'delete']]) {
  const db = fakeDb({ row, jobs: [{ id: 'j', subscription_id: 's', attempts: 1, event_key: 'event', payload: { title: 'Generic' } }] });
  let calls = 0; const push = setup({ db, sender: async () => { calls++; if (code !== 201) throw Object.assign(new Error('secret endpoint must not be logged'), { statusCode: code }); return { statusCode: code }; }, log: { error(...args) { assert.ok(!JSON.stringify(args).includes('secret endpoint')); } } });
  await Promise.all([push.pump(), push.pump()]); assert.equal(calls, 1); assert.equal(db.claims, 1);
  assert.ok(db.writes.some(w => expected === 'delete' ? w.table === 'web_push_subscriptions' && w.action === 'delete' : w.value?.state === expected));
 }
});

test('worker blocks revoked staff, expired clients, untrusted endpoints and exhausted retries', async () => {
 const raw = subscription(); const base = { id: 's', kind: 'client', order_id: 'O', endpoint: raw.endpoint, ...raw.keys, expires_at: new Date(Date.now() + 60000).toISOString() };
 for (const row of [{ ...base, expires_at: new Date(0).toISOString() }, { ...base, kind: 'lab', user_id: 'u', lab_sessions: { user_id: 'u', token_hash: 'old', expires_at: base.expires_at, users: { is_active: true, active_session_token_hash: 'new' } } }, { ...base, endpoint: 'https://localhost/private' }]) {
  let calls = 0; const db = fakeDb({ row, jobs: [{ id: 'j', subscription_id: 's', attempts: 5, event_key: 'e', payload: {} }] });
  await setup({ db, sender: async () => { calls++; }, log: { error() {} } }).pump(); assert.equal(calls, 0);
 }
 const db = fakeDb({ row: base, jobs: [{ id: 'j', subscription_id: 's', attempts: 5, event_key: 'e', payload: {} }] });
 await setup({ db, sender: async () => { throw Object.assign(new Error(), { statusCode: 503 }); }, log: { error() {} } }).pump();
 assert.ok(db.writes.some(w => w.value?.state === 'failed'));
});

test('API requires session or matching receipt token and scopes subscription operations', async () => {
 const push = setup(); const token = push.issueOrderToken('ORDER-1'); const calls = [];
 Object.assign(push, { ready: async () => true, subscribe: async (scope, value) => { validateSubscription(value); calls.push(scope); return { id: '12345678-1234-1234-1234-123456789012' }; }, find: async scope => { calls.push(scope); return null; } });
 let answer;
 const api = createPushApi({ push, getSession: async (req, res) => { if (!req.session) { answer = { status: 401 }; return null; } return req.session; }, readBody: async req => req.body, send: (req, res, status, body) => { answer = { status, body }; }, rateLimit: () => true, getOrder: async () => ({ id: 'ORDER-1', status: 'pending' }) });
 const run = async (path, options = {}) => { answer = null; await api({ method: 'POST', headers: {}, body: JSON.stringify({ subscription: subscription() }), ...options }, {}, path); return answer; };
 assert.equal((await run('/api/lab/push/subscriptions')).status, 401);
 assert.equal((await run('/api/push/orders/ORDER-1/subscriptions')).status, 403);
 assert.equal((await run('/api/push/orders/ORDER-2/subscriptions', { headers: { authorization: `Bearer ${token}` } })).status, 403);
 assert.equal((await run('/api/push/orders/ORDER-1/subscriptions', { headers: { authorization: `Bearer ${token}` } })).status, 201);
 assert.equal(calls[0].orderId, 'ORDER-1');
 assert.equal((await run('/api/push/orders/ORDER-1', { method: 'GET', headers: { authorization: `Bearer ${token}` } })).body.request.id, 'ORDER-1');
 assert.equal((await run('/api/lab/push/subscriptions', { session: { id: 'SESSION', user: { id: 'USER' }, expiresAt: 'date' } })).status, 201);
 assert.equal(calls[1].sessionId, 'SESSION'); assert.equal(calls[1].userId, 'USER');
});

test('service worker displays safe in-scope deep links and rejects external click targets', async () => {
 const handlers = {}; let notification, opened, pending;
 const scope = 'https://example.test/app/';
 const self = { registration: { scope, showNotification: async (title, options) => { notification = options; } }, addEventListener: (name, fn) => { handlers[name] = fn; }, clients: { matchAll: async () => [], openWindow: async url => { opened = url; } } };
 vm.runInNewContext(fs.readFileSync('service-worker.js', 'utf8'), { self, URL, console });
 handlers.push({ data: { json: () => ({ kind: 'client', orderId: 'ORDER-1', url: 'https://evil.test' }) }, waitUntil: p => { pending = p; } }); await pending;
 assert.equal(new URL(notification.data.url).pathname, '/app/track-orders.html'); assert.equal(new URL(notification.data.url).searchParams.get('openOrder'), '1');
 handlers.notificationclick({ notification: { close() {}, data: { url: 'https://evil.test' } }, waitUntil: p => { pending = p; } }); await pending;
 assert.equal(opened, `${scope}index.html`);
 handlers.push({ data: { json() { throw new Error(); } }, waitUntil: p => { pending = p; } }); await pending; assert.ok(notification.body);
});

test('subscription reads and deletes always constrain kind, owner and server session', async () => {
 const traces=[];
 const db={from(table){const trace={table,filters:[]};traces.push(trace);const q={select(){return q;},delete(){trace.delete=true;return q;},eq(key,value){trace.filters.push([key,value]);return q;},abortSignal(){return Promise.resolve({data:[],error:null});}};return q;}};
 const push=setup({db});
 await push.find({kind:'lab',recipient:'session-a',sessionId:'session-a',userId:'user-a'},'subscription-b');
 await push.unsubscribe({kind:'client',recipient:'order-a',orderId:'order-a'},'subscription-b');
 assert.deepEqual(traces[0].filters,[['id','subscription-b'],['kind','lab'],['recipient_key','session-a'],['lab_session_id','session-a'],['user_id','user-a']]);
 assert.deepEqual(traces[1].filters,[['id','subscription-b'],['kind','client'],['recipient_key','order-a'],['order_id','order-a']]);
});

test('API rejects malformed subscriptions, finished orders and unavailable setup without breaking orders', async () => {
 const push=setup();const token=push.issueOrderToken('ORDER-1');let ready=true,finished=false,answer,writes=0;
 Object.assign(push,{ready:async()=>ready,subscribe:async(scope,body)=>{validateSubscription(body);writes++;return {id:'id'};}});
 const api=createPushApi({push,getSession:async()=>null,readBody:async req=>req.body,send:(req,res,status,body)=>{answer={status,body};},rateLimit:()=>true,getOrder:async()=>({status:finished?'collected':'pending'})});
 const run=async body=>{await api({method:'POST',headers:{authorization:`Bearer ${token}`},body},{},'/api/push/orders/ORDER-1/subscriptions');return answer.status;};
 assert.equal(await run('{'),400); assert.equal(await run(JSON.stringify({subscription:{...subscription(),endpoint:'https://localhost/private'}})),400);
 finished=true; assert.equal(await run('{}'),409); finished=false;ready=false;assert.equal(await run('{}'),503);assert.equal(writes,0);
});

test('device inspection is scoped, read-only, and exposes only a safe last-test summary', async () => {
 const traces=[];let jobReads=0;
 const expiry=new Date(Date.now()+60000).toISOString();
 const db={from(table){const trace={table,filters:[]};traces.push(trace);const q={select(){return q;},eq(key,value){trace.filters.push([key,value]);return q;},like(key,value){trace.filters.push([key,value]);return q;},order(){return q;},limit(){return q;},abortSignal(){
  if(table==='web_push_subscriptions')return Promise.resolve({data:trace.filters.some(([key,value])=>key==='user_id'&&value==='intruder')?[]:[{id:'own',expires_at:expiry,endpoint_hash:'a'.repeat(64),endpoint:'private-endpoint',auth:'secret'}]});
  jobReads++;return Promise.resolve({data:[{state:'delivered',attempts:1,created_at:'created',delivered_at:'accepted',expires_at:expiry,payload:{private:'never return'},last_error_code:500}]});
 }};return q;}};
 const push=setup({db});const scope={kind:'lab',recipient:'session',sessionId:'session',userId:'owner'};
 const result=await push.inspect(scope,'own','a'.repeat(64));
 assert.equal(result.enabled,true);assert.equal(result.matchesDevice,true);
 assert.deepEqual(result.lastTest,{state:'accepted',attempts:1,createdAt:'created',acceptedAt:'accepted',expiresAt:expiry});
 assert.doesNotMatch(JSON.stringify(result),/secret|endpoint|payload|private|last_error/);
 assert.deepEqual(traces[0].filters,[['id','own'],['kind','lab'],['recipient_key','session'],['lab_session_id','session'],['user_id','owner']]);
 assert.deepEqual(traces[1].filters,[['subscription_id','own'],['event_key','test:%']]);
 assert.equal((await push.inspect(scope,'own','b'.repeat(64))).matchesDevice,false);
 const before=jobReads;
 assert.deepEqual(await push.inspect({...scope,userId:'intruder'},'own','a'.repeat(64)),{enabled:false,matchesDevice:false,expiresAt:null,lastTest:null});
 assert.equal(jobReads,before,'Unauthorized channels cannot even query job history');
});

test('device-check API validates fingerprints and applies staff/client ownership before inspection', async () => {
 const push=setup();const token=push.issueOrderToken('ORDER-1');let answer;const calls=[];
 Object.assign(push,{ready:async()=>true,inspect:async(...args)=>{calls.push(args);return {enabled:true,matchesDevice:true,lastTest:null};}});
 const api=createPushApi({push,getSession:async()=>({id:'session',expiresAt:'date',user:{id:'owner'}}),readBody:async req=>req.body,send:(req,res,status,body)=>{answer={status,body};},rateLimit:()=>true,getOrder:async()=>({status:'pending'})});
 const id='12345678-1234-1234-1234-123456789012';
 const run=async(path,body,auth=token,method='POST')=>{await api({method,headers:{authorization:`Bearer ${auth}`},body:JSON.stringify(body)},{},path);return answer;};
 const path=`/api/push/orders/ORDER-1/subscriptions/${id}/check`;
 assert.equal((await run(path,{endpointHash:'a'.repeat(64)})).status,200);assert.equal(calls[0][0].orderId,'ORDER-1');
 assert.equal((await run(path,{endpointHash:'bad'})).status,400);
 assert.equal((await run(path,{endpointHash:{}})).status,400);
 assert.equal((await run(path,{endpointHash:null},'unrelated')).status,403);
 assert.equal((await run(path,{},token,'GET')).status,405);
 assert.equal(calls.length,1);
 assert.equal((await run(`/api/lab/push/subscriptions/${id}/check`,{endpointHash:null})).status,200);
 assert.equal(calls[1][0].sessionId,'session');assert.equal(calls[1][0].userId,'owner');
});
