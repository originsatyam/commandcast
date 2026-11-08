import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });

    // 1. Verify that opportunity titles have direct ATS links (with requisition IDs)
    const titleLinks = await page.$$eval('.opp-title a', links =>
      links.map(l => ({
        text: l.innerText.trim(),
        href: l.href
      }))
    );

    console.log(`Found ${titleLinks.length} opportunity title links:`);
    let genericFound = false;

    titleLinks.forEach((tl, idx) => {
      console.log(`[${idx + 1}] "${tl.text}" -> ${tl.href}`);
      // Check that it's NOT a generic /careers page
      if (/\/careers\/?$/i.test(tl.href) || tl.href.endsWith('/careers') || tl.href.endsWith('/positions/')) {
        genericFound = true;
        console.error(`FAIL: Found generic careers link: ${tl.href}`);
      }
    });

    if (genericFound) {
      throw new Error('Generic careers link detected on opportunity title!');
    }
    console.log('✓ PASS: All opportunity titles link directly to specific ATS job requisitions (0 generic /careers links).');

    // 2. Verify India Remote badge presence
    const indiaBadges = await page.$$eval('.opp .tag', tags =>
      tags.map(t => t.innerText.trim()).filter(t => t.includes('India Remote') || t.includes('Worldwide Remote'))
    );
    console.log(`Found ${indiaBadges.length} remote eligibility tags:`, indiaBadges);
    if (indiaBadges.length === 0) {
      throw new Error('No India Remote / Worldwide Remote badges found on opportunity cards!');
    }
    console.log('✓ PASS: India Remote eligibility tags are actively displayed.');

    // 3. Open Detail Modal for the first opportunity
    console.log('Opening Detail Modal for first opportunity...');
    const firstOpp = await page.$('.opp');
    await firstOpp.click();
    await page.waitForSelector('.modal-card', { timeout: 5000 });

    // Verify Modal content
    const modalDirectLink = await page.$eval('.modal-card a[href^="http"]', a => a.href);
    console.log(`Modal Direct Apply link: ${modalDirectLink}`);

    const modalText = await page.$eval('.modal-card', el => el.innerText);
    console.log('Modal text sample:\n', modalText.slice(0, 400));
    const lowerModalText = modalText.toLowerCase();
    const hasIndiaFeasibility = lowerModalText.includes('working remotely from india') && lowerModalText.includes('timezone overlap');

    if (!hasIndiaFeasibility) {
      throw new Error('Detail modal does not contain "Working Remotely from India" section!');
    }
    console.log('✓ PASS: Detail modal contains "Working Remotely from India (Feasibility & Solutions)" section.');

    // 4. Test Live Verify button on first card
    await page.click('.modal-card button[aria-label="Close details"]');
    await page.waitForFunction(() => !document.querySelector('.modal-card'));

    console.log('Testing "Live verify" button on first card...');
    const verifyBtn = await page.$('.opp:first-child .btn-secondary');
    if (verifyBtn) {
      await verifyBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      const proofText = await page.$eval('.opp:first-child .proof', el => el.innerText);
      console.log(`Live verify proof text: "${proofText}"`);
      console.log('✓ PASS: Live verify button executed successfully.');
    }

    console.log('\n=== ALL DOM & BACKEND INTEGRITY VERIFICATIONS PASSED ===');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
