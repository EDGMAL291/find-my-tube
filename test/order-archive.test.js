const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../assets/js/order-archive.js');
const now = Date.parse('2026-10-07T12:00:00Z');
const old = new Date(now - policy.inactivityMs).toISOString();
test('untouched orders archive at exactly 14 days, regardless of workflow status', () => {
  for (const status of ['pending', 'packed', 'ready', 'cancelled']) {
    assert.equal(policy.isArchived({status, createdAt:old}, now), true);
    assert.equal(policy.isArchived({status, createdAt:old}, now-1), false);
  }
});
test('recent activity keeps an old order active and history counts as activity', () => {
  assert.equal(policy.isArchived({status:'pending', createdAt:old, updatedAt:new Date(now).toISOString()}, now), false);
  assert.equal(policy.isArchived({status:'ready', createdAt:old, updatedAt:old,
    statusHistory:[{updatedAt:new Date(now).toISOString()}]}, now), false);
});
test('invalid timestamps do not archive and completed orders remain archived', () => {
  assert.equal(policy.isArchived({status:'pending', createdAt:'bad'}, now), false);
  assert.equal(policy.isArchived({status:'pending', createdAt:new Date(now+1000).toISOString()}, now), false);
  assert.equal(policy.isArchived({status:'completed', updatedAt:new Date(now).toISOString()}, now), true);
});
