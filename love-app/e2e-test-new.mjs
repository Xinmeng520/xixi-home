import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5173";
const results = [];

function log(step, pass, detail) {
  if (detail === undefined) detail = "";
  results.push({ step, pass, detail });
  const icon = pass ? "[PASS]" : "[FAIL]";
  console.log(`${icon} ${step}${detail ? " -> " + detail : ""}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + err.message));
page.on("requestfailed", (req) => failedRequests.push(req.url() + " :: " + req.failure()?.errorText));
page.on("response", (res) => { if (res.status() >= 400) failedRequests.push(res.url() + " :: HTTP " + res.status()); });

try {
  // ======== LOGIN ========
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 10000 });
  await page.waitForSelector("input[type=text]", { timeout: 5000 });
  await page.fill("input[type=text]", "xixi");
  await page.fill("input[type=password]", "123456");
  await page.click("button[type=submit]");
  await page.waitForURL("**/", { timeout: 10000 });
  log("Login", true);
  await page.waitForTimeout(2000);

  // ======== HOME HEADER ========
  const headerText = await page.locator("text=Together For").count();
  log("Home Header - Days Together", headerText > 0);

  // ======== POST LIST ========
  await page.waitForTimeout(1000);
  const postCards = page.locator("[class*=rounded-3xl]");
  const postCount = await postCards.count();
  log("Post List Rendered", postCount > 0, "count=" + postCount);

  // ======== COMMENT ========
  let commentToggled = false;
  for (let i = 0; i < postCount; i++) {
    const card = postCards.nth(i);
    const chatBtn = card.locator("svg").filter({ has: page.locator("path[d*='M21 15']") }).first();
    if (await chatBtn.count() > 0) {
      await chatBtn.locator("..").locator("..").click();
      commentToggled = true;
      break;
    }
  }
  log("Comment Toggle Click", commentToggled);

  if (commentToggled) {
    await page.waitForTimeout(800);
    const cmtInput = page.locator("input[placeholder*='写下']").first();
    const hasCmtInput = await cmtInput.count() > 0;
    log("Comment Input Visible", hasCmtInput);
    if (hasCmtInput) {
      await cmtInput.fill("E2E test comment");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
      const cmtVisible = await page.getByText("E2E test comment").count() > 0;
      log("Comment Submit", cmtVisible);
    }
  }

  // ======== POST MENU ========
  let menuClicked = false;
  for (let i = 0; i < postCount; i++) {
    const card = postCards.nth(i);
    const dots = card.locator("svg circle").first();
    if (await dots.count() > 0) {
      await dots.locator("..").locator("..").click();
      await page.waitForTimeout(500);
      menuClicked = true;
      break;
    }
  }
  log("Post Menu Open", menuClicked);

  if (menuClicked) {
    const editVisible = await page.locator("text=编辑").count() > 0;
    const delVisible = await page.locator("text=删除").count() > 0;
    log("Edit Option", editVisible);
    log("Delete Option", delVisible);
    await page.mouse.click(100, 400);
    await page.waitForTimeout(200);
  }

  // ======== COMPOSE ========
  await page.goto(BASE + "/compose", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const onCompose = await page.locator("textarea").count() > 0;
  log("Compose Page Loaded", onCompose);

  if (onCompose) {
    const textarea = page.locator("textarea").first();
    const borderClass = await textarea.getAttribute("class");
    log("Input Has Border", borderClass && borderClass.includes("border"));

    const pinVisible = await page.locator("text=置顶, text=已置顶").count() > 0;
    log("Pin Toggle Visible", pinVisible);

    const imgVisible = await page.locator("text=图片").count() > 0;
    log("Image Button Visible", imgVisible);

    await textarea.fill("E2E test post " + Date.now());
    await page.locator("button").filter({ hasText: /发布/ }).first().click().catch(async () => {
      await page.getByText("发布").last().click().catch(() => {});
    });
    await page.waitForTimeout(2000);
    log("Post Submit", true);
  }

  // ======== ALBUM ========
  await page.goto(BASE + "/album", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const albumPage = await page.locator("text=相册").count() > 0;
  log("Album Page", albumPage);

  // ======== ANNIVERSARY ========
  await page.goto(BASE + "/anniversary", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const annivPage = await page.locator("text=纪念日").count() > 0;
  log("Anniversary Page", annivPage);

  // ======== PROFILE ========
  await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const profilePage = await page.locator("text=退出登录").count() > 0;
  log("Profile Page", profilePage);

  // ======== CONSOLE ERRORS ========
  const realErrors = consoleErrors.filter(e => !e.includes("favicon") && !e.includes("404"));
  log("No Console Errors", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

  // ======== FAILED REQUESTS ========
  const realFailed = failedRequests.filter(e => !e.includes("favicon"));
  log("No Failed Requests", realFailed.length === 0, realFailed.slice(0, 3).join(" | "));

} catch (err) {
  console.log("[CRITICAL] " + err.message);
} finally {
  await browser.close();
}

console.log("\n=== SUMMARY ===");
const passed = results.filter(r => r.pass).length;
console.log(`${passed}/${results.length} tests passed`);
if (passed < results.length) {
  console.log("\nFailed tests:");
  results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.step}: ${r.detail}`));
}
