"use client";

import React from "react";
import type { Resume, DesignMeta } from "@/types/resume";
import { getVisibleSectionOrder } from "../templateUtils";
import { getFlatSkills } from "@/types/resume";

export interface TemplateProps {
  resume: Resume;
  design?: Partial<DesignMeta>;
}

/**
 * Template 004 — Playful 3D Studio ("Graphic & Web Designer")
 * Recreated faithfully from reference image 4 (Shivam Kaushal):
 * - Clean warm off-white / light cream canvas (#FAF8F5)
 * - 3D tangerine clay spiral & floating sphere vector elements (#E86034)
 * - Giant mixed display headline: Solid Black "GRAPHIC &" + Outlined "WEB DESIGNER"
 * - Prominent center portrait with soft warm ambient aura glow (#F5E7D7)
 * - "About Me" summary statement with sleek portfolio badge
 * - Split "Education" (graduation cap badge) & "Contact" (user badge) with clean divider
 * - "Work Experience" side-by-side role cards with duration pills & bullets
 * - Three-card technical section: Language donut rings, Software tool badges, AI Tools
 * - 4-column rounded skill capsule matrix with category icons
 */
export const Template004: React.FC<TemplateProps> = ({ resume, design }) => {
  const {
    basics,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const flatSkills = getFlatSkills(skills);
  const headline = basics.headline || basics.title || "Graphic & Web Designer";

  // Split headline for mixed solid & outlined display
  const headlineParts = headline.toUpperCase().split("&");
  const headlineTop = headlineParts[0] ? `${headlineParts[0].trim()} &` : "GRAPHIC &";
  const headlineBottom = headlineParts[1] ? headlineParts[1].trim() : "WEB DESIGNER";

  const candidateName = basics.name?.trim() || "Candidate Name";

  // Software tools mapping / fallback
  const softwareSkills = flatSkills.filter(s =>
    /photoshop|illustrator|canva|figma|react|next|node|typescript|javascript|python|docker|git|tailwind/i.test(s)
  );
  const displayedSoftware = (softwareSkills.length >= 4 ? softwareSkills : flatSkills).slice(0, 6);

  return (
    <article
      id="resume-document"
      className="relative w-full min-h-full bg-[#FAF8F5] text-[#1E1E1E] text-[9.5pt] leading-[1.42] box-border p-[12mm] md:p-[15mm] flex flex-col justify-between overflow-hidden shadow-2xl print:shadow-none print:w-full print:min-h-0 print:p-[10mm]"
      style={{
        fontFamily:
          "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* ================= 3D CLAY & TANGERINE VECTOR DECORATIVE SHAPES ================= */}
      {/* Top Left Wavy 3D Orange Ribbon */}
      <svg
        className="absolute -top-3 -left-3 w-32 h-24 pointer-events-none select-none z-0 opacity-90"
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 60C25 15 45 10 65 35C85 60 100 20 115 15"
          stroke="#E86034"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Clay highlight stroke */}
        <path
          d="M12 56C26 18 43 14 62 37"
          stroke="#FFA585"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {/* Top Right Floating 3D Ball */}
      <div
        className="absolute top-6 right-8 w-8 h-8 rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFA585 0%, #E86034 60%, #B83B14 100%)",
          boxShadow: "0 6px 14px rgba(232, 96, 52, 0.4)",
        }}
      />

      {/* Mid Left Floating Sphere */}
      <div
        className="absolute top-[28%] left-10 w-6 h-6 rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFA585 0%, #E86034 60%, #B83B14 100%)",
          boxShadow: "0 4px 10px rgba(232, 96, 52, 0.35)",
        }}
      />

      {/* Mid Right 3D Orange Spiral Coil */}
      <svg
        className="absolute top-[24%] -right-4 w-36 h-36 pointer-events-none select-none z-0 opacity-95"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 30C50 10 90 20 85 55C80 85 45 75 40 105C35 130 80 135 115 110"
          stroke="#E86034"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M33 32C48 16 83 24 79 53C75 80 44 73 40 98"
          stroke="#FFA585"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

      {/* Bottom Right Floating Sphere */}
      <div
        className="absolute bottom-[24%] right-4 w-7 h-7 rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFA585 0%, #E86034 60%, #B83B14 100%)",
          boxShadow: "0 5px 12px rgba(232, 96, 52, 0.35)",
        }}
      />

      {/* Bottom Left 3D Orange Spiral Curve */}
      <svg
        className="absolute -bottom-4 -left-4 w-32 h-32 pointer-events-none select-none z-0 opacity-95"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 110C25 80 20 40 50 45C80 50 65 95 95 100"
          stroke="#E86034"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 105C26 78 23 44 49 48C69 51 60 85 86 92"
          stroke="#FFA585"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="relative z-10 w-full flex flex-col justify-between flex-1">
        {/* ================= 1. HEADER (MIXED SOLID & OUTLINED TYPOGRAPHY + CENTERED PORTRAIT) ================= */}
        <header className="relative pt-2 pb-4" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
          {/* Top Headline and Name Row */}
          <div className="flex flex-col md:flex-row justify-between items-start">
            {/* Left Giant Display Typography */}
            <div className="z-10">
              <h1 className="leading-[0.88] tracking-tight">
                <span className="block text-[32pt] sm:text-[40pt] md:text-[46pt] font-black uppercase text-black tracking-tight">
                  {headlineTop}
                </span>
                <span
                  className="block text-[32pt] sm:text-[40pt] md:text-[46pt] font-black uppercase tracking-tight text-transparent mt-1"
                  style={{
                    WebkitTextStroke: "2.5px #111111",
                    letterSpacing: "0.02em",
                  }}
                >
                  {headlineBottom}
                </span>
              </h1>
            </div>

            {/* Candidate Name Badge (Aligned Under Outlined Text on the Right) */}
            <div className="mt-3 md:mt-16 text-right z-10">
              <span className="text-[12.5pt] md:text-[14.5pt] font-extrabold uppercase tracking-widest text-[#111111] border-b-2 border-black pb-0.5">
                {candidateName}
              </span>
            </div>
          </div>

          {/* Centered Profile Portrait with Warm Aura Glow */}
          <div className="flex flex-col items-center justify-center -mt-10 sm:-mt-12 md:-mt-16 mb-4 relative z-20">
            {/* Ambient Sandy Watercolor Aura Glow */}
            <div
              className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full pointer-events-none opacity-80"
              style={{
                background:
                  "radial-gradient(circle, rgba(245, 231, 215, 0.95) 0%, rgba(237, 224, 208, 0.5) 55%, transparent 75%)",
                filter: "blur(18px)",
              }}
            />

            {/* Portrait Card */}
            <div className="relative w-40 h-48 sm:w-48 sm:h-56 md:w-52 md:h-60 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#EFE6DC] flex items-center justify-center">
              {basics.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={basics.photo}
                  alt={candidateName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#F2E5D6] to-[#E5D5C2] text-[#111111] p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/70 shadow-sm flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-[#111111]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[8.5pt] font-extrabold uppercase tracking-wider text-black">
                    {candidateName}
                  </span>
                </div>
              )}
            </div>

            {/* Sleek Down Arrow & Portfolio Pill Badge */}
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-black stroke-black" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V13M8 13L4 9M8 13L12 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="px-3.5 py-0.5 rounded-full bg-black text-white text-[8pt] font-bold uppercase tracking-wider shadow-xs">
                PORTFOLIO
              </div>
            </div>
          </div>

          {/* ABOUT ME SECTION */}
          {(basics.summary || resume.summary) && (
            <div className="mt-1 text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-[11pt] font-extrabold uppercase tracking-wider text-black">
                ABOUT ME
              </h2>
              <p className="text-[8.8pt] md:text-[9.2pt] leading-[1.5] text-[#333333] text-center font-normal px-2">
                {basics.summary || resume.summary}
              </p>
            </div>
          )}
        </header>

        {/* Divider Rule */}
        <hr className="border-t border-black/15 my-3" />

        {/* ================= 2. EDUCATION & CONTACT (SIDE BY SIDE WITH VERTICAL DIVIDER) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start my-1" style={{ breakInside: "avoid" }}>
          {/* 2A. EDUCATION (Left) */}
          {orderedSections.includes("education") && education && education.length > 0 && (
            <section className="flex items-start gap-3 md:pr-4">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-[10.5pt] font-black uppercase tracking-wider text-black">
                  EDUCATION
                </h2>
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={edu.id} className="text-[8.8pt] leading-snug">
                      {idx > 0 && <div className="border-t border-dashed border-black/20 my-1.5" />}
                      <div className="font-bold text-black flex items-center gap-1.5">
                        <span className="text-[6pt] text-black">•</span>
                        <span>{edu.degree}</span>
                      </div>
                      <div className="text-[8.2pt] text-[#444444] pl-3">
                        {edu.school}
                        {edu.location ? `, ${edu.location}` : ""}
                      </div>
                      <div className="text-[8pt] text-[#666666] font-medium pl-3">
                        {edu.start ? `${edu.start} — ` : ""}
                        {edu.end || edu.year || "Present"}
                        {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 2B. CONTACT (Right) */}
          <section className="flex items-start gap-3 md:pl-4 md:border-l border-black/15">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-[10.5pt] font-black uppercase tracking-wider text-black">
                CONTACT
              </h2>
              <div className="space-y-1.5 text-[8.5pt] text-[#333333]">
                {basics.phone && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span>{basics.phone}</span>
                  </div>
                )}
                {basics.email && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href={`mailto:${basics.email}`} className="truncate hover:underline">
                      {basics.email}
                    </a>
                  </div>
                )}
                {basics.portfolio && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <span className="truncate">{basics.portfolio.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {basics.location && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span>{basics.location}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Divider Rule */}
        <hr className="border-t border-black/15 my-3" />

        {/* ================= 3. WORK EXPERIENCE SECTION ================= */}
        {orderedSections.includes("experience") && experience && experience.length > 0 && (
          <section className="space-y-2.5 my-1" style={{ breakInside: "avoid" }}>
            <h2 className="text-[11pt] font-black uppercase tracking-wider text-center text-black">
              WORK EXPERIENCE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-1">
              {experience.slice(0, 2).map((exp, idx) => (
                <div key={exp.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx === 0 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-extrabold text-[9.5pt] text-black leading-tight">
                      {exp.role}
                    </div>
                    <div className="text-[8.2pt] text-[#444444] font-medium leading-tight">
                      {exp.company}
                      {exp.location ? `, ${exp.location}` : ""}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[7.5pt] text-black font-bold uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-sm">
                      <span>📅</span>
                      <span>{exp.start} — {exp.end || "Present"}</span>
                    </div>

                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-[8.2pt] text-[#333333] leading-snug">
                        {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start">
                            <span className="text-black mr-2 font-bold select-none">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Divider Rule */}
        <hr className="border-t border-black/15 my-3" />

        {/* ================= 4. THREE-COLUMN MULTI-CARD (LANGUAGE | SOFTWARE SKILLS | AI TOOLS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start my-1" style={{ breakInside: "avoid" }}>
          {/* 4A. LANGUAGE RADIAL DONUTS */}
          <div className="rounded-xl p-3 border border-black/10 bg-white/60 shadow-2xs space-y-2 text-center">
            <h3 className="text-[9pt] font-black uppercase tracking-wider text-black">
              LANGUAGE
            </h3>
            <div className="flex justify-center items-center gap-4 pt-1">
              {(languages && languages.length > 0 ? languages.slice(0, 2) : [
                { id: "l1", language: "English", proficiency: "Fluent" },
                { id: "l2", language: "Hindi", proficiency: "Native" },
              ]).map((lang, lIdx) => {
                const pct = lIdx === 0 ? 100 : 70;
                const strokeDash = `${pct} ${100 - pct}`;
                return (
                  <div key={lang.id} className="flex flex-col items-center">
                    <div className="relative w-11 h-11 flex items-center justify-center">
                      <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-black/10"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          style={{ color: lIdx === 0 ? "#E86034" : "#2E6B65" }}
                          strokeDasharray={strokeDash}
                          strokeWidth="4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[7.5pt] font-black text-black">
                        {pct}%
                      </span>
                    </div>
                    <span className="text-[7.8pt] font-bold text-black mt-1">
                      {lang.language}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4B. SOFTWARE SKILLS GRID */}
          <div className="rounded-xl p-3 border border-black/10 bg-white/60 shadow-2xs space-y-2 text-center">
            <h3 className="text-[9pt] font-black uppercase tracking-wider text-black">
              SOFTWARE SKILLS
            </h3>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {displayedSoftware.map((tool, tIdx) => (
                <div key={tIdx} className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-black text-[7pt] shadow-2xs">
                    {tool.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[7pt] font-medium text-[#333333] truncate max-w-[50px] mt-0.5">
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4C. AI TOOLS & WORKFLOW */}
          <div className="rounded-xl p-3 border border-black/10 bg-white/60 shadow-2xs space-y-2 text-center">
            <h3 className="text-[9pt] font-black uppercase tracking-wider text-black">
              AI TOOLS
            </h3>
            <div className="flex justify-center items-center gap-3 pt-1">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[7pt] font-bold shadow-2xs">
                ✨
              </div>
              <div className="w-7 h-7 rounded-full bg-[#E86034] text-white flex items-center justify-center text-[7pt] font-bold shadow-2xs">
                ⚡
              </div>
            </div>
            <p className="text-[7pt] text-[#555555] leading-tight px-1">
              Leverages modern AI tools to accelerate creative workflows, prototyping, and smart execution.
            </p>
          </div>
        </div>

        {/* ================= 5. SKILLS CAPSULE MATRIX (4 COLUMNS) ================= */}
        {orderedSections.includes("skills") && flatSkills.length > 0 && (
          <div className="mt-3 space-y-2" style={{ breakInside: "avoid" }}>
            <h2 className="text-[10pt] font-black uppercase tracking-wider text-center text-black">
              SKILLS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {flatSkills.slice(0, 8).map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-black/15 bg-white shadow-2xs"
                >
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[7pt] shrink-0">
                    ✓
                  </span>
                  <span className="text-[7.8pt] font-bold text-black truncate">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
