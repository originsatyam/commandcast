import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { CampusTab, FilterState, OpportunityListing, StudentProfile, TrackerApplication, ApplicationStage } from "./types/campus";
import { MOCK_OPPORTUNITIES } from "./data/mockOpportunities";
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredTracker,
  getStoredTheme,
  saveStoredTheme,
  toggleSaveOpportunity,
  updateApplicationStatus
} from "./utils/campusStorage";
import { searchLiveOpportunities } from "./services/tinyfishVerificationService";
import {
  syncProfileToSupabase,
  fetchUserProfile,
  fetchUserApplications,
  saveApplicationToSupabase,
  removeApplicationFromSupabase
} from "./services/supabaseClient";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { AuthModal } from "./components/auth/AuthModal";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SidebarNav } from "./components/campus/SidebarNav";
import { OpportunityFilterBar } from "./components/campus/OpportunityFilterBar";
import { OpportunityCard } from "./components/campus/OpportunityCard";
import { OpportunityDetailModal } from "./components/campus/OpportunityDetailModal";
import { ApplicationTracker } from "./components/campus/ApplicationTracker";
import { GapComparisonView } from "./components/campus/GapComparisonView";
import { ProfileMatcherSettings } from "./components/campus/ProfileMatcherSettings";
import { InstantAlertModal } from "./components/campus/InstantAlertModal";
import { PriorityPassModal } from "./components/campus/PriorityPassModal";
import { fetchVerifiedOpportunities } from "./services/opportunityService";
import { sounds } from "./services/soundEffectsService";
import { scoreOpportunityWithPrompt } from "./services/promptMatcherService";

const CampusRadarContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<CampusTab>("radar");
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredProfile());
  const [tracker, setTracker] = useState<TrackerApplication[]>(() => getStoredTracker());
  const [theme, setTheme] = useState<"light" | "dark">(() => getStoredTheme());
  const [selectedOpp, setSelectedOpp] = useState<OpportunityListing | null>(null);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("campus_radar_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("campus_radar_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Dynamic opportunities list
  const [opportunities, setOpportunities] = useState<OpportunityListing[]>(() => MOCK_OPPORTUNITIES);
  const [isScanningLive, setIsScanningLive] = useState(false);
  const [isInstantAlertOpen, setIsInstantAlertOpen] = useState(false);
  const [isPriorityPassOpen, setIsPriorityPassOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    degree: "All",
    yearOfStudy: "All",
    location: "All",
    category: "All",
    onlyEligible: false,
    sortBy: "deadline"
  });

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; actionText?: string; onAction?: () => void } | null>(null);

  const showToast = useCallback((message: string, actionText?: string, onAction?: () => void) => {
    setToast({ message, actionText, onAction });
    const timer = setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    sounds.playTap();
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
  }, [theme]);

  // Load verified listings from Supabase on start (with mock fallback)
  useEffect(() => {
    fetchVerifiedOpportunities().then((data) => {
      if (data && data.length > 0) {
        setOpportunities(data);
      }
    });
  }, []);

  // When authenticated, sync profile and applications with Supabase
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isMounted = true;

    // Fetch remote user profile from Supabase if available
    fetchUserProfile(user.id).then((remoteProfile) => {
      if (remoteProfile && isMounted) {
        setProfile(remoteProfile);
        saveStoredProfile(remoteProfile);
      }
    });

    // Fetch remote user applications from Supabase
    fetchUserApplications(user.id, opportunities).then((remoteApplications) => {
      if (remoteApplications && remoteApplications.length > 0 && isMounted) {
        setTracker(remoteApplications);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, opportunities]);

  // Save/Unsave opportunity handler with Supabase persistence
  const handleToggleSave = useCallback(
    (opp: OpportunityListing) => {
      setTracker((prevTracker) => {
        const { updatedTracker, isSaved } = toggleSaveOpportunity(opp, prevTracker);
        sounds.playBookmark(isSaved);
        if (isSaved) {
          showToast(`Saved "${opp.title}" to your tracker!`, "View tracker", () => setActiveTab("tracker"));
          if (user?.id) {
            saveApplicationToSupabase(user.id, opp.id, "Saved");
          }
        } else {
          showToast(`Removed "${opp.title}" from your tracker.`);
          if (user?.id) {
            removeApplicationFromSupabase(user.id, opp.id);
          }
        }
        return updatedTracker;
      });
    },
    [showToast, user]
  );

  // Update application stage handler
  const handleUpdateStatus = useCallback(
    (trackId: string, newStatus: ApplicationStage) => {
      setTracker((prevTracker) => {
        const updated = updateApplicationStatus(trackId, newStatus, prevTracker);
        showToast(`Updated status to "${newStatus}"`);
        const item = updated.find((t) => t.id === trackId);
        if (item && user?.id) {
          saveApplicationToSupabase(user.id, item.opportunityId, newStatus, item.notes);
        }
        return updated;
      });
    },
    [showToast, user]
  );

  // Remove from tracker
  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      setTracker((prevTracker) => {
        const item = prevTracker.find((t) => t.id === trackId);
        const updated = prevTracker.filter((t) => t.id !== trackId);
        showToast("Removed from tracker");
        if (item && user?.id) {
          removeApplicationFromSupabase(user.id, item.opportunityId);
        }
        return updated;
      });
    },
    [showToast, user]
  );

  // Update profile handler with Supabase Postgres sync
  const handleSaveProfile = useCallback(
    (updatedProfile: StudentProfile) => {
      setProfile(updatedProfile);
      saveStoredProfile(updatedProfile);
      showToast("Profile preferences updated!");
      if (user?.id) {
        syncProfileToSupabase(updatedProfile, user.id);
      }
    },
    [showToast, user]
  );

  // Autonomous Live Web Discovery Trigger
  const handleTriggerTinyFishScan = useCallback(async () => {
    sounds.playRadarPing();
    setIsScanningLive(true);
    showToast("Scanning live web with Firecrawl & TinyFish for verified ATS openings...", undefined, undefined);

    try {
      const targetRole = profile.targetRole || (profile.skills.some((s) => /design|figma|ui/i.test(s)) ? "Product Designer" : "Software Engineer");
      const query = filters.searchQuery || `${targetRole} intern`;
      const liveListings = await searchLiveOpportunities(
        query,
        profile.graduationBatch || "2027",
        undefined,
        targetRole,
        profile.skills
      );

      if (liveListings.length > 0) {
        sounds.playSparkle();
        setOpportunities((prev) => {
          const existingUrls = new Set(prev.map((o) => o.directApplyUrl));
          const newUnique = liveListings.filter((l) => !existingUrls.has(l.directApplyUrl));
          return [...newUnique, ...prev];
        });
        showToast(`Discovered ${liveListings.length} direct ATS requisitions!`, undefined, undefined);
      } else {
        showToast("No new opportunities found on live index. Try another query.", undefined, undefined);
      }
    } catch (err: any) {
      showToast(`Scan error: ${err.message || "Network error"}`, undefined, undefined);
    } finally {
      setIsScanningLive(false);
    }
  }, [filters.searchQuery, profile, showToast]);

  // High Performance Filter & Match Engine with Custom Prompt Prioritization
  const filteredOpportunities = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    const hasQuery = q.length > 0;
    const filterYear = filters.yearOfStudy;
    const filterMode = filters.location;
    const filterCategory = filters.category;
    const filterDegree = filters.degree;
    const onlyEligible = filters.onlyEligible;

    const baseFiltered = opportunities.filter((opp) => {
      // Keyword search
      if (hasQuery) {
        const titleMatch = opp.title.toLowerCase().includes(q);
        const companyMatch = opp.company.toLowerCase().includes(q);
        const skillMatch = opp.skills.some((sk) => sk.toLowerCase().includes(q));
        if (!titleMatch && !companyMatch && !skillMatch) return false;
      }

      // Year of study filter
      if (filterYear !== "All" && !opp.yearsEligible.includes(filterYear)) {
        return false;
      }

      // Workplace location filter
      if (filterMode !== "All") {
        if (filterMode === "Remote" && opp.workplaceType !== "Remote") return false;
        if (filterMode === "Hybrid" && opp.workplaceType !== "Hybrid") return false;
        if (filterMode === "In-Office" && opp.workplaceType !== "In-Office") return false;
      }

      // Category filter
      if (filterCategory !== "All" && opp.category !== filterCategory) {
        return false;
      }

      // Degree program filter
      if (filterDegree !== "All" && !opp.degreesEligible.includes(filterDegree)) {
        return false;
      }

      // Strict user eligibility filter
      if (onlyEligible) {
        const roleKey = (profile.targetRole || "Product Designer").toLowerCase().split(" ")[0];
        const matchesRole = opp.title.toLowerCase().includes(roleKey) || opp.skills.some((sk) => profile.skills.some((ps) => ps.toLowerCase() === sk.toLowerCase()));
        const matchesLoc = profile.preferredLocation === "Remote" ? opp.workplaceType === "Remote" : true;
        if (!matchesRole && !matchesLoc) return false;
      }

      return true;
    });

    // If candidate has configured a personalized prompt, rank opportunities by prompt relevance score
    if (profile.customPrompt && profile.customPrompt.trim().length > 0) {
      return [...baseFiltered].sort((a, b) => {
        const scoreA = scoreOpportunityWithPrompt(a, profile.customPrompt!).score;
        const scoreB = scoreOpportunityWithPrompt(b, profile.customPrompt!).score;
        return scoreB - scoreA;
      });
    }

    return baseFiltered;
  }, [opportunities, filters, profile]);

  // Space Complexity: O(1) Set for fast saved state lookups
  const savedOpportunityIds = useMemo(() => {
    return new Set(tracker.map((t) => t.opportunityId));
  }, [tracker]);

  // Spotlight role: prioritizes candidate's target role and domain
  const spotlightRole = useMemo(() => {
    const isDesign = /design|ui|ux/i.test(profile.targetRole || "") || profile.skills.some((s) => /figma|design/i.test(s));
    if (isDesign) {
      const designRole = opportunities.find((o) => /design|figma|ui/i.test(o.title) || o.skills.some((sk) => /figma|design/i.test(sk)));
      if (designRole) return designRole;
    }
    return opportunities[0];
  }, [opportunities, profile.targetRole, profile.skills]);

  return (
    <div className={`shell ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      {/* Sticky Left Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        savedCount={tracker.length}
        profile={profile}
        onTriggerScan={handleTriggerTinyFishScan}
        isScanning={isScanningLive}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Rounded Panel */}
      <main className="main" id="top">
        {activeTab === "radar" && (
          <div className="tab-content" key="radar">
            {/* Streamlined Hero Header */}
            <header className="hero hero-compact">
              <div className="hero-meta-row">
                <span className="t-label kick">Verified Opportunities &middot; Autumn 2026</span>
                <span className="badge ok">
                  <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Live ATS Verified
                </span>
                <span className="badge violet">{profile.targetRole || "Product Design"}</span>
              </div>
              <h1 className="t-display">Direct ATS roles. Real stipends. Zero ghost jobs.</h1>
              <p className="t-lead">
                Verified opportunities linking directly to official company careers portals, active within 24 hours.
              </p>
            </header>

            {/* Spotlight Card */}
            {spotlightRole && (
              <div style={{ marginBottom: "var(--s-6)" }}>
                <article
                  className="spot"
                  onClick={() => setSelectedOpp(spotlightRole)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="spot-top">
                    <span className="pillw">Featured Priority Role</span>
                    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4>{spotlightRole.title}</h4>
                    <p>{spotlightRole.company} &middot; {spotlightRole.location} &middot; {spotlightRole.category}</p>
                  </div>
                  <div className="spot-foot">
                    <div>
                      <b>{spotlightRole.stipend}</b>
                      <span>Monthly Stipend</span>
                    </div>
                    <div>
                      <b>{profile.targetRole || "Product Design"}</b>
                      <span>Direct ATS Match</span>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* Search Composer & Filter Bar */}
            <OpportunityFilterBar
              filters={filters}
              onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              profile={profile}
              totalCount={opportunities.length}
              filteredCount={filteredOpportunities.length}
              onTriggerTinyFishScan={handleTriggerTinyFishScan}
              isScanningLive={isScanningLive}
              onOpenInstantAlerts={() => setIsInstantAlertOpen(true)}
            />

            {/* Live Scanning Banner & Radar Feedback */}
            {isScanningLive && (
              <div className="radar-scan-banner">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="live-pulse-dot" />
                  <span>Autonomous Web Scanner active &middot; Scanning Greenhouse, Lever, and Workday ATS endpoints...</span>
                </div>
                <span className="badge line sm">Live Stream</span>
              </div>
            )}

            {/* Opportunities Feed Grid with Radar Container */}
            <div className="radar-feed-container">
              {isScanningLive && (
                <div className="radar-scan-overlay" aria-hidden="true">
                  <div className="radar-scan-beam" />
                </div>
              )}

              {filteredOpportunities.length === 0 ? (
                <div className="empty">
                  <span className="t-label">Filter Status</span>
                  <h3 className="t-h2">Nothing matches all current filters</h3>
                  <p>Try clearing search terms or running a live scan to discover newly posted roles.</p>
                  <div style={{ display: "flex", gap: "var(--s-3)", marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        setFilters({
                          searchQuery: "",
                          degree: "All",
                          yearOfStudy: "All",
                          location: "All",
                          category: "All",
                          onlyEligible: false,
                          sortBy: "deadline"
                        })
                      }
                    >
                      Clear all filters
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleTriggerTinyFishScan}
                      disabled={isScanningLive}
                    >
                      <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>{isScanningLive ? "Scanning live web..." : "Scan live web"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="grid-2"
                  key={`${filters.category}-${filters.location}-${filters.onlyEligible}-${filters.searchQuery}`}
                >
                  {filteredOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={savedOpportunityIds.has(opp.id)}
                      onToggleSave={handleToggleSave}
                      onViewDetails={setSelectedOpp}
                      profile={profile}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Profile Strength Dock */}
            <div style={{ marginTop: "var(--s-8)", display: "flex", justifyContent: "flex-end" }}>
              <div className="dock">
                <button
                  className="dock-head"
                  type="button"
                  aria-expanded={isDockOpen}
                  onClick={() => setIsDockOpen(!isDockOpen)}
                >
                  <span className="ring">
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <circle className="bg" cx="24" cy="24" r="20" fill="none" strokeWidth="4" />
                      <circle
                        className="fg"
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                        strokeDasharray="75.4 125.7"
                      />
                    </svg>
                    60%
                  </span>
                  <span>Match Profile</span>
                  <svg className="ic chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isDockOpen && (
                  <div className="dock-body">
                    <div className="todo done">
                      <span className="box">✓</span>
                      <span>Target role: {profile.targetRole || "Product Designer"}</span>
                    </div>
                    <div className="todo done">
                      <span className="box">✓</span>
                      <span>Preferred location: {profile.preferredLocation || "Remote"}</span>
                    </div>
                    <div className="todo done">
                      <span className="box">✓</span>
                      <span>Resume status: {profile.resumeFileName ? "Active CV" : "Profile set"}</span>
                    </div>
                    <div className="todo">
                      <span className="box" />
                      <span>Adjust preferences</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm go"
                        onClick={() => setActiveTab("profile")}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Protected Application Tracker Route */}
        {activeTab === "tracker" && (
          <div className="tab-content" key="tracker">
            <ProtectedRoute
              featureName="Application Pipeline Tracker"
              description="Your saved opportunities, pipeline stages (Applied, Interviewing, Offer), and private notes are secured with Supabase Row Level Security (RLS)."
              onExplorePublic={() => setActiveTab("radar")}
            >
              <ApplicationTracker
                applications={tracker}
                onUpdateStatus={handleUpdateStatus}
                onRemove={handleRemoveTrack}
                onExploreOpportunities={() => setActiveTab("radar")}
              />
            </ProtectedRoute>
          </div>
        )}

        {/* Public Comparison Tab */}
        {activeTab === "comparison" && (
          <div className="tab-content" key="comparison">
            <GapComparisonView />
          </div>
        )}

        {/* Protected Student Profile Route */}
        {activeTab === "profile" && (
          <div className="tab-content" key="profile">
            <ProtectedRoute
              featureName="Student Profile & Matching Criteria"
              description="Your academic batch, verified degree, and parsed resume are stored securely in Supabase Postgres and Storage."
              onExplorePublic={() => setActiveTab("radar")}
            >
              <ProfileMatcherSettings
                profile={profile}
                onSaveProfile={handleSaveProfile}
                opportunities={opportunities}
              />
            </ProtectedRoute>
          </div>
        )}
      </main>

      {/* Opportunity Details & Proof Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        isSaved={selectedOpp ? savedOpportunityIds.has(selectedOpp.id) : false}
        onToggleSave={handleToggleSave}
        profile={profile}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal />

      {/* 15-Minute Instant Alert Subscription Modal */}
      <InstantAlertModal
        isOpen={isInstantAlertOpen}
        onClose={() => setIsInstantAlertOpen(false)}
        targetRole={profile.targetRole}
        preferredLocation={profile.preferredLocation}
      />

      {/* Priority Radar Pass Upgrade Modal */}
      <PriorityPassModal
        isOpen={isPriorityPassOpen}
        onClose={() => setIsPriorityPassOpen(false)}
      />

      {/* Toast Feedback */}
      {toast && (
        <aside className="toast" role="status" aria-live="polite">
          <span>{toast.message}</span>
          {toast.actionText && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                setToast(null);
              }}
            >
              {toast.actionText}
            </button>
          )}
        </aside>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CampusRadarContent />
    </AuthProvider>
  );
};

export default App;
