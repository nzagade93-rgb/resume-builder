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
 * Template 003 — Split Forest & Sage ("Morgan Maxwell")
 * Recreated faithfully from reference image 3:
 * - Two-tone split canvas: Soft warm bone/cream left (50%) & Deep forest green right (50%)
 * - Huge dark green stacked display name with spaced title
 * - Circular profile photo with heavy white border overlapping the header
 * - Large floating sage green pill card ("About Me") spanning across both columns
 * - Distinctive 3D soft sage pill tabs for section headings ("Skills:", "Education:", "Language:", "Professional Experience:")
 * - Left column: Skills with percentage indicators, Education, Language donut rings, and terracotta contact icons
 * - Right column: Deep forest green with crisp white/mint professional experience timeline and bullets
 */
export const Template003: React.FC<TemplateProps> = ({ resume, design }) => {
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
  const headline = basics.headline || basics.title || "Graphic Designer";

  // Name splitting for stacked layout
  const nameParts = (basics.name?.trim() || "Candidate Name").split(/\s+/);
  const firstName = nameParts[0] || "CANDIDATE";
  const lastName = nameParts.slice(1).join(" ") || "NAME";

  // Skill percentages (realistic staggered numbers matching reference style)
  const skillPercentages = [95, 90, 87, 84, 92, 88, 85, 91];

  // Language percentages for donut rings
  const langPercentages = [94, 86, 84, 78];

  return (
    <article
      id="resume-document"
      className="relative w-full min-h-full text-[#142B20] text-[9.5pt] leading-[1.42] box-border overflow-hidden shadow-2xl print:shadow-none print:w-full print:min-h-0"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* ================= BACKGROUND SPLIT (50% WARM CREAM / 50% DEEP FOREST GREEN) ================= */}
      <div className="absolute inset-0 grid grid-cols-2 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Left 50%: Warm Bone / Light Sage Canvas */}
        <div className="bg-[#EFEFE9]" />
        {/* Right 50%: Deep Dark Forest Green */}
        <div className="bg-[#0B2117]" />
      </div>

      {/* ================= MAIN CONTENT LAYER ================= */}
      <div className="relative z-10 w-full flex flex-col justify-between min-h-full">
        {/* ================= 1. TOP HEADER & CIRCLE PORTRAIT ================= */}
        <header className="p-6 sm:p-8 md:p-10 pb-4 relative" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Top Left: Stacked Name & Title (Cols 1-7) */}
            <div className="col-span-7 pr-2">
              <h1 className="leading-[0.9] tracking-tight">
                <span className="block text-[28pt] md:text-[36pt] font-black uppercase text-[#142E22] tracking-tight">
                  {firstName}
                </span>
                <span className="block text-[26pt] md:text-[33pt] font-medium text-[#1E3B2E] tracking-tight mt-0.5">
                  {lastName}
                </span>
              </h1>
              <div className="text-[11.5pt] md:text-[13pt] font-normal tracking-[0.2em] text-[#142E22] mt-3">
                {headline}
              </div>
            </div>

            {/* Top Right: Overlapping Circular Portrait (Cols 8-12) */}
            <div className="col-span-5 flex justify-center md:justify-end relative pr-2">
              <div
                className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] md:border-[8px] border-white shadow-2xl bg-[#E2E8DC] flex items-center justify-center shrink-0"
                style={{
                  boxShadow: "0 14px 28px rgba(0, 0, 0, 0.35)",
                }}
              >
                {basics.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={basics.photo}
                    alt={basics.name || "Candidate Portrait"}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#DFE7D8] to-[#CBD8C4] text-[#142E22] p-4 text-center">
                    <svg className="w-12 h-12 text-[#142E22]/60 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[8pt] font-bold uppercase tracking-wider text-[#142E22]">
                      {basics.name || "Photo"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================= 2. FLOATING SAGE "ABOUT ME" BANNER (SPANNING ACROSS BOTH COLUMNS) ================= */}
        {(basics.summary || resume.summary) && (
          <div className="px-6 sm:px-8 md:px-10 my-2 relative z-20" style={{ breakInside: "avoid" }}>
            <div
              className="w-full rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border border-white/20"
              style={{
                backgroundColor: "#A2B491",
                boxShadow: "0 8px 24px rgba(11, 33, 23, 0.28)",
              }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-[#0B2117] text-white text-[8.5pt] font-extrabold uppercase tracking-wider mb-2.5 shadow-sm">
                About Me
              </div>
              <p className="text-[9pt] md:text-[9.5pt] leading-[1.5] text-[#0E261A] font-medium text-justify">
                {basics.summary || resume.summary}
              </p>
            </div>
          </div>
        )}

        {/* ================= 3. TWO-COLUMN SPLIT BODY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 px-6 sm:px-8 md:px-10 py-5">
          {/* ================= LEFT COLUMN (LIGHT SAGE/BONE) ================= */}
          <div className="pr-4 md:pr-7 space-y-5">
            {/* 3A. SKILLS SECTION */}
            {orderedSections.includes("skills") && flatSkills.length > 0 && (
              <section className="space-y-3" style={{ breakInside: "avoid" }}>
                {/* 3D Sage Pill Tab */}
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-white text-[9pt] font-bold tracking-wide shadow-md">
                  Skills:
                </div>
                <div className="space-y-1.5 pt-1">
                  {flatSkills.slice(0, 6).map((skill, idx) => {
                    const pct = skillPercentages[idx % skillPercentages.length];
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[9pt] font-semibold text-[#142E22] border-b border-[#142E22]/10 pb-1"
                      >
                        <span>{skill}</span>
                        <span className="font-bold text-[#1E3B2E] text-[8.8pt]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3B. EDUCATION SECTION */}
            {orderedSections.includes("education") && education && education.length > 0 && (
              <section className="space-y-3" style={{ breakInside: "avoid" }}>
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-white text-[9pt] font-bold tracking-wide shadow-md">
                  Education:
                </div>
                <div className="space-y-3 pt-1">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-[9pt] leading-tight text-[#142E22]">
                      <div className="font-bold text-[9.5pt]">{edu.degree}</div>
                      <div className="text-[8.5pt] text-[#2D4538] mt-0.5">{edu.school}</div>
                      {edu.location && (
                        <div className="text-[8pt] text-[#475E51] mt-0.5">{edu.location}</div>
                      )}
                      <div className="text-[8pt] font-medium text-[#1E3B2E] mt-0.5">
                        {edu.start ? `${edu.start} — ` : ""}
                        {edu.end || edu.year || "Present"}
                        {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3C. LANGUAGE SECTION (DONUT CIRCULAR CHARTS) */}
            {languages && languages.length > 0 && (
              <section className="space-y-3" style={{ breakInside: "avoid" }}>
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-white text-[9pt] font-bold tracking-wide shadow-md">
                  Language:
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {languages.slice(0, 3).map((lang, idx) => {
                    const pct = langPercentages[idx % langPercentages.length];
                    const strokeDash = `${pct} ${100 - pct}`;
                    return (
                      <div key={lang.id} className="flex flex-col items-center">
                        <span className="text-[8.5pt] font-semibold text-[#142E22] mb-1">
                          {lang.language}
                        </span>
                        {/* Circular Donut Meter */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            {/* Background Track */}
                            <path
                              className="text-[#D8E2D2]"
                              strokeWidth="4.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Foreground Filled Ring */}
                            <path
                              className="text-[#0B2117]"
                              strokeDasharray={strokeDash}
                              strokeWidth="4.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[8pt] font-bold text-[#0B2117]">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3D. CONTACT DETAILS WITH CORAL/TERRACOTTA ICON BADGES */}
            <div className="pt-3 space-y-2 text-[8.5pt] text-[#142E22] font-medium" style={{ breakInside: "avoid" }}>
              {basics.phone && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#B25C58] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span>{basics.phone}</span>
                </div>
              )}

              {basics.email && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#B25C58] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href={`mailto:${basics.email}`} className="hover:underline">
                    {basics.email}
                  </a>
                </div>
              )}

              {basics.portfolio && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#B25C58] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className="truncate">{basics.portfolio.replace(/^https?:\/\//, "")}</span>
                </div>
              )}

              {basics.location && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#B25C58] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>{basics.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (DEEP FOREST GREEN) ================= */}
          <div className="pl-4 md:pl-7 text-white space-y-5">
            {/* 3E. PROFESSIONAL EXPERIENCE SECTION */}
            {orderedSections.includes("experience") && experience && experience.length > 0 && (
              <section className="space-y-4" style={{ breakInside: "avoid" }}>
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-[#0B2117] text-[9pt] font-extrabold tracking-wide shadow-md">
                  Professional Experience:
                </div>

                <div className="space-y-4 pt-1">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="font-bold text-[10pt] text-white leading-tight">
                        {exp.role}
                      </div>
                      <div className="text-[8.5pt] text-[#C2D4B7] font-medium leading-tight">
                        {exp.start} — {exp.end || "Present"} | {exp.company}
                        {exp.location ? `, ${exp.location}` : ""}
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="mt-1.5 space-y-1 text-[8.5pt] text-[#E0EBD8] leading-snug">
                          {exp.bullets.filter(Boolean).map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-[#9CAF88] mr-2 font-bold select-none">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3F. PROJECTS (IF PRESENT) */}
            {orderedSections.includes("projects") && projects && projects.length > 0 && (
              <section className="space-y-3 pt-2" style={{ breakInside: "avoid" }}>
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-[#0B2117] text-[9pt] font-extrabold tracking-wide shadow-md">
                  Key Projects:
                </div>
                <div className="space-y-2 pt-1">
                  {projects.map((proj) => (
                    <div key={proj.id} className="space-y-0.5">
                      <div className="font-bold text-[9.5pt] text-white flex justify-between items-baseline">
                        <span>{proj.name}</span>
                        {proj.link && (
                          <span className="text-[7.5pt] text-[#9CAF88] underline">
                            {proj.link.replace(/^https?:\/\//, "")}
                          </span>
                        )}
                      </div>
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="text-[7.8pt] text-[#C2D4B7]">
                          {proj.tech.join(" • ")}
                        </div>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <p className="text-[8pt] text-[#E0EBD8] leading-snug">
                          {proj.bullets[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3G. CERTIFICATIONS (IF PRESENT) */}
            {certifications && certifications.length > 0 && (
              <section className="space-y-2 pt-2" style={{ breakInside: "avoid" }}>
                <div className="inline-block px-4 py-1 rounded-full bg-[#9CAF88] text-[#0B2117] text-[8.5pt] font-bold tracking-wide shadow-md">
                  Certifications:
                </div>
                <div className="space-y-1 text-[8.5pt] text-[#E0EBD8]">
                  {certifications.map((c) => (
                    <div key={c.id}>
                      <span className="font-semibold text-white">{c.name}</span> —{" "}
                      <span className="text-[#C2D4B7]">{c.issuer}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
