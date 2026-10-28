"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { generateCoverLetter, type CoverLetterTone } from "@/lib/tailor/coverLetter";
import type { Resume } from "@/types/resume";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
  initialJd?: string;
  savedCoverLetter?: string;
  onSaveCoverLetter?: (letter: string) => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  resume,
  initialJd = "",
  savedCoverLetter = "",
  onSaveCoverLetter,
}) => {
  const [tone, setTone] = useState<CoverLetterTone>("confident");
  const [hiringManager, setHiringManager] = useState("Hiring Team");
  const [letterText, setLetterText] = useState(savedCoverLetter);
  const [copied, setCopied] = useState(false);

  // Generate initial letter if empty
  useEffect(() => {
    if (!letterText && isOpen) {
      const generated = generateCoverLetter({
        resume,
        jdText: initialJd,
        tone,
        hiringManager,
      });
      setLetterText(generated);
    }
  }, [isOpen]);

  const handleRegenerate = (selectedTone: CoverLetterTone) => {
    setTone(selectedTone);
    const generated = generateCoverLetter({
      resume,
      jdText: initialJd,
      tone: selectedTone,
      hiringManager,
    });
    setLetterText(generated);
    if (onSaveCoverLetter) onSaveCoverLetter(generated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([letterText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const candidateName = resume.basics.name.replace(/\s+/g, "_") || "Candidate";
    a.download = `${candidateName}_Cover_Letter.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.basics.name || "Candidate"} - Cover Letter</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #111827;
              padding: 40px;
              max-width: 720px;
              margin: 0 auto;
              font-size: 11pt;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
              font-size: inherit;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <pre>${letterText}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const wordCount = letterText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✉️ Tailored Cover Letter Studio"
      description="1-page targeted letter generated from your authentic resume and target job requirements."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Tone:</span>
            {(["confident", "formal", "modern"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleRegenerate(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  tone === t
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Hiring Manager input */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              To:
            </label>
            <input
              type="text"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16] transition"
              placeholder="e.g. Engineering Lead"
            />
          </div>
        </div>

        {/* Live Editable Textarea */}
        <div className="relative">
          <textarea
            rows={14}
            value={letterText}
            onChange={(e) => {
              setLetterText(e.target.value);
              if (onSaveCoverLetter) onSaveCoverLetter(e.target.value);
            }}
            className="w-full text-xs p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans leading-relaxed placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16] transition resize-y"
            placeholder="Your truthful tailored cover letter..."
          />

          {/* Word count pill */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-1">
            <span>
              <span className="font-mono tabular-nums">{wordCount}</span> words •{" "}
              {wordCount <= 380 ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Perfect 1-page fit</span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Trim slightly for 1 page</span>
              )}
            </span>
            <span className="italic">Editable • 100% truthful to your resume</span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRegenerate(tone)}
          >
            ↻ Reset to Generated
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadTxt}
            >
              📥 Download .txt
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrint}
            >
              🖨️ Print / PDF
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
