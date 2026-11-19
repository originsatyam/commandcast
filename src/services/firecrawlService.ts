/**
 * Firecrawl Service - Deep Web Scraping & Structured Job Extraction
 * Powered by Firecrawl API (v1 /search & /scrape).
 * Exclusively discovers and scrapes authentic, direct ATS job requisitions.
 */

export const FIRECRAWL_DEFAULT_KEY =
  (import.meta.env?.VITE_FIRECRAWL_API_KEY as string) || "";

export interface FirecrawlScrapeResult {
  url: string;
  success: boolean;
  title?: string;
  markdown?: string;
  description?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    statusCode?: number;
    ogTitle?: string;
    ogDescription?: string;
  };
  latencyMs: number;
  scrapedAt: string;
  error?: string;
}

export interface DiscoveredATSJob {
  url: string;
  requisitionId: string;
  platform: "Greenhouse ATS" | "Lever ATS" | "Ashby ATS" | "Direct ATS Requisition";
  companyName: string;
  title: string;
  snippet: string;
  locationText: string;
  isRemote: boolean;
  isIndiaEligible: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const FIRECRAWL_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache
const scrapeCache = new Map<string, CacheEntry<FirecrawlScrapeResult>>();
const searchCache = new Map<string, CacheEntry<DiscoveredATSJob[]>>();

/**
 * Validates and extracts canonical ATS requisition details from a URL.
 * Rejects root boards, careers indexes, and generic company portals.
 */
export function parseATSRequisitionUrl(rawUrl: string): {
  isValid: boolean;
  canonicalUrl: string;
  requisitionId: string;
  companySlug: string;
  platform: "Greenhouse ATS" | "Lever ATS" | "Ashby ATS" | "Direct ATS Requisition";
} | null {
  if (!rawUrl) return null;
  const clean = rawUrl.trim();

  // 1. Lever: jobs.lever.co/<company>/<uuid> (or /apply)
  const leverMatch = /jobs\.lever\.co\/([a-zA-Z0-9_.-]+)\/([a-f0-9-]{10,})/i.exec(clean);
  if (leverMatch) {
    return {
      isValid: true,
      companySlug: leverMatch[1],
      requisitionId: leverMatch[2],
      canonicalUrl: `https://jobs.lever.co/${leverMatch[1]}/${leverMatch[2]}`,
      platform: "Lever ATS"
    };
  }

  // 2. Greenhouse: (boards|job-boards).greenhouse.io/<company>/jobs/<id>
  const ghMatch = /(?:boards|job-boards)\.greenhouse\.io\/([a-zA-Z0-9_.-]+)\/jobs\/(\d+)/i.exec(clean);
  if (ghMatch) {
    return {
      isValid: true,
      companySlug: ghMatch[1],
      requisitionId: ghMatch[2],
      canonicalUrl: `https://job-boards.greenhouse.io/${ghMatch[1]}/jobs/${ghMatch[2]}`,
      platform: "Greenhouse ATS"
    };
  }

  // 3. Ashby: jobs.ashbyhq.com/<company>/<uuid>
  const ashbyMatch = /jobs\.ashbyhq\.com\/([a-zA-Z0-9_.-]+)\/([a-f0-9-]{10,})/i.exec(clean);
  if (ashbyMatch) {
    return {
      isValid: true,
      companySlug: ashbyMatch[1],
      requisitionId: ashbyMatch[2],
      canonicalUrl: `https://jobs.ashbyhq.com/${ashbyMatch[1]}/${ashbyMatch[2]}`,
      platform: "Ashby ATS"
    };
  }

  return null;
}

/**
 * Searches the live web using Firecrawl Search API for authentic ATS job requisitions.
 * Focuses strictly on remote opportunities accessible from India or worldwide.
 */
export async function searchJobsWithFirecrawl(
  roleQuery: string,
  apiKey: string = FIRECRAWL_DEFAULT_KEY,
  forceFresh = false
): Promise<DiscoveredATSJob[]> {
  const cacheKey = `fc_search_${roleQuery.toLowerCase().trim()}`;
  if (!forceFresh) {
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < FIRECRAWL_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const cleanRole = roleQuery.replace(/intern|junior|senior|lead/gi, "").trim() || "Product Designer";
  // Construct targeted search queries across the top 3 verified ATS providers
  const searchQueries = [
    `site:jobs.ashbyhq.com OR site:jobs.lever.co OR site:job-boards.greenhouse.io "${cleanRole}" "Remote" ("India" OR "Anywhere" OR "Worldwide")`,
    `site:jobs.ashbyhq.com OR site:jobs.lever.co "${cleanRole}" ("India" OR "Remote")`
  ];

  const jobsMap = new Map<string, DiscoveredATSJob>();

  for (const query of searchQueries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, limit: 8 }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const body = await res.json();
        const results = body.data || [];

        for (const item of results) {
          const parsed = parseATSRequisitionUrl(item.url);
          if (!parsed || !parsed.isValid) continue; // Skip generic boards / homepages

          if (jobsMap.has(parsed.canonicalUrl)) continue;

          const desc = item.description || "";
          const title = item.title || `${cleanRole} Requisition`;

          // Detect location and India remote eligibility
          const isIndia = /india|bengaluru|bangalore|delhi|gurgaon|pune|mumbai/i.test(desc) || /india/i.test(title);
          const isWorldwide = /worldwide|anywhere|global remote|work from anywhere/i.test(desc);
          const isGeoBlockedUS = /us only|united states only|must reside in the us|must be located in the us/i.test(desc);

          const isIndiaEligible = (isIndia || isWorldwide) && !isGeoBlockedUS;

          // Format clean company name from slug
          const companyFormatted =
            parsed.companySlug.charAt(0).toUpperCase() + parsed.companySlug.slice(1).replace(/[-_]/g, " ");

          jobsMap.set(parsed.canonicalUrl, {
            url: parsed.canonicalUrl,
            requisitionId: parsed.requisitionId,
            platform: parsed.platform,
            companyName: companyFormatted,
            title: title.replace(/[-–|].*Lever.*$/i, "").replace(/@.*Ashby.*$/i, "").replace(/Greenhouse.*$/i, "").trim(),
            snippet: desc,
            locationText: isIndia ? "India (Remote)" : isWorldwide ? "Worldwide Remote" : "Remote",
            isRemote: true,
            isIndiaEligible
          });
        }
      }
    } catch (err) {
      console.warn("Firecrawl search query batch warning:", err);
    }
  }

  const results = Array.from(jobsMap.values());
  searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
  return results;
}

/**
 * Scrapes and extracts clean, LLM-ready markdown from any live career portal URL using Firecrawl.
 */
export async function scrapeUrlWithFirecrawl(
  url: string,
  apiKey: string = FIRECRAWL_DEFAULT_KEY,
  forceFresh = false
): Promise<FirecrawlScrapeResult> {
  const cleanUrl = url.trim();

  // Check in-memory cache first
  if (!forceFresh) {
    const cached = scrapeCache.get(cleanUrl);
    if (cached && Date.now() - cached.timestamp < FIRECRAWL_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout safety

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: cleanUrl,
        formats: ["markdown"]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const result: FirecrawlScrapeResult = {
        url: cleanUrl,
        success: false,
        latencyMs,
        scrapedAt: new Date().toISOString(),
        error: errJson.error || `HTTP ${res.status}: ${res.statusText}`
      };
      return result;
    }

    const data = await res.json();
    const pageData = data.data || {};

    const result: FirecrawlScrapeResult = {
      url: cleanUrl,
      success: true,
      title: pageData.metadata?.title || pageData.metadata?.ogTitle || "Job Posting",
      description: pageData.metadata?.description || pageData.metadata?.ogDescription || "",
      markdown: pageData.markdown || "",
      metadata: pageData.metadata,
      latencyMs,
      scrapedAt: new Date().toISOString()
    };

    scrapeCache.set(cleanUrl, { data: result, timestamp: Date.now() });
    return result;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : "Network error or timeout";

    const result: FirecrawlScrapeResult = {
      url: cleanUrl,
      success: false,
      latencyMs,
      scrapedAt: new Date().toISOString(),
      error: errorMessage
    };
    return result;
  }
}

/**
 * Extracts structured job highlights from scraped markdown content
 */
export function extractJobHighlightsFromMarkdown(markdown: string): {
  responsibilities: string[];
  qualifications: string[];
  overview: string;
} {
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);
  const responsibilities: string[] = [];
  const qualifications: string[] = [];
  let overview = "";

  let currentSection: "none" | "resp" | "qual" = "none";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("responsibilit") || lower.includes("what you'll do") || lower.includes("role overview")) {
      currentSection = "resp";
      continue;
    } else if (lower.includes("qualification") || lower.includes("requirements") || lower.includes("what you'll bring") || lower.includes("who you are")) {
      currentSection = "qual";
      continue;
    } else if (line.startsWith("#")) {
      currentSection = "none";
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const bullet = line.replace(/^[-*]\s+/, "");
      if (currentSection === "resp" && responsibilities.length < 5) {
        responsibilities.push(bullet);
      } else if (currentSection === "qual" && qualifications.length < 5) {
        qualifications.push(bullet);
      }
    } else if (!overview && line.length >= 20 && !line.startsWith("#") && !line.startsWith("[")) {
      overview = line;
    }
  }

  // Fallback if no non-heading line was found
  if (!overview) {
    const firstNonHeading = lines.find((l) => !l.startsWith("#") && !l.startsWith("[") && !l.startsWith("-"));
    overview = firstNonHeading || lines[0] || "Direct career portal opportunity.";
  }

  return {
    responsibilities,
    qualifications,
    overview: overview || lines[0] || "Direct career portal opportunity."
  };
}
