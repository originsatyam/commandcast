import React from "react";
import type { CampusTab, StudentProfile } from "../../types/campus";

interface HeaderProps {
  activeTab: CampusTab;
  onSelectTab: (tab: CampusTab) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  savedCount: number;
  profile: StudentProfile;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  savedCount,
  profile
}) => {
  return (
    <header className="top">
      <div className="top-in">
        <button
          className="brand"
          onClick={() => onSelectTab("radar")}
          style={{ background: "none", border: "none", padding: 0 }}
          aria-label="Campus Radar Home"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 24, height: 24, flex: "none" }}>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12l4.6-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16.8" cy="7.2" r="2.2" fill="var(--accent)" />
          </svg>
          <span>Campus Radar</span>
        </button>

        <nav className="nav" aria-label="Campus Radar Sections">
          <button
            type="button"
            className={activeTab === "radar" ? "active" : ""}
            aria-current={activeTab === "radar" ? "page" : undefined}
            onClick={() => onSelectTab("radar")}
          >
            Opportunities
          </button>
          <button
            type="button"
            className={activeTab === "tracker" ? "active" : ""}
            aria-current={activeTab === "tracker" ? "page" : undefined}
            onClick={() => onSelectTab("tracker")}
          >
            My Tracker {savedCount > 0 && `(${savedCount})`}
          </button>
          <button
            type="button"
            className={activeTab === "comparison" ? "active" : ""}
            aria-current={activeTab === "comparison" ? "page" : undefined}
            onClick={() => onSelectTab("comparison")}
          >
            Why Campus Radar
          </button>
          <button
            type="button"
            className={activeTab === "profile" ? "active" : ""}
            aria-current={activeTab === "profile" ? "page" : undefined}
            onClick={() => onSelectTab("profile")}
          >
            {profile.name.split(" ")[0]} ({profile.graduationBatch})
          </button>
        </nav>

        <div className="top-tools">
          <button
            className="btn btn-secondary btn-sm toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label="Switch color theme"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    </header>
  );
};
