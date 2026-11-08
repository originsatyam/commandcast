import React from "react";
import type { WorkflowDefinition, DemoProfile } from "../../types";
import { X, Play, ShieldAlert, Database } from "lucide-react";

interface WorkflowPreviewModalProps {
  workflow: WorkflowDefinition;
  profile: DemoProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAndRun: (workflow: WorkflowDefinition) => void;
}

export const WorkflowPreviewModal: React.FC<WorkflowPreviewModalProps> = ({
  workflow,
  profile,
  isOpen,
  onClose,
  onConfirmAndRun
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "28px" }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge-demo">Execution Preview</span>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                Target: {workflow.targetPageName}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.3px" }}>
              {workflow.name}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
              {workflow.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: 6, borderRadius: "var(--radius-full)" }}
            aria-label="Close preview modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step-by-step planned sequence */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-faint)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10
          }}>
            Planned Step Sequence ({workflow.steps.length} steps)
          </h4>

          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden"
          }}>
            {workflow.steps.map((step, idx) => (
              <div
                key={step.id}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  borderBottom: idx < workflow.steps.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  background: step.sensitive ? "var(--status-waiting-bg)" : "transparent"
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "var(--radius-full)",
                  background: step.sensitive ? "rgba(180, 83, 9, 0.15)" : "var(--bg-secondary)",
                  color: step.sensitive ? "var(--status-waiting)" : "#1d1d1f",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1d1d1f" }}>
                      {step.label}
                    </span>
                    {step.sensitive && (
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "var(--status-waiting)",
                        background: "rgba(180, 83, 9, 0.12)",
                        padding: "1px 6px",
                        borderRadius: 4
                      }}>
                        HUMAN REVIEW PAUSE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data operation disclosure */}
        <div style={{
          padding: "14px 16px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          marginBottom: 18
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-main)",
            textTransform: "uppercase",
            marginBottom: 6
          }}>
            <Database size={13} color="var(--primary)" />
            <span>Data Operations:</span>
          </div>

          {workflow.id === "save-internship" ? (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Reads DOM elements: <code style={{ color: "var(--primary)" }}>title</code>, <code style={{ color: "var(--primary)" }}>company</code>, <code style={{ color: "var(--primary)" }}>location</code>, and <code style={{ color: "var(--primary)" }}>url</code> from the demo listing. Writes to <code style={{ color: "#1d1d1f" }}>localStorage</code> with duplicate URL check.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6 }}>
                Loads profile for <strong>{profile.fullName}</strong> ({profile.email}) and fills the corresponding demo application form inputs.
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Full Name", "Email", "Phone", "University", "Degree Course", "Graduation Year", "Portfolio URL"].map((f) => (
                  <span key={f} style={{
                    fontSize: 11,
                    background: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    padding: "2px 7px",
                    borderRadius: 4,
                    color: "var(--text-main)"
                  }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Safety Callout */}
        <div style={{
          padding: "12px 14px",
          background: "var(--status-waiting-bg)",
          border: "1px solid var(--status-waiting-border)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 22
        }}>
          <ShieldAlert size={18} color="var(--status-waiting)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "var(--status-waiting)", lineHeight: 1.45 }}>
            <strong>Deterministic execution policy:</strong> CommandCast executes only these explicitly mapped steps. It will never guess missing fields, never click Submit Application, and pauses if any precondition is unmet.
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirmAndRun(workflow);
            }}
            className="btn btn-primary"
            style={{
              padding: "9px 20px",
              background: "#1d1d1f"
            }}
          >
            <Play size={14} />
            <span>Confirm and Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
