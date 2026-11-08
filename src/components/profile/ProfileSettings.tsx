import React, { useState } from "react";
import type { DemoProfile } from "../../types";
import { User, Mail, Phone, GraduationCap, BookOpen, Calendar, Globe, GitBranch, Save, CheckCircle2, RotateCcw } from "lucide-react";
import { INITIAL_PROFILE } from "../../data/mockData";

interface ProfileSettingsProps {
  profile: DemoProfile;
  onSaveProfile: (profile: DemoProfile) => void;
  onResetProfile: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onSaveProfile,
  onResetProfile
}) => {
  const [formData, setFormData] = useState<DemoProfile>(profile);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleChange = (field: keyof DemoProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowSavedFeedback(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleReset = () => {
    setFormData(INITIAL_PROFILE);
    onSaveProfile(INITIAL_PROFILE);
    onResetProfile();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <div className="glass-panel" style={{ padding: "32px" }}>
        {/* Header */}
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
              <span className="badge-demo">Local Profile Storage</span>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                Zero Cloud Sync
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.3px" }}>
              Student Profile & Autofill Settings
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Stored purely in your browser's localStorage. Used by the "Prepare my application" workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ fontSize: 12.5 }}
          >
            <RotateCcw size={13} />
            <span>Reset to Sample</span>
          </button>
        </div>

        {/* Feedback alert */}
        {showSavedFeedback && (
          <div style={{
            padding: "10px 14px",
            background: "var(--status-success-bg)",
            border: "1px solid var(--status-success-border)",
            borderRadius: "var(--radius-md)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--status-success)"
          }}>
            <CheckCircle2 size={16} />
            <span>Profile successfully updated in localStorage!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <User size={14} color="var(--primary)" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Aarav Sharma"
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <Mail size={14} color="var(--primary)" />
                <span>Primary Email</span>
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="aarav@university.edu"
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <Phone size={14} color="var(--primary)" />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 019-2834"
              />
            </div>

            {/* University */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <GraduationCap size={14} color="var(--primary)" />
                <span>University / College</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.university || ""}
                onChange={(e) => handleChange("university", e.target.value)}
                placeholder="Stanford University"
              />
            </div>

            {/* Course */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <BookOpen size={14} color="var(--primary)" />
                <span>Degree / Major</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.course || ""}
                onChange={(e) => handleChange("course", e.target.value)}
                placeholder="B.S. in Computer Science"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <Calendar size={14} color="var(--primary)" />
                <span>Graduation Year</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.graduationYear || ""}
                onChange={(e) => handleChange("graduationYear", e.target.value)}
                placeholder="2027"
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <Globe size={14} color="var(--primary)" />
                <span>Portfolio Website</span>
              </label>
              <input
                type="url"
                className="input-field"
                value={formData.portfolioUrl || ""}
                onChange={(e) => handleChange("portfolioUrl", e.target.value)}
                placeholder="https://aarav-sharma.dev"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                <GitBranch size={14} color="var(--primary)" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="url"
                className="input-field"
                value={formData.githubUrl || ""}
                onChange={(e) => handleChange("githubUrl", e.target.value)}
                placeholder="https://github.com/aaravsharma"
              />
            </div>
          </div>

          <div style={{
            marginTop: 12,
            paddingTop: 18,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
              Data remains private on your local device.
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "9px 20px"
              }}
            >
              <Save size={14} />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
