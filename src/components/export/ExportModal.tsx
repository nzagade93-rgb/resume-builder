"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { downloadResumeDocx } from "@/lib/export/docxExport";
import { downloadResumeTxt, exportToTxt } from "@/lib/export/txtExport";
import { printVectorPdf } from "@/lib/export/pdfExport";
import { verifyResumeReadingOrder } from "@/lib/export/pdfVerification";
import type { Resume } from "@/types/resume";

export type ExportFormat = "pdf" | "docx" | "txt";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
  onUpdatePageSize?: (size: "A4" | "Letter") => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  resume,
  onUpdatePageSize,
}) => {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [pageSize, setPageSize] = useState<"A4" | "Letter">(
    resume.meta?.pageSize || "A4"
  );

  const defaultBaseName = `${(resume.basics.name || "Candidate").replace(/[^a-zA-Z0-9]/g, "_")}_${(
    resume.basics.headline ||
    resume.basics.title ||
    "Role"
  ).replace(/[^a-zA-Z0-9]/g, "_")}_Resume`;

  const [filenameBase, setFilenameBase] = useState(defaultBaseName);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ATS Pre-check
  const atsCheck = verifyResumeReadingOrder(resume);

  const handlePageSizeChange = (newSize: "A4" | "Letter") => {
    setPageSize(newSize);
    if (onUpdatePageSize) onUpdatePageSize(newSize);
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    try {
      if (format === "pdf") {
        printVectorPdf(resume, filenameBase);
        onClose();
      } else if (format === "docx") {
        await downloadResumeDocx(resume, `${filenameBase}.docx`, { pageSize });
        onClose();
      } else if (format === "txt") {
        downloadResumeTxt(resume, `${filenameBase}.txt`);
        onClose();
      }
    } catch (err: any) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyTxt = () => {
    const text = exportToTxt(resume);
    navigator.clipboard.writeText(text);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📥 Export Resume"
      description="Select your target format. All options preserve ATS keyword indexing and document structure."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Format Selector Pills */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-900 dark:text-slate-100">
            Export Format:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* PDF */}
            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                format === "pdf"
                  ? "border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-[#2563EB]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  📄 PDF
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Vector Text
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Selectable vector text, embedded typography & working hyperlinks.
              </p>
            </button>

            {/* DOCX */}
            <button
              type="button"
              onClick={() => setFormat("docx")}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                format === "docx"
                  ? "border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-[#2563EB]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  📝 DOCX
                </span>
                <span className="text-[10px] font-semibold text-[#2563EB] bg-blue-50 dark:bg-blue-950/40 dark:text-[#60A5FA] px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/40">
                  ATS Word
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Real Word headings & bullet lists. No tables or textboxes.
              </p>
            </button>

            {/* TXT */}
            <button
              type="button"
              onClick={() => setFormat("txt")}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                format === "txt"
                  ? "border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-[#2563EB]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  📋 Plain Text
                </span>
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  .txt
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                ASCII formatted text for rapid pasting into online job portals.
              </p>
            </button>
          </div>
        </div>

        {/* Page Size & Filename Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
          {/* Filename Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              File Name:
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={filenameBase}
                onChange={(e) => setFilenameBase(e.target.value)}
                className="w-full text-xs p-2.5 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
              <span className="p-2.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-r-lg">
                .{format}
              </span>
            </div>
          </div>

          {/* Page Size Switcher */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Document Page Size:
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageSizeChange("A4")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold border transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  pageSize === "A4"
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                A4 (Standard)
              </button>
              <button
                type="button"
                onClick={() => handlePageSizeChange("Letter")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold border transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  pageSize === "Letter"
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                US Letter
              </button>
            </div>
          </div>
        </div>

        {/* Automated ATS Readability Check Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            atsCheck.passed
              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
              : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
          }`}
        >
          <span className="text-xl leading-none">
            {atsCheck.passed ? "🛡️" : "⚠️"}
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h5
                className={`font-semibold text-xs ${
                  atsCheck.passed
                    ? "text-emerald-900 dark:text-emerald-200"
                    : "text-amber-900 dark:text-amber-200"
                }`}
              >
                {atsCheck.passed
                  ? "ATS Readability Check Passed"
                  : "ATS Readability Warnings"}
              </h5>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  atsCheck.passed
                    ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200"
                    : "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                }`}
              >
                Score: {atsCheck.score}/100
              </span>
            </div>

            <p
              className={`text-[11.5px] leading-relaxed ${
                atsCheck.passed
                  ? "text-emerald-800 dark:text-emerald-300/90"
                  : "text-amber-800 dark:text-amber-300/90"
              }`}
            >
              {atsCheck.passed
                ? "Document contains valid selectable text, sequential headings, and parseable contact info."
                : atsCheck.problems.join("; ")}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          {format === "txt" ? (
            <button
              type="button"
              onClick={handleCopyTxt}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              {copiedTxt ? "✓ Copied to clipboard!" : "📋 Copy Plain Text"}
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {format === "pdf" ? "Prints with exact @page margins" : "Compatible with MS Word 2016+"}
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isExporting}
              onClick={handleExecuteExport}
            >
              {isExporting ? (
                "Generating..."
              ) : (
                <>
                  <span>
                    {format === "pdf"
                      ? "🖨️ Save as Vector PDF"
                      : format === "docx"
                      ? "📥 Download Word (.docx)"
                      : "📥 Download Text (.txt)"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
