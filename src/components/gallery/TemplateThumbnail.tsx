"use client";

import React from "react";
import type { TemplateDefinition } from "@/templates/registry";

interface TemplateThumbnailProps {
  template: TemplateDefinition;
  isSelected?: boolean;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  template,
  isSelected = false,
}) => {
  const accent = template.accentColor || "#2563EB";
  const { layoutFamily } = template;

  return (
    <div
      className={`w-full aspect-[210/297] rounded-xl bg-white overflow-hidden relative shadow-md select-none transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between ring-1 ${
        isSelected
          ? "ring-2 ring-[#2563EB] shadow-lg shadow-[#2563EB]/20"
          : "ring-black/10 hover:ring-black/20 hover:shadow-lg"
      }`}
    >
      {/* Active selection checkmark overlay */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md z-20">
          ✓
        </div>
      )}

      {/* =========================================================================
          1. ATS STANDARD (Single Column Linear with ATS-Safe hierarchy)
          ========================================================================= */}
      {layoutFamily === "ats" && (
        <div className="space-y-1.5 w-full text-slate-900">
          <div className="border-b-2 border-slate-900 pb-1">
            <div className="h-2.5 w-20 bg-slate-900 rounded-[1px]" />
            <div className="h-1 w-24 bg-emerald-700 rounded-[1px] mt-0.5" />
            <div className="flex gap-1 mt-1">
              <div className="h-0.5 w-10 bg-slate-400 rounded-[1px]" />
              <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
              <div className="h-0.5 w-12 bg-slate-400 rounded-[1px]" />
            </div>
          </div>
          {/* Experience Section */}
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center">
              <div className="h-1.5 w-16 bg-slate-800 rounded-[1px]" />
              <div className="h-1 w-8 bg-slate-400 rounded-[1px]" />
            </div>
            <div className="space-y-0.5 pl-1.5 border-l border-slate-300">
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-11/12 bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
            </div>
          </div>
          {/* Education & Skills */}
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-14 bg-slate-800 rounded-[1px]" />
            <div className="space-y-0.5 pl-1.5 border-l border-slate-300">
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-3/4 bg-slate-200 rounded-[1px]" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. CLASSIC (Ivy-League Centered Serif)
          ========================================================================= */}
      {layoutFamily === "traditional" && (
        <div className="space-y-1.5 w-full text-center">
          <div className="border-b border-slate-800 pb-1 flex flex-col items-center">
            <div className="h-2.5 w-24 bg-slate-900 rounded-[1px]" />
            <div className="h-1 w-16 bg-slate-600 rounded-[1px] mt-0.5 italic" />
            <div className="flex gap-1.5 mt-1 justify-center">
              <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
              <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
              <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
            </div>
          </div>
          {/* Centered Heading */}
          <div className="space-y-1 pt-0.5 flex flex-col items-center">
            <div className="h-1.5 w-20 bg-slate-800 rounded-[1px]" />
            <div className="h-[0.5px] w-full bg-slate-300" />
            <div className="w-full space-y-0.5 text-left pt-0.5">
              <div className="flex justify-between">
                <div className="h-1 w-16 bg-slate-700 rounded-[1px]" />
                <div className="h-1 w-10 bg-slate-400 rounded-[1px]" />
              </div>
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
            </div>
          </div>
          {/* Second Entry */}
          <div className="w-full space-y-0.5 text-left pt-0.5">
            <div className="flex justify-between">
              <div className="h-1 w-14 bg-slate-700 rounded-[1px]" />
              <div className="h-1 w-8 bg-slate-400 rounded-[1px]" />
            </div>
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MODERN (72% Main / 28% Teal Sidebar)
          ========================================================================= */}
      {layoutFamily === "modern" && (
        <div className="w-full h-full flex flex-col justify-between">
          <div className="border-b border-slate-200 pb-1 mb-1.5">
            <div className="h-3 w-20 bg-slate-900 rounded-[1px]" />
            <div className="h-1 w-14 rounded-[1px] mt-0.5" style={{ backgroundColor: accent }} />
          </div>
          <div className="flex gap-2 items-start flex-1">
            {/* Left Main (70%) */}
            <div className="w-[68%] space-y-1.5">
              <div className="space-y-0.5">
                <div className="h-1.5 w-12 rounded-[1px]" style={{ backgroundColor: accent }} />
                <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
                <div className="h-0.5 w-11/12 bg-slate-200 rounded-[1px]" />
                <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="h-1.5 w-10 rounded-[1px]" style={{ backgroundColor: accent }} />
                <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
                <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
              </div>
            </div>
            {/* Right Sidebar (32%) */}
            <div className="w-[32%] bg-teal-50/80 dark:bg-teal-950/40 p-1.5 rounded border border-teal-200/60 space-y-1.5 h-full">
              <div className="h-1.5 w-8 bg-teal-900 dark:bg-teal-200 rounded-[1px]" />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-teal-600/50 rounded-[1px]" />
                <div className="h-0.5 w-3/4 bg-teal-600/50 rounded-[1px]" />
              </div>
              <div className="h-1.5 w-7 bg-teal-900 dark:bg-teal-200 rounded-[1px] mt-1" />
              <div className="space-y-1">
                <div className="h-1 w-full bg-teal-200 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-teal-700" />
                </div>
                <div className="h-1 w-full bg-teal-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-teal-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MINIMAL (Clean Swiss Minimalist with Ample Whitespace)
          ========================================================================= */}
      {layoutFamily === "minimal" && (
        <div className="space-y-2 w-full text-slate-800">
          <div className="pt-0.5">
            <div className="h-3 w-16 bg-slate-900 rounded-[1px]" />
            <div className="h-1 w-12 bg-slate-500 rounded-[1px] mt-0.5" />
            <div className="h-0.5 w-20 bg-slate-300 rounded-[1px] mt-1" />
          </div>
          <div className="space-y-1 pl-2 border-l-2 border-slate-900">
            <div className="h-1.5 w-12 bg-slate-900 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
          </div>
          <div className="space-y-1 pl-2 border-l-2 border-slate-900">
            <div className="h-1.5 w-14 bg-slate-900 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-3/4 bg-slate-200 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          5. EXECUTIVE (Top Accent Band & Formal Leadership Typography)
          ========================================================================= */}
      {layoutFamily === "executive" && (
        <div className="space-y-1.5 w-full relative">
          <div className="h-1 w-full bg-slate-900 rounded-[1px]" />
          <div className="border-b border-slate-200 pb-1 flex justify-between items-baseline pt-0.5">
            <div>
              <div className="h-2.5 w-20 bg-slate-950 rounded-[1px]" />
              <div className="h-1 w-14 bg-slate-600 rounded-[1px] mt-0.5 uppercase tracking-wider" />
            </div>
            <div className="h-1 w-12 bg-slate-400 rounded-[1px]" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-16 bg-slate-800 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-11/12 bg-slate-200 rounded-[1px]" />
            <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-14 bg-slate-800 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-3/4 bg-slate-200 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          6. COMPACT (Dense 1-Page Layout)
          ========================================================================= */}
      {layoutFamily === "compact" && (
        <div className="space-y-1 w-full">
          <div className="border-b-2 border-slate-900 pb-0.5 flex justify-between items-baseline">
            <div className="h-2 w-16 bg-slate-950 rounded-[1px]" />
            <div className="h-0.5 w-16 bg-slate-400 rounded-[1px]" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div className="space-y-0.5">
              <div className="h-1 w-10 bg-slate-800 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
            </div>
            <div className="space-y-0.5">
              <div className="h-1 w-10 bg-slate-800 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
              <div className="h-0.5 w-3/4 bg-slate-200 rounded-[1px]" />
            </div>
          </div>
          <div className="space-y-0.5 pt-0.5 border-t border-slate-200">
            <div className="h-1 w-12 bg-slate-800 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
            <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          7. FRESHER (Education & Projects Prioritized)
          ========================================================================= */}
      {layoutFamily === "fresher" && (
        <div className="space-y-1.5 w-full text-center">
          <div className="border-b pb-1 flex flex-col items-center" style={{ borderColor: accent }}>
            <div className="h-2.5 w-20 bg-slate-950 rounded-[1px]" />
            <div className="h-1 w-14 bg-slate-600 rounded-[1px] mt-0.5" />
          </div>
          {/* Education Spotlight */}
          <div className="bg-emerald-50/60 p-1 rounded border border-emerald-100 text-left space-y-0.5">
            <div className="h-1.5 w-12 text-emerald-800 font-bold bg-emerald-700 rounded-[1px]" />
            <div className="h-0.5 w-full bg-emerald-600/40 rounded-[1px]" />
            <div className="h-0.5 w-4/5 bg-emerald-600/40 rounded-[1px]" />
          </div>
          {/* Projects & Skills */}
          <div className="space-y-0.5 text-left pt-0.5">
            <div className="h-1.5 w-12 rounded-[1px]" style={{ backgroundColor: accent }} />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          8. CREATIVE STUDIO (Photo + Organic Blobs + Progress Bars)
          ========================================================================= */}
      {layoutFamily === "creative" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Header with Name/Role and Portrait */}
          <div className="flex justify-between items-start pt-0.5">
            <div className="space-y-0.5 w-3/5">
              <div className="h-2.5 w-18 bg-[#0F2942] rounded-[1px]" />
              <div className="h-1.5 w-12 bg-[#2563EB] rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px] mt-1" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
            </div>
            <div className="relative w-7 h-9 rounded-md bg-indigo-100 border border-white shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-4 h-4 rounded-full bg-indigo-300/80" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0F2942]" />
            </div>
          </div>

          {/* Dual column body */}
          <div className="flex gap-2 items-start mt-2">
            <div className="w-3/5 space-y-1">
              <div className="h-1 w-10 bg-[#0F2942] rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-[1px]" />
            </div>
            <div className="w-2/5 space-y-1">
              <div className="h-1 w-8 bg-[#0F2942] rounded-[1px]" />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-[#0F2942]" />
                </div>
                <div className="h-0.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-[#0F2942]" />
                </div>
              </div>
            </div>
          </div>

          {/* Organic bottom wave decoration */}
          <div className="w-full flex items-end justify-between h-2 mt-auto">
            <div className="w-5 h-2 bg-[#FED7AA] rounded-t-full opacity-60" />
            <div className="w-6 h-2.5 bg-[#93C5FD] rounded-t-full opacity-60" />
            <div className="w-7 h-3 bg-[#0F2942] rounded-t-full" />
          </div>
        </div>
      )}

      {/* =========================================================================
          9. EDITORIAL DIRECTOR (Warm Taupe + Floating Espresso Panels)
          ========================================================================= */}
      {layoutFamily === "editorial" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#544A41] rounded-[4px] p-2 text-[#F2E7CF] shadow-inner">
          <div className="space-y-0.5">
            <div className="h-2.5 w-20 bg-[#F2E7CF] rounded-[1px]" />
            <div className="h-2 w-16 bg-[#E8DCCB] rounded-[1px]" />
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[6px] text-[#ECC984] font-bold">@</span>
              <div className="h-1 w-12 bg-[#BFAFA0] rounded-[1px]" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-center my-auto">
            <div className="col-span-5 bg-[#2B231D]/90 rounded-xs p-1 space-y-0.5 border border-[#F2E7CF]/10">
              <div className="h-1 w-8 bg-[#ECC984] rounded-[1px]" />
              <div className="h-0.5 w-full bg-[#B8A99A] rounded-[1px]" />
              <div className="h-0.5 w-4/5 bg-[#B8A99A] rounded-[1px]" />
            </div>

            <div className="col-span-3 flex justify-center">
              <div className="w-6 h-9 rounded-md bg-[#241D17] border border-[#ECC984]/50 flex items-center justify-center overflow-hidden shadow-sm">
                <div className="w-3 h-3 rounded-full bg-[#ECC984]/40" />
              </div>
            </div>

            <div className="col-span-4 bg-[#2B231D]/90 rounded-xs p-1 space-y-0.5 border border-[#F2E7CF]/10">
              <div className="h-1 w-7 bg-[#F2E7CF] rounded-[1px]" />
              <div className="h-0.5 w-full bg-[#ECC984]/60 rounded-[1px]" />
              <div className="h-0.5 w-3/4 bg-[#B8A99A] rounded-[1px]" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-0.5 border-t border-[#F2E7CF]/10">
            <div className="h-0.5 w-8 bg-[#ECC984]/70 rounded-[1px]" />
            <div className="h-0.5 w-6 bg-[#ECC984]/70 rounded-[1px]" />
            <div className="h-0.5 w-8 bg-[#ECC984]/70 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          10. SPLIT FOREST & SAGE (Two-Tone Split + Circular Portrait)
          ========================================================================= */}
      {layoutFamily === "split" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-[4px]">
          <div className="absolute inset-0 grid grid-cols-2 pointer-events-none">
            <div className="bg-[#EFEFE9]" />
            <div className="bg-[#0B2117]" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <div className="h-2 w-14 bg-[#142E22] rounded-[1px]" />
                <div className="h-1.5 w-11 bg-[#1E3B2E] rounded-[1px]" />
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-md p-0.5 flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-[#DFE7D8]" />
              </div>
            </div>

            <div className="w-full bg-[#9CAF88] rounded-md p-1 shadow-xs space-y-0.5 my-1">
              <div className="h-1 w-8 bg-[#0B2117] rounded-full" />
              <div className="h-0.5 w-full bg-[#0E261A]/80 rounded-[1px]" />
            </div>

            <div className="grid grid-cols-2 gap-1.5 flex-1 items-start">
              <div className="space-y-1">
                <div className="h-1 w-7 bg-[#9CAF88] rounded-full" />
                <div className="h-0.5 w-full bg-[#142E22]/60 rounded-[1px]" />
                <div className="flex gap-1 pt-0.5">
                  <div className="w-2 h-2 rounded-full border border-[#0B2117]" />
                  <div className="w-2 h-2 rounded-full border border-[#0B2117]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-1 w-9 bg-[#9CAF88] rounded-full" />
                <div className="h-0.5 w-full bg-white rounded-[1px]" />
                <div className="h-0.5 w-5/6 bg-[#C2D4B7] rounded-[1px]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. PLAYFUL 3D STUDIO (3D Tangerine Clay + Center Portrait + Multi-Cards)
          ========================================================================= */}
      {layoutFamily === "playful-studio" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-[4px] bg-[#FAF8F5] p-2 text-black">
          <div className="absolute -top-1 -left-1 w-4 h-2 bg-[#E86034] rounded-full opacity-80" />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E86034]" />

          <div className="space-y-0.5 pt-0.5">
            <div className="h-2 w-16 bg-black rounded-[1px]" />
            <div className="h-1.5 w-14 border border-black rounded-[1px]" />
          </div>

          <div className="flex justify-center -my-0.5">
            <div className="w-7 h-9 rounded-xl bg-[#EFE6DC] border-2 border-white shadow-xs flex items-center justify-center overflow-hidden">
              <div className="w-4 h-4 rounded-full bg-[#E86034]/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-black/10">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-black shrink-0" />
              <div className="h-0.5 w-full bg-slate-400 rounded-[1px]" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-black shrink-0" />
              <div className="h-0.5 w-full bg-slate-400 rounded-[1px]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-black/10">
            <div className="bg-white rounded p-0.5 flex justify-center items-center">
              <div className="w-2 h-2 rounded-full border-2 border-[#E86034]" />
            </div>
            <div className="bg-white rounded p-0.5 flex justify-center gap-0.5 items-center">
              <div className="w-1.5 h-1.5 bg-black rounded-[1px]" />
              <div className="w-1.5 h-1.5 bg-black rounded-[1px]" />
            </div>
            <div className="bg-white rounded p-0.5 flex justify-center items-center">
              <span className="text-[6px] font-bold">✨</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. CREATIVE ORGANIC GREEN (Concentric Portrait + Two-Tone + Badges)
          ========================================================================= */}
      {layoutFamily === "organic-green" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-[4px] bg-white p-2 text-black">
          {/* Mini Dot Grids */}
          <div className="absolute top-1 left-1 grid grid-cols-3 gap-0.5 opacity-60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#709775]" />
            ))}
          </div>

          <div className="flex items-start gap-1.5 pt-0.5 pl-0.5">
            <div className="w-6 h-6 rounded-full bg-[#D5EBD2] p-0.5 shrink-0 flex items-center justify-center">
              <div className="w-4.5 h-4.5 rounded-full bg-[#164E28] flex items-center justify-center text-[6px] text-white font-bold">
                JG
              </div>
            </div>
            <div className="space-y-0.5 pt-0.5">
              <div className="h-1.5 w-14 bg-[#164E28] rounded-[1px]" />
              <div className="h-1.5 w-10 bg-[#4E9F3D] rounded-[1px]" />
            </div>
          </div>

          <div className="space-y-0.5 px-0.5 my-1">
            <div className="h-1.5 w-10 bg-[#164E28] rounded-xs" />
            <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
            <div className="h-0.5 w-5/6 bg-slate-200 rounded-[1px]" />
          </div>

          <div className="grid grid-cols-2 gap-1 px-0.5 py-0.5 border-t border-b border-[#164E28]/20">
            <div className="space-y-0.5">
              <div className="h-1 w-6 bg-[#164E28] rounded-xs" />
              <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
            </div>
            <div className="space-y-0.5 border-l border-[#164E28]/20 pl-1">
              <div className="h-0.5 w-3/4 bg-[#164E28]/70 rounded-[1px]" />
            </div>
          </div>

          <div className="flex items-center gap-1 px-0.5 pt-0.5">
            <div className="w-2 h-2 rounded-[2px] bg-[#001E36]" />
            <div className="w-2 h-2 rounded-[2px] bg-[#330000]" />
            <div className="w-2 h-2 rounded-full bg-[#00C4CC]" />
            <div className="w-2 h-2 rounded-[2px] bg-[#164E28]" />
          </div>

          <div className="relative -mx-2 -mb-2 h-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4E9F3D] to-[#164E28] rounded-t-full transform translate-y-1" />
          </div>
        </div>
      )}

      {/* Bottom Format Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[8px] font-bold text-slate-500 uppercase">
          {template.category}
        </span>
        <div className="flex items-center gap-1">
          {template.isAtsSafe && (
            <span className="text-[7px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
              ATS
            </span>
          )}
          {template.isTwoColumn && (
            <span className="text-[7px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-100 text-blue-800">
              2-Col
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateThumbnail;
