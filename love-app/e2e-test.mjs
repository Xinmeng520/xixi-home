
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
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + err.message));

try {
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 10000 });
  await page.waitForSelector("input[type=text]", { timeout: 5000 });
  await page.fill("input[type=text]", "xixi");
  await page.fill("input[type=password]", "123456");
  await page.click("button[type=submit]");
  await page.waitForURL("**/", { timeout: 10000 });
  log("登录", true);

  await page.waitForTimeout(1500);
  const headerExist = await page.locator("text=在一起").first().count();
  log("首页 Header", headerExist > 0);

  await page.waitForTimeout(1000);
  const postCards = page.locator("[class*=rounded-3xl]");
  const postCount = await postCards.count();
  log("帖子渲染", postCount > 0, "count=" + postCount);

  // Find a post with menu
  let menuClicked = false;
  for (let i = 0; i < postCount; i++) {
    const card = postCards.nth(i);
    const dots = await card.locator("svg circle").count();
    if (dots >= 3) {
      await card.locator("svg circle").first().locator("..").locator("..").click();
      await page.waitForTimeout(500);
      menuClicked = true;
      break;
    }
  }
  log("作者菜单", menuClicked);

  if (menuClicked) {
    const editVisible = await page.locator("text=编辑").count() > 0;
    const delVisible = await page.locator("text=删除").count() > 0;
    log("编辑选项", editVisible);
    log("删除选项", delVisible);
    await page.mouse.click(100, 400);
    await page.waitForTimeout(200);
  }

  // Comment
  let commentToggled = false;
  for (let i = 0; i < postCount; i++) {
    const card = postCards.nth(i);
    const chatIcon = card.locator("svg path[d*='M21 15']").first();
    if (await chatIcon.count() > 0) {
      await chatIcon.locator("..").locator("..").click();
      commentToggled = true;
      break;
    }
  }
  log("评论按钮", commentToggled);

  if (commentToggled) {
    await page.waitForTimeout(500);
    const cmtInput = page.locator("input[placeholder*='写点']").first();
    const hasInput = await cmtInput.count() > 0;
    log("评论输入框", hasInput);
    if (hasInput) {
      await cmtInput.fill("E2E测试评论");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
      const cmtVisible = await page.getByText("E2E测试评论").count() > 0;
      log("评论提交", cmtVisible);
    }
  }

  // Compose
  const addBtn = page.locator(".glass").locator("button").filter({ has: page.locator("line[x1='12'][y1='5']") }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
  } else {
    await page.goto(BASE + "/compose");
  }
  await page.waitForTimeout(1000);
  const onCompose = await page.locator("textarea").count() > 0;
  log("发布页加载", onCompose);

  if (onCompose) {
    await page.locator("textarea").first().fill("E2E测试帖子");
    const pinVisible = await page.getByText("置顶").count() > 0;
    log("置顶开关", pinVisible);
    const imgVisible = await page.getByText("图片").count() > 0;
    log("图片按钮", imgVisible);

    await page.locator("button[type=submit]").click().catch(async () => {
      await page.getByText("发布").last().click();
    });
    await page.waitForTimeout(2000);
    const newPost = await page.getByText("E2E测试帖子").count();
    log("发布成功", newPost > 0);
  }

  await page.goto(BASE + "/album", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const albumLoaded = await page.getByText("相册").first().count() > 0;
  log("相册页", albumLoaded);

  await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const profileLoaded = await page.getByText("退出登录").count() > 0;
  log("个人资料", profileLoaded);

  const realErrors = consoleErrors.filter(e => !e.includes("favicon"));
  log("无控制台错误", realErrors.length === 0, realErrors.slice(0, 2).join(" | "));

} catch (err) {
  console.log("[CRITICAL] " + err.message);
} finally {
  await browser.close();
}

console.log("\n=== SUMMARY ===");
const passed = results.filter(r => r.pass).length;
console.log(passed + "/" + results.length + " passed");
