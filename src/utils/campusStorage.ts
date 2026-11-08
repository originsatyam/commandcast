import type { StudentProfile, TrackerApplication, OpportunityListing } from "../types/campus";
import { INITIAL_STUDENT_PROFILE, INITIAL_SAVED_APPLICATIONS, MOCK_OPPORTUNITIES } from "../data/mockOpportunities";

const PROFILE_KEY = "campus_radar_profile_v1";
const TRACKER_KEY = "campus_radar_tracker_v1";
const THEME_KEY = "campus_radar_theme";

export const getStoredProfile = (): StudentProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STUDENT_PROFILE;
  } catch {
    return INITIAL_STUDENT_PROFILE;
  }
};

export const saveStoredProfile = (profile: StudentProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to localStorage:", e);
  }
};

export const getStoredTracker = (): TrackerApplication[] => {
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SAVED_APPLICATIONS;
  } catch {
    return INITIAL_SAVED_APPLICATIONS;
  }
};

export const saveStoredTracker = (tracker: TrackerApplication[]): void => {
  try {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
  } catch (e) {
    console.error("Failed to save tracker to localStorage:", e);
  }
};

export const getStoredTheme = (): "light" | "dark" => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const saveStoredTheme = (theme: "light" | "dark"): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    console.error("Failed to save theme:", e);
  }
};

export const toggleSaveOpportunity = (
  opp: OpportunityListing,
  currentTracker: TrackerApplication[]
): { updatedTracker: TrackerApplication[]; isSaved: boolean } => {
  const existingIndex = currentTracker.findIndex((t) => t.opportunityId === opp.id);
  if (existingIndex >= 0) {
    // Remove from saved
    const updated = currentTracker.filter((t) => t.opportunityId !== opp.id);
    saveStoredTracker(updated);
    return { updatedTracker: updated, isSaved: false };
  } else {
    // Add to saved
    const newEntry: TrackerApplication = {
      id: `track-${Date.now()}`,
      opportunityId: opp.id,
      opportunity: opp,
      status: "Saved",
      savedAt: new Date().toISOString(),
      deadlineReminderSet: true
    };
    const updated = [newEntry, ...currentTracker];
    saveStoredTracker(updated);
    return { updatedTracker: updated, isSaved: true };
  }
};

export const updateApplicationStatus = (
  trackId: string,
  newStatus: TrackerApplication["status"],
  currentTracker: TrackerApplication[]
): TrackerApplication[] => {
  const updated = currentTracker.map((item) => {
    if (item.id === trackId) {
      return {
        ...item,
        status: newStatus,
        appliedAt: newStatus === "Applied" && !item.appliedAt ? new Date().toISOString() : item.appliedAt
      };
    }
    return item;
  });
  saveStoredTracker(updated);
  return updated;
};

export const resetToCuratedData = (): {
  profile: StudentProfile;
  tracker: TrackerApplication[];
  opportunities: OpportunityListing[];
} => {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TRACKER_KEY);
  } catch {}
  return {
    profile: INITIAL_STUDENT_PROFILE,
    tracker: INITIAL_SAVED_APPLICATIONS,
    opportunities: MOCK_OPPORTUNITIES
  };
};
