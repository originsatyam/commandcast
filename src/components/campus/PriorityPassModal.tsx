import React, { useEffect, useCallback } from "react";
import { sounds } from "../../services/soundEffectsService";

interface PriorityPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
}

export const PriorityPassModal: React.FC<PriorityPassModalProps> = ({
  isOpen,
  onClose,
  targetRole = "Product Designer"
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleEnroll = () => {
    sounds.playSparkle();
    alert("Priority Radar Pass waitlist recorded! We will notify you as soon as direct Razorpay checkout opens for your batch.");
    handleClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="priority-modal-title"
    >
      <div className="modal-card" style={{ maxWidth: 480 }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge violet" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                PRIORITY RADAR PASS
              </span>
              <span className="mono" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--violet)" }}>
                ₹199 / mo
              </span>
            </div>
            <h3 id="priority-modal-title" className="t-h2" style={{ marginTop: 6, marginBottom: 4 }}>
              Apply 15 Minutes Before the Crowd
            </h3>
            <p className="dim" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
              By the time a job hits LinkedIn or Twitter, 500+ candidates have already applied. Priority Pass alerts you directly from ATS webhooks.
            </p>
          </div>

          <button
            type="button"
            className="icon-btn sm"
            onClick={handleClose}
            aria-label="Close priority pass modal"
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Pro Value Perks */}
        <div style={{ display: "grid", gap: 10, margin: "18px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem" }}>
            <span className="badge ok" style={{ width: 20, height: 20, padding: 0, justifyContent: "center", flexShrink: 0 }}>✓</span>
            <div>
              <b>15-Minute ATS Requisition Alerts:</b> Direct webhook ping to your Telegram/WhatsApp before the role is announced publicly.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem" }}>
            <span className="badge ok" style={{ width: 20, height: 20, padding: 0, justifyContent: "center", flexShrink: 0 }}>✓</span>
            <div>
              <b>Direct ATS Form URLs:</b> Zero generic career pages, zero redirects. Opens the exact requisition ID application directly.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem" }}>
            <span className="badge ok" style={{ width: 20, height: 20, padding: 0, justifyContent: "center", flexShrink: 0 }}>✓</span>
            <div>
              <b>Tailored Remote India Pitch:</b> Auto-generates your exact timezone overlap, contractor setup, and portfolio deck match for {targetRole}.
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div>
            <span className="t-label" style={{ display: "block" }}>Monthly Pass</span>
            <span className="mono" style={{ fontWeight: 700, fontSize: "1.125rem" }}>₹199 / month</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Maybe Later
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEnroll}
              style={{ padding: "0 18px", height: 38 }}
            >
              <span>Get Priority Pass</span>
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
