"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ScoreRing } from "./ScoreRing";
import { runAtsChecker } from "@/lib/ats/checker";
import type { Resume, AtsSeverity } from "@/types/resume";

interface AtsCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
}

export const AtsCheckerModal: React.FC<AtsCheckerModalProps> = ({
  isOpen,
  onClose,
  resume,
}) => {
  const [filter, setFilter] = useState<"all" | AtsSeverity>("all");
  const result = runAtsChecker(resume);

  const filteredIssues = result.issues.filter((issue) => {
    if (filter === "all") return true;
    return issue.severity === filter;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🛡️ ATS Readability & Compliance Checker"
      description="Deterministic scan of structural headings, contact formatting, action verbs, and impact metrics."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Top Score Summary Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <ScoreRing
              score={result.score}
              size={96}
              strokeWidth={8}
              label="ATS Health"
              sublabel="deterministic estimate, not an ATS guarantee"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Rating:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    result.rating === "Excellent"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : result.rating === "Good"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {result.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                Evaluated against 9 ATS parsing guidelines: single-column standards, email syntax, metric density, and active voice.
              </p>
            </div>
          </div>

          {/* Quick counts */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto text-xs shrink-0">
            <button
              type="button"
              onClick={() => setFilter("critical")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center justify-between gap-2 border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                filter === "critical"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
              }`}
            >
              <span>Critical Fixes</span>
              <span className="font-mono tabular-nums">{result.summary.criticalCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("warning")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center justify-between gap-2 border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                filter === "warning"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
              }`}
            >
              <span>Warnings</span>
              <span className="font-mono tabular-nums">{result.summary.warningCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("good")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center justify-between gap-2 border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                filter === "good"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              }`}
            >
              <span>Passed Checks</span>
              <span className="font-mono tabular-nums">{result.summary.passedCount}</span>
            </button>
          </div>
        </div>

        {/* Filter Pill Switcher */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter:</span>
          {(["all", "critical", "warning", "good"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                filter === mode
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {mode} {mode !== "all" && `(${result.issues.filter((i) => i.severity === mode).length})`}
            </button>
          ))}
        </div>

        {/* Issues Checklist */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredIssues.map((issue) => {
            const isCrit = issue.severity === "critical";
            const isWarn = issue.severity === "warning";

            return (
              <div
                key={issue.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isCrit
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : isWarn
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                    : "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCrit
                          ? "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200"
                          : isWarn
                          ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                          : "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {issue.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {issue.category}
                  </span>
                </div>

                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {issue.description}
                </p>

                {issue.suggestion && (
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[11px] text-[#2563EB] dark:text-[#60A5FA] flex items-start gap-1.5">
                    <span className="font-semibold shrink-0">💡 Recommendation:</span>
                    <span>{issue.suggestion}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
