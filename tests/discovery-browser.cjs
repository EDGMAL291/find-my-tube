// Run against the local server: npm start, then npm run test:browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const base = process.env.FMT_TEST_URL || 'http://127.0.0.1:3000';
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'fmt-discovery-'));
const isRemoteBase = !['127.0.0.1', 'localhost', '0.0.0.0'].includes(new URL(base).hostname);
let remoteAppVersion = '';

async function createTestPage(browser, options = {}) {
  const page = await browser.newPage(options);
  if (isRemoteBase) {
    if (!remoteAppVersion) {
      const response = await fetch(`${base}/find-my-tube.html`);
      assert.equal(response.ok, true, `Could not read remote shell: ${response.status}`);
      const html = await response.text();
      remoteAppVersion = html.match(/const APP_VERSION = "([^"]+)"/)?.[1] || '';
      assert.ok(remoteAppVersion, 'Remote shell must expose an app version');
    }
    await page.addInitScript((version) => {
      localStorage.setItem('fmt-app-version', version);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register = async () => ({
          waiting: null,
          addEventListener() {},
          update() {}
        });
      }
    }, remoteAppVersion);
  }
  return page;
}

async function exerciseTubePlanWorkflow(page, width) {
  await page.evaluate(() => setSelectedTests(new Set()));
  const search = page.locator('#searchInput');
  async function select(query, name) {
    await search.fill(query);
    const card = page.locator('[data-test-name=' + JSON.stringify(name) + ']');
    const before = await page.locator('.discovery-card').count();
    if (width <= 620) await card.locator('.discovery-select').tap();
    else await card.locator('.discovery-select').click();
    assert.equal(await search.inputValue(), '', 'Selection clears the field for the next test');
    assert.equal(await page.locator('#searchClearBtn').isVisible(), false);
    assert.equal(await page.locator('.discovery-card').count(), before, 'Selection preserves results');
    assert.equal(await card.locator('.discovery-select').getAttribute('aria-pressed'), 'true');
    assert.match(await card.innerText(), /✓ In Tube Plan/);
    assert.equal(await page.locator('#drawModal').isVisible(), false, 'No forced modal');
    if (width <= 620) assert.equal(await search.evaluate(el => el === document.activeElement), true, 'Tap preserves active search keyboard');
  }
  async function verifyCount() {
    await page.locator('#selectionCartBar').waitFor({state:'visible'});
    const expected = await page.evaluate(() => {
      const count = getSelectedTests().length;
      return `${count} test${count === 1 ? '' : 's'}`;
    });
    const actual = await page.locator('#selectionCartCount').innerText();
    if (actual !== expected) {
      console.log('Dock diagnostic', await page.evaluate(() => ({
        classes: document.body.className,
        elements: ['selectionCartBar','selectionCartCount'].map(id => {
          const el = document.getElementById(id), css=getComputedStyle(el);
          return {id, text:el.textContent, html:el.innerHTML, visibility:css.visibility, display:css.display, opacity:css.opacity, hidden:el.hidden, rect:el.getBoundingClientRect().toJSON()};
        })
      })));
      await page.screenshot({path:path.join(screenshots, 'dock-failure.png')});
    }
    assert.equal(actual, expected, 'Dock shows the selected test count');
  }
  async function resolvedCount() {
    return page.evaluate(() => getResolvedDrawPlan(getSelectedTests()).plan.items.reduce((sum,item)=>sum+item.count,0));
  }
  await select('CRP', 'CRP');
  await select('FBC', 'FBC');
  await select('LFT', 'Liver Function Tests (LFT)');
  await verifyCount();
  assert.equal(await resolvedCount(), 2, 'LFT and CRP share gold');
  assert.equal(await page.locator('#selectionCartBar img, #selectionCartBar svg').count(), 0, 'Collection artwork is reserved for the full planner');
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.screenshot({path:path.join(screenshots, `workflow-${width}-${theme}.png`)});
  await search.evaluate(el=>el.blur());
  await page.waitForFunction(()=>!document.body.classList.contains('is-mobile-search-active'));
  await page.locator('#menuToggleBtn').click();
  assert.equal(await page.locator('#selectionCartBar').isVisible(),false,'Menu hides the planner banner');
  await page.locator('#siteMenuPanel .site-menu-list').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  assert.equal(await page.locator('#selectionCartBar').isVisible(),false,'Menu scrolling cannot reveal the planner banner');
  await page.keyboard.press('Escape');
  await page.locator('#siteMenuPanel').waitFor({state:'hidden'});
  await verifyCount();
  await select('INR', 'INR');
  await verifyCount();
  const names = await page.evaluate(() => [...selectedTestNames]);
  await search.fill('INR');
  await page.locator('[data-test-name="INR"] .discovery-select').click();
  assert.deepEqual(await page.evaluate(() => [...selectedTestNames]), names);
  assert.equal(await search.inputValue(), '', 'Repeat selection also clears the field');
  // Details is a distinct keyboard control and never changes plan membership.
  const details = page.locator('[data-test-name="INR"] .discovery-inspect');
  await details.focus();
  await page.keyboard.press('Enter');
  assert.equal(await details.getAttribute('aria-expanded'), 'true');
  assert.match(await page.locator('[data-test-name="INR"] .discovery-body').innerText(), /Specimen|Collection/);
  assert.deepEqual(await page.evaluate(() => [...selectedTestNames]), names);
  await page.locator('#selectionCartBar').click();
  assert.equal(await page.locator('#selectionCartBar').getAttribute('aria-expanded'), 'true');
  const selectedToggle = page.locator('#drawTestsToggleBtn');
  if (await selectedToggle.getAttribute('aria-expanded') === 'true') await selectedToggle.click();
  assert.equal(await page.locator('#drawSelectedList').isVisible(), false);
  assert.equal(await selectedToggle.getAttribute('aria-controls'), 'drawSelectedList');
  await selectedToggle.focus();
  await page.keyboard.press('Enter');
  assert.equal(await selectedToggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#drawSelectedList').isVisible(), true);
  await selectedToggle.click();
  assert.equal(await page.locator('#drawSelectedList').isVisible(), false);
  await selectedToggle.click();
  const fullCount = await page.evaluate(() => {
    const selected=getSelectedTests(), {plan}=getResolvedDrawPlan(selected);
    return `${selected.length} tests • ${formatPlanCountLabel(plan.items.reduce((sum,item)=>sum+item.count,0),plan)}`;
  });
  assert.equal(await page.locator('#drawPlannerCount').textContent(), fullCount);
  assert.match(await selectedToggle.innerText(), /^4 tests selected$/);
  async function verifyActionsRow() {
    const count = await selectedToggle.boundingBox();
    const clear = await page.locator('#drawClearAllBtn').boundingBox();
    assert.ok(Math.abs(count.y - clear.y) < 2, 'Count and clear-all share one row');
    assert.ok(Math.abs(count.width - clear.width) < 1, 'Selected tests and clear-all share the available width equally');
    assert.ok(count.x + count.width <= clear.x + 1, 'Count and clear-all stay side by side');
    const inset = await page.locator('#drawModal .draw-selection-actions').evaluate(el => {
      const style = getComputedStyle(el);
      return [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft];
    });
    assert.deepEqual(inset, ['2px', '2px', '2px', '2px'], 'Planner controls have a small inset');
  }
  await verifyActionsRow();
  await page.locator('#closeDrawPlannerBtn').focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#drawModal').evaluate(el => el.contains(document.activeElement)), true, 'Planner traps focus');
  await page.locator('[aria-label="Remove INR from Tube Plan"]').click();
  assert.equal(await page.evaluate(() => selectedTestNames.has('INR')), false);
  assert.equal(await page.locator('#drawModal').evaluate(el => el.contains(document.activeElement)), true, 'Removal retains usable focus');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#drawModal').isVisible(), false);
  assert.equal(await page.locator('#selectionCartBar').getAttribute('aria-expanded'), 'false');
  await verifyCount();
  // Real profile input collapses component selections and retains resolver overrides.
  await page.evaluate(() => {
    const component = profileComponentsByName['Liver Function Tests (LFT)'].find(name => enrichedTests.some(t=>t.name===name));
    setSelectedTests(new Set([component]));
  });
  await select('LFT', 'Liver Function Tests (LFT)');
  assert.deepEqual(await page.evaluate(() => [...selectedTestNames]), ['Liver Function Tests (LFT)']);
  await verifyCount();
  await page.evaluate(() => setSelectedTests(new Set()));
  await select('HIV ELISA', 'HIV ELISA');
  await select('RPR', 'RPR (Syphilis Screen)');
  await select('CRP', 'CRP');
  assert.equal(await resolvedCount(), 3, 'Dedicated gold remains dedicated');
  await verifyCount();
  assert.match(await page.locator('#drawPlannerNote').textContent(), /own Gold\/Yellow/);
  await page.evaluate(() => setSelectedTests(new Set(['OGTT (fasting, 1hr, 2hr)'])));
  assert.equal(await resolvedCount(), 3, 'OGTT multiple draws remain');
  await verifyCount();
  await page.evaluate(() => setSelectedTests(new Set(['FBC', 'HbA1c', 'ESR'])));
  assert.equal(await resolvedCount(), 2, 'Purple volume remains');
  await verifyCount();
  await page.evaluate(() => setSelectedTests(new Set(['Antenatal Screen (ANTINV)'])));
  assert.equal(await resolvedCount(), 6, 'Antenatal minimums remain');
  await verifyCount();
  await page.evaluate(() => setSelectedTests(new Set(['Ammonia'])));
  assert.match(await page.locator('#drawPlannerAlerts').textContent(), /courier|Separate plasma/);
  // Unknown mappings remain recorded/manual, including in the compact plan.
  await page.evaluate(() => {
    const fixture = enrichTest({name:'Unmapped workflow fixture', tubeColor:'Recorded uncommon specimen', specimen:'Recorded local specimen'});
    enrichedTests.push(fixture);
    setSelectedTests(new Set([fixture.name]));
  });
  assert.equal(await page.locator('#selectionCartCount').innerText(), '1 test');
  assert.equal(await resolvedCount(), 0, 'Unknown mapping stays unresolved');
  await page.locator('#selectionCartBar').click();
  assert.match(await page.locator('#drawPlannerNote').innerText(), /Recorded uncommon specimen.*Confirm/);
  assert.equal(await page.locator('#drawGroups .tube-photo-visual-adult').count(), 0, 'Unknown specimen never becomes a guessed blood tube');
  await page.locator('#closeDrawPlannerBtn').click();
  await page.evaluate(() => {
    enrichedTests.splice(enrichedTests.findIndex(t=>t.name==='Unmapped workflow fixture'),1);
    setSelectedTests(new Set(['Semen Analysis']));
  });
  await verifyCount();
  assert.match(await page.locator('#drawGroups').textContent(), /semen/i);
  assert.match(await page.locator('#drawPlannerCount').textContent(), /collection item/);
  // Simulate the visual viewport shrinking and panning above a phone keyboard.
  if (width <= 620) {
    await search.fill('CRP');
    await page.evaluate(() => {
      Object.defineProperty(visualViewport, 'height', {configurable:true, get:()=>430});
      Object.defineProperty(visualViewport, 'offsetTop', {configurable:true, get:()=>12});
      visualViewport.dispatchEvent(new Event('resize'));
    });
    await select('CRP', 'CRP');
    const geometry = await page.evaluate(() => {
      const dock = document.querySelector('#selectionCartBar').getBoundingClientRect();
      const search = document.querySelector('#tubeLookupPanel').getBoundingClientRect();
      const results = document.querySelector('#cardsContainer');
      return {dockBottom:dock.bottom, dockTop:dock.top, searchBottom:search.bottom, padding:parseFloat(getComputedStyle(results).paddingBottom), dockHeight:dock.height};
    });
    assert.ok(geometry.dockBottom <= 442, 'Plan stays above simulated keyboard');
    assert.ok(geometry.dockTop > geometry.searchBottom, 'Plan does not cover search input');
    assert.ok(geometry.padding >= geometry.dockHeight, 'Results reserve scrolling space for the dock');
    await page.screenshot({path:path.join(screenshots, `keyboard-${width}-${theme}.png`)});
    await page.evaluate(() => {
      delete visualViewport.height; delete visualViewport.offsetTop;
      visualViewport.dispatchEvent(new Event('resize'));
    });
  }
  await page.locator('#selectionCartBar').click();
  await page.locator('#drawClearAllBtn').click();
  assert.equal(await page.evaluate(() => selectedTestNames.size), 0, 'Clear all immediately removes every selected test');
  await page.locator('#closeDrawPlannerBtn').click();
  assert.equal(await page.locator('#selectionCartBar').isVisible(), false);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No workflow overflow');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [360, 390, 412, 430, 768, 1280]) {
      for (const theme of ['light', 'dark']) {
        const page = await createTestPage(browser, { viewport: { width, height: 900 }, hasTouch: width <= 620, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}/find-my-tube.html`);
        await page.evaluate(theme => applyTheme(theme), theme);
        const heading = await page.locator('#tubeWorkspaceTitle').evaluate(el => {
          const style=getComputedStyle(el), range=document.createRange();
          range.selectNodeContents(el);
          return {weight:style.fontWeight, lines:range.getClientRects().length, fits:el.scrollWidth<=el.clientWidth};
        });
        assert.deepEqual(heading, {weight:'400', lines:1, fits:true}, 'Workflow heading stays readable on one line');
        const description = await page.locator('.tube-workspace-intro p').evaluate(el=>({
          size:parseFloat(getComputedStyle(el).fontSize),
          heading:parseFloat(getComputedStyle(document.querySelector('#tubeWorkspaceTitle')).fontSize)
        }));
        assert.ok(description.size <= description.heading*.82, 'Search explanation is visibly smaller than its heading');
        assert.equal(await page.locator('.brand-home-btn').evaluate(el=>getComputedStyle(el).fontWeight), '400');
        assert.equal(await page.locator('.tube-workspace-kicker, .group-hints > h3').count(), 0);
        assert.equal(await page.locator('.group-hints').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
        const hamburger = await page.locator('#menuToggleBtn').evaluate(el => ({
          background: getComputedStyle(el).backgroundColor,
          border: getComputedStyle(el).borderTopStyle,
          paths: el.querySelectorAll('.header-menu-icon path').length,
          middleOpacity: getComputedStyle(el.querySelector('.header-menu-icon path:nth-child(2)')).opacity
        }));
        assert.deepEqual(hamburger, { background:'rgba(0, 0, 0, 0)', border:'none', paths:3, middleOpacity:'1' });
        const menuToggleBox = await page.locator('#menuToggleBtn').boundingBox();
        const contentGuide = await page.locator('#tubeWorkspaceTitle').boundingBox();
        const brandTitle = await page.locator('.brand-home-btn').evaluate(el => ({
          top:el.getBoundingClientRect().top, center:el.getBoundingClientRect().left+el.getBoundingClientRect().width/2,
          size:getComputedStyle(el).fontSize
        }));
        await page.locator('#menuToggleBtn').click();
        await page.waitForTimeout(250);
        const menuCloseBox = await page.locator('#siteMenuPanel .site-menu-close').boundingBox();
        const menuContent = await page.locator('#siteMenuPanel .site-menu-list').boundingBox();
        assert.ok(Math.abs(menuContent.x-contentGuide.x)<2, 'Menu uses the same left content guide as the page');
        assert.ok(Math.abs(menuContent.y-contentGuide.y)<2, 'Menu starts at the page content level');
        const homeLabel = await page.locator('#siteMenuPanel [data-menu-action="home"] .menu-action-label').boundingBox();
        assert.ok(Math.abs(homeLabel.y-contentGuide.y)<2, 'Home label aligns with the content heading top');
        const menuTitle = await page.locator('#siteMenuPanel .site-menu-title').evaluate(el => ({
          top:el.getBoundingClientRect().top, center:el.getBoundingClientRect().left+el.getBoundingClientRect().width/2,
          size:getComputedStyle(el).fontSize, weight:getComputedStyle(el).fontWeight
        }));
        assert.ok(Math.abs(menuTitle.top-brandTitle.top)<1 && Math.abs(menuTitle.center-brandTitle.center)<1, 'Menu replaces the page title position');
        assert.equal(menuTitle.size,brandTitle.size,'Menu retains title font size');
        assert.equal(menuTitle.weight,'400');
        assert.ok((await page.locator('#siteMenuPanel .menu-action-label').evaluateAll(items=>items.map(el=>getComputedStyle(el).fontWeight))).every(weight=>weight==='400'), 'Menu labels are not bold');
        assert.ok(Math.abs(menuCloseBox.x - menuToggleBox.x) < 1, 'Menu close aligns horizontally with hamburger');
        assert.ok(Math.abs(menuCloseBox.y - menuToggleBox.y) < 1, 'Menu close aligns vertically with hamburger');
        assert.ok(Math.abs(menuCloseBox.width - menuToggleBox.width) < 1 && Math.abs(menuCloseBox.height - menuToggleBox.height) < 1, 'Menu close preserves the hamburger hit target');
        const menuCloseVisual = await page.locator('#siteMenuPanel .site-menu-close').evaluate(el => ({
          border:getComputedStyle(el).borderTopStyle,
          background:getComputedStyle(el).backgroundColor,
          radius:getComputedStyle(el).borderRadius
        }));
        assert.deepEqual(menuCloseVisual, {border:'none', background:'rgba(0, 0, 0, 0)', radius:'0px'});
        assert.equal(await page.locator('#siteMenuPanel .menu-action-icon').count(), 0, 'Menu has no glyphs');
        assert.equal(await page.locator('#siteMenuPanel .menu-action-meta').count(), 0, 'Menu has no descriptive subtitles');
        assert.equal(await page.locator('#siteMenuPanel [data-menu-action="settings"]').count(), 0, 'Non-functional Settings entry is removed');
        assert.equal(await page.locator('#siteMenuPanel .site-menu-link').first().evaluate(el => getComputedStyle(el, '::after').display), 'none', 'Menu has no trailing arrows');
        assert.equal(await page.locator('#siteMenuPanel a[href="tel:0217996290"]').count(), 1, 'Laboratory number is present');
        assert.equal(await page.locator('#siteMenuPanel a[href^="https://wa.me/27606286757"]').count(), 1, 'WhatsApp support link is present');
        assert.equal(await page.getByRole('menuitem',{name:'Message laboratory on WhatsApp'}).locator('svg').count(),1);
        assert.equal(await page.getByRole('menuitem',{name:'Call laboratory on 021 799 6290'}).locator('svg').count(),1);
        assert.equal(await page.locator('#siteMenuPanel a[href="./contact-feedback.html"]').count(),0,'Retired Contact and feedback page is absent');
        assert.deepEqual(
          await page.locator('#siteMenuPanel [data-group="secondary"] > *').evaluateAll(items => items.map(item => item.matches('[data-menu-action="about"]') ? 'about' : item.className)),
          ['about', 'site-menu-contact-actions'],
          'About is followed directly by phone and WhatsApp actions'
        );
        await page.screenshot({path:path.join(screenshots, `menu-${width}-${theme}.png`)});
        const menuVisual = await page.locator('#siteMenuPanel').evaluate(el => ({
          backgroundImage: getComputedStyle(el).backgroundImage,
          backdropFilter: getComputedStyle(el).backdropFilter
        }));
        assert.match(menuVisual.backgroundImage, /menu-laboratory-blue-yellow/);
        assert.equal(menuVisual.backdropFilter, 'none', 'Menu photograph must remain sharp');
        const menuBox = await page.locator('#siteMenuPanel').boundingBox();
        assert.equal(Math.round(menuBox.width), width);
        assert.equal(Math.round(menuBox.height), 900);
        assert.equal(Math.round(menuBox.y), 0);
        assert.equal(await page.locator('#siteMenuPanel').evaluate(el => el.scrollHeight <= el.clientHeight), true, `Menu should fit without scrolling at ${width}`);
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
        assert.equal(await card.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.1)', 'Result card uses 10% frost');
        assert.equal(await card.locator('.discovery-body').isVisible(), false);
        assert.equal(await page.locator('#drawModal').isVisible(), false);
        assert.equal(await page.locator('#selectionCartBar').isVisible(), false);
        await card.locator('.discovery-select').focus();
        await page.keyboard.press('Enter');
        assert.deepEqual(await page.evaluate(() => [...selectedTestNames]), ['HIV ELISA'], 'Primary result selects immediately');
        assert.equal(await card.locator('.discovery-select').getAttribute('aria-pressed'), 'true');
        assert.match(await card.innerText(), /✓ In Tube Plan/);
        assert.equal(await card.locator('.discovery-body').isVisible(), false, 'Selection does not force details open');
        await card.locator('.discovery-inspect').click();
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
        assert.equal(await card.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.1)', 'Collapsed result keeps the page photograph behind 10% frost');
        assert.equal(await card.locator('.discovery-body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Expanded result shows the page photograph');
        assert.match(await card.innerText(), /Gold\/Yellow/);
        assert.match(await card.innerText(), /Serum/);
        assert.equal(await page.evaluate(() => selectedTestNames.size), 1, 'Details must not change selection');
        await card.locator('.discovery-select').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.evaluate(() => selectedTestNames.size), 1, 'Repeated selection must not remove a test');
        assert.equal(await page.locator('#searchInput').inputValue(), '', 'Adding clears the search field');
        assert.equal(await page.locator('#selectionCartBar').isVisible(), true);
        assert.equal(await page.locator('#selectionCartBar .selection-cart-icon').count(), 0, 'Floating Tube Plan has no glyph');
        assert.equal((await page.locator('#selectionCartBar .selection-cart-label').innerText()).trim(), 'Tube Plan');
        assert.equal((await page.locator('#selectionCartCount').innerText()).trim(), '1 test');
        assert.equal(await page.locator('#selectionCartBar img, #selectionCartBar svg').count(), 0);
        assert.equal(await page.locator('#selectionCartBar').evaluate(el => getComputedStyle(el).borderTopStyle), 'solid');
        const dockFrost = await page.locator('#selectionCartBar').evaluate(el => ({
          background:getComputedStyle(el).backgroundColor, image:getComputedStyle(el).backgroundImage,
          filter:getComputedStyle(el).backdropFilter
        }));
        assert.equal(dockFrost.background, 'rgba(255, 255, 255, 0.1)', 'Compact planner has translucent frost');
        assert.equal(dockFrost.image, 'none', 'No opaque gradient hides the photograph');
        assert.match(dockFrost.filter, /blur\(8px\)/);
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
        assert.match(await page.locator('#drawModal').evaluate(el => getComputedStyle(el).backgroundImage), /find-my-tube-lab-overview/);
        assert.equal(await page.locator('.draw-modal-card').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Tube Plan has no opaque enclosing card');
        assert.equal(await page.locator('.draw-result-card').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Tube Plan results remain transparent over the photograph');
        assert.equal(await page.evaluate(() => document.body.classList.contains('draw-modal-open')), true);
        await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
        assert.equal(await page.locator('#drawSelectedList').isVisible(), false);
        await page.locator('#drawTestsToggleBtn').click();
        assert.match(await page.locator('#drawSelectedList').innerText(), /HIV ELISA/);
        assert.equal(await page.locator('#drawGroups .draw-group-test-list').count(), 0);
        const plannerTube = page.locator('#drawGroups .tube-photo-visual-adult').first();
        const tubeSize = await plannerTube.boundingBox();
        assert.ok(Math.abs(tubeSize.width - 25.2) < 1 && Math.abs(tubeSize.height - 57.6) < 1, 'Planner tube is 40% smaller');
        assert.match(await plannerTube.locator('img').getAttribute('src'), /realistic-empty-tube-yellow-v4\.png$/, 'Planner uses realistic tube photography');
        await plannerTube.locator('img').evaluate(img => img.decode());
        const artworkFits = await plannerTube.evaluate(el => {
          const slot=el.getBoundingClientRect(), img=el.querySelector('img').getBoundingClientRect();
          const card=el.closest('.draw-group-card').getBoundingClientRect();
          return img.top>=slot.top-1 && img.bottom<=slot.bottom+1 &&
            img.left>=slot.left-1 && img.right<=slot.right+1 &&
            img.top>=card.top && img.bottom<=card.bottom &&
            getComputedStyle(el.querySelector('img')).objectFit==='contain';
        });
        assert.equal(artworkFits, true, 'Whole yellow tube fits its artwork slot and collection card');
        assert.match(await plannerTube.getAttribute('aria-label'), /Gold\/Yellow collection tube/);
        assert.match(await page.locator('#drawGroups').innerText(), /Gold\/Yellow/);
        assert.ok(await page.locator('#drawGroups .draw-order-step').evaluateAll(items => items.every(item => /^(Collection order:|Collected separately)/.test(item.textContent.trim()))), 'Planner uses explicit collection-order wording');
        assert.doesNotMatch(await page.locator('#drawGroups').innerText(), /\bDraw\s+\d+/i, 'Planner must not present sequence numbers as draw quantities');
        assert.ok(await page.locator('#drawGroups .draw-group-count-badge, #drawGroups .tube-option-quantity').evaluateAll(items => items.every(item => /^Quantity:\s*\d+/.test(item.textContent.trim()))), 'Planner labels tube quantities explicitly');
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
        await page.locator('#drawPlannerBody').evaluate(el => { el.scrollTop = 260; });
        await page.waitForTimeout(200);
        const scrollGeometry = await page.evaluate(() => ({
          headerBottom:document.querySelector('.draw-selection-head').getBoundingClientRect().bottom,
          bodyTop:document.querySelector('#drawPlannerBody').getBoundingClientRect().top,
          scrolled:document.querySelector('#drawPlannerBody').scrollTop
        }));
        assert.ok(scrollGeometry.scrolled > 0, 'Collection content scrolls');
        assert.ok(scrollGeometry.bodyTop >= scrollGeometry.headerBottom, 'Scrolling content stays below the pinned heading');
        const header = await page.locator('.draw-selection-head').evaluate(el => ({
          background:getComputedStyle(el).backgroundColor, image:getComputedStyle(el).backgroundImage,
          surface:getComputedStyle(el.closest('.draw-modal-card')).backgroundColor,
          titleOpacity:getComputedStyle(el.querySelector('h3')).opacity
        }));
        assert.equal(header.background, header.surface, 'Scrolled header must match the planner surface');
        assert.equal(header.image, 'none');
        assert.equal(header.titleOpacity, '1', 'Planner title stays visible');
        await page.screenshot({ path:path.join(screenshots, `scrolled-plan-${width}-${theme}.png`) });
        await page.locator('#drawPlannerBody').evaluate(el => { el.scrollTop = 0; });
        await page.locator('[aria-label="Remove FBC from Tube Plan"]').click();
        assert.equal(await page.locator('.draw-selected-chip').count(), 4);
        await page.evaluate(() => {
          selectedTestNames.clear(); selectedTestNames.add('HIV ELISA'); refreshSelectionUi({ rerenderCards: false });
        });
        await page.locator('#closeDrawPlannerBtn').click();
        await card.locator('.discovery-select').click();
        assert.equal(await page.evaluate(() => selectedTestNames.size), 1, 'Selected result cannot silently remove');
        await page.locator('#selectionCartBar').click();
        await page.locator('[aria-label="Remove HIV ELISA from Tube Plan"]').click();
        assert.equal(await page.evaluate(() => selectedTestNames.size), 0);
        await page.locator('#closeDrawPlannerBtn').click();
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
            variantMarkup: [...new Set(enrichedTests.flatMap(t=>getTubeGroups(t.tubeColor)))].map(group=>({group, markup:getTubeVisualMarkup(group)})),
            paediatricMarkup: getTubeVisualMarkup('Purple', '', {tubeVariant:'Paediatric microtainer'}),
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
        const photographicGroups = new Set(['Gold/Yellow', 'Purple', 'Pink', 'Blue', 'Green', 'Gray', 'Tan', 'Pearl/White']);
        assert.ok(audit.variantMarkup.every(({group, markup}) => markup.includes('aria-label=') && (
          photographicGroups.has(group)
            ? markup.includes('tube-photo-visual-adult') && markup.includes('<img') && markup.includes('realistic-empty-tube-')
            : markup.includes('<svg') && !markup.includes('<img')
        )), 'Tube groups use photography while non-tube collections keep accessible silhouettes');
        assert.match(audit.paediatricMarkup, /tube-photo-visual-paediatric/);
        assert.match(audit.paediatricMarkup, /realistic-empty-paediatric-microtainer-purple-v1\.png/);
        // HIV viral-load specimen is visible, not merely present in data.
        await page.locator('[data-test-name="HIV Viral Load"] .discovery-inspect').click();
        assert.match(await page.locator('[data-test-name="HIV Viral Load"]').innerText(), /EDTA plasma/);
        await page.locator('#searchInput').fill('FBC');
        const fbcCard = page.locator('[data-test-name="FBC"]');
        await fbcCard.locator('.discovery-open').click();
        await fbcCard.locator('.discovery-inspect').click();
        assert.equal(await fbcCard.locator('.discovery-select').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Plan action is transparent');
        assert.equal(await fbcCard.locator('.profile-tests-btn').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Profile action is transparent');
        await fbcCard.locator('.discovery-select').click();
        assert.equal(await page.locator('#selectionCartBar').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.1)', 'Tube Plan bar keeps its frosted background');
        assert.deepEqual(await page.locator('#selectionCartBar').evaluate(el => ({
          style: getComputedStyle(el).borderTopStyle,
          width: getComputedStyle(el).borderTopWidth
        })), { style: 'solid', width: '1px' }, 'Tube Plan bar has one restrained border');
        await fbcCard.locator('.profile-tests-btn').click();
        assert.equal(await page.locator('#profileModal').isVisible(), true, 'Profile test list opens');
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.container')).opacity === '0');
        assert.equal((await page.locator('#closeProfileModalBtn').innerText()).trim(), '×');
        assert.equal((await page.locator('#profileModal .profile-modal-brand').innerText()).trim(), 'FIND MY TUBE');
        assert.equal(await page.locator('#profileModal .profile-modal-card').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Profile contents have no enclosing card');
        assert.equal(await page.locator('#profileModal .profile-modal-card').evaluate(el => getComputedStyle(el).borderTopStyle), 'none');
        assert.equal(await page.locator('.container').evaluate(el => getComputedStyle(el).opacity), '0', 'Underlying workspace is removed while profile contents are open');
        assert.equal(await page.locator('#selectionCartBar').evaluate(el => getComputedStyle(el).visibility), 'hidden', 'Floating plan does not compete with profile contents');
        assert.equal(await page.locator('#profileModalList').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'Profile list has no grey panel');
        assert.equal(await page.locator('#profileModalList').evaluate(el => getComputedStyle(el).borderTopWidth), '0px', 'Profile list has no nested outline');
        assert.ok(await page.locator('#profileModalList li').evaluateAll(items => items.every(el => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)')), 'Profile rows have no grey tiles');
        await page.locator('#closeProfileModalBtn').click();
        await exerciseTubePlanWorkflow(page, width);
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`PASS ${width}px ${theme}: compact/expanded cards, HIV, add/remove, grouped planner, catalogue, overflow, runtime`);
      }
    }
    const drugPage = await createTestPage(browser, {viewport:{width:390,height:844}, reducedMotion:'reduce'});
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
    await drugPage.locator('.discovery-inspect').click();
    assert.match(await drugPage.locator('.discovery-body').innerText(), /Gold\/Yellow/);
    await drugPage.locator('.discovery-select').click();
    assert.deepEqual(await drugPage.evaluate(()=>[...selectedTestNames]), ['Sodium Valproate']);
    await drugPage.close();
    console.log(`PASS ${Object.keys(drugCases).length} drug alias, typo, peak/trough and local mapping checks`);
    const motionPage = await createTestPage(browser, {viewport:{width:390,height:844}});
    await motionPage.goto(`${base}/find-my-tube.html`);
    await motionPage.locator('#menuToggleBtn').click();
    await motionPage.waitForTimeout(40);
    const menuMotion = await motionPage.locator('#siteMenuPanel .site-menu-group-title, #siteMenuPanel .site-menu-link, #siteMenuPanel .site-menu-contact-link').evaluateAll(items => items.slice(0, 3).map(item => ({
      name:getComputedStyle(item).animationName,
      delay:getComputedStyle(item).animationDelay,
      duration:getComputedStyle(item).animationDuration
    })));
    assert.ok(menuMotion.every(item => item.name === 'siteMenuFallIn' && item.duration === '0.23s'), 'Menu items use the fast fall-in motion');
    assert.deepEqual(menuMotion.map(item => item.delay), ['0s','0.022s','0.044s'], 'Menu items enter from top to bottom');
    await motionPage.close();
    for (const width of [360, 390, 412, 430, 1280]) {
      const testPage = await createTestPage(browser, { viewport:{width,height:844}, reducedMotion:'reduce' });
      const errors = [];
      testPage.on('pageerror', error => errors.push(error.message));
      await testPage.goto(`${base}/index.html?tool=find-my-test`);
      assert.equal(await testPage.locator('body').evaluate(el => el.classList.contains('find-my-test-page')), true);
      const initialVisual = await testPage.evaluate(() => ({
        background:getComputedStyle(document.body, '::before').backgroundImage,
        position:getComputedStyle(document.body, '::before').position,
        panel:getComputedStyle(document.querySelector('.clinical-workup-panel')).backgroundColor,
        panelImage:getComputedStyle(document.querySelector('.clinical-workup-panel')).backgroundImage,
        group:getComputedStyle(document.querySelector('.clinical-workup-group')).backgroundColor,
        groupFilter:getComputedStyle(document.querySelector('.clinical-workup-group')).backdropFilter,
        input:getComputedStyle(document.querySelector('#clinicalSymptomsInput')).backgroundColor,
        inputFilter:getComputedStyle(document.querySelector('#clinicalSymptomsInput')).backdropFilter
      }));
      assert.match(initialVisual.background, /find-my-tube-lab-overview/, `Find My Test home-slide photograph missing at ${width}`);
      assert.equal(initialVisual.position, 'fixed', 'Find My Test photograph must stay still while scrolling');
      assert.equal(initialVisual.panel, 'rgba(3, 17, 31, 0.24)', 'Find My Test form keeps a quiet translucent shell');
      assert.equal(initialVisual.panelImage, 'none', 'Find My Test form does not cover the photograph');
      assert.equal(initialVisual.group, 'rgba(255, 255, 255, 0.14)', 'Find My Test sections use visible card frost');
      assert.match(initialVisual.groupFilter, /blur\(16px\)/, 'Find My Test section frost visibly blurs the scene');
      assert.equal(initialVisual.input, 'rgba(3, 17, 31, 0.52)', 'Find My Test fields use readable dark input glass');
      assert.match(initialVisual.inputFilter, /blur\(12px\)/, 'Find My Test input glass visibly blurs the scene');
      await testPage.locator('#clinicalSymptomsInput').fill('fever');
      await testPage.locator('#clinicalSymptomsInput').focus();
      await testPage.waitForTimeout(30);
      assert.equal(await testPage.locator('#clinicalSymptomsInput').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(3, 17, 31, 0.66)', 'Focused Find My Test input strengthens its frost');
      await testPage.locator('#clinicalConcernInput').fill('infection');
      await testPage.locator('#clinicalWorkupSubmitBtn').click();
      await testPage.mouse.move(0, 0);
      await testPage.waitForTimeout(250);
      assert.equal(await testPage.locator('#clinicalWorkupResults').isVisible(), true);
      assert.ok(await testPage.locator('.clinical-workup-test-option').count() > 0, 'Find My Test returns suggestions');
      assert.equal(await testPage.locator('#clinicalWorkupResults').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.14)', 'Find My Test results use visible frost');
      const optionSurfaces = await testPage.locator('.clinical-workup-test-option').evaluateAll(items => items.map(item => getComputedStyle(item).backgroundColor));
      assert.ok(optionSurfaces.every(color => color === 'rgba(255, 255, 255, 0.14)'), `Suggested tests use visible frost at ${width}: ${JSON.stringify(optionSurfaces)}`);
      const firstOption = testPage.locator('.clinical-workup-test-option').first();
      await firstOption.click();
      assert.match(await firstOption.innerText(), /Tap to remove from Tube Plan/, `Selected test remains an actionable toggle at ${width}`);
      assert.equal((await testPage.locator('#selectionCartBar .selection-cart-label').innerText()).trim(), 'Selected tests');
      await testPage.locator('#selectionCartBar').click();
      assert.equal(await testPage.locator('#drawModal').isVisible(), true, `Selected tests opens at ${width}`);
      await testPage.locator('#closeDrawPlannerBtn').click();
      await testPage.locator('#clinicalWorkupResetBtn').click();
      assert.equal(await testPage.locator('#clinicalWorkupResults').isVisible(), false, `Clear all hides suggestions at ${width}`);
      assert.equal(await testPage.locator('#selectionCartBar').isVisible(), false, `Clear all removes selected tests at ${width}`);
      await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      assert.equal(await testPage.evaluate(() => getComputedStyle(document.body, '::before').position), 'fixed', 'Find My Test photograph remains fixed after scrolling');
      assert.ok(await testPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Find My Test overflow at ${width}`);
      assert.deepEqual(errors, [], `Find My Test runtime errors at ${width}`);
      await testPage.screenshot({path:path.join(screenshots, `find-my-test-${width}.png`), fullPage:true});
      await testPage.close();
    }
    console.log('PASS Find My Test sharp photograph, frosted groups and inputs, results and responsive checks');
    for (const width of [360, 390, 412, 430, 1280]) {
      const aboutPage = await createTestPage(browser, { viewport:{width,height:844}, reducedMotion:'reduce' });
      await aboutPage.goto(`${base}/about.html`);
      const aboutVisual = await aboutPage.evaluate(() => ({
        background:getComputedStyle(document.body, '::before').backgroundImage,
        position:getComputedStyle(document.body, '::before').position,
        header:getComputedStyle(document.querySelector('.header')).backgroundColor,
        card:getComputedStyle(document.querySelector('.stock-order-request-card')).backgroundColor,
        nav:getComputedStyle(document.querySelector('.support-nav')).backgroundColor
      }));
      assert.match(aboutVisual.background, /find-my-tube-lab-overview/, `About photograph missing at ${width}`);
      assert.equal(aboutVisual.position, 'fixed');
      assert.equal(aboutVisual.header, 'rgba(0, 0, 0, 0)', 'About header must not cover the photograph');
      assert.equal(aboutVisual.card, 'rgba(255, 255, 255, 0.1)', 'About content uses 10% frost');
      assert.equal(aboutVisual.nav, 'rgba(255, 255, 255, 0.1)', 'About navigation uses 10% frost');
      assert.ok(await aboutPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `About overflow at ${width}`);
      await aboutPage.screenshot({path:path.join(screenshots, `about-${width}.png`), fullPage:true});
      await aboutPage.close();
      const contactPage = await createTestPage(browser,{viewport:{width,height:844},reducedMotion:'reduce'});
      const contactResponse = await contactPage.goto(`${base}/contact-feedback.html`);
      assert.equal(contactResponse.status(), 404, 'Retired Contact and feedback page stays unavailable');
      await contactPage.close();

      const deskPage = await createTestPage(browser, { viewport:{width,height:844}, reducedMotion:'reduce' });
      await deskPage.goto(`${base}/index.html?tool=collection-desk`);
      assert.equal(await deskPage.locator('#homeLabDeskPanel').isVisible(), true);
      const deskVisual = await deskPage.evaluate(() => ({
        background:getComputedStyle(document.querySelector('#homeLabDeskBackdrop')).backgroundImage,
        blur:getComputedStyle(document.querySelector('#homeLabDeskBackdrop')).backdropFilter,
        panel:getComputedStyle(document.querySelector('#homeLabDeskPanel')).backgroundColor,
        panelImage:getComputedStyle(document.querySelector('#homeLabDeskPanel')).backgroundImage,
        card:getComputedStyle(document.querySelector('.home-collection-checklist-card')).backgroundColor,
        action:getComputedStyle(document.querySelector('.home-action-tile')).backgroundColor
      }));
      assert.match(deskVisual.background, /hero-lab-collection/, `Collection Desk photograph missing at ${width}`);
      assert.equal(deskVisual.blur, 'none', 'Collection Desk photograph stays sharp');
      assert.equal(deskVisual.panel, 'rgba(0, 0, 0, 0)', 'Collection Desk panel stays transparent');
      assert.equal(deskVisual.panelImage, 'none');
      assert.equal(deskVisual.card, 'rgba(255, 255, 255, 0.1)', 'Collection Desk cards use 10% frost');
      assert.equal(deskVisual.action, 'rgba(255, 255, 255, 0.1)', 'Collection Desk actions use 10% frost');
      assert.ok(await deskPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Collection Desk overflow at ${width}`);
      await deskPage.screenshot({path:path.join(screenshots, `collection-desk-${width}.png`), fullPage:true});
      await deskPage.close();
    }
    console.log('PASS About and Collection Desk photographic, transparent and responsive surface checks');
    // Inactivity moves even untouched pending orders into history on both views.
    for (const width of [360, 1280]) {
      const stale = new Date(Date.now() - 15*86400000).toISOString();
      const fresh = new Date().toISOString();
      const fixtures = [
        {id:'STALE-PENDING', status:'pending', createdAt:stale, requestedBy:'Old pending', items:[]},
        {id:'STALE-READY', status:'ready', createdAt:stale, updatedAt:stale, requestedBy:'Old ready', items:[]},
        {id:'RECENT-ACTIVITY', status:'packed', createdAt:stale, updatedAt:fresh, requestedBy:'Recently updated', items:[]},
        {id:'FRESH-PENDING', status:'pending', createdAt:fresh, requestedBy:'Fresh pending', items:[]}
      ];
      const page = await createTestPage(browser, {viewport:{width,height:900}});
      await page.route('**/api/stock-requests?**', route=>route.fulfill({json:{requests:fixtures}}));
      await page.goto(`${base}/track-orders.html`);
      await page.locator('#trackOrdersTable').getByText(/^Fresh pending$/i).waitFor();
      assert.match(await page.locator('#trackOrdersTable').innerText(), /Recently updated/i);
      assert.doesNotMatch(await page.locator('#trackOrdersTable').innerText(), /Old pending|Old ready/i);
      assert.match(await page.locator('#trackOrdersArchiveTable').innerText(), /Old pending/i);
      assert.match(await page.locator('#trackOrdersArchiveTable').innerText(), /Archived/);
      if (width === 360) {
        for (const viewportWidth of [360, 390, 412, 430, 768, 1280]) {
          await page.setViewportSize({width:viewportWidth, height:900});
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({path:path.join(screenshots, `track-orders-${viewportWidth}.png`)});
          await page.locator("#trackOrdersListTitle").scrollIntoViewIfNeeded();
          await page.screenshot({path:path.join(screenshots, `track-orders-rows-${viewportWidth}.png`)});
        }
        await page.setViewportSize({width, height:900});
      }
      await page.goto(`${base}/stock-dashboard.html`);
      // Finish the signed-out auth restore before exposing screenshot fixtures.
      await page.waitForFunction(() => !stockDashboardSessionRestorePending);
      const datasets = await page.evaluate(fixtures=>{
        stockDashboardPrepareDatasets(fixtures);
        renderStockDashboardRequests(fixtures);
        return {active:stockDashboardDatasets.activeWorkQueue.map(r=>r.id),
          archived:stockDashboardDatasets.archivedCompletedRequests.map(r=>r.id)};
      }, fixtures);
      assert.deepEqual(datasets.active, ['RECENT-ACTIVITY','FRESH-PENDING']);
      assert.deepEqual(datasets.archived, ['STALE-PENDING','STALE-READY']);
      await page.evaluate(() => { document.querySelector('#stockDashboardRequestsCard').hidden = false; });
      assert.equal(await page.locator('.stock-dashboard-queue-row').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.14)', 'Work queue rows use visible frost');
      await page.locator('#stockDashboardRequestsCard').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(screenshots, `stock-queue-${width}.png`)});
      await page.evaluate(() => {
        stockDashboardRenderInventory([
          {key:'yellowTubes', label:'Yellow (Gel) tubes', onHand:5000},
          {key:'purpleTubes', label:'Purple (EDTA) tubes', onHand:5000}
        ]);
        document.querySelector('#stockDashboardInventoryCard').hidden = false;
      });
      await page.locator('#stockDashboardInventoryCard').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(screenshots, `stock-inventory-${width}.png`)});
      await page.close();
    }
    for (const route of ['index.html', 'order-stock.html', 'track-orders.html', 'stock-dashboard.html']) {
      const page = await createTestPage(browser, { viewport:{width:390,height:844}, reducedMotion:'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${base}/${route}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow`);
      assert.deepEqual(errors, [], `${route} runtime errors`);
      const radii = await page.locator('.stock-order-card,.stock-order-request-card,.stock-order-form,.stock-catalog-toolbar,.stock-order-grid,.stock-dashboard-request-card').evaluateAll(els => els.filter(el=>el.getClientRects().length).map(el=>getComputedStyle(el).borderRadius));
      assert.ok(radii.every(radius=>radius==='0px'), `${route} inconsistent card corners: ${radii}`);
      if(route === 'order-stock.html') {
        const stockFrost = await page.locator('.stock-order-form,.stock-catalog-toolbar,.stock-order-item-card:visible,.stock-order-request-card').evaluateAll(els => els.filter(el=>el.getClientRects().length).map(el=>getComputedStyle(el).backgroundColor));
        assert.ok(stockFrost.every(color=>color === 'rgba(255, 255, 255, 0.14)'), `Order Stock card frost is inconsistent: ${stockFrost}`);
        assert.equal(await page.locator('#stockOrderRequesterNameInput').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(3, 17, 31, 0.52)', 'Order Stock inputs use dark glass');
      }
      if(route === 'track-orders.html') {
        assert.equal(await page.locator('.stock-order-request-card').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.14)', 'Track Orders cards use visible frost');
        assert.equal(await page.locator('#trackOrdersWardInput').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(3, 17, 31, 0.52)', 'Track Orders filters use dark glass');
      }
      if(route === 'stock-dashboard.html') {
        assert.equal(await page.locator('.stock-dashboard-session-card').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(255, 255, 255, 0.14)', 'Dashboard session card uses visible frost');
      }
      if(route === 'order-stock.html') {
        const stockBackdrop = await page.evaluate(() => ({
          image:getComputedStyle(document.body, '::before').backgroundImage,
          position:getComputedStyle(document.body, '::before').position
        }));
        assert.match(stockBackdrop.image, /find-my-tube-lab-overview/, 'Order My Stock uses its home-slide photograph');
        assert.equal(stockBackdrop.position, 'fixed', 'Order My Stock photograph stays still while scrolling');
        assert.match(await page.locator('body').innerText(), /22 of 22 stock items/);
        for (const width of [360, 390, 412, 430, 768, 1280]) {
          await page.setViewportSize({width, height:900});
          await page.locator('.stock-order-item-card:visible').first().evaluate(el => el.scrollIntoView({block:'start', behavior:'instant'}));
          await page.screenshot({path:path.join(screenshots, `order-cards-${width}.png`)});
        }
        await page.setViewportSize({width:390, height:844});
        await page.locator('#stockCatalogSearch').fill('vacutainer');
        assert.deepEqual(
          await page.locator('.stock-order-item-card:visible').evaluateAll(cards => cards.map(card => card.dataset.stockItem).sort()),
          ['vacutainer-needle-black', 'vacutainer-needle-green']
        );
        assert.equal(await page.locator('.stock-item-glyph-needle:visible').count(), 2);
      }
      await page.screenshot({path:path.join(screenshots, route.replace('.html','.png'))});
      await page.close();
    }
    console.log('PASS unrelated home, stock, tracking and signed-out admin smoke checks');
    console.log(`Screenshots: ${screenshots}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
