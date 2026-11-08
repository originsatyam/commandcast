import React from "react";
import { Terminal, RefreshCw, Trash2, ShieldCheck, Sparkles, Mic } from "lucide-react";

interface HeaderProps {
  speechSupported: boolean;
  savedCount: number;
  runCount: number;
  onResetData: () => void;
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  speechSupported,
  savedCount,
  runCount,
  onResetData,
  onClearData
}) => {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap"
      }}>
        {/* Brand identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "var(--radius-md)",
            background: "#1d1d1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            color: "#ffffff"
          }}>
            <Terminal size={19} strokeWidth={2.4} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.4px",
                color: "#1d1d1f",
                lineHeight: 1.2
              }}>
                CommandCast
              </h1>
              <span className="badge-demo">
                <Sparkles size={11} /> Prototype
              </span>
            </div>
            <p style={{
              fontSize: 12,
              color: "var(--text-faint)",
              marginTop: 1
            }}>
              Deterministic voice & click browser workflows
            </p>
          </div>
        </div>

        {/* Status Pills and Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Speech capability badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: speechSupported ? "var(--status-success-bg)" : "var(--status-waiting-bg)",
            border: `1px solid ${speechSupported ? "var(--status-success-border)" : "var(--status-waiting-border)"}`,
            padding: "4px 9px",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 500,
            color: speechSupported ? "var(--status-success)" : "var(--status-waiting)"
          }}
          title={speechSupported ? "Browser SpeechRecognition API available" : "Web Speech API not detected; text fallback active"}>
            <Mic size={12} />
            <span>{speechSupported ? "Voice Available" : "Text/Click Mode"}</span>
          </div>

          {/* Safety Guarantee pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            padding: "4px 9px",
            borderRadius: "var(--radius-full)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-muted)"
          }}>
            <ShieldCheck size={13} color="#0071e3" />
            <span>Review Gate</span>
          </div>

          {/* Stats pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            padding: "4px 10px",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--text-muted)"
          }}>
            <span>Saved: <strong style={{ color: "#1d1d1f" }}>{savedCount}</strong></span>
            <span>•</span>
            <span>Runs: <strong style={{ color: "#1d1d1f" }}>{runCount}</strong></span>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={onResetData}
            className="btn btn-secondary"
            style={{ padding: "5px 11px", fontSize: 12 }}
            title="Reset tracker, profile, and logs to sample demo data"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>

          {/* Clear Data button */}
          <button
            onClick={onClearData}
            className="btn btn-outline"
            style={{ padding: "5px 9px", fontSize: 12, color: "#e11d48" }}
            title="Clear local storage data"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
