"use client";

import React from "react";
import type { TailorDiff } from "@/types/resume";

interface TailorDiffViewProps {
  diffs: TailorDiff[];
  onAcceptDiff: (diffId: string) => void;
  onRejectDiff: (diffId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  versionName?: string;
}

export const TailorDiffView: React.FC<TailorDiffViewProps> = ({
  diffs,
  onAcceptDiff,
  onRejectDiff,
  onAcceptAll,
  onRejectAll,
  versionName = "Tailored Version",
}) => {
  const pendingCount = diffs.filter((d) => d.status === "pending").length;
  const acceptedCount = diffs.filter((d) => d.status === "accepted").length;
  const rejectedCount = diffs.filter((d) => d.status === "rejected").length;

  if (diffs.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
        <span className="text-2xl mb-1 block">✨</span>
        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
          No Pending Diffs
        </h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          The tailored draft already mirrors your authentic experience without requiring additional edits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Diff Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Tailoring Diff: {versionName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              {diffs.length} Change{diffs.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review changes side-by-side. Your original base resume is never altered.
          </p>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onAcceptAll}
            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
          >
            ✓ Accept All ({diffs.length})
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition cursor-pointer"
          >
            ✕ Reject All
          </button>
        </div>
      </div>

      {/* Status Counters */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
          {acceptedCount} accepted
        </span>
        <span>•</span>
        <span className="text-slate-500 dark:text-slate-400">
          {pendingCount} pending review
        </span>
        {rejectedCount > 0 && (
          <>
            <span>•</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {rejectedCount} rejected
            </span>
          </>
        )}
      </div>

      {/* Diffs List */}
      <div className="space-y-3">
        {diffs.map((diff, idx) => {
          const isAccepted = diff.status === "accepted";
          const isRejected = diff.status === "rejected";

          return (
            <div
              key={diff.id || idx}
              className={`border rounded-xl p-3.5 space-y-2.5 transition-all ${
                isAccepted
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                  : isRejected
                  ? "bg-red-50/30 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/40 opacity-70"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
              }`}
            >
              {/* Header with Path and Status */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {diff.path}
                  </span>
                  {isAccepted && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                      Accepted
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.2 rounded">
                      Rejected
                    </span>
                  )}
                </div>

                {/* Per-diff action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAcceptDiff(diff.id)}
                    title="Accept this change"
                    className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition ${
                      isAccepted
                        ? "bg-emerald-600 text-white"
                        : "text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    }`}
                  >
                    ✓ Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectDiff(diff.id)}
                    title="Reject this change"
                    className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition ${
                      isRejected
                        ? "bg-red-600 text-white"
                        : "text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950"
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              {/* Rationale / Why */}
              <div className="flex items-start gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-100 dark:border-teal-900/50">
                <span className="font-bold shrink-0">Why:</span>
                <span>{diff.reason}</span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Original */}
                <div className="p-2.5 rounded-lg bg-red-50/40 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-between text-[10px] font-bold text-red-700 dark:text-red-400 mb-1">
                    <span>ORIGINAL</span>
                  </div>
                  <p className="leading-relaxed text-[11.5px] line-through text-slate-600 dark:text-slate-400">
                    {diff.originalText}
                  </p>
                </div>

                {/* Tailored */}
                <div className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    <span>TAILORED SUGGESTION</span>
                  </div>
                  <p className="leading-relaxed text-[11.5px] font-medium text-slate-900 dark:text-slate-100">
                    {diff.tailoredText}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
