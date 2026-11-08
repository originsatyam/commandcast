import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'case_study_screenshots');

async function getAvailableUrl() {
  const ports = [5174, 5173];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok || res.status === 200) {
        return `http://localhost:${port}/`;
      }
    } catch {
      // try next
    }
  }
  return 'http://localhost:5174/';
}

async function run() {
  const targetUrl = await getAvailableUrl();
  console.log(`Connecting to dev server at ${targetUrl}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Personalized Autonomous Radar Console (image-1.png doubt resolved: no redundant giant search input)
  console.log('Capturing Personalized Radar Console...');
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'v6_01_personalized_radar_console.png'), fullPage: false });

  // 2. Trigger Scan Live Web to capture live radar beam motion
  console.log('Triggering Scan Live Web for radar beam motion...');
  const scanBtn = await page.$('.scan-btn-hero');
  if (scanBtn) {
    await scanBtn.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, 'v6_02_radar_scan_live_motion.png'), fullPage: false });
    await new Promise(r => setTimeout(r, 1200));
  }

  // 3. Click bookmark on first card to trigger spring pop
  console.log('Testing Bookmark Spring Pop...');
  const bookmarkBtn = await page.$('.bookmark-btn');
  if (bookmarkBtn) {
    await bookmarkBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'v6_03_bookmark_spring_interaction.png'), fullPage: false });
  }

  // 4. Click filter pill to show smooth transition
  console.log('Testing Interactive Filter Pill...');
  const remotePill = await page.$('.composer-tools .pill:nth-child(2)');
  if (remotePill) {
    await remotePill.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'v6_04_interactive_filter_transition.png'), fullPage: false });
  }

  // 5. Test Satyam Manik Product Designer Resume Parsing & Matching
  console.log('Testing Satyam Manik Product Designer Resume autofill...');
  // Navigate to profile tab via sidebar
  const profileNavBtn = await page.$('.side .who');
  if (profileNavBtn) {
    await profileNavBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'v6_05_profile_matcher_tab.png'), fullPage: false });

    // Click "Sample: Satyam Manik (Product Designer CV.pdf)"
    const sampleSatyamBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && b.textContent.includes('Satyam Manik'));
    });

    if (sampleSatyamBtn) {
      await sampleSatyamBtn.click();
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, 'v6_06_satyam_manik_parsed_profile.png'), fullPage: false });

      // Navigate back to radar
      const radarNavBtn = await page.$('.idx button:first-child');
      if (radarNavBtn) {
        await radarNavBtn.click();
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: path.join(outDir, 'v6_07_radar_tailored_for_satyam.png'), fullPage: false });
      }
    }
  }

  // 6. Test Supabase Auth & Protected Routes
  console.log('Testing Supabase Auth & Protected Routes...');
  // Clear demo auth from localStorage to start in unauthenticated state
  await page.evaluate(() => {
    localStorage.removeItem('campus_radar_demo_user');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'v7_01_unauthenticated_state.png'), fullPage: false });

  // Navigate to protected tracker
  const trackerNavBtn = await page.$('.idx button:nth-child(2)');
  if (trackerNavBtn) {
    await trackerNavBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'v7_02_protected_route_gate.png'), fullPage: false });
  }

  // Open Supabase Auth Modal
  const authModalBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('Sign In / Create Account'));
  });

  if (authModalBtn) {
    await authModalBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'v7_03_supabase_auth_modal.png'), fullPage: false });

    // Click demo sign in inside modal
    const demoLoginBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && b.textContent.includes('Continue as Satyam Manik'));
    });

    if (demoLoginBtn) {
      await demoLoginBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outDir, 'v7_04_authenticated_tracker_unlocked.png'), fullPage: false });

      // Navigate to profile tab while authenticated to capture streamlined form (changes 5.md)
      console.log('Capturing Streamlined Profile Matcher (omitting college, degree, batch)...');
      const profileTabBtn = await page.$('.side .who');
      if (profileTabBtn) {
        await profileTabBtn.click();
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: path.join(outDir, 'v8_01_streamlined_profile_matcher.png'), fullPage: false });
      }
    }
  }

  await browser.close();
  console.log('All v6 & v7 screenshots captured successfully!');
}

run().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
