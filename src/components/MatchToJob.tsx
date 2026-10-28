"use client";

import React, { useState, useEffect } from "react";
import { useResume } from "@/context/ResumeContext";
import { extractKeywordsFromJd, matchKeywordsWithResume } from "@/lib/keywords";
import type { Resume } from "@/types/resume";

const CLIENT_LIMIT_KEY = "gemini_tailor_usage_v1";
const DAILY_LIMIT = 5;

type MatchToJobProps = {
  onTailoredPreview: (tailored: Resume | null, missing: string[]) => void;
  isTailoredActive: boolean;
};

export const MatchToJob: React.FC<MatchToJobProps> = ({ onTailoredPreview, isTailoredActive }) => {
  const { resume } = useResume();
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clientUsageCount, setClientUsageCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem(CLIENT_LIMIT_KEY);
      if (stored) {
        const { date, count } = JSON.parse(stored);
        const today = new Date().toISOString().slice(0, 10);
        if (date === today) {
          return count || 0;
        }
      }
    } catch (e) {
      console.warn("Could not read client tailor limit:", e);
    }
    return 0;
  });

  const incrementClientUsage = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const newCount = clientUsageCount + 1;
      localStorage.setItem(CLIENT_LIMIT_KEY, JSON.stringify({ date: today, count: newCount }));
      setClientUsageCount(newCount);
    } catch (e) {
      console.warn("Could not write client tailor limit:", e);
    }
  };

  // Instant keyword matching
  const keywords = extractKeywordsFromJd(jdText);
  const matchResult = matchKeywordsWithResume(keywords, resume);

  // Trigger Gemini AI Tailoring
  const handleTailor = async () => {
    if (!jdText.trim()) {
      setErrorMsg("Please paste a job description first.");
      return;
    }

    if (clientUsageCount >= DAILY_LIMIT) {
      setErrorMsg(
        `Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). To protect your free quota, you can tailor up to 5 times per day. Resets tomorrow!`
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd: jdText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to tailor resume.");
      }

      incrementClientUsage();
      onTailoredPreview(data.tailoredResume, data.missingKeywords || []);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during AI tailoring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Match to Job & AI Tailor</h4>
          <p className="text-slate-500 text-[11px]">
            Compare against a target job description and tailor with Gemini AI
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
          Daily Free Quota: {DAILY_LIMIT - clientUsageCount}/{DAILY_LIMIT} left
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-medium text-slate-700">Paste Job Description</label>
          <span className="text-[10px] text-slate-500 font-mono">{jdText.length}/8,000 chars</span>
        </div>
        <textarea
          rows={4}
          value={jdText}
          maxLength={8000}
          onChange={(e) => {
            setJdText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="Paste job requirements, responsibilities, and qualifications here..."
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Keyword Match Results */}
      {keywords.length > 0 && (
        <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-800">
              Matched {matchResult.matchedKeywords.length} of {matchResult.totalKeywords} keywords ({matchResult.matchPercentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                matchResult.matchPercentage >= 70 ? "bg-emerald-500" : matchResult.matchPercentage >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${matchResult.matchPercentage}%` }}
            />
          </div>

          {/* Matched keywords in green */}
          {matchResult.matchedKeywords.length > 0 && (
            <div>
              <span className="block text-[11px] font-semibold text-emerald-700 mb-1">
                Matched in your resume:
              </span>
              <div className="flex flex-wrap gap-1">
                {matchResult.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords in red */}
          {matchResult.missingKeywords.length > 0 && (
            <div>
              <span className="block text-[11px] font-semibold text-red-600 mb-1">
                Missing from your resume:
              </span>
              <div className="flex flex-wrap gap-1">
                {matchResult.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Note: Add missing keywords only if they represent true, authentic experience.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
          {errorMsg}
        </div>
      )}

      {/* Tailor Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading || !jdText.trim() || clientUsageCount >= DAILY_LIMIT}
          onClick={handleTailor}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-lg shadow-xs disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed disabled:border disabled:border-slate-300 dark:disabled:border-slate-700 transition flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Tailoring with Gemini AI...</span>
            </>
          ) : (
            <span>✨ Tailor Resume with Gemini</span>
          )}
        </button>
      </div>
    </div>
  );
};
