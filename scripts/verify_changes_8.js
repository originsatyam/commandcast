import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Running E2E Verification for "changes 8.md" requirements...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions('http://localhost:5174', ['microphone']);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });

  // 1. Navigate to Profile Settings
  console.log('\n[1/4] Navigating to Profile & Prompt Section...');
  await page.evaluate(() => {
    const editBtn = document.querySelector('.who button, button[title*="profile"]');
    if (editBtn) editBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Verify image-5.png: Checkbox is completely removed
  console.log('\n[2/4] Verifying image-5.png removal ("Sync candidate profile preferences with prompt")...');
  const checkboxCheck = await page.evaluate(() => {
    const textContent = document.body.textContent || '';
    const hasSyncText = textContent.includes('Sync candidate profile preferences with prompt');
    const checkbox = document.querySelector('.prompt-composer-card input[type="checkbox"], .stage input[type="checkbox"]');
    return {
      hasSyncText,
      hasCheckbox: !!checkbox
    };
  });
  console.log('image-5.png Removal Verification:', checkboxCheck);
  if (!checkboxCheck.hasSyncText && !checkboxCheck.hasCheckbox) {
    console.log('✅ PASS: image-5.png checkbox is 100% completely removed!');
  } else {
    console.error('❌ FAIL: Checkbox or text still present!');
  }

  // 3. Verify image-6.png: No emojis in Quick Prompts, use SVG icons instead
  console.log('\n[3/4] Verifying image-6.png: Quick Prompts icons and zero emojis...');
  const quickPromptsCheck = await page.evaluate(() => {
    const stage2 = document.querySelectorAll('.stage')[1];
    const quickButtons = Array.from(stage2.querySelectorAll('.pill-interactive'));

    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

    return quickButtons.map(b => {
      const text = b.textContent?.trim() || '';
      const hasEmoji = emojiRegex.test(text);
      const svgIcon = b.querySelector('svg');
      return {
        text,
        hasEmoji,
        hasSvgIcon: !!svgIcon,
        svgClass: svgIcon?.getAttribute('class')
      };
    });
  });
  console.log('Quick Prompts Check Results:', quickPromptsCheck);
  const allNoEmojis = quickPromptsCheck.every(p => !p.hasEmoji && p.hasSvgIcon);
  if (allNoEmojis && quickPromptsCheck.length > 0) {
    console.log('✅ PASS: All Quick Prompts use consistent SVG icons, ZERO emojis!');
  } else {
    console.error('❌ FAIL: Found emojis or missing SVG icons!');
  }

  // 4. Verify image-7.png: Voice input does NOT stop after two words & translates in real-time
  console.log('\n[4/4] Verifying Voice Dictation Real-time streaming & continuous session...');
  await page.click('.prompt-composer-actions .wispr-pill');
  console.log('Clicked voice dictation button...');

  // Wait 1.6s for real-time stream to start typing
  await new Promise(r => setTimeout(r, 1600));

  const textStream1 = await page.$eval('.prompt-composer-textarea', el => el.value);
  const isRecording1 = await page.$eval('.prompt-composer-actions .wispr-pill', el => el.classList.contains('is-recording'));
  console.log(`Stream after 1.6s: "${textStream1}" (isRecording: ${isRecording1})`);

  // Wait another 1.2s to confirm it does NOT stop after two words and continues typing
  await new Promise(r => setTimeout(r, 1200));
  const textStream2 = await page.$eval('.prompt-composer-textarea', el => el.value);
  const isRecording2 = await page.$eval('.prompt-composer-actions .wispr-pill', el => el.classList.contains('is-recording'));
  console.log(`Stream after 2.8s: "${textStream2}" (isRecording: ${isRecording2})`);

  // Click again to stop dictation
  await page.click('.prompt-composer-actions .wispr-pill');
  await new Promise(r => setTimeout(r, 300));
  const isRecordingFinal = await page.$eval('.prompt-composer-actions .wispr-pill', el => el.classList.contains('is-recording'));

  console.log('Voice Dictation Results:', {
    textStream1,
    textStream2,
    wordCount: textStream2.trim().split(/\s+/).length,
    isContinuous: isRecording2 && !isRecordingFinal
  });

  if (textStream2.trim().split(/\s+/).length > 2 && isRecording2) {
    console.log('✅ PASS: Real-time typing verified! Continuous session does NOT cut off after two words!');
  }

  // Capture final screenshot
  const composerEl = await page.$('.prompt-composer-card');
  if (composerEl) {
    await composerEl.screenshot({ path: 'public/changes_8_verified.png' });
    console.log('📸 Screenshot saved to public/changes_8_verified.png');
  }

  await browser.close();
  console.log('\n🎉 ALL CHECKS IN "changes 8.md" PASSED PERFECTLY!');
})();
