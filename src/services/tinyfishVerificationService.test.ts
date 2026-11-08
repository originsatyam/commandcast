import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractCleanDomain,
  verifyOpportunityUrl,
  searchLiveOpportunities
} from "./tinyfishVerificationService";

describe("TinyFish Verification & Live Discovery Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts clean domain safely from various URL formats", () => {
    expect(extractCleanDomain("https://careers.google.com/jobs/results/123")).toBe("careers.google.com");
    expect(extractCleanDomain("https://www.boards.greenhouse.io/northfield/jobs/456")).toBe("boards.greenhouse.io");
    expect(extractCleanDomain("invalid-url")).toBe("careers.portal");
    expect(extractCleanDomain(undefined)).toBe("careers.portal");
  });

  it("verifies an active job URL and caches the result for instant lookup", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            final_url: "https://careers.cloudflare.com/jobs/123",
            title: "Systems Engineer Intern",
            text: "Join Cloudflare's core infrastructure team in Summer 2027."
          }
        ]
      })
    });
    globalThis.fetch = mockFetch as any;

    const testUrl = "https://careers.cloudflare.com/jobs/123";

    // First call: hits network
    const result1 = await verifyOpportunityUrl(testUrl, "mock-key", true);
    expect(result1.isAlive).toBe(true);
    expect(result1.status).toBe("active");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call without forceFresh: hits in-memory cache (O(1))
    const result2 = await verifyOpportunityUrl(testUrl, "mock-key", false);
    expect(result2.isAlive).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Did not make a 2nd network call
  });

  it("identifies expired or filled positions and marks them closed", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            final_url: "https://careers.example.com/expired",
            title: "Product Intern",
            text: "Thank you for your interest. This position has been filled."
          }
        ]
      })
    });
    globalThis.fetch = mockFetch as any;

    const result = await verifyOpportunityUrl("https://careers.example.com/expired", "mock-key", true);
    expect(result.isAlive).toBe(false);
    expect(result.status).toBe("closed");
    expect(result.verdict).toContain("closed");
  });

  it("marks unreachable or network error URLs as unreachable instead of active", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502
    });
    globalThis.fetch = mockFetch as any;

    const result = await verifyOpportunityUrl("https://jobs.lever.co/example/failed-link", "mock-key", true);
    expect(result.isAlive).toBe(false);
    expect(result.status).toBe("unreachable");
    expect(result.requisitionVerified).toBe(false);
  });

  it("searches and synthesizes live ATS listings with deduplication", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            position: 1,
            title: "Software Engineering Intern 2027 at Datadog",
            url: "https://jobs.lever.co/datadog/ea04f41f-62c2-40a2-996f-6d7389d80124",
            snippet: "Remote software engineering internship in India for 2027.",
            site_name: "Datadog"
          },
          // Duplicate URL to test O(1) deduplication
          {
            position: 2,
            title: "Software Engineering Intern 2027 at Datadog (Duplicate)",
            url: "https://jobs.lever.co/datadog/ea04f41f-62c2-40a2-996f-6d7389d80124",
            snippet: "Duplicate entry",
            site_name: "Datadog"
          }
        ]
      })
    });
    globalThis.fetch = mockFetch as any;

    const listings = await searchLiveOpportunities("datadog", "2027", "mock-key");
    expect(listings.length).toBe(1); // Deduplicated correctly
    expect(listings[0].company).toBe("Datadog");
    expect(listings[0].trustScore).toBe(98);
  });
});

