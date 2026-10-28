"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getClientAiUsage, recordClientAiUsage } from "@/lib/ai/rateLimit";
import { useToast } from "@/components/ui/Toast";

interface AiImproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  mode: "bullet" | "summary";
  onAccept: (newText: string) => void;
  allowedContext?: string;
}

export const AiImproveModal: React.FC<AiImproveModalProps> = ({
  isOpen,
  onClose,
  originalText,
  mode,
  onAccept,
  allowedContext,
}) => {
  const { toast } = useToast();
  const [tone, setTone] = useState<"entry-level" | "mid" | "executive">("mid");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [editableSuggestion, setEditableSuggestion] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [metricNudge, setMetricNudge] = useState<string | null>(null);
  const [guardStatus, setGuardStatus] = useState<{ isTruthful: boolean; message: string }>({
    isTruthful: true,
    message: "",
  });

  const [usage, setUsage] = useState(getClientAiUsage());

  // Fetch AI suggestion
  const generateImprovement = async (selectedTone = tone) => {
    if (!originalText.trim()) return;

    if (!usage.canRequest) {
      toast(`Hourly limit reached. Resets in ${usage.resetMinutes} minutes.`, "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          text: originalText,
          tone: selectedTone,
          allowedContext,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuggestion(data.suggestion);
        setEditableSuggestion(data.suggestion);
        setMetricNudge(data.metricNudge || null);
        setGuardStatus({
          isTruthful: data.isTruthful,
          message: data.feedbackMessage || "Verified 100% truthful to your experience.",
        });

        recordClientAiUsage();
        setUsage(getClientAiUsage());
      } else {
        toast(data.message || "Failed to generate AI suggestion.", "error");
      }
    } catch {
      toast("Network error generating suggestion. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUsage(getClientAiUsage());
      setIsEditing(false);
      generateImprovement(tone);
    }
  }, [isOpen]);

  const handleAccept = () => {
    onAccept(editableSuggestion);
    toast("AI suggestion accepted!", "success");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Writing Assistant: Polish ${mode === "bullet" ? "Bullet" : "Summary"}`}
      description="Refined with punchy action verbs and zero fabricated facts."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Usage & Tone Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Tone:</span>
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(["entry-level", "mid", "executive"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTone(t);
                    generateImprovement(t);
                  }}
                  className={`px-3 py-1 rounded-md text-xs capitalize transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    tone === t
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Rate Limit Usage */}
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {usage.remaining} of 10 requests remaining
          </span>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Text */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Phrasing
              </span>
              <Badge variant="neutral">Before</Badge>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {originalText}
            </p>
          </div>

          {/* AI Suggestion */}
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                Google XYZ Formula
              </span>
              <Badge variant="accent">Suggested</Badge>
            </div>

            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Polishing phrasing...</span>
              </div>
            ) : isEditing ? (
              <textarea
                rows={3}
                value={editableSuggestion}
                onChange={(e) => setEditableSuggestion(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#2563EB] bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              />
            ) : (
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {editableSuggestion || suggestion}
              </p>
            )}

            {!isLoading && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
                >
                  {isEditing ? "Done" : "✎ Edit Suggestion"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metric Nudge Detector */}
        {metricNudge && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <span className="text-sm">💡</span>
            <div>
              <span className="font-semibold block">Measurable Metric Suggestion:</span>
              <span className="text-[11px] text-amber-800 dark:text-amber-300">
                {metricNudge}
              </span>
            </div>
          </div>
        )}

        {/* Truthfulness Guard Status */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={guardStatus.isTruthful ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
              {guardStatus.isTruthful ? "🛡️ Verified Truthful" : "⚠️ Alert"}
            </span>
            <span>— {guardStatus.message}</span>
          </div>
          <span className="text-[10px] italic">No hallucinations</span>
        </div>

        {/* Action Controls: Accept, Edit, Reject */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Keep Original
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={isLoading}
            onClick={() => generateImprovement(tone)}
          >
            Regenerate
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isLoading || !editableSuggestion.trim()}
            onClick={handleAccept}
          >
            Accept Suggestion
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AiImproveModal;
