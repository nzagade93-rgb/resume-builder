import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Resume } from "@/types/resume";
import type { StoredResumeItem, VersionSnapshot, JobApplication } from "@/types/database";
import { STORAGE_KEY_V2 } from "@/lib/migration";
import { STORAGE_KEY_VERSIONS } from "@/context/ResumeContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ==========================================
// STORAGE KEYS FOR GUEST & LOCAL PERSISTENCE
// ==========================================
export const STORAGE_KEY_RESUMES_LIST = "resume_builder_resumes_list_v2";
export const STORAGE_KEY_SNAPSHOTS = "resume_builder_snapshots_v2";
export const STORAGE_KEY_APPLICATIONS = "resume_builder_job_apps_v2";
export const STORAGE_KEY_USER_PROFILE = "resume_builder_guest_profile_v2";

/**
 * Load all stored resumes from localStorage
 */
export function loadStoredResumes(): StoredResumeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load stored resumes:", err);
  }
  return [];
}

/**
 * Save stored resumes to localStorage
 */
export function saveStoredResumes(resumes: StoredResumeItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_RESUMES_LIST, JSON.stringify(resumes));
  } catch (err) {
    console.error("Failed to save resumes:", err);
  }
}

/**
 * Load automatic version snapshots
 */
export function loadSnapshots(): VersionSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load snapshots:", err);
  }
  return [];
}

/**
 * Record an automatic version snapshot
 */
export function recordSnapshot(
  resume: Resume,
  title: string,
  description = "Manual revision snapshot"
): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadSnapshots();
    const newSnapshot: VersionSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      resumeId: resume.basics.name || "primary",
      timestamp: new Date().toISOString(),
      title,
      description,
      resumeSnapshot: JSON.parse(JSON.stringify(resume)),
    };
    // Keep last 25 snapshots
    const updated = [newSnapshot, ...current].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to record version snapshot:", err);
  }
}

/**
 * Load Job Applications
 */
export function loadApplications(): JobApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load applications:", err);
  }
  return [];
}

/**
 * Save Job Applications
 */
export function saveApplications(apps: JobApplication[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  } catch (err) {
    console.error("Failed to save applications:", err);
  }
}

/**
 * Rule 4 & 5: Export all user data as clean JSON
 */
export function exportAllUserDataJson(): string {
  if (typeof window === "undefined") return "{}";

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    primaryResume: localStorage.getItem(STORAGE_KEY_V2)
      ? JSON.parse(localStorage.getItem(STORAGE_KEY_V2)!)
      : null,
    tailoredVersions: localStorage.getItem(STORAGE_KEY_VERSIONS)
      ? JSON.parse(localStorage.getItem(STORAGE_KEY_VERSIONS)!)
      : [],
    savedResumes: loadStoredResumes(),
    versionSnapshots: loadSnapshots(),
    jobApplications: loadApplications(),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Non-negotiable Rule 4: "Delete all my data"
 * Purges all cloud rows (if logged in) and destroys all local storage keys immediately.
 */
export async function deleteAllUserData(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. If Supabase is active and user is authenticated, purge cloud data
  if (supabase && isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("job_applications").delete().eq("user_id", user.id);
        await supabase.from("resume_versions").delete().eq("user_id", user.id);
        await supabase.from("resumes").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Cloud purge warning:", err);
    }
  }

  // 2. Clear all local storage keys
  localStorage.removeItem(STORAGE_KEY_V2);
  localStorage.removeItem(STORAGE_KEY_VERSIONS);
  localStorage.removeItem(STORAGE_KEY_RESUMES_LIST);
  localStorage.removeItem(STORAGE_KEY_SNAPSHOTS);
  localStorage.removeItem(STORAGE_KEY_APPLICATIONS);
  localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
}
