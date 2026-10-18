const crypto = require('node:crypto');

const LAB_ORDER_EMAIL = '2milclinpathlab@gmail.com';
const EMAIL_ENDPOINT = 'https://api.resend.com/emails';
const DASHBOARD_URL = 'https://findmytube.co.za/stock-dashboard.html';

function singleLine(value, maxLength = 200) {
  return String(value || '').replace(/[\r\n\x00-\x1f\x7f]+/g, ' ').trim().slice(0, maxLength);
}

function formatQuantity(item) {
  if (item.formattedQuantity) return singleLine(item.formattedQuantity);
  const quantity = Number(item.quantity);
  if (item.unitType === 'tray') {
    const size = Number(item.traySize);
    return `${quantity} tray${quantity === 1 ? '' : 's'}${size > 0 ? ` (${quantity * size} tubes)` : ''}`;
  }
  if (item.unitType === 'packet') return `${quantity} packet${quantity === 1 ? '' : 's'}`;
  return `${quantity} each`;
}

function buildOrderEmail(record, from) {
  const lines = [
    'A new stock request has been saved in Find My Tube.',
    '',
    `Order: ${singleLine(record.id)}`,
    `Requested by: ${singleLine(record.requestedBy)}`,
    `Ward / unit: ${singleLine(record.wardUnit)}`,
    `Submitted: ${singleLine(record.createdAt || record.submittedAt)}`
  ];
  if (record.contactExtension) lines.push(`Extension / speed dial: ${singleLine(record.contactExtension, 24)}`);
  lines.push('', 'Items requested:');
  for (const item of record.items) {
    const name = singleLine(item.label);
    const variant = singleLine(item.variantLabel);
    lines.push(`- ${name}${variant && !name.includes(variant) ? ` (${variant})` : ''}: ${formatQuantity(item)}`);
  }
  if (record.notes) lines.push('', 'Notes:', String(record.notes).slice(0, 500));
  lines.push('', 'Sign in to the lab dashboard to review and prepare this request:', DASHBOARD_URL);
  // Do not copy requestText or inventory fields: legacy text can contain balances.
  return {
    from,
    to: [LAB_ORDER_EMAIL],
    subject: `New stock request ${singleLine(record.id, 80)} — ${singleLine(record.wardUnit, 120)}`,
    text: lines.join('\n')
  };
}

function createStockOrderEmailSender({ apiKey = '', from = '', fetchImpl = global.fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), timeoutMs = 8000 } = {}) {
  const key = String(apiKey).trim();
  const sender = String(from).trim();
  const configured = Boolean(key && sender && !/[\r\n]/.test(sender));

  return {
    configured,
    async send(record) {
      if (!configured) return { ok: false, skipped: true, reason: 'not_configured' };
      if (!record?.id || !Array.isArray(record.items) || !record.items.length) {
        return { ok: false, skipped: true, reason: 'incomplete_order' };
      }
      try {
        const body = JSON.stringify(buildOrderEmail(record, sender));
        const idempotencyKey = `stock-order-${crypto.createHash('sha256').update(String(record.id)).digest('hex')}`;
        let statusCode = 0;
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);
          let retryable = true;
          try {
            const response = await fetchImpl(EMAIL_ENDPOINT, {
              method: 'POST',
              redirect: 'error',
              headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
              body,
              signal: controller.signal
            });
            statusCode = response.status;
            const result = await response.json().catch(() => null);
            if (response.ok && typeof result?.id === 'string' && result.id) {
              return { ok: true, skipped: false, attempts: attempt };
            }
            retryable = response.ok || response.status === 429 || response.status >= 500;
          } catch {
            // An interrupted response may already have been accepted. Retry the
            // identical payload with the same provider idempotency key.
            statusCode = 0;
          } finally {
            clearTimeout(timeout);
          }
          if (!retryable || attempt === 3) {
            return { ok: false, skipped: false, reason: 'delivery_failed', statusCode, attempts: attempt };
          }
          await sleep(500 * attempt);
        }
      } catch {
        // Notification errors must never turn a successfully saved order into a failure.
        return { ok: false, skipped: false, reason: 'delivery_failed' };
      }
    }
  };
}

module.exports = { createStockOrderEmailSender, buildOrderEmail, LAB_ORDER_EMAIL };
