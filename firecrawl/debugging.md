# CAMPUS RADAR — CRITICAL EXTRACTION ACCURACY & RELIABILITY AUDIT

## Your role

Act as a Principal Software Engineer, Senior Web Data Extraction Engineer, QA Architect and Product Reliability Engineer.

You are auditing an existing product called Campus Radar.

This is an existing application. Do NOT rebuild it, redesign it, or unnecessarily modify working features.

Your mission is to identify and fix the actual causes of inaccurate, irrelevant, expired and incorrectly linked opportunities.

## 1. Strict technology constraints

The existing backend must continue using ONLY:

- TinyFish
- Firecrawl

Do not introduce another web scraping provider, search provider, external LLM API or alternative extraction service.

Do not silently replace the existing architecture.

You may implement deterministic validation, URL verification, structured extraction, JSON schema validation, matching rules, deduplication and testing using the existing application stack.

Do not assume a feature works just because it was requested in a previous prompt. Inspect the actual implementation.

## 2. Audit the existing architecture FIRST

Before changing code, inspect:

- Search/discovery implementation.
- TinyFish integration and endpoint selection.
- Firecrawl integration and endpoint selection.
- Extraction prompts and schemas.
- URL handling and normalization.
- Opportunity validation logic.
- Database schema and persistence.
- Duplicate detection.
- Opportunity ranking.
- Frontend card data mapping.
- Apply button URL handling.
- Error handling and retry mechanisms.

Identify exactly where inaccurate information enters the pipeline.

## 3. Fix exact opportunity identification

Every published opportunity must represent one specific, identifiable position.

For every record, extract:

- Exact job title.
- Company name.
- Employment type.
- Location.
- Remote eligibility.
- Job description.
- Required skills.
- Eligibility criteria.
- Application deadline, if available.
- Original source URL.
- Exact job-detail URL.
- Exact application URL, if available.
- Last verified timestamp.
- Current verification status.

Never substitute:

- Company homepage for job-detail URL.
- General career page for a specific opportunity.
- Search result URL for an original job listing.
- An unrelated position for the requested position.

If the exact job page or application destination cannot be established, reject the record from the verified feed.

## 4. Implement strict opportunity verification

Before publishing any opportunity:

A. Open the actual job-detail page.

B. Confirm that the page identifies the same position.

C. Check that the position has not been explicitly closed, expired or removed.

D. Check for positive evidence that applications are being accepted.

E. Verify that the application destination corresponds to the same position.

F. Verify mandatory location, remote eligibility and employment type.

G. Record the evidence and verification timestamp.

Use three statuses:

- OPEN
- CLOSED
- UNKNOWN

Only OPEN opportunities with verified job identity and application destination can enter the verified feed.

Do not treat HTTP 200 as proof of an open job.

If the source cannot be accessed or evidence is insufficient, mark UNKNOWN and reject it from the verified feed.

## 5. Implement strict matching

Distinguish between:

- Exact role match.
- Approved equivalent role.
- Related role.
- Irrelevant role.

Do not treat related roles as exact matches.

Mandatory requirements must be hard filters, not merely ranking preferences.

For example:

Product Design Intern + Remote India must not return:

- Graphic Design Intern.
- UX Researcher.
- Full-time Product Designer.
- Remote USA-only opportunities.
- Unrelated design positions.

Do not invent missing eligibility information.

Unknown information must remain UNKNOWN.

## 6. Implement URL validation

Validate all URLs before publication.

Check:

- URL is valid and reachable.
- It resolves to the intended job.
- Redirects do not lead to unrelated jobs.
- Application links do not point to generic career pages.
- The job identifier remains consistent across the job-detail and application destinations.

Preserve the original source URL separately from the final application URL.

## 7. Implement duplicate and stale opportunity detection

Detect duplicates using a combination of:

- Company.
- Job title.
- Job ID.
- Canonical job URL.
- Location.

Do not merge different positions merely because their titles are similar.

Reverify published opportunities periodically. If an opportunity closes, remove it from the active feed or clearly mark it closed.

## 8. Implement evidence-based quality control

For every extracted field, retain its source evidence where available.

The system must be able to explain:

- Where the job was found.
- Where the title was verified.
- Where the location was verified.
- Why it is considered open.
- Where the application URL was verified.

Do not fabricate evidence or confidence scores.

## 9. Add automated testing

Create test cases covering:

1. Exact valid opportunity.
2. Generic career-page link.
3. Closed opportunity.
4. Wrong job title.
5. Wrong location.
6. Wrong employment type.
7. Broken application link.
8. Redirect to another job.
9. Duplicate opportunity.
10. Missing or ambiguous information.
11. Remote opportunity with country restrictions.
12. Dynamic job page with incomplete extraction.

A failed validation must never silently become a successful published opportunity.

## 10. Execution rules

Work in this sequence:

PHASE 1 — Audit the existing implementation.

PHASE 2 — Produce a report of actual root causes with file names, functions and evidence.

PHASE 3 — Propose the smallest safe architectural changes.

PHASE 4 — Implement the changes.

PHASE 5 — Run tests and inspect actual outputs.

PHASE 6 — Report remaining limitations and unresolved failures.

Do not claim that accuracy has improved without test evidence.

Do not modify unrelated features.

Do not remove existing functionality.

## 11. Required final report

Provide:

- Root causes identified.
- Files and functions affected.
- Changes implemented.
- Tests performed.
- Before/after failure counts.
- Remaining limitations.
- Known failure cases.
- Recommended next improvements.

IMPORTANT:

Reliability is more important than the number of opportunities.

A smaller feed of verified opportunities is preferable to a large feed containing incorrect, expired or misleading listings.

Never guess. Never fabricate. Never silently downgrade verification requirements.

Start with the audit. Do not begin with a rewrite.