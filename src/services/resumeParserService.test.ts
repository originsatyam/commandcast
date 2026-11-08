import { describe, it, expect } from "vitest";
import { parseResumeFile } from "./resumeParserService";

describe("resumeParserService", () => {
  it("extracts candidate name and Product Designer skills from Satyam_Manik_Product_Designer_CV.pdf", async () => {
    const file = new File(
      ["Design portfolio Figma user experience prototypes"],
      "Satyam_Manik_Product_Designer_CV.pdf",
      { type: "application/pdf" }
    );

    const result = await parseResumeFile(file);

    expect(result.name).toBe("Satyam Manik");
    expect(result.degree).toBe("B.Des");
    expect(result.roleTitle).toBe("Product Designer");
    expect(result.skills).toContain("Figma");
    expect(result.skills).toContain("Design Systems");
    expect(result.skills).toContain("UI/UX Design");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("extracts candidate name and software engineering profile from Aarav_Sharma_Engineering_CV.pdf", async () => {
    const file = new File(
      ["Engineering CV Python React TypeScript"],
      "Aarav_Sharma_Engineering_CV.pdf",
      { type: "application/pdf" }
    );

    const result = await parseResumeFile(file);

    expect(result.name).toBe("Aarav Sharma");
    expect(result.degree).toBe("B.Tech");
    expect(result.roleTitle).toBe("Software Engineer");
    expect(result.skills).toContain("TypeScript");
    expect(result.skills).toContain("React");
  });

  it("identifies Data/AI role from candidate filename", async () => {
    const file = new File(
      ["AI Vision PyTorch Deep Learning"],
      "Priya_Rao_Machine_Learning_Intern_Resume.pdf",
      { type: "application/pdf" }
    );

    const result = await parseResumeFile(file);

    expect(result.name).toBe("Priya Rao");
    expect(result.roleTitle).toBe("Machine Learning Researcher");
    expect(result.skills).toContain("PyTorch");
    expect(result.skills).toContain("Machine Learning");
  });
});

