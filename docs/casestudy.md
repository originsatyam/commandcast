# CommandCast: Campus Radar Technical Case Study

A Deterministic, Zero-Hallucination Opportunity Radar and Direct ATS Verification Engine for College Students and Remote Job Seekers.

Based on the POWER Product Framework: Possibilities, Opportunities, Workflows, Engineering, Reflection.

---

## 1. Problem Statement and Market Gap

Job seekers and students in India face major friction points when applying for global remote roles:
- Link rot on aggregators like LinkedIn and Indeed where links redirect multiple times to dead pages.
- Ghost listings that are already closed on the company ATS but left open on job boards.
- Hidden geographical disqualifiers where postings say Remote but require domestic work authorization in the United States or Europe.
- Timezone mismatch and international contractor confusion regarding payments, contracts, and tax compliance.

CommandCast solves this with direct headless ATS verification, India remote feasibility checks, and automated outreach generation.

---

## 2. Product Architecture and POWER Framework

### Possibilities
- Headless Chromium browser DOM evaluation via TinyFish API.
- Deep web markdown extraction and qualification parsing via Firecrawl.
- Low latency Web Audio synthesis with no static MP3 assets.
- Real-time speech transcription via the Web Speech API with GPU-accelerated waveform visuals.

### Opportunities
- Answering the three essential student questions within five seconds:
  1. Is this job requisition genuinely active on Greenhouse, Lever, or Ashby right now?
  2. Can someone living in India legally work this role as an independent contractor?
  3. What is the real monthly take-home in Indian Rupees after conversion and tax exemptions?

### Workflows
- Discovery: High velocity radar search focused on direct ATS requisitions.
- Verification: Headless verification detecting redirect loops, four-zero-four errors, and expired job parameters.
- Outreach: Three-mode instant pitch generator creating tailored LinkedIn messages, cold emails, and craft pitches.
- Application Tracking: Deterministic Kanban board with offline persistence and Supabase synchronization.

### Engineering
- Pure React and TypeScript architecture.
- Dual storage with optimistic local updates and remote Supabase persistence.
- Zero data fabrication guardrail preventing language models from inventing links.
- Strict security hygiene with tokens and environment keys kept out of version control.

### Reflection
- Regular automated unit test runs verifying all services.
- Verification latency tracking and redirect monitoring.
- Continuous linting and fast bundle compilation.

---

## 3. Discovered Flaws and Engineering Solutions

### Flaw One: Silent False Positives in Verification
- Symptom: Network failures returned active status.
- Fix: Rewrote verification logic to return unreachable status and mark requisition as inactive whenever network errors occur.

### Flaw Two: ATS Redirect Traps
- Symptom: Expired jobs redirecting to career homepages were counted as active.
- Fix: Added regex detection for career portal fallbacks and error query parameters.

### Flaw Three: Speech Dictation Duplication
- Symptom: Spoken words were duplicated quadratically in the prompt box.
- Fix: Separated final committed speech tokens from interim streaming fragments.

### Flaw Four: Soundwave Layout Thrashing
- Symptom: Modifying element heights in keyframes caused continuous CPU reflows.
- Fix: Converted animation to GPU scale transforms with hardware layer isolation.

### Flaw Five: Search Latency
- Symptom: Long sequential searches caused UI freezes.
- Fix: Added live pulse badges, non-blocking health checks, and streaming indicators.

### Flaw Six: Application Dead Ends
- Symptom: Candidates were left without next steps after finding active links.
- Fix: Added the Intelligent Outreach Studio inside the modal for immediate personalized pitch generation.

### Flaw Seven: Unstandardized Compensation
- Symptom: Irregular salary disclosures caused confusion.
- Fix: Built compensation normalizer calculating monthly INR take-home and annual CTC estimates.

---

## 4. Technical Defense and Interview Questions

### Question: Why use TinyFish and Firecrawl instead of self-hosting Puppeteer?
Answer: Self-hosting headless browsers requires proxy rotation, CAPTCHA mitigation, and memory leak management. TinyFish and Firecrawl provide managed headless browser execution and clean markdown parsing with zero infrastructure overhead.

### Question: How do you prevent link fabrication?
Answer: Language models are not permitted to generate job URLs. Every URL in the feed originates from direct ATS discovery and is verified via real HTTP requests and DOM inspection.

### Question: How do you handle network drops?
Answer: The application uses optimistic local storage writes. If the user is offline or Supabase is paused, data is preserved locally and synced once connectivity is restored.

### Question: Why synthesize sounds using the Web Audio API?
Answer: Static audio files introduce network latency and caching delays. Mathematical synthesis executes synchronously with zero latency and zero asset downloads.

### Question: How does India Remote feasibility work?
Answer: The engine checks timezone overlap between Indian Standard Time and US or European hours, confirms contractor rails like Deel or Remote, and provides guidance on Section 44ADA presumptive taxation and LUT export rules.

---

## 5. System Specifications

- Language: TypeScript with strict type checking
- UI: React nineteen with custom CSS variables
- Test Suite: Vitest with thirty-seven passing unit tests across nine suites
- Linter: Oxlint with zero errors
- Build: Vite production build under one second
- Version Control: Clean git history on private repository
