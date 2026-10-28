import type { Resume, ResumeVersion } from "./resume";

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DbResume {
  id: string;
  userId: string;
  title: string;
  template: string;
  resumeData: Resume;
  createdAt: string;
  updatedAt: string;
}

export interface DbResumeVersion {
  id: string;
  resumeId: string;
  userId: string;
  name: string;
  company: string;
  role: string;
  versionData: Resume;
  diffs: any[];
  coverLetter?: string;
  createdAt: string;
}

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export interface JobApplication {
  id: string;
  userId?: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  linkedResumeId?: string;
  linkedResumeTitle?: string;
  salaryRange?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredResumeItem {
  id: string;
  title: string;
  role: string;
  template: string;
  updatedAt: string;
  resume: Resume;
  versionsCount: number;
}

export interface VersionSnapshot {
  id: string;
  resumeId: string;
  timestamp: string;
  title: string;
  description: string;
  resumeSnapshot: Resume;
}
