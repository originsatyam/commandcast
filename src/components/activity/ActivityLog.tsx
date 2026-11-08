import React, { useState } from "react";
import type { WorkflowRun } from "../../types";
import { Clock, CheckCircle2, AlertCircle, ShieldAlert, ChevronDown, ChevronUp, Trash2, History } from "lucide-react";

interface ActivityLogProps {
  logs: WorkflowRun[];
  onClearLogs: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  logs,
  onClearLogs
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(logs.length > 0 ? logs[0].id : null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const calculateDuration = (start: string, finish?: string) => {
    if (!finish) return "Running...";
    const diff = new Date(finish).getTime() - new Date(start).getTime();
    if (diff < 1000) return `${diff}ms`;
    return `${(diff / 1000).toFixed(1)}s`;
  };

  return (
    <div className="glass-panel" style={{ padding: "28px" }}>
      {/* Header */}
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
              Workflow Activity Log
            </h2>
            <span className="badge-demo">
              {logs.length} Recorded Runs
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Deterministic audit trail of executed commands and verification steps.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="btn btn-outline"
            style={{ fontSize: 12, color: "var(--status-failed)" }}
            title="Clear workflow run history"
          >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div style={{
          padding: "48px 20px",
          textAlign: "center",
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--border-medium)"
        }}>
          <History size={36} color="var(--text-faint)" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>
            No activity logged yet
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Executed workflows will automatically record their verification outcomes here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map((run) => {
            const isExpanded = expandedId === run.id;
            const isCompleted = run.status === "COMPLETED";
            const isWaiting = run.status === "WAITING_FOR_USER";
            const isFailed = run.status === "FAILED";

            return (
              <div
                key={run.id}
                style={{
                  background: "#ffffff",
                  border: `1px solid ${
                    isExpanded ? "var(--border-medium)" : "var(--border-subtle)"
                  }`,
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all var(--duration-fast) var(--ease-apple)"
                }}
              >
                {/* Summary row */}
                <div
                  onClick={() => toggleExpand(run.id)}
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    cursor: "pointer",
                    userSelect: "none",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`badge-status ${
                      isCompleted ? "completed" : isWaiting ? "waiting" : isFailed ? "failed" : "running"
                    }`}>
                      {isCompleted && <CheckCircle2 size={13} />}
                      {isWaiting && <ShieldAlert size={13} />}
                      {isFailed && <AlertCircle size={13} />}
                      <span>{run.status}</span>
                    </span>

                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>
                      {run.workflowName}
                    </span>

                    <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                      Trigger: <strong style={{ color: "var(--text-muted)" }}>{run.triggeredBy}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} />
                      {calculateDuration(run.startedAt, run.finishedAt)}
                    </span>

                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      {new Date(run.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>

                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 2 }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded step breakdown */}
                {isExpanded && (
                  <div style={{
                    padding: "16px 20px",
                    background: "var(--bg-primary)",
                    borderTop: "1px solid var(--border-subtle)"
                  }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10 }}>
                      Step Execution & Postcondition Verifications
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {run.steps.map((st, i) => (
                        <div
                          key={st.id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "#ffffff",
                            border: `1px solid ${
                              st.status === "success"
                                ? "var(--status-success-border)"
                                : st.status === "failed"
                                ? "var(--status-failed-border)"
                                : "var(--border-subtle)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)" }}>
                              {i + 1}.
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>
                              {st.label}
                            </span>
                            {st.message && (
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                — {st.message}
                              </span>
                            )}
                          </div>

                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: st.status === "success" ? "var(--status-success)" : st.status === "failed" ? "var(--status-failed)" : "var(--text-faint)"
                          }}>
                            {st.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {run.error && (
                      <div style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--status-failed-bg)",
                        border: "1px solid var(--status-failed-border)",
                        color: "var(--status-failed)",
                        fontSize: 12.5
                      }}>
                        <strong>Error details:</strong> {run.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
