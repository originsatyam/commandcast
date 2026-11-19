import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  scrapeUrlWithFirecrawl,
  extractJobHighlightsFromMarkdown,
  FIRECRAWL_DEFAULT_KEY
} from "./firecrawlService";

describe("Firecrawl Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exports a valid default Firecrawl API key string or empty fallback", () => {
    expect(typeof FIRECRAWL_DEFAULT_KEY).toBe("string");
  });

  it("parses responsibilities and qualifications cleanly from markdown", () => {
    const mockMarkdown = `
# Product Design Intern
Help us build next-generation interfaces.

### Responsibilities
- Design component libraries in Figma
- Conduct weekly user testing sessions
- Collaborate with frontend engineers

### Requirements
- 2+ years of design education or relevant coursework
- Experience with design tokens and auto-layout
- Strong visual communication skills
`;

    const parsed = extractJobHighlightsFromMarkdown(mockMarkdown);
    expect(parsed.responsibilities.length).toBe(3);
    expect(parsed.responsibilities[0]).toContain("Design component libraries in Figma");
    expect(parsed.qualifications.length).toBe(3);
    expect(parsed.qualifications[0]).toContain("2+ years of design education");
    expect(parsed.overview).toContain("Help us build next-generation interfaces.");
  });

  it("handles live scraping with mocked fetch successfully", async () => {
    const mockResponse = {
      success: true,
      data: {
        markdown: "# Figma Design Intern\nRemote work.",
        metadata: {
          title: "Figma Careers - Design Intern",
          description: "Join Figma design team."
        }
      }
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await scrapeUrlWithFirecrawl("https://figma.com/careers/design-intern", undefined, true);
    expect(result.success).toBe(true);
    expect(result.title).toBe("Figma Careers - Design Intern");
    expect(result.markdown).toContain("Figma Design Intern");
  });

  it("gracefully catches fetch errors and returns structured error payload", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network timeout"));

    const result = await scrapeUrlWithFirecrawl("https://broken.invalid/job", undefined, true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network timeout");
  });
});

