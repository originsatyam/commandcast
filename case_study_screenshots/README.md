# Campus Radar — Case Study Visual Asset Catalog

This directory contains high-resolution (deviceScaleFactor: 2) UI/UX screenshots captured during real DOM browsing interactions on Campus Radar (`http://localhost:5173/`).

---

## Screen Interaction Manifest

| File Name | Screen / Interaction | Purpose in Case Study |
|---|---|---|
| [`01_hero_and_radar_overview.png`](./01_hero_and_radar_overview.png) | **Radar Landing & Hero** | Demonstrates the core value proposition: *"Relevant. Verified. Easy to act on."*, three promises, filter bar, and verified opportunity cards. |
| [`02_relevance_filter_batch_2027.png`](./02_relevance_filter_batch_2027.png) | **Relevance Match Filter** | Shows the *"Matches my profile (2027 Batch)"* quick filter in active state, filtering down to opportunities matching the student's exact year. |
| [`03_granular_filter_selection.png`](./03_granular_filter_selection.png) | **Multi-Facet Filter Chips** | Demonstrates filtering across Degree (`B.Tech`), Year (`3rd Year`), and Workplace Mode (`Remote`). |
| [`04_tinyfish_live_verification.png`](./04_tinyfish_live_verification.png) | **TinyFish Real-Time Verification** | Captures the output of clicking *"⚡ Verify Live"*, where TinyFish's cloud headless Chromium runner tests the destination career page and returns live status. |
| [`05_proof_and_verification_modal.png`](./05_proof_and_verification_modal.png) | **Deep Proof & Verification Modal** | Shows the deep proof drawer: authentic ATS platform, selection pipeline stages (Assessment &rarr; Tech rounds &rarr; HR), and eligibility cutoff rules. |
| [`06_tinyfish_web_radar_scan.png`](./06_tinyfish_web_radar_scan.png) | **Live Web Radar Discovery** | Demonstrates querying TinyFish's live search index to discover real-world tech internships (e.g., D. E. Shaw 2027) dynamically ingested into the radar. |
| [`07_save_to_tracker_interaction.png`](./07_save_to_tracker_interaction.png) | **One-Click Tracker Ingestion** | Captures the bookmark toggle interaction and tactile toast feedback: *"Saved to your tracker!"*. |
| [`08_application_tracker_pipeline.png`](./08_application_tracker_pipeline.png) | **Application Tracker (Pipeline View)** | Shows the candidate's personal pipeline with stages (`Saved`, `Applied`, `Interviewing`, `Offer`), deadline urgency badges, and portal links. |
| [`09_tracker_stage_progression.png`](./09_tracker_stage_progression.png) | **Interactive Stage Progression** | Demonstrates advancing an opportunity from `Saved` to `Applied` and `Interviewing` via the visual stepper. |
| [`10_why_campus_radar_gap_matrix.png`](./10_why_campus_radar_gap_matrix.png) | **Competitive Gap Analysis Matrix** | Captures the comprehensive comparison table contrasting LinkedIn, Internshala, Unstop, College WhatsApp groups, and Google Sheets against Campus Radar. |
| [`11_student_profile_matcher.png`](./11_student_profile_matcher.png) | **Student Profile & Eligibility Tuner** | Shows student degree, batch, CGPA, and branch settings with the live *"Live Match Insight"* box. |
| [`12_dark_mode_profile.png`](./12_dark_mode_profile.png) | **Dark Mode — Profile Settings** | Demonstrates the dark theme palette (`#0B1213` cool paper dark ground, hairlines, and contrast). |
| [`13_dark_mode_radar_overview.png`](./13_dark_mode_radar_overview.png) | **Dark Mode — Opportunity Radar** | Shows the main opportunities grid rendered in dark mode with high contrast cards and badges. |
| [`14_dark_mode_tracker_pipeline.png`](./14_dark_mode_tracker_pipeline.png) | **Dark Mode — Tracker Pipeline** | Captures the dark mode pipeline view with live D. E. Shaw listing moved to the *"Interviewing"* stage. |

---

## Technical Specifications
- **Render Engine**: Google Chrome (Puppeteer headless automation)
- **Viewport**: 1440 x 960 px
- **DPI**: Device Scale Factor 2.0 (Retina Quality)
- **Source Application**: Campus Radar (`http://localhost:5173/`)
- **Backend Verified**: TinyFish Search & Fetch APIs

