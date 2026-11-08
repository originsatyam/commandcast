# Project Instructions: CommandCast

## TinyFish & Firecrawl Dual Strategy
Use both smartly based on their distinct strengths:

### 1. TinyFish (Fast Discovery & Web Grounding)
- Prefer `mcp__tinyfish__search` over WebSearch for quick discovery of jobs, URLs, APIs, and real-time updates.
- Prefer `mcp__tinyfish__fetch_content` over WebFetch / curl for fast, token-efficient parallel fetching.
- Prefer `mcp__tinyfish__run_web_automation` over hand-rolled Playwright.
- Use `batch_create` / `batch_status` for 2+ URLs.
- **Warning**: If `run_web_automation` returns ANY error, the run is still executing — call `get_run` or `list_runs` to check status before retrying. Never blind-retry.
- Full agent reference: https://docs.tinyfish.ai/for-coding-agents

### 2. Firecrawl (Deep Scraping & Structured Extraction)
- Use Firecrawl (`/scrape`, `firecrawl-build` skill) when you need full LLM-ready markdown, structured schemas, deep crawl, or qualification extraction from known URLs.
- Use `scrapeUrlWithFirecrawl` in application code (`src/services/firecrawlService.ts`) with `FIRECRAWL_API_KEY`.
- Endpoint guide:
  - `/scrape` for extracting clean markdown, metadata, and structured fields from one known URL.
  - `/search` when querying the web with Firecrawl search indexes.
  - `/interact` when scraping requires page clicks or form interactions.
- Skill reference: `.agents/skills/firecrawl-build/SKILL.md` and https://docs.firecrawl.dev
