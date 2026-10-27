function createPushApi({ push, getSession, readBody, send, rateLimit, getOrder }) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return async function handlePushApi(req, res, path, params) {
    if (req.method === 'GET' && path === '/api/push/config') {
      const configured = await push.ready();
      send(req, res, 200, { ok: true, configured, publicKey: configured ? push.publicKey : '' });
      return true;
    }
    if (!path.startsWith('/api/lab/push/') && !path.startsWith('/api/push/orders/')) return false;
    const lab = path.startsWith('/api/lab/push/');
    const match = lab ? path.match(/^\/api\/lab\/push\/(subscriptions)(?:\/([^/]+))?(?:\/(test|check))?$/)
      : path.match(/^\/api\/push\/orders\/([^/]+)(?:\/subscriptions(?:\/([^/]+))?(?:\/(test|check))?)?$/);
    if (!match) { send(req, res, 404, { ok: false, error: 'Not found' }); return true; }
    let scope;
    if (lab) {
      const session = await getSession(req, res);
      if (!session) return true;
      scope = { kind: 'lab', recipient: session.id, sessionId: session.id, userId: session.user.id, expiresAt: session.expiresAt };
    } else {
      let orderId;
      try { orderId = decodeURIComponent(match[1]); } catch { orderId = ''; }
      const header = String(req.headers.authorization || '');
      const token = header.startsWith('Bearer ') ? header.slice(7) : '';
      const authorization = push.verifyOrderToken(token, orderId);
      if (!authorization) { send(req, res, 403, { ok: false, error: 'Use the device where this order was placed to manage its alerts.' }); return true; }
      scope = { kind: 'client', recipient: orderId, orderId, expiresAt: authorization.expiresAt };
    }
    const ownedOrderRead = !lab && !path.includes('/subscriptions');
    const id = match[2]; const test = match[3] === 'test'; const check = match[3] === 'check';
    if (id && !uuid.test(id)) { send(req, res, 400, { ok: false, error: 'Invalid subscription' }); return true; }
    if (ownedOrderRead && req.method !== 'GET') { send(req, res, 405, { ok: false }); return true; }
    if (!ownedOrderRead && (!['GET', 'POST', 'DELETE'].includes(req.method) || (req.method !== 'POST' && !id) || ((test || check) && req.method !== 'POST') || (req.method === 'POST' && id && !test && !check))) {
      send(req, res, 405, { ok: false, error: 'Unsupported notification action' }); return true;
    }
    if (!rateLimit(req, res, test ? 'push-test' : 'push-subscribe', { limit: test ? 5 : 120, windowMs: test ? 60000 : 15 * 60000 })) return true;
    if (!await push.ready()) { send(req, res, 503, { ok: false, error: 'Push notifications are not available yet. Please use Track Orders.' }); return true; }
    try {
      if (ownedOrderRead) {
        const order = await getOrder(scope.orderId);
        send(req, res, order ? 200 : 404, order ? { ok: true, request: order } : { ok: false, error: 'Order not found' });
      } else if (req.method === 'GET') {
        const subscription = await push.find(scope, id);
        send(req, res, 200, { ok: true, enabled: Boolean(subscription), expiresAt: subscription?.expires_at || null });
      } else if (req.method === 'DELETE') {
        await push.unsubscribe(scope, id);
        send(req, res, 200, { ok: true });
      } else if (check) {
        let body;
        try { body = JSON.parse(await readBody(req)); }
        catch { send(req, res, 400, { ok: false, error: 'Invalid device check' }); return true; }
        const hash = body?.endpointHash;
        if (hash != null && (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash))) {
          send(req, res, 400, { ok: false, error: 'Invalid device check' }); return true;
        }
        send(req, res, 200, { ok: true, ...await push.inspect(scope, id, hash || null) });
      } else if (test) {
        const queued = await push.queueTest(scope, id);
        send(req, res, queued ? 202 : 404, { ok: queued, ...(queued ? {} : { error: 'Enable alerts on this device first.' }) });
      } else {
        if (scope.kind === 'client') {
          const order = await getOrder(scope.orderId);
          if (!order) { send(req, res, 404, { ok: false, error: 'Order not found' }); return true; }
          if (['collected', 'completed', 'cancelled', 'no-stock'].includes(order.status)) {
            send(req, res, 409, { ok: false, error: 'This order is finished. Its details remain in Track Orders.' }); return true;
          }
        }
        let body;
        try { body = JSON.parse(await readBody(req)); }
        catch { send(req, res, 400, { ok: false, error: 'Invalid push subscription' }); return true; }
        const subscription = await push.subscribe(scope, body?.subscription);
        send(req, res, 201, { ok: true, subscription });
      }
    } catch (error) {
      const inputError = /Invalid|Unsupported|Too many/.test(error.message);
      send(req, res, inputError ? 400 : 503, { ok: false, error: inputError ? error.message : 'Notification settings could not be saved. Please try again.' });
    }
    return true;
  };
}
module.exports = { createPushApi };
