const crypto = require('node:crypto');
const webPush = require('web-push');
const MAX_WATCH_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const PROVIDER_HOSTS = new Set(['fcm.googleapis.com', 'android.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com']);

function validateSubscription(value) {
  if (!value || typeof value !== 'object' || typeof value.endpoint !== 'string' || value.endpoint.length > 4096) throw new Error('Invalid push subscription');
  const url = new URL(value.endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')
    || (!PROVIDER_HOSTS.has(url.hostname) && !/^[a-z0-9-]+\.notify\.windows\.com$/.test(url.hostname))) throw new Error('Unsupported push provider');
  const decode = (key, length) => {
    if (typeof key !== 'string' || !/^[A-Za-z0-9_-]+={0,2}$/.test(key)) throw new Error('Invalid subscription keys');
    const bytes = Buffer.from(key, 'base64url');
    if (bytes.length !== length) throw new Error('Invalid subscription keys');
    return bytes;
  };
  const p256dh = decode(value.keys?.p256dh, 65);
  if (p256dh[0] !== 4) throw new Error('Invalid subscription keys');
  // Reject invalid curve points before they reach the delivery library.
  try { crypto.ECDH.convertKey(p256dh, 'prime256v1'); } catch { throw new Error('Invalid subscription keys'); }
  const auth = decode(value.keys?.auth, 16);
  return { endpoint: url.href, keys: { p256dh: p256dh.toString('base64url'), auth: auth.toString('base64url') } };
}

function createBrowserPush({ db, publicKey = '', privateKey = '', subject = 'https://findmytube.co.za/about.html', sender = webPush.sendNotification.bind(webPush), now = Date.now, log = console } = {}) {
  let configured = false, watchSecret;
  try {
    const secret = Buffer.from(privateKey, 'base64url');
    const curve = crypto.createECDH('prime256v1');
    curve.setPrivateKey(secret);
    const contact = new URL(subject);
    configured = Boolean(db && secret.length === 32 && ['https:', 'mailto:'].includes(contact.protocol)
      && curve.getPublicKey().equals(Buffer.from(publicKey, 'base64url')));
    if (configured) watchSecret = Buffer.from(crypto.hkdfSync('sha256', secret, 'find-my-tube', 'order-watch-v1', 32));
  } catch { /* Optional notification configuration must not prevent startup. */ }
  let readyUntil = 0, readyState = false, timer, running = false, cleanupAt = 0;
  const result = async query => {
    const { data, error } = await query.abortSignal(AbortSignal.timeout(8000));
    if (error) { const problem = new Error('Push storage unavailable'); problem.code = error.code; throw problem; }
    return data;
  };
  async function ready() {
    if (!configured) return false;
    if (now() < readyUntil) return readyState;
    try { await result(db.from('web_push_subscriptions').select('id').limit(1)); readyState = true; }
    catch { readyState = false; }
    readyUntil = now() + 30000;
    return readyState;
  }
  function issueOrderToken(orderId) {
    if (!configured || typeof orderId !== 'string' || !orderId || orderId.length > 80) return null;
    const data = Buffer.from(JSON.stringify({ v: 1, id: orderId, exp: now() + MAX_WATCH_AGE_MS, nonce: crypto.randomBytes(16).toString('base64url') })).toString('base64url');
    const signature = crypto.createHmac('sha256', watchSecret).update(data).digest('base64url');
    return `${data}.${signature}`;
  }
  function verifyOrderToken(token, orderId) {
    if (!configured || typeof token !== 'string' || token.length > 512) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const expected = crypto.createHmac('sha256', watchSecret).update(parts[0]).digest();
      const actual = Buffer.from(parts[1], 'base64url');
      if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
      const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      if (data.v !== 1 || data.id !== orderId || !Number.isSafeInteger(data.exp) || data.exp <= now() || data.exp > now() + MAX_WATCH_AGE_MS) return null;
      return { orderId, expiresAt: new Date(data.exp).toISOString() };
    } catch { return null; }
  }
  function scopeFilter(query, scope) {
    query = query.eq('kind', scope.kind).eq('recipient_key', scope.recipient);
    return scope.kind === 'lab' ? query.eq('lab_session_id', scope.sessionId).eq('user_id', scope.userId) : query.eq('order_id', scope.orderId);
  }
  async function subscribe(scope, raw) {
    const subscription = validateSubscription(raw);
    const hash = crypto.createHash('sha256').update(subscription.endpoint).digest('hex');
    const existing = await result(scopeFilter(db.from('web_push_subscriptions').select('id,endpoint_hash'), scope).limit(21));
    if (existing.length >= 20 && !existing.some(row => row.endpoint_hash === hash)) throw new Error('Too many devices are subscribed to these alerts');
    const [record] = await result(db.from('web_push_subscriptions').upsert({
      kind: scope.kind, recipient_key: scope.recipient, lab_session_id: scope.sessionId || null, user_id: scope.userId || null,
      order_id: scope.orderId || null, endpoint_hash: hash, endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, expires_at: scope.expiresAt, updated_at: new Date(now()).toISOString()
    }, { onConflict: 'kind,recipient_key,endpoint_hash' }).select('id,expires_at'));
    if (!record?.id) throw new Error('Push storage unavailable');
    return { id: record.id, expiresAt: record.expires_at };
  }
  async function find(scope, id) {
    const rows = await result(scopeFilter(db.from('web_push_subscriptions').select('id,expires_at').eq('id', id), scope));
    return rows.find(row => Date.parse(row.expires_at) > now()) || null;
  }
  async function inspect(scope, id, endpointHash) {
    const rows = await result(scopeFilter(db.from('web_push_subscriptions').select('id,expires_at,endpoint_hash').eq('id', id), scope));
    const subscription = rows.find(row => Date.parse(row.expires_at) > now());
    if (!subscription) return { enabled: false, matchesDevice: false, expiresAt: null, lastTest: null };
    // Inspect only a verified owner's channel; never return its endpoint or keys.
    const [job] = await result(db.from('web_push_jobs')
      .select('state,attempts,created_at,delivered_at,expires_at').eq('subscription_id', subscription.id)
      .like('event_key', 'test:%').order('created_at', { ascending: false }).limit(1));
    return { enabled: true, matchesDevice: Boolean(endpointHash && endpointHash === subscription.endpoint_hash),
      expiresAt: subscription.expires_at,
      lastTest: job ? { state: job.state === 'delivered' ? 'accepted' : job.state, attempts: job.attempts,
        createdAt: job.created_at, acceptedAt: job.delivered_at, expiresAt: job.expires_at } : null };
  }
  async function unsubscribe(scope, id) {
    await result(scopeFilter(db.from('web_push_subscriptions').delete().eq('id', id), scope));
  }
  async function queueTest(scope, id) {
    if (!await find(scope, id)) return false;
    const eventId = `test:${crypto.randomUUID()}`;
    await result(db.from('web_push_jobs').insert({ subscription_id: id, order_id: scope.orderId || null, event_key: eventId,
      payload: { v: 1, kind: scope.kind, orderId: scope.orderId || null, eventId,
        title: 'Find My Tube test alert', body: 'Push notifications are enabled on this device.' } }));
    void pump();
    return true;
  }
  function authorized(subscription) {
    if (!subscription || Date.parse(subscription.expires_at) <= now()) return false;
    if (subscription.kind === 'client') return Boolean(subscription.order_id);
    const session = subscription.lab_sessions;
    const user = session?.users;
    return Boolean(session && user?.is_active && session.user_id === subscription.user_id && Date.parse(session.expires_at) > now()
      && user.active_session_token_hash && user.active_session_token_hash === session.token_hash);
  }
  async function deliver(job) {
    const [subscription] = await result(db.from('web_push_subscriptions').select('*,lab_sessions(user_id,token_hash,expires_at,users(is_active,active_session_token_hash))').eq('id', job.subscription_id));
    if (!authorized(subscription)) {
      if (subscription) await result(db.from('web_push_subscriptions').delete().eq('id', subscription.id));
      return;
    }
    let statusCode = 0, valid = false;
    try {
      const target = validateSubscription({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } });
      valid = true;
      const response = await sender(target, JSON.stringify(job.payload), {
        vapidDetails: { subject, publicKey, privateKey }, TTL: 86400, urgency: 'normal', timeout: 8000,
        topic: crypto.createHash('sha256').update(job.event_key).digest('base64url').slice(0, 32)
      });
      statusCode = Number(response?.statusCode || 0);
      if (statusCode < 200 || statusCode >= 300) throw Object.assign(new Error('Provider did not accept notification'), { statusCode });

    } catch (error) {
      statusCode = Number(error.statusCode || statusCode || 0);
      if (statusCode === 404 || statusCode === 410) {
        await result(db.from('web_push_subscriptions').delete().eq('id', subscription.id));
        return;
      }
      const retryable = valid && (!statusCode || statusCode === 429 || statusCode >= 500);
      const delay = [30, 120, 600, 1800][Math.max(0, job.attempts - 1)] || 1800;
      await result(db.from('web_push_jobs').update({ state: retryable && job.attempts < 5 ? 'pending' : 'failed',
        lease_until: null, last_error_code: statusCode || null, available_at: new Date(now() + delay * 1000).toISOString()
      }).eq('id', job.id).eq('attempts', job.attempts).eq('state', 'sending'));
      log.error('[web-push] delivery-not-accepted', { statusCode, attempt: job.attempts });
      return;
    }
    await result(db.from('web_push_jobs').update({ state: 'delivered', delivered_at: new Date(now()).toISOString(), lease_until: null, last_error_code: null }).eq('id', job.id).eq('attempts', job.attempts).eq('state', 'sending'));
  }
  async function pump() {
    if (running) return;
    running = true;
    try {
      if (!await ready()) return;
      const jobs = await result(db.rpc('claim_web_push_jobs', { p_limit: 10 }));
      if (jobs.length) {
        for (let offset = 0; offset < jobs.length; offset += 3) {
          const outcomes = await Promise.allSettled(jobs.slice(offset, offset + 3).map(job => deliver(job)));
          if (outcomes.some(outcome => outcome.status === 'rejected')) log.error('[web-push] job-state-update-unavailable');
        }
      }
      if (cleanupAt < now()) {
        cleanupAt = now() + 3600000;
        await result(db.from('web_push_subscriptions').delete().lt('expires_at', new Date(now()).toISOString()));
        await result(db.from('web_push_jobs').delete().lt('expires_at', new Date(now()).toISOString()));
      }
    } catch { log.error('[web-push] queue-unavailable'); }
    finally { running = false; }
  }
  return { configured, ready, issueOrderToken, verifyOrderToken, subscribe, find, inspect, unsubscribe, queueTest, pump,
    get publicKey() { return configured ? publicKey : ''; },
    start() { if (!configured || timer) return; timer = setInterval(() => { void pump(); }, 15000); timer.unref(); void pump(); },
    stop() { clearInterval(timer); timer = null; } };
}
module.exports = { createBrowserPush, validateSubscription, MAX_WATCH_AGE_MS };
