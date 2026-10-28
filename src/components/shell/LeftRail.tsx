"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useResume } from "@/context/ResumeContext";
import { getFlatSkills } from "@/types/resume";

export type NavSection = "content" | "design" | "templates" | "tailor" | "dashboard" | "improve" | "export";
export type ContentStep = "basics" | "experience" | "education" | "skills" | "projects" | "sections";

export interface LeftRailProps {
  activeTab: NavSection;
  onSelectTab: (tab: NavSection) => void;
  hasTailoredDraft?: boolean;
  contentStep?: ContentStep;
  onSelectContentStep?: (step: ContentStep) => void;
  onOpenSettings?: () => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  activeTab,
  onSelectTab,
  hasTailoredDraft = false,
  contentStep = "basics",
  onSelectContentStep,
}) => {
  const { resume, versions, completionPercentage } = useResume();

  // Default to expanded on desktop (>=1024px), collapsed on tablet (<1024px)
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("rc_sidebar_expanded");
      if (saved !== null) return saved === "true";
      return window.innerWidth >= 1024;
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("rc_sidebar_expanded", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Grouped Navigation Structure for Linear / Notion polish
  interface NavItem {
    id: NavSection;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }

  const workspaceGroup: NavItem[] = [
    {
      id: "content",
      label: "Resume Editor",
      badge: `${completionPercentage}%`,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
    },
    {
      id: "design",
      label: "Design & Styling",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
    },
    {
      id: "templates",
      label: "Templates Library",
      badge: "12",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
  ];

  const intelligenceGroup: NavItem[] = [
    {
      id: "tailor",
      label: "AI Job Match",
      badge: hasTailoredDraft ? "Draft" : undefined,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
  ];

  const organizationGroup: NavItem[] = [
    {
      id: "dashboard",
      label: "My Resumes",
      badge: `${1 + versions.length}`,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
    },
  ];

  // Editor sub-steps
  const editorSteps: { id: ContentStep; label: string; count?: number }[] = [
    { id: "basics", label: "Personal Info" },
    { id: "experience", label: "Work Experience", count: resume.experience.length },
    { id: "education", label: "Education", count: resume.education.length },
    { id: "skills", label: "Skills", count: resume.skills.length },
    { id: "projects", label: "Projects", count: resume.projects.length },
    { id: "sections", label: "Sections Order" },
  ];

  // Concrete next steps recommendation for Profile Strength Card
  const nextStepRecommendation = useMemo(() => {
    const hasSummary = Boolean(resume.basics.summary?.trim() || resume.summary?.trim());
    if (!hasSummary) {
      return { label: "Add a summary", yield: "+10%", step: "basics" as ContentStep };
    }
    const hasExp = resume.experience.length > 0;
    const hasExpBullets = resume.experience.some((e) => e.bullets.some((b) => b.trim().length > 10));
    if (!hasExp || !hasExpBullets) {
      return { label: "Add experience bullets", yield: "+15%", step: "experience" as ContentStep };
    }
    const flatSkills = getFlatSkills(resume.skills);
    if (flatSkills.length < 3) {
      return { label: "Add 3+ core skills", yield: "+15%", step: "skills" as ContentStep };
    }
    const hasEdu = resume.education.length > 0 && resume.education.some((e) => Boolean(e.school.trim() && e.degree.trim()));
    if (!hasEdu) {
      return { label: "Add education details", yield: "+15%", step: "education" as ContentStep };
    }
    const hasProjects = (resume.projects?.length || 0) > 0;
    if (!hasProjects) {
      return { label: "Add key projects", yield: "+10%", step: "projects" as ContentStep };
    }
    return null;
  }, [resume]);

  const candidateName = resume.basics.name?.trim() || "My Resume";
  const userInitials = resume.basics.name
    ? resume.basics.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RC";

  // Reusable Nav Button with Linear-style active highlight (icon + label + left active indicator bar)
  const renderNavButton = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectTab(item.id)}
        title={!isExpanded ? item.label : undefined}
        className={`group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
          isActive
            ? "bg-blue-50 dark:bg-blue-950/40 text-[#1D4ED8] dark:text-[#93C5FD] font-semibold"
            : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium"
        } ${!isExpanded ? "justify-center px-0 h-10" : ""}`}
      >
        {/* Left active indicator pill bar like Linear */}
        {isActive && (
          <span
            className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#2563EB] dark:bg-[#3B82F6] ${
              !isExpanded ? "left-0.5" : ""
            }`}
          />
        )}

        <span
          className={`shrink-0 transition-colors ${
            isActive
              ? "text-[#2563EB] dark:text-[#3B82F6]"
              : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"
          }`}
        >
          {item.icon}
        </span>

        {isExpanded && (
          <>
            <span className="truncate flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                  isActive
                    ? "bg-blue-200/60 dark:bg-blue-900/80 text-[#1D4ED8] dark:text-[#93C5FD]"
                    : "bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#94A3B8]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={`no-print h-full flex flex-col bg-[#FBFBFD] dark:bg-[#0B1120] border-r border-[#E2E8F0] dark:border-[#1E293B] select-none transition-all duration-200 ease-out z-20 shrink-0 ${
        isExpanded ? "w-60" : "w-16"
      }`}
    >
      {/* 1. Sidebar Header: Toggle Expand Button & Candidate Document Name */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <button
          type="button"
          onClick={toggleExpand}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          title={isExpanded ? "Collapse sidebar (Cmd+B)" : "Expand sidebar"}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
            )}
          </svg>
        </button>

        {isExpanded && (
          <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate px-2 tracking-tight">
            {candidateName}
          </span>
        )}

        <div className="w-4" />
      </div>

      {/* 2. Main Navigation Stack (Grouped Sections with Subtle Dividers) */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {/* Group A: Workspace */}
        <div className="space-y-1">
          {isExpanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Workspace
            </div>
          )}
          {workspaceGroup.map(renderNavButton)}
        </div>

        {/* When Resume Editor is active: Sub-sections list */}
        {isExpanded && activeTab === "content" && (
          <div className="pl-3 pr-1 pt-1 pb-2 space-y-0.5 border-l-2 border-[#E2E8F0] dark:border-[#1E293B] ml-4 animate-in fade-in duration-150">
            {editorSteps.map((step) => {
              const isCurrent = contentStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    onSelectTab("content");
                    onSelectContentStep?.(step.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isCurrent
                      ? "bg-slate-100 dark:bg-slate-800 text-[#2563EB] dark:text-[#3B82F6] font-semibold"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className="truncate">{step.label}</span>
                  {typeof step.count === "number" && step.count > 0 && (
                    <span className="text-[10px] font-mono font-medium px-1 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#64748B] dark:text-[#94A3B8]">
                      {step.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="border-t border-[#E2E8F0] dark:border-[#1E293B]" />

        {/* Group B: AI Intelligence */}
        <div className="space-y-1">
          {isExpanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Intelligence
            </div>
          )}
          {intelligenceGroup.map(renderNavButton)}
        </div>

        <div className="border-t border-[#E2E8F0] dark:border-[#1E293B]" />

        {/* Group C: Organization & Collection */}
        <div className="space-y-1">
          {isExpanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Organization
            </div>
          )}
          {organizationGroup.map(renderNavButton)}
        </div>
      </div>

      {/* 3. Bottom Section: Profile Strength Card + User Avatar & Plan Badge */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white/60 dark:bg-slate-900/40 space-y-3">
        {/* Profile Strength Card */}
        {isExpanded ? (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]/80 border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Profile Strength
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  completionPercentage >= 85
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                    : completionPercentage >= 60
                    ? "bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-[#93C5FD] border border-blue-200 dark:border-blue-900/40"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                }`}
              >
                {completionPercentage >= 85 ? "Strong" : completionPercentage >= 60 ? "Good" : "Needs Work"}
              </span>
            </div>

            {/* Score & Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] tabular-nums font-mono">
                  {completionPercentage}%
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  {completionPercentage === 100 ? "All optimized" : "Target: 85%+"}
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    completionPercentage >= 85
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : completionPercentage >= 60
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Concrete Next Step Action */}
            {nextStepRecommendation ? (
              <button
                type="button"
                onClick={() => {
                  onSelectTab("content");
                  onSelectContentStep?.(nextStepRecommendation.step);
                }}
                className="w-full group/step flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-800/90 border border-[#E2E8F0] dark:border-slate-700/80 hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition shadow-2xs cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                title={`Click to navigate to ${nextStepRecommendation.label}`}
              >
                <div className="min-w-0 pr-1 flex items-center gap-1">
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 shrink-0">⚡</span>
                  <span className="text-[11px] font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {nextStepRecommendation.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-bold font-mono text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">
                    {nextStepRecommendation.yield}
                  </span>
                  <span className="text-[10px] text-[#64748B] group-hover/step:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                <span>✓</span>
                <span>All core sections optimized</span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (nextStepRecommendation) {
                onSelectTab("content");
                onSelectContentStep?.(nextStepRecommendation.step);
              }
            }}
            className="w-full flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#2563EB] transition cursor-pointer"
            title={`Profile Strength: ${completionPercentage}%${
              nextStepRecommendation
                ? ` • Next: ${nextStepRecommendation.label} (${nextStepRecommendation.yield})`
                : " • All sections complete"
            }`}
          >
            <span
              className={`text-xs font-bold tabular-nums font-mono ${
                completionPercentage >= 85
                  ? "text-emerald-600 dark:text-emerald-400"
                  : completionPercentage >= 60
                  ? "text-[#2563EB] dark:text-[#3B82F6]"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {completionPercentage}%
            </span>
            <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  completionPercentage >= 85
                    ? "bg-emerald-500"
                    : completionPercentage >= 60
                    ? "bg-[#2563EB]"
                    : "bg-amber-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </button>
        )}

        {/* User Avatar + Plan Badge (STEP 3 Requirement) */}
        {isExpanded ? (
          <div className="pt-2 border-t border-[#E2E8F0]/70 dark:border-[#1E293B]/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate block leading-tight">
                  {candidateName}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate block">
                  Free Workspace
                </span>
              </div>
            </div>

            {/* Plan Badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-[#93C5FD] border border-blue-200 dark:border-blue-900/40 shrink-0">
              PRO
            </span>
          </div>
        ) : (
          <div className="flex justify-center relative pt-1" title={`${candidateName} (PRO Plan)`}>
            <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs select-none shadow-2xs">
              {userInitials}
            </div>
            {/* Small active pro dot */}
            <span className="absolute bottom-0 right-3 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white dark:ring-[#0B1120]" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftRail;
