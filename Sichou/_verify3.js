const path = require('path');
const pwPath = 'C:/Users/\u5468\u51cc\u5b87/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(pwPath);

(async () => {
  const browser = await chromium.launch();
  const issues = [];
  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  async function newPage(width, height, name) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', err => issues.push(`[${name}] pageerror: ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') issues.push(`[${name}] console: ${msg.text()}`);
    });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    return page;
  }

  async function overflowCheck(page, name) {
    const dims = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth
    }));
    if (dims.sw > dims.cw + 1) issues.push(`[${name}] horizontal overflow ${dims.sw} > ${dims.cw}`);
  }

  async function shot(page, name) {
    await page.screenshot({ path: `C:/tmp/${name}.png`, fullPage: true });
  }

  // Desktop screenshots
  const dHero = await newPage(1440, 900, 'd_hero');
  await overflowCheck(dHero, 'd_hero');
  await shot(dHero, 'd_hero');

  for (const [id, name] of [['#history', 'd_history'], ['#collection', 'd_collection'], ['#heritage', 'd_heritage'], ['#thinking', 'd_thinking']]) {
    await dHero.locator(id).scrollIntoViewIfNeeded();
    await dHero.waitForTimeout(900);
    await overflowCheck(dHero, name);
    await shot(dHero, name);
  }

  // Modal test
  await dHero.locator('#collection').scrollIntoViewIfNeeded();
  await dHero.waitForTimeout(500);
  await dHero.locator('.artifact-open').first().click();
  await dHero.waitForTimeout(500);
  const modalVisible = await dHero.locator('#modalBackdrop.open').isVisible().catch(() => false);
  if (!modalVisible) issues.push('[d_hero] modal did not open');
  const modalTitle = await dHero.locator('#modalTitle').textContent();
  if (modalTitle.trim() !== '驼铃遗币') issues.push(`[d_hero] modal title wrong: ${modalTitle}`);
  await dHero.keyboard.press('Escape');
  await dHero.waitForTimeout(400);
  const modalHidden = await dHero.locator('#modalBackdrop').getAttribute('hidden');
  if (modalHidden === null) issues.push('[d_hero] modal did not close with Escape');

  // QA + chips + note interactions
  await dHero.locator('#thinking').scrollIntoViewIfNeeded();
  await dHero.waitForTimeout(600);
  await dHero.locator('.qa-question').nth(1).click();
  await dHero.waitForTimeout(500);
  const qaOpenCount = await dHero.locator('.qa-item.open').count();
  if (qaOpenCount !== 1) issues.push(`[d_hero] qa open count ${qaOpenCount}`);
  await dHero.locator('.practice-chip').nth(0).click();
  await dHero.locator('.practice-chip').nth(1).click();
  const progressText = await dHero.locator('#practiceProgress').textContent();
  if (progressText.trim() !== '今日行动 2 / 4') issues.push(`[d_hero] progress text: ${progressText}`);
  await dHero.locator('#youthNote').fill('用一段短视频，让更多人听见中卫渡口的驼铃与号子。');
  const countText = await dHero.locator('#noteCount').textContent();
  if (countText.trim() !== '24') issues.push(`[d_hero] note count: ${countText}`);
  await dHero.locator('#saveNote').click();
  const stampShown = await dHero.locator('#saveStamp.show').isVisible().catch(() => false);
  if (!stampShown) issues.push('[d_hero] save stamp did not show');

  // Sticky navbar state
  await dHero.evaluate(() => window.scrollTo(0, 800));
  await dHero.waitForTimeout(300);
  const scrolled = await dHero.locator('#navbar').evaluate(el => el.classList.contains('scrolled'));
  if (!scrolled) issues.push('[d_hero] navbar scrolled state missing');

  await dHero.close();

  // Mobile screenshots
  const mHero = await newPage(390, 844, 'm_hero');
  await overflowCheck(mHero, 'm_hero');
  await shot(mHero, 'm_hero');

  for (const [id, name] of [['#history', 'm_history'], ['#collection', 'm_collection'], ['#heritage', 'm_heritage'], ['#thinking', 'm_thinking']]) {
    await mHero.locator(id).scrollIntoViewIfNeeded();
    await mHero.waitForTimeout(700);
    await overflowCheck(mHero, name);
    await shot(mHero, name);
  }

  // Mobile menu test
  await mHero.evaluate(() => window.scrollTo(0, 0));
  await mHero.waitForTimeout(300);
  await mHero.locator('#menuToggle').click();
  await mHero.waitForTimeout(400);
  const menuOpen = await mHero.locator('#navLinks.open').isVisible().catch(() => false);
  if (!menuOpen) issues.push('[m_hero] mobile menu did not open');
  await mHero.locator('#navLinks a[href="#thinking"]').click();
  await mHero.waitForTimeout(600);
  const menuClosed = await mHero.locator('#navLinks.open').count() === 0;
  if (!menuClosed) issues.push('[m_hero] mobile menu did not close on nav');

  await mHero.close();

  await browser.close();
  console.log(issues.length ? issues.join('\n') : 'NO_ISSUES');
})();
