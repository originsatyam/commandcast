import { describe, it, expect } from "vitest";
import { normalizeCommand, matchCommand } from "./commandMatcher";
import { DEFAULT_WORKFLOWS } from "../data/mockData";

describe("Command Normalizer and Matcher", () => {
  it("normalizes punctuation, case, and extra whitespace", () => {
    expect(normalizeCommand("  Save this INTERNSHIP!!  ")).toBe("save this internship");
    expect(normalizeCommand("Prepare, my application... ")).toBe("prepare my application");
    expect(normalizeCommand("")).toBe("");
  });

  it("matches exact trigger phrases correctly", () => {
    const res = matchCommand("Save this internship", DEFAULT_WORKFLOWS);
    expect(res.type).toBe("exact");
    expect(res.workflow?.id).toBe("save-internship");
  });

  it("matches case-insensitive phrases with extra spaces and punctuation", () => {
    const res = matchCommand("  SAVE THIS INTERNSHIP!  ", DEFAULT_WORKFLOWS);
    expect(res.type).toBe("exact");
    expect(res.workflow?.id).toBe("save-internship");
  });

  it("matches registered aliases", () => {
    const res = matchCommand("Add this internship to my tracker", DEFAULT_WORKFLOWS);
    expect(res.type).toBe("exact");
    expect(res.workflow?.id).toBe("save-internship");

    const res2 = matchCommand("Fill my demo application", DEFAULT_WORKFLOWS);
    expect(res2.type).toBe("exact");
    expect(res2.workflow?.id).toBe("prepare-application");
  });

  it("returns unsupported for unknown phrases without guessing or hallucinations", () => {
    const res = matchCommand("Order a pizza and book a flight", DEFAULT_WORKFLOWS);
    expect(res.type).toBe("unsupported");
    expect(res.workflow).toBeUndefined();
    expect(res.explanation).toContain("Unknown command");
  });

  it("returns unsupported for empty or whitespace-only inputs", () => {
    const res = matchCommand("   ", DEFAULT_WORKFLOWS);
    expect(res.type).toBe("unsupported");
    expect(res.workflow).toBeUndefined();
  });
});
