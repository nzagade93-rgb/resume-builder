"use client";

import React from "react";
import type { Resume, SkillCategory, DesignMeta } from "@/types/resume";
import { getVisibleSectionOrder, getNormalizedSkills } from "../templateUtils";
import { getFlatSkills } from "@/types/resume";

export interface TemplateProps {
  resume: Resume;
  design?: Partial<DesignMeta>;
}

/**
 * Template 001 — Creative Photographer / Studio
 * Recreated faithfully from reference: "30. Creative"
 * - Deep navy typography (#0F2942) with royal blue accents (#2563EB)
 * - Two-column asymmetrical layout (62% main, 38% sidebar)
 * - Upper-right rounded photo portrait card with organic backdrop
 * - Left column: Full Summary, Employment History, Education
 * - Right column: Contact Details, Visual Skills with horizontal progress tracks, References
 * - Organic abstract decorative shapes at margins and bottom in navy, blue, periwinkle, and peach
 */
export const Template001: React.FC<TemplateProps> = ({ resume, design }) => {
  const { basics, experience, education, skills, projects, certifications, languages, awards, customSections } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const normalizedSkills = getNormalizedSkills(skills);
  const flatSkills = getFlatSkills(skills);
  const headline = basics.headline || basics.title;

  // Primary palette matching reference
  const primaryNavy = "#0F2942";
  const royalBlue = "#2563EB";
  const mutedDate = "#64748B";
  const bodyText = "#334155";
  const skillTrack = "#E2E8F0";

  // Calculate skill proficiency percentage (staggered realistic visual bars)
  const getSkillPercentage = (index: number): number => {
    const percentages = [92, 85, 88, 78, 90, 82, 75, 87];
    return percentages[index % percentages.length];
  };

  return (
    <article
      id="resume-document"
      className="relative w-full min-h-full bg-[#FAFBFD] text-[#334155] text-[10pt] leading-[1.4] box-border p-[14mm] md:p-[16mm] flex flex-col justify-between overflow-hidden shadow-sm print:shadow-none print:w-full print:min-h-0 print:p-[12mm]"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* ================= BACKGROUND DECORATIVE ORGANIC VECTORS ================= */}
      {/* Top right organic scribble/curve behind photo */}
      <svg
        className="absolute top-1 right-2 w-72 h-72 pointer-events-none opacity-85 select-none print:opacity-100"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <path
          d="M135.5 35.5C158 52 178 77 167 101.5C156 126 114 150 82.5 148C51 146 30 118 36.5 90.5C43 63 77 36 104 28.5C118 24.5 125 28 135.5 35.5Z"
          fill="#EEF2FF"
        />
        <path
          d="M160 85C168 105 155 125 140 135C125 145 105 142 95 130C85 118 90 95 108 85C125 75 152 65 160 85Z"
          fill="#E0E7FF"
        />
        <path
          d="M175 60C170 80 185 95 180 115C175 130 160 145 145 155"
          stroke="#818CF8"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>

      {/* Right margin subtle leaf / petal swirl */}
      <svg
        className="absolute top-[48%] right-0 w-28 h-64 pointer-events-none select-none opacity-80 print:opacity-100"
        viewBox="0 0 100 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <path
          d="M95 20C75 45 60 80 75 110C90 140 100 170 85 205C75 230 50 240 35 240"
          stroke="#C7D2FE"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="85" cy="70" r="14" fill="#C7D2FE" opacity="0.5" />
        <circle cx="80" cy="150" r="10" fill="#818CF8" opacity="0.4" />
      </svg>

      {/* Bottom organic petal / blob cluster */}
      <svg
        className="absolute bottom-0 right-0 left-0 w-full h-32 pointer-events-none select-none print:opacity-100"
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        {/* Soft Peach base blob */}
        <path
          d="M0 120C80 95 180 85 260 110C340 135 420 100 490 85C560 70 650 90 730 65C765 55 790 40 800 30V120H0Z"
          fill="#FED7AA"
          opacity="0.45"
        />
        {/* Soft Cornflower Blue middle wave */}
        <path
          d="M100 120C170 90 280 100 350 75C420 50 490 65 570 95C650 125 730 110 800 80V120H100Z"
          fill="#93C5FD"
          opacity="0.4"
        />
        {/* Deep Navy bottom leaf shapes */}
        <path
          d="M240 120C260 100 300 80 340 90C380 100 400 120 400 120H240Z"
          fill="#0F2942"
        />
        <path
          d="M330 120C350 85 390 65 435 80C480 95 490 120 490 120H330Z"
          fill="#1E3A8A"
        />
        <path
          d="M440 120C460 75 510 50 560 70C610 90 620 120 620 120H440Z"
          fill="#2563EB"
        />
        <path
          d="M580 120C600 90 635 75 670 85C705 95 720 120 720 120H580Z"
          fill="#0F2942"
        />
      </svg>

      {/* ================= MAIN CONTENT LAYER ================= */}
      <div className="relative z-10 w-full flex flex-col justify-between">
        {/* TOP HEADER: Name, Role & Summary (Left) + Portrait Photo Card (Right) */}
        <header className="flex flex-col-reverse md:flex-row justify-between items-start gap-6 pb-2" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
          {/* Left Title & Summary */}
          <div className="w-full md:w-[62%] pr-2">
            <h1
              className="text-[28pt] md:text-[34pt] font-extrabold tracking-tight leading-[1.05] mb-1.5"
              style={{ color: primaryNavy }}
            >
              {basics.name || "Candidate Name"}
            </h1>
            {headline && (
              <p
                className="text-[13.5pt] md:text-[15.5pt] font-bold tracking-tight mb-3"
                style={{ color: royalBlue }}
              >
                {headline}
              </p>
            )}
            {(basics.summary || resume.summary) && (
              <p className="text-[9.5pt] leading-[1.52] text-slate-700 text-justify font-normal">
                {basics.summary || resume.summary}
              </p>
            )}
          </div>

          {/* Right Portrait Photo Card */}
          <div className="w-full md:w-[38%] flex justify-end shrink-0 relative" style={{ breakInside: "avoid" }}>
            <div className="relative w-36 h-44 md:w-44 md:h-52 rounded-3xl overflow-hidden bg-slate-100 shadow-md border-4 border-white flex items-center justify-center z-10">
              {basics.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={basics.photo}
                  alt={basics.name || "Candidate Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 text-slate-400 p-4 text-center">
                  <svg className="w-12 h-12 mb-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[8pt] font-semibold uppercase tracking-wider text-slate-500">
                    {basics.name ? basics.name.split(" ").map((n) => n[0]).join("") : "Photo"}
                  </span>
                </div>
              )}
            </div>

            {/* Deep navy organic curved hook overlapping bottom-right corner of photo */}
            <svg
              className="absolute -bottom-7 -right-4 w-28 h-28 pointer-events-none select-none z-20"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M95 25C80 38 60 55 52 75C45 92 52 106 68 108C82 110 98 96 95 78C92 64 78 56 65 60"
                stroke="#0F2942"
                strokeWidth="15"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </header>

        {/* TWO-COLUMN BODY CONTENT */}
        <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
          {/* LEFT COLUMN (62%): Employment History, Education, Projects */}
          <main className="w-full md:w-[62%] space-y-6">
            {/* Employment History */}
            {orderedSections.includes("experience") && experience && experience.length > 0 && (
              <section key="experience" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-3"
                  style={{ color: primaryNavy }}
                >
                  Employment History
                </h2>
                <div className="space-y-4">
                  {experience.map((item) => (
                    <div
                      key={item.id}
                      className="entry"
                      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                    >
                      <div className="font-bold text-[9.8pt] leading-tight" style={{ color: primaryNavy }}>
                        {item.role} at {item.company}
                        {item.location ? `, ${item.location}` : ""}
                      </div>
                      <div
                        className="text-[8.5pt] font-bold tracking-wider uppercase mt-0.5 mb-1.5"
                        style={{ color: mutedDate }}
                      >
                        {item.start} — {item.end || "Present"}
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="space-y-1 text-slate-700 text-[9pt] leading-snug">
                          {item.bullets.filter(Boolean).map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-slate-400 font-bold select-none">•</span>
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

            {/* Education */}
            {orderedSections.includes("education") && education && education.length > 0 && (
              <section key="education" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-3"
                  style={{ color: primaryNavy }}
                >
                  Education
                </h2>
                <div className="space-y-3.5">
                  {education.map((item) => (
                    <div
                      key={item.id}
                      className="entry"
                      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                    >
                      <div className="font-bold text-[9.8pt] leading-tight" style={{ color: primaryNavy }}>
                        {item.degree}
                        {item.school ? ` at ${item.school}` : ""}
                        {item.location ? `, ${item.location}` : ""}
                      </div>
                      <div
                        className="text-[8.5pt] font-bold tracking-wider uppercase mt-0.5"
                        style={{ color: mutedDate }}
                      >
                        {item.start || item.year} — {item.end || item.year || "Present"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects (if visible and present) */}
            {orderedSections.includes("projects") && projects && projects.length > 0 && (
              <section key="projects" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-3"
                  style={{ color: primaryNavy }}
                >
                  Projects
                </h2>
                <div className="space-y-3.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="entry" style={{ breakInside: "avoid" }}>
                      <div className="font-bold text-[9.8pt] leading-tight" style={{ color: primaryNavy }}>
                        {proj.name}
                        {proj.link && (
                          <span className="ml-2 font-normal text-[8.5pt] text-blue-600 underline">
                            {proj.link}
                          </span>
                        )}
                      </div>
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="text-[8.5pt] text-slate-500 font-medium mt-0.5 mb-1">
                          Technologies: {proj.tech.join(", ")}
                        </div>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="space-y-1 text-slate-700 text-[9pt] leading-snug">
                          {proj.bullets.filter(Boolean).map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-slate-400 font-bold select-none">•</span>
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
          </main>

          {/* RIGHT SIDEBAR (38%): Details, Skills, References/Languages/Awards */}
          <aside className="w-full md:w-[38%] space-y-6">
            {/* Details (Contact block) */}
            <section style={{ breakInside: "avoid" }}>
              <h2
                className="text-[12.5pt] font-bold tracking-tight mb-2.5"
                style={{ color: primaryNavy }}
              >
                Details
              </h2>
              <div className="text-[9pt] leading-relaxed text-slate-700 space-y-1">
                {basics.location && (
                  <div className="break-words">{basics.location}</div>
                )}
                {basics.phone && (
                  <div className="break-words">{basics.phone}</div>
                )}
                {basics.email && (
                  <div className="break-words font-medium" style={{ color: royalBlue }}>
                    {basics.email}
                  </div>
                )}
                {basics.linkedin && (
                  <div className="break-words text-[8.5pt] text-slate-500">
                    {basics.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </div>
                )}
                {basics.portfolio && (
                  <div className="break-words text-[8.5pt] text-slate-500">
                    {basics.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
                  </div>
                )}
              </div>
            </section>

            {/* Skills (with distinctive proficiency track bars) */}
            {orderedSections.includes("skills") && flatSkills.length > 0 && (
              <section key="skills" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-3"
                  style={{ color: primaryNavy }}
                >
                  Skills
                </h2>
                <div className="space-y-3">
                  {flatSkills.slice(0, 8).map((skill, idx) => {
                    const widthPercent = getSkillPercentage(idx);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="text-[9pt] font-semibold text-slate-800 flex justify-between items-center">
                          <span>{skill}</span>
                        </div>
                        {/* Realistic visual bar matching reference */}
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: skillTrack }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: primaryNavy,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* References / Additional Sections */}
            {/* If user has languages */}
            {orderedSections.includes("languages") && languages && languages.length > 0 && (
              <section key="languages" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-2.5"
                  style={{ color: primaryNavy }}
                >
                  Languages
                </h2>
                <div className="space-y-1.5 text-[9pt] text-slate-700">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">{lang.language}</span>
                      <span className="text-[8.5pt] text-slate-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* If user has awards or certifications */}
            {orderedSections.includes("certifications") && certifications && certifications.length > 0 && (
              <section key="certifications" style={{ breakInside: "avoid" }}>
                <h2
                  className="text-[12.5pt] font-bold tracking-tight mb-2.5"
                  style={{ color: primaryNavy }}
                >
                  Certifications
                </h2>
                <div className="space-y-2 text-[9pt]">
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="font-bold text-slate-800 leading-tight">{cert.name}</div>
                      <div className="text-[8.5pt] text-slate-500">{cert.issuer} {cert.date ? `• ${cert.date}` : ""}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Custom Sections (e.g. References if created by user) */}
            {customSections && customSections.length > 0 && (
              <div className="space-y-4">
                {customSections.map((sec) => (
                  <section key={sec.id} style={{ breakInside: "avoid" }}>
                    <h2
                      className="text-[12.5pt] font-bold tracking-tight mb-2.5"
                      style={{ color: primaryNavy }}
                    >
                      {sec.name || sec.heading}
                    </h2>
                    <div className="space-y-2 text-[9pt] text-slate-700">
                      {sec.entries.map((ent) => (
                        <div key={ent.id}>
                          <div className="font-bold text-slate-800">{ent.title}</div>
                          {ent.subtitle && <div className="text-slate-600 text-[8.5pt]">{ent.subtitle}</div>}
                          {ent.description && <p className="text-slate-600 text-[8.5pt] mt-0.5">{ent.description}</p>}
                          {ent.bullets && ent.bullets.length > 0 && (
                            <ul className="list-disc ml-4 space-y-0.5 text-slate-600 text-[8.5pt] mt-0.5">
                              {ent.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
};
