import React from "react";

export const GapComparisonView: React.FC = () => {
  return (
    <div style={{ display: "grid", gap: "var(--s-6)" }}>
      {/* Header */}
      <div>
        <p className="t-label">Placement Discovery Problem &middot; The Campus Radar Difference</p>
        <h2 className="t-h1">Why Campus Radar Exists</h2>
        <p className="t-lead" style={{ marginTop: 8 }}>
          Most job portals cater to recruiters and experienced professionals. Students get buried under expired reposts and ghost jobs. Campus Radar cuts through the noise with strict batch filtering and live ATS verification.
        </p>
      </div>

      {/* Comparison Grid (Concise, high-impact cards - image-5.png fix) */}
      <div className="comp-grid">
        {/* Card 1: Traditional Portals */}
        <div className="comp-card">
          <div className="comp-header">
            <div>
              <h3 className="comp-title">Job Portals</h3>
              <p className="comp-desc">LinkedIn, Indeed, Naukri</p>
            </div>
            <span className="badge crit">High Noise</span>
          </div>

          <div className="comp-points">
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>3+ years experience demanded on "entry-level" tags</span>
            </div>
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Ghost listings left open for months to farm resumes</span>
            </div>
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Zero craft-level skill alignment or verified role fit</span>
            </div>
          </div>
        </div>

        {/* Card 2: Spreadsheets & WhatsApp */}
        <div className="comp-card">
          <div className="comp-header">
            <div>
              <h3 className="comp-title">Spreadsheets & Chats</h3>
              <p className="comp-desc">WhatsApp, Telegram, Notion</p>
            </div>
            <span className="badge warn">Manual</span>
          </div>

          <div className="comp-points">
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Dead links and closed Google Forms without warning</span>
            </div>
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>No live tracking or deadline countdowns</span>
            </div>
            <div className="comp-point negative">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Chaotic unformatted messages easily missed in busy channels</span>
            </div>
          </div>
        </div>

        {/* Card 3: Campus Radar */}
        <div className="comp-card highlight">
          <div className="comp-header">
            <div>
              <h3 className="comp-title">Campus Radar</h3>
              <p className="comp-desc">Built strictly for design & product engineering talent</p>
            </div>
            <span className="badge violet">Verified</span>
          </div>

          <div className="comp-points">
            <div className="comp-point positive">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% matched to your craft, design tools & portfolio skills</span>
            </div>
            <div className="comp-point positive">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Direct official ATS career portals (Greenhouse, Lever, Workday)</span>
            </div>
            <div className="comp-point positive">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Autonomous live verification flags closed links automatically</span>
            </div>
            <div className="comp-point positive">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Integrated application pipeline tracker with stage milestones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Core Guarantees Callout */}
      <div className="promises">
        <div>
          <h3 className="t-h3">Live Autonomous Radar</h3>
          <p className="t-small">
            Real-time web scanning and instant ATS endpoint verification across Greenhouse, Lever, and Workday with zero latency.
          </p>
        </div>
        <div>
          <h3 className="t-h3">Deep ATS Extraction</h3>
          <p className="t-small">
            Structured extraction of full responsibilities, eligibility criteria, and verified stipends directly from official company career portals.
          </p>
        </div>
        <div>
          <h3 className="t-h3">100% Resume Personalization</h3>
          <p className="t-small">
            Intelligent role alignment matching your uploaded portfolio, target role, and location preferences with zero academic bureaucracy.
          </p>
        </div>
      </div>
    </div>
  );
};
