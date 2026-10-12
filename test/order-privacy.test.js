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
  const fixture = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let rows = [];
    if (url.pathname.endsWith('/lab_sessions') && url.searchParams.get('token_hash') === `eq.${tokenHash}`) {
      rows = [{ id: 'fixture-session', user_id: 'fixture-user', expires_at: new Date(Date.now() + 60000).toISOString(), users: {
        id: 'fixture-user', is_active: true, user_number: '12345', role: 'medical-technologist', active_session_token_hash: tokenHash
      } }];
    }
    if (url.pathname.endsWith('/stock_requests')) rows = [{
      id: 'fixture-order', status: 'ready', requester_name: 'Test Nurse', ward_or_unit: 'ICU',
      contact_extension: '*123#', created_at: new Date().toISOString(), status_history: [], stock_request_items: []
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
    const denied = await fetch(`${base}/api/stock-inventory`, { headers: { Authorization: 'Bearer invalid-fixture-session' } });
    assert.equal(denied.status, 401);
    assert.equal(inventoryReads, 0, 'an invalid session cannot query balances');
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const staffInventoryResponse = await fetch(`${base}/api/stock-inventory`, auth);
    assert.equal(staffInventoryResponse.status, 200);
    const staffInventory = await staffInventoryResponse.json();
    assert.equal(staffInventory.inventoryVisibility, 'staff');
    assert.equal(staffInventory.summary[0].onHand, 9999);
    const staffOrdersResponse = await fetch(`${base}/api/lab/stock-requests?includeArchived=true`, auth);
    assert.equal(staffOrdersResponse.status, 200);
    assert.equal((await staffOrdersResponse.json()).requests[0].contactExtension, '*123#');
  } finally {
    if (child.exitCode === null) {
      const closed = new Promise(resolve => child.once('exit', resolve));
      child.kill();
      await closed;
    }
    await new Promise(resolve => fixture.close(resolve));
  }
});
