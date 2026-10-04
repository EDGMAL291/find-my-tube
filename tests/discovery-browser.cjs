// Run against the local server: npm start, then npm run test:browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'fmt-discovery-'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [360, 390, 412, 430, 768, 1280]) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}/find-my-tube.html`);
        await page.evaluate(theme => applyTheme(theme), theme);
        await page.locator('#searchInput').fill('HIV');
        const card = page.locator('[data-test-name="HIV ELISA"]');
        assert.equal(await card.locator('.discovery-body').isVisible(), false);
        assert.equal(await page.locator('#drawModal').isVisible(), false);
        assert.equal(await page.locator('#selectionCartBar').isVisible(), false);
        await card.locator('.discovery-open').focus();
        await page.keyboard.press('Enter');
        assert.match(await card.innerText(), /Gold\/Yellow/);
        assert.match(await card.innerText(), /Serum/);
        assert.equal(await page.evaluate(() => selectedTestNames.size), 0, 'Inspection must not add a test');
        await card.locator('.discovery-add').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#searchInput').inputValue(), 'HIV', 'Adding must preserve search results');
        assert.equal(await page.locator('#selectionCartBar').isVisible(), true);
        assert.equal(await page.locator('#drawModal').isVisible(), false, 'Adding does not force open planner');
        await card.locator('summary').click();
        assert.equal(await card.locator('details').getAttribute('open'), '');
        await card.locator('summary').click();
        const geometry = await page.locator('.discovery-card').evaluateAll(cards => cards.map(card => {
          const r = card.getBoundingClientRect(); return { top:r.top, bottom:r.bottom, left:r.left, right:r.right };
        }));
        geometry.forEach((r,i) => {
          assert.ok(r.left >= 0 && r.right <= width + 1, `card overflow at ${width}`);
          if(i) assert.ok(r.top >= geometry[i-1].bottom - 1, `card overlap at ${width}`);
        });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow');
        await page.screenshot({ path:path.join(screenshots, `search-${width}-${theme}.png`) });
        await page.locator('#selectionCartBar').click();
        assert.equal(await page.locator('#drawModal').isVisible(), true);
        await page.waitForFunction(() => document.querySelector('.draw-modal-card').getBoundingClientRect().top >= 0 && getComputedStyle(document.querySelector('#drawModal')).opacity === '1');
        await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
        assert.match(await page.locator('#drawGroups').innerText(), /HIV ELISA/);
        assert.match(await page.locator('#drawGroups').innerText(), /Gold\/Yellow/);
        assert.match(await page.locator('#drawPlannerNote').innerText(), /own Gold\/Yellow tube/);
        await page.screenshot({ path:path.join(screenshots, `plan-${width}-${theme}.png`) });
        await page.locator('#closeDrawPlannerBtn').click();
        await card.locator('.discovery-add').click();
        assert.equal(await page.evaluate(() => selectedTestNames.size), 0);
        // Real local records and production planner functions; no external mappings.
        const audit = await page.evaluate(() => {
          const plan = names => getResolvedDrawPlan(enrichedTests.filter(t => names.includes(t.name)));
          return {
            hiv: enrichedTests.filter(t => /HIV/.test(t.name)).map(t => ({name:t.name,groups:getTubeGroups(t.tubeColor),specimen:getCardSpecimenValue(t)})),
            shared: plan(['FBC','HbA1c']),
            dedicated: plan(['HIV ELISA','RPR (Syphilis Screen)','CRP']),
            sepsis: plan(['Blood Culture','Procalcitonin (PCT)','Lactate','CRP']),
            exactRules: exactDrawRules.map(rule => {
              const records = enrichedTests.filter(t => rule.tests.some(name => canonicalDrawRuleName(name) === canonicalDrawRuleName(t.name)));
              const resolved = getResolvedDrawPlan(records).plan;
              return records.every(t => resolved.items.some(item => item.tests.includes(t.name)) || resolved.manual.includes(t.name));
            }),
            records: enrichedTests.map(t => ({name:t.name, groups:getTubeGroups(t.tubeColor), plan:plan([t.name]).plan})),
            variantMarkup: [...new Set(enrichedTests.flatMap(t=>getTubeGroups(t.tubeColor)))].map(g=>getTubeVisualMarkup(g)),
            missing: getDefaultPlanItems([{name:'Unmapped regression fixture'}])
          };
        });
        assert.deepEqual(audit.hiv.find(t=>t.name==='HIV ELISA').groups, ['Gold/Yellow']);
        assert.deepEqual(audit.hiv.find(t=>t.name==='HIV Viral Load').groups, ['Pearl/White']);
        assert.deepEqual(audit.hiv.find(t=>t.name==='HIV PCR Qualitative').groups, ['Purple']);
        assert.ok(audit.hiv.every(t=>t.specimen && t.groups.length));
        const purple = audit.shared.plan.items.find(i=>i.key==='Purple');
        assert.equal(purple.count, 1);
        assert.deepEqual(purple.tests.sort(), ['FBC','HbA1c']);
        assert.equal(audit.dedicated.plan.items.find(i=>i.key==='Gold/Yellow').count, 3);
        assert.deepEqual(audit.sepsis.plan.items.find(i=>i.key==='Gray').tests, ['Lactate']);
        assert.ok(audit.exactRules.every(Boolean), 'Exact overrides must not drop selected tests');
        for(const record of audit.records) {
          assert.ok(record.groups.length ? record.plan.items.some(i=>i.tests.includes(record.name)) : record.plan.manual.includes(record.name), `${record.name} lost from plan`);
        }
        assert.deepEqual(audit.missing.manual, ['Unmapped regression fixture']);
        assert.ok(audit.variantMarkup.every(s=>s.includes('<svg') && s.includes('aria-label=') && !s.includes('<img')));
        // HIV viral-load specimen is visible, not merely present in data.
        await page.locator('[data-test-name="HIV Viral Load"] .discovery-open').click();
        assert.match(await page.locator('[data-test-name="HIV Viral Load"]').innerText(), /EDTA plasma/);
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`PASS ${width}px ${theme}: compact/expanded cards, HIV, add/remove, grouped planner, catalogue, overflow, runtime`);
      }
    }
    const drugPage = await browser.newPage({viewport:{width:390,height:844}, reducedMotion:'reduce'});
    await drugPage.goto(`${base}/find-my-tube.html`);
    const drugCases = {
      'Epilim':['Sodium Valproate'], 'valproac acid':['Sodium Valproate'], 'valproic acid':['Sodium Valproate'],
      'epilum':['Sodium Valproate'], 'epil':['Sodium Valproate'], 'Depakote':['Sodium Valproate'],
      'Tegretol':['Carbamazepine (Tegretol)'], 'Epanutin':['Phenytoin'], 'phenytoim':['Phenytoin'],
      'Keppra':['Levetiracetam (Keppra)'], 'phenobarbital':['Phenobarbitone'], 'Lanoxin':['Digoxin'],
      'Priadel':['Lithium'], 'Uniphyllin':['Theophylline'], 'Amikin':['Trough Amikacin','Peak Amikacin'],
      'gentamicin':['Trough Gentamycin','Peak Gentamycin'], 'gentamicin trough level':['Trough Gentamycin'],
      'Garamycin peak':['Peak Gentamycin'], 'Nebcin':['Trough Tobramycin','Peak Tobramycin'],
      'Vancocin':['Trough Vancomycin','Peak Vancomycin'], 'Panado':['Paracetamol (Blood)'],
      'acetaminophen':['Paracetamol (Blood)'], 'aspirin':['Salicylate (Blood)'], 'zzzzunknown':[]
    };
    for(const [query, expected] of Object.entries(drugCases)) {
      await drugPage.locator('#searchInput').fill(query);
      const actual = await drugPage.locator('.discovery-card').evaluateAll(cards => cards.map(c=>c.dataset.testName));
      assert.deepEqual(actual.sort(), expected.sort(), `Drug search: ${query}`);
    }
    await drugPage.locator('#searchInput').fill('valproac acid');
    await drugPage.locator('.discovery-open').click();
    assert.match(await drugPage.locator('.discovery-body').innerText(), /Gold\/Yellow/);
    await drugPage.locator('.discovery-add').click();
    assert.deepEqual(await drugPage.evaluate(()=>[...selectedTestNames]), ['Sodium Valproate']);
    await drugPage.close();
    console.log(`PASS ${Object.keys(drugCases).length} drug alias, typo, peak/trough and local mapping checks`);
    for (const route of ['index.html', 'order-stock.html', 'track-orders.html', 'stock-dashboard.html']) {
      const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${base}/${route}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow`);
      assert.deepEqual(errors, [], `${route} runtime errors`);
      if(route === 'order-stock.html') assert.match(await page.locator('body').innerText(), /20 of 20 stock items/);
      await page.screenshot({path:path.join(screenshots, route.replace('.html','.png'))});
      await page.close();
    }
    console.log('PASS unrelated home, stock, tracking and signed-out admin smoke checks');
    console.log(`Screenshots: ${screenshots}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
