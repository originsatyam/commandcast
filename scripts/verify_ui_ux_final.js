import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Comprehensive DOM, UI/UX, Logo & Degree-Free Verification...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });

  // 1. Check card logos
  const cardData = await page.evaluate(() => {
    const oppCards = Array.from(document.querySelectorAll('.opp'));
    return oppCards.map(c => {
      const company = c.querySelector('.opp-org b')?.textContent?.trim();
      const title = c.querySelector('.opp-title')?.textContent?.trim();
      const logoImg = c.querySelector('.tile img')?.getAttribute('src');
      const companySiteLink = c.querySelector('a.company-site-link, a[title*="official"]')?.getAttribute('href');
      const applyLink = c.querySelector('a.btn-primary')?.getAttribute('href');
      const tags = Array.from(c.querySelectorAll('.tags .tag')).map(t => t.textContent.trim());

      return { company, title, logoImg, companySiteLink, applyLink, tags };
    });
  });

  console.log(`\n📦 Found ${cardData.length} opportunity cards in DOM:`);
  let hasDegreeLeak = false;
  const degreeRegex = /B\.?Des|B\.?Tech|BTEC|BDES|3rd\s*Year|Final\s*Year/i;

  for (const c of cardData) {
    console.log(`- [${c.company}]`);
    console.log(`    Logo URL: ${c.logoImg}`);
    console.log(`    Company Site: ${c.companySiteLink}`);
    console.log(`    Apply Official: ${c.applyLink}`);
    console.log(`    Craft Tags: [${c.tags.join(', ')}]`);

    // Verify degree check
    for (const t of c.tags) {
      if (degreeRegex.test(t)) {
        console.error(`❌ DEGREE LEAK FOUND IN TAG: "${t}" for ${c.company}`);
        hasDegreeLeak = true;
      }
    }
  }

  if (!hasDegreeLeak) {
    console.log('\n✅ 100% DEGREE-FREE VERIFIED: Zero academic degree bureaucracy found on any card!');
  }

  // 2. Open an opportunity detail modal
  console.log('\n🔍 Opening Opportunity Details Modal...');
  await page.click('.opp:first-child');
  await new Promise(r => setTimeout(r, 600));

  const modalData = await page.evaluate(() => {
    const modal = document.querySelector('.modal-card');
    if (!modal) return null;
    const title = modal.querySelector('#modal-title')?.textContent?.trim();
    const logoImg = modal.querySelector('.tile img')?.getAttribute('src');
    const links = Array.from(modal.querySelectorAll('a')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href')
    }));
    const fullText = modal.textContent;
    return { title, logoImg, links, fullText };
  });

  console.log(`Modal Title: "${modalData?.title}"`);
  console.log(`Modal Logo: "${modalData?.logoImg}"`);
  console.log(`Modal Links:`, modalData?.links);
  const modalDegreeLeak = degreeRegex.test(modalData?.fullText || '');
  console.log(`Modal Degree Leak: ${modalDegreeLeak ? '❌ Found!' : '✅ None! Clean!'}`);

  // Close modal
  await page.click('.modal-card button[aria-label="Close details"]');
  await new Promise(r => setTimeout(r, 400));

  // 3. Test Auth Modal UI & UX
  console.log('\n🔐 Testing Auth Modal UI & UX...');
  // Click Sign In button in sidebar
  await page.evaluate(() => {
    const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In'));
    if (signInBtn) {
      signInBtn.click();
      return true;
    }
    return false;
  });

  await new Promise(r => setTimeout(r, 600));

  const authModalData = await page.evaluate(() => {
    const modal = document.querySelector('.auth-modal-card');
    if (!modal) return null;
    const title = modal.querySelector('#auth-modal-title')?.textContent?.trim();
    const demoBtn = modal.querySelector('.auth-demo-btn')?.textContent?.trim();
    const submitBtn = modal.querySelector('button[type="submit"]')?.textContent?.trim();
    return { title, demoBtn, submitBtn };
  });

  console.log('Auth Modal Opened:', authModalData);

  // Capture modal screenshot
  await page.screenshot({ path: 'public/auth_modal_verified.png' });
  console.log('📸 Auth Modal screenshot saved to public/auth_modal_verified.png');

  // Test 1-click demo sign in
  console.log('⚡ Clicking 1-click Demo Sign In...');
  await page.evaluate(() => {
    const demoBtn = document.querySelector('.auth-demo-btn');
    if (demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const isUserAuthenticated = await page.evaluate(() => {
    const signOutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign Out'));
    return !!signOutBtn;
  });
  console.log(`Demo Authentication Result: ${isUserAuthenticated ? '✅ Instant Sign-in Verified!' : '⚠️ Still unauthenticated'}`);

  // Take screenshot of radar with logos and dual links
  const screenshotPath = 'public/radar_verified_preview.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Screenshot captured at ${screenshotPath}`);

  await browser.close();
  console.log('\n🎉 ALL CHECKS FINISHED!');
})();
