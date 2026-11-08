import React, { useState, useMemo, useCallback } from "react";
import type { OpportunityListing, StudentProfile } from "../../types/campus";
import { verifyOpportunityUrl, extractCleanDomain, type LiveVerificationResult } from "../../services/tinyfishVerificationService";

interface OpportunityCardProps {
  opportunity: OpportunityListing;
  isSaved: boolean;
  onToggleSave: (opp: OpportunityListing) => void;
  onViewDetails: (opp: OpportunityListing) => void;
  profile: StudentProfile;
}

const REFERENCE_TIMESTAMP = new Date("2026-10-27T18:00:00Z").getTime();

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isSaved,
  onToggleSave,
  onViewDetails,
  profile
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [liveVerification, setLiveVerification] = useState<LiveVerificationResult | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Time Complexity: Compute deadline metrics with memoization
  const { isClosed, isUrgent, diffDays, deadlineFormatted } = useMemo(() => {
    const deadlineDate = new Date(opportunity.deadline).getTime();
    const diff = Math.ceil((deadlineDate - REFERENCE_TIMESTAMP) / (1000 * 60 * 60 * 24));
    return {
      isClosed: diff <= 0,
      isUrgent: diff > 0 && diff <= 7,
      diffDays: diff,
      deadlineFormatted: new Date(opportunity.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    };
  }, [opportunity.deadline]);

  // Monogram initials for the tile
  const initials = useMemo(() => {
    return opportunity.company
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [opportunity.company]);

  // Clean domain lookup
  const domain = useMemo(() => extractCleanDomain(opportunity.directApplyUrl), [opportunity.directApplyUrl]);

  // Check matching role and skills
  const targetRoleKeyword = (profile.targetRole || "Product Designer").toLowerCase().split(" ")[0];
  const matchesRole = opportunity.title.toLowerCase().includes(targetRoleKeyword);
  const matchesSkills = opportunity.skills.some((sk) =>
    profile.skills.some((ps) => ps.toLowerCase() === sk.toLowerCase())
  );
  const isDirectFit = matchesRole || matchesSkills;

  // Verified days ago
  const verifiedDaysAgo = useMemo(() => {
    const verified = new Date(opportunity.verifiedDate).getTime();
    return Math.max(1, Math.round((REFERENCE_TIMESTAMP - verified) / (1000 * 60 * 60 * 24)));
  }, [opportunity.verifiedDate]);

  // Live TinyFish Verification Trigger
  const handleLiveVerify = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerifying(true);
    try {
      const result = await verifyOpportunityUrl(opportunity.directApplyUrl, undefined, true);
      setLiveVerification(result);
    } catch (err) {
      console.warn("Live verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  }, [opportunity.directApplyUrl]);

  return (
    <article
      className="opp"
      data-state={isClosed ? "closed" : "open"}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) {
          return;
        }
        onViewDetails(opportunity);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Organisation Header Row */}
      <div className="opp-head">
        <span
          className="tile"
          style={{
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
        <div className="opp-org">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <b>{opportunity.company}</b>
            {opportunity.companyUrl && (
              <a
                href={opportunity.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="company-site-link"
                onClick={(e) => e.stopPropagation()}
                title={`Visit official ${opportunity.company} website`}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--ink-3)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3
                }}
              >
                <span>Site</span>
                <svg className="ic" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
          <span>{opportunity.category} &middot; {opportunity.workplaceType}</span>
        </div>
        <button
          className={`icon-btn bookmark-btn ${isSaved ? "is-saved" : ""}`}
          type="button"
          aria-pressed={isSaved}
          aria-label={isSaved ? "Saved to tracker" : "Save opportunity"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(opportunity);
          }}
          title={isSaved ? "Saved to tracker" : "Save opportunity"}
        >
          <svg className="ic bookmark-icon" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M6.5 4h11v16.5L12 16.8 6.5 20.5z" />
          </svg>
        </button>
      </div>

      {/* Opportunity Title - Direct link to specific ATS requisition */}
      <h4 className="opp-title">
        <a
          href={opportunity.directApplyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opp-title-link"
          onClick={(e) => e.stopPropagation()}
          title={`Open direct ATS job requisition for ${opportunity.title}`}
          style={{
            color: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>{opportunity.title}</span>
          <svg
            className="ic ic-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ opacity: 0.65, flexShrink: 0, width: 14, height: 14 }}
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </h4>

      {/* Tags / Skills & Workplace Craft chips - Zero degrees mentioned */}
      <div className="tags">
        <span className="tag" style={{ fontWeight: 600, color: "var(--violet)", background: "var(--violet-soft)" }}>
          {opportunity.workplaceType}
        </span>
        {opportunity.remoteIndiaStatus === "india-eligible" && (
          <span
            className="tag"
            style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 600 }}
            title="Verified eligible to work remotely from India"
          >
            🇮🇳 India Remote
          </span>
        )}
        {opportunity.remoteIndiaStatus === "worldwide-remote" && (
          <span
            className="tag"
            style={{ background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe", fontWeight: 600 }}
            title="Worldwide remote flexibility (Work from India supported)"
          >
            🌐 Worldwide Remote
          </span>
        )}
        {opportunity.requisitionId && (
          <span
            className="tag"
            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", opacity: 0.85 }}
            title={`Direct ATS Requisition ID: ${opportunity.requisitionId}`}
          >
            #{opportunity.requisitionId.slice(0, 8)}
          </span>
        )}
        <span className="tag">{opportunity.category}</span>
        {opportunity.skills.slice(0, 3).map((sk) => (
          <span key={sk} className="tag">{sk}</span>
        ))}
      </div>

      {/* Facts: Stipend & Location */}
      <dl className="facts">
        <div>
          <dt>Stipend</dt>
          <dd>{opportunity.stipend}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{opportunity.location}</dd>
        </div>
      </dl>

      {/* Fit Line (Violet badge strictly for match moments) */}
      {isDirectFit && (
        <div className="fit">
          <span className="badge violet">
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
            </svg>
            Fits you
          </span>
          <span>Matches {profile.targetRole || "Product Designer"} &middot; {profile.preferredLocation || "Remote"}</span>
        </div>
      )}

      {/* Footer: Deadline & Dual Working Links */}
      <div className="opp-foot">
        <span className={`deadline ${isUrgent ? "urgent" : isClosed ? "quiet" : ""}`}>
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5.2l3.2 1.8" strokeLinecap="round" />
          </svg>
          {isClosed
            ? `Closed ${deadlineFormatted}`
            : isUrgent
            ? `Closes ${deadlineFormatted} \u00B7 ${diffDays} days left`
            : `Closes ${deadlineFormatted} \u00B7 ${diffDays} days`}
        </span>

        <div className="foot-actions">
          {opportunity.companyUrl && (
            <a
              className="btn btn-ghost btn-sm"
              href={opportunity.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Visit official ${opportunity.company} website`}
              style={{ paddingInline: 8 }}
            >
              <span>Site</span>
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleLiveVerify}
            disabled={isVerifying}
            title="Verify listing status directly on ATS"
          >
            <svg
              className="ic ic-sm"
              style={isVerifying ? { animation: "scanSpin 0.9s infinite linear" } : undefined}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 6 12 12 16 14" />
            </svg>
            <span>{isVerifying ? "Verifying..." : "Live verify"}</span>
          </button>
          {!isClosed && (
            <a
              className="btn btn-primary btn-sm"
              href={opportunity.directApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Apply official</span>
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 16L16.5 7.5M9.5 7.5h7v7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Proof Line */}
      <div className="proof">
        <span
          className={`badge ${liveVerification && !liveVerification.isAlive ? "warn" : "ok"} ${liveVerification ? "has-verified-pop" : ""}`}
          title={liveVerification?.verdict || "Direct ATS Requisition verified active with 0 redirects"}
        >
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.7 2.7L16 9.8" />
          </svg>
          {liveVerification
            ? liveVerification.isAlive
              ? `Direct ATS Requisition (0 redirects · ${liveVerification.latencyMs}ms)`
              : liveVerification.verdict || "Listing inactive on ATS"
            : `Direct ATS Requisition · Verified ${verifiedDaysAgo}d ago`}
        </span>
        <span className="src">{opportunity.sourcePlatform || domain}</span>
      </div>
    </article>
  );
};
