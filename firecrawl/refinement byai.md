# TASK: Production Refinement & Autonomous Upgrade for Campus Radar

## 1. Context & Objective
You are acting as a Staff Product Engineer upgrading **Campus Radar** (located at `originsatyam/commandcast`, deployed on `commandcast.vercel.app`).
Currently, the application displays a polished UI with 8 opportunities, but relies on a hardcoded static file (`src/data/mockOpportunities.ts`) and suffers from a brand identity split between the legacy "CommandCast" voice project and the live "Campus Radar" product.

Your goal is to execute a surgical, zero-regression refinement across 4 pillars:
1. **Brand & Metadata Consolidation:** Unify the app identity to **Campus Radar**.
2. **Hybrid Live Data Engine:** Wire a resilient Supabase persistence layer with an automatic fallback to mock data, plus an automated ATS polling script.
3. **Distribution Wedge (Instant Alert Hook):** Add an instant Telegram/WhatsApp alert modal so students get notified within 15 minutes of an ATS post.
4. **Monetization Readiness:** Add an intuitive "Priority Radar Pass" (₹199/mo) value card.

---

## 2. Strict Guardrails (What NOT to Touch)
- **DO NOT** introduce any LLM or runtime inference API. Keep all operations 100% deterministic (zero token cost, <50ms latency).
- **DO NOT** rewrite or delete `src/services/soundEffectsService.ts` (the Web Audio synthesizer) or `src/services/voiceDictationService.ts`.
- **DO NOT** alter the core design tokens, color palette, or typographic scale in `src/index.css`. Maintain the SF Pro / Geist font hierarchy and the ≥12px font floor.
- **DO NOT** break the existing Vitest test suite (`npm test` must stay 100% passing).

---

## 3. Step-by-Step Implementation Instructions

### Step 1: Brand & Metadata Unification
1. Update `index.html`:
   - Title: `Campus Radar — Verified College Opportunities & Eligibility Matcher`
   - Description: `Direct ATS roles. Real stipends. Zero ghost jobs. Verified opportunities linking directly to official company careers portals.`
   - OpenGraph tags: Ensure OG title and image match Campus Radar.
2. Update `package.json`:
   - Set `"name": "campus-radar"`, `"description": "Autonomous College Opportunity Radar"`.
3. Update `src/components/campus/Header.tsx`:
   - Ensure the logo, subtitle, and meta tags consistently display `Campus Radar`.

### Step 2: Resilient Data Service (`src/services/opportunityService.ts`)
Create a new service `src/services/opportunityService.ts` that implements a **Cache-First Hybrid Ingestion Pattern**:
```typescript
import { supabase } from './supabaseClient';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import type { OpportunityListing } from '../types/campus';

export async function fetchVerifiedOpportunities(forceRefresh = false): Promise<OpportunityListing[]> {
  try {
    if (!supabase) return MOCK_OPPORTUNITIES;

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('verified_date', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase opportunities empty or offline. Falling back to verified baseline.');
      return MOCK_OPPORTUNITIES;
    }

    return data.map(mapDbRecordToOpportunity);
  } catch (err) {
    console.warn('Fetch failed, safely falling back to mock opportunities:', err);
    return MOCK_OPPORTUNITIES;
  }
}
```
Update `src/App.tsx` to load opportunities via `fetchVerifiedOpportunities()` during initialization with a smooth loading state.

### Step 3: Automated ATS Requisition Poller (`scripts/poll_ats.mjs`)
Create a standalone, non-blocking Node.js script `scripts/poll_ats.mjs` that can be run on a GitHub Action or cron:
1. Target top startup Greenhouse and Lever endpoints (e.g., SigNoz, HighLevel, JumpCloud, Razorpay, Postman).
2. Query `https://api.lever.co/v0/postings/{company}?mode=json` and `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`.
3. Filter for titles matching keywords: `["Intern", "Design", "Junior", "Associate", "Graduate", "Frontend", "Backend"]`.
4. Validate that `location` includes India or Worldwide Remote.
5. If Supabase credentials exist in environment variables, upsert new records; otherwise, log clean JSON diffs to console.

### Step 4: Instant Push Alert Wedge (Telegram / Email Pill)
In `src/components/campus/Header.tsx` or `src/components/campus/OpportunityFilterBar.tsx`:
1. Add an **"⚡ Get 15-Min Instant Alerts"** pill.
2. Clicking it opens a modal allowing students to enter their Telegram username or email, selecting their target track (`Product Design`, `Frontend`, or `Full Stack`).
3. Store alert preferences in Supabase table `alert_subscribers` (or `localStorage` fallback).

### Step 5: Priority Radar Pass UI (Monetization Anchor)
In `src/components/campus/OpportunityDetailModal.tsx` or a dedicated banner:
1. Display a clean, tasteful pro perk:  
   *"Want alerts 15 minutes before public posting? Get Campus Radar Priority for ₹199/mo."*
2. Wire a clickable CTA that triggers a lightweight feedback/waitlist modal or Razorpay payment link.

---

## 4. Verification & Quality Gates
Execute the following commands after editing:
1. **Linter Check:** `npm run lint` (0 errors)
2. **Unit Tests:** `npm test` (All 33+ tests passing)
3. **Build Validation:** `npm run build` (Clean production output with 0 TypeScript errors)
4. **Live Requisition Verification:** Ensure all job cards open the active Ashby/Lever/Greenhouse requisition directly with 0 redirects.