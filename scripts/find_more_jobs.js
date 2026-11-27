const firecrawlKey = process.env.VITE_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY || 'fc-placeholder';

async function findMoreJobs() {
  const queries = [
    'site:boards.greenhouse.io OR site:jobs.lever.co "Product Design" ("Intern" OR "Associate" OR "Junior" OR "Fellow") "Remote"',
    'site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.ashbyhq.com "Product Designer" ("India" OR "Worldwide" OR "Anywhere") "Remote"',
    'site:jobs.ashbyhq.com "Product Designer" Remote',
    'site:job-boards.greenhouse.io "Product Designer" Remote'
  ];

  const results = [];
  for (const q of queries) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: q, limit: 10 })
      });
      const data = await res.json();
      if (data.data) {
        results.push(...data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const valid = [];
  for (const r of results) {
    const url = r.url || '';
    const isLever = /jobs\.lever\.co\/([^/]+)\/([a-f0-9-]{10,})/i.exec(url);
    const isGH = /(?:boards|job-boards)\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i.exec(url);
    const isAshby = /jobs\.ashbyhq\.com\/([^/]+)\/([a-f0-9-]{10,})/i.exec(url);

    if (isLever || isGH || isAshby) {
      const clean = (isLever ? `https://jobs.lever.co/${isLever[1]}/${isLever[2]}` :
                     isGH ? `https://job-boards.greenhouse.io/${isGH[1]}/jobs/${isGH[2]}` :
                     `https://jobs.ashbyhq.com/${isAshby[1]}/${isAshby[2]}`);
      if (!valid.some(v => v.clean === clean)) {
        valid.push({
          clean,
          title: r.title,
          desc: r.description
        });
      }
    }
  }

  console.log(`Discovered ${valid.length} ATS specific jobs:`);
  valid.forEach((v, i) => console.log(`${i+1}. [${v.title}] -> ${v.clean}`));
}

findMoreJobs();

