const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOrderEmail, createStockOrderEmailSender, LAB_ORDER_EMAIL } = require('../lib/stock-order-email');

const record = {
  id: 'STK-FIXTURE-1', requestedBy: 'Test Nurse', wardUnit: 'ICU', contactExtension: '*123#',
  createdAt: '2026-10-18T10:00:00.000Z', notes: 'Please contact the ward.',
  requestText: 'Legacy private balance: 987654', quantityOnHand: 987654,
  items: [{ label: 'Yellow tubes', quantity: 2, unitType: 'tray', traySize: 100 }],
  to: 'untrusted@example.com'
};
const config = { apiKey: 'fixture-key', from: 'Find My Tube <orders@example.com>', sleep: async () => {} };
const accepted = () => ({ ok: true, status: 200, json: async () => ({ id: 'fixture-email-id' }) });

test('order email is addressed only to the lab, with accurate quantities and no stock balances', () => {
  const email = buildOrderEmail(record, config.from);
  assert.deepEqual(email.to, [LAB_ORDER_EMAIL]);
  assert.equal(LAB_ORDER_EMAIL, '2milclinpathlab@gmail.com');
  assert.match(email.text, /STK-FIXTURE-1/);
  assert.match(email.text, /Test Nurse/);
  assert.match(email.text, /ICU/);
  assert.match(email.text, /\*123#/);
  assert.match(email.text, /2 trays \(200 tubes\)/);
  assert.match(email.text, /stock-dashboard.html/);
  assert.doesNotMatch(JSON.stringify(email), /987654|untrusted@example/);
  assert.doesNotMatch(buildOrderEmail({ ...record, wardUnit: 'ICU\r\nBcc: other@example.com' }, config.from).subject, /[\r\n]/);
});

test('email configuration is optional and incomplete orders never call the provider', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return accepted(); };
  for (const options of [{}, { apiKey: 'key' }, { from: config.from }, { apiKey: 'key', from: 'a@example.com\nBcc: b@example.com' }]) {
    const sender = createStockOrderEmailSender({ ...options, fetchImpl });
    assert.equal(sender.configured, false);
    assert.deepEqual(await sender.send(record), { ok: false, skipped: true, reason: 'not_configured' });
  }
  const sender = createStockOrderEmailSender({ ...config, fetchImpl });
  assert.equal(sender.configured, true);
  assert.equal((await sender.send({ items: record.items })).skipped, true);
  assert.equal((await sender.send({ id: 'incomplete', items: [] })).skipped, true);
  assert.equal(calls, 0);
});

test('transient failures retry identical payloads and idempotency keys without changing the recipient', async () => {
  const calls = [];
  const sender = createStockOrderEmailSender({ ...config, fetchImpl: async (url, options) => {
    calls.push({ url, ...options });
    if (calls.length === 1) throw new TypeError('temporary network failure');
    if (calls.length === 2) return { ok: false, status: 503, json: async () => ({}) };
    return accepted();
  } });
  assert.deepEqual(await sender.send(record), { ok: true, skipped: false, attempts: 3 });
  assert.equal(calls.length, 3);
  assert.ok(calls.every(call => call.url === 'https://api.resend.com/emails' && call.method === 'POST' && call.redirect === 'error'));
  assert.equal(new Set(calls.map(call => call.body)).size, 1);
  assert.equal(new Set(calls.map(call => call.headers['Idempotency-Key'])).size, 1);
  assert.equal(calls[0].headers.Authorization, 'Bearer fixture-key');
  assert.deepEqual(JSON.parse(calls[0].body).to, [LAB_ORDER_EMAIL]);
  await sender.send(record);
  assert.equal(calls[3].headers['Idempotency-Key'], calls[0].headers['Idempotency-Key']);
});

test('timeouts use a fresh abort signal for a bounded retry', async () => {
  const signals = [];
  const sender = createStockOrderEmailSender({ ...config, timeoutMs: 5, fetchImpl: async (_url, options) => {
    signals.push(options.signal);
    if (signals.length === 1) return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timed out')), { once: true }));
    return accepted();
  } });
  assert.equal((await sender.send(record)).ok, true);
  assert.equal(signals.length, 2);
  assert.notEqual(signals[0], signals[1]);
  assert.equal(signals[1].aborted, false);
});

test('permanent failures, exhausted retries and malformed acknowledgements do not throw or expose secrets', async () => {
  for (const [status, expectedAttempts] of [[403, 1], [429, 3], [500, 3], [200, 3]]) {
    let calls = 0;
    const sender = createStockOrderEmailSender({ ...config, fetchImpl: async () => {
      calls += 1;
      return { ok: status === 200, status, json: async () => ({ message: 'fixture-key should stay private' }) };
    } });
    const result = await sender.send(record);
    assert.equal(result.ok, false);
    assert.equal(result.skipped, false);
    assert.equal(calls, expectedAttempts);
    assert.doesNotMatch(JSON.stringify(result), /fixture-key/);
  }
});
