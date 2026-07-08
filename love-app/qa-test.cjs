const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\98203\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const page = await ctx.newPage();
  const logs = [];
  
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-01-login.png' });
  logs.push('1. Login page loaded');
  
  const inputs = await page.$$('input');
  await inputs[0].fill('xixi');
  await inputs[1].fill('123456');
  await page.$eval('form', form => form.requestSubmit());
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-02-home.png' });
  
  const homeText = await page.textContent('body');
  logs.push('2. Home: together=' + (homeText.includes('在一起')) + ', anniversary=' + (homeText.includes('确定关系日')));
  
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const txt = await btn.textContent();
    if (txt && txt.includes('纪念日')) { await btn.click(); break; }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-03-anniversary.png' });
  logs.push('3. Anniversary page visited');
  
  for (const btn of await page.$$('button')) {
    const txt = await btn.textContent();
    if (txt && txt.includes('相册')) { await btn.click(); break; }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-04-album.png' });
  logs.push('4. Album page visited');
  
  for (const btn of await page.$$('button')) {
    const txt = await btn.textContent();
    const hasSvg = await btn.$('svg');
    if (hasSvg && (!txt || txt.trim().length < 2)) { await btn.click(); break; }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-05-compose.png' });
  logs.push('5. Compose page visited');
  
  for (const btn of await page.$$('button')) {
    const txt = await btn.textContent();
    if (txt && txt.includes('我的')) { await btn.click(); break; }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-06-profile.png' });
  logs.push('6. Profile page visited');
  
  for (const btn of await page.$$('button')) {
    const txt = await btn.textContent();
    if (txt && txt.includes('退出登录')) { await btn.click(); break; }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/98203/Documents/熙熙小窝/qa-final-07-logout.png' });
  logs.push('7. Logout: ' + page.url());
  
  await browser.close();
  console.log(logs.join('\n'));
  console.log('QA TEST COMPLETE');
})().catch(e => console.error(e.message));
