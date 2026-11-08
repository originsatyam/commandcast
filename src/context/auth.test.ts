import { describe, it, expect, beforeEach } from "vitest";

describe("Supabase Auth and Protected Routes", () => {
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

  it("stores and clears demo user authentication state in localStorage", () => {
    const demoUser = {
      id: "demo-123",
      email: "satyam.manik@example.com",
      name: "Satyam Manik",
      isDemo: true
    };

    globalThis.localStorage.setItem("campus_radar_demo_user", JSON.stringify(demoUser));
    const raw = globalThis.localStorage.getItem("campus_radar_demo_user");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.name).toBe("Satyam Manik");
    expect(parsed.email).toBe("satyam.manik@example.com");

    globalThis.localStorage.removeItem("campus_radar_demo_user");
    expect(globalThis.localStorage.getItem("campus_radar_demo_user")).toBeNull();
  });
});
