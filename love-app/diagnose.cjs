const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
  });
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

  try {
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle", timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const rootHTML = await page.evaluate(() => {
      const root = document.getElementById("root");
      return root ? root.innerHTML.substring(0, 2000) : "NO ROOT";
    });
    console.log("ROOT HTML:", rootHTML);
    
    const url = page.url();
    console.log("CURRENT URL:", url);
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log("BODY TEXT:", bodyText);
    
  } catch (err) {
    console.log("ERROR:", err.message);
  } finally {
    await browser.close();
  }
})();
