"use client";

import React, { useState, useMemo } from "react";
import {
  TEMPLATE_REGISTRY,
  GALLERY_FILTERS,
  filterTemplates,
  type GalleryFilterId,
  type TemplateDefinition,
} from "@/templates/registry";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { useResume } from "@/context/ResumeContext";

interface TemplateGalleryProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onOpenEditor?: () => void;
}

interface AtsRiskInfo {
  level: "low" | "medium" | "high";
  label: string;
  title: string;
  tooltip: string;
  badgeClass: string;
  icon: string;
}

function getAtsRiskInfo(template: TemplateDefinition): AtsRiskInfo {
  // High risk: templates with photo portraits or creative visual layouts
  if (
    template.supportsPhoto ||
    template.layoutFamily === "creative" ||
    template.layoutFamily === "editorial" ||
    template.layoutFamily === "split" ||
    template.layoutFamily === "playful-studio" ||
    template.layoutFamily === "organic-green"
  ) {
    return {
      level: "high",
      label: "High ATS Risk",
      title: "High ATS Risk: Photo & Graphics",
      tooltip:
        "Headshot photos, multi-tone graphic panels, or custom visual elements can be discarded or scrambled by corporate ATS parsers (Workday, Taleo). Best for portfolios and creative agencies.",
      badgeClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
      icon: "⚠️",
    };
  }

  // Medium risk: two-column or sidebar layouts without photos
  if (template.isTwoColumn) {
    return {
      level: "medium",
      label: "Medium ATS Risk",
      title: "Medium ATS Risk: Multi-Column",
      tooltip:
        "Multi-column or sidebar text flow can be parsed out-of-order in older enterprise ATS parsers (iCIMS, older Taleo). Recommended for modern applicant portals and direct human review.",
      badgeClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
      icon: "⚠️",
    };
  }

  // Low risk: standard 1-column linear ATS layout
  return {
    level: "low",
    label: "Low ATS Risk",
    title: "Low ATS Risk: Universal Scannability",
    tooltip:
      "Strict single-column layout with standard headings, fully readable by 100% of enterprise Applicant Tracking Systems without parsing degradation.",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    icon: "🛡️",
  };
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onOpenEditor,
}) => {
  const { resume } = useResume();
  const [activeFilter, setActiveFilter] = useState<GalleryFilterId>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);

  // Compute filtered templates
  const filteredTemplates = useMemo(() => {
    return filterTemplates(TEMPLATE_REGISTRY, activeFilter, searchQuery);
  }, [activeFilter, searchQuery]);

  // Compute counts for each filter
  const filterCounts = useMemo(() => {
    const counts: Record<GalleryFilterId, number> = {
      all: TEMPLATE_REGISTRY.length,
      ats: TEMPLATE_REGISTRY.filter((t) => t.isAtsSafe).length,
      "two-column": TEMPLATE_REGISTRY.filter((t) => t.isTwoColumn).length,
      traditional: TEMPLATE_REGISTRY.filter((t) => t.category === "Traditional").length,
      modern: TEMPLATE_REGISTRY.filter((t) => t.category === "Modern").length,
      minimal: TEMPLATE_REGISTRY.filter((t) => t.category === "Minimal").length,
      executive: TEMPLATE_REGISTRY.filter((t) => t.category === "Executive").length,
    };
    return counts;
  }, []);

  const handleApplyTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    if (onOpenEditor) {
      onOpenEditor();
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#090D16] p-6 sm:p-8 md:p-10 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/40">
                Verified Architectures
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Vector PDF & ATS Compatible
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Templates Library
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Choose an authentic document design. Switching templates preserves 100% of your resume content.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              aria-label="Search resume templates"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GALLERY_FILTERS.map((f) => {
            const count = filterCounts[f.id] ?? 0;
            const isActive = activeFilter === f.id;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                    : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white font-semibold"
                      : "bg-black/[0.06] dark:bg-white/[0.08] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Counter & Active Query Status */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredTemplates.length}</strong> of {TEMPLATE_REGISTRY.length} templates
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {(activeFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Verified Template Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((template: TemplateDefinition) => {
              const isSelected = selectedTemplate === template.id;
              const atsRisk = getAtsRiskInfo(template);

              return (
                <div
                  key={template.id}
                  className={`group bg-white dark:bg-[#0F172A] rounded-xl border p-4 flex flex-col justify-between transition-all duration-150 hover:shadow-md ${
                    isSelected
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Visual Miniature Layout Thumbnail with Smooth Hover Zoom */}
                    <div
                      className="relative cursor-pointer overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900 p-2.5 group/zoom flex items-center justify-center border border-slate-200 dark:border-slate-800"
                      onClick={() => setPreviewingTemplateId(template.id)}
                      title={`Click to preview full-size ${template.name}`}
                    >
                      <div className="w-full transition-transform duration-200 ease-out group-hover/zoom:scale-105">
                        <TemplateThumbnail template={template} isSelected={isSelected} />
                      </div>

                      {/* Hover Zoom & Preview Overlay */}
                      <div className="absolute inset-0 bg-slate-950/20 dark:bg-black/40 opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold shadow-lg backdrop-blur-xs flex items-center gap-1.5 transform scale-95 group-hover/zoom:scale-100 transition-transform">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                          <span>Preview Full</span>
                        </span>
                      </div>
                    </div>

                    {/* Template Header & Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: template.accentColor }}
                          />
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {template.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {template.category}
                        </span>
                      </div>

                      {/* Honest ATS Risk Badge + Warning Tooltip + Attribute Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* ATS Risk Badge with Tooltip */}
                        <div className="relative group/tooltip inline-flex">
                          <div
                            tabIndex={0}
                            role="button"
                            aria-label={`${atsRisk.title}: ${atsRisk.tooltip}`}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-help select-none focus:outline-none focus:ring-1 focus:ring-[#2563EB] ${atsRisk.badgeClass}`}
                          >
                            <span>{atsRisk.icon}</span>
                            <span>{atsRisk.label}</span>
                            {(atsRisk.level === "medium" || atsRisk.level === "high") && (
                              <span className="opacity-70 text-[9px]">ℹ️</span>
                            )}
                          </div>

                          {/* Hover Tooltip Popup */}
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] leading-snug shadow-xl border border-slate-700/80 pointer-events-none opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all duration-150 z-30 text-left">
                            <div className="font-semibold text-white mb-1 flex items-center gap-1">
                              <span>{atsRisk.icon}</span>
                              <span>{atsRisk.title}</span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed">{atsRisk.tooltip}</p>
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                          </div>
                        </div>

                        {/* Two-Column Attribute Pill */}
                        {template.isTwoColumn && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] dark:bg-blue-950/40 dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/40">
                            2-Column
                          </span>
                        )}

                        {/* Photo Attribute Pill */}
                        {template.supportsPhoto && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                            📷 Photo
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewingTemplateId(template.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(template.id)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                        isSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                      }`}
                    >
                      {isSelected ? "Active" : "Apply"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
            <span className="text-3xl">🔍</span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              No templates match your search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewingTemplateId && (
        <TemplatePreviewModal
          isOpen={Boolean(previewingTemplateId)}
          onClose={() => setPreviewingTemplateId(null)}
          templateId={previewingTemplateId}
          resume={resume}
          onSelectAndApply={handleApplyTemplate}
        />
      )}
    </div>
  );
};

export default TemplateGallery;
