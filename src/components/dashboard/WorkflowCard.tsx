import React from "react";
import type { WorkflowDefinition } from "../../types";
import { Play, Eye, CheckCircle2, ShieldAlert, Layers } from "lucide-react";

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
  onPreview: (workflow: WorkflowDefinition) => void;
  onRun: (workflow: WorkflowDefinition) => void;
  isExecuting?: boolean;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onPreview,
  onRun,
  isExecuting = false
}) => {
  return (
    <div className="glass-panel glass-panel-interactive" style={{
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      background: "#ffffff",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)"
    }}>
      <div>
        {/* Top Header & Target Page badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14
        }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--text-muted)",
            background: "var(--bg-secondary)",
            padding: "3px 9px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)"
          }}>
            <Layers size={12} color="var(--primary)" /> Target: {workflow.targetPageName}
          </span>

          <span className="badge-demo">
            Verified
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#1d1d1f",
          marginBottom: 8,
          letterSpacing: "-0.2px"
        }}>
          {workflow.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13.5,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          marginBottom: 16
        }}>
          {workflow.description}
        </p>

        {/* Trigger Phrases section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Spoken / Typed Triggers:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {workflow.triggerPhrases.map((phrase, idx) => (
              <div key={idx} style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "#1d1d1f",
                background: "var(--bg-secondary)",
                padding: "4px 9px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}>
                “{phrase}”
              </div>
            ))}
          </div>
        </div>

        {/* Steps sequence overview */}
        <div style={{
          padding: "12px 14px",
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: 20
        }}>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Planned sequence:</span>
            <strong style={{ color: "#1d1d1f" }}>{workflow.steps.length} verified steps</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {workflow.steps.slice(0, 3).map((st, i) => (
              <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                <CheckCircle2 size={12} color="var(--primary)" />
                <span>{i + 1}. {st.label}</span>
              </div>
            ))}
            {workflow.steps.length > 3 && (
              <div style={{ fontSize: 11.5, color: "var(--text-faint)", paddingLeft: 18 }}>
                + {workflow.steps.length - 3} more verification steps
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Notice & Action Buttons */}
      <div>
        {workflow.id === "prepare-application" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--status-waiting)",
            marginBottom: 14,
            padding: "5px 9px",
            background: "var(--status-waiting-bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--status-waiting-border)"
          }}>
            <ShieldAlert size={13} />
            <span>Guaranteed stop before application submission</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onPreview(workflow)}
            className="btn btn-secondary"
            style={{ flex: 1, padding: "8px 12px" }}
            title="Inspect planned actions and data before running"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onRun(workflow)}
            disabled={isExecuting}
            className="btn btn-primary"
            style={{
              flex: 1.2,
              padding: "8px 14px",
              background: "#1d1d1f"
            }}
          >
            <Play size={14} />
            <span>{isExecuting ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
