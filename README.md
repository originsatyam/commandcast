# CommandCast — Autonomous College Opportunity Radar

[![Private Repository](https://img.shields.io/badge/Visibility-Private-red.svg)](https://github.com/originsatyam/commandcast)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)
[![Engine](https://img.shields.io/badge/Engine-TinyFish%20%2B%20Firecrawl-violet.svg)](https://firecrawl.dev)
[![Tests](https://img.shields.io/badge/Tests-33%20Passed-success.svg)]()

> **Relevant. Verified. Easy to act on.**  
> Autonomous College Opportunity Radar engineered with dual-engine headless browser verification, strict India Remote eligibility validation, and continuous voice-directed opportunity discovery.

---

## 🌟 Executive Overview

Campus Radar solves the pervasive problem of outdated, expired, and irrelevant job boards. Traditional aggregators scrape stale listings, display generic company career homepages, and list US-restricted openings as remote.

CommandCast operates on a **Deterministic Zero-Fabrication Pipeline**:
* **Direct Requisition Resolution**: Every listing links directly to a specific ATS requisition (Ashby, Lever, Greenhouse) with a verified UUID / Job ID.
* **Dual-Engine Live Verification**: Queries **TinyFish Headless Chromium DOM** and **Firecrawl Deep Web Scraping** to confirm live application intake in under 100ms.
* **Deterministic Career Page Rejection**: Automatically purges expired requisitions that redirect to generic `/careers` portals or `?error=true` splash pages.
* **Verified Remote India Compatibility**: Filters opportunities specifically accepting applicants from India with verified contractor onboarding (Deel/Remote.com) and core IST timezone overlap.
* **Voice-Directed Natural Language Matcher**: Powered by continuous speech dictation (Wispr Flow) with real-time 60fps GPU-composited waveform animations.
* **Acoustic Tactile Feedback**: Ultra-low-latency UI sound synthesizer using mathematical Web Audio API modeling.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 8 |
| **Styling & Motion** | High-performance CSS Variables, GPU `transform: scaleY()` composited soundwaves |
| **Live Web Verification** | TinyFish Chromium Headless DOM Fetcher (`api.fetch.tinyfish.ai`) |
| **Deep Job Extraction** | Firecrawl API v1 (`api.firecrawl.dev/v1/search` & `/scrape`) |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Profiles, Applications) |
| **Voice Dictation** | Continuous Web Speech API with de-jittered session stream |
| **Audio Engine** | Web Audio API high-fidelity harmonic synthesizer |
| **Testing & Quality** | Vitest (33 test cases), Oxlint linter, Rolldown / Vite build |

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure **Node.js 20+** is installed on your machine.

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/originsatyam/commandcast.git
cd commandcast
npm install
```

### 3. Environment Configuration
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```
Populate your credentials in `.env`:
```env
# Supabase Project Connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# TinyFish Fast Web Search & Headless DOM Discovery
VITE_TINYFISH_API_KEY=your-tinyfish-api-key

# Firecrawl Deep Web Scraping & Requisition Extraction
VITE_FIRECRAWL_API_KEY=your-firecrawl-api-key
```

> [!SECURITY]
> `.env`, `.mcp.json`, and local credential files are strictly excluded via `.gitignore` to prevent any secret leakage.

### 4. Start Development Server
```bash
npm run dev
```
Or simply double-click `start.bat` on Windows.  
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite covering deterministic workflow execution, ATS link validation, prompt parsing, and speech accumulation:

```bash
# Run unit & integration test suite
npm test

# Run linter
npm run lint

# Production build validation
npm run build
```

### Live Chromium DOM Requisition Probe
To run a real-time live probe of all verified opportunities against live ATS endpoints:
```bash
node scripts/final_live_audit.mjs
```
* **Output**: Confirms 8/8 opportunities return HTTP 200, 0 redirects, and active requisition forms on Lever, Ashby, and Greenhouse.

---

## 📁 Repository Structure

```
commandcast/
├── .env.example             # Clean environment variables template
├── .gitignore               # Strict exclusion of secrets, logs, node_modules
├── .oxlintrc.json           # High-speed Oxlint linter rules
├── index.html               # Main HTML entry point
├── package.json             # Scripts and dependencies
├── prd.md                   # Product requirements document
├── start.bat                # Windows one-click launcher
├── tsconfig.json            # TypeScript project configuration
├── vite.config.ts           # Vite bundler configuration
│
├── public/                  # Static assets & SVG icons
├── scripts/                 # Regression tests & live ATS audit scripts
│   └── final_live_audit.mjs # Live TinyFish Chromium DOM verification tool
│
├── src/
│   ├── App.tsx              # Root application layout & state machine
│   ├── index.css            # Design system, luminous theme, GPU animations
│   ├── main.tsx             # React DOM root mounting
│   │
│   ├── components/
│   │   ├── campus/          # Radar, OpportunityCard, FilterBar, Tracker, Profile
│   │   ├── common/          # WisprVoicePill (smooth voice dictation)
│   │   ├── auth/            # Supabase Authentication modal & protected gates
│   │   └── dashboard/       # Action bars & navigation
│   │
│   ├── services/
│   │   ├── tinyfishVerificationService.ts # Live DOM ping & redirect analyzer
│   │   ├── firecrawlService.ts            # Deep ATS scrape & markdown parser
│   │   ├── voiceDictationService.ts       # Continuous speech stream engine
│   │   ├── soundEffectsService.ts         # Acoustic Web Audio API synthesizer
│   │   ├── promptMatcherService.ts        # 2,000-word NLP opportunity matcher
│   │   └── supabaseClient.ts              # Remote persistence client
│   │
│   ├── types/               # TypeScript interfaces (OpportunityListing, etc.)
│   ├── utils/               # Storage, campus state & deterministic workflow engine
│   └── data/                # Verified live ATS opportunities baseline
│
└── supabase/                # Database schema & seed SQL migrations
```

---

## 🔒 Security & Data Privacy

* **Zero Secret Exposure**: `.env` and `.mcp.json` are never checked into Git.
* **Row-Level Security (RLS)**: User profiles and application trackers are isolated by authenticated user IDs in PostgreSQL.
* **Deterministic Sandboxing**: Workflows never execute automated actions on third-party sites without explicit user preview and consent.

---

## 📄 License & Attribution

Copyright © 2026 Satyam Manik (`originsatyam`). All rights reserved.  
Confidential and proprietary software.
