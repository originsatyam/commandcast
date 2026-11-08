import React, { useState, useMemo } from "react";
import type { TrackerApplication, ApplicationStage } from "../../types/campus";
import { FILTER_OPTIONS } from "../../constants/campus";

interface ApplicationTrackerProps {
  applications: TrackerApplication[];
  onUpdateStatus: (trackId: string, newStatus: ApplicationStage) => void;
  onRemove: (trackId: string) => void;
  onExploreOpportunities: () => void;
}

const STAGES = FILTER_OPTIONS.STAGES;
const REFERENCE_TIMESTAMP = new Date("2026-10-27T18:00:00Z").getTime();
const STAGE_INDEX_MAP = new Map<ApplicationStage, number>(
  STAGES.map((s, idx) => [s, idx])
);

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateStatus,
  onRemove,
  onExploreOpportunities
}) => {
  const [activeStageFilter, setActiveStageFilter] = useState<string>("All");

  // Time & Space Complexity: O(N) stage counts in a single pass
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length };
    for (const s of STAGES) {
      counts[s] = 0;
    }
    for (const app of applications) {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    }
    return counts;
  }, [applications]);

  // Memoized filter list
  const filtered = useMemo(() => {
    if (activeStageFilter === "All") return applications;
    return applications.filter((app) => app.status === activeStageFilter);
  }, [applications, activeStageFilter]);

  return (
    <div style={{ display: "grid", gap: "var(--s-6)" }}>
      {/* Header & Overview */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "var(--s-4)" }}>
        <div>
          <p className="t-label">Pipeline &middot; Never lose track</p>
          <h2 className="t-h1">Application Tracker</h2>
          <p className="t-lead" style={{ marginTop: 4 }}>
            Saved items, application stages, and official source links in one quiet place.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="pill-row">
          {["All", ...STAGES].map((stage) => {
            const count = stageCounts[stage] || 0;
            return (
              <button
                key={stage}
                type="button"
                className="pill sm"
                aria-pressed={activeStageFilter === stage}
                onClick={() => setActiveStageFilter(stage)}
              >
                <span>{stage} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracker Records */}
      {filtered.length === 0 ? (
        <div className="empty">
          <span className="t-label">Empty Stage</span>
          <h3 className="t-h2">No opportunities in this stage</h3>
          <p>Save verified opportunities from the radar to track deadlines and application status.</p>
          <button type="button" className="btn btn-primary" onClick={onExploreOpportunities}>
            Explore open opportunities
          </button>
        </div>
      ) : (
        <div className="trk">
          {filtered.map((app) => {
            const opp = app.opportunity;
            const deadline = new Date(opp.deadline).getTime();
            const diffDays = Math.ceil((deadline - REFERENCE_TIMESTAMP) / (1000 * 60 * 60 * 24));
            const isClosed = diffDays <= 0;
            const isUrgent = diffDays > 0 && diffDays <= 7;
            const currentStageIndex = STAGE_INDEX_MAP.get(app.status as ApplicationStage) ?? 0;

            const initials = opp.company
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div key={app.id} className="trk-card">
                {/* Top Row: Info + Actions (image-7.png fix) */}
                <div className="trk-top">
                  <div className="trk-main">
                    <span className="tile">{initials}</span>
                    <div className="trk-info">
                      <h3 className="trk-title">{opp.title}</h3>
                      <div className="trk-meta">
                        <span>{opp.company}</span>
                        <span>&middot;</span>
                        <span>{opp.location}</span>
                        <span>&middot;</span>
                        <span>{opp.stipend}</span>
                      </div>
                    </div>
                  </div>

                  <div className="trk-actions">
                    <span className={`deadline ${isUrgent ? "urgent" : isClosed ? "quiet" : ""}`}>
                      {isClosed ? "Closed" : `${diffDays}d left`}
                    </span>
                    <a
                      className="btn btn-secondary btn-sm"
                      href={opp.directApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Apply official</span>
                      <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 16L16.5 7.5M9.5 7.5h7v7" />
                      </svg>
                    </a>
                    <button
                      className="icon-btn sm"
                      type="button"
                      onClick={() => onRemove(app.id)}
                      title="Remove from tracker"
                      aria-label="Remove"
                    >
                      <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Full-width Pipeline Stepper */}
                <div className="trk-pipeline">
                  <div className="stepper" aria-label={`Pipeline stage: ${app.status}`}>
                    {STAGES.map((stage, idx) => {
                      const isDone = idx < currentStageIndex;
                      const isNow = idx === currentStageIndex;
                      return (
                        <div
                          key={stage}
                          className={`step ${isDone ? "done" : ""} ${isNow ? "now" : ""}`}
                          onClick={() => onUpdateStatus(app.id, stage as ApplicationStage)}
                          title={`Click to set stage to ${stage}`}
                        >
                          <span className="d" />
                          <span>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
