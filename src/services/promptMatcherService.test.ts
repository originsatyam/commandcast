import { describe, it, expect } from "vitest";
import {
  countWords,
  enforceWordLimit,
  analyzePrompt,
  scoreOpportunityWithPrompt,
  overwriteProfileFromPrompt
} from "./promptMatcherService";
import { MOCK_OPPORTUNITIES, INITIAL_STUDENT_PROFILE } from "../data/mockOpportunities";

describe("Prompt Matcher Service & Edge Cases", () => {
  it("accurately counts words with mixed whitespace and line breaks", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("Hello world")).toBe(2);
    expect(countWords("Hello\nworld\tfrom   Campus Radar")).toBe(5);
  });

  it("enforces 2000 words limit strictly without crashing", () => {
    const shortText = "Find me product design roles";
    const shortResult = enforceWordLimit(shortText, 2000);
    expect(shortResult.exceeded).toBe(false);
    expect(shortResult.wordCount).toBe(5);

    // Generate 2050 words
    const longWords = Array.from({ length: 2050 }, (_, i) => `word${i}`);
    const longText = longWords.join(" ");
    const longResult = enforceWordLimit(longText, 2000);

    expect(longResult.exceeded).toBe(true);
    expect(longResult.wordCount).toBe(2000);
    expect(countWords(longResult.text)).toBe(2000);
  });

  it("extracts target role, skills, and workplace mode from natural prompt", () => {
    const prompt = "Looking for remote product designer internships with strong focus on Figma and Design Systems";
    const analysis = analyzePrompt(prompt);

    expect(analysis.isWithinLimit).toBe(true);
    expect(analysis.extractedRole).toBe("Product Designer");
    expect(analysis.extractedWorkplaceType).toBe("Remote");
    expect(analysis.extractedSkills).toContain("Figma");
    expect(analysis.extractedSkills).toContain("Design Systems");
  });

  it("scores matching opportunities higher based on user prompt", () => {
    const prompt = "Remote Product Designer at SigNoz or HighLevel with interactive prototyping and developer tools";
    const signozOpp = MOCK_OPPORTUNITIES.find((o) => o.company === "SigNoz")!;
    const diagridOpp = MOCK_OPPORTUNITIES.find((o) => o.company === "Diagrid")!;

    const signozScore = scoreOpportunityWithPrompt(signozOpp, prompt);
    const diagridScore = scoreOpportunityWithPrompt(diagridOpp, prompt);

    expect(signozScore.score).toBeGreaterThan(diagridScore.score);
    expect(signozScore.isMatched).toBe(true);
    expect(signozScore.matchReasons.length).toBeGreaterThan(0);
  });

  it("overwrites candidate profile when 'overwrite profile' option is applied", () => {
    const prompt = "I want to transition to a Frontend Engineer role focusing on TypeScript and React in Bengaluru";
    const updatedProfile = overwriteProfileFromPrompt(INITIAL_STUDENT_PROFILE, prompt);

    expect(updatedProfile.targetRole).toBe("Frontend Engineer");
    expect(updatedProfile.skills).toContain("TypeScript");
    expect(updatedProfile.skills).toContain("React");
    expect(updatedProfile.preferredLocation).toBe("Bengaluru");
    expect(updatedProfile.promptOverwriteRole).toBe(true);
  });
});
