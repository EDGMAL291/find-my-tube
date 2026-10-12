const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const approved = require('./fixtures/selected-laboratory-tests.json');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/data/data.js'), 'utf8') + '; this.records = tests;', context);
const records = JSON.parse(JSON.stringify(context.records));
const byName = new Map(records.map(record => [record.name, record]));

test('15 approved tests are distinct canonical records with the selected specimens and collections', () => {
  assert.equal(approved.length, 15);
  assert.equal(new Set(records.map(record => record.name.toLowerCase())).size, records.length);
  for (const expected of approved) {
    const record = byName.get(expected.name);
    assert.ok(record, expected.name);
    assert.equal(record.tubeColor, expected.tubeColor, expected.name);
    assert.equal(record.specimen, expected.specimen, expected.name);
    assert.equal(record.turnaroundTime, 'Confirm with receiving laboratory');
    assert.match(record.criticalPrep, /confirm/i);
    assert.ok(record.notes.length > 0);
  }
});

test('all 353 pre-existing test records remain byte-equivalent after JSON serialization', () => {
  const newNames = new Set(approved.map(record => record.name));
  const existing = records.filter(record => !newNames.has(record.name));
  assert.equal(existing.length, 353);
  // Captured before the approved additions, including record order and every field.
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(existing)).digest('hex'),
    'f45a910b5e275eb156a767ee6903a131ce52169a901383b809fd205004956733');
  assert.ok(byName.has('Metanephrines (24hr Urine)'));
  assert.ok(byName.has('Cryptococcal Antigen (CSF)'));
  assert.ok(records.some(record => /anti-gad/i.test(record.name)));
});

test('specialised assay cautions and incompatible preparation boundaries are recorded', () => {
  assert.match(byName.get('G6PD Enzyme Activity').notes, /false-normal.*activity/i);
  assert.match(byName.get('G6PD Enzyme Activity').criticalPrep, /haemolysis and transfusion/i);
  const lta = byName.get('Platelet Aggregation Studies (LTA)');
  assert.equal(lta.separateCollection, true);
  assert.match(lta.notes, /room temperature.*do not refrigerate/i);
  assert.match(lta.criticalPrep, /do not apply coagulation referral-plasma processing/i);
  for (const name of ['Factor VIII Activity', 'Factor IX Activity', 'Factor XIII Activity']) {
    assert.match(byName.get(name).criticalPrep, /frozen referral-plasma requirements/i);
    assert.equal(byName.get(name).specimen, 'Platelet-poor citrate plasma');
  }
  const metanephrines = byName.get('Plasma Free Metanephrines');
  assert.equal(metanephrines.separateCollection, true);
  assert.match(metanephrines.criticalPrep, /resting posture.*rapid plasma separation/i);
  assert.match(metanephrines.criticalPrep, /do not stop medicines/i);
  const lam = byName.get('Urine TB-LAM Antigen');
  assert.match(lam.notes, /eligible people living with HIV/i);
  assert.match(lam.notes, /not a general TB screen/i);
  assert.match(lam.notes, /negative result does not exclude TB/i);
  assert.match(byName.get('Cryptococcal Antigen (Serum)').notes, /does not establish cryptococcal meningitis/i);
});
