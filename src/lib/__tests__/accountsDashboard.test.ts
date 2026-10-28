import fs from "fs";
import path from "path";
import {
  loadStoredResumes,
  saveStoredResumes,
  loadSnapshots,
  recordSnapshot,
  loadApplications,
  saveApplications,
  exportAllUserDataJson,
  deleteAllUserData,
  STORAGE_KEY_RESUMES_LIST,
  STORAGE_KEY_SNAPSHOTS,
  STORAGE_KEY_APPLICATIONS,
} from "../supabase/client";
import { sampleResume } from "@/types/resume";
import type { JobApplication, StoredResumeItem } from "@/types/database";

// Setup in-memory localStorage for Node testing environment
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
// Polyfill global window & localStorage
(global as any).window = global;
(global as any).localStorage = mockLocalStorage;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log("Running Phase 8 Accounts, Persistence & Dashboard Unit Tests...\n");

// 1. SQL Migrations & Strict RLS Security Verification
const sqlPath = path.resolve(process.cwd(), "supabase/migrations/001_init.sql");
assert(fs.existsSync(sqlPath), "Supabase migration 001_init.sql exists");

const sqlContent = fs.readFileSync(sqlPath, "utf-8");
assert(sqlContent.includes("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;"), "Enables RLS on profiles table");
assert(sqlContent.includes("ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;"), "Enables RLS on resumes table");
assert(sqlContent.includes("ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;"), "Enables RLS on resume_versions table");
assert(sqlContent.includes("ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;"), "Enables RLS on job_applications table");
assert(sqlContent.includes("auth.uid() = user_id"), "Enforces user_id ownership match in RLS policies");
assert(sqlContent.includes("ON DELETE CASCADE"), "Configures cascade deletion when account/profile is erased");

// 2. Multi-Resume Library Persistence
mockLocalStorage.clear();
assert(loadStoredResumes().length === 0, "Initial stored resumes list is empty");

const mockItem: StoredResumeItem = {
  id: "res-test-1",
  title: "Alex Morgan - Cloud Architect",
  role: "Cloud Architect",
  template: "Modern",
  updatedAt: new Date().toISOString(),
  resume: sampleResume,
  versionsCount: 1,
};

saveStoredResumes([mockItem]);
const loadedResumes = loadStoredResumes();
assert(loadedResumes.length === 1, "Persists and loads stored resume");
assert(loadedResumes[0].title === "Alex Morgan - Cloud Architect", "Preserves stored resume title");

// Safe corrupted fallback
mockLocalStorage.setItem(STORAGE_KEY_RESUMES_LIST, "{ corrupted JSON");
assert(loadStoredResumes().length === 0, "Corrupted localStorage gracefully falls back to empty array");

// 3. Automated Version Snapshots
mockLocalStorage.clear();
recordSnapshot(sampleResume, "Revision 1", "Created initial profile");
recordSnapshot(sampleResume, "Revision 2", "Added Kubernetes experience");

const snapshots = loadSnapshots();
assert(snapshots.length === 2, "Records version snapshots sequentially");
assert(snapshots[0].title === "Revision 2", "Latest snapshot appears first (LIFO order)");
assert(snapshots[0].resumeSnapshot.basics.name === sampleResume.basics.name, "Deep snapshot clone integrity preserved");

// Snapshot cap test
for (let i = 0; i < 30; i++) {
  recordSnapshot(sampleResume, `Auto Snapshot ${i}`);
}
assert(loadSnapshots().length <= 25, "Enforces 25 snapshot history cap to protect quota");

// 4. Job Applications Persistence & Tracker
mockLocalStorage.clear();
assert(loadApplications().length === 0, "Applications tracker starts empty");

const testApps: JobApplication[] = [
  {
    id: "app-101",
    company: "Stripe",
    role: "Staff Engineer",
    status: "interviewing",
    appliedDate: "2026-10-25",
    linkedResumeTitle: "Stripe Tailored",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "app-102",
    company: "Linear",
    role: "Product Engineer",
    status: "applied",
    appliedDate: "2026-10-24",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

saveApplications(testApps);
const loadedApps = loadApplications();
assert(loadedApps.length === 2, "Saves job application items");
assert(loadedApps[0].company === "Stripe", "Preserves application company name");
assert(loadedApps[1].status === "applied", "Preserves application stage status");

// 5. Non-Negotiable Rule 4: Data Export & Purge All My Data
recordSnapshot(sampleResume, "Pre-export test");
const exportJson = exportAllUserDataJson();
assert(typeof exportJson === "string", "Exports all user data as string");

const parsedBundle = JSON.parse(exportJson);
assert(Boolean(parsedBundle.exportedAt), "Export bundle includes timestamp");
assert(Array.isArray(parsedBundle.jobApplications), "Export bundle includes job applications");
assert(Array.isArray(parsedBundle.versionSnapshots), "Export bundle includes version snapshots");
assert(parsedBundle.jobApplications.length === 2, "Includes all saved job applications in export");

// Delete All My Data Purge
(async () => {
  await deleteAllUserData();
  assert(loadSnapshots().length === 0, "Delete All Data destroys all snapshots");
  assert(loadStoredResumes().length === 0, "Delete All Data destroys all saved resumes");
  assert(loadApplications().length === 0, "Delete All Data destroys all tracked job applications");
  assert(mockLocalStorage.getItem(STORAGE_KEY_RESUMES_LIST) === null, "Removes storage key for resumes list");
  assert(mockLocalStorage.getItem(STORAGE_KEY_SNAPSHOTS) === null, "Removes storage key for snapshots");
  assert(mockLocalStorage.getItem(STORAGE_KEY_APPLICATIONS) === null, "Removes storage key for applications");

  console.log("\nAll Phase 8 tests passed successfully! ✓\n");
})();
