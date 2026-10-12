// Use the actual catalogue, enrichment, search, selection and planner in Chromium.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const approved = require('../test/fixtures/selected-laboratory-tests.json');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/find-my-tube.html`);
      await page.waitForFunction(() => window.findMyTubeApp && typeof enrichedTests !== 'undefined');
      await page.evaluate(() => setSelectedTests(new Set()));
      const search = page.locator('#searchInput');
      for (const record of approved) {
        await search.fill(record.aliases[0]);
        const card = page.locator('[data-test-name=' + JSON.stringify(record.name) + ']');
        assert.equal(await card.count(), 1, record.name);
        await card.locator('.discovery-inspect').click();
        assert.match(await card.locator('.discovery-specimen').innerText(), new RegExp(record.specimen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        assert.match(await card.locator('.discovery-instruction').innerText(), /confirm/i);
        await card.locator('.discovery-details').evaluate(element => { element.open = true; });
        assert.match(await card.locator('.discovery-details').innerText(), /Clinical use/);
        await card.locator('.discovery-select').click();
        assert.equal(await search.inputValue(), '', 'Selecting a new assay still clears search');
        await card.locator('.discovery-select').click();
        assert.equal(await page.evaluate(name => getSelectedTests().filter(test => test.name === name).length, record.name), 1);

        const audit = await page.evaluate(expected => {
          const test = enrichedTests.find(test => test.name === expected.name);
          const plan = getResolvedDrawPlan([test]).plan;
          return {
            groups: getTubeGroups(test.tubeColor),
            clinicalUse: test.clinicalUse,
            section: test.grouping.sectionId,
            aliases: expected.aliases.map(alias => ({
              alias,
              exact: getExactNameMatches(normalizeForSearch(alias)).map(test => test.name),
              matches: matchesQuery(test, alias)
            })),
            items: plan.items,
            manual: plan.manual,
            collectionLabel: getCollectionFieldLabel(getTubeGroups(test.tubeColor)),
            count: formatPlanCountLabel(1, plan),
            illustration: getTubeVisualMarkup(expected.group)
          };
        }, record);
        assert.deepEqual(audit.groups, [record.group], record.name);
        assert.equal(audit.items.length, 1, record.name);
        assert.equal(audit.items[0].key, record.group);
        assert.equal(audit.items[0].count, 1);
        assert.deepEqual(audit.items[0].tests, [record.name]);
        assert.deepEqual(audit.manual, []);
        assert.notEqual(audit.clinicalUse, 'General diagnostic support test interpreted with clinical context.');
        for (const alias of audit.aliases) {
          assert.deepEqual(alias.exact, [record.name], alias.alias);
          assert.equal(alias.matches, true, alias.alias);
        }
        if (record.group.includes('Urine Container')) {
          assert.equal(audit.collectionLabel, 'Collection');
          assert.equal(audit.count, '1 collection item');
          assert.match(audit.illustration, /container/);
        }
        if (record.group === 'Yellow ACD') assert.match(audit.illustration, /tube/);
      }
      assert.equal(await page.evaluate(() => getSelectedTests().length), 15);
      const boundaries = await page.evaluate(() => {
        const plan = names => getResolvedDrawPlan(getTestsByNames(names)).plan;
        return {
          acd: getTubeGroups('Yellow ACD'),
          acdFull: getTubeGroups('Yellow (ACD) — Acid citrate dextrose'),
          mixedYellow: getTubeGroups('Yellow ACD + Gold / Yellow SST'),
          plain: getTubeGroups('Plain Urine Container'),
          wholeAndPlasma: plan(['Platelet Aggregation Studies (LTA)', 'Factor VIII Activity', 'Factor IX Activity', 'Factor XIII Activity']),
          purple: plan(['Plasma Free Metanephrines', 'G6PD Enzyme Activity', 'JAK2 V617F Mutation', 'FBC']),
          pairedSpecimens: plan(['Metanephrines (24hr Urine)', 'Plasma Free Metanephrines', 'Cryptococcal Antigen (CSF)', 'Cryptococcal Antigen (Serum)']),
          additives: ['Yellow ACD', 'Gold/Yellow', 'Plain Urine Container', 'Urine Container'].map(group => getTubeAdditiveLabel(group)),
          specialised: getResolvedDrawPlan(getTestsByNames(['Pyruvate Kinase Activity'])).plan,
          grouping: ['JAK2 V617F Mutation','Platelet Aggregation Studies (LTA)','Urine TB-LAM Antigen','IA-2 Antibodies','Insulin-like Growth Factor 1 (IGF-1)'].map(name => getTestsByNames([name])[0].grouping.sectionId)
        };
      });
      assert.deepEqual(boundaries.acd, ['Yellow ACD']);
      assert.deepEqual(boundaries.acdFull, ['Yellow ACD']);
      assert.deepEqual(boundaries.mixedYellow, ['Yellow ACD', 'Gold/Yellow']);
      assert.deepEqual(boundaries.plain, ['Plain Urine Container']);
      assert.deepEqual(boundaries.additives, ['Acid citrate dextrose (ACD)', 'SST', 'Plain urine container', 'Sterile container']);
      assert.deepEqual(boundaries.grouping, ['metabolic_genetic','haematology','micro_virology','immunology','chemistry']);
      assert.equal(boundaries.wholeAndPlasma.items.length, 2, 'LTA is not pooled with referral-plasma requests');
      const lta = boundaries.wholeAndPlasma.items.find(item => item.tests.includes('Platelet Aggregation Studies (LTA)'));
      assert.deepEqual(lta.tests, ['Platelet Aggregation Studies (LTA)']);
      assert.match(lta.detail, /whole blood.*do not refrigerate/i);
      const factorPlasma = boundaries.wholeAndPlasma.items.find(item => item !== lta);
      assert.equal(factorPlasma.tests.length, 3);
      assert.match(factorPlasma.detail, /platelet-poor citrate plasma/i);
      const separatePlasma = boundaries.purple.items.find(item => item.tests.includes('Plasma Free Metanephrines'));
      assert.deepEqual(separatePlasma.tests, ['Plasma Free Metanephrines']);
      assert.equal(separatePlasma.count, 1);
      assert.equal(boundaries.purple.items.find(item => item !== separatePlasma).count, 2, 'Existing purple volume rule counts only whole-blood requests');
      assert.equal(boundaries.pairedSpecimens.items.length, 4, 'Existing urine/CSF assays and new plasma/serum assays keep distinct collections');
      await search.evaluate(element => element.blur());
      await page.locator('#selectionCartBar').click();
      assert.match(await page.locator('#drawPlannerCount').innerText(), /^15 tests/);
      assert.match(await page.locator('#drawGroups').innerText(), /Confirm draw order/i);
      assert.match(await page.locator('#drawGroups').innerText(), /LTA whole blood/);
      assert.match(await page.locator('#drawGroups').innerText(), /Metanephrines plasma/);
      assert.match(await page.locator('#drawGroups').innerText(), /Plain Urine Container/);
      await page.locator('#drawPlannerAlerts .draw-test-guidance').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
      const guidance = await page.locator('#drawPlannerAlerts').innerText();
      for (const record of approved) assert.ok(guidance.includes(record.name), `${record.name} collection details missing`);
      assert.match(guidance, /not a general TB screen/);
      assert.match(guidance, /do not refrigerate/i);
      await page.screenshot({ path: `/tmp/fmt-laboratory-tests-${width}.png`, fullPage: true });
      assert.deepEqual(errors, [], 'No JavaScript errors');
      await page.close();
      console.log(`PASS ${width}px: all 15 records, every alias, clinical/specimen details, selection, mapping and preparation boundaries`);
    }
    // Find My Test uses the same public catalogue API; adding does not introduce new disease rules.
    const home = await browser.newPage();
    await home.goto(`${base}/index.html?tool=find-my-test`);
    await home.waitForFunction(() => window.findMyTubeApp);
    const result = await home.evaluate(names => {
      const api = window.findMyTubeApp;
      api.addTestsToPlan(names, { replace: true });
      return { found: api.getTestsByNames(names).map(test => test.name), selected: api.getSelectedTestNames(), plan: api.getResolvedDrawPlan(api.getTestsByNames(names)).plan };
    }, approved.map(record => record.name));
    assert.equal(result.found.length, 15);
    assert.equal(result.selected.length, 15);
    assert.deepEqual(result.plan.manual, []);
    console.log('PASS Find My Test shared API: all approved tests resolvable and selectable');
    await home.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
