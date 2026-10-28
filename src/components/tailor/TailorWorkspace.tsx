"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useResume } from "@/context/ResumeContext";
import { ScoreRing } from "./ScoreRing";
import { TailorDiffView } from "./TailorDiffView";
import { AtsCheckerModal } from "./AtsCheckerModal";
import { CoverLetterModal } from "./CoverLetterModal";
import { Button } from "@/components/ui/Button";
import {
  analyzeJdMatch,
  parseJobDescription,
  getSectionMatchChecklist,
} from "@/lib/tailor/jdAnalysis";
import { getClientAiUsage, recordClientAiUsage } from "@/lib/ai/rateLimit";

const SAMPLE_JD = `Senior Full Stack Engineer at Stripe
San Francisco, CA (or Remote)

About the Role:
We are looking for a Senior Full Stack Engineer to build next-generation payment infrastructure and real-time developer dashboards. You will architect distributed systems that handle billions of dollars in global transactions with 99.999% uptime.

Responsibilities:
- Architect, build, and maintain high-throughput APIs and web applications using React, TypeScript, and Node.js.
- Optimize distributed databases and caching layers using PostgreSQL, Redis, and Docker.
- Collaborate with product designers and engineers to deliver intuitive, accessible customer experiences.
- Benchmark system performance and reduce latency across critical payment paths.

Requirements:
- 4+ years of professional software engineering experience.
- Strong proficiency in modern TypeScript, React, and server-side engineering (Node.js, Go, or Python).
- Hands-on experience with cloud infrastructure (AWS or GCP), Docker, and CI/CD pipelines.
- Deep understanding of RESTful API design, database schemas, and microservices architecture.

Nice to Have:
- Experience with Next.js, GraphQL, Redis, and Tailwind CSS.
- Familiarity with financial systems or high-compliance security standards (SOC2, PCI-DSS).`;

export const TailorWorkspace: React.FC = () => {
  const {
    resume,
    versions,
    activeVersionId,
    switchVersion,
    createTailoredVersion,
    deleteVersion,
    updateVersionDiffStatus,
    acceptAllVersionDiffs,
    rejectAllVersionDiffs,
    updateVersionCoverLetter,
  } = useResume();

  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState(getClientAiUsage());

  // Active version details
  const activeVersion = versions.find((v) => v.id === activeVersionId);

  // If a tailored version is active, populate its JD
  useEffect(() => {
    if (activeVersion?.jdText) {
      setJdText(activeVersion.jdText);
    }
  }, [activeVersionId, activeVersion?.jdText]);

  // Active target resume (tailored version or primary base resume)
  const targetResume = activeVersion ? activeVersion.tailoredResume : resume;

  // Real-time deterministic analysis (100% client-side, 0 paid API calls)
  const matchReport = useMemo(() => analyzeJdMatch(jdText, targetResume), [jdText, targetResume]);
  const parsedJd = useMemo(() => parseJobDescription(jdText), [jdText]);
  const sectionChecklist = useMemo(() => {
    if (!jdText.trim()) return [];
    return getSectionMatchChecklist(targetResume, parsedJd, matchReport);
  }, [targetResume, parsedJd, matchReport, jdText]);

  const checklistPassCount = sectionChecklist.filter((i) => i.status === "pass").length;

  // Handle Gemini AI Tailoring
  const handleTailor = async () => {
    if (!jdText.trim()) {
      setErrorMsg("Please paste a job description first.");
      return;
    }

    const currentLimit = getClientAiUsage();
    if (currentLimit.remaining <= 0) {
      setErrorMsg(
        `Rate limit reached (10 requests per hour). Reset in ${currentLimit.resetMinutes} minutes to protect free quota.`
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

      recordClientAiUsage();
      setRateLimit(getClientAiUsage());

      // Create a separate version (Company - Role) without touching base resume
      const versionName = `${data.company || "Target"} — ${data.role || "Tailored"}`;
      createTailoredVersion({
        name: versionName,
        company: data.company || "Company",
        role: data.role || "Role",
        jdText,
        tailoredResume: data.tailoredResume,
        diffs: data.diffs || [],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during tailoring.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. Header & Flagship Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Match & Tailor 2.0
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-[#93C5FD] border border-blue-200 dark:border-blue-900/40">
              Flagship
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
            Instant keyword gap analysis, truthful AI tailoring, and non-destructive versions.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAtsModalOpen(true)}
          >
            🛡️ ATS Checker
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsCoverLetterModalOpen(true)}
          >
            ✉️ Cover Letter
          </Button>
        </div>
      </div>

      {/* 2. Resume Versions Switcher Bar */}
      <div className="p-4 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
          <span>Active Resume Document:</span>
          <span className="font-mono">{versions.length} Tailored Version{versions.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Base Resume Pill */}
          <button
            type="button"
            onClick={() => switchVersion(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              activeVersionId === null
                ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-200/80"
            }`}
          >
            <span>📄 Base Resume (Primary)</span>
          </button>

          {/* Tailored Version Pills */}
          {versions.map((ver) => {
            const isActive = activeVersionId === ver.id;
            return (
              <div
                key={ver.id}
                className={`flex items-center rounded-lg border text-xs shrink-0 transition overflow-hidden ${
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-200/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => switchVersion(ver.id)}
                  className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none"
                >
                  <span>🎯</span>
                  <span className="truncate max-w-[160px]">{ver.name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVersion(ver.id);
                  }}
                  title="Delete this tailored version"
                  className={`px-2 py-1.5 border-l transition cursor-pointer ${
                    isActive
                      ? "border-blue-400/50 hover:bg-blue-600 text-blue-100"
                      : "border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] hover:text-[#DC2626]"
                  }`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Job Description Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs">
            Target Job Description:
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setJdText(SAMPLE_JD)}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-medium hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              + Load Sample Stripe JD
            </button>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
              {jdText.length}/8,000 chars
            </span>
          </div>
        </div>

        <textarea
          rows={5}
          value={jdText}
          maxLength={8000}
          onChange={(e) => {
            setJdText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="Paste requirements, responsibilities, or tech stack from the job posting..."
          className="w-full p-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] text-sm placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] transition resize-y shadow-2xs leading-relaxed"
        />

        {/* Detected JD Details Pill Bar */}
        {jdText.trim() && (
          <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#CBD5E1] bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] flex-wrap">
            <span>
              Target: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{parsedJd.role}</strong>
            </span>
            <span>•</span>
            <span>
              Company: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{parsedJd.company}</strong>
            </span>
            <span>•</span>
            <span>
              Seniority: <strong className="text-[#2563EB] dark:text-[#60A5FA]">{parsedJd.seniority}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 4. Match View: Score Ring, Keyword Categorization & Section Checklist */}
      {jdText.trim() ? (
        <div className="p-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
            <ScoreRing
              score={matchReport.score}
              size={100}
              strokeWidth={9}
              label="Keyword Match"
              sublabel="Keyword match estimate, not an ATS guarantee"
            />

            <div className="flex-1 space-y-1 sm:pl-3 text-center sm:text-left">
              <h4 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Match Analysis
              </h4>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Found <strong>{matchReport.matchedKeywords.length}</strong> of{" "}
                <strong>{matchReport.totalKeywords}</strong> target keywords in your resume.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <span className="text-[#059669] dark:text-[#34D399] font-medium">
                  ✓ {matchReport.matchedKeywords.length} Matched
                </span>
                <span>•</span>
                <span className="text-[#D97706] dark:text-[#FBBF24] font-medium">
                  💡 {matchReport.trueSoundingKeywords.length} True-Sounding
                </span>
                <span>•</span>
                <span className="text-[#DC2626] dark:text-[#F87171] font-medium">
                  + {matchReport.missingGaps.length} Gaps
                </span>
              </div>
            </div>
          </div>

          {/* Matched Keywords (Green) with Exact Location Tags */}
          {matchReport.matchedKeywords.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                Matched in your resume (with exact locations):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchReport.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#065F46] dark:text-[#6EE7B7] text-xs font-medium"
                  >
                    <span>✓ {kw.keyword}</span>
                    {kw.locations.length > 0 && (
                      <span className="text-[10px] font-normal text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded font-mono">
                        {kw.locations[0]}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing but True-Sounding Keywords (Amber) */}
          {matchReport.trueSoundingKeywords.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#92400E] dark:text-[#FCD34D]">
                  Adjacent Opportunities (True-Sounding):
                </span>
                <span className="text-xs text-[#B45309] dark:text-[#FBBF24] italic">
                  &quot;Add only if you really have this&quot;
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchReport.trueSoundingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[#92400E] dark:text-[#FCD34D] text-xs font-medium"
                  >
                    💡 {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gaps (Red) */}
          {matchReport.missingGaps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#DC2626] dark:text-[#F87171]">
                Gaps from Job Description:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchReport.missingGaps.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[#991B1B] dark:text-[#FCA5A5] text-xs font-medium"
                  >
                    + {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section-by-Section Alignment Checklist */}
          {sectionChecklist.length > 0 && (
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Section-by-Section Checklist
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]">
                    Client-Side Match
                  </span>
                </div>
                <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                  {checklistPassCount} of {sectionChecklist.length} sections aligned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {sectionChecklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      item.status === "pass"
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40"
                        : item.status === "warn"
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40"
                        : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        item.status === "pass"
                          ? "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300"
                          : item.status === "warn"
                          ? "bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300"
                          : "bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {item.status === "pass" ? "✓" : item.status === "warn" ? "!" : "✕"}
                    </span>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {item.section}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                            item.status === "pass"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                              : item.status === "warn"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        {item.detail}
                      </p>
                      {item.actionHint && item.status !== "pass" && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                          <span>💡 Recommendation:</span>
                          <span className="italic">{item.actionHint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto text-lg font-bold">
            🎯
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Real-Time Match Analysis & Section Checklist
            </h4>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] max-w-md mx-auto mt-1 leading-relaxed">
              Paste a target job description above to calculate your match score (0–100), view matched & missing keywords, and get an instant section-by-section breakdown — 100% free with no AI quota required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setJdText(SAMPLE_JD)}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            + Try with Sample Stripe JD
          </button>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[#991B1B] dark:text-[#FCA5A5] rounded-lg text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 5. Primary AI Tailoring Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <span className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            Create Truthful Tailored Version
          </span>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Generates a separate version (`{parsedJd.company || "Company"} — {parsedJd.role || "Role"}`) with protected original data.
          </p>
          {!jdText.trim() && (
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] italic mt-1">
              Paste a target job description above to enable AI tailoring.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={loading || !jdText.trim() || rateLimit.remaining <= 0}
            onClick={handleTailor}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Tailoring with Gemini AI...</span>
              </span>
            ) : (
              <span>✨ Tailor Resume with AI</span>
            )}
          </Button>
        </div>
      </div>

      {/* 6. Active Version Diff Reviewer */}
      {activeVersion && activeVersion.diffs && activeVersion.diffs.length > 0 && (
        <div className="pt-2">
          <TailorDiffView
            versionName={activeVersion.name}
            diffs={activeVersion.diffs}
            onAcceptDiff={(diffId) => updateVersionDiffStatus(activeVersion.id, diffId, "accepted")}
            onRejectDiff={(diffId) => updateVersionDiffStatus(activeVersion.id, diffId, "rejected")}
            onAcceptAll={() => acceptAllVersionDiffs(activeVersion.id)}
            onRejectAll={() => rejectAllVersionDiffs(activeVersion.id)}
          />
        </div>
      )}

      {/* Modals */}
      <AtsCheckerModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        resume={activeVersion ? activeVersion.tailoredResume : resume}
      />

      <CoverLetterModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
        resume={activeVersion ? activeVersion.tailoredResume : resume}
        initialJd={jdText}
        savedCoverLetter={activeVersion?.coverLetter}
        onSaveCoverLetter={(letter) => {
          if (activeVersion) updateVersionCoverLetter(activeVersion.id, letter);
        }}
      />
    </div>
  );
};
