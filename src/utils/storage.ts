import type { InternshipRecord, DemoProfile, WorkflowRun } from "../types";
import { INITIAL_PROFILE, INITIAL_TRACKER, INITIAL_ACTIVITY_LOG } from "../data/mockData";

const STORAGE_KEYS = {
  TRACKER: "commandcast_internships_v1",
  PROFILE: "commandcast_profile_v1",
  ACTIVITY_LOG: "commandcast_activity_v1",
  SETTINGS: "commandcast_settings_v1"
};

export const getStoredTracker = (): InternshipRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(INITIAL_TRACKER));
      return INITIAL_TRACKER;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load tracker from localStorage:", err);
    return INITIAL_TRACKER;
  }
};

export const saveStoredTracker = (records: InternshipRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save tracker to localStorage:", err);
  }
};

export const getStoredProfile = (): DemoProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load profile from localStorage:", err);
    return INITIAL_PROFILE;
  }
};

export const saveStoredProfile = (profile: DemoProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile to localStorage:", err);
  }
};

export const getStoredActivityLog = (): WorkflowRun[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(INITIAL_ACTIVITY_LOG));
      return INITIAL_ACTIVITY_LOG;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load activity log from localStorage:", err);
    return INITIAL_ACTIVITY_LOG;
  }
};

export const saveStoredActivityLog = (logs: WorkflowRun[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to save activity log to localStorage:", err);
  }
};

export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRACKER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (err) {
    console.error("Failed to clear localStorage:", err);
  }
};

export const resetToDemoData = (): { tracker: InternshipRecord[]; profile: DemoProfile; activityLog: WorkflowRun[] } => {
  saveStoredTracker(INITIAL_TRACKER);
  saveStoredProfile(INITIAL_PROFILE);
  saveStoredActivityLog(INITIAL_ACTIVITY_LOG);
  return {
    tracker: INITIAL_TRACKER,
    profile: INITIAL_PROFILE,
    activityLog: INITIAL_ACTIVITY_LOG
  };
};
