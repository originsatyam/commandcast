import React from "react";
import type { WorkflowRun } from "../../types";
import { CheckCircle2, AlertCircle, ShieldAlert, X, RotateCcw } from "lucide-react";

interface RunStatusBannerProps {
  currentRun: WorkflowRun | null;
  onDismiss: () => void;
  onRetry?: (workflowId: string) => void;
}

export const RunStatusBanner: React.FC<RunStatusBannerProps> = ({
  currentRun,
  onDismiss,
  onRetry
}) => {
  if (!currentRun) return null;

  const isRunning = currentRun.status === "RUNNING";
  const isCompleted = currentRun.status === "COMPLETED";
  const isWaiting = currentRun.status === "WAITING_FOR_USER";
  const isFailed = currentRun.status === "FAILED";

  return (
    <div className="glass-panel" style={{
      padding: "20px 24px",
      marginBottom: 24,
      background: isCompleted
        ? "#f0fdf4"
        : isWaiting
        ? "#fffbeb"
        : isFailed
        ? "#fff1f2"
        : "#f0f9ff",
      border: `1px solid ${
        isCompleted
          ? "var(--status-success-border)"
          : isWaiting
          ? "var(--status-waiting-border)"
          : isFailed
          ? "var(--status-failed-border)"
          : "var(--status-ready-border)"
      }`,
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)",
      position: "relative"
    }}>
      {/* Top row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={`badge-status ${
            isCompleted ? "completed" : isWaiting ? "waiting" : isFailed ? "failed" : "running"
          }`}>
            {isRunning && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", animation: "voiceSiriPulse 1.2s infinite" }} />}
            {isCompleted && <CheckCircle2 size={13} />}
            {isWaiting && <ShieldAlert size={13} />}
            {isFailed && <AlertCircle size={13} />}
            <span>STATUS: {currentRun.status}</span>
          </span>

          <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>
            {currentRun.workflowName}
          </span>

          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            via {currentRun.triggeredBy} input
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isFailed && onRetry && (
            <button
              onClick={() => onRetry(currentRun.workflowId)}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: 12 }}
            >
              <RotateCcw size={13} />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="btn btn-outline"
            style={{ padding: 4, borderRadius: "var(--radius-full)" }}
            title="Dismiss status banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Manual Review Callout if WAITING_FOR_USER */}
      {isWaiting && (
        <div style={{
          padding: "14px 18px",
          background: "#ffffff",
          border: "1px solid var(--status-waiting-border)",
          borderRadius: "var(--radius-md)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "var(--shadow-sm)"
        }}>
          <ShieldAlert size={22} color="var(--status-waiting)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--status-waiting)" }}>
              Action Required: Review your application manually
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
              CommandCast has populated known profile details into the demo form and verified each value. To ensure safety and complete human control, <strong>we never submit applications automatically</strong>. Please inspect the form and submit it yourself when ready.
            </div>
          </div>
        </div>
      )}

      {/* Step checklist */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 10,
        marginBottom: 12
      }}>
        {currentRun.steps.map((st, i) => (
          <div
            key={st.id}
            style={{
              padding: "10px 14px",
              background: "#ffffff",
              border: `1px solid ${
                st.status === "success"
                  ? "var(--status-success-border)"
                  : st.status === "running"
                  ? "var(--status-ready-border)"
                  : st.status === "failed"
                  ? "var(--status-failed-border)"
                  : "var(--border-subtle)"
              }`,
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)" }}>
                STEP {i + 1}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: st.status === "success"
                  ? "var(--status-success)"
                  : st.status === "running"
                  ? "var(--status-ready)"
                  : st.status === "failed"
                  ? "var(--status-failed)"
                  : "var(--text-faint)"
              }}>
                {st.status.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>
              {st.label}
            </div>

            {st.message && (
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                {st.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error explanation if failed */}
      {currentRun.error && (
        <div style={{
          padding: "10px 14px",
          background: "#ffffff",
          border: "1px solid var(--status-failed-border)",
          borderRadius: "var(--radius-md)",
          fontSize: 12.5,
          color: "var(--status-failed)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "var(--shadow-sm)"
        }}>
          <AlertCircle size={15} />
          <span><strong>Failure explanation:</strong> {currentRun.error}</span>
        </div>
      )}
    </div>
  );
};
