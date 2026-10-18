const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

test('only saved orders notify the lab, and email errors never reject the saved order', { timeout: 15000 }, async () => {
  const orders = new Map();
  const deliveries = [];
  const token = 'email-fixture-session';
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const fixture = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let text = '';
    for await (const chunk of req) text += chunk;
    const body = text ? JSON.parse(text) : null;
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    if (url.pathname.endsWith('/stock_requests')) {
      if (req.method === 'POST') {
        if (body.ward_or_unit === 'Database Failure Ward') return send(500, { message: 'Fixture database failure' });
        orders.set(body.id, { ...body, stock_request_items: [] });
        return send(201, null);
      }
      if (req.method === 'DELETE') {
        orders.delete((url.searchParams.get('id') || '').replace(/^eq\./, ''));
        return send(200, null);
      }
      const id = (url.searchParams.get('id') || '').replace(/^eq\./, '');
      return send(200, [...orders.values()].filter(row => !id || row.id === id));
    }
    if (url.pathname.endsWith('/stock_request_items') && req.method === 'POST') {
      for (const item of body) {
        const order = orders.get(item.stock_request_id);
        if (order.ward_or_unit === 'Item Failure Ward') return send(500, { message: 'Fixture item write failure' });
        order.stock_request_items.push(item);
      }
      return send(201, null);
    }
    if (url.pathname.endsWith('/lab_sessions')) {
      if (req.method === 'GET' && url.searchParams.get('token_hash') === `eq.${tokenHash}`) {
        return send(200, [{ id: 'fixture-session', user_id: 'fixture-user', expires_at: new Date(Date.now() + 60000).toISOString(), users: {
          id: 'fixture-user', user_number: '12345', role: 'admin', is_active: true, active_session_token_hash: tokenHash
        } }]);
      }
      return send(200, []);
    }
    return send(200, []);
  });
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  const childSource = `
    const realFetch = global.fetch;
    global.fetch = async (url, options) => {
      if (String(url) === 'https://api.resend.com/emails') {
        const body = JSON.parse(options.body);
        process.send({ type: 'email', body });
        if (body.text.includes('Ward / unit: Email Failure Ward')) return new Response('{}', {status:403});
        return new Response(JSON.stringify({id:'fixture-email-id'}), {status:200});
      }
      return realFetch(url, options);
    };
    const {server} = require('./server');
    server.listen(0, '127.0.0.1', () => process.send({type:'ready', port:server.address().port}));
  `;
  const child = spawn(process.execPath, ['-e', childSource], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${fixture.address().port}`, SUPABASE_SERVICE_ROLE_KEY: 'fixture-only-key',
      RESEND_API_KEY: 'fixture-only-email-key', STOCK_ORDER_EMAIL_FROM: 'orders@example.com',
      STOCK_SHEETS_WEBHOOK_URL: '', STOCK_ORDER_SHEETS_WEBHOOK_URL: '' },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc']
  });
  let diagnostics = '';
  child.stderr.on('data', data => { diagnostics += data; });
  child.on('message', message => { if (message.type === 'email') deliveries.push(message.body); });
  try {
    const port = await new Promise((resolve, reject) => {
      child.on('message', message => { if (message.type === 'ready') resolve(message.port); });
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`Fixture API exited (${code}): ${diagnostics}`)));
    });
    const base = `http://127.0.0.1:${port}`;
    const payload = wardUnit => ({ requestedBy: 'Fixture Nurse', wardUnit, contactExtension: '*123#',
      notes: 'Fixture note', requestText: 'Legacy balance 987654', to: 'untrusted@example.com',
      items: [{ id: 'yellow-tubes-tray', quantity: 1 }] });
    const submit = (body, route = '/api/stock-requests', auth = false) => fetch(`${base}${route}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body)
    });
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.notifications.stockOrderEmailConfigured, true);
    assert.doesNotMatch(JSON.stringify(health), /fixture-only-email-key/);

    const valid = await submit(payload('ICU'));
    assert.equal(valid.status, 201);
    const saved = await valid.json();
    assert.equal(saved.emailNotification.ok, true);
    assert.equal(deliveries.length, 1);
    assert.equal(orders.get(saved.request.id).stock_request_items.length, 1);
    assert.deepEqual(deliveries[0].to, ['2milclinpathlab@gmail.com']);
    assert.match(deliveries[0].text, /Fixture Nurse/);
    assert.match(deliveries[0].text, /\*123#/);
    assert.ok(deliveries[0].text.includes(saved.request.id));
    assert.doesNotMatch(JSON.stringify(deliveries), /987654|untrusted@example/);
    assert.doesNotMatch(JSON.stringify(saved), /\*123#|Fixture Nurse|fixture-only-email-key/);

    assert.equal((await submit(payload('ICU'))).status, 409);
    assert.equal((await submit({ ...payload('Other'), items: [{ id: 'yellow-tubes-tray', quantity: 0 }] })).status, 400);
    assert.equal((await submit(payload('Database Failure Ward'))).status, 500);
    assert.equal((await submit(payload('Item Failure Ward'))).status, 500);
    assert.equal(deliveries.length, 1, 'Duplicates, invalid requests and failed writes do not send email');
    assert.equal([...orders.values()].some(order => order.ward_or_unit === 'Item Failure Ward'), false);

    const mailFailure = await submit(payload('Email Failure Ward'));
    assert.equal(mailFailure.status, 201, 'Provider failure cannot reject a saved stock request');
    const mailFailureResult = await mailFailure.json();
    assert.equal(mailFailureResult.emailNotification.ok, false);
    assert.equal(mailFailureResult.emailNotification.attempts, 1);
    assert.equal(orders.has(mailFailureResult.request.id), true);
    assert.match(diagnostics, /\[stock-email\] delivery-failed/);
    assert.doesNotMatch(diagnostics, /fixture-only-email-key|\*123#/);

    const manual = await submit(payload('Manual Ward'), '/api/lab/stock-requests/manual', true);
    assert.equal(manual.status, 201);
    assert.equal((await manual.json()).emailNotification.ok, true);
    assert.equal(deliveries.length, 3, 'Manual staff orders use the same notifier');
    assert.match(deliveries[2].text, /Manual Ward/);
    assert.equal((await fetch(`${base}/lib/stock-order-email.js`)).status, 404, 'Notifier stays server-only');
  } finally {
    if (child.exitCode === null) {
      const closed = new Promise(resolve => child.once('exit', resolve));
      child.kill();
      await closed;
    }
    await new Promise(resolve => fixture.close(resolve));
  }
});
