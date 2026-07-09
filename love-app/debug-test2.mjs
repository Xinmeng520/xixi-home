import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + err.message));
page.on("requestfailed", (req) => failedRequests.push(req.url() + " :: " + req.failure()?.errorText));
page.on("response", (res) => { if (res.status() >= 400) failedRequests.push(res.url() + " :: HTTP " + res.status()); });

await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle", timeout: 10000 });
await page.waitForSelector("input[type=text]", { timeout: 5000 });
await page.fill("input[type=text]", "xixi");
await page.fill("input[type=password]", "123456");
await page.click("button[type=submit]");
await page.waitForURL("**/", { timeout: 10000 });
await page.waitForTimeout(2000);

// ======== TEST 1: Comment ========
const postCards = page.locator("[class*=rounded-3xl]");
const postCount = await postCards.count();
console.log("Post count:", postCount);

// Loop through posts to find one with comment button
let commentFound = false;
for (let i = 0; i < postCount; i++) {
  const card = postCards.nth(i);
  const chatSvg = card.locator("path[d^='M21']").first();
  if (await chatSvg.count() > 0) {
    await chatSvg.click();
    await page.waitForTimeout(1500);
    
    const cmtInput = page.locator("input[placeholder*='写下']").first();
    if (await cmtInput.count() > 0) {
      console.log("Comment input FOUND on post", i);
      await cmtInput.fill("E2E works!");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
      const cmtText = await page.getByText("E2E works!").count();
      console.log("Comment submitted:", cmtText > 0);
      commentFound = true;
      break;
    }
  }
}
if (!commentFound) console.log("Comment input NOT found on any post");

// ======== TEST 2: Post Menu (find author's post) ========
let menuFound = false;
for (let i = 0; i < postCount; i++) {
  const card = postCards.nth(i);
  // Check for SVG circles (3-dot menu)
  const circles = await card.locator("svg circle").count();
  if (circles >= 3) {
    console.log("Found 3-dot menu on post", i);
    await card.locator("svg circle").first().locator("..").locator("..").click();
    await page.waitForTimeout(500);
    
    const editText = await page.locator("text=编辑").count();
    const delText = await page.locator("text=删除").count();
    console.log("Edit visible:", editText > 0, "Delete visible:", delText > 0);
    menuFound = true;
    
    // Test pin toggle
    if (editText > 0) {
      const pinText = await page.locator("text=置顶, text=取消置顶").count();
      console.log("Pin option in menu:", pinText > 0);
    }
    
    await page.mouse.click(50, 200);
    await page.waitForTimeout(300);
    break;
  }
}
if (!menuFound) console.log("3-dot menu NOT found on any post");

// ======== TEST 3: Compose page pin ========
await page.goto("http://127.0.0.1:5173/compose", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Scroll to bottom to see the toolbar
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);

const pinBtn = page.locator("text=置顶, text=已置顶");
const pinCount = await pinBtn.count();
console.log("Pin button on compose:", pinCount > 0);

// Screenshot for visual verification
await page.screenshot({ path: "C:\\Users\\98203\\Documents\\熙熙小窝\\qa-debug-compose.png" });

// ======== RESULTS ========
const realErrors = consoleErrors.filter(e => !e.includes("favicon") && !e.includes("404"));
console.log("\nConsole errors:", realErrors.length, realErrors.slice(0, 3).join(" | "));
const realFailed = failedRequests.filter(e => !e.includes("favicon"));
console.log("Failed requests:", realFailed.length, realFailed.slice(0, 3).join(" | "));

await browser.close();
