"use client";

import React, { useState, useEffect, useRef } from "react";
import { useResume } from "@/context/ResumeContext";
import { useTheme } from "@/context/ThemeContext";
import { ExportModal } from "@/components/export/ExportModal";
import { ImportReviewModal } from "@/components/import/ImportReviewModal";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { AuthModal } from "@/components/dashboard/AuthModal";
import { formatResumeTitle } from "@/lib/schema";

interface TopBarProps {
  onDownloadPdf: () => void;
  onExportTxt: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onDownloadPdf, onExportTxt }) => {
  const {
    resume,
    saveStatus,
    resetToSample,
    activeVersionId,
    versions,
    switchVersion,
  } = useResume();
  const { resolvedTheme, toggleTheme } = useTheme();

  const activeVersion = versions.find((v) => v.id === activeVersionId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(() =>
    activeVersion?.name || formatResumeTitle(resume.basics.name, "My Professional Resume")
  );

  // Sync title when active resume or version changes while not in active input edit
  useEffect(() => {
    if (!isEditingTitle) {
      if (activeVersion) {
        setTitleValue(activeVersion.name);
      } else {
        setTitleValue(formatResumeTitle(resume.basics.name, "My Professional Resume"));
      }
    }
  }, [resume.basics.name, activeVersion, isEditingTitle]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Dynamic relative save time ("Saved just now", "Saved 1 min ago", "Saved 2 min ago")
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(Date.now());
  const [relativeSaveTime, setRelativeSaveTime] = useState<string>("Saved just now");
  const prevSaveStatusRef = useRef(saveStatus);

  useEffect(() => {
    // When saveStatus transitions from "Saving..." to a saved state, update timestamp
    if (saveStatus !== "Saving..." && prevSaveStatusRef.current === "Saving...") {
      setLastSavedTimestamp(Date.now());
      setRelativeSaveTime("Saved just now");
    }
    prevSaveStatusRef.current = saveStatus;
  }, [saveStatus]);

  useEffect(() => {
    const updateRelativeTime = () => {
      if (saveStatus === "Saving...") {
        setRelativeSaveTime("Saving...");
        return;
      }
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastSavedTimestamp) / 1000));
      if (elapsedSeconds < 15) {
        setRelativeSaveTime("Saved just now");
      } else if (elapsedSeconds < 60) {
        setRelativeSaveTime("Saved moments ago");
      } else if (elapsedSeconds < 120) {
        setRelativeSaveTime("Saved 1 min ago");
      } else {
        const mins = Math.floor(elapsedSeconds / 60);
        setRelativeSaveTime(`Saved ${mins} min ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000); // Ticks every 10s
    return () => clearInterval(interval);
  }, [lastSavedTimestamp, saveStatus]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (!titleValue.trim()) {
      setTitleValue("My Professional Resume");
    }
  };

  return (
    <header className="no-print sticky top-0 h-13 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#1E293B] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 transition-colors duration-150 text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 1. Breadcrumbs & Document Title */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {/* Brand Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] dark:bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-blue-500/20 select-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#0F172A] dark:text-[#F8FAFC] hidden sm:inline-block">
            ResumeCraft
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline-block select-none text-xs">/</span>

        <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] hidden md:inline-block">
          Resumes
        </span>

        <span className="text-slate-300 dark:text-slate-700 hidden md:inline-block select-none text-xs">/</span>

        {/* Editable Resume Title with distinct linear hover */}
        <div className="min-w-0 flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-slate-100 dark:bg-[#1E293B] px-2.5 py-1 rounded-md border border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 shadow-2xs"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 truncate max-w-[170px] sm:max-w-xs transition flex items-center gap-1.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              title="Click to rename document"
            >
              <span className="truncate">{titleValue}</span>
              <span className="text-[#94A3B8] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] text-[11px] transition">✎</span>
            </button>
          )}
        </div>

        {/* Dynamic Relative Save Status Indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-[#E2E8F0] dark:border-[#1E293B] text-xs font-medium text-[#475569] dark:text-[#94A3B8]"
          title="Autosave status"
        >
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              saveStatus === "Saving..."
                ? "bg-amber-500 animate-pulse"
                : "bg-emerald-500"
            }`}
          />
          <span className="tabular-nums">{relativeSaveTime}</span>
        </div>

        {/* Active Tailored Version Indicator */}
        {activeVersion && (
          <div className="hidden md:inline-flex items-center gap-1.5 pl-3 border-l border-[#E2E8F0] dark:border-[#1E293B]">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#93C5FD] flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/40 shadow-2xs">
              <span>🎯 {activeVersion.name}</span>
              <button
                type="button"
                onClick={() => switchVersion(null)}
                className="ml-1 text-blue-400 hover:text-blue-800 dark:hover:text-white cursor-pointer font-bold"
                title="Switch back to Base Resume"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </nav>

      {/* 2. Right Actions: Linear / Stripe Polish */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-medium transition shadow-2xs cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          title={`Currently ${resolvedTheme === "dark" ? "Dark" : "Light"} mode. Click to toggle.`}
        >
          {resolvedTheme === "dark" ? (
            <>
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Dark</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium text-[#475569]">Light</span>
            </>
          )}
        </button>

        {/* Overflow Menu (Imports, Settings, Reset) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold tracking-widest text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            title="More actions"
          >
            •••
          </button>

          {isMoreMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_12px_24px_-4px_rgba(15,23,42,0.1),0_4px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsMoreMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <span>📥</span>
                <span>Import Resume (PDF/Word)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <span>📤</span>
                <span>Export Formats (DOCX/TXT)...</span>
              </button>

              <button
                type="button"
                onClick={resetToSample}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#475569] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <span>🔄</span>
                <span>Reset to Sample Resume</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0] dark:border-[#1E293B]" />

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <span>⚙️</span>
                <span>Preferences & Privacy</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <span>👤</span>
                <span>Account & Cloud Sync</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Download PDF Button (Linear / Stripe Polish) */}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="h-8 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-medium text-xs rounded-full flex items-center gap-2 shadow-xs transition active:scale-98 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1120]"
          title="Download vector PDF (Cmd+P)"
        >
          <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span>Download PDF</span>
          <span className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white/20 rounded text-white select-none">
            ⌘P
          </span>
        </button>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resume={activeVersion ? activeVersion.tailoredResume : resume}
      />

      <ImportReviewModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
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
    </header>
  );
};
