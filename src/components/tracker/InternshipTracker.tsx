import React, { useState } from "react";
import type { InternshipRecord, InternshipStatus } from "../../types";
import { Briefcase, ExternalLink, Trash2, Search, Filter, ShieldCheck, ArrowRight, PlusCircle } from "lucide-react";

interface InternshipTrackerProps {
  records: InternshipRecord[];
  onDeleteRecord: (id: string) => void;
  onUpdateStatus: (id: string, status: InternshipStatus) => void;
  onGoToListing: () => void;
  onTriggerSaveWorkflow: () => void;
}

export const InternshipTracker: React.FC<InternshipTrackerProps> = ({
  records,
  onDeleteRecord,
  onUpdateStatus,
  onGoToListing,
  onTriggerSaveWorkflow
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.location && rec.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: InternshipStatus) => {
    switch (status) {
      case "Saved":
        return { bg: "var(--status-ready-bg)", text: "var(--status-ready)", border: "var(--status-ready-border)" };
      case "Applied":
        return { bg: "var(--status-success-bg)", text: "var(--status-success)", border: "var(--status-success-border)" };
      case "Interviewing":
        return { bg: "#f5f3ff", text: "#7c3aed", border: "rgba(124, 58, 237, 0.25)" };
      case "Rejected":
        return { bg: "var(--status-failed-bg)", text: "var(--status-failed)", border: "var(--status-failed-border)" };
      default:
        return { bg: "var(--bg-secondary)", text: "var(--text-muted)", border: "var(--border-subtle)" };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "28px" }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.2px" }}>
              Internship Tracker
            </h2>
            <span className="badge-demo">
              Local Storage
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11.5,
              color: "var(--status-success)",
              background: "var(--status-success-bg)",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-success-border)"
            }}>
              <ShieldCheck size={12} /> Duplicate Protection
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Captured opportunities stored client-side. Persists across browser refreshes.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onGoToListing}
            className="btn btn-secondary"
            style={{ fontSize: 12.5 }}
          >
            <Briefcase size={13} />
            <span>View Demo Listing</span>
          </button>

          <button
            onClick={onTriggerSaveWorkflow}
            className="btn btn-primary"
            style={{ fontSize: 12.5 }}
          >
            <PlusCircle size={13} />
            <span>Save Demo Listing</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input
            type="text"
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, company, or location..."
            style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="var(--text-faint)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: "auto", height: 38, padding: "0 12px", fontSize: 13 }}
          >
            <option value="all">All Statuses ({records.length})</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      {filtered.length === 0 ? (
        <div style={{
          padding: "48px 20px",
          textAlign: "center",
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--border-medium)"
        }}>
          <Briefcase size={36} color="var(--text-faint)" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>
            No internship listings found
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, maxWidth: 380, margin: "4px auto 16px" }}>
            Trigger the "Save this internship" workflow via voice or click to capture opportunities from supported demo pages.
          </p>
          <button onClick={onGoToListing} className="btn btn-primary" style={{ fontSize: 13 }}>
            <span>Go to Demo Listing</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((item) => {
            const badge = getStatusBadgeStyle(item.status);
            return (
              <div
                key={item.id}
                style={{
                  padding: "16px 20px",
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all var(--duration-fast) var(--ease-apple)"
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>
                      {item.title}
                    </h4>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`
                    }}>
                      {item.status}
                    </span>
                    {item.isDemo && (
                      <span className="badge-demo" style={{ fontSize: 10, padding: "1px 6px" }}>
                        Sample
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--text-muted)" }}>
                    <strong style={{ color: "#1d1d1f" }}>{item.company}</strong>
                    {item.location && <span>• {item.location}</span>}
                    <span>• Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
                  </div>

                  {item.notes && (
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
                      {item.notes}
                    </div>
                  )}
                </div>

                {/* Status selector & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as InternshipStatus)}
                    className="input-field"
                    style={{ height: 32, padding: "0 8px", fontSize: 12, width: 120 }}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ padding: "6px 9px", fontSize: 12 }}
                    title={item.url}
                  >
                    <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    className="btn btn-danger"
                    style={{ padding: "6px 9px", fontSize: 12 }}
                    title="Delete saved opportunity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
