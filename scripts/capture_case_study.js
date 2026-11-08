import puppeteer from "puppeteer";
import path from "node:path";
import fs from "node:fs";

const OUTPUT_DIR = "c:\\CommandCast\\case_study_screenshots";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Starting DOM browsing session for Campus Radar...");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,960"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  console.log("Navigating to http://localhost:5173/ ...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle0" });
  await sleep(1000);

  // 1. Hero & Radar Overview
  console.log("1. Capturing 01_hero_and_radar_overview.png");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01_hero_and_radar_overview.png"),
    fullPage: false
  });

  // 2. Relevance Filter: Matches My Profile (Batch 2027)
  console.log("2. Clicking 'Matches my profile (2027 Batch)' chip");
  const profileMatchBtn = await page.waitForSelector('button[title*="Filter opportunities matching"]');
  if (profileMatchBtn) {
    await profileMatchBtn.click();
    await sleep(800);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "02_relevance_filter_batch_2027.png"),
      fullPage: false
    });
  }

  // 3. Granular Filters: 3rd Year + Remote
  console.log("3. Applying Granular Filters: 3rd Year & Remote");
  const chips = await page.$$("button.chip");
  for (const chip of chips) {
    const text = await page.evaluate((el) => el.innerText.trim(), chip);
    if (text === "3rd Year" || text === "Remote") {
      await chip.click();
      await sleep(300);
    }
  }
  await sleep(600);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03_granular_filter_selection.png"),
    fullPage: false
  });

  // Reset filters for subsequent interactions
  const resetBtn = await page.$("button.btn-ghost.btn-sm");
  if (resetBtn) {
    await resetBtn.click();
    await sleep(600);
  }

  // 4. Live TinyFish Verification on Card
  console.log("4. Triggering TinyFish live verification on card");
  const verifyLiveBtn = await page.waitForSelector('button[title*="Ping and verify live page status"]');
  if (verifyLiveBtn) {
    await verifyLiveBtn.click();
    console.log("Waiting for TinyFish live response...");
    await sleep(3000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "04_tinyfish_live_verification.png"),
      fullPage: false
    });
  }

  // 5. Proof & Verification Modal
  console.log("5. Opening 'Review proof' modal");
  const reviewProofBtns = await page.$$("button.btn.btn-secondary.btn-sm");
  for (const btn of reviewProofBtns) {
    const text = await page.evaluate((el) => el.innerText.trim(), btn);
    if (text.includes("Review proof")) {
      await btn.click();
      break;
    }
  }
  await sleep(800);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05_proof_and_verification_modal.png"),
    fullPage: false
  });

  // Close modal
  const closeBtn = await page.$('button[aria-label="Close details"]');
  if (closeBtn) {
    await closeBtn.click();
    await sleep(600);
  }

  // 6. TinyFish Web Radar Live Scan
  console.log("6. Triggering 'Scan Web with TinyFish'");
  const scanWebBtn = await page.waitForSelector('button[title*="Query TinyFish Search Engine"]');
  if (scanWebBtn) {
    await scanWebBtn.click();
    console.log("Waiting for live search query...");
    await sleep(3500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "06_tinyfish_web_radar_scan.png"),
      fullPage: false
    });
  }

  // 7. Save to Tracker Interaction
  console.log("7. Clicking save bookmark on opportunity");
  const saveBtns = await page.$$("button.save");
  if (saveBtns.length > 2) {
    await saveBtns[2].click();
    await sleep(800);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "07_save_to_tracker_interaction.png"),
      fullPage: false
    });
  }

  // 8. Application Tracker Pipeline Tab
  console.log("8. Navigating to 'My Tracker' tab");
  const navBtns = await page.$$("nav.nav button");
  for (const nb of navBtns) {
    const text = await page.evaluate((el) => el.innerText.trim(), nb);
    if (text.includes("My Tracker")) {
      await nb.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08_application_tracker_pipeline.png"),
    fullPage: false
  });

  // 9. Tracker Stage Progression Interaction
  console.log("9. Advancing an application stage to 'Interviewing'");
  const stepperBtns = await page.$$(".stepper button.step");
  for (const sb of stepperBtns) {
    const text = await page.evaluate((el) => el.innerText.trim(), sb);
    if (text.includes("Interviewing")) {
      await sb.click();
      break;
    }
  }
  await sleep(800);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "09_tracker_stage_progression.png"),
    fullPage: false
  });

  // 10. Why Campus Radar Gap Matrix Tab
  console.log("10. Navigating to 'Why Campus Radar' tab");
  const navBtns2 = await page.$$("nav.nav button");
  for (const nb of navBtns2) {
    const text = await page.evaluate((el) => el.innerText.trim(), nb);
    if (text.includes("Why Campus Radar")) {
      await nb.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "10_why_campus_radar_gap_matrix.png"),
    fullPage: false
  });

  // 11. Student Profile & Matcher Tab
  console.log("11. Navigating to Student Profile tab");
  const navBtns3 = await page.$$("nav.nav button");
  for (const nb of navBtns3) {
    const text = await page.evaluate((el) => el.innerText.trim(), nb);
    if (text.includes("Aarav")) {
      await nb.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "11_student_profile_matcher.png"),
    fullPage: false
  });

  // 12. Dark Mode Toggle
  console.log("12. Toggling Dark Mode");
  const themeBtn = await page.waitForSelector('button[aria-label="Switch color theme"]');
  if (themeBtn) {
    await themeBtn.click();
    await sleep(800);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "12_dark_mode_profile.png"),
      fullPage: false
    });

    // 13. Dark Mode Radar Overview
    console.log("13. Navigating to Opportunities in Dark Mode");
    const navBtns4 = await page.$$("nav.nav button");
    for (const nb of navBtns4) {
      const text = await page.evaluate((el) => el.innerText.trim(), nb);
      if (text.includes("Opportunities")) {
        await nb.click();
        break;
      }
    }
    await sleep(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "13_dark_mode_radar_overview.png"),
      fullPage: false
    });

    // 14. Dark Mode Tracker
    console.log("14. Navigating to Tracker in Dark Mode");
    const navBtns5 = await page.$$("nav.nav button");
    for (const nb of navBtns5) {
      const text = await page.evaluate((el) => el.innerText.trim(), nb);
      if (text.includes("My Tracker")) {
        await nb.click();
        break;
      }
    }
    await sleep(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "14_dark_mode_tracker_pipeline.png"),
      fullPage: false
    });
  }

  await browser.close();
  console.log("DOM browsing and screenshot capture completed successfully!");
}

run().catch((err) => {
  console.error("DOM browsing error:", err);
  process.exit(1);
});

