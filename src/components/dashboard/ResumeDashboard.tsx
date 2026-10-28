"use client";

import React, { useState, useEffect } from "react";
import { useResume } from "@/context/ResumeContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { StoredResumeItem } from "@/types/database";
import type { Resume } from "@/types/resume";
import {
  loadStoredResumes,
  saveStoredResumes,
  recordSnapshot,
  loadApplications,
} from "@/lib/supabase/client";
import { ApplicationTracker } from "./ApplicationTracker";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { SettingsModal } from "./SettingsModal";
import { AuthModal } from "./AuthModal";
import { ImportReviewModal } from "@/components/import/ImportReviewModal";
import { TEMPLATE_REGISTRY } from "@/templates/registry";
import { runAtsChecker } from "@/lib/ats/checker";
import { formatResumeTitle } from "@/lib/schema";

interface ResumeDashboardProps {
  onOpenEditor: () => void;
}

// Helper: resolve template friendly name
function getTemplateName(templateId?: string): string {
  if (!templateId) return "ATS Standard";
  const match = TEMPLATE_REGISTRY.find((t) => t.id === templateId);
  return match?.name || "ATS Standard";
}

// Helper: relative time formatting (e.g. "Edited 2h ago")
function formatRelativeTime(dateInput?: string | number | null): string {
  if (!dateInput) return "Recently edited";
  const date = typeof dateInput === "number" ? new Date(dateInput) : new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Edited ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Edited ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Edited yesterday";
  if (diffDays < 7) return `Edited ${diffDays}d ago`;

  return `Edited ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

// Real miniature document thumbnail preview reflecting actual resume data & layout
const ResumeMiniThumbnail: React.FC<{ resume: Resume }> = ({ resume }) => {
  const accent = resume.meta?.design?.accent || "#2563EB";
  const candidateName = resume.basics.name?.trim() || "Candidate";
  const title = resume.basics.title || resume.basics.headline || "Target Role";
  const experienceCount = resume.experience?.length || 0;
  const skillsCount = resume.skills?.length || 0;
  const isTwoColumn = resume.template === "modern" || resume.template === "split";

  return (
    <div className="w-full aspect-[210/297] rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 select-none flex flex-col justify-between overflow-hidden shadow-2xs group-hover:shadow-md group-hover:scale-[1.01] transition-all duration-200 text-left">
      {/* Top Accent Strip */}
      <div className="w-full h-1 rounded-full shrink-0" style={{ backgroundColor: accent }} />

      {/* Miniature Document Body */}
      {isTwoColumn ? (
        <div className="flex gap-2 flex-1 pt-2">
          {/* Main Column */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
              <div className="text-[10px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {candidateName}
              </div>
              <div className="text-[7px] text-slate-500 dark:text-slate-400 truncate">
                {title}
              </div>
            </div>
            {/* Experience preview */}
            <div className="space-y-1">
              <div className="text-[6px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Experience
              </div>
              <div className="space-y-0.5">
                <div className="h-1 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-0.5 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="h-1 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
          {/* Sidebar Column */}
          <div className="w-1/3 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded space-y-1.5 shrink-0">
            <div className="text-[6px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Skills
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="h-1 w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="h-1 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="h-1 w-3/5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 pt-2 space-y-2">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
            <div className="text-[10px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {candidateName}
            </div>
            <div className="text-[7px] text-slate-500 dark:text-slate-400 truncate">
              {title}
            </div>
            <div className="flex gap-1 mt-1">
              <div className="h-0.5 w-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="h-0.5 w-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="h-0.5 w-10 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <div className="text-[6px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Experience ({experienceCount})
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <div className="h-1 w-14 bg-slate-400 dark:bg-slate-600 rounded-full" />
                <div className="h-0.5 w-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-0.5 w-11/12 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-0.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-0.5 pt-0.5">
              <div className="flex justify-between items-center">
                <div className="h-1 w-12 bg-slate-400 dark:bg-slate-600 rounded-full" />
                <div className="h-0.5 w-5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-0.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <div className="text-[6px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Skills ({skillsCount})
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="h-1.5 w-7 bg-slate-200 dark:bg-slate-800 rounded" />
              <span className="h-1.5 w-9 bg-slate-200 dark:bg-slate-800 rounded" />
              <span className="h-1.5 w-6 bg-slate-200 dark:bg-slate-800 rounded" />
              <span className="h-1.5 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Mini Footer indicator */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[6px] text-slate-400">
        <span>A4 Format</span>
        <span>Vector ATS</span>
      </div>
    </div>
  );
};

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({ onOpenEditor }) => {
  const { resume, setResume, versions, activeVersionId, switchVersion, deleteVersion } = useResume();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"resumes" | "tracker">("resumes");
  const [storedResumes, setStoredResumes] = useState<StoredResumeItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return loadStoredResumes();
    } catch {
      return [];
    }
  });
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Save current resume as a snapshot to stored list
  const handleSaveCurrentToDashboard = () => {
    const defaultTitle = formatResumeTitle(resume.basics.name, "Untitled Resume");
    const newItem: StoredResumeItem = {
      id: `resume-${Date.now()}`,
      title: defaultTitle,
      role: resume.basics.title || "Professional",
      template: resume.meta?.design?.font || "ATS Standard",
      updatedAt: new Date().toISOString(),
      resume: JSON.parse(JSON.stringify(resume)),
      versionsCount: versions.length,
    };

    const updated = [newItem, ...storedResumes];
    setStoredResumes(updated);
    saveStoredResumes(updated);
    recordSnapshot(resume, `${defaultTitle} Dashboard Copy`, "Saved to multi-resume collection");

    toast(`"${newItem.title}" added to your saved resumes library.`, "success");
  };

  // Switch active editor to a stored resume
  const handleLoadResume = (item: StoredResumeItem) => {
    // Record snapshot of current active before switching
    recordSnapshot(resume, "Auto-snapshot before switching resumes");
    setResume(item.resume);
    switchVersion(null);
    toast(`Now editing "${item.title}".`, "info");
    onOpenEditor();
  };

  // Duplicate a resume
  const handleDuplicate = (targetResume: Resume, originalTitle: string) => {
    const dupResume: Resume = JSON.parse(JSON.stringify(targetResume));
    const dupTitle = `${originalTitle} (Copy)`;
    const newItem: StoredResumeItem = {
      id: `resume-${Date.now()}`,
      title: dupTitle,
      role: dupResume.basics.title || "Professional",
      template: dupResume.meta?.design?.font || "ATS Standard",
      updatedAt: new Date().toISOString(),
      resume: dupResume,
      versionsCount: 0,
    };

    const updated = [newItem, ...storedResumes];
    setStoredResumes(updated);
    saveStoredResumes(updated);

    toast(`Created copy: "${dupTitle}"`, "success");
  };

  // Delete stored resume
  const handleDeleteStored = (id: string, title: string) => {
    const updated = storedResumes.filter((r) => r.id !== id);
    setStoredResumes(updated);
    saveStoredResumes(updated);

    toast(`"${title}" was removed from your saved library.`, "info");
  };

  // Rename handlers
  const openRenameModal = (id: string, currentTitle: string) => {
    setRenameTargetId(id);
    setRenameValue(currentTitle);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (!renameValue.trim()) return;

    if (renameTargetId === "primary") {
      const sanitizedName = renameValue.trim().replace(/('s|')?\s*Resume$/i, "").trim();
      setResume({
        ...resume,
        basics: {
          ...resume.basics,
          name: sanitizedName || "Candidate",
        },
      });
      toast("Primary resume title updated.", "success");
    } else {
      const updated = storedResumes.map((r) =>
        r.id === renameTargetId
          ? { ...r, title: renameValue, updatedAt: new Date().toISOString() }
          : r
      );
      setStoredResumes(updated);
      saveStoredResumes(updated);
      toast(`Updated to "${renameValue}"`, "success");
    }

    setIsRenameModalOpen(false);
  };

  // Create brand new blank resume
  const handleNewFromScratch = () => {
    recordSnapshot(resume, "Snapshot before creating new blank resume");
    const blankResume: Resume = {
      schemaVersion: 2,
      basics: {
        name: "New Candidate",
        headline: "Target Role Title",
        title: "Target Role Title",
        email: "candidate@email.com",
        phone: "+1 (555) 000-0000",
        location: "City, Country",
        linkedin: "linkedin.com/in/candidate",
        github: "github.com/candidate",
        portfolio: "candidate.dev",
        summary: "Write a high-impact professional summary highlighting your career achievements.",
      },
      summary: "Write a high-impact professional summary highlighting your career achievements.",
      experience: [
        {
          id: `exp-${Date.now()}`,
          company: "Company Name",
          role: "Role Title",
          location: "Remote",
          start: "2023",
          end: "Present",
          current: true,
          bullets: ["Engineered solutions improving efficiency by 25%."],
        },
      ],
      education: [
        {
          id: `edu-${Date.now()}`,
          school: "University Name",
          degree: "Bachelor of Science",
          field: "Computer Science",
          start: "2018",
          end: "2022",
          year: "2022",
          gpa: "3.8",
        },
      ],
      skills: [
        {
          id: `skill-${Date.now()}`,
          category: "Core Competencies",
          items: ["Core Competency 1", "Core Competency 2", "Technical Skill"],
        },
      ],
      projects: [],
      certifications: [],
      languages: [],
      awards: [],
      volunteering: [],
      publications: [],
      customSections: [],
      meta: {
        pageSize: "A4",
        sectionOrder: ["basics", "summary", "experience", "education", "skills", "projects"],
        hiddenSections: [],
        design: {
          font: "sans",
          fontPairing: "modern-sans",
          accent: "#2563EB",
          fontScale: 1,
          lineHeight: 1.4,
          margins: "normal",
          sectionSpacing: "normal",
          targetPages: 1,
        },
      },
      template: "ats",
      sectionVisibility: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
      },
    };

    setResume(blankResume);
    switchVersion(null);
    toast("Started a fresh blank canvas with standard ATS sections.", "success");
    onOpenEditor();
  };

  const primaryTitle = formatResumeTitle(resume.basics.name, "My Base Resume");

  const [appsCount, setAppsCount] = useState<number>(() => {
    try {
      return loadApplications().length;
    } catch {
      return 0;
    }
  });

  return (
    <div
      className={
        activeTab === "tracker"
          ? "max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6"
          : "max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8"
      }
    >
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {activeTab === "resumes" ? "Resumes Library" : "Job Application Tracker"}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
            {activeTab === "resumes"
              ? "Choose a resume to edit, switch between tailored roles, or create a targeted version."
              : "Track where you applied, linked tailored resumes, interview stages, and offers."}
          </p>
        </div>

        {activeTab === "resumes" && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveCurrentToDashboard}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC] rounded-full text-xs font-medium shadow-2xs transition cursor-pointer flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              title="Save a snapshot copy of current active resume to your library"
            >
              <span>💾</span>
              <span>Save Copy</span>
            </button>
            <button
              type="button"
              onClick={handleNewFromScratch}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full text-xs font-medium shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <span>+</span>
              <span>New Resume</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. SEGMENTED CONTROL */}
      <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold select-none">
        <button
          type="button"
          onClick={() => setActiveTab("resumes")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
            activeTab === "resumes"
              ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
              : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
          }`}
        >
          <span>📄</span>
          <span>All Resumes ({1 + versions.length + storedResumes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
            activeTab === "tracker"
              ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
              : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
          }`}
        >
          <span>💼</span>
          <span>Job Tracker ({appsCount})</span>
        </button>
      </div>

      {/* 3. TAB 1: RESUME DOCUMENT GALLERY */}
      {activeTab === "resumes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD 1: PRIMARY ACTIVE RESUME */}
            {(() => {
              const primaryAts = runAtsChecker(resume).score;
              const templateName = getTemplateName(resume.template);

              return (
                <div
                  onClick={onOpenEditor}
                  className="group p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-md hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#93C5FD] border border-blue-200 dark:border-blue-900/40">
                          Active Base
                        </span>
                      </div>

                      {/* Deterministic ATS Score Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${
                          primaryAts >= 85
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : primaryAts >= 70
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                            : "bg-rose-50 text-[#991B1B] dark:bg-rose-950/60 dark:text-[#FCA5A5] border-rose-200 dark:border-rose-900/40"
                        }`}
                        title={`Deterministic ATS Check Score: ${primaryAts}/100`}
                      >
                        <span>🛡️</span>
                        <span>ATS {primaryAts}/100</span>
                      </span>
                    </div>

                    {/* Real Miniature Document Preview */}
                    <div className="w-full bg-slate-50 dark:bg-[#070B14] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 mb-3.5 flex items-center justify-center overflow-hidden">
                      <ResumeMiniThumbnail resume={resume} />
                    </div>

                    {/* Metadata & Details */}
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition tracking-tight">
                      {primaryTitle}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 truncate">
                      {resume.basics.title || "Target Role Title"}
                    </p>

                    {/* Template name + Last edited time */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                        🎨 {templateName}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono shrink-0">
                        🕒 Active now
                      </span>
                    </div>
                  </div>

                  <div
                    className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={onOpenEditor}
                      className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
                    >
                      Open in Editor →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openRenameModal("primary", primaryTitle)}
                        className="text-xs text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                      >
                        Rename
                      </button>
                      <span className="text-[#94A3B8] text-xs">•</span>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(resume, primaryTitle)}
                        className="text-xs text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAILORED VERSIONS TILES */}
            {versions.map((ver) => {
              const isCurrentActive = activeVersionId === ver.id;
              const verAts = runAtsChecker(ver.tailoredResume).score;
              const templateName = getTemplateName(ver.tailoredResume.template || resume.template);
              const relativeEdited = formatRelativeTime(ver.createdAt);

              return (
                <div
                  key={ver.id}
                  onClick={() => {
                    switchVersion(ver.id);
                    onOpenEditor();
                  }}
                  className={`group p-4 rounded-xl bg-white dark:bg-[#0F172A] border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentActive
                      ? "border-[#2563EB] ring-1 ring-[#2563EB] shadow-sm"
                      : "border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#2563EB]/50 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]">
                          Tailored Variant
                        </span>
                        {ver.matchScore && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                            {ver.matchScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Deterministic ATS Score Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${
                          verAts >= 85
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : verAts >= 70
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                            : "bg-rose-50 text-[#991B1B] dark:bg-rose-950/60 dark:text-[#FCA5A5] border-rose-200 dark:border-rose-900/40"
                        }`}
                        title={`Deterministic ATS Check Score: ${verAts}/100`}
                      >
                        <span>🛡️</span>
                        <span>ATS {verAts}/100</span>
                      </span>
                    </div>

                    {/* Real Miniature Document Preview */}
                    <div className="w-full bg-slate-50 dark:bg-[#070B14] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 mb-3.5 flex items-center justify-center overflow-hidden">
                      <ResumeMiniThumbnail resume={ver.tailoredResume} />
                    </div>

                    {/* Metadata & Details */}
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition tracking-tight">
                      {ver.name}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 truncate">
                      {ver.company} — {ver.role}
                    </p>

                    {/* Template name + Last edited time */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                        🎨 {templateName}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono shrink-0">
                        🕒 {relativeEdited}
                      </span>
                    </div>
                  </div>

                  <div
                    className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        switchVersion(ver.id);
                        onOpenEditor();
                      }}
                      className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
                    >
                      {isCurrentActive ? "Active Now →" : "Switch to Version →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteVersion(ver.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {/* STORED COPIES TILES */}
            {storedResumes.map((item) => {
              const itemAts = runAtsChecker(item.resume).score;
              const templateName = getTemplateName(item.resume.template || item.template);
              const relativeEdited = formatRelativeTime(item.updatedAt);

              return (
                <div
                  key={item.id}
                  onClick={() => handleLoadResume(item)}
                  className="group p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-md hover:border-[#2563EB]/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]">
                        Saved Copy
                      </span>

                      {/* Deterministic ATS Score Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${
                          itemAts >= 85
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : itemAts >= 70
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                            : "bg-rose-50 text-[#991B1B] dark:bg-rose-950/60 dark:text-[#FCA5A5] border-rose-200 dark:border-rose-900/40"
                        }`}
                        title={`Deterministic ATS Check Score: ${itemAts}/100`}
                      >
                        <span>🛡️</span>
                        <span>ATS {itemAts}/100</span>
                      </span>
                    </div>

                    {/* Real Miniature Document Preview */}
                    <div className="w-full bg-slate-50 dark:bg-[#070B14] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 mb-3.5 flex items-center justify-center overflow-hidden">
                      <ResumeMiniThumbnail resume={item.resume} />
                    </div>

                    {/* Metadata & Details */}
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 truncate">
                      {item.role}
                    </p>

                    {/* Template name + Last edited time */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                        🎨 {templateName}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono shrink-0">
                        🕒 {relativeEdited}
                      </span>
                    </div>
                  </div>

                  <div
                    className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadResume(item)}
                      className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
                    >
                      Open Resume →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openRenameModal(item.id, item.title)}
                        className="text-xs text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
                      >
                        Rename
                      </button>
                      <span className="text-[#94A3B8] text-xs">•</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteStored(item.id, item.title)}
                        className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: APPLICATION TRACKER */}
      {activeTab === "tracker" && (
        <ApplicationTracker onCountChange={setAppsCount} onOpenEditor={onOpenEditor} />
      )}

      {/* 5. MODALS */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ImportReviewModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* RENAME MODAL */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Resume"
        description="Update the display name of this resume."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              Resume Title
            </label>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmRename()}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] transition"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <Button variant="ghost" size="sm" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmRename}>
              Save Name
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
