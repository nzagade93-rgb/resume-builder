"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useResume } from "@/context/ResumeContext";
import {
  BasicsEditor,
  ExperienceEditor,
  EducationEditor,
  SkillsEditor,
  ProjectsEditor,
  SectionManager,
} from "@/components/editor";
import { TopBar } from "@/components/shell/TopBar";
import { LeftRail, NavSection } from "@/components/shell/LeftRail";
import { PreviewCanvas } from "@/components/shell/PreviewCanvas";
import { DesignPanel } from "@/components/shell/DesignPanel";
import { ExportPanel } from "@/components/shell/ExportPanel";
import { ImprovePanel } from "@/components/shell/ImprovePanel";
import { TailorWorkspace } from "@/components/tailor/TailorWorkspace";
import { ResumeDashboard } from "@/components/dashboard/ResumeDashboard";
import { TemplateGallery } from "@/components/gallery/TemplateGallery";
import { printVectorPdf } from "@/lib/export/pdfExport";
import type { Resume } from "@/types/resume";

type ContentStep = "basics" | "experience" | "education" | "skills" | "projects" | "sections";

export const ResumeApp: React.FC = () => {
  const { resume, setResume, activeResume, versions, setTemplate } = useResume();

  // Navigation and view state
  const [activeNav, setActiveNav] = useState<NavSection>("content");
  const [contentStep, setContentStep] = useState<ContentStep>("basics");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    () => activeResume.template || resume.template || "ats"
  );
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  // Keep selectedTemplate in sync if resume.template or activeResume.template changes
  useEffect(() => {
    const currentTpl = activeResume.template || resume.template;
    if (currentTpl && currentTpl !== selectedTemplate) {
      setSelectedTemplate(currentTpl);
    }
  }, [activeResume.template, resume.template, selectedTemplate]);

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplate(id);
    setTemplate(id);
  }, [setTemplate]);

  // AI Tailoring draft state
  const [tailoredDraft, setTailoredDraft] = useState<Resume | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  // Print PDF handler
  const handlePrintPdf = () => {
    printVectorPdf(activeResume);
  };

  // Plain text export handler
  const handleExportTxt = () => {
    setActiveNav("export");
    setMobileView("editor");
  };

  // Accept AI tailored changes
  const handleAcceptTailored = () => {
    if (tailoredDraft) {
      setResume(tailoredDraft);
      setTailoredDraft(null);
      setMissingKeywords([]);
    }
  };

  // Discard AI draft
  const handleRevertTailored = () => {
    setTailoredDraft(null);
    setMissingKeywords([]);
  };

  // Content step items
  const contentSteps: { id: ContentStep; label: string; icon: string }[] = [
    { id: "basics", label: "Personal Information", icon: "👤" },
    { id: "experience", label: "Work Experience", icon: "💼" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "skills", label: "Skills", icon: "⚡" },
    { id: "projects", label: "Projects", icon: "🚀" },
    { id: "sections", label: "Sections & Order", icon: "📑" },
  ];

  const currentStepIndex = contentSteps.findIndex((s) => s.id === contentStep);
  const prevStepIndex = currentStepIndex - 1;
  const nextStepIndex = currentStepIndex + 1;
  const currentStepObj = contentSteps[currentStepIndex] || contentSteps[0];

  // Desktop focus mode: "split" (default) or "preview" (full document focus)
  const [desktopFocusMode, setDesktopFocusMode] = useState<"split" | "preview">("split");

  const toggleFocusPreview = () => {
    setDesktopFocusMode((prev) => (prev === "preview" ? "split" : "preview"));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] font-sans transition-colors duration-150 print:h-auto print:w-auto print:overflow-visible print:bg-white print:block">
      {/* 1. STICKY TOP BAR */}
      <TopBar
        onDownloadPdf={handlePrintPdf}
        onExportTxt={handleExportTxt}
      />

      {/* 2. MAIN APP BODY (Left Rail + Editor + Preview) */}
      <div className="flex-1 flex overflow-hidden relative print:overflow-visible print:h-auto print:w-auto print:block">
        {/* Left Vertical Rail Navigation (Desktop) */}
        <div className="no-print hidden md:flex shrink-0">
          <LeftRail
            activeTab={activeNav}
            onSelectTab={(tab) => {
              setActiveNav(tab);
              if (desktopFocusMode === "preview" && tab !== "dashboard" && tab !== "templates") {
                setDesktopFocusMode("split");
              }
            }}
            hasTailoredDraft={versions.length > 0 || !!tailoredDraft}
            contentStep={contentStep}
            onSelectContentStep={(step) => {
              setActiveNav("content");
              setContentStep(step);
              if (desktopFocusMode === "preview") {
                setDesktopFocusMode("split");
              }
            }}
          />
        </div>

        {/* Dashboard View */}
        {activeNav === "dashboard" && (
          <div className="no-print flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#090D16]">
            <ResumeDashboard onOpenEditor={() => setActiveNav("content")} />
          </div>
        )}

        {/* Templates Gallery */}
        {activeNav === "templates" && (
          <div className="no-print flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#090D16]">
            <TemplateGallery
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onOpenEditor={() => setActiveNav("content")}
            />
          </div>
        )}

        {/* CENTER PANE: Active Section Editor */}
        {activeNav !== "dashboard" && activeNav !== "templates" && (
          <main
            aria-label="Editor workspace"
            className={`no-print h-full flex flex-col min-w-0 shrink-0 bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] transition-all duration-200 relative ${
              desktopFocusMode === "preview"
                ? "hidden"
                : mobileView === "preview"
                ? "hidden md:flex md:w-[360px] lg:w-[440px] xl:w-[480px]"
                : "w-full md:w-[360px] lg:w-[440px] xl:w-[480px]"
            }`}
          >
            {/* Top of Editor: Linear Guided Step Header */}
            {activeNav === "content" && (
              <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block font-mono">
                    Step {currentStepIndex + 1} of {contentSteps.length}
                  </span>
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                    {currentStepObj.label}
                  </h2>
                </div>

                {/* Candidate Progression Action */}
                <div className="flex items-center gap-1.5">
                  {prevStepIndex >= 0 && (
                    <button
                      type="button"
                      onClick={() => setContentStep(contentSteps[prevStepIndex].id)}
                      className="px-3 py-1.5 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    >
                      ← Back
                    </button>
                  )}
                  {nextStepIndex < contentSteps.length ? (
                    <button
                      type="button"
                      onClick={() => setContentStep(contentSteps[nextStepIndex].id)}
                      className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    >
                      <span>Continue</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveNav("design")}
                      className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    >
                      <span>Design</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {activeNav === "content" && (
                <>
                  {contentStep === "basics" && <BasicsEditor />}
                  {contentStep === "experience" && <ExperienceEditor />}
                  {contentStep === "education" && <EducationEditor />}
                  {contentStep === "skills" && <SkillsEditor />}
                  {contentStep === "projects" && <ProjectsEditor />}
                  {contentStep === "sections" && <SectionManager />}

                  {/* Section Bottom Next Step Callout */}
                  <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                    {prevStepIndex >= 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContentStep(contentSteps[prevStepIndex].id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
                      >
                        <span>← Back to {contentSteps[prevStepIndex].label}</span>
                      </button>
                    ) : <span />}

                    {nextStepIndex < contentSteps.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContentStep(contentSteps[nextStepIndex].id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        <span>Next: {contentSteps[nextStepIndex].label}</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveNav("design")}
                        className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        <span>Continue to Design & Styling</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </>
              )}

              {activeNav === "design" && (
                <DesignPanel
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleSelectTemplate}
                  onOpenGallery={() => setActiveNav("templates")}
                />
              )}

              {activeNav === "improve" && <ImprovePanel />}

              {activeNav === "tailor" && <TailorWorkspace />}

              {activeNav === "export" && (
                <ExportPanel onPrintPdf={handlePrintPdf} />
              )}
            </div>
          </main>
        )}

        {/* RIGHT PANE: Live Document Preview Canvas */}
        <div
          className={`h-full flex-1 min-w-0 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:w-full print:!block ${
            activeNav === "dashboard" || activeNav === "templates"
              ? "hidden print:!block"
              : mobileView === "editor"
              ? "hidden md:flex print:!block"
              : "flex"
          }`}
        >
          <PreviewCanvas
            resume={activeResume}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            tailoredDraft={tailoredDraft}
            missingKeywords={missingKeywords}
            onAcceptTailored={handleAcceptTailored}
            onRevertTailored={handleRevertTailored}
            onPrintPdf={handlePrintPdf}
            isFocusPreview={desktopFocusMode === "preview"}
            onToggleFocusPreview={toggleFocusPreview}
          />
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      <div className="no-print md:hidden bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-[#E2E8F0] dark:border-[#1E293B] px-3 py-2 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Section switcher */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium scrollbar-none">
          {(["content", "design", "templates", "tailor", "dashboard"] as NavSection[]).map((tab) => {
            const labels: Record<string, string> = {
              content: "Editor",
              design: "Design",
              templates: "Templates",
              tailor: "AI Match",
              dashboard: "Resumes",
            };
            const isCurrent = activeNav === tab && mobileView === "editor";
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveNav(tab);
                  setMobileView("editor");
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isCurrent
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
                }`}
              >
                {labels[tab] || tab}
              </button>
            );
          })}
        </div>

        {/* View toggle (Editor vs Preview) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setMobileView("editor")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              mobileView === "editor"
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              mobileView === "preview"
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeApp;
