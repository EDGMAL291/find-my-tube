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
        assert.equal(await page.locator('.tube-workspace-kicker, .group-hints > h3').count(), 0);
        assert.equal(await page.locator('.group-hints').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
        await page.locator('#menuToggleBtn').click();
        await page.waitForTimeout(250);
        assert.equal(await page.locator('#siteMenuPanel .menu-action-icon').count(), 0, 'Menu has no glyphs');
        assert.equal(await page.locator('#siteMenuPanel [data-menu-action="settings"]').count(), 0, 'Non-functional Settings entry is removed');
        assert.equal(await page.locator('#siteMenuPanel .site-menu-link').first().evaluate(el => getComputedStyle(el, '::after').display), 'none', 'Menu has no trailing arrows');
        assert.equal(await page.locator('#siteMenuPanel a[href="tel:0217996290"]').count(), 1, 'Laboratory number is present');
        assert.equal(await page.locator('#siteMenuPanel a[href^="https://wa.me/27606286757"]').count(), 1, 'WhatsApp support link is present');
        const menuBox = await page.locator('#siteMenuPanel').boundingBox();
        assert.equal(Math.round(menuBox.width), width);
        assert.equal(Math.round(menuBox.height), 900);
        assert.equal(Math.round(menuBox.y), 0);
        await page.locator('.site-menu-close').focus();
        await page.keyboard.press('Shift+Tab');
        assert.ok(await page.locator('#siteMenuPanel').evaluate(el => el.contains(document.activeElement)), 'Menu traps keyboard focus');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
        assert.equal(await page.locator('#siteMenuPanel').isVisible(), false);
        const pageBackdrop = await page.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage);
        assert.match(pageBackdrop, /find-my-tube-lab-overview/);
        assert.equal(await page.locator('#tubeLookupPanel').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Search shell shows the page photograph');
        assert.equal(await page.locator('.group-chip-icon:visible').count(), 0, 'Department navigation has no decorative glyphs');
        await page.screenshot({ path:path.join(screenshots, `browse-${width}-${theme}.png`) });
        await page.locator('#searchInput').fill('HIV');
        const card = page.locator('[data-test-name="HIV ELISA"]');
        assert.equal(await card.locator('.discovery-body').isVisible(), false);
        assert.equal(await page.locator('#drawModal').isVisible(), false);
        assert.equal(await page.locator('#selectionCartBar').isVisible(), false);
        await card.locator('.discovery-open').focus();
        await page.keyboard.press('Enter');
        const surfaces = await page.evaluate(() => ({
          backdrop: getComputedStyle(document.body, '::before').backgroundImage,
          fixed: getComputedStyle(document.body, '::before').position,
          count: getComputedStyle(document.querySelector('.results-toolbar')).backgroundColor,
          grid: getComputedStyle(document.querySelector('#cardsContainer')).backgroundColor,
          clipping: getComputedStyle(document.querySelector('.discovery-card')).overflow
        }));
        assert.equal(surfaces.backdrop, pageBackdrop, 'Search preserves the page photograph');
        assert.equal(surfaces.fixed, 'fixed');
        assert.equal(surfaces.count, 'rgba(0, 0, 0, 0)', 'Result count has no background strip');
        assert.equal(surfaces.grid, 'rgba(0, 0, 0, 0)', 'No rectangle behind result cards');
        assert.equal(surfaces.clipping, 'hidden', 'Card contents stay within card edges');
        assert.equal(await card.evaluate(el => getComputedStyle(el).borderRadius), '0px', 'Discovery uses shared square card geometry');
        assert.equal(await card.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Collapsed result shows the page photograph');
        assert.equal(await card.locator('.discovery-body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Expanded result shows the page photograph');
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
        assert.match(await page.locator('#drawSelectedList').innerText(), /HIV ELISA/);
        assert.equal(await page.locator('#drawGroups .draw-group-test-list').count(), 0);
        const tubeSize = await page.locator('#drawGroups .collection-illustration').first().boundingBox();
        assert.ok(Math.abs(tubeSize.width - 25.2) < 1 && Math.abs(tubeSize.height - 63) < 1, 'Planner tube is 40% smaller');
        assert.match(await page.locator('#drawGroups').innerText(), /Gold\/Yellow/);
        assert.match(await page.locator('#drawPlannerNote').innerText(), /own Gold\/Yellow tube/);
        await page.screenshot({ path:path.join(screenshots, `plan-${width}-${theme}.png`) });
        assert.equal((await page.locator('#closeDrawPlannerBtn').innerText()).trim(), '×');
        await page.evaluate(() => {
          ['FBC', 'Liver Function Tests (LFT)', 'HIV Viral Load', 'CD4 Count'].forEach(name => selectedTestNames.add(name));
          refreshSelectionUi({ rerenderCards: false });
        });
        const rows = await page.locator('.draw-selected-chip').evaluateAll(rows => rows.map(row => ({ height:row.getBoundingClientRect().height, width:row.getBoundingClientRect().width })));
        assert.equal(rows.length, 5);
        assert.ok(rows.every(row => row.height <= 62), 'Selected tests must be compact rows');
        await page.screenshot({ path:path.join(screenshots, `multi-plan-${width}-${theme}.png`) });
        await page.locator('.draw-modal-card').evaluate(el => { el.scrollTop = 260; });
        await page.waitForTimeout(200);
        const header = await page.locator('.draw-selection-head').evaluate(el => ({
          background:getComputedStyle(el).backgroundColor, image:getComputedStyle(el).backgroundImage,
          surface:getComputedStyle(el.closest('.draw-modal-card')).backgroundColor,
          titleOpacity:getComputedStyle(el.querySelector('h3')).opacity
        }));
        assert.equal(header.background, header.surface, 'Scrolled header must match the planner surface');
        assert.equal(header.image, 'none');
        assert.equal(header.titleOpacity, '1', 'Planner title stays visible');
        await page.screenshot({ path:path.join(screenshots, `scrolled-plan-${width}-${theme}.png`) });
        await page.locator('.draw-modal-card').evaluate(el => { el.scrollTop = 0; });
        await page.locator('[aria-label="Remove FBC from Tube Plan"]').click();
        assert.equal(await page.locator('.draw-selected-chip').count(), 4);
        await page.evaluate(() => {
          selectedTestNames.clear(); selectedTestNames.add('HIV ELISA'); refreshSelectionUi({ rerenderCards: false });
        });
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
        await page.locator('#searchInput').fill('FBC');
        const fbcCard = page.locator('[data-test-name="FBC"]');
        await fbcCard.locator('.discovery-open').click();
        assert.equal(await fbcCard.locator('.discovery-add').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Plan action is transparent');
        assert.equal(await fbcCard.locator('.profile-tests-btn').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Profile action is transparent');
        await fbcCard.locator('.discovery-add').click();
        assert.equal(await page.locator('#selectionCartBar').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Tube Plan bar is transparent');
        await fbcCard.locator('.profile-tests-btn').click();
        assert.equal(await page.locator('#profileModal').isVisible(), true, 'Profile test list opens');
        assert.equal((await page.locator('#closeProfileModalBtn').innerText()).trim(), '×');
        assert.equal(await page.locator('#profileModalList').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Profile list has no grey panel');
        assert.ok(await page.locator('#profileModalList li').evaluateAll(items => items.every(el => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)')), 'Profile rows have no grey tiles');
        await page.locator('#closeProfileModalBtn').click();
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
      const radii = await page.locator('.stock-order-card,.stock-order-request-card,.stock-order-form,.stock-catalog-toolbar,.stock-order-grid,.stock-dashboard-request-card').evaluateAll(els => els.filter(el=>el.getClientRects().length).map(el=>getComputedStyle(el).borderRadius));
      assert.ok(radii.every(radius=>radius==='0px'), `${route} inconsistent card corners: ${radii}`);
      if(route === 'order-stock.html') assert.match(await page.locator('body').innerText(), /20 of 20 stock items/);
      await page.screenshot({path:path.join(screenshots, route.replace('.html','.png'))});
      await page.close();
    }
    console.log('PASS unrelated home, stock, tracking and signed-out admin smoke checks');
    console.log(`Screenshots: ${screenshots}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
