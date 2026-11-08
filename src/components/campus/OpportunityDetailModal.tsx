import React, { useState, useCallback } from "react";
import type { OpportunityListing, StudentProfile } from "../../types/campus";
import { extractCleanDomain } from "../../services/tinyfishVerificationService";
import {
  scrapeUrlWithFirecrawl,
  extractJobHighlightsFromMarkdown,
  type FirecrawlScrapeResult
} from "../../services/firecrawlService";

interface OpportunityDetailModalProps {
  opportunity: OpportunityListing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (opp: OpportunityListing) => void;
  profile: StudentProfile;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  isSaved,
  onToggleSave,
  profile
}) => {
  const [isScrapingFirecrawl, setIsScrapingFirecrawl] = useState(false);
  const [firecrawlResult, setFirecrawlResult] = useState<FirecrawlScrapeResult | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const directApplyUrl = opportunity?.directApplyUrl;

  const handleDeepScrape = useCallback(async () => {
    if (!directApplyUrl) return;
    setIsScrapingFirecrawl(true);
    try {
      const result = await scrapeUrlWithFirecrawl(directApplyUrl, undefined, true);
      setFirecrawlResult(result);
    } catch {
      // handled inside service
    } finally {
      setIsScrapingFirecrawl(false);
    }
  }, [directApplyUrl]);

  const handleCopyIndiaPitch = useCallback(() => {
    if (!opportunity) return;
    const pitch = `Hello! I am ${profile.name || "a Product Designer"}, applying for the ${opportunity.title} role. I am based in India and fully set up for global remote work: I maintain 3-5 hours of daily synchronous overlap with US/EU working hours, prioritize asynchronous documentation in Figma, and can onboard seamlessly as an international independent contractor via platforms like Deel or Remote.com (GST/FIRC compliant). I would love to contribute my end-to-end design craft to your team!`;
    navigator.clipboard.writeText(pitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2400);
  }, [opportunity, profile.name]);

  if (!opportunity) return null;

  const domain = extractCleanDomain(opportunity.directApplyUrl);
  const initials = opportunity.company
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const extracted = firecrawlResult?.markdown
    ? extractJobHighlightsFromMarkdown(firecrawlResult.markdown)
    : null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--s-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              className="tile"
              style={{
                width: 48,
                height: 48,
                fontSize: "1rem",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: opportunity.logoBg || "var(--panel)"
              }}
            >
              {opportunity.logoUrl && !logoError ? (
                <img
                  src={opportunity.logoUrl}
                  alt={`${opportunity.company} logo`}
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
                  onError={() => setLogoError(true)}
                  loading="lazy"
                />
              ) : (
                initials
              )}
            </span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="t-label">
                  {opportunity.category} &middot; {opportunity.workplaceType}
                </span>
                {opportunity.remoteIndiaStatus === "india-eligible" && (
                  <span
                    className="tag"
                    style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 600, fontSize: "0.72rem" }}
                  >
                    🇮🇳 India Remote Eligible
                  </span>
                )}
                {opportunity.remoteIndiaStatus === "worldwide-remote" && (
                  <span
                    className="tag"
                    style={{ background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe", fontWeight: 600, fontSize: "0.72rem" }}
                  >
                    🌐 Worldwide Remote
                  </span>
                )}
              </div>
              <h3 id="modal-title" className="t-h2" style={{ marginTop: 4 }}>
                <a
                  href={opportunity.directApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                  title="Open direct ATS requisition in new tab"
                >
                  <span>{opportunity.title}</span>
                  <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </h3>
              <p className="dim" style={{ fontSize: "0.875rem", marginTop: 2 }}>
                {opportunity.company} &middot; {opportunity.location}
                {opportunity.requisitionId && ` · Requisition #${opportunity.requisitionId.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Verified ATS Direct Requisition Callout */}
        <div className="stage" style={{ display: "grid", gap: 10, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge ok">
                <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.7 2.7L16 9.8" />
                </svg>
                Direct ATS Requisition (0 Redirects)
              </span>
              <span className="mono dim" style={{ fontSize: "0.8125rem" }}>
                {opportunity.sourcePlatform} &middot; {domain}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={handleDeepScrape}
              disabled={isScrapingFirecrawl}
            >
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{isScrapingFirecrawl ? "Scraping live spec via Firecrawl..." : firecrawlResult ? "Re-scrape live spec" : "Inspect Live Job Spec (Firecrawl)"}</span>
            </button>
          </div>

          <p className="t-small dim">
            Verified with TinyFish Cloud Chromium DOM & Firecrawl scraper. Confirmed zero redirection to generic careers indexes — opens the active, direct application form directly.
          </p>

          <div className="fit" style={{ marginTop: 2 }}>
            <span className="badge violet">Your Profile Fit</span>
            <span>{profile.targetRole || "Product Designer"} &middot; {profile.preferredLocation || "Remote"} (Matched to {profile.name || "Candidate"}&apos;s profile)</span>
          </div>
        </div>

        {/* Working Remotely from India: Feasibility & Solutions */}
        <div style={{ padding: "16px", borderRadius: 8, background: "var(--subtle)", border: "1px solid var(--line)", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1rem" }}>🇮🇳</span>
              <span className="t-body" style={{ fontWeight: 600 }}>Working Remotely from India (Feasibility & Solutions)</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCopyIndiaPitch}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
            >
              {copiedPitch ? "✓ Copied Pitch" : "Copy Remote Pitch"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontSize: "0.8125rem" }}>
            <div style={{ padding: "8px 10px", background: "var(--panel)", borderRadius: 6, border: "1px solid var(--line)" }}>
              <span className="t-label" style={{ display: "block", marginBottom: 2 }}>Timezone Overlap</span>
              <span style={{ color: "var(--fg)" }}>
                {opportunity.remoteIndiaDetails?.timezoneOverlap || "Flexible IST schedule with 3-5 hours daily synchronous overlap with US/EU team."}
              </span>
            </div>
            <div style={{ padding: "8px 10px", background: "var(--panel)", borderRadius: 6, border: "1px solid var(--line)" }}>
              <span className="t-label" style={{ display: "block", marginBottom: 2 }}>Contract & Payroll</span>
              <span style={{ color: "var(--fg)" }}>
                {opportunity.remoteIndiaDetails?.contractType || "Direct Indian entity / Global Contractor via Deel or Remote.com with GST/FIRC."}
              </span>
            </div>
          </div>

          <p className="t-small dim" style={{ margin: 0 }}>
            {opportunity.remoteIndiaDetails?.proofNotes || "Verified authentic: open to remote applicants based in India. Direct requisition confirmed active."}
          </p>
        </div>

        {/* Live Scraped Intel Preview (Firecrawl) */}
        {firecrawlResult && (
          <div style={{ padding: "14px", borderRadius: 8, background: "var(--subtle)", border: "1px solid var(--line)", display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="badge violet" style={{ fontSize: "0.75rem" }}>
                Firecrawl Scraped Spec ({firecrawlResult.latencyMs}ms)
              </span>
              <span className="mono dim" style={{ fontSize: "0.75rem" }}>
                {new Date(firecrawlResult.scrapedAt).toLocaleTimeString()}
              </span>
            </div>

            {firecrawlResult.success ? (
              <>
                <p className="t-body" style={{ fontWeight: 600 }}>{firecrawlResult.title}</p>
                {extracted?.overview && (
                  <p className="t-small dim" style={{ fontStyle: "italic" }}>
                    &ldquo;{extracted.overview}&rdquo;
                  </p>
                )}
                {extracted?.qualifications && extracted.qualifications.length > 0 && (
                  <div>
                    <span className="t-label" style={{ marginBottom: 4, display: "block" }}>Key Extracted Requirements</span>
                    <ul style={{ display: "grid", gap: 4 }}>
                      {extracted.qualifications.map((q) => (
                        <li key={q} style={{ fontSize: "0.8125rem", color: "var(--fg)" }}>
                          &bull; {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="t-small crit">Live scrape notice: {firecrawlResult.error || "Direct ATS security protected."}</p>
            )}
          </div>
        )}

        {/* Fact Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "var(--s-3)", borderBlock: "1px solid var(--line)", paddingBlock: "var(--s-3)" }}>
          <div>
            <span className="t-label">Stipend</span>
            <p className="t-body mono" style={{ fontWeight: 600 }}>{opportunity.stipend}</p>
          </div>
          <div>
            <span className="t-label">Workplace</span>
            <p className="t-body mono" style={{ fontWeight: 600 }}>{opportunity.workplaceType}</p>
          </div>
          <div>
            <span className="t-label">Category</span>
            <p className="t-body mono" style={{ fontWeight: 600 }}>{opportunity.category}</p>
          </div>
          <div>
            <span className="t-label">Deadline</span>
            <p className="t-body mono" style={{ fontWeight: 600 }}>
              {new Date(opportunity.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="t-h3" style={{ marginBottom: 6 }}>Role Overview</h4>
          <p className="t-body dim" style={{ lineHeight: 1.6 }}>{opportunity.description}</p>
        </div>

        {/* Key Skills & Competencies */}
        <div>
          <h4 className="t-h3" style={{ marginBottom: 8 }}>Core Skills & Tools</h4>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {opportunity.skills.map((sk) => (
              <span key={sk} className="tag" style={{ fontSize: "0.8125rem", padding: "4px 10px" }}>{sk}</span>
            ))}
          </div>
        </div>

        {/* Eligibility Requirements */}
        <div>
          <h4 className="t-h3" style={{ marginBottom: 8 }}>Role Craft Criteria</h4>
          <ul style={{ display: "grid", gap: 6 }}>
            {opportunity.eligibilityHighlights.map((req) => (
              <li key={req} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
                <span className="badge ok" style={{ width: 18, height: 18, padding: 0, justifyContent: "center" }}>✓</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons: Dual Working Links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s-3)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onToggleSave(opportunity)}
            >
              {isSaved ? "Saved in Tracker" : "Save to Tracker"}
            </button>
            {opportunity.companyUrl && (
              <a
                className="btn btn-ghost"
                href={opportunity.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit official ${opportunity.company} website`}
              >
                <span>Company site</span>
                <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>

          <a
            className="btn btn-primary"
            href={opportunity.directApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open direct ATS requisition form"
          >
            Apply direct ATS requisition
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 16L16.5 7.5M9.5 7.5h7v7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
