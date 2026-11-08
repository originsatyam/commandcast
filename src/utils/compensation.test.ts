import { describe, it, expect } from "vitest";
import { normalizeCompensation } from "./compensation";

describe("normalizeCompensation", () => {
  it("normalizes monthly INR stipends correctly", () => {
    const res = normalizeCompensation("₹75,000/month");
    expect(res.currency).toBe("INR");
    expect(res.monthlyInrEstimated).toBe(75000);
    expect(res.displayFormatted).toBe("₹75,000/month");
    expect(res.annualEstimateFormatted).toContain("9.0 LPA");
  });

  it("normalizes monthly USD stipends with INR conversion", () => {
    const res = normalizeCompensation("$4,000/month");
    expect(res.currency).toBe("USD");
    expect(res.monthlyInrEstimated).toBeGreaterThan(300000);
    expect(res.displayFormatted).toContain("$4,000/mo");
    expect(res.annualEstimateFormatted).toContain("$48k / year");
    expect(res.taxNote).toContain("FIRC");
  });

  it("normalizes hourly USD wages to monthly equivalent", () => {
    const res = normalizeCompensation("$35/hr");
    expect(res.currency).toBe("USD");
    expect(res.monthlyInrEstimated).toBeGreaterThan(400000);
    expect(res.annualEstimateFormatted).toContain("year");
  });

  it("handles missing or unformatted strings gracefully", () => {
    const res = normalizeCompensation(undefined);
    expect(res.displayFormatted).toBe("Competitive");
  });
});
