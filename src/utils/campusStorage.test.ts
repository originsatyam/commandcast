import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredProfile,
  saveStoredProfile,
  toggleSaveOpportunity,
  updateApplicationStatus
} from "./campusStorage";
import { MOCK_OPPORTUNITIES, INITIAL_STUDENT_PROFILE } from "../data/mockOpportunities";

describe("Campus Radar Storage & Matcher Logic", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: () => null
    } as any;
  });

  it("retrieves default student profile when storage is empty", () => {
    const profile = getStoredProfile();
    expect(profile.name).toBe(INITIAL_STUDENT_PROFILE.name);
    expect(profile.graduationBatch).toBe("2027");
  });

  it("saves and retrieves updated student profile", () => {
    const updated = {
      ...INITIAL_STUDENT_PROFILE,
      name: "Rohan Varma",
      graduationBatch: "2028",
      cgpa: 9.1
    };
    saveStoredProfile(updated);
    const retrieved = getStoredProfile();
    expect(retrieved.name).toBe("Rohan Varma");
    expect(retrieved.graduationBatch).toBe("2028");
    expect(retrieved.cgpa).toBe(9.1);
  });

  it("toggles opportunity save to tracker without duplicates", () => {
    const opp = MOCK_OPPORTUNITIES[0];
    const { updatedTracker, isSaved } = toggleSaveOpportunity(opp, []);
    expect(isSaved).toBe(true);
    expect(updatedTracker.length).toBe(1);
    expect(updatedTracker[0].opportunityId).toBe(opp.id);
    expect(updatedTracker[0].status).toBe("Saved");

    // Toggle again -> removes from tracker
    const secondToggle = toggleSaveOpportunity(opp, updatedTracker);
    expect(secondToggle.isSaved).toBe(false);
    expect(secondToggle.updatedTracker.length).toBe(0);
  });

  it("updates application status across tracker pipeline stages", () => {
    const opp = MOCK_OPPORTUNITIES[0];
    const initialTracker = [
      {
        id: "track-test-1",
        opportunityId: opp.id,
        opportunity: opp,
        status: "Saved" as const,
        savedAt: new Date().toISOString(),
        deadlineReminderSet: true
      }
    ];

    const appliedTracker = updateApplicationStatus("track-test-1", "Applied", initialTracker);
    expect(appliedTracker[0].status).toBe("Applied");
    expect(appliedTracker[0].appliedAt).toBeDefined();

    const interviewTracker = updateApplicationStatus("track-test-1", "Interviewing", appliedTracker);
    expect(interviewTracker[0].status).toBe("Interviewing");
  });
});
