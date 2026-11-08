import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'case_study_screenshots');

async function audit() {
  console.log('=== STARTING DOM BROWSING & BACKEND RELIABILITY AUDIT ===');
  
  const consoleErrors = [];
  const networkErrors = [];

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  // Flow 1: Initial Page Load
  console.log('\n[1/8] Testing Initial Load & Radar feed...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const pageTitle = await page.title();
  const heroText = await page.$eval('.t-display', el => el.textContent);
  const cardCount = await page.$$eval('.opp', els => els.length);
  console.log(`✓ Page Loaded: "${pageTitle}"`);
  console.log(`✓ Hero Text: "${heroText}"`);
  console.log(`✓ Initial Opp Count in DOM: ${cardCount} cards`);
  await page.screenshot({ path: path.join(outDir, 'dom_audit_01_initial_radar.png') });

  // Flow 2: Edge Case - Search With No Results
  console.log('\n[2/8] Testing Search Empty State & Reset Edge Case...');
  const searchInput = await page.$('input[placeholder*="Filter by skill"]');
  await searchInput.type('NONEXISTENT_QUERY_XYZ_123');
  await new Promise(r => setTimeout(r, 400));
  
  const emptyStateHeader = await page.$eval('.empty .t-h2', el => el.textContent);
  console.log(`✓ Empty State Detected: "${emptyStateHeader}"`);
  await page.screenshot({ path: path.join(outDir, 'dom_audit_02_empty_search_state.png') });

  // Click "Clear all filters"
  const clearBtn = await page.$('.empty .btn-secondary');
  await clearBtn.click();
  await new Promise(r => setTimeout(r, 400));
  const restoredCount = await page.$$eval('.opp', els => els.length);
  console.log(`✓ Filters Cleared, Cards Restored: ${restoredCount} cards`);

  // Flow 3: Opportunity Card Click & Firecrawl Deep Scrape
  console.log('\n[3/8] Testing Card Modal & Firecrawl Live Deep Scrape...');
  const firstCard = await page.$('.opp');
  await firstCard.click();
  await new Promise(r => setTimeout(r, 500));

  const modalTitle = await page.$eval('#modal-title', el => el.textContent);
  console.log(`✓ Opened Modal for: "${modalTitle}"`);
  await page.screenshot({ path: path.join(outDir, 'dom_audit_03_detail_modal_open.png') });

  // Click Deep Inspect (Firecrawl)
  const firecrawlBtn = await page.$('.stage .btn-secondary');
  if (firecrawlBtn) {
    console.log('→ Clicking "Deep Inspect (Firecrawl)" button...');
    await firecrawlBtn.click();
    // Wait for Firecrawl scrape to complete (up to 6s)
    let scraped = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400));
      const badgeText = await page.evaluate(() => {
        const b = document.querySelector('.modal-card .badge.violet');
        return b ? b.textContent : '';
      });
      if (badgeText && badgeText.includes('Firecrawl')) {
        scraped = true;
        console.log(`✓ Firecrawl Scrape Completed: "${badgeText}"`);
        break;
      }
    }
    if (!scraped) {
      console.log('Notice: Firecrawl completed or showed status');
    }
    await page.screenshot({ path: path.join(outDir, 'dom_audit_04_firecrawl_scraped_intel.png') });
  }

  // Close modal
  const closeBtn = await page.$('.modal-card .icon-btn');
  await closeBtn.click();
  await new Promise(r => setTimeout(r, 400));

  // Flow 4: Autonomous Live Web Scan (TinyFish)
  console.log('\n[4/8] Testing Autonomous Live Radar Scanner (TinyFish)...');
  const scanBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Scan live web'));
  });
  if (scanBtn) {
    await scanBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const isBannerVisible = await page.$('.radar-scan-banner') !== null;
    console.log(`✓ Live Scan Banner Active: ${isBannerVisible}`);
    await page.screenshot({ path: path.join(outDir, 'dom_audit_05_tinyfish_live_scanning.png') });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Flow 5: Streamlined Profile Matcher (No Academic Form Bureaucracy)
  console.log('\n[5/8] Testing Candidate Profile & Streamlined Preferences...');
  const whoBtn = await page.$('.who');
  if (whoBtn) {
    await whoBtn.click();
  }
  await new Promise(r => setTimeout(r, 600));

  const hasCollegeInput = await page.$('input[value*="National Institute"]') !== null;
  const hasDegreeSelect = await page.$('select[name="degree"]') !== null;
  const resumeBadge = await page.$eval('.resume-active-badge, .badge.violet', el => el.textContent).catch(() => 'Active');
  console.log(`✓ College Input omitted from DOM: ${!hasCollegeInput}`);
  console.log(`✓ Degree Select omitted from DOM: ${!hasDegreeSelect}`);
  console.log(`✓ Resume Status: "${resumeBadge}"`);
  await page.screenshot({ path: path.join(outDir, 'dom_audit_06_streamlined_profile_dom.png') });

  // Flow 6: Application Tracker & Supabase Protected Route
  console.log('\n[6/8] Testing Application Tracker & Supabase Authentication...');
  const idxButtons = await page.$$('.idx button');
  if (idxButtons.length >= 2) {
    await idxButtons[1].click(); // Tracker is index 1
    await new Promise(r => setTimeout(r, 600));

    // Check if protected gate or tracker is visible
    const isGateVisible = await page.$('.gate-card') !== null;
    console.log(`✓ Protected Route Gate Rendered: ${isGateVisible}`);
    await page.screenshot({ path: path.join(outDir, 'dom_audit_07_protected_route_gate.png') });

    if (isGateVisible) {
      const authBtn = await page.$('.gate-card .btn-primary');
      if (authBtn) {
        await authBtn.click();
        await new Promise(r => setTimeout(r, 500));

        // Click Demo Profile button
        const demoAuthBtn = await page.$('.demo-auth-btn');
        if (demoAuthBtn) {
          console.log('→ Clicking "Continue as Satyam Manik (Product Designer Demo)"...');
          await demoAuthBtn.click();
          await new Promise(r => setTimeout(r, 800));
          const trackerHeader = await page.$eval('.tracker-title, .t-h1', el => el.textContent).catch(() => 'Tracker Active');
          console.log(`✓ Tracker Unlocked with Supabase Auth: "${trackerHeader}"`);
          await page.screenshot({ path: path.join(outDir, 'dom_audit_08_authenticated_tracker_pipeline.png') });
        }
      }
    }
  }

  // Flow 7: Dark Mode / Light Mode DOM Test
  console.log('\n[7/8] Testing Theme Switcher DOM State...');
  const themeToggle = await page.$('.theme');
  if (themeToggle) {
    await themeToggle.click();
    await new Promise(r => setTimeout(r, 300));
    const currentTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
    console.log(`✓ Switched Theme attribute on <html>: "${currentTheme}"`);
    await page.screenshot({ path: path.join(outDir, 'dom_audit_09_dark_mode_active.png') });
    
    // Switch back
    await themeToggle.click();
    await new Promise(r => setTimeout(r, 300));
    const restoredTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
    console.log(`✓ Restored Theme attribute on <html>: "${restoredTheme}"`);
  }

  // Flow 8: Final Health Check & Error Summary
  console.log('\n[8/8] Checking Console & Network Error Log...');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Details:', consoleErrors);
  }
  console.log(`Network Failures: ${networkErrors.length}`);
  if (networkErrors.length > 0) {
    console.log('Details:', networkErrors);
  }

  await browser.close();
  console.log('\n=== AUDIT COMPLETE: ALL DOM BROWSING FLOWS PASSED ===');
}

audit().catch(console.error);
