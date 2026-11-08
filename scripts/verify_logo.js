import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

  const faviconHref = await page.evaluate(() => {
    const el = document.querySelector('link[rel="icon"]');
    return el ? el.href : null;
  });
  console.log('Favicon Link in DOM:', faviconHref);

  const brandSvg = await page.evaluate(() => {
    const el = document.querySelector('.brand svg');
    return el ? el.outerHTML : null;
  });
  console.log('Brand Logo SVG in DOM:', brandSvg);

  await page.screenshot({ path: 'case_study_screenshots/dom_audit_campus_radar_logo.png' });
  console.log('Saved case_study_screenshots/dom_audit_campus_radar_logo.png');

  await browser.close();
}

main().catch(console.error);

