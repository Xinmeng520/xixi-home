import { chromium } from "playwright";
const bw = await chromium.launch({ headless: false, executablePath: "C:\\Users\\98203\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe" });
const cx = await bw.newContext({ viewport: { width: 390, height: 844 } });
const pg = await cx.newPage();
pg.on("pageerror", e => console.log("PAGEERR:", e.message));
await pg.goto("http://localhost:5173/login");
await pg.fill("input[type=text]", "xixi");
await pg.fill("input[type=password]", "123456");
await pg.click("button[type=submit]");
await pg.waitForTimeout(3000);
console.log("Logged in");

// Navigate to compose by clicking the + button (center of bottom nav)
await pg.click("button.w-11.h-11");
await pg.waitForTimeout(1500);
await pg.screenshot({ path: "qa-compose-page.png" });
console.log("Compose page OK");

// Create a post
await pg.fill("textarea", "Playwright自动化测试 - 这是一条测试动态");
await pg.click("button:has-text(\"发布\")");
await pg.waitForTimeout(3000);
await pg.screenshot({ path: "qa-after-post.png" });
console.log("Post created");

// Test comment
const commentBtns = await pg.locator("text=评论").all();
if (commentBtns.length > 0) {
  await commentBtns[0].click();
  await pg.waitForTimeout(1000);
  const inputs = await pg.locator("input[placeholder]").all();
  if (inputs.length > 0) {
    await inputs[0].fill("这是一条评论");
    await pg.keyboard.press("Enter");
    await pg.waitForTimeout(1500);
    console.log("Comment posted");
  }
}
await pg.screenshot({ path: "qa-with-comment.png" });

// Test profile page
await pg.click("text=我的");
await pg.waitForTimeout(1500);
await pg.screenshot({ path: "qa-profile.png" });
console.log("Profile page OK");

await bw.close();
console.log("ALL TESTS COMPLETE");
