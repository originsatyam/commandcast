export type WorkflowStatus =
  | "READY"
  | "RUNNING"
  | "WAITING_FOR_USER"
  | "FAILED"
  | "COMPLETED";

export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export type InternshipStatus = "Saved" | "Applied" | "Interviewing" | "Rejected" | "Archived";

export interface InternshipRecord {
  id: string;
  url: string;
  title: string;
  company: string;
  location?: string;
  savedAt: string;
  status: InternshipStatus;
  notes?: string;
  isDemo?: boolean;
}

export interface DemoProfile {
  fullName: string;
  email: string;
  phone?: string;
  university?: string;
  course?: string;
  graduationYear?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export interface WorkflowStepDefinition {
  id: string;
  label: string;
  description: string;
  sensitive?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerPhrases: string[];
  targetPageName: string;
  targetViewId: ActiveTab;
  steps: WorkflowStepDefinition[];
  requiresConfirmation: boolean;
  notes?: string;
}

export interface WorkflowStepResult {
  id: string;
  label: string;
  status: StepStatus;
  message?: string;
  timestamp?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  finishedAt?: string;
  status: WorkflowStatus;
  steps: WorkflowStepResult[];
  error?: string;
  triggeredBy: "voice" | "text" | "click";
  targetUrl?: string;
}

export type ActiveTab =
  | "dashboard"
  | "tracker"
  | "tinyfish"
  | "demo-listing"
  | "demo-application"
  | "profile"
  | "activity";

export interface SpeechRecognitionStatus {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error?: string;
  permissionState: "prompt" | "granted" | "denied" | "unsupported";
}
