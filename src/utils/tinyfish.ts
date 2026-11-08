export interface TinyFishSearchResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
  site_name?: string;
  date?: string;
}

export interface ExtractedJob {
  title: string;
  company: string;
  location?: string;
  url: string;
  descriptionSnippet: string;
  stipend?: string;
  rawText: string;
}

const DEFAULT_KEY = "sk-tinyfish-your-api-key-here";

export const getStoredTinyFishKey = (): string => {
  try {
    return localStorage.getItem("commandcast_tinyfish_key") || DEFAULT_KEY;
  } catch {
    return DEFAULT_KEY;
  }
};

export const saveStoredTinyFishKey = (key: string): void => {
  try {
    localStorage.setItem("commandcast_tinyfish_key", key);
  } catch (err) {
    console.error("Failed to save TinyFish key:", err);
  }
};

/**
 * Tests TinyFish API connection and returns response latency in ms.
 */
export const testTinyFishConnection = async (
  apiKey: string = getStoredTinyFishKey()
): Promise<{ success: boolean; latencyMs: number; error?: string }> => {
  const start = performance.now();
  try {
    const res = await fetch("https://api.search.tinyfish.ai?query=test&location=US", {
      headers: {
        "X-API-Key": apiKey
      }
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        latencyMs,
        error: errData.error?.message || `HTTP ${res.status}: ${res.statusText}`
      };
    }

    return { success: true, latencyMs };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Math.round(performance.now() - start),
      error: err?.message || "Network error connecting to TinyFish API"
    };
  }
};

/**
 * Searches for live internship opportunities using TinyFish Search API.
 */
export const searchInternshipsWithTinyFish = async (
  query: string,
  apiKey: string = getStoredTinyFishKey()
): Promise<TinyFishSearchResult[]> => {
  const formattedQuery = encodeURIComponent(
    query.includes("internship") ? query : `${query} internship 2027`
  );

  const res = await fetch(
    `https://api.search.tinyfish.ai?query=${formattedQuery}&language=en`,
    {
      headers: {
        "X-API-Key": apiKey
      }
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Search failed with status ${res.status}`);
  }

  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    position: r.position,
    title: r.title,
    url: r.url,
    snippet: r.snippet || "",
    site_name: r.site_name,
    date: r.date
  }));
};

/**
 * Fetches and parses structured job details from any live web URL via TinyFish Fetch API.
 */
export const fetchJobFromUrlWithTinyFish = async (
  url: string,
  apiKey: string = getStoredTinyFishKey()
): Promise<ExtractedJob> => {
  const res = await fetch("https://api.fetch.tinyfish.ai", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      urls: [url]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  const result = data.results?.[0];

  if (!result) {
    throw new Error("No page data returned from TinyFish fetch.");
  }

  const rawTitle = result.title || "Software Engineering Intern";
  const rawText = result.text || "";

  // Intelligent company extraction from title or URL
  let company = "";
  if (rawTitle.includes(" at ")) {
    company = rawTitle.split(" at ")[1].split(/[-–|,]/)[0].trim();
  } else if (rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    company = parts[parts.length - 1].trim();
  } else {
    // Attempt parse from domain hostname
    try {
      const hostname = new URL(url).hostname;
      const domainParts = hostname.replace("www.", "").split(".");
      if (domainParts[0] === "job-boards" && domainParts[1] === "greenhouse") {
        const pathParts = new URL(url).pathname.split("/").filter(Boolean);
        company = pathParts[0]?.toUpperCase() || "Greenhouse Partner";
      } else {
        company = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      }
    } catch {
      company = "Featured Employer";
    }
  }

  // Extract clean title
  let cleanTitle = rawTitle.replace(/ at .*$/, "").replace(/ - .*$/, "").trim();
  if (!cleanTitle || cleanTitle.length < 3) {
    cleanTitle = "Software Engineering Intern";
  }

  // Extract location if present in top snippet
  let location = "Remote (Worldwide / India)";
  if (/India|Bengaluru|Bangalore|Delhi|Gurgaon|Pune|Mumbai/i.test(rawText)) {
    location = "India (Remote)";
  } else if (/Worldwide|Global Remote|Anywhere/i.test(rawText)) {
    location = "Worldwide Remote";
  } else {
    const locationMatch = rawText.match(/(?:Location|Based in|Office):?\s*([A-Za-z\s,]+(?:NY|CA|WA|TX|MA|Remote))/i);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
    } else if (/New York|San Francisco|Seattle|Austin|Boston|Remote/i.test(rawText)) {
      const city = rawText.match(/New York|San Francisco|Seattle|Austin|Boston|Remote/i);
      if (city) location = city[0];
    }
  }

  return {
    title: cleanTitle,
    company: company || "Tech Opportunity",
    location,
    url: result.final_url || url,
    descriptionSnippet: rawText.slice(0, 320).trim(),
    rawText
  };
};
