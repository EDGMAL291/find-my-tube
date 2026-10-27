(() => {
  const prefix = 'fmt-order-push:';
  const labKey = 'fmt-lab-push-binding';
  let configPromise, labSignedIn = null, labGeneration = 0;
  const apiBase = String(window.FMT_APP_CONFIG?.stockApiBaseUrl || location.origin).replace(/\/+$/, '');
  const storageAvailable = (() => { try { localStorage.setItem('fmt-push-storage-check', '1'); localStorage.removeItem('fmt-push-storage-check'); return true; } catch { return false; } })();
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const write = (key, value) => { try { if (value) localStorage.setItem(key, JSON.stringify(value)); else localStorage.removeItem(key); } catch { /* Controls remain unavailable when storage is blocked. */ } };
  const supportMessage = () => {
    const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    if (appleMobile && !installed) return 'On iPhone or iPad, use Safari → Share → Add to Home Screen. Open the installed app to enable alerts.';
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'Push alerts are not supported here. Open the site in a supported browser; Track Orders remains available.';
    if (!storageAvailable) return 'Allow site storage in this browser to manage push alerts on this device.';
    return '';
  };
  async function request(path, options = {}, token = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const headers = token ? { Authorization: `Bearer ${token}` } : (typeof window.stockDashboardGetHeaders === 'function' ? window.stockDashboardGetHeaders() : {});
    try {
      const response = await fetch(`${apiBase}${path}`, { ...options, cache: 'no-store', credentials: token ? 'omit' : 'include',
        headers: { ...headers, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, signal: controller.signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) throw new Error(response.status >= 500 ? 'Notifications are temporarily unavailable. Please try again.' : payload.error || 'Notification settings could not be saved.');
      return payload;
    } finally { clearTimeout(timeout); }
  }
  function getConfig() {
    if (!configPromise) configPromise = request('/api/push/config').catch(error => { configPromise = null; throw error; });
    return configPromise;
  }
  const bytes = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
  async function browserSubscription(publicKey) {
    const url = new URL('./service-worker.js?v=20261027c', location.href);
    const registered = await navigator.serviceWorker.register(url, { updateViaCache: 'none' });
    // An older active worker may satisfy `ready` while the push-capable update installs.
    const updating = registered.installing || registered.waiting;
    if (updating && updating.state !== 'activated') {
      await new Promise((resolve, reject) => {
        const finish = error => { clearTimeout(timeout); updating.removeEventListener('statechange', check); error ? reject(error) : resolve(); };
        const check = () => {
          if (updating.state === 'activated') finish();
          else if (updating.state === 'redundant') finish(new Error('The notification service could not update. Reload and try again.'));
        };
        const timeout = setTimeout(() => finish(new Error('The notification service is still updating. Reload and try again.')), 12000);
        updating.addEventListener('statechange', check); check();
      });
    }
    let readyTimeout, registration;
    try { registration = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => { readyTimeout = setTimeout(() => reject(new Error('The notification service could not start. Reload the page and try again.')), 12000); })]); }
    finally { clearTimeout(readyTimeout); }
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      const currentKey = existing.options?.applicationServerKey;
      if (currentKey && btoa(String.fromCharCode(...new Uint8Array(currentKey))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== publicKey.replace(/=+$/, '')) {
        throw new Error('Notification settings changed. Reset this site’s notification permission, then enable alerts again.');
      }
      return existing;
    }
    return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(publicKey) });
  }
  function controls(container, scope) {
    if (!container) return;
    const previous = container.querySelector('.push-controls');
    const scopeKey = scope.lab ? 'lab' : scope.orderId;
    if (previous?.dataset.pushScope === scopeKey) return;
    previous?.remove();
    const panel = document.createElement('section'); panel.className = 'push-controls'; panel.dataset.pushScope = scopeKey;
    panel.innerHTML = `<h4>${scope.lab ? 'New-order push alerts' : 'Order alerts on this device'}</h4>
      <p class="push-controls-status" role="status" aria-live="polite">Checking notification options…</p>
      <div class="push-controls-actions"><button type="button" class="quick-tool-launch-btn" data-push-toggle disabled>Enable alerts</button><button type="button" class="quick-tool-clear-btn" data-push-test hidden>Send test alert</button></div>`;
    container.append(panel);
    const status = panel.querySelector('.push-controls-status'), toggle = panel.querySelector('[data-push-toggle]'), test = panel.querySelector('[data-push-test]');
    const key = scope.lab ? labKey : prefix + scope.orderId;
    const root = scope.lab ? '/api/lab/push/subscriptions' : `/api/push/orders/${encodeURIComponent(scope.orderId)}/subscriptions`;
    const generation = labGeneration;
    let enabled = false, busy = false, config;
    const active = () => panel.isConnected && (!scope.lab || (labSignedIn && generation === labGeneration));
    const record = () => read(key) || {};
    const saveBinding = bindingId => { const value = record(); if (scope.lab) write(key, bindingId ? { subscriptionId: bindingId } : null); else write(key, { ...value, subscriptionId: bindingId || null }); };
    function render(message) {
      if (!active()) return;
      if (scope.lab) window.FMT_PUSH.labEnabled = enabled;
      const unsupported = supportMessage();
      toggle.textContent = enabled ? 'Turn off alerts' : 'Enable alerts';
      toggle.disabled = busy || (!enabled && Boolean(unsupported || !config?.configured || Notification.permission === 'denied'));
      test.hidden = !enabled; test.disabled = busy || Boolean(unsupported) || (typeof Notification !== 'undefined' && Notification.permission !== 'granted');
      status.textContent = message || (enabled
        ? scope.lab ? 'Alerts are on for this signed-in lab session, even when the dashboard is closed.' : 'Alerts are on for this order. You can close the site; use Track Orders for the latest details.'
        : unsupported || (!config?.configured ? scope.lab ? 'Push alerts need server setup. The dashboard and Track Orders still work.' : 'Use Track Orders to follow this request.'
          : Notification.permission === 'denied' ? 'Notifications are blocked. Change this site’s notification permission in your browser settings.'
            : scope.lab ? 'Get a push alert when a new stock order is saved. Sign in again when your lab session expires to renew alerts.' : 'Get optional alerts for status and unavailable-item updates. No email or phone number is needed.'));
    }
    (async () => {
      try {
        config = await getConfig();
        if (!active()) return;
        const id = record().subscriptionId;
        if (id && config.configured) {
          const state = await request(`${root}/${id}`, {}, scope.token);
          enabled = state.enabled;
          if (!enabled) saveBinding(null);
        }
        if (!scope.lab && !config.configured && !record().subscriptionId) { panel.remove(); return; }
        render();
      } catch { render('Notification settings could not load. Reload the page to try again.'); }
    })();
    toggle.addEventListener('click', async () => {
      if (busy || !active()) return;
      busy = true;
      // Request permission directly from the click, before awaiting network/SW work.
      const permission = enabled ? null : Notification.permission === 'default' ? Notification.requestPermission() : Promise.resolve(Notification.permission);
      render(enabled ? 'Turning alerts off…' : 'Enabling alerts…');
      try {
        if (enabled) {
          await request(`${root}/${record().subscriptionId}`, { method: 'DELETE' }, scope.token);
          if (!active()) return;
          enabled = false; saveBinding(null);
        } else {
          if (await permission !== 'granted') { render('Notifications were not enabled. You can still use Track Orders.'); return; }
          const subscription = await browserSubscription(config.publicKey);
          if (!active()) return;
          const result = await request(root, { method: 'POST', body: JSON.stringify({ subscription: subscription.toJSON() }) }, scope.token);
          if (!active()) return;
          enabled = true; saveBinding(result.subscription.id);
        }
        render();
      } catch (error) { render(error.name === 'AbortError' ? 'Confirmation was interrupted. Reload this page to check your notification settings.' : error.message); }
      finally { busy = false; if (active()) { toggle.disabled = false; render(status.textContent); } }
    });
    test.addEventListener('click', async () => {
      if (busy || !active()) return;
      busy = true; render('Queuing a test alert…');
      try { await request(`${root}/${record().subscriptionId}/test`, { method: 'POST' }, scope.token); render('Test alert queued. It may take a moment to appear.'); }
      catch (error) { render(error.message); }
      finally { busy = false; render(status.textContent); }
    });
  }
  window.FMT_PUSH = {
    labEnabled: false,
    async getOwnedOrder(orderId) {
      const value = read(prefix + orderId);
      if (!value?.token || value.expiresAt <= Date.now()) return null;
      return (await request(`/api/push/orders/${encodeURIComponent(orderId)}`, {}, value.token)).request;
    },
    labSessionChanged(signedIn) {
      if (labSignedIn === signedIn) return;
      if (labSignedIn === true && !signedIn) write(labKey, null);
      labSignedIn = signedIn; labGeneration++; window.FMT_PUSH.labEnabled = false;
      const panel = document.getElementById('labPushPanel');
      if (!panel) return;
      panel.hidden = !signedIn; panel.replaceChildren();
      if (signedIn) controls(panel, { lab: true });
    },
    rememberOrder(orderId, token) {
      if (typeof token !== 'string' || token.length > 512) return;
      try {
        const data = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
        if (data.id !== orderId || data.exp <= Date.now()) return;
        write(prefix + orderId, { token, expiresAt: data.exp, subscriptionId: null });
      } catch { /* A missing/invalid optional token must never affect a saved order. */ }
    },
    renderOrderControls(container, orderId, orderStatus = 'pending') {
      const value = read(prefix + orderId);
      if (!value?.token || value.expiresAt <= Date.now()) return;
      if (['completed', 'collected', 'cancelled', 'no-stock'].includes(orderStatus) && !value.subscriptionId) return;
      controls(container, { lab: false, orderId, token: value.token });
    }
  };
  if (document.body.dataset.appPage === 'stock-dashboard') {
    window.FMT_PUSH.labSessionChanged(typeof stockDashboardSession !== 'undefined' && Boolean(stockDashboardSession));
  }
})();
