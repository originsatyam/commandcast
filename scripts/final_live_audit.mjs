import fs from 'fs';

const tfKey = process.env.VITE_TINYFISH_API_KEY || process.env.TINYFISH_API_KEY || 'sk-tinyfish-placeholder';

const mockFile = fs.readFileSync('./src/data/mockOpportunities.ts', 'utf8');
const urls = [...mockFile.matchAll(/directApplyUrl:\s*["']([^"']+)["']/g)].map(m => m[1]);
const titles = [...mockFile.matchAll(/title:\s*["']([^"']+)["']/g)].map(m => m[1]);
const companies = [...mockFile.matchAll(/company:\s*["']([^"']+)["']/g)].map(m => m[1]);

async function verifyAll() {
  console.log('================================================================');
  console.log('LIVE AUDIT: VERIFYING ALL 8 OPPORTUNITIES VIA TINYFISH FETCH');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const company = companies[i] || 'Company';
    const title = titles[i] || 'Role';
    console.log(`\n[${i + 1}/${urls.length}] ${company} - ${title}`);
    console.log(`     Target URL:    ${url}`);

    try {
      const res = await fetch('https://api.fetch.tinyfish.ai', {
        method: 'POST',
        headers: {
          'X-API-Key': tfKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: [url] })
      });

      if (!res.ok) {
        console.error(`     [FAIL] TinyFish returned HTTP ${res.status}`);
        failed++;
        continue;
      }

      const data = await res.json();
      const result = data.results?.[0];
      const finalUrl = result?.final_url || url;
      const isRedirectedToCareers =
        finalUrl.includes('?error=true') ||
        (finalUrl.includes('/careers') && !finalUrl.includes('gh_jid') && !finalUrl.includes('jobs/')) ||
        finalUrl.endsWith('/jobs') ||
        finalUrl.endsWith('/jobs/');

      const isClosed =
        isRedirectedToCareers ||
        (result?.text || '').toLowerCase().includes('position has been filled') ||
        (result?.text || '').toLowerCase().includes('this job is no longer available');

      console.log(`     Resolved URL:  ${finalUrl}`);
      console.log(`     Page Title:    ${result?.title}`);
      console.log(`     Is Redirect?   ${finalUrl !== url ? 'YES (' + finalUrl + ')' : 'NO'}`);
      console.log(`     Is Closed?     ${isClosed ? 'YES' : 'NO'}`);

      if (!isClosed && !isRedirectedToCareers) {
        console.log(`     STATUS:        [PASS] VERIFIED ACTIVE ATS REQUISITION`);
        passed++;
      } else {
        console.log(`     STATUS:        [FAIL] REQUISITION CLOSED OR REDIRECTED`);
        failed++;
      }
    } catch (e) {
      console.error(`     [ERROR]:`, e.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${urls.length})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifyAll();
