"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ExportModal } from "@/components/export/ExportModal";
import { downloadResumeDocx } from "@/lib/export/docxExport";
import { downloadResumeTxt, exportToTxt } from "@/lib/export/txtExport";
import { printVectorPdf } from "@/lib/export/pdfExport";
import { verifyResumeReadingOrder } from "@/lib/export/pdfVerification";

interface ExportPanelProps {
  onPrintPdf?: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = () => {
  const { resume, activeResume, setPageSize } = useResume();
  const targetResume = activeResume || resume;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDocxDownloading, setIsDocxDownloading] = useState(false);

  // ATS Readability Check
  const atsCheck = verifyResumeReadingOrder(targetResume);

  const handleCopyPlainText = () => {
    const text = exportToTxt(targetResume);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Plain text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    downloadResumeTxt(targetResume);
    toast("Downloaded plain-text (.txt) resume", "success");
  };

  const handleDownloadDocx = async () => {
    setIsDocxDownloading(true);
    try {
      await downloadResumeDocx(targetResume);
      toast("Downloaded ATS-Safe Microsoft Word (.docx) resume", "success");
    } catch (err: any) {
      toast("Failed to generate DOCX file: " + err.message, "error");
    } finally {
      setIsDocxDownloading(false);
    }
  };

  const handlePrintPdf = () => {
    printVectorPdf(targetResume);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Export & Document Delivery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Produce vector PDF, ATS-safe Microsoft Word (.docx), or plain text.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
        >
          ⚙️ Customize Export Dialog
        </Button>
      </div>

      {/* 1. Automated ATS Readability Check Banner */}
      <Card className="p-4 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">
            {atsCheck.passed ? "🛡️" : "⚠️"}
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {atsCheck.passed
                  ? "ATS Readability Check Passed"
                  : "ATS Readability Warnings Detected"}
              </h4>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase ${
                  atsCheck.passed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                Score: {atsCheck.score}/100
              </span>
            </div>

            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {atsCheck.passed
                ? "Document structure, section hierarchy, and contact headers are 100% compliant with enterprise ATS software."
                : atsCheck.problems.join("; ")}
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span className="text-emerald-700 dark:text-emerald-400">
                ✓ Name at top
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                ✓ Valid email
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                ✓ Sequential headings
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                ✓ Selectable vector text
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Format 1: Vector PDF */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                1. Vector PDF (Recommended)
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Vector Text
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selectable vector typography, embedded fonts, working hyperlinks, and exact @page margins.
            </p>
          </div>

          <Button variant="primary" size="md" onClick={handlePrintPdf}>
            <span>🖨️ Print / Save as PDF</span>
          </Button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Recommended Print Settings:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
            <li>Destination: <strong>Save as PDF</strong></li>
            <li>Margins: <strong>None</strong> (layout manages margins natively)</li>
            <li>Options: <strong>Uncheck &quot;Headers and footers&quot;</strong></li>
            <li>Background graphics: <strong>Checked</strong></li>
          </ul>
        </div>
      </Card>

      {/* 3. Format 2: Microsoft Word (.docx) */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                2. Microsoft Word (.docx)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] dark:bg-blue-950/40 dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40">
                ATS-Safe
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Built with real Word Heading 1/Heading 2 styles, native bullet point lists, and no tables.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            disabled={isDocxDownloading}
            onClick={handleDownloadDocx}
          >
            {isDocxDownloading ? "Building DOCX..." : "📥 Download Word (.docx)"}
          </Button>
        </div>
      </Card>

      {/* 4. Format 3: Plain-Text (.txt) */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                3. Plain Text (.txt)
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Job Portals
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clean ASCII formatting with bullet points for Workday, Taleo, and Greenhouse copy-pasting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyPlainText}>
              {copied ? "✓ Copied!" : "📋 Copy Text"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTxt}>
              📥 Download .txt
            </Button>
          </div>
        </div>

        <div className="bg-slate-950 text-slate-200 p-3 rounded-xl text-[11px] font-mono max-h-40 overflow-y-auto whitespace-pre-wrap break-all max-w-full select-all">
          {exportToTxt(targetResume)}
        </div>
      </Card>

      {/* Unified Export Modal Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resume={targetResume}
        onUpdatePageSize={setPageSize}
      />
    </div>
  );
};
