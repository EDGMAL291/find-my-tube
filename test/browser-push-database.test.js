const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

test('PostgreSQL queues complete orders and meaningful updates, enforces privacy and leases', async () => {
 const db = new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role;
 create table users(id uuid primary key,is_active boolean,active_session_token_hash text);
 create table lab_sessions(id uuid primary key,user_id uuid references users(id),expires_at timestamptz,token_hash text);
 create table stock_requests(id text primary key,status text,status_history jsonb,line_item_count integer);
 create table stock_request_items(id uuid primary key default gen_random_uuid(),stock_request_id text references stock_requests(id) on delete cascade);`);
 const sql = fs.readFileSync('supabase/migrations/20261027_browser_push.sql','utf8');
 await db.exec(sql); await db.exec(sql);
 const user = '11111111-1111-1111-1111-111111111111', session = '22222222-2222-2222-2222-222222222222';
 await db.query(`insert into users values($1,true,'active')`, [user]);
 await db.query(`insert into lab_sessions values($1,$2,now()+interval '1 hour','active')`, [session,user]);
 const insert = async (kind, recipient, extra) => (await db.query(`insert into web_push_subscriptions(kind,recipient_key,lab_session_id,user_id,order_id,endpoint_hash,endpoint,p256dh,auth,expires_at) values($1,$2,$3,$4,$5,repeat('a',64),'https://fcm.googleapis.com/device','key','auth',now()+interval '1 hour') returning id`, [kind,recipient,...extra])).rows[0].id;
 const lab = await insert('lab', session, [session,user,null]);
 await db.exec(`insert into stock_requests values('ORDER-1','pending','[]',2)`);
 const client = await insert('client','ORDER-1',[null,null,'ORDER-1']);
 const jobs = async () => (await db.query('select * from web_push_jobs order by created_at,event_key')).rows;
 assert.equal((await jobs()).length,0);
 await db.exec(`insert into stock_request_items(stock_request_id) values('ORDER-1')`);
 assert.equal((await jobs()).length,0);
 await db.exec(`insert into stock_request_items(stock_request_id) values('ORDER-1')`);
 assert.equal((await jobs()).length,1); assert.equal((await jobs())[0].subscription_id,lab);
 await db.exec(`insert into stock_request_items(stock_request_id) values('ORDER-1')`); assert.equal((await jobs()).length,1);
 await db.exec(`update stock_requests set status='packed',status_history='[{"status":"ready"}]' where id='ORDER-1'`);
 assert.equal((await jobs()).length,2); assert.equal((await jobs()).find(j => j.event_key.includes('status:')).subscription_id,client);
 await db.exec(`update stock_requests set status='ready' where id='ORDER-1'`); assert.equal((await jobs()).length,2);
 const availability = [{status:'ready'},{type:'item-availability-notice',unavailableItemIds:['yellow']}];
 await db.query('update stock_requests set status_history=$1 where id=$2',[JSON.stringify(availability),'ORDER-1']); assert.equal((await jobs()).length,3);
 availability[1].status = ''; availability.push({status:'ready'});
 await db.query('update stock_requests set status_history=$1 where id=$2',[JSON.stringify(availability),'ORDER-1']); assert.equal((await jobs()).length,3);
 availability.push({type:'item-availability-notice',unavailableItemIds:[]});
 await db.query('update stock_requests set status_history=$1 where id=$2',[JSON.stringify(availability),'ORDER-1']); assert.equal((await jobs()).length,4);
 await db.exec(`update stock_requests set status='collected',status_history=status_history||'[{"status":"collected"}]'::jsonb where id='ORDER-1'`); assert.equal((await jobs()).length,5);
 for (const row of await jobs()) assert.deepEqual(Object.keys(row.payload).sort(), ['body','eventId','kind','orderId','title','v']);
 const claimed = (await db.query('select * from claim_web_push_jobs(2)')).rows; assert.equal(claimed.length,2); assert.ok(claimed.every(j=>j.state==='sending'&&j.attempts===1));
 assert.equal((await db.query('select * from claim_web_push_jobs(20)')).rows.length,3);
 assert.equal((await db.query('select * from claim_web_push_jobs(20)')).rows.length,0);
 await db.query(`update web_push_jobs set lease_until=now()-interval '1 minute' where id=$1`,[claimed[0].id]);
 assert.equal((await db.query('select * from claim_web_push_jobs(20)')).rows[0].attempts,2);
 await db.query(`update web_push_jobs set attempts=5,lease_until=now()-interval '1 minute' where id=$1`,[claimed[0].id]);
 assert.equal((await db.query('select * from claim_web_push_jobs(20)')).rows.length,0);
 for (const role of ['anon','authenticated']) {
  const privilege = (await db.query(`select has_table_privilege($1,'web_push_subscriptions','select') as subscriptions,has_table_privilege($1,'web_push_jobs','select') as jobs,has_function_privilege($1,'claim_web_push_jobs(integer)','execute') as claim`,[role])).rows[0];
  assert.deepEqual(privilege,{subscriptions:false,jobs:false,claim:false});
 }
 // Replaced/expired sessions cannot be queued; logout cascades their jobs.
 await db.exec(`update users set active_session_token_hash='replacement'; insert into stock_requests values('ORDER-2','pending','[]',1); insert into stock_request_items(stock_request_id) values('ORDER-2')`);
 assert.equal((await jobs()).length,5);
 await db.query('delete from lab_sessions where id=$1',[session]); assert.ok((await jobs()).every(j=>j.subscription_id!==lab));
 // Queue failure must never turn a saved status update into a failed update.
 await db.exec(`create function reject_push_test() returns trigger language plpgsql as $$ begin raise exception 'injected queue failure'; end; $$; create trigger reject_push before insert on web_push_jobs for each row execute function reject_push_test(); update stock_requests set status='ready' where id='ORDER-1'`);
 assert.equal((await db.query(`select status from stock_requests where id='ORDER-1'`)).rows[0].status,'ready');
 } finally { await db.close(); }
});
