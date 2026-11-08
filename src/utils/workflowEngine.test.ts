import { describe, it, expect } from "vitest";
import { executeWorkflow } from "./workflowEngine";
import { DEFAULT_WORKFLOWS, INITIAL_TRACKER, INITIAL_PROFILE, DEMO_LISTING } from "../data/mockData";

describe("Deterministic Workflow Engine", () => {
  it("executes 'Save this internship' and returns updated tracker with new record", async () => {
    const saveWf = DEFAULT_WORKFLOWS.find((w) => w.id === "save-internship")!;
    const emptyTracker = INITIAL_TRACKER.filter((r) => r.url !== DEMO_LISTING.url);

    const result = await executeWorkflow(
      saveWf,
      {
        tracker: emptyTracker,
        profile: INITIAL_PROFILE,
        formData: {}
      },
      "click",
      () => {}
    );

    expect(result.run.status).toBe("COMPLETED");
    expect(result.updatedTracker).toBeDefined();
    expect(result.updatedTracker?.length).toBe(emptyTracker.length + 1);
    expect(result.updatedTracker?.[0].title).toBe(DEMO_LISTING.title);
    expect(result.updatedTracker?.[0].company).toBe(DEMO_LISTING.company);
  });

  it("prevents duplicate record creation when listing is already saved", async () => {
    const saveWf = DEFAULT_WORKFLOWS.find((w) => w.id === "save-internship")!;
    const alreadySavedTracker = [
      {
        id: "existing-1",
        title: DEMO_LISTING.title,
        company: DEMO_LISTING.company,
        url: DEMO_LISTING.url,
        savedAt: new Date().toISOString(),
        status: "Saved" as const
      }
    ];

    const result = await executeWorkflow(
      saveWf,
      {
        tracker: alreadySavedTracker,
        profile: INITIAL_PROFILE,
        formData: {}
      },
      "voice",
      () => {}
    );

    expect(result.isDuplicate).toBe(true);
    expect(result.run.status).toBe("COMPLETED");
    expect(result.updatedTracker).toBeUndefined(); // Did not modify tracker
  });

  it("stops safely with FAILED status when required company is missing", async () => {
    const saveWf = DEFAULT_WORKFLOWS.find((w) => w.id === "save-internship")!;

    const result = await executeWorkflow(
      saveWf,
      {
        tracker: [],
        profile: INITIAL_PROFILE,
        formData: {},
        missingFieldsSimulated: true // simulates missing company
      },
      "click",
      () => {}
    );

    expect(result.run.status).toBe("FAILED");
    expect(result.failedStepId).toBe("validate-fields");
    expect(result.run.error).toContain("Missing required listing field");
  });

  it("executes 'Prepare my application' and halts safely in WAITING_FOR_USER without submitting", async () => {
    const prepWf = DEFAULT_WORKFLOWS.find((w) => w.id === "prepare-application")!;

    const result = await executeWorkflow(
      prepWf,
      {
        tracker: [],
        profile: INITIAL_PROFILE,
        formData: {}
      },
      "text",
      () => {}
    );

    expect(result.run.status).toBe("WAITING_FOR_USER");
    expect(result.updatedFormData).toBeDefined();
    expect(result.updatedFormData?.fullName).toBe(INITIAL_PROFILE.fullName);
    expect(result.updatedFormData?.email).toBe(INITIAL_PROFILE.email);
    expect(result.updatedFormData?.coverLetter).toBe(""); // unmapped fields remain blank
  });

  it("executes 'Scan live web with TinyFish' workflow and completes with step results", async () => {
    const scanWf = DEFAULT_WORKFLOWS.find((w) => w.id === "scan-tinyfish")!;
    // Mock global fetch for this unit test
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string) => {
      if (url.includes("api.search.tinyfish.ai")) {
        return {
          ok: true,
          json: async () => ({
            results: [
              {
                position: 1,
                title: "Software Engineering Intern - Cloudflare",
                url: "https://careers.cloudflare.com/jobs/intern-1",
                snippet: "Summer 2027 internship"
              }
            ]
          })
        } as any;
      }
      return { ok: false } as any;
    }) as any;

    try {
      const result = await executeWorkflow(
        scanWf,
        {
          tracker: [],
          profile: INITIAL_PROFILE,
          formData: {}
        },
        "voice",
        () => {}
      );

      expect(result.run.status).toBe("COMPLETED");
      expect(result.run.steps.length).toBe(3);
      expect(result.run.steps[0].status).toBe("success");
      expect(result.run.steps[1].status).toBe("success");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
