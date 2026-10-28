"use client";

import React, { useState, useRef, useEffect } from "react";
import { templates, templateOptions } from "@/templates";
import type { Resume } from "@/types/resume";
import { useResume } from "@/context/ResumeContext";
import { useToast } from "@/components/ui/Toast";

export type ZoomLevel = "75%" | "100%" | "125%" | "fit";
export type PageViewMode = "sheets" | "continuous";

interface PreviewCanvasProps {
  resume: Resume;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  tailoredDraft: Resume | null;
  missingKeywords?: string[];
  onAcceptTailored: () => void;
  onRevertTailored: () => void;
  onPrintPdf: () => void;
  isFocusPreview?: boolean;
  onToggleFocusPreview?: () => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  resume,
  selectedTemplate,
  onSelectTemplate,
  tailoredDraft,
  missingKeywords = [],
  onAcceptTailored,
  onRevertTailored,
  onPrintPdf: _onPrintPdf,
  isFocusPreview = false,
  onToggleFocusPreview,
}) => {
  const { updateDesignMeta } = useResume();
  const { toast } = useToast();

  const [zoomMode, setZoomMode] = useState<ZoomLevel>("fit");
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>("sheets");
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [paperHeight, setPaperHeight] = useState<number>(1122);

  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Active resume being previewed (tailored draft takes precedence if present)
  const activeResume = tailoredDraft || resume;
  const TemplateComponent = templates[selectedTemplate] || templates.ats;
  const currentTemplateMeta =
    templateOptions.find((t) => t.id === selectedTemplate) || templateOptions[0];

  const pageSize = activeResume.meta?.pageSize || "A4";
  const design = activeResume.meta?.design;
  const targetPages = design?.targetPages || 1;

  // Single page dimensions in px at standard 96 DPI:
  // A4 is 210mm x 297mm ≈ 793.7px x 1122.5px
  // Letter is 8.5in x 11in = 816px x 1056px
  const paperWidthPx = pageSize === "Letter" ? 816 : 794;
  const singlePagePx = pageSize === "Letter" ? 1056 : 1122.5;

  // Measure container width with ResizeObserver for responsive auto-fit scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure natural unclipped content height via hidden measurer
  useEffect(() => {
    const el = measurerRef.current;
    if (!el) return;

    const measureHeight = () => {
      if (el) {
        const height = el.scrollHeight || el.offsetHeight || 1122;
        setPaperHeight(Math.max(1122, height));
      }
    };

    measureHeight();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setPaperHeight(Math.max(1122, Math.ceil(height)));
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeResume, selectedTemplate, design?.fontScale, design?.lineHeight, design?.margins, design?.sectionSpacing]);

  // Close template menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    };
    if (isTemplateMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTemplateMenuOpen]);

  const totalPages = Math.max(1, Math.ceil(paperHeight / singlePagePx));
  const isOverflowingTarget = targetPages === 1 && totalPages > 1;
  const excessLines = Math.max(1, Math.ceil((paperHeight - singlePagePx) / 22));

  // Compute responsive auto-fit scale
  const paddingOffset = containerWidth < 450 ? 24 : 56; // adaptive left + right padding
  const availableWidth = Math.max(220, (containerWidth || 800) - paddingOffset);
  const fitScale = Math.min(1.0, Math.max(0.28, Number((availableWidth / paperWidthPx).toFixed(3))));

  // Determine current effective scale factor
  const getCurrentScale = () => {
    switch (zoomMode) {
      case "fit":
        return fitScale;
      case "75%":
        return 0.75;
      case "125%":
        return 1.25;
      case "100%":
      default:
        return 1.0;
    }
  };

  const currentScale = getCurrentScale();

  // Gap between pages in visual separate sheets view
  const sheetGapPx = 32;
  const totalSheetsHeight =
    totalPages === 1
      ? singlePagePx
      : totalPages * singlePagePx + (totalPages - 1) * sheetGapPx;

  // 1-Click Auto-Fit Handlers
  const handleAutoFitToOnePage = () => {
    const targetScale = excessLines > 12 ? 0.88 : excessLines > 6 ? 0.92 : 0.95;
    updateDesignMeta({
      targetPages: 1,
      fontScale: targetScale,
      lineHeight: 1.35,
      sectionSpacing: "compact",
    });
    toast?.("✨ Layout Auto-Fit applied! Scaled to fit exactly 1 page.", "success");
  };

  const handleAcceptTwoPages = () => {
    updateDesignMeta({
      targetPages: 2,
      fontScale: 1.0,
      lineHeight: 1.45,
      sectionSpacing: "normal",
    });
    toast?.("Document budget expanded to 2 pages.", "info");
  };

  return (
    <section
      aria-label="Resume Live Preview"
      className="h-full flex-1 min-w-0 flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] overflow-hidden transition-colors duration-150 print:bg-transparent print:overflow-visible print:h-auto print:w-full print:block"
    >
      {/* =========================================================================
          TOP PREVIEW CONTROL BAR (Linear / Stripe Standard)
          ========================================================================= */}
      <div className="no-print bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 z-20 gap-3 min-w-0">
        {/* Left: Template Selector Dropdown */}
        <div ref={templateMenuRef} className="relative flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
            aria-expanded={isTemplateMenuOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs text-xs font-semibold transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentTemplateMeta?.accentColor }}
            />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">
              {currentTemplateMeta?.name || "Template"}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">
              {currentTemplateMeta?.isAtsSafe ? "ATS" : "Style"}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isTemplateMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Floating Dropdown List */}
          {isTemplateMenuOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl z-50 flex flex-col p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Dropdown Search */}
              <div className="px-1 pt-1 pb-1">
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Scrollable Template List */}
              <div className="overflow-y-auto max-h-64 space-y-0.5 px-0.5">
                {templateOptions
                  .filter((t) => {
                    if (!templateSearchQuery.trim()) return true;
                    const q = templateSearchQuery.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(q) ||
                      t.category.toLowerCase().includes(q) ||
                      t.description.toLowerCase().includes(q)
                    );
                  })
                  .map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => {
                          onSelectTemplate(tmpl.id);
                          setIsTemplateMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition flex items-start justify-between gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                          isSelected
                            ? "bg-[#2563EB] text-white font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tmpl.accentColor }}
                            />
                            <span className="text-xs font-medium truncate">{tmpl.name}</span>
                            <span
                              className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full ${
                                tmpl.isAtsSafe
                                  ? isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                            {tmpl.description}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-white shrink-0 font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Center / Right: Page Mode Toggle, Page Indicator, Zoom & Focus Layou        {/* Center / Right: Page Mode Toggle, Page Indicator, Zoom & Focus Layout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Page View Mode Switcher */}
          <div
            role="group"
            aria-label="Page View Mode"
            className="hidden md:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs select-none"
          >
            <button
              type="button"
              onClick={() => setPageViewMode("sheets")}
              aria-pressed={pageViewMode === "sheets"}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                pageViewMode === "sheets"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Separate sheets"
            >
              Sheets
            </button>
            <button
              type="button"
              onClick={() => setPageViewMode("continuous")}
              aria-pressed={pageViewMode === "continuous"}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                pageViewMode === "continuous"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Continuous scroll"
            >
              Continuous
            </button>
          </div>

          {/* Page Badge */}
          <span className="hidden xs:inline-block text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {totalPages} {totalPages === 1 ? "page" : "pages"}
          </span>

          {/* Zoom Segmented Control */}
          <div
            role="group"
            aria-label="Preview Zoom Controls"
            className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs select-none"
          >
            <button
              type="button"
              onClick={() => setZoomMode("fit")}
              aria-pressed={zoomMode === "fit"}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                zoomMode === "fit"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomMode("100%")}
              aria-pressed={zoomMode === "100%"}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                zoomMode === "100%"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              100%
            </button>
          </div>

          {/* Focus Preview / Full Screen Toggle */}
          {onToggleFocusPreview && (
            <button
              type="button"
              onClick={onToggleFocusPreview}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              title={isFocusPreview ? "Restore Split View" : "Maximize Document Preview"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                {isFocusPreview ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE PAGE BUDGET & AUTO-FIT SUPERPOWER BANNER
          ========================================================================= */}
      {isOverflowingTarget && (
        <div
          role="status"
          className="no-print bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200 z-10 shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">⚠️</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Spans <strong className="text-slate-900 dark:text-slate-100 font-mono tabular-nums">{totalPages} pages</strong> (exceeds 1-page target by ~{excessLines} lines).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFitToOnePage}
              className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Auto-Fit to 1 Page
            </button>
            <button
              type="button"
              onClick={handleAcceptTwoPages}
              className="px-3 py-1 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Allow 2 Pages
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          AI TAILORED NOTIFICATION BANNER
          ========================================================================= */}
      {tailoredDraft && (
        <div
          role="alert"
          className="no-print bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-200/80 dark:border-blue-900/40 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-900 dark:text-slate-100 z-10 shrink-0"
        >
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Viewing Tailored Version</span>
            <span className="text-slate-500 dark:text-slate-400">— Review before accepting</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAcceptTailored}
              className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Accept Changes
            </button>
            <button
              type="button"
              onClick={onRevertTailored}
              className="px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          OFF-SCREEN MEASUREMENT CONTAINER (Invisible, measures true content height)
          ========================================================================= */}
      <div
        ref={measurerRef}
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 pointer-events-none opacity-0 select-none no-print"
        style={{
          width: `${paperWidthPx}px`,
          boxSizing: "border-box",
        }}
      >
        <TemplateComponent resume={activeResume} design={activeResume.meta?.design} />
      </div>

      {/* =========================================================================
          SCROLLABLE APPLE CANVAS
          ========================================================================= */}
      <div
        ref={containerRef}
        className="flex-1 min-w-0 overflow-auto p-6 sm:p-8 md:p-10 bg-[#F5F5F7] dark:bg-[#000000] transition-colors print:p-0 print:m-0 print:bg-transparent print:overflow-visible print:h-auto print:w-full print:block"
      >
        <div className="min-w-full flex justify-center pb-24 print:p-0 print:m-0 print:block print:w-full">
          {/* Scaled bounding box: exactly matches visual scaled dimensions */}
          <div
            id="print-scale-box"
            style={{
              width: `${paperWidthPx * currentScale}px`,
              minHeight: `${totalSheetsHeight * currentScale}px`,
              transition: "width 0.15s ease-out, min-height 0.15s ease-out",
            }}
            className="shrink-0 print:!w-full print:!min-h-0 print:!block print:!static"
          >
            <div
              id="print-transform-box"
              style={{
                width: `${paperWidthPx}px`,
                transform: `scale(${currentScale})`,
                transformOrigin: "top left",
                transition: "transform 0.15s ease-out",
              }}
              className="print:!w-full print:!transform-none print:!block"
            >
              {/* ===================================================================
                  CASE A: MULTI-PAGE SEPARATE SHEETS (Authentic physical paper sheets)
                  =================================================================== */}
              {pageViewMode === "sheets" && totalPages > 1 && (
                <div className="flex flex-col items-center select-none no-print">
                  {Array.from({ length: totalPages }).map((_, pageIdx) => (
                    <React.Fragment key={pageIdx}>
                      {/* Individual Paper Sheet */}
                      <div
                        className="relative bg-white text-black shadow-[0_12px_44px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800 rounded-md select-text overflow-hidden transition-all duration-150"
                        style={{
                          width: `${paperWidthPx}px`,
                          height: `${singlePagePx}px`,
                          boxSizing: "border-box",
                        }}
                      >
                        {/* Page Number Pill (Top Right Corner) */}
                        <div className="absolute top-3 right-4 z-30 no-print flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold shadow-lg pointer-events-none select-none">
                          <span>Page {pageIdx + 1} of {totalPages}</span>
                        </div>

                        {/* Shifted content slice for this page */}
                        <div
                          style={{
                            transform: `translateY(-${pageIdx * singlePagePx}px)`,
                            transformOrigin: "top left",
                          }}
                        >
                          <TemplateComponent resume={activeResume} design={activeResume.meta?.design} />
                        </div>
                      </div>

                      {/* Inter-Page Canvas Divider */}
                      {pageIdx < totalPages - 1 && (
                        <div className="w-full flex items-center justify-center my-6 gap-3 select-none no-print">
                          <div className="h-px bg-slate-200 dark:bg-slate-800 w-28" />
                          <div className="px-3 py-1 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
                            <span>Page Break • Next: Page {pageIdx + 2} of {totalPages}</span>
                          </div>
                          <div className="h-px bg-slate-200 dark:bg-slate-800 w-28" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ===================================================================
                  CASE B: SINGLE PAGE OR CONTINUOUS DOCUMENT VIEW
                  =================================================================== */}
              {(pageViewMode === "continuous" || totalPages === 1) && (
                <div
                  className="relative bg-white text-black shadow-[0_12px_44px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800 rounded-md select-text overflow-hidden transition-all duration-150 no-print"
                  style={{
                    width: `${paperWidthPx}px`,
                    height: totalPages === 1 ? `${singlePagePx}px` : "auto",
                    minHeight: `${singlePagePx}px`,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Floating Page Badge */}
                  <div className="absolute top-3 right-4 z-30 no-print flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium pointer-events-none select-none">
                    <span>{totalPages === 1 ? "1-Page Document" : `Continuous • ${totalPages} Pages`}</span>
                  </div>

                  {/* Soft break lines in continuous mode if > 1 page */}
                  {pageViewMode === "continuous" &&
                    totalPages > 1 &&
                    Array.from({ length: totalPages - 1 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="absolute left-0 right-0 border-b border-dashed border-[#2563EB]/40 pointer-events-none no-print flex items-center justify-end pr-4 z-30"
                        style={{ top: `${(idx + 1) * singlePagePx}px` }}
                      >
                        <span className="bg-white dark:bg-[#0F172A] text-[#2563EB] dark:text-[#60A5FA] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/50 shadow-xs -translate-y-1/2">
                          Page Break (Page {idx + 2})
                        </span>
                      </div>
                    ))}

                  <TemplateComponent resume={activeResume} design={activeResume.meta?.design} />
                </div>
              )}

              {/* ===================================================================
                  CASE C: NATIVE PRINT DOCUMENT (Exclusively targeted by @media print)
                  =================================================================== */}
              <div
                id="printable-resume-paper"
                ref={paperRef}
                className="hidden print:block bg-white text-black print:!shadow-none print:!ring-0 print:!rounded-none print:!w-full print:!m-0 print:!border-none"
                style={{
                  width: pageSize === "Letter" ? "8.5in" : "210mm",
                  minHeight: pageSize === "Letter" ? "11in" : "297mm",
                  boxSizing: "border-box",
                }}
              >
                <TemplateComponent resume={activeResume} design={activeResume.meta?.design} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewCanvas;
