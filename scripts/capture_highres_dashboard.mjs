import puppeteer from "puppeteer";
import path from "node:path";
import fs from "node:fs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu-sandbox",
      "--font-render-hinting=max",
      "--enable-font-antialiasing"
    ]
  });

  try {
    const page = await browser.newPage();

    // 1. Exact 1600 x 1200 @ 1x (Output: 1600 x 1200 PNG)
    console.log("Setting viewport to 1600x1200 (scale: 1)...");
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 1
    });

    console.log("Navigating to https://commandcast.vercel.app ...");
    await page.goto("https://commandcast.vercel.app", {
      waitUntil: "networkidle0",
      timeout: 30000
    });

    // Wait for fonts and components
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await sleep(2000);

    const outDir1 = "c:\\CommandCast";
    const outDir2 = "C:\\Users\\satya\\.gemini\\antigravity\\brain\\a696df42-ac86-45ca-925e-d37e1b1c1def";

    const path1xLocal = path.join(outDir1, "commandcast_dashboard_1600x1200.png");
    const path1xArtifact = path.join(outDir2, "commandcast_dashboard_1600x1200.png");

    console.log("Capturing 1600x1200 screenshot...");
    await page.screenshot({
      path: path1xLocal,
      type: "png"
    });
    fs.copyFileSync(path1xLocal, path1xArtifact);
    console.log("Saved:", path1xLocal);

    // 2. Ultra-high quality 2x Retina (Viewport 1600x1200, scale 2 -> Output: 3200 x 2400 PNG)
    console.log("Setting viewport to 1600x1200 (scale: 2 for ultra-crisp Retina)...");
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 2
    });
    await sleep(1500);

    const path2xLocal = path.join(outDir1, "commandcast_dashboard_3200x2400_retina.png");
    const path2xArtifact = path.join(outDir2, "commandcast_dashboard_3200x2400_retina.png");

    console.log("Capturing 3200x2400 Retina screenshot...");
    await page.screenshot({
      path: path2xLocal,
      type: "png"
    });
    fs.copyFileSync(path2xLocal, path2xArtifact);
    console.log("Saved:", path2xLocal);

    // Also check image dimensions to verify
    console.log("Capture completed successfully!");
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
