import React, { useState } from "react";
import type { DemoProfile } from "../../types";
import { ShieldAlert, Sparkles, CheckCircle2, UserCheck, Send, RotateCcw, Info } from "lucide-react";

interface DemoApplicationFormProps {
  profile: DemoProfile;
  formData: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onRunPrepareWorkflow: () => void;
  onClearForm: () => void;
  isFilledByAutomation: boolean;
  waitingForUserReview: boolean;
}

export const DemoApplicationForm: React.FC<DemoApplicationFormProps> = ({
  profile,
  formData,
  onFieldChange,
  onRunPrepareWorkflow,
  onClearForm,
  isFilledByAutomation,
  waitingForUserReview
}) => {
  const [submittedManually, setSubmittedManually] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedManually(true);
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Review Callout Banner when in WAITING_FOR_USER state */}
      {waitingForUserReview && (
        <div style={{
          padding: "16px 20px",
          background: "var(--status-waiting-bg)",
          border: "1px solid var(--status-waiting-border)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          boxShadow: "var(--shadow-sm)"
        }}>
          <ShieldAlert size={22} color="var(--status-waiting)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--status-waiting)" }}>
              WAITING_FOR_USER: Review your application before submitting
            </div>
            <div style={{ fontSize: 13, color: "var(--text-main)", marginTop: 4, lineHeight: 1.5 }}>
              CommandCast has populated known profile details into the form below and read them back to verify accuracy. In accordance with safety principles, <strong>CommandCast does not submit applications</strong>. Please inspect your information and submit manually when you are ready.
            </div>
          </div>
        </div>
      )}

      {/* Manual submission success message */}
      {submittedManually && (
        <div style={{
          padding: "16px 20px",
          background: "var(--status-success-bg)",
          border: "1px solid var(--status-success-border)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "var(--shadow-sm)"
        }}>
          <CheckCircle2 size={22} color="var(--status-success)" />
          <div style={{ fontSize: 13.5, color: "var(--status-success)" }}>
            <strong>Application Submitted Manually!</strong> You executed the final submission step yourself.
          </div>
        </div>
      )}

      {/* Form Container Card */}
      <div className="glass-panel" style={{ padding: "32px" }}>
        {/* Form header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge-demo">Demo Application Form</span>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                Apex Automations Inc.
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.3px" }}>
              Application for Product Engineering Intern
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Target form for the "Prepare my application" workflow (Autofills data for {profile.fullName}).
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onClearForm}
              className="btn btn-secondary"
              style={{ fontSize: 12 }}
            >
              <RotateCcw size={13} />
              <span>Reset Form</span>
            </button>

            <button
              type="button"
              onClick={onRunPrepareWorkflow}
              className="btn btn-primary"
              style={{ fontSize: 12.5 }}
            >
              <UserCheck size={14} />
              <span>Autofill Application</span>
            </button>
          </div>
        </div>

        {/* Verification banner if auto-filled */}
        {isFilledByAutomation && (
          <div style={{
            padding: "10px 14px",
            background: "var(--status-ready-bg)",
            border: "1px solid var(--status-ready-border)",
            borderRadius: "var(--radius-md)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "var(--status-ready)"
          }}>
            <Sparkles size={15} />
            <span>Mapped profile fields populated & read back verified by CommandCast.</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Full Name */}
            <div>
              <label htmlFor="app-fullname" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                Full Legal Name <span style={{ color: "var(--status-failed)" }}>*</span>
              </label>
              <input
                id="app-fullname"
                type="text"
                required
                className="input-field"
                value={formData.fullName || ""}
                onChange={(e) => onFieldChange("fullName", e.target.value)}
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="app-email" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                Email Address <span style={{ color: "var(--status-failed)" }}>*</span>
              </label>
              <input
                id="app-email"
                type="email"
                required
                className="input-field"
                value={formData.email || ""}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="e.g. aarav@alumni.edu"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="app-phone" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                id="app-phone"
                type="tel"
                className="input-field"
                value={formData.phone || ""}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                placeholder="e.g. +1 (415) 555-0192"
              />
            </div>

            {/* University / College */}
            <div>
              <label htmlFor="app-university" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                University / Institution <span style={{ color: "var(--status-failed)" }}>*</span>
              </label>
              <input
                id="app-university"
                type="text"
                required
                className="input-field"
                value={formData.university || ""}
                onChange={(e) => onFieldChange("university", e.target.value)}
                placeholder="e.g. Stanford University"
              />
            </div>

            {/* Course / Major */}
            <div>
              <label htmlFor="app-course" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                Course / Major Field of Study
              </label>
              <input
                id="app-course"
                type="text"
                className="input-field"
                value={formData.course || ""}
                onChange={(e) => onFieldChange("course", e.target.value)}
                placeholder="e.g. B.S. in Computer Science"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label htmlFor="app-gradyear" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                Expected Graduation Year
              </label>
              <input
                id="app-gradyear"
                type="text"
                className="input-field"
                value={formData.graduationYear || ""}
                onChange={(e) => onFieldChange("graduationYear", e.target.value)}
                placeholder="e.g. 2027"
              />
            </div>
          </div>

          {/* Portfolio Link */}
          <div>
            <label htmlFor="app-portfolio" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              Portfolio / GitHub URL
            </label>
            <input
              id="app-portfolio"
              type="url"
              className="input-field"
              value={formData.portfolioUrl || ""}
              onChange={(e) => onFieldChange("portfolioUrl", e.target.value)}
              placeholder="https://aarav-sharma.dev"
            />
          </div>

          {/* Unmapped Field: Additional Notes (Explicitly left empty by automation) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label htmlFor="app-coverletter" style={{ fontSize: 12.5, fontWeight: 600, color: "#1d1d1f" }}>
                Cover Letter / Why Apex Automations?
              </label>
              <span style={{ fontSize: 11, color: "var(--status-waiting)", display: "flex", alignItems: "center", gap: 4 }}>
                <Info size={11} /> Unmapped profile field (never fabricated)
              </span>
            </div>
            <textarea
              id="app-coverletter"
              rows={3}
              className="input-field"
              value={formData.coverLetter || ""}
              onChange={(e) => onFieldChange("coverLetter", e.target.value)}
              placeholder="Enter your personalized reasons or project notes manually..."
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Form Actions with Strict Manual Submission Callout */}
          <div style={{
            marginTop: 16,
            paddingTop: 20,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", maxWidth: 440 }}>
              <strong style={{ color: "#1d1d1f" }}>Safety Guarantee:</strong> CommandCast runner never triggers final form submission. You retain complete agency over every sent application.
            </div>

            <button
              id="app-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "9px 20px"
              }}
            >
              <Send size={14} />
              <span>Submit Application (Manual Human Action)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
