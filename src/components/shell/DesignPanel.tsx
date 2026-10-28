"use client";

import React, { useState } from "react";
import { templateOptions } from "@/templates";
import { useResume } from "@/context/ResumeContext";
import { useToast } from "@/components/ui/Toast";
import type { DesignMeta } from "@/types/resume";

interface DesignPanelProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onOpenGallery?: () => void;
}

const FONT_PAIRINGS: {
  id: DesignMeta["fontPairing"];
  title: string;
  fontFamily: string;
  description: string;
}[] = [
  {
    id: "modern-sans",
    title: "Modern Sans (Inter)",
    fontFamily: "Inter, sans-serif",
    description: "Clean, tech-forward, high readability for software & product roles.",
  },
  {
    id: "editorial-serif",
    title: "Editorial Serif (Fraunces)",
    fontFamily: "Fraunces, serif",
    description: "Distinctive, authoritative, warm for design & creative leadership.",
  },
  {
    id: "academic-classic",
    title: "Academic Classic (Merriweather)",
    fontFamily: "Merriweather, Georgia, serif",
    description: "Traditional and scholarly for law, medicine, finance & academia.",
  },
  {
    id: "tech-mono",
    title: "Tech Mono (Geist Mono)",
    fontFamily: "ui-monospace, monospace",
    description: "Precision, terminal, engineering for DevOps, SREs & systems.",
  },
  {
    id: "executive-elegance",
    title: "Executive Elegance (Playfair)",
    fontFamily: "Playfair Display, serif",
    description: "Prestigious, dignified, leadership for executives & directors.",
  },
  {
    id: "clean-minimal",
    title: "Clean Minimal (System)",
    fontFamily: "system-ui, sans-serif",
    description: "Universal ATS compatibility and maximum legibility.",
  },
];

const ACCENT_SWATCHES = [
  { name: "Slate Navy", hex: "#0F172A" },
  { name: "Linear Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#059669" },
  { name: "Forest", hex: "#164E28" },
  { name: "Teal", hex: "#0F766E" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Burgundy", hex: "#881337" },
  { name: "Neutral Slate", hex: "#475569" },
];

export const DesignPanel: React.FC<DesignPanelProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onOpenGallery,
}) => {
  const { resume, updateDesignMeta, setPageSize } = useResume();
  const { toast } = useToast();

  const design = resume.meta?.design || {
    font: "sans" as const,
    fontPairing: "modern-sans" as const,
    accent: "#2563EB",
    fontScale: 1.0,
    lineHeight: 1.4,
    margins: "normal" as const,
    sectionSpacing: "normal" as const,
    targetPages: 1,
  };

  const pageSize = resume.meta?.pageSize || "A4";

  // Active template metadata
  const currentTemplate =
    templateOptions.find((t) => t.id === selectedTemplate) || templateOptions[0];

  // Auto-fit to 1 page
  const handleAutoFit = () => {
    updateDesignMeta({
      targetPages: 1,
      fontScale: 0.92,
      lineHeight: 1.35,
      sectionSpacing: "compact",
      margins: "compact",
    });
    toast?.("Layout scaled cleanly to fit exactly 1 page.", "success");
  };

  // Determine active density preset
  const currentDensity: "compact" | "normal" | "generous" =
    design.margins === "compact" && design.sectionSpacing === "compact"
      ? "compact"
      : design.margins === "generous" && design.sectionSpacing === "generous"
      ? "generous"
      : "normal";

  const handleSetDensity = (density: "compact" | "normal" | "generous") => {
    if (density === "compact") {
      updateDesignMeta({
        margins: "compact",
        sectionSpacing: "compact",
        lineHeight: 1.35,
      });
    } else if (density === "generous") {
      updateDesignMeta({
        margins: "generous",
        sectionSpacing: "generous",
        lineHeight: 1.5,
      });
    } else {
      updateDesignMeta({
        margins: "normal",
        sectionSpacing: "normal",
        lineHeight: 1.4,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* 1. Header */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Design & Formatting
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
          Fine-tune layout geometry, typography, and visual density.
        </p>
      </div>

      {/* 2. Current Template Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
            style={{ backgroundColor: currentTemplate.accentColor }}
          >
            {currentTemplate.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {currentTemplate.name}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]">
                {currentTemplate.isAtsSafe ? "ATS-Verified" : "Creative"}
              </span>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
              {currentTemplate.description}
            </p>
          </div>
        </div>

        {onOpenGallery && (
          <button
            type="button"
            onClick={onOpenGallery}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            Change →
          </button>
        )}
      </div>

      {/* 3. Page Budget & Document Length (Segmented Control) */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Page Length Target
          </label>
          <button
            type="button"
            onClick={handleAutoFit}
            className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
          >
            ⚡ Auto-fit to 1 Page
          </button>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => updateDesignMeta({ targetPages: 1 })}
            className={`py-2 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              design.targetPages === 1
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            }`}
          >
            Strict 1 Page
          </button>
          <button
            type="button"
            onClick={() => updateDesignMeta({ targetPages: 2 })}
            className={`py-2 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              design.targetPages === 2
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            }`}
          >
            Multi-Page (2+)
          </button>
        </div>
      </div>

      {/* 4. Typography & Font Scale */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Font Pairing
          </label>
        </div>

        <div className="relative">
          <select
            value={design.fontPairing || "modern-sans"}
            onChange={(e) =>
              updateDesignMeta({ fontPairing: e.target.value as DesignMeta["fontPairing"] })
            }
            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
          >
            {FONT_PAIRINGS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#475569] dark:text-[#94A3B8]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#475569] dark:text-[#94A3B8]">Text Size</span>
            <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-semibold">
              {Math.round((design.fontScale || 1.0) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium select-none">A</span>
            <input
              type="range"
              min="85"
              max="115"
              step="1"
              value={Math.round((design.fontScale || 1.0) * 100)}
              onChange={(e) =>
                updateDesignMeta({ fontScale: Number(e.target.value) / 100 })
              }
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
            <span className="text-sm text-[#475569] dark:text-[#CBD5E1] font-semibold select-none">A</span>
          </div>
        </div>
      </div>

      {/* 5. Layout Density & Spacing */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">
            Layout Density
          </label>
          <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Controls line spacing, section gaps, and page margins in harmony.
          </span>
        </div>

        <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => handleSetDensity("compact")}
            className={`py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              currentDensity === "compact"
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => handleSetDensity("normal")}
            className={`py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              currentDensity === "normal"
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            }`}
          >
            Regular
          </button>
          <button
            type="button"
            onClick={() => handleSetDensity("generous")}
            className={`py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              currentDensity === "generous"
                ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            }`}
          >
            Relaxed
          </button>
        </div>

        {/* Paper Format */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Paper Standard</span>
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium">
            <button
              type="button"
              onClick={() => setPageSize("A4")}
              className={`px-3 py-1 rounded transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                pageSize === "A4"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setPageSize("Letter")}
              className={`px-3 py-1 rounded transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                pageSize === "Letter"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              US Letter
            </button>
          </div>
        </div>
      </div>

      {/* 6. Accent Color Palette */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Accent Color
          </label>
          <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            {design.accent}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {ACCENT_SWATCHES.map((swatch) => {
            const isSelected =
              design.accent?.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => updateDesignMeta({ accent: swatch.hex })}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
                  isSelected ? "scale-110 ring-2 ring-[#2563EB] shadow-xs" : "hover:scale-105"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
              >
                {isSelected && (
                  <span className="text-white text-[10px] font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DesignPanel;
