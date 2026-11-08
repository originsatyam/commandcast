# CommandCast — MVP Product Requirements Document (PRD)

**Document status:** Prototype-ready draft  
**Version:** 0.1  
**Product type:** Browser-based prototype / Chrome extension  
**Primary build environment:** Google Antigravity IDE  
**Product principle:** Make a small set of useful browser workflows easy to trigger by voice and dependable enough to trust.

---

## 1. Product summary

CommandCast lets a user trigger a **predefined, saved browser workflow** by speaking a command or clicking a button. It executes known steps on supported pages, shows progress, verifies outcomes where possible, and pauses for human review before sensitive or irreversible actions.

The MVP is deliberately **not** a general-purpose AI agent. It will not interpret arbitrary instructions or promise to automate every website. It uses deterministic command matching and predefined workflow steps. Speech recognition may use a browser or operating-system speech API; this is not the same as using an LLM API, but availability and privacy vary by browser.

### Prototype example

A student is viewing a supported internship listing and says:

> “Save this internship.”

CommandCast reads only the fields it knows how to identify on the supported demo page, adds the listing to a local application tracker, and shows a success state. A second workflow can fill a demo application form with saved profile details, then **pause for review**. It must not submit the application automatically.

### MVP hypothesis

A narrow workflow that is easy to set up and visibly verifies its results may be more useful than a broad automation tool that often fails.

This is a hypothesis to test, not a validated market fact.

---

## 2. Problem and target user

### Initial target user

College students and recent graduates who repeatedly save internship opportunities and prepare applications.

### Problem to investigate

Application preparation can involve repetitive actions: capturing a listing, copying details into a tracker, opening a form, and entering profile information. We need to learn whether users find this repetitive enough to adopt a new tool and whether the prototype saves meaningful time.

### Jobs to be done

- When I find an opportunity, I want to save its details without switching between multiple tools.
- When I prepare an application, I want known profile information filled consistently.
- I want to see what the tool did and review important actions before anything is submitted.

### Non-goals

- Automating arbitrary websites.
- Natural-language reasoning powered by an LLM.
- Automatically submitting job or internship applications.
- Bypassing CAPTCHA, anti-bot systems, login controls, or website restrictions.
- Controlling arbitrary native desktop applications.
- Storing passwords, session cookies, or authentication secrets.
- Building a public workflow marketplace, team collaboration, payments, or a mobile app in v0.1.

---

## 3. Product scope

Build the smallest testable prototype in two stages.

### Stage A — reliable local web prototype

Build this first if browser-extension development slows you down.

- A responsive dashboard.
- A demo internship listing page.
- A demo application form.
- A local application tracker.
- A fixed list of commands with click-to-run controls.
- A workflow activity log and clear success/failure states.
- Optional voice input behind a feature check; all workflows must remain testable by clicking buttons.

This stage validates the workflow and interface, but **does not prove real-world browser automation**.

### Stage B — Chrome extension proof of concept

Only after Stage A works:

- Chrome extension popup or side panel.
- Content script for a small, explicitly supported set of pages.
- Commands that run against the active supported page.
- DOM-based field detection and action verification.
- Explicit permission scope and clear user initiation.

Do not start with a complex recorder, arbitrary-site support, or background automation. Use a manually defined workflow first.

---

## 4. Core user flow

1. User opens CommandCast.
2. User selects a saved workflow or triggers it with a supported voice phrase.
3. CommandCast checks that the current page matches the workflow’s supported page.
4. It shows the planned actions before starting.
5. User confirms the run.
6. The workflow executes step by step.
7. Each step is marked as completed, failed, or waiting for the user.
8. The tool verifies the outcome where possible.
9. It reports the final result and offers retry or resume when safe.
10. For application preparation, it stops before final submission and asks the user to review manually.

### Example workflow: Save internship

**Trigger phrases**
- “Save this internship”
- “Add this internship to my tracker”

**Preconditions**
- User is on the demo internship listing page.
- The listing has a title and company name.

**Steps**
1. Read the listing title, company, location, and listing URL from known page elements.
2. Validate required fields.
3. Check whether the same listing URL is already saved.
4. If new, add it to local storage; if already saved, show “Already saved” without creating a duplicate.
5. Verify that the record exists in the tracker.
6. Show a result summary.

**Success criteria**
- Correct title and company appear in the tracker.
- Repeating the command does not create duplicates.
- If required data is missing, the workflow stops and explains why.

### Example workflow: Prepare application

**Trigger phrases**
- “Prepare my application”
- “Fill my demo application”

**Preconditions**
- User is on the demo application form.
- User has provided profile details in settings.

**Steps**
1. Fill only fields explicitly mapped in the workflow.
2. Do not invent missing data.
3. Read back field values and verify them.
4. Pause in `WAITING_FOR_USER` state.
5. Display “Review your application. Submit it yourself when ready.”

**Success criteria**
- Known fields contain the saved values.
- Missing fields remain empty and are clearly identified.
- The submit button is never clicked by CommandCast.

---

## 5. Functional requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | Dashboard | P0 | User can see available workflows, run history, and saved internships. |
| FR-02 | Click-to-run workflows | P0 | Every MVP workflow can be started without voice. |
| FR-03 | Fixed command matching | P0 | Only registered phrases trigger a workflow; unknown phrases produce a helpful unsupported-command message. |
| FR-04 | Voice input | P1 | If browser speech recognition is supported and permission is granted, recognized text is shown before execution. |
| FR-05 | User confirmation | P0 | The user sees the workflow and planned actions before execution. |
| FR-06 | Step progress | P0 | Each step visibly transitions through pending, running, success, or failure. |
| FR-07 | Save internship | P0 | Listing fields are saved to a local tracker with duplicate protection. |
| FR-08 | Prepare demo application | P0 | Known profile fields are filled, verified, and left for manual review. |
| FR-09 | Activity log | P0 | Each run records start time, steps, outcome, and a useful error message. |
| FR-10 | Failure handling | P0 | A failed precondition or missing field stops the workflow safely. |
| FR-11 | Local persistence | P0 | Saved records and profile details persist after refresh using browser local storage or IndexedDB. |
| FR-12 | Clear data | P0 | User can delete saved tracker data and profile details. |
| FR-13 | Accessibility | P1 | Controls are keyboard accessible, labels are visible, and status is not conveyed by color alone. |
| FR-14 | Chrome extension | P2 | Only build after the local prototype validates the flow. |

P0 = required for the first testable prototype. P1 = desirable if straightforward. P2 = defer until the first stage is tested.

---

## 6. Voice and command behavior

Voice is a convenience layer, not the workflow engine.

### Command pipeline

1. Capture speech through a supported speech API.
2. Display the recognized text to the user.
3. Normalize case, whitespace, and punctuation.
4. Match against an explicit command registry.
5. If exactly one command matches, show its planned workflow.
6. Require confirmation before actions begin.
7. If no command matches, offer the supported phrases.
8. If the match is ambiguous, ask the user to choose; do not guess.

### Constraints

- Do not send audio or text to an LLM.
- Do not add an LLM dependency or require an API key.
- Do not silently execute on a low-confidence or unrecognized phrase.
- Provide a visible click-to-run alternative if speech recognition is unavailable.
- Explain that browser speech recognition may depend on browser/vendor services and may not be fully offline. Do not claim local-only voice processing unless it is verified.

---

## 7. UX requirements

### Main dashboard

Show:
- Product name and short explanation.
- Voice input control with listening/permission/error states.
- Text field for testing a command without a microphone.
- Available workflows with “Preview” and “Run” actions.
- Recent run history.
- Saved internship tracker.
- Profile settings for demo application fields.
- Clear-data action.

### Workflow preview

Before execution, show:
- Workflow name.
- Supported page/site.
- List of planned steps.
- Any data that will be written.
- A clear “Confirm and run” and “Cancel” action.

### Run status

Use explicit states:
- `READY`
- `RUNNING`
- `WAITING_FOR_USER`
- `FAILED`
- `COMPLETED`

Show progress per step and an understandable reason when blocked. Never show success just because a click happened; verify the resulting state.

### Visual direction

Aim for a polished, calm, Gen Z-friendly productivity product—not a toy or a sci-fi AI dashboard.

- Clean layout, generous spacing, clear hierarchy.
- Strong typography and restrained accent colors.
- Use a consistent icon set (for example, Lucide) rather than emoji icons.
- Clear cards and status indicators.
- Responsive layout for laptop and mobile-width browser windows.
- Avoid fake analytics, fake testimonials, or claims of time saved before measuring them.

---

## 8. Technical approach

Use the stack that the builder is most comfortable with, but keep the prototype simple. A reasonable default is:

- React + TypeScript + Vite.
- CSS modules, Tailwind, or an existing component library—choose one, not several.
- Browser `localStorage` or IndexedDB for prototype persistence.
- Browser SpeechRecognition / `webkitSpeechRecognition` when available, with feature detection and a text-input fallback.
- A deterministic workflow registry and typed workflow state machine.
- Vitest or the project’s existing test framework for command matching, duplicate prevention, and workflow state transitions.

No backend is required for Stage A. Do not add accounts, cloud sync, analytics services, or API keys until there is a clear need.

### Suggested data models

```ts
type WorkflowStatus =
  | "READY"
  | "RUNNING"
  | "WAITING_FOR_USER"
  | "FAILED"
  | "COMPLETED";

type InternshipRecord = {
  id: string;
  url: string;
  title: string;
  company: string;
  location?: string;
  savedAt: string;
  status: "Saved" | "Applied" | "Rejected" | "Archived";
};

type DemoProfile = {
  fullName: string;
  email: string;
  phone?: string;
  university?: string;
  course?: string;
  graduationYear?: string;
  portfolioUrl?: string;
};

type WorkflowStepResult = {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  message?: string;
};

type WorkflowRun = {
  id: string;
  workflowId: string;
  startedAt: string;
  finishedAt?: string;
  status: WorkflowStatus;
  steps: WorkflowStepResult[];
  error?: string;
};
```

### Architecture

```text
Dashboard / Voice / Text Command
               |
               v
     Command Normalizer + Matcher
               |
               v
       Workflow Registry
               |
               v
     Preconditions + Confirmation
               |
               v
      Deterministic Step Runner
               |
        +------+------+
        |             |
        v             v
   Demo Page DOM   Local Storage
        |             |
        +------+------+
               |
               v
    Postcondition Verification
               |
               v
      Activity Log + UI Result
```

For Stage A, demo pages are part of the same application, so the workflow can interact with known elements directly. For Stage B, use a content script and site-specific adapters. Do not rely on screen coordinates or fragile timing-based clicks.

---

## 9. Safety, privacy, and reliability

- All workflow execution must be user initiated.
- Preview and confirmation are required before running a workflow.
- Do not submit applications or perform other irreversible actions.
- Do not bypass CAPTCHA, anti-bot controls, or access restrictions.
- Do not store passwords, session cookies, or tokens.
- Store only the profile fields required by the demo; provide a clear delete-data control.
- Validate page identity and required fields before acting.
- Verify important changes after each step.
- Use duplicate protection for “save” operations.
- On failure, stop rather than guessing or continuing through unknown page states.
- Keep logs useful but avoid recording unnecessary personal data.
- Do not claim a workflow succeeded unless the postcondition is verified.

---

## 10. Acceptance test checklist

### Internship tracker
- [ ] Save a listing with all required fields.
- [ ] Confirm the correct title, company, URL, and saved time appear.
- [ ] Run the same command twice and confirm no duplicate record is created.
- [ ] Remove a record and confirm it stays removed after refresh.
- [ ] Missing title or company causes a safe failure with an explanation.

### Demo application preparation
- [ ] Save profile details and refresh the app.
- [ ] Fill mapped form fields with the exact saved values.
- [ ] Leave missing profile fields empty and report them.
- [ ] Verify filled values by reading the fields back.
- [ ] Stop in `WAITING_FOR_USER`.
- [ ] Confirm the workflow never clicks the submit button.

### Command handling
- [ ] Every registered phrase maps to the intended workflow.
- [ ] Unknown phrases do not trigger any action.
- [ ] Ambiguous phrases ask the user to choose.
- [ ] Voice permission denial leaves click and text input usable.
- [ ] Unsupported speech recognition displays a clear fallback.

### Failure behavior
- [ ] Missing required page element stops execution.
- [ ] A failed step does not mark the run as completed.
- [ ] Retry does not create duplicate tracker entries.
- [ ] The activity log explains the outcome.

---

## 11. Prototype evaluation plan

Test with 5–10 students first. Observe them using the prototype; do not only ask whether they like the idea.

Ask them to:
1. Save an internship listing.
2. Find it in the tracker.
3. Enter profile information.
4. Prepare a demo application.
5. Explain where they trust or distrust the automation.

Measure:
- Workflow completion rate.
- Number of user interventions.
- Time to save a listing versus their current method.
- Incorrect or duplicated records.
- Whether they use the workflow again without prompting.
- Which step they expected the product to handle but it could not.

Suggested early quality gate—not an industry benchmark:
- At least 9 of 10 repeated runs of the supported demo workflow complete correctly in controlled tests.
- Zero unintended application submissions.
- No duplicate records after repeated save commands.
- Users understand the preview, progress, and failure messages without coaching.

Do not optimize for a high demo success rate alone. Ask whether the workflow solves a frequent enough problem that users would return to it.

---

## 12. Build plan for Antigravity

Give Antigravity one milestone at a time. Do not ask it to build the entire product in one enormous prompt.

### Milestone 1 — scaffold and dashboard

- Create the app using React + TypeScript + Vite, unless an existing repository dictates otherwise.
- Build the dashboard, workflow cards, tracker panel, profile settings, and activity log.
- Use local persistence.
- Use mock/demo data clearly labelled as demo data.
- Make the app run and fix build/type errors.

### Milestone 2 — deterministic workflow engine

- Add typed workflow definitions and states.
- Implement command normalization and exact/alias matching.
- Implement “Save this internship” with required-field validation and duplicate protection.
- Add precondition/postcondition checks and per-step logs.
- Add unit tests.

### Milestone 3 — demo application workflow

- Build a demo application form with mapped profile fields.
- Implement fill, read-back verification, and `WAITING_FOR_USER`.
- Ensure the submit button cannot be clicked by the workflow runner.
- Add tests for missing profile data and the review state.

### Milestone 4 — voice input

- Add browser speech recognition only if supported.
- Show recognized text before workflow execution.
- Require the user to confirm the selected workflow.
- Keep text and click controls fully functional without a microphone.

### Milestone 5 — usability and test pass

- Test every acceptance criterion.
- Fix broken states, duplicate actions, and confusing error messages.
- Verify persistence after refresh.
- Add a simple reset/clear-data option.
- Write a README with setup, run, and test commands.

### Milestone 6 — optional extension spike

Only after the local prototype works, explore a Chrome extension with one explicitly supported test page. Do not promise universal website support.

---

## 13. Copy/paste build prompt for Antigravity

Use this prompt to start the project. Then provide the milestone prompts below one at a time.

```text
You are acting as a pragmatic senior product engineer. Build the CommandCast MVP described in the PRD.

First inspect the existing workspace and report its current stack and files. If it is empty, scaffold React + TypeScript + Vite. Do not overwrite useful existing work without explaining why.

Build only Milestone 1 first: a polished responsive dashboard with workflow cards, a demo internship tracker, demo profile settings, and activity log. Use localStorage for persistence. Use demo data and clearly label it. No backend, no accounts, no LLM, no external AI API, no paid API, and no API keys.

Use accessible controls, a consistent icon library rather than emoji icons, clear empty/loading/error/success states, and a calm modern productivity aesthetic. Keep components small and typed. Do not fake completed automation: workflow buttons may preview the planned steps until Milestone 2 implements them.

After implementation:
1. Run the available build and type checks.
2. Fix errors rather than merely listing them.
3. Summarize files changed and how to run the app.
4. State any limitations honestly.
Do not start Milestone 2 until Milestone 1 builds successfully.
```

### Follow-up prompt: Milestone 2

```text
Implement Milestone 2 from the CommandCast PRD. Add a typed deterministic workflow registry, command normalization, exact/alias matching, workflow preview and confirmation, and the “Save this internship” workflow. Use only the app's demo listing page and localStorage. Validate required fields, prevent duplicates by canonical URL, verify the saved record after writing, and log each step. Unknown commands must do nothing. Add tests for matching, missing fields, duplicate saves, and state transitions. No LLM or external AI APIs. Run tests and build; fix failures before reporting completion.
```

### Follow-up prompt: Milestone 3

```text
Implement Milestone 3 from the CommandCast PRD. Add the demo application form and profile settings. The “Prepare my application” workflow may fill only explicitly mapped fields from saved profile data. Read the fields back to verify them, report missing data, and finish in WAITING_FOR_USER. The workflow runner must never click or submit the form. Add tests proving that submission is not triggered and that missing profile values are not invented. Run tests and build; fix failures.
```

### Follow-up prompt: Milestone 4

```text
Implement optional voice input for CommandCast. Feature-detect browser speech recognition; do not assume it exists or is offline. Display recognized text and require explicit user confirmation before executing a matched workflow. Keep text input and click-to-run available if permission is denied or speech recognition is unsupported. Only registered commands may run. Do not add an LLM, external AI API, or API key. Test the fallback and unknown-command behavior, then run build and tests.
```

### Follow-up prompt: Milestone 5

```text
Run a quality pass against the CommandCast PRD acceptance checklist. Test persistence after refresh, duplicate prevention, safe failure on missing fields, workflow logs, keyboard accessibility, responsive layout, and the no-submit guarantee. Fix defects in the code, not just in the report. Add or update README instructions. Run build and tests and report what passed, what failed, and any remaining limitations honestly.
```

---

## 14. Definition of done

The first prototype is done when:
- It runs locally from documented instructions.
- The tracker persists after refresh.
- “Save this internship” works reliably on the demo listing.
- “Prepare my application” fills only mapped profile fields and pauses for review.
- Unknown commands do nothing.
- Failures are visible and understandable.
- The workflow log reflects verified outcomes.
- Automated tests cover core command and workflow logic.
- No LLM or paid API is required.
- The app does not automatically submit applications.

**Important:** Build the local web prototype first. It tests whether the workflow concept is understandable and useful. A later Chrome extension tests whether the same workflow can work reliably on real supported pages. Those are separate experiments; success in the demo does not prove the extension will work on arbitrary websites.


: sk-tinyfish-your-api-key-here

tinyfish Check how to use this to make it the best possible. It is a good product. thinker and builder ok ok mor bhai ux and ui key liye 

Brother, using this is necessary; it's fine to use it. This is very important. 
[text](design)

[text](design/inspo_ai_mcp_config.json)[text](design/inspo_mcp_config.json)
[text](design/shadcn_mcp_config.json)
[text](design/ui_skills_config.json)

[text](cognitive-biases-and-psychology-principles.skill.md)
[text](<Motion and Transition.md>)

optimized smooth fast