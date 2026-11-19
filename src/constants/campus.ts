/**
 * Campus Radar Architecture Constants
 * Extracted for zero object re-allocation, fast lookups, and clean code principles.
 */

export const TINYFISH_DEFAULT_KEY = (import.meta.env?.VITE_TINYFISH_API_KEY as string) || "";

export const API_ENDPOINTS = {
  TINYFISH_SEARCH: "https://api.search.tinyfish.ai",
  TINYFISH_FETCH: "https://api.fetch.tinyfish.ai"
} as const;

export const CACHE_TTL_MS = 1000 * 60 * 15; // 15-minute in-memory cache TTL

export const STORAGE_KEYS = {
  PROFILE: "campus_radar_profile_v1",
  TRACKER: "campus_radar_tracker_v1",
  THEME: "campus_radar_theme",
  LIVE_CACHE: "campus_radar_tinyfish_cache_v1"
} as const;

export const FILTER_OPTIONS = {
  YEARS: ["All", "1st Year", "2nd Year", "3rd Year", "Final Year"] as const,
  DEGREES: ["All", "B.Tech", "B.Des", "B.E.", "B.S.", "BCA", "MCA"] as const,
  MODES: ["All", "Remote", "Hybrid", "In-Office"] as const,
  CATEGORIES: ["All", "Internship", "Hackathon", "Fellowship"] as const,
  STAGES: ["Saved", "Applied", "Interviewing", "Offer"] as const
} as const;

export const DEFAULT_SEARCH_TERMS = [
  "Software Engineering Intern 2027",
  "Research Intern Computer Science",
  "Product Engineering Intern",
  "Systems Engineering Intern",
  "Campus Challenge Hackathon 2027"
] as const;

