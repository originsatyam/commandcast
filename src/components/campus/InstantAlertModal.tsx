import React, { useState, useEffect, useCallback } from "react";
import { subscribeToAlerts } from "../../services/opportunityService";
import { sounds } from "../../services/soundEffectsService";

interface InstantAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: string;
  targetRole?: string;
  preferredLocation?: string;
}

export const InstantAlertModal: React.FC<InstantAlertModalProps> = ({
  isOpen,
  onClose,
  defaultTrack,
  targetRole = "Product Design"
}) => {
  const initialTrack = defaultTrack || targetRole;
  const [contact, setContact] = useState("");
  const [customTrack, setCustomTrack] = useState<string | null>(null);
  const track = customTrack ?? initialTrack;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClose = useCallback(() => {
    setStatusMsg(null);
    setCustomTrack(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your Telegram username or email address." });
      return;
    }

    setIsSubmitting(true);
    sounds.playTap();

    try {
      const res = await subscribeToAlerts(contact, track);
      sounds.playSparkle();
      setStatusMsg({ type: "success", text: res.message });
      setTimeout(() => {
        handleClose();
      }, 2600);
    } catch {
      setStatusMsg({ type: "error", text: "Failed to activate alert. Stored locally." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="modal-card" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge violet" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                15-MIN INSTANT HOOK
              </span>
              <span className="mono dim" style={{ fontSize: "0.75rem" }}>0 Delay ATS Push</span>
            </div>
            <h3 id="alert-modal-title" className="t-h2" style={{ marginTop: 6, marginBottom: 4 }}>
              Get 15-Minute Instant ATS Alerts
            </h3>
            <p className="dim" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
              Be the first to apply. Get pinged on Telegram or Email within 15 minutes of an official ATS requisition going live.
            </p>
          </div>

          <button
            type="button"
            className="icon-btn sm"
            onClick={handleClose}
            aria-label="Close instant alert modal"
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {statusMsg ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--r-md)",
              background: statusMsg.type === "success" ? "var(--violet-soft)" : "#fee2e2",
              border: `1px solid ${statusMsg.type === "success" ? "var(--violet)" : "#ef4444"}`,
              color: statusMsg.type === "success" ? "var(--violet)" : "#b91c1c",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              marginTop: 14
            }}
          >
            {statusMsg.text}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 16 }}>
            {/* Track selector */}
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
                Target Opportunity Track
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Product Design", "Frontend Engineering", "Full Stack / AI"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="pill sm pill-interactive"
                    aria-pressed={track === t}
                    onClick={() => setCustomTrack(t)}
                    style={{
                      borderColor: track === t ? "var(--violet)" : undefined,
                      color: track === t ? "var(--violet)" : undefined,
                      fontWeight: track === t ? 600 : 400
                    }}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Input */}
            <div>
              <label className="t-label" htmlFor="alert-contact" style={{ display: "block", marginBottom: 6 }}>
                Telegram Username (@handle) or Email
              </label>
              <input
                id="alert-contact"
                type="text"
                className="input"
                placeholder="e.g. @satyam_design or satyam@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                style={{ width: "100%", height: 40, fontSize: "0.9375rem" }}
                required
              />
              <span className="t-small dim" style={{ display: "block", marginTop: 4 }}>
                Direct webhooks trigger immediately upon Lever, Ashby, or Greenhouse posting.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ padding: "0 18px", height: 38 }}
              >
                <span>{isSubmitting ? "Activating..." : "Activate Instant Alerts"}</span>
                <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
