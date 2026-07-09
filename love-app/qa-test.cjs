const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: 'C:\\Users\\98203\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('input[type="text"]', { timeout: 5000 });
  await page.fill('input[type="text"]', 'xixi');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  await page.screenshot({ path: 'qa-debug-3.png' });
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
  console.log('HTML:', html);
  await browser.close();
})();
