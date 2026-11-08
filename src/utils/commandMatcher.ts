import type { WorkflowDefinition } from "../types";
import { DEFAULT_WORKFLOWS } from "../data/mockData";

export interface MatchResult {
  type: "exact" | "alias" | "ambiguous" | "unsupported";
  workflow?: WorkflowDefinition;
  ambiguousMatches?: WorkflowDefinition[];
  normalizedQuery: string;
  originalQuery: string;
  explanation: string;
}

/**
 * Normalizes user input by lowercasing, stripping punctuation, and trimming extra spaces.
 */
export const normalizeCommand = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Evaluates whether a normalized query matches any registered trigger phrase
 */
export const matchCommand = (
  rawQuery: string,
  workflows: WorkflowDefinition[] = DEFAULT_WORKFLOWS
): MatchResult => {
  const normalized = normalizeCommand(rawQuery);

  if (!normalized) {
    return {
      type: "unsupported",
      normalizedQuery: "",
      originalQuery: rawQuery,
      explanation: "Please enter or speak a command to match."
    };
  }

  // 1. Direct exact match against any trigger phrase
  const directMatches: WorkflowDefinition[] = [];

  for (const wf of workflows) {
    const hasExact = wf.triggerPhrases.some(
      (phrase) => normalizeCommand(phrase) === normalized
    );
    if (hasExact) {
      directMatches.push(wf);
    }
  }

  if (directMatches.length === 1) {
    return {
      type: "exact",
      workflow: directMatches[0],
      normalizedQuery: normalized,
      originalQuery: rawQuery,
      explanation: `Matched registered workflow: "${directMatches[0].name}"`
    };
  }

  if (directMatches.length > 1) {
    return {
      type: "ambiguous",
      ambiguousMatches: directMatches,
      normalizedQuery: normalized,
      originalQuery: rawQuery,
      explanation: `Found multiple matching workflows for "${rawQuery}". Please select one.`
    };
  }

  // 2. Keyword/substring containment match
  const keywordMatches: WorkflowDefinition[] = [];
  for (const wf of workflows) {
    const matchedPhrase = wf.triggerPhrases.some((phrase) => {
      const normPhrase = normalizeCommand(phrase);
      return normalized.includes(normPhrase) || normPhrase.includes(normalized);
    });
    if (matchedPhrase) {
      keywordMatches.push(wf);
    }
  }

  if (keywordMatches.length === 1) {
    return {
      type: "alias",
      workflow: keywordMatches[0],
      normalizedQuery: normalized,
      originalQuery: rawQuery,
      explanation: `Matched by phrase similarity to: "${keywordMatches[0].name}"`
    };
  }

  if (keywordMatches.length > 1) {
    return {
      type: "ambiguous",
      ambiguousMatches: keywordMatches,
      normalizedQuery: normalized,
      originalQuery: rawQuery,
      explanation: `Query matches multiple candidate workflows. Please select one explicitly.`
    };
  }

  return {
    type: "unsupported",
    normalizedQuery: normalized,
    originalQuery: rawQuery,
    explanation: `Unknown command "${rawQuery}". Supported commands are: ${workflows
      .map((w) => `"${w.triggerPhrases[0]}"`)
      .join(", ")}.`
  };
};
