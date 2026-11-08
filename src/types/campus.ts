export type WorkplaceType = "Remote" | "Hybrid" | "In-Office";

export type OpportunityCategory = "Internship" | "Hackathon" | "Fellowship" | "New Grad";

export type ApplicationStage = "Saved" | "Applied" | "Interviewing" | "Offer" | "Closed";

export interface OpportunityListing {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  logoLetter: string;
  logoBg: string;
  logoUrl?: string;
  location: string;
  workplaceType: WorkplaceType;
  category: OpportunityCategory;
  stipend: string;
  degreesEligible: string[];
  yearsEligible: string[];
  batchesEligible: string[];
  allowedBranches: string[];
  minCgpa?: number;
  skills: string[];
  deadline: string; // ISO date string
  verifiedDate: string; // ISO date string
  verifiedBy: string;
  directApplyUrl: string;
  sourcePlatform: "Official Careers Portal" | "Greenhouse ATS" | "Lever ATS" | "Ashby ATS" | "Workday" | "Direct ATS Requisition";
  description: string;
  eligibilityHighlights: string[];
  selectionStages: string[];
  trustScore: number; // e.g. 98%
  requisitionId?: string;
  remoteIndiaStatus?: "india-eligible" | "worldwide-remote" | "india-hybrid" | "geo-restricted";
  remoteIndiaDetails?: {
    canWorkFromIndia: boolean;
    contractType: string;
    timezoneOverlap: string;
    payrollSupport: string;
    proofNotes: string;
  };
  verificationProof?: {
    verifiedWith: string;
    isSpecificRequisition: boolean;
    redirectDetected: boolean;
    finalResolvedUrl: string;
    statusCode: number;
    activeStatus: "Active Requisition" | "Redirected" | "Closed";
    lastChecked: string;
    verdict: string;
  };
}

export interface StudentProfile {
  name: string;
  targetRole?: string; // Type of job being sought (e.g. "Product Designer", "Software Engineer")
  preferredLocation: string;
  skills: string[];
  college?: string;
  degree?: string;
  branch?: string;
  yearOfStudy?: string;
  graduationBatch?: string;
  cgpa?: number;
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeUploadedDate?: string;
  resumeParsed?: boolean;
  customPrompt?: string; // Natural-language personalized crawler & match prompt (up to 2000 words)
  promptOverwriteRole?: boolean; // When true, prompt actively overwrites candidate role/skills
}

export interface TrackerApplication {
  id: string;
  opportunityId: string;
  opportunity: OpportunityListing;
  status: ApplicationStage;
  savedAt: string;
  appliedAt?: string;
  notes?: string;
  deadlineReminderSet: boolean;
}

export interface FilterState {
  searchQuery: string;
  degree: string;
  yearOfStudy: string;
  location: string;
  category: string;
  onlyEligible: boolean;
  sortBy: "deadline" | "recent" | "stipend";
}

export type CampusTab = "radar" | "tracker" | "profile" | "comparison";
