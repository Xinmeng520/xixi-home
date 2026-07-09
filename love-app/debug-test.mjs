import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle", timeout: 10000 });
await page.waitForSelector("input[type=text]", { timeout: 5000 });
await page.fill("input[type=text]", "xixi");
await page.fill("input[type=password]", "123456");
await page.click("button[type=submit]");
await page.waitForURL("**/", { timeout: 10000 });
await page.waitForTimeout(2000);

// Click comment on first post
const postCards = page.locator("[class*=rounded-3xl]");
const postCount = await postCards.count();
console.log("Post count:", postCount);

if (postCount > 0) {
  const firstCard = postCards.nth(0);
  
  // Get the full card HTML
  const cardHTML = await firstCard.evaluate(el => el.innerHTML);
  console.log("Card HTML (first 2000):", cardHTML.substring(0, 2000));
  
  // Try clicking the comment SVG directly
  const chatSvg = firstCard.locator("path[d^='M21']").first();
  if (await chatSvg.count() > 0) {
    console.log("Found chat SVG, clicking...");
    await chatSvg.click();
    await page.waitForTimeout(1000);
    
    // Screenshot to see result
    await page.screenshot({ path: "C:\\Users\\98203\\Documents\\熙熙小窝\\qa-debug-comment.png" });
    
    // Check for input
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    console.log("All inputs on page after comment click:", inputCount);
    for (let i = 0; i < inputCount; i++) {
      const placeholder = await inputs.nth(i).getAttribute("placeholder");
      console.log(`Input ${i}: placeholder="${placeholder}"`);
    }
  } else {
    console.log("Chat SVG not found with path selector");
    // Try all SVGs
    const allSvgs = firstCard.locator("svg");
    const svgCount = await allSvgs.count();
    console.log("Total SVGs:", svgCount);
  }
}

await browser.close();
