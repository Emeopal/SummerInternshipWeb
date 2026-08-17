const path = require('path');
const pwPath = 'C:/Users/\u5468\u51cc\u5b87/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(pwPath);

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  async function shot(width, height, out) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`[${width}x${height}] console: ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`[${width}x${height}] pageerror: ${err.message}`));
    const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: out, fullPage: true });
    await page.close();
  }

  await shot(1440, 900, 'C:/tmp/shot_desktop.png');
  await shot(390, 844, 'C:/tmp/shot_mobile.png');

  await browser.close();
  console.log(errors.length ? errors.join('\n') : 'NO_JS_ERRORS');
})();
