"use client";

import React from "react";
import type { Resume, DesignMeta } from "@/types/resume";
import { getFlatSkills } from "@/types/resume";
import { resolveDesign, getMarginPadding, getFontFamily } from "../templateUtils";

export interface TemplateProps {
  resume: Resume;
  design?: Partial<DesignMeta>;
}

/**
 * BrushBadge: Authentic organic hand-painted green ribbon badge
 * faithfully matching the reference image's ragged brush-stroke section titles.
 */
const BrushBadge: React.FC<{ title: string; className?: string }> = ({
  title,
  className = "",
}) => (
  <div className={`relative inline-flex items-center my-1 select-none ${className}`}>
    <svg
      className="absolute inset-0 w-full h-full -z-0"
      viewBox="0 0 240 48"
      preserveAspectRatio="none"
      fill="none"
    >
      {/* Hand-painted brush stroke body */}
      <path
        d="M8 8 C3 14, 1 22, 4 38 C6 44, 18 45, 30 44 C80 46, 170 45, 222 43 C234 42, 239 35, 236 24 C234 14, 230 6, 218 5 C170 4, 70 5, 8 8 Z"
        fill="#164E28"
      />
      {/* Ragged brush bristle details at edges */}
      <path
        d="M3 14 C1 20, 2 30, 5 35 M237 12 C240 20, 238 28, 233 36 M14 4 C7 3, 3 8, 2 16 M224 4 C231 3, 235 8, 236 17"
        stroke="#164E28"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative z-10 px-5 sm:px-6 py-1 text-white font-extrabold text-[10.5pt] sm:text-[11.5pt] tracking-wide">
      {title}
    </span>
  </div>
);

/**
 * DotGrid: Clean SVG dot matrix for background texture
 */
const DotGrid: React.FC<{
  rows?: number;
  cols?: number;
  color?: string;
  className?: string;
}> = ({ rows = 5, cols = 5, color = "#81C784", className = "" }) => (
  <svg
    className={`select-none pointer-events-none ${className}`}
    width={cols * 13}
    height={rows * 13}
    viewBox={`0 0 ${cols * 13} ${rows * 13}`}
    fill="none"
  >
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((_, c) => (
        <circle
          key={`${r}-${c}`}
          cx={c * 13 + 6}
          cy={r * 13 + 6}
          r="2.2"
          fill={color}
        />
      ))
    )}
  </svg>
);

/**
 * SoftwareAppTile: Branded tool icon tiles (Photoshop, Illustrator, Canva, Figma, etc.)
 */
interface SoftwareTileDef {
  label: string;
  badge: React.ReactNode;
}

const getSoftwareTile = (skillName: string): SoftwareTileDef => {
  const s = skillName.toLowerCase();

  if (s.includes("photoshop") || s === "ps") {
    return {
      label: "Adobe Photoshop",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#001E36] border border-[#31A8FF]/40 flex items-center justify-center text-[#31A8FF] font-black text-xs shadow-xs">
          Ps
        </div>
      ),
    };
  }
  if (s.includes("lightroom") || s === "lr") {
    return {
      label: "Adobe Lightroom",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#001E36] border border-[#31A8FF]/40 flex items-center justify-center text-[#31A8FF] font-black text-xs shadow-xs">
          Lr
        </div>
      ),
    };
  }
  if (s.includes("illustrator") || s === "ai") {
    return {
      label: "Adobe Illustrator",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#330000] border border-[#FF9A00]/40 flex items-center justify-center text-[#FF9A00] font-black text-xs shadow-xs">
          Ai
        </div>
      ),
    };
  }
  if (s.includes("animate") || s === "an") {
    return {
      label: "Adobe Animate",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#2C003E] border border-[#FA2A84]/40 flex items-center justify-center text-[#FA2A84] font-black text-xs shadow-xs">
          An
        </div>
      ),
    };
  }
  if (s.includes("canva")) {
    return {
      label: "Canva",
      badge: (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00C4CC] to-[#7D2AE8] flex items-center justify-center text-white font-black text-[9px] shadow-xs italic">
          Canva
        </div>
      ),
    };
  }
  if (s.includes("capcut")) {
    return {
      label: "CapCut",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white font-extrabold text-[10px] shadow-xs">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6h4l4 4-4 4H4V6zm16 0h-4l-4 4 4 4h4V6zm-8 7l4 4h-4v-4z" />
          </svg>
        </div>
      ),
    };
  }
  if (s.includes("figma")) {
    return {
      label: "Figma",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#1E1E1E] flex items-center justify-center shadow-xs">
          <span className="font-bold text-xs bg-gradient-to-r from-[#F24E1E] via-[#A259FF] to-[#0ACF83] bg-clip-text text-transparent">
            Fg
          </span>
        </div>
      ),
    };
  }
  if (s.includes("indesign") || s === "id") {
    return {
      label: "InDesign",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#49021F] border border-[#FF3366]/40 flex items-center justify-center text-[#FF3366] font-black text-xs shadow-xs">
          Id
        </div>
      ),
    };
  }
  if (s.includes("ibis") || s.includes("paint")) {
    return {
      label: "Ibis Paint",
      badge: (
        <div className="w-9 h-9 rounded-xl bg-[#1E1E1E] flex items-center justify-center shadow-xs overflow-hidden">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-500 flex items-center justify-center text-[7px] text-white font-black">
            ip
          </div>
        </div>
      ),
    };
  }

  // Fallback for general skills/tools
  const initials = skillName.slice(0, 2).toUpperCase();
  return {
    label: skillName,
    badge: (
      <div className="w-9 h-9 rounded-xl bg-[#164E28] border border-[#4E9F3D]/30 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
        {initials}
      </div>
    ),
  };
};

/**
 * Template 005 — Creative Organic Green ("Graphic Designer")
 * Recreated faithfully from reference image 5 (Jullii):
 * - Crisp white canvas with botanical green aesthetic
 * - Dual-tone bold display headline (Forest Green + Leaf Green)
 * - Layered concentric circles behind portrait (Mint + Leaf + Forest)
 * - Dot grid matrices on corners & floating green satellite spheres
 * - Ragged-edged dark forest green brush stroke section badges
 * - Split Education & Contact tiers separated by fine vertical green divider
 * - Software application badge grid with iconic app tiles
 * - 2-Column Experience tier with dark green calendar badge icons
 * - Flowing dual-wave organic ribbons along the bottom
 */
export const Template005: React.FC<TemplateProps> = ({ resume, design: designOverride }) => {
  const design = resolveDesign(resume, designOverride);
  const {
    basics,
    experience,
    education,
    skills,
    projects,
  } = resume;

  const flatSkills = getFlatSkills(skills);
  const candidateName = basics.name?.trim() || "Candidate Name";
  const rawHeadline = basics.headline || basics.title || "Graphic Designer";
  const bioSummary = basics.summary || resume.summary;

  // Split headline for two-tone typography (e.g. "GRAPHIC" in forest green, "DESIGNER" in leaf green)
  const headlineWords = rawHeadline.trim().split(/\s+/);
  const headlinePart1 = headlineWords[0] || "GRAPHIC";
  const headlinePart2 = headlineWords.slice(1).join(" ") || "DESIGNER";

  // Curate software/design tools for the icon row
  const defaultDesignTools = [
    "Adobe Photoshop",
    "Adobe Lightroom",
    "Adobe Illustrator",
    "Adobe Animate",
    "Canva",
    "CapCut",
    "Ibis Paint",
  ];

  // Prioritize tools from skills if matched, else fill with default design tools
  const matchedTools = flatSkills.filter((s) =>
    /photoshop|lightroom|illustrator|animate|canva|capcut|figma|indesign|premiere|after effects|blender|paint/i.test(
      s
    )
  );
  const activeSoftwareList =
    matchedTools.length >= 4
      ? matchedTools.slice(0, 7)
      : Array.from(new Set([...matchedTools, ...flatSkills, ...defaultDesignTools])).slice(0, 7);

  return (
    <article
      id="resume-document"
      className="relative w-full min-h-full bg-white text-[#222222] box-border flex flex-col justify-between overflow-hidden shadow-2xl print:shadow-none print:w-full print:min-h-0 print:p-[8mm]"
      style={{
        padding: getMarginPadding(design.margins) || "8mm 10mm",
        fontFamily:
          getFontFamily(design.fontPairing) ||
          "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: `${9.5 * design.fontScale}pt`,
        lineHeight: design.lineHeight,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* =========================================================================
          DECORATIVE BACKGROUND ELEMENTS
          ========================================================================= */}
      {/* Top-Left Olive Dot Grid */}
      <DotGrid
        rows={5}
        cols={5}
        color="#709775"
        className="absolute top-3 left-3 opacity-75"
      />

      {/* Top-Right Sage Dot Grid */}
      <DotGrid
        rows={5}
        cols={5}
        color="#A3D9A5"
        className="absolute top-3 right-3 opacity-80"
      />

      {/* Floating Green Spheres */}
      <div className="absolute top-8 left-[40%] w-4.5 h-4.5 rounded-full bg-[#8BC34A] opacity-75 pointer-events-none select-none" />
      <div className="absolute top-24 right-4 w-6 h-6 rounded-full bg-[#4CAF50] opacity-80 pointer-events-none select-none" />
      <div className="absolute top-[48%] -right-2 w-3.5 h-3.5 rounded-full bg-[#164E28] opacity-60 pointer-events-none select-none" />

      {/* Bottom Edge Dot Grids */}
      <DotGrid
        rows={3}
        cols={5}
        color="#2E7D32"
        className="absolute bottom-8 left-3 opacity-35 pointer-events-none select-none z-0"
      />
      <DotGrid
        rows={3}
        cols={5}
        color="#81C784"
        className="absolute bottom-8 right-3 opacity-40 pointer-events-none select-none z-0"
      />

      {/* =========================================================================
          HEADER AREA: CONCENTRIC PHOTO + TWO-TONE DISPLAY TITLE + ABOUT ME
          ========================================================================= */}
      <div className="relative z-10 flex flex-row items-center gap-5 sm:gap-7 pb-2">
        {/* Left: Concentric Circles with Photo / Monogram */}
        <div className="w-[170px] sm:w-[200px] shrink-0 flex items-center justify-center">
          <div className="relative w-40 h-40 sm:w-46 sm:h-46 flex items-center justify-center">
            {/* Outer Sage / Mint Ring */}
            <div className="absolute inset-0 rounded-full bg-[#D5EBD2]" />
            {/* Mid Leaf Green Ring */}
            <div className="absolute inset-3 rounded-full bg-[#4E9F3D]" />
            {/* Inner Deep Forest Green Ring */}
            <div className="absolute inset-6 rounded-full bg-[#164E28]" />

            {/* Orbiting Satellite Dots */}
            <div className="absolute -top-0.5 right-5 w-3.5 h-3.5 rounded-full bg-[#8BC34A] shadow-2xs" />
            <div className="absolute bottom-4 -right-0.5 w-3 h-3 rounded-full bg-[#164E28] shadow-2xs" />

            {/* Photo or Initials Monogram */}
            <div className="relative z-10 w-26 h-26 sm:w-30 sm:h-30 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-xl flex items-center justify-center">
              {basics.photo ? (
                <img
                  src={basics.photo}
                  alt={candidateName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#164E28] to-[#4E9F3D] flex flex-col items-center justify-center text-white">
                  <span className="text-2xl sm:text-3xl font-black tracking-wider">
                    {candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="text-[7.5px] font-semibold tracking-widest uppercase opacity-90 mt-0.5">
                    Portfolio
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Giant Two-Tone Headline & "About Me!!" */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Candidate Name & Headline Display */}
          <div>
            <div className="text-[11pt] sm:text-[13pt] font-black tracking-wide uppercase text-[#164E28] mb-0.5">
              {candidateName}
            </div>
            <h1 className="text-[24pt] sm:text-[30pt] font-black tracking-tight leading-[0.95] uppercase">
              <span className="block text-[#164E28]">{headlinePart1}</span>
              <span className="block text-[#4E9F3D]">{headlinePart2}</span>
            </h1>
          </div>

          {/* "About Me!!" Brush Badge */}
          <div className="pt-0.5">
            <BrushBadge title="About Me!!" />
          </div>

          {/* Bio / Summary Statement */}
          <div className="text-[8.5pt] sm:text-[9pt] text-[#333333] leading-[1.5] max-w-xl">
            {bioSummary ? (
              <p className="whitespace-pre-line">{bioSummary}</p>
            ) : (
              <p>
                Creative and detail-oriented visual designer passionate about visual storytelling and brand identity. Experienced in visual communication, multimedia content management, and transforming creative ideas into engaging, professional designs.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* HORIZONTAL RULE 1 */}
      <div className="border-t border-[#164E28]/30 my-2 select-none" />

      {/* =========================================================================
          TIER 1: EDUCATION & CONTACT (SPLIT 2-COLUMN)
          ========================================================================= */}
      <div className="relative z-10 grid grid-cols-2 gap-6 items-start">
        {/* Left Column: Education */}
        <div className="space-y-1.5">
          <BrushBadge title="Education" />

          {education && education.length > 0 ? (
            <div className="space-y-2 pt-0.5">
              {education.map((edu, idx) => (
                <div key={idx} className="entry print-avoid-break">
                  <div className="text-[9.5pt] font-extrabold text-[#4E9F3D]">
                    {edu.start || "2020"} - {edu.end || "Present"}
                  </div>
                  <div className="text-[9.5pt] font-bold text-[#164E28] leading-snug">
                    {edu.school}
                  </div>
                  <div className="text-[8.5pt] text-[#444444]">
                    {[edu.degree, edu.field].filter(Boolean).join(", ") ||
                      "Visual Communication & Design"}
                  </div>
                  {edu.gpa && (
                    <div className="text-[8pt] text-[#666666]">GPA: {edu.gpa}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-0.5">
              <div className="text-[9.5pt] font-extrabold text-[#4E9F3D]">2020 - Present</div>
              <div className="text-[9.5pt] font-bold text-[#164E28] leading-snug">
                University School of Design
              </div>
              <div className="text-[8.5pt] text-[#444444]">
                B.F.A. in Visual Communication & Design
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Details separated by clean vertical line */}
        <div className="border-l border-[#164E28]/30 pl-6 space-y-2 pt-1 text-[9pt] text-[#222222]">
          {/* Location */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#164E28] text-white flex items-center justify-center shrink-0 text-[10px]">
              📍
            </div>
            <span className="font-medium text-[#222222]">
              {basics.location || "City, State"}
            </span>
          </div>

          {/* LinkedIn / Profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#164E28] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              in
            </div>
            <span className="font-medium text-[#222222] truncate">
              {basics.linkedin ? (
                <a
                  href={
                    basics.linkedin.startsWith("http")
                      ? basics.linkedin
                      : `https://${basics.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#164E28]"
                >
                  {basics.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                </a>
              ) : (
                candidateName
              )}
            </span>
          </div>

          {/* Instagram / Portfolio / GitHub */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#164E28] text-white flex items-center justify-center shrink-0 text-[10px]">
              📷
            </div>
            <span className="font-medium text-[#222222] truncate">
              {basics.portfolio ? (
                <a
                  href={
                    basics.portfolio.startsWith("http")
                      ? basics.portfolio
                      : `https://${basics.portfolio}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#164E28]"
                >
                  {basics.portfolio.replace(/^https?:\/\//, "")}
                </a>
              ) : basics.github ? (
                <a
                  href={
                    basics.github.startsWith("http")
                      ? basics.github
                      : `https://${basics.github}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#164E28]"
                >
                  {basics.github.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                `@${candidateName.toLowerCase().replace(/\s+/g, "")}.design`
              )}
            </span>
          </div>

          {/* Email */}
          {basics.email && (
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-[#164E28] text-white flex items-center justify-center shrink-0 text-[10px]">
                ✉️
              </div>
              <a
                href={`mailto:${basics.email}`}
                className="font-medium text-[#222222] hover:underline hover:text-[#164E28] truncate"
              >
                {basics.email}
              </a>
            </div>
          )}

          {/* Phone (if available) */}
          {basics.phone && (
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-[#164E28] text-white flex items-center justify-center shrink-0 text-[10px]">
                📞
              </div>
              <span className="font-medium text-[#222222]">{basics.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* HORIZONTAL RULE 2 */}
      <div className="border-t border-[#164E28]/30 my-2 select-none" />

      {/* =========================================================================
          TIER 2: SOFTWARE & TOOLS (APP ICON GRID)
          ========================================================================= */}
      <div className="relative z-10 space-y-1.5">
        <BrushBadge title="Software" />

        <div className="pt-1 flex flex-wrap items-center gap-4 sm:gap-6">
          {activeSoftwareList.map((skillItem, sIdx) => {
            const tile = getSoftwareTile(skillItem);
            return (
              <div
                key={sIdx}
                className="flex flex-col items-center justify-center text-center space-y-1 select-none"
              >
                {tile.badge}
                <span className="text-[7.5pt] font-semibold text-[#444444] max-w-[64px] leading-tight text-center truncate">
                  {tile.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Categorized Skills (if candidate has additional technical/soft skills) */}
        {flatSkills.length > 7 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {flatSkills.slice(7, 16).map((sk, skIdx) => (
              <span
                key={skIdx}
                className="px-2 py-0.5 rounded-full text-[7.5pt] font-bold bg-[#E8F5E9] text-[#164E28] border border-[#C8E6C9]"
              >
                {sk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* HORIZONTAL RULE 3 */}
      <div className="border-t border-[#164E28]/30 my-2 select-none" />

      {/* =========================================================================
          TIER 3: EXPERIENCE (2-COLUMN GRID WITH CALENDAR BADGES)
          ========================================================================= */}
      <div className="relative z-10 space-y-1.5 flex-1 pb-3">
        <BrushBadge title="Experience" />

        {experience && experience.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 pt-1">
            {experience.slice(0, 2).map((exp, eIdx) => {
              const dateRange = [exp.start, exp.end || (exp.current ? "Present" : "Present")]
                .filter(Boolean)
                .join(" - ");

              return (
                <div
                  key={eIdx}
                  className={`entry print-avoid-break space-y-1 ${
                    eIdx === 1 ? "border-l border-[#164E28]/30 pl-6" : ""
                  }`}
                >
                  {/* Calendar Icon + Date */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#164E28] text-white flex items-center justify-center shrink-0 shadow-2xs text-[9px]">
                      📅
                    </div>
                    <span className="font-extrabold text-[#164E28] text-[9pt]">
                      {dateRange}
                    </span>
                  </div>

                  {/* Company / Organization Name */}
                  <div className="text-[9pt] font-bold text-[#111111]">
                    {exp.company}
                  </div>

                  {/* Role / Title with prominent dot */}
                  <div className="flex items-center gap-1.5 font-bold text-[8.5pt] text-[#164E28]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E28]" />
                    <span>{exp.role}</span>
                  </div>

                  {/* Description / Highlights */}
                  {exp.bullets && exp.bullets.length > 0 ? (
                    <ul className="text-[8pt] text-[#444444] space-y-0.5 pl-3 list-disc leading-normal">
                      {exp.bullets.slice(0, 2).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          /* Default reference mockup for preview */
          <div className="grid grid-cols-2 gap-6 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#164E28] text-white flex items-center justify-center shrink-0 shadow-2xs text-[9px]">
                  📅
                </div>
                <span className="font-extrabold text-[#164E28] text-[9pt]">
                  Jan 2024 - Present
                </span>
              </div>
              <div className="text-[9pt] font-bold text-[#111111]">
                Creative Media Studio
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[8.5pt] text-[#164E28]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#164E28]" />
                <span>Lead Content Designer</span>
              </div>
              <p className="text-[8pt] text-[#444444] leading-normal pl-3">
                Led visual design across brand identity, social campaigns, and digital editorial assets.
              </p>
            </div>

            <div className="space-y-1 border-l border-[#164E28]/30 pl-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#164E28] text-white flex items-center justify-center shrink-0 shadow-2xs text-[9px]">
                  📅
                </div>
                <span className="font-extrabold text-[#164E28] text-[9pt]">
                  Aug 2023 - Dec 2023
                </span>
              </div>
              <div className="text-[9pt] font-bold text-[#111111]">
                Digital Arts Collective
              </div>
              <div className="flex items-center gap-1.5 font-bold text-[8.5pt] text-[#164E28]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#164E28]" />
                <span>Visual Designer</span>
              </div>
              <p className="text-[8pt] text-[#444444] leading-normal pl-3">
                Created marketing collateral, typography layouts, and interactive media assets.
              </p>
            </div>
          </div>
        )}

        {/* Extra experience or projects (if present and > 2) */}
        {experience && experience.length > 2 && (
          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-[#164E28]/20">
            {experience.slice(2, 4).map((exp, eIdx) => (
              <div
                key={eIdx}
                className={`entry print-avoid-break space-y-0.5 ${
                  eIdx === 1 ? "border-l border-[#164E28]/30 pl-6" : ""
                }`}
              >
                <div className="text-[8pt] font-bold text-[#164E28]">
                  {exp.start} - {exp.end || "Present"}
                </div>
                <div className="text-[8.5pt] font-bold text-[#111111]">{exp.company}</div>
                <div className="text-[8pt] text-[#444444]">{exp.role}</div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Projects (if present) */}
        {projects && projects.length > 0 && (
          <div className="pt-2 border-t border-[#164E28]/20">
            <div className="text-[9pt] font-extrabold text-[#164E28] uppercase tracking-wider mb-1">
              Featured Projects
            </div>
            <div className="grid grid-cols-2 gap-4">
              {projects.slice(0, 2).map((proj, pIdx) => (
                <div key={pIdx} className="entry print-avoid-break text-[8pt]">
                  <div className="font-bold text-[#111111]">{proj.name}</div>
                  {proj.bullets && proj.bullets.length > 0 && (
                    <p className="text-[#555555] line-clamp-2">{proj.bullets[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM FOOTER: DUAL ORGANIC GREEN WAVES
          ========================================================================= */}
      <div className="relative -mx-[8mm] sm:-mx-[10mm] -mb-[8mm] sm:-mb-[10mm] mt-auto select-none pointer-events-none">
        <svg
          className="w-full h-12 sm:h-14 block"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Layer 1: Vibrant Lime Wave */}
          <path
            d="M0,60 C320,115 680,10 1200,65 L1200,120 L0,120 Z"
            fill="#4E9F3D"
          />
          {/* Layer 2: Deep Forest Green Wave */}
          <path
            d="M0,82 C420,25 780,115 1200,55 L1200,120 L0,120 Z"
            fill="#164E28"
          />
        </svg>
      </div>
    </article>
  );
};

export default Template005;
