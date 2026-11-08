import type { OpportunityListing, StudentProfile } from "../types/campus";

export const MAX_PROMPT_WORDS = 2000;

export interface PromptAnalysisResult {
  wordCount: number;
  isWithinLimit: boolean;
  extractedRole?: string;
  extractedSkills: string[];
  extractedLocation?: string;
  extractedWorkplaceType?: "Remote" | "Hybrid" | "In-Office";
  extractedMinStipend?: number;
  keywords: string[];
}

export interface PromptMatchScore {
  score: number; // 0 to 100
  isMatched: boolean;
  matchReasons: string[];
}

/**
 * Accurately count words across whitespace, line breaks, and punctuation.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Truncates text strictly to maxWords (2000 words limit) if exceeded.
 */
export function enforceWordLimit(text: string, maxWords = MAX_PROMPT_WORDS): {
  text: string;
  wordCount: number;
  exceeded: boolean;
} {
  const words = text.trim().match(/\S+/g) || [];
  const wordCount = words.length;

  if (wordCount <= maxWords) {
    return { text, wordCount, exceeded: false };
  }

  const truncatedText = words.slice(0, maxWords).join(" ");
  return { text: truncatedText, wordCount: maxWords, exceeded: true };
}

/**
 * Parses user's personalized natural language prompt to extract target roles, skills, and constraints.
 */
export function analyzePrompt(promptText: string): PromptAnalysisResult {
  const wordCount = countWords(promptText);
  const isWithinLimit = wordCount <= MAX_PROMPT_WORDS;

  if (!promptText || !promptText.trim()) {
    return {
      wordCount: 0,
      isWithinLimit: true,
      extractedSkills: [],
      keywords: []
    };
  }

  const lower = promptText.toLowerCase();

  // 1. Role extraction
  let extractedRole: string | undefined;
  if (/product design|product designer/i.test(lower)) {
    extractedRole = "Product Designer";
  } else if (/design system|design systems/i.test(lower)) {
    extractedRole = "Design Systems Designer";
  } else if (/ui\/ux|ui ux|ux designer|interaction design/i.test(lower)) {
    extractedRole = "UI/UX Designer";
  } else if (/frontend|front-end|ui engineer/i.test(lower)) {
    extractedRole = "Frontend Engineer";
  } else if (/software engineer|swe|backend/i.test(lower)) {
    extractedRole = "Software Engineer";
  }

  // 2. Skill dictionary matching
  const KNOWN_SKILLS = [
    "Figma", "Design Systems", "UI/UX Design", "Prototyping", "User Research",
    "Wireframing", "Interaction Design", "Visual Design", "TypeScript", "React",
    "CSS", "HTML", "Micro-interactions", "Typography", "Gamification Design",
    "Data Visualization", "Information Architecture", "Keyboard UX"
  ];

  const extractedSkills: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lower)) {
      extractedSkills.push(skill);
    }
  }

  // 3. Workplace & Location
  let extractedWorkplaceType: "Remote" | "Hybrid" | "In-Office" | undefined;
  let extractedLocation: string | undefined;

  if (/\bremote\b|\bworldwide\b|\banywhere\b|\bwork from home\b/i.test(lower)) {
    extractedWorkplaceType = "Remote";
    extractedLocation = "Remote";
  } else if (/\bhybrid\b/i.test(lower)) {
    extractedWorkplaceType = "Hybrid";
  } else if (/\bin-office\b|\bonsite\b|\bon-site\b/i.test(lower)) {
    extractedWorkplaceType = "In-Office";
  }

  if (/\bbengaluru\b|\bbangalore\b/i.test(lower)) {
    extractedLocation = "Bengaluru";
  } else if (/\bdelhi\b|\bncr\b/i.test(lower)) {
    extractedLocation = "Delhi NCR";
  } else if (/\bhyderabad\b/i.test(lower)) {
    extractedLocation = "Hyderabad";
  }

  // 4. Tokenized keywords (for fuzzy matching)
  const rawWords = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "are", "have", "you", "should", "want", "like", "will", "can", "also"]);
  const keywords = Array.from(new Set(rawWords.filter((w) => !stopWords.has(w))));

  return {
    wordCount,
    isWithinLimit,
    extractedRole,
    extractedSkills,
    extractedLocation,
    extractedWorkplaceType,
    keywords
  };
}

/**
 * Overwrite Mode: Derives an updated StudentProfile from the prompt.
 */
export function overwriteProfileFromPrompt(
  currentProfile: StudentProfile,
  promptText: string
): StudentProfile {
  const analysis = analyzePrompt(promptText);

  const updatedRole = analysis.extractedRole || currentProfile.targetRole;
  const mergedSkills = analysis.extractedSkills.length > 0
    ? Array.from(new Set([...analysis.extractedSkills, ...(currentProfile.skills || [])]))
    : currentProfile.skills;

  const updatedLocation = analysis.extractedLocation || currentProfile.preferredLocation;

  return {
    ...currentProfile,
    targetRole: updatedRole,
    skills: mergedSkills,
    preferredLocation: updatedLocation,
    customPrompt: promptText,
    promptOverwriteRole: true
  };
}

/**
 * Evaluates an opportunity against the user's custom prompt.
 */
export function scoreOpportunityWithPrompt(
  opp: OpportunityListing,
  promptText: string
): PromptMatchScore {
  if (!promptText || !promptText.trim()) {
    return { score: 100, isMatched: true, matchReasons: ["Standard radar index"] };
  }

  const analysis = analyzePrompt(promptText);
  let score = 20; // base score
  const matchReasons: string[] = [];

  const oppText = [
    opp.title,
    opp.company,
    opp.description,
    opp.workplaceType,
    opp.location,
    ...opp.skills,
    ...opp.eligibilityHighlights
  ].join(" ").toLowerCase();

  // Company specific mention (+20)
  if (promptText.toLowerCase().includes(opp.company.toLowerCase())) {
    score += 20;
    matchReasons.push(`Target company match: ${opp.company}`);
  }

  // Role alignment (+25)
  if (analysis.extractedRole) {
    const roleToken = analysis.extractedRole.toLowerCase().split(" ")[0];
    if (oppText.includes(roleToken)) {
      score += 25;
      matchReasons.push(`Matches role constraint: "${analysis.extractedRole}"`);
    }
  }

  // Workplace alignment (+20)
  if (analysis.extractedWorkplaceType) {
    if (opp.workplaceType.toLowerCase() === analysis.extractedWorkplaceType.toLowerCase()) {
      score += 20;
      matchReasons.push(`Matches workplace preference: ${analysis.extractedWorkplaceType}`);
    } else if (analysis.extractedWorkplaceType === "Remote" && opp.workplaceType !== "Remote") {
      score -= 20;
    }
  }

  // Skill matches (+10 per matched skill, max +30)
  let matchedSkillCount = 0;
  for (const sk of analysis.extractedSkills) {
    if (opp.skills.some((os) => os.toLowerCase() === sk.toLowerCase()) || oppText.includes(sk.toLowerCase())) {
      matchedSkillCount++;
      score += 10;
    }
  }
  if (matchedSkillCount > 0) {
    matchReasons.push(`Matches ${matchedSkillCount} specified tool/skills from prompt`);
  }

  // Keyword overlap
  let keywordHits = 0;
  for (const kw of analysis.keywords.slice(0, 15)) {
    if (oppText.includes(kw)) {
      keywordHits++;
    }
  }
  if (keywordHits >= 2) {
    score += Math.min(15, keywordHits * 3);
    matchReasons.push(`Aligns with prompt requirements (${keywordHits} matching points)`);
  }

  const finalScore = Math.min(100, Math.max(10, score));
  const isMatched = finalScore >= 60;

  return {
    score: finalScore,
    isMatched,
    matchReasons: matchReasons.length > 0 ? matchReasons : ["Partial match to prompt brief"]
  };
}
