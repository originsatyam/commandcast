import React from "react";
import { DEMO_LISTING } from "../../data/mockData";
import { Bookmark, Building2, MapPin, DollarSign, Calendar, CheckCircle2, Sparkles } from "lucide-react";

interface DemoListingPageProps {
  onSaveWorkflow: () => void;
  isAlreadySaved: boolean;
  missingFieldsSimulated?: boolean;
  onToggleMissingFields?: (missing: boolean) => void;
}

export const DemoListingPage: React.FC<DemoListingPageProps> = ({
  onSaveWorkflow,
  isAlreadySaved,
  missingFieldsSimulated = false,
  onToggleMissingFields
}) => {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Simulation Banner */}
      <div style={{
        padding: "12px 18px",
        background: "var(--status-ready-bg)",
        border: "1px solid var(--status-ready-border)",
        borderRadius: "var(--radius-lg)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--status-ready)" }}>
          <Sparkles size={16} />
          <span>
            <strong>Supported Demo Opportunity Page:</strong> Contains identifiable DOM elements for the "Save this internship" workflow.
          </span>
        </div>

        {/* Diagnostic Toggle to test failure handling */}
        {onToggleMissingFields && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={missingFieldsSimulated}
              onChange={(e) => onToggleMissingFields(e.target.checked)}
            />
            <span>Simulate missing company (Test Failure FR-10)</span>
          </label>
        )}
      </div>

      {/* Main Listing Card with DOM IDs */}
      <div className="glass-panel" style={{ padding: "32px", position: "relative" }}>
        {/* Top meta */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="badge-demo">Opportunity</span>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                ID: #apex-2027
              </span>
            </div>

            <h2
              id="job-title"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: "-0.4px",
                lineHeight: 1.2
              }}
            >
              {DEMO_LISTING.title}
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1d1d1f" }}>
                <Building2 size={16} color="var(--primary)" />
                <span id="job-company" style={{ fontWeight: 600 }}>
                  {missingFieldsSimulated ? "" : DEMO_LISTING.company}
                </span>
                {missingFieldsSimulated && (
                  <span style={{ color: "var(--status-failed)", fontStyle: "italic", fontSize: 12 }}>
                    [Missing Company Name - Will fail validation]
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)" }}>
                <MapPin size={16} />
                <span id="job-location">{DEMO_LISTING.location}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onSaveWorkflow}
            className={`btn ${isAlreadySaved ? "btn-secondary" : "btn-primary"}`}
            style={{
              padding: "9px 18px",
              flexShrink: 0
            }}
          >
            {isAlreadySaved ? (
              <>
                <CheckCircle2 size={15} color="var(--status-success)" />
                <span>Saved in Tracker</span>
              </>
            ) : (
              <>
                <Bookmark size={15} />
                <span>Save This Internship</span>
              </>
            )}
          </button>
        </div>

        {/* Quick details chips */}
        <div style={{
          display: "flex",
          gap: 12,
          padding: "12px 16px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          margin: "18px 0 24px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
            <DollarSign size={15} color="var(--status-success)" />
            <span id="job-stipend" style={{ color: "#1d1d1f", fontWeight: 600 }}>{DEMO_LISTING.stipend}</span>
          </div>
          <div style={{ color: "var(--border-subtle)" }}>•</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
            <Calendar size={15} color="var(--primary)" />
            <span id="job-term" style={{ color: "#1d1d1f" }}>{DEMO_LISTING.term}</span>
          </div>
          <div style={{ color: "var(--border-subtle)" }}>•</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
            URL: <span id="job-url" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--primary)" }}>{DEMO_LISTING.url}</span>
          </div>
        </div>

        {/* Role overview */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            About the Role
          </h4>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {DEMO_LISTING.description}
          </p>
        </div>

        {/* Requirements */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            Key Qualifications
          </h4>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, color: "var(--text-muted)" }}>
            {DEMO_LISTING.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
