import React from "react";
import type { FilterState, StudentProfile } from "../../types/campus";
import { FILTER_OPTIONS } from "../../constants/campus";
import { WisprVoicePill } from "../common/WisprVoicePill";
import { sounds } from "../../services/soundEffectsService";

interface OpportunityFilterBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  profile: StudentProfile;
  totalCount: number;
  filteredCount: number;
  onTriggerTinyFishScan: () => void;
  isScanningLive: boolean;
}

export const OpportunityFilterBar: React.FC<OpportunityFilterBarProps> = ({
  filters,
  onFilterChange,
  profile,
  totalCount,
  filteredCount,
  onTriggerTinyFishScan,
  isScanningLive
}) => {
  const firstName = profile.name.split(" ")[0];

  return (
    <div style={{ display: "grid", gap: "var(--s-4)", marginBottom: "var(--s-6)" }}>
      {/* Autonomous Personalized Radar Console (image-1.png & changes3.0 fix) */}
      <div className="composer">
        {/* Top Autonomous Header Row */}
        <div className="radar-composer-head">
          <div className="radar-composer-meta">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="live-pulse-dot" />
              <span className="t-label kick" style={{ color: "var(--violet)" }}>Live Autonomous Radar</span>
              <span className="badge violet">Tailored for {firstName}</span>
            </div>
            <h2 className="ph" style={{ marginTop: 4, marginBottom: 2 }}>
              <b>Curated for {profile.targetRole || "Product Designer"}.</b> {profile.preferredLocation || "Remote"}
            </h2>
            <p className="dim" style={{ fontSize: "0.875rem" }}>
              Tailored to your skills and verified role preference. Ghost jobs and senior postings pruned automatically.
            </p>
          </div>

          {/* Primary High-Impact Live Web Scanner */}
          <button
            type="button"
            className={`btn btn-primary scan-btn-hero ${isScanningLive ? "is-scanning" : ""}`}
            onClick={onTriggerTinyFishScan}
            disabled={isScanningLive}
            title="Scan live web for new unexpired student listings"
          >
            <div className="scan-icon-wrap">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span>{isScanningLive ? "Scanning live web..." : "Scan live web"}</span>
          </button>
        </div>

        {/* Filter & Matching Controls Row */}
        <div className="composer-tools" style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          {/* Direct Role Fit Toggle Pill */}
          <button
            type="button"
            className="pill sm pill-interactive"
            aria-pressed={filters.onlyEligible}
            onClick={() => onFilterChange({ onlyEligible: !filters.onlyEligible })}
            title="Filter to listings matching your target role and design skills"
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span>Target Role Match</span>
          </button>

          {/* Remote Mode Pill */}
          <button
            type="button"
            className="pill sm pill-interactive"
            aria-pressed={filters.location === "Remote"}
            onClick={() => onFilterChange({ location: filters.location === "Remote" ? "All" : "Remote" })}
          >
            <span>Remote</span>
          </button>

          {/* Category Filter Pills */}
          {FILTER_OPTIONS.CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="pill sm pill-interactive"
              aria-pressed={filters.category === cat}
              onClick={() => onFilterChange({ category: cat })}
            >
              <span>{cat}</span>
            </button>
          ))}

          <span className="grow" />

          {/* Optional Sleek Keyword Filter Pill with Wispr Voice Flow */}
          <div className="keyword-filter-wrap">
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="keyword-input"
              placeholder="Filter by skill or company..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              aria-label="Filter listings by skill or company"
            />
            {filters.searchQuery ? (
              <button
                type="button"
                className="clear-keyword-btn"
                onClick={() => {
                  sounds.playTap();
                  onFilterChange({ searchQuery: "" });
                }}
                title="Clear filter"
                aria-label="Clear keyword filter"
              >
                ✕
              </button>
            ) : (
              <WisprVoicePill
                onTranscript={(spoken) => {
                  onFilterChange({ searchQuery: spoken });
                }}
                label=""
                size="sm"
                title="Speak to filter opportunities (Wispr Flow)"
              />
            )}
          </div>
        </div>
      </div>

      {/* Results Status Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "var(--s-3)", paddingInline: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="t-label">Radar Status:</span>
          <span className="badge ok">
            ✓ Active ATS Live Index
          </span>
        </div>

        <span className="t-small dim">
          Showing <b>{filteredCount}</b> of {totalCount} verified opportunities open
        </span>
      </div>
    </div>
  );
};
