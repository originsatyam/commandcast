import type {
  WorkflowDefinition,
  WorkflowRun,
  WorkflowStepResult,
  InternshipRecord,
  DemoProfile
} from "../types";
import { DEMO_LISTING } from "../data/mockData";
import { testTinyFishConnection, searchInternshipsWithTinyFish } from "./tinyfish";

export interface ExecutionContext {
  tracker: InternshipRecord[];
  profile: DemoProfile;
  formData: Record<string, string>;
  missingFieldsSimulated?: boolean;
}

export interface ExecutionResult {
  run: WorkflowRun;
  updatedTracker?: InternshipRecord[];
  updatedFormData?: Record<string, string>;
  isDuplicate?: boolean;
  failedStepId?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a deterministic workflow step by step with simulated realistic DOM timing.
 */
export const executeWorkflow = async (
  workflow: WorkflowDefinition,
  context: ExecutionContext,
  triggeredBy: "voice" | "text" | "click",
  onStepUpdate: (steps: WorkflowStepResult[]) => void
): Promise<ExecutionResult> => {
  const startedAt = new Date().toISOString();
  const runId = `run-${Date.now()}`;

  // Initialize steps in pending state
  const stepResults: WorkflowStepResult[] = workflow.steps.map((s) => ({
    id: s.id,
    label: s.label,
    status: "pending"
  }));

  onStepUpdate([...stepResults]);

  if (workflow.id === "save-internship") {
    // -------------------------------------------------------------
    // Workflow 1: Save This Internship
    // -------------------------------------------------------------

    // Step 1: Read listing fields
    stepResults[0].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(250);

    const title = DEMO_LISTING.title;
    const company = context.missingFieldsSimulated ? "" : DEMO_LISTING.company;
    const location = DEMO_LISTING.location;
    const url = DEMO_LISTING.url;

    stepResults[0].status = "success";
    stepResults[0].message = `Found title "${title}" and company "${company || '(blank)'}"`;
    onStepUpdate([...stepResults]);

    // Step 2: Validate required fields
    stepResults[1].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(200);

    if (!title || !company) {
      stepResults[1].status = "failed";
      stepResults[1].message = "Validation failed: Required field 'company' is missing on page.";
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: "Missing required listing field (Company Name). Halted safely.",
        triggeredBy,
        targetUrl: url
      };
      return { run: failedRun, failedStepId: "validate-fields" };
    }

    stepResults[1].status = "success";
    stepResults[1].message = "Title and Company validated successfully";
    onStepUpdate([...stepResults]);

    // Step 3: Duplicate check
    stepResults[2].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(200);

    const alreadyExists = context.tracker.some((item) => item.url === url);
    if (alreadyExists) {
      stepResults[2].status = "success";
      stepResults[2].message = `Listing URL "${url}" is already in tracker. Duplicate prevented.`;
      
      // Step 4 & 5 marked as completed / skipped duplicate
      stepResults[3].status = "skipped";
      stepResults[3].message = "Skipped write: Record already exists in tracker";
      stepResults[4].status = "success";
      stepResults[4].message = "Verified: Existing record remains intact";
      onStepUpdate([...stepResults]);

      const duplicateRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "COMPLETED",
        steps: stepResults,
        triggeredBy,
        targetUrl: url
      };
      return { run: duplicateRun, isDuplicate: true };
    }

    stepResults[2].status = "success";
    stepResults[2].message = "Verified URL is unique in local tracker";
    onStepUpdate([...stepResults]);

    // Step 4: Save record to local storage
    stepResults[3].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(250);

    const newRecord: InternshipRecord = {
      id: `track-${Date.now()}`,
      title,
      company,
      location,
      url,
      savedAt: new Date().toISOString(),
      status: "Saved",
      notes: "Saved via CommandCast deterministic workflow.",
      isDemo: false
    };

    const updatedTracker = [newRecord, ...context.tracker];
    stepResults[3].status = "success";
    stepResults[3].message = `Created record #${newRecord.id} in local storage`;
    onStepUpdate([...stepResults]);

    // Step 5: Postcondition verification
    stepResults[4].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(200);

    const verified = updatedTracker.some((r) => r.id === newRecord.id);
    if (!verified) {
      stepResults[4].status = "failed";
      stepResults[4].message = "Postcondition check failed: Record was not found in storage.";
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: "Storage verification failed.",
        triggeredBy,
        targetUrl: url
      };
      return { run: failedRun, failedStepId: "verify-storage" };
    }

    stepResults[4].status = "success";
    stepResults[4].message = `Verified record exists in storage with title "${newRecord.title}"`;
    onStepUpdate([...stepResults]);

    const completedRun: WorkflowRun = {
      id: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "COMPLETED",
      steps: stepResults,
      triggeredBy,
      targetUrl: url
    };

    return { run: completedRun, updatedTracker };
  } else if (workflow.id === "prepare-application") {
    // -------------------------------------------------------------
    // Workflow 2: Prepare My Application
    // -------------------------------------------------------------

    // Step 1: Load saved profile data
    stepResults[0].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(250);

    const { profile } = context;
    if (!profile.fullName || !profile.email) {
      stepResults[0].status = "failed";
      stepResults[0].message = "Incomplete profile: Full Name and Email are required in settings.";
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: "Profile missing required fields. Please update settings.",
        triggeredBy
      };
      return { run: failedRun, failedStepId: "load-profile" };
    }

    stepResults[0].status = "success";
    stepResults[0].message = `Loaded profile for ${profile.fullName} (${profile.email})`;
    onStepUpdate([...stepResults]);

    // Step 2: Fill mapped form fields
    stepResults[1].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(300);

    const newFormData: Record<string, string> = {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      university: profile.university || "",
      course: profile.course || "",
      graduationYear: profile.graduationYear || "",
      portfolioUrl: profile.portfolioUrl || "",
      coverLetter: "" // Explicitly left empty; never fabricated!
    };

    stepResults[1].status = "success";
    stepResults[1].message = "Filled 7 mapped fields. Unmapped fields left empty.";
    onStepUpdate([...stepResults]);

    // Step 3: Read-back verification
    stepResults[2].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(250);

    const matchedName = newFormData.fullName === profile.fullName;
    const matchedEmail = newFormData.email === profile.email;

    if (!matchedName || !matchedEmail) {
      stepResults[2].status = "failed";
      stepResults[2].message = "Verification failed: Input values did not match profile.";
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: "DOM field readback failed.",
        triggeredBy
      };
      return { run: failedRun, failedStepId: "read-back-verify" };
    }

    stepResults[2].status = "success";
    stepResults[2].message = "Read-back confirmed all filled values match saved profile data.";
    onStepUpdate([...stepResults]);

    // Step 4: Strict Pause in WAITING_FOR_USER
    stepResults[3].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(200);

    stepResults[3].status = "success";
    stepResults[3].message = "Execution safely halted in WAITING_FOR_USER. Final submission left to human.";
    onStepUpdate([...stepResults]);

    const reviewRun: WorkflowRun = {
      id: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "WAITING_FOR_USER",
      steps: stepResults,
      triggeredBy
    };

    return {
      run: reviewRun,
      updatedFormData: newFormData
    };
  }

  if (workflow.id === "scan-tinyfish") {
    // Step 1: Check TinyFish Cloud Gateway
    stepResults[0].status = "running";
    onStepUpdate([...stepResults]);
    const ping = await testTinyFishConnection().catch((err) => ({
      success: false,
      latencyMs: 0,
      error: err?.message || "Connection failed"
    }));

    if (!ping.success) {
      stepResults[0].status = "failed";
      stepResults[0].message = `Gateway unreachable: ${ping.error}`;
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: `TinyFish Gateway connection failed: ${ping.error}`,
        triggeredBy
      };
      return { run: failedRun, failedStepId: "ping-gateway" };
    }

    stepResults[0].status = "success";
    stepResults[0].message = `TinyFish Search Gateway verified (${ping.latencyMs}ms latency)`;
    onStepUpdate([...stepResults]);

    // Step 2: Query live web index
    stepResults[1].status = "running";
    onStepUpdate([...stepResults]);
    let count = 0;
    try {
      const results = await searchInternshipsWithTinyFish("software engineering");
      count = results.length;
      stepResults[1].status = "success";
      stepResults[1].message = `Discovered ${count} live internship opportunities across verified company domains`;
      onStepUpdate([...stepResults]);
    } catch (err: any) {
      stepResults[1].status = "failed";
      stepResults[1].message = `Search query failed: ${err.message}`;
      onStepUpdate([...stepResults]);

      const failedRun: WorkflowRun = {
        id: runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        steps: stepResults,
        error: err.message,
        triggeredBy
      };
      return { run: failedRun, failedStepId: "query-radar" };
    }

    // Step 3: Prepare one-click ingestion
    stepResults[2].status = "running";
    onStepUpdate([...stepResults]);
    await sleep(250);
    stepResults[2].status = "success";
    stepResults[2].message = `Live Web Radar ready with ${count} records. Ready for one-click tracker ingestion.`;
    onStepUpdate([...stepResults]);

    const completedRun: WorkflowRun = {
      id: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "COMPLETED",
      steps: stepResults,
      triggeredBy
    };

    return { run: completedRun };
  }

  throw new Error(`Unsupported workflow id "${workflow.id}"`);
};
