"use client";

import React, { useState, useRef, useEffect } from "react";
import { useResume } from "@/context/ResumeContext";

interface CompletenessMeterProps {
  onNavigateSection?: (section: "basics" | "experience" | "education" | "skills" | "tailor") => void;
}

export const CompletenessMeter: React.FC<CompletenessMeterProps> = ({ onNavigateSection }) => {
  const { resume, completionPercentage, sectionCompletion } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const checklistItems = [
    {
      label: "Full Name & Professional Title",
      done: Boolean(resume.basics.name?.trim() && resume.basics.title?.trim()),
      target: "basics" as const,
      hint: "Add your full name and current or target job title",
    },
    {
      label: "Contact Info (Email & Location)",
      done: Boolean(resume.basics.email?.trim() && resume.basics.location?.trim()),
      target: "basics" as const,
      hint: "Recruiters need a way to reach you and your city/state",
    },
    {
      label: "Professional Summary",
      done: Boolean(resume.basics.summary?.trim() && resume.basics.summary.length > 40),
      target: "basics" as const,
      hint: "2-3 punchy sentences highlighting your core impact",
    },
    {
      label: "Experience (with measurable bullets)",
      done: sectionCompletion.experience,
      target: "experience" as const,
      hint: "Add at least one role with bullets describing actions and results",
    },
    {
      label: "Education Details",
      done: sectionCompletion.education,
      target: "education" as const,
      hint: "List your degree, university or recent certifications",
    },
    {
      label: "Skills (3+ core competencies)",
      done: sectionCompletion.skills,
      target: "skills" as const,
      hint: "Add relevant hard and technical skills for ATS keyword matching",
    },
  ];

  const completedCount = checklistItems.filter((i) => i.done).length;
  const totalCount = checklistItems.length;

  return (
    <div ref={containerRef} className="relative select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="w-full text-left p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16]"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Resume {mounted ? completionPercentage : 100}% complete
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40 font-mono">
              {mounted ? completedCount : totalCount}/{totalCount} items
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 flex items-center gap-1 transition">
            <span>{isOpen ? "Close" : "Checklist"}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full bg-[#2563EB]"
            style={{ width: `${mounted ? completionPercentage : 100}%` }}
          />
        </div>
      </button>

      {/* Dropdown Checklist */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Resume Readiness Checklist
            </h4>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {completionPercentage >= 85 ? "ATS Ready!" : "Strengthen your resume"}
            </span>
          </div>

          <div className="space-y-2">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onNavigateSection) {
                    onNavigateSection(item.target);
                    setIsOpen(false);
                  }
                }}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                  item.done
                    ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {item.done ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 dark:border-amber-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-medium ${
                        item.done
                          ? "text-slate-500 dark:text-slate-400 line-through"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {item.label}
                    </p>
                    {!item.done && (
                      <span className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-semibold ml-2 shrink-0">
                        Fix →
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Tip: Real selectable text guarantees ATS safety.</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
