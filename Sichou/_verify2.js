const path = require('path');
const pwPath = 'C:/Users/\u5468\u51cc\u5b87/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(pwPath);

(async () => {
  const browser = await chromium.launch();
  const issues = [];
  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  async function shot(width, height, name, selector) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', err => issues.push(`[${name}] pageerror: ${err.message}`));
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    if (selector) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: `C:/tmp/${name}.png` });
    const dims = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight,
      ch: document.documentElement.clientHeight
    }));
    if (dims.sw > dims.cw + 1) issues.push(`[${name}] horizontal overflow ${dims.sw} > ${dims.cw}`);
    await page.close();
  }

  await shot(1440, 900, 'd_hero', null);
  await shot(1440, 900, 'd_history', '#history');
  await shot(1440, 900, 'd_collection', '#collection');
  await shot(1440, 900, 'd_heritage', '#heritage');
  await shot(390, 844, 'm_hero', null);
  await shot(390, 844, 'm_history', '#history');
  await shot(390, 844, 'm_collection', '#collection');
  await shot(390, 844, 'm_heritage', '#heritage');

  await browser.close();
  console.log(issues.length ? issues.join('\n') : 'NO_ISSUES');
})();
