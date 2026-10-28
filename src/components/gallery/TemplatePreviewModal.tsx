"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import { templates } from "@/templates";
import { getTemplateDefinition } from "@/templates/registry";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  resume: Resume;
  onSelectAndApply: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  resume,
  onSelectAndApply,
}) => {
  if (!isOpen) return null;

  const templateDef = getTemplateDefinition(templateId);
  const TemplateComponent = templates[templateId] || templates.ats;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0F172A]">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: templateDef.accentColor }}
            />
            <div className="min-w-0">
              <h3
                id="preview-modal-title"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight"
              >
                {templateDef.name} — Live Preview
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {templateDef.category} • {templateDef.isAtsSafe ? "ATS-Certified" : "Visual"} • {templateDef.isTwoColumn ? "Two-Column" : "Single-Column"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectAndApply(templateId);
                onClose();
              }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Use This Template
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              aria-label="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Document Preview Scroll Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100 dark:bg-[#090D16] flex justify-center items-start">
          <div className="w-full max-w-[794px] bg-white text-slate-900 shadow-xl ring-1 ring-slate-900/10 rounded-[2px] p-2 min-h-[1050px]">
            <TemplateComponent resume={resume} design={resume.meta?.design} />
          </div>
        </div>
      </div>
    </div>
  );
};
