#!/usr/bin/env node
/**
 * Automated ATS Requisition Poller for Campus Radar
 * Periodically polls Lever and Greenhouse public APIs for top tech companies & startups
 * Filters for Student / Early Career / Product Design / Engineering roles open to India or Remote.
 * Run standalone, via cron, or in GitHub Actions.
 */

const TARGET_LEVER_COMPANIES = ["gohighlevel", "palantir", "jumpcloud", "smile-io"];
const TARGET_GREENHOUSE_COMPANIES = ["signoz", "postman", "razorpay", "gallup", "flex"];

const KEYWORD_FILTERS = [
  "intern",
  "design",
  "junior",
  "associate",
  "graduate",
  "frontend",
  "backend",
  "product designer",
  "fellow"
];

function isRelevantRole(title = "") {
  const lower = title.toLowerCase();
  return KEYWORD_FILTERS.some((kw) => lower.includes(kw));
}

function isIndiaOrRemote(location = "") {
  const lower = location.toLowerCase();
  if (lower.includes("us only") || lower.includes("united states only") || lower.includes("must reside in us")) {
    return false;
  }
  return (
    lower.includes("india") ||
    lower.includes("remote") ||
    lower.includes("anywhere") ||
    lower.includes("worldwide") ||
    lower.includes("bengaluru") ||
    lower.includes("bangalore") ||
    lower.includes("pune") ||
    lower.includes("delhi") ||
    lower.includes("hyderabad") ||
    lower.includes("global")
  );
}

async function pollLeverCompany(company) {
  const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "CampusRadar-Poller/1.0" } });
    if (!res.ok) {
      console.warn(`[Lever] ${company} returned status ${res.status}`);
      return [];
    }
    const postings = await res.json();
    if (!Array.isArray(postings)) return [];

    const matches = [];
    for (const post of postings) {
      const title = post.text || "";
      const loc = post.categories?.location || "Remote";
      if (isRelevantRole(title) && isIndiaOrRemote(loc)) {
        matches.push({
          id: `lever-${post.id}`,
          requisitionId: post.id,
          title,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: loc,
          workplaceType: /remote/i.test(loc) ? "Remote" : "Hybrid",
          directApplyUrl: post.hostedUrl || post.applyUrl,
          sourcePlatform: "Lever ATS",
          category: /intern/i.test(title) ? "Internship" : /fellow/i.test(title) ? "Fellowship" : "Internship",
          verifiedDate: new Date().toISOString()
        });
      }
    }
    return matches;
  } catch (err) {
    console.warn(`[Lever] Failed to query ${company}:`, err.message);
    return [];
  }
}

async function pollGreenhouseCompany(company) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "CampusRadar-Poller/1.0" } });
    if (!res.ok) {
      console.warn(`[Greenhouse] ${company} returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    const jobs = data.jobs || [];

    const matches = [];
    for (const job of jobs) {
      const title = job.title || "";
      const loc = job.location?.name || "Remote";
      if (isRelevantRole(title) && isIndiaOrRemote(loc)) {
        matches.push({
          id: `gh-${job.id}`,
          requisitionId: String(job.id),
          title,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: loc,
          workplaceType: /remote/i.test(loc) ? "Remote" : "Hybrid",
          directApplyUrl: job.absolute_url,
          sourcePlatform: "Greenhouse ATS",
          category: /intern/i.test(title) ? "Internship" : /fellow/i.test(title) ? "Fellowship" : "Internship",
          verifiedDate: new Date().toISOString()
        });
      }
    }
    return matches;
  } catch (err) {
    console.warn(`[Greenhouse] Failed to query ${company}:`, err.message);
    return [];
  }
}

async function main() {
  console.log("=== Campus Radar ATS Poller Started ===");
  console.log(`Polling Lever companies: ${TARGET_LEVER_COMPANIES.join(", ")}`);
  console.log(`Polling Greenhouse companies: ${TARGET_GREENHOUSE_COMPANIES.join(", ")}\n`);

  const results = [];

  for (const comp of TARGET_LEVER_COMPANIES) {
    const jobs = await pollLeverCompany(comp);
    results.push(...jobs);
  }

  for (const comp of TARGET_GREENHOUSE_COMPANIES) {
    const jobs = await pollGreenhouseCompany(comp);
    results.push(...jobs);
  }

  console.log(`\nDiscovered ${results.length} qualified opportunities (India / Remote):`);
  results.forEach((r, i) => {
    console.log(`[${i + 1}] ${r.company} — "${r.title}" (${r.location})`);
    console.log(`    URL: ${r.directApplyUrl}`);
  });

  // Supabase Sync if available in environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && results.length > 0) {
    console.log("\nAttempting Supabase upsert...");
    try {
      const upsertUrl = `${supabaseUrl}/rest/v1/opportunities`;
      const res = await fetch(upsertUrl, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(
          results.map((r) => ({
            id: r.id,
            title: r.title,
            company: r.company,
            location: r.location,
            workplace_type: r.workplaceType,
            direct_apply_url: r.directApplyUrl,
            source_platform: r.sourcePlatform,
            category: r.category,
            requisition_id: r.requisitionId,
            verified_date: r.verifiedDate,
            is_active: true
          }))
        )
      });
      console.log(`Supabase upsert HTTP response status: ${res.status}`);
    } catch (err) {
      console.warn("Supabase upsert encountered error:", err.message);
    }
  } else {
    console.log("\nNo Supabase write key present in shell; logging JSON diff to stdout.");
  }

  console.log("=== Campus Radar ATS Poller Finished Successfully ===");
}

main();
