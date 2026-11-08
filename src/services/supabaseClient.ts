import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OpportunityListing, StudentProfile, TrackerApplication, ApplicationStage } from "../types/campus";
import { MOCK_OPPORTUNITIES } from "../data/mockOpportunities";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch verified opportunities from Supabase (with fallback to mock listings)
 */
export async function getOpportunities(): Promise<OpportunityListing[]> {
  if (!supabase) {
    return MOCK_OPPORTUNITIES;
  }

  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("is_active", true)
      .order("deadline", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch returned empty or error, using verified cache:", error?.message);
      return MOCK_OPPORTUNITIES;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      logoLetter: row.logo_letter || row.company.slice(0, 2).toUpperCase(),
      logoBg: row.logo_bg || "#E7EDFC",
      location: row.location,
      workplaceType: row.workplace_type,
      category: row.category,
      stipend: row.stipend,
      degreesEligible: row.degrees_eligible || [],
      yearsEligible: row.years_eligible || [],
      batchesEligible: row.batches_eligible || [],
      allowedBranches: row.allowed_branches || [],
      minCgpa: row.min_cgpa,
      skills: row.skills || [],
      deadline: row.deadline,
      verifiedDate: row.verified_date,
      verifiedBy: row.verified_by,
      directApplyUrl: row.direct_apply_url,
      sourcePlatform: row.source_platform,
      description: row.description,
      eligibilityHighlights: row.eligibility_highlights || [],
      selectionStages: row.selection_stages || [],
      trustScore: row.trust_score || 98
    }));
  } catch (err) {
    console.error("Failed to query Supabase opportunities:", err);
    return MOCK_OPPORTUNITIES;
  }
}

/**
 * Sync Student Profile to Supabase (secured by RLS)
 */
export async function syncProfileToSupabase(profile: StudentProfile, userId?: string): Promise<boolean> {
  if (!supabase || !userId) return false;

  try {
    const profilePayload: Record<string, any> = {
      user_id: userId,
      name: profile.name,
      college: profile.college || "National Institute of Design (NID)",
      degree: profile.degree || "B.Des",
      branch: profile.branch || "Interaction & Product Design",
      year_of_study: profile.yearOfStudy || "3rd Year",
      graduation_batch: profile.graduationBatch || "2027",
      cgpa: profile.cgpa ?? 8.0,
      preferred_location: profile.preferredLocation || "Remote",
      skills: profile.skills || [],
      resume_file_name: profile.resumeFileName,
      resume_file_size: profile.resumeFileSize,
      resume_parsed: profile.resumeParsed,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "user_id" });

    if (error) {
      console.warn("Profile sync error on Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase profile sync failed:", err);
    return false;
  }
}

/**
 * Fetch candidate profile from Supabase for a given user
 */
export async function fetchUserProfile(userId: string): Promise<StudentProfile | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      name: data.name,
      targetRole: data.target_role || (data.skills?.some((s: string) => /design|figma|ui/i.test(s)) ? "Product Designer" : "Software Engineer"),
      college: data.college,
      degree: data.degree,
      branch: data.branch,
      yearOfStudy: data.year_of_study,
      graduationBatch: data.graduation_batch,
      cgpa: Number(data.cgpa) || 8.0,
      preferredLocation: data.preferred_location || "Remote",
      skills: data.skills || [],
      resumeFileName: data.resume_file_name,
      resumeFileSize: data.resume_file_size,
      resumeParsed: data.resume_parsed
    };
  } catch (err) {
    console.warn("Failed to fetch user profile:", err);
    return null;
  }
}

/**
 * Fetch user applications from Supabase
 */
export async function fetchUserApplications(
  userId: string,
  allOpportunities: OpportunityListing[]
): Promise<TrackerApplication[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });

    if (error || !data) return [];

    const oppMap = new Map(allOpportunities.map((o) => [o.id, o]));

    return data
      .map((row: any) => {
        const opp = oppMap.get(row.opportunity_id);
        if (!opp) return null;
        return {
          id: row.id,
          opportunityId: row.opportunity_id,
          opportunity: opp,
          status: row.status as ApplicationStage,
          savedAt: row.saved_at,
          appliedAt: row.applied_at || undefined,
          notes: row.notes || "",
          deadlineReminderSet: row.deadline_reminder_set ?? true
        };
      })
      .filter(Boolean) as TrackerApplication[];
  } catch (err) {
    console.warn("Failed to fetch user applications from Supabase:", err);
    return [];
  }
}

/**
 * Save / Update application record in Supabase
 */
export async function saveApplicationToSupabase(
  userId: string,
  opportunityId: string,
  status: ApplicationStage,
  notes = ""
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("applications").upsert(
      {
        user_id: userId,
        opportunity_id: opportunityId,
        status,
        notes,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,opportunity_id" }
    );

    return !error;
  } catch (err) {
    console.warn("Failed to save application to Supabase:", err);
    return false;
  }
}

/**
 * Remove application record from Supabase
 */
export async function removeApplicationFromSupabase(userId: string, opportunityId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId);

    return !error;
  } catch (err) {
    console.warn("Failed to remove application from Supabase:", err);
    return false;
  }
}

/**
 * Upload Resume file to Supabase Storage bucket 'resumes'
 */
export async function uploadResumeToSupabaseStorage(file: File): Promise<string | null> {
  if (!supabase) return null;

  try {
    const filePath = `resumes/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.warn("Supabase storage upload error:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    return data.publicUrl || null;
  } catch (err) {
    console.warn("Failed to upload resume to Supabase storage:", err);
    return null;
  }
}
