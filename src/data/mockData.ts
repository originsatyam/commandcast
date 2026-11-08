import type { WorkflowDefinition, InternshipRecord, DemoProfile, WorkflowRun } from "../types";

export const DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "save-internship",
    name: "Save this internship",
    description: "Reads key listing details from the active demo opportunity page, checks for duplicates, and records it in your local tracker.",
    triggerPhrases: [
      "Save this internship",
      "Add this internship to my tracker",
      "Save internship"
    ],
    targetPageName: "Demo Internship Listing",
    targetViewId: "demo-listing",
    requiresConfirmation: true,
    steps: [
      {
        id: "read-dom",
        label: "Identify and read listing fields",
        description: "Scans for job title, company name, location, and canonical listing URL."
      },
      {
        id: "validate-fields",
        label: "Validate required fields",
        description: "Ensures title and company exist; halts safely if required data is absent."
      },
      {
        id: "duplicate-check",
        label: "Check duplicate protection",
        description: "Verifies whether this listing URL already exists in local storage."
      },
      {
        id: "save-record",
        label: "Save record to local storage",
        description: "Appends the verified opportunity into your local tracker."
      },
      {
        id: "verify-storage",
        label: "Postcondition verification",
        description: "Reads back the stored entry to prove it exists before marking success."
      }
    ],
    notes: "Requires being on a supported internship listing page."
  },
  {
    id: "prepare-application",
    name: "Prepare my application",
    description: "Fills known student profile details into the demo application form, verifies the input values, and pauses for your manual review.",
    triggerPhrases: [
      "Prepare my application",
      "Fill my demo application",
      "Fill application form"
    ],
    targetPageName: "Demo Application Form",
    targetViewId: "demo-application",
    requiresConfirmation: true,
    steps: [
      {
        id: "load-profile",
        label: "Retrieve saved profile data",
        description: "Loads your name, email, phone, and university details from local settings."
      },
      {
        id: "map-fill-fields",
        label: "Fill mapped form fields",
        description: "Inputs only known fields. Does not guess or fabricate missing data."
      },
      {
        id: "read-back-verify",
        label: "Verify field values",
        description: "Reads back DOM values to verify they match saved profile data."
      },
      {
        id: "pause-review",
        label: "Pause in WAITING_FOR_USER state",
        description: "Strict safety guarantee: stops before final submission for human review.",
        sensitive: true
      }
    ],
    notes: "Safety rule: CommandCast will never automatically click 'Submit Application'."
  },
  {
    id: "scan-tinyfish",
    name: "Scan live web with TinyFish",
    description: "Queries TinyFish Live Web Radar and Chromium Extractors to discover real-time internship openings across tech companies.",
    triggerPhrases: [
      "Scan live web with TinyFish",
      "Search internships with TinyFish",
      "Find internships online",
      "Scan web for internships"
    ],
    targetPageName: "TinyFish Web Radar",
    targetViewId: "tinyfish",
    requiresConfirmation: false,
    steps: [
      {
        id: "ping-gateway",
        label: "Check TinyFish Cloud Gateway",
        description: "Validates connection latency and API credentials with api.search.tinyfish.ai."
      },
      {
        id: "query-radar",
        label: "Query live web index",
        description: "Fetches live US engineering opportunities without hallucination."
      },
      {
        id: "ingest-pipeline",
        label: "Prepare one-click ingestion",
        description: "Enables instant saving and auto-extraction directly into local tracker."
      }
    ],
    notes: "Powered by TinyFish Search & Fetch API."
  }
];

export const INITIAL_PROFILE: DemoProfile = {
  fullName: "Aarav Sharma",
  email: "aarav.sharma@stanford.alumni.edu",
  phone: "+1 (415) 555-0192",
  university: "Stanford University",
  course: "B.S. Computer Science & Human-Computer Interaction",
  graduationYear: "2027",
  portfolioUrl: "https://aarav-sharma.dev",
  githubUrl: "https://github.com/aaravsharma"
};

export const INITIAL_TRACKER: InternshipRecord[] = [
  {
    id: "track-1",
    title: "Frontend Engineering Intern",
    company: "Vanguard Robotics",
    location: "San Francisco, CA (Onsite)",
    url: "https://careers.vanguardrobotics.demo/jobs/fe-intern-2027",
    savedAt: "2026-10-25T14:20:00.000Z",
    status: "Saved",
    notes: "Requires React, TypeScript, and state machines experience.",
    isDemo: true
  },
  {
    id: "track-2",
    title: "AI & Human Interface Research Intern",
    company: "HyperScale Labs",
    location: "Seattle, WA (Hybrid)",
    url: "https://hyperscalelabs.demo/careers/hci-intern",
    savedAt: "2026-10-26T09:15:00.000Z",
    status: "Applied",
    notes: "Demo application prepared and submitted manually.",
    isDemo: true
  },
  {
    id: "track-3",
    title: "Systems Software Engineer Intern",
    company: "Nova Dynamics",
    location: "Remote (US)",
    url: "https://novadynamics.demo/positions/sys-intern",
    savedAt: "2026-10-24T18:45:00.000Z",
    status: "Saved",
    notes: "Applied via college career portal.",
    isDemo: true
  }
];

export const DEMO_LISTING = {
  title: "Product Engineering Intern - Web Systems",
  company: "Apex Automations Inc.",
  location: "Austin, TX (Hybrid)",
  url: "https://internships.demo.commandcast/apex-product-eng-2027",
  stipend: "$48 / hour + housing allowance",
  term: "Summer 2027 (12 weeks)",
  department: "Developer Experience & Agentic Workflows",
  description: "As a Product Engineering Intern at Apex Automations, you will design and test deterministic browser automation and user experience workflows. You will collaborate closely with product managers and interaction designers to turn repetitive multi-step actions into trustworthy, one-click or voice-initiated experiences.",
  requirements: [
    "Pursuing a degree in Computer Science, HCI, or related technical field",
    "Experience with modern web standards (React, TypeScript, DOM APIs)",
    "Interest in human-in-the-loop automation and safe interaction design",
    "Curiosity about reliable command normalization and browser extensions"
  ]
};

export const INITIAL_ACTIVITY_LOG: WorkflowRun[] = [
  {
    id: "run-demo-1",
    workflowId: "save-internship",
    workflowName: "Save this internship",
    startedAt: "2026-10-26T11:02:14.000Z",
    finishedAt: "2026-10-26T11:02:16.200Z",
    status: "COMPLETED",
    triggeredBy: "click",
    targetUrl: "https://careers.vanguardrobotics.demo/jobs/fe-intern-2027",
    steps: [
      { id: "read-dom", label: "Identify and read listing fields", status: "success", message: "Found title 'Frontend Engineering Intern' and company 'Vanguard Robotics'" },
      { id: "validate-fields", label: "Validate required fields", status: "success", message: "All required fields present" },
      { id: "duplicate-check", label: "Check duplicate protection", status: "success", message: "Listing is new; not previously saved" },
      { id: "save-record", label: "Save record to local storage", status: "success", message: "Created entry in tracker" },
      { id: "verify-storage", label: "Postcondition verification", status: "success", message: "Verified record exists in storage" }
    ]
  },
  {
    id: "run-demo-2",
    workflowId: "prepare-application",
    workflowName: "Prepare my application",
    startedAt: "2026-10-26T11:15:30.000Z",
    finishedAt: "2026-10-26T11:15:33.100Z",
    status: "WAITING_FOR_USER",
    triggeredBy: "text",
    targetUrl: "https://hyperscalelabs.demo/careers/hci-intern/apply",
    steps: [
      { id: "load-profile", label: "Retrieve saved profile data", status: "success", message: "Loaded profile for Aarav Sharma" },
      { id: "map-fill-fields", label: "Fill mapped form fields", status: "success", message: "Filled 6 mapped fields" },
      { id: "read-back-verify", label: "Verify field values", status: "success", message: "All 6 fields match profile data" },
      { id: "pause-review", label: "Pause in WAITING_FOR_USER state", status: "success", message: "Execution paused. Ready for manual review and human submission." }
    ]
  }
];
