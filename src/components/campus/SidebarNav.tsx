import React, { useState } from "react";
import type { CampusTab, StudentProfile } from "../../types/campus";
import { useAuth } from "../../context/useAuth";
import { sounds } from "../../services/soundEffectsService";

interface SidebarNavProps {
  activeTab: CampusTab;
  onSelectTab: (tab: CampusTab) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  savedCount: number;
  profile: StudentProfile;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onTriggerScan?: () => void;
  isScanning?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  savedCount,
  profile,
  isCollapsed,
  onToggleCollapse
}) => {
  const { isAuthenticated, signOut, openAuthModal } = useAuth();
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());
  return (
    <aside
      className={`side ${isCollapsed ? "is-collapsed" : ""}`}
      aria-label="Campus Radar navigation"
    >
      {/* Brand & Collapse Header Row */}
      <div className="brand-row">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab("radar");
          }}
          title="Campus Radar Home"
        >
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <rect width="28" height="28" rx="9" fill="var(--primary)" />
            <circle cx="14" cy="14" r="8" fill="none" stroke="var(--on-primary)" strokeWidth="1.6" />
            <circle cx="14" cy="14" r="3.6" fill="none" stroke="var(--on-primary)" strokeWidth="1.6" />
            <circle cx="19.2" cy="8.8" r="2.1" fill="var(--on-primary)" />
          </svg>
          {!isCollapsed && <span>Campus Radar</span>}
        </a>

        {/* Sidebar Collapse / Expand Toggle Button */}
        <button
          type="button"
          className="icon-btn sm"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar (shortcut)" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCollapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* User Row (Direct Profile Access - Auth gate removed for seamless testing) */}
      {!isCollapsed ? (
        <button
          type="button"
          className="who"
          onClick={() => onSelectTab("profile")}
          title="Click to view and edit student profile & target role"
          aria-label="Edit student profile"
        >
          <span className="avatar" aria-hidden="true">
            {profile.name.charAt(0)}
          </span>
          <div className="who-meta">
            <b>{profile.name}</b>
            <span>{profile.targetRole || "Product Designer"}</span>
          </div>
          <span className="who-edit" aria-hidden="true" title="Edit preferences">
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="icon-btn"
          onClick={() => onSelectTab("profile")}
          title={`Edit ${profile.name}'s profile`}
          aria-label="Edit profile"
        >
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      )}

      {/* Nav List */}
      <nav className="idx" id="idx" aria-label="Sections">
        <button
          type="button"
          className={activeTab === "radar" ? "active" : ""}
          aria-current={activeTab === "radar" ? "true" : undefined}
          onClick={() => onSelectTab("radar")}
          title="Discover Opportunities"
        >
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M4 10.5L12 4l8 6.5V20H4z" />
            <path d="M10 20v-5h4v5" />
          </svg>
          {!isCollapsed && <span>Discover</span>}
        </button>

        <button
          type="button"
          className={activeTab === "tracker" ? "active" : ""}
          aria-current={activeTab === "tracker" ? "true" : undefined}
          onClick={() => onSelectTab("tracker")}
          title="Application Pipeline Tracker"
        >
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="4" y="4" width="6.5" height="6.5" rx="1.8" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" />
          </svg>
          {!isCollapsed && <span>Tracker</span>}
          {!isCollapsed && savedCount > 0 && <span className="trail">{savedCount}</span>}
        </button>

        <button
          type="button"
          className={activeTab === "comparison" ? "active" : ""}
          aria-current={activeTab === "comparison" ? "true" : undefined}
          onClick={() => onSelectTab("comparison")}
          title="Why Campus Radar Exists"
        >
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.7 2.7L16 9.8" />
          </svg>
          {!isCollapsed && <span>Why Radar</span>}
        </button>
      </nav>

      {/* Bottom Switcher */}
      <div className="side-foot" style={{ display: "grid", gap: 6 }}>
        {!isAuthenticated ? (
          <button
            className={`btn btn-secondary ${isCollapsed ? "sm" : "btn-block"}`}
            type="button"
            onClick={() => openAuthModal("Sign in to access your saved tracker & personalized profile")}
            title="Sign in with Supabase or 1-click Demo"
            aria-label="Sign in"
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {!isCollapsed && <span>Sign In</span>}
          </button>
        ) : (
          <button
            className={`btn btn-ghost ${isCollapsed ? "sm" : "btn-block"}`}
            type="button"
            onClick={signOut}
            title="Sign out of Supabase session"
            aria-label="Sign out"
            style={{ color: "var(--ink-3)" }}
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        )}

        <button
          className={`btn btn-secondary ${isCollapsed ? "" : "btn-block"}`}
          type="button"
          onClick={onToggleTheme}
          aria-label="Switch theme mode"
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {theme === "dark" ? (
              <circle cx="12" cy="12" r="5" />
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            )}
          </svg>
          {!isCollapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        <button
          className={`btn btn-ghost ${isCollapsed ? "sm" : "btn-block"}`}
          type="button"
          onClick={() => {
            const next = sounds.toggleMute();
            setIsMuted(next);
          }}
          aria-label={isMuted ? "Unmute tactile audio effects" : "Mute audio effects"}
          title={isMuted ? "Unmute audio effects" : "Mute audio effects"}
          style={{ color: "var(--ink-3)" }}
        >
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMuted ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            )}
          </svg>
          {!isCollapsed && <span>{isMuted ? "Sound: Off" : "Sound: On"}</span>}
        </button>
      </div>
    </aside>
  );
};
