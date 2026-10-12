const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

test('HTTP privacy boundary hides contacts and balances from guests but permits lab sessions', { timeout: 15000 }, async () => {
  const token = 'local-fixture-session';
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  let inventoryReads = 0;
  let sessionState = "active";
  const fixture = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let rows = [];
    if (url.pathname.endsWith('/lab_sessions') && url.searchParams.get('token_hash') === `eq.${tokenHash}`) {
      rows = [{ id: 'fixture-session', user_id: 'fixture-user', expires_at: new Date(Date.now() + (sessionState === "expired" ? -60000 : 60000)).toISOString(), users: {
        id: 'fixture-user', is_active: sessionState !== 'disabled', user_number: '12345', role: 'medical-technologist', active_session_token_hash: sessionState === 'revoked' ? 'replaced-token-hash' : tokenHash
      } }];
    }
    if (url.pathname.endsWith('/stock_requests')) rows = [{
      id: 'fixture-order', status: 'ready', requester_name: 'Test Nurse', ward_or_unit: 'ICU',
      contact_extension: '*123#', request_text: 'Yellow tubes (9999 on hand)', created_at: new Date().toISOString(), status_history: [], stock_request_items: []
    }];
    if (url.pathname.endsWith('/inventory_balances')) {
      inventoryReads += 1;
      rows = [{ item_key: 'YellowTubes', item_name: 'Yellow tubes', quantity_on_hand: 9999 }];
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  });
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  const child = spawn(process.execPath, ['-e', "const {server}=require('./server');server.listen(0,'127.0.0.1',()=>process.send({port:server.address().port}));"], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${fixture.address().port}`, SUPABASE_SERVICE_ROLE_KEY: 'local-fixture-key' },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc']
  });
  let diagnostics = '';
  child.stderr.on('data', data => { diagnostics += data; });
  try {
    const port = await new Promise((resolve, reject) => {
      child.once('message', message => resolve(message.port));
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`Fixture API exited (${code}): ${diagnostics}`)));
    });
    const base = `http://127.0.0.1:${port}`;
    const guestInventory = await fetch(`${base}/api/stock-inventory`);
    assert.equal(guestInventory.status, 200);
    assert.deepEqual(await guestInventory.json(), { summary: [], inventoryVisibility: 'private' });
    assert.equal(inventoryReads, 0, 'anonymous clients do not query inventory balances');
    const publicOrders = await (await fetch(`${base}/api/stock-requests?includeArchived=true`)).json();
    assert.equal(publicOrders.requests.length, 1);
    assert.equal(Object.hasOwn(publicOrders.requests[0], 'contactExtension'), false);
    assert.equal(Object.hasOwn(publicOrders.requests[0], 'requestText'), false, 'Legacy order text can contain stock balances');
    assert.doesNotMatch(JSON.stringify(publicOrders), /9999/);
    const denied = await fetch(`${base}/api/stock-inventory`, { headers: { Authorization: 'Bearer invalid-fixture-session' } });
    assert.equal(denied.status, 200);
    assert.deepEqual(await denied.json(), { summary: [], inventoryVisibility: 'private' });
    assert.equal(inventoryReads, 0, 'an invalid session cannot query balances');
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    for (const options of [auth, { headers: { Cookie: `fmt_lab_session=${token}` } }]) {
      const publicInventory = await fetch(`${base}/api/stock-inventory`, options);
      assert.deepEqual(await publicInventory.json(), { summary: [], inventoryVisibility: 'private' });
    }
    assert.equal(inventoryReads, 0, 'Public endpoint never reads balances, including authenticated cookies');
    for (const options of [{}, { headers: { Authorization: 'Bearer invalid-fixture-session' } }]) {
      const protectedInventory = await fetch(`${base}/api/lab/stock-inventory`, options);
      assert.equal(protectedInventory.status, 401);
      assert.doesNotMatch(await protectedInventory.text(), /9999/);
    }
    assert.equal(inventoryReads, 0, 'Dashboard inventory requires a valid server session');
    const staffInventoryResponse = await fetch(`${base}/api/lab/stock-inventory`, auth);
    assert.equal(staffInventoryResponse.status, 200);
    const staffInventory = await staffInventoryResponse.json();
    assert.match(staffInventoryResponse.headers.get('cache-control'), /no-store/);
    assert.equal(staffInventory.summary[0].onHand, 9999);
    const staffOrdersResponse = await fetch(`${base}/api/lab/stock-requests?includeArchived=true`, auth);
    assert.equal(staffOrdersResponse.status, 200);
    assert.equal((await staffOrdersResponse.json()).requests[0].contactExtension, '*123#');
    const allowedReads = inventoryReads;
    for (const state of ['expired', 'disabled', 'revoked']) {
      sessionState = state;
      const refused = await fetch(`${base}/api/lab/stock-inventory`, auth);
      assert.equal(refused.status, 401, state);
      assert.doesNotMatch(await refused.text(), /9999/);
      assert.equal(inventoryReads, allowedReads, `${state} session must not read balances`);
    }
  } finally {
    if (child.exitCode === null) {
      const closed = new Promise(resolve => child.once('exit', resolve));
      child.kill();
      await closed;
    }
    await new Promise(resolve => fixture.close(resolve));
  }
});
