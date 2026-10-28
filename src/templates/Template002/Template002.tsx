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
 * Template 002 — Editorial Director ("Creative Alchemist")
 * Recreated faithfully from reference image 2 (Bendroye Bossing):
 * - Earth-tone dark taupe / khaki ambient gradient canvas (#63584E -> #483E36)
 * - Giant display typography header with soft ambient depth
 * - "@ CANDIDATE NAME" secondary headline bar
 * - Rotated vertical "creativeDESIGNER" side badge
 * - Floating dark espresso glassmorphism panels (rgba(38, 31, 25, 0.85))
 * - "Creative DNA" summary panel with experience/project metrics
 * - Centered / anchored portrait presentation with golden accents
 * - "My JOURNEY" employment timeline panel with hierarchical roles
 * - "EDUCATION" and "SKILLS" tag cloud with gold hand-drawn doodle arrow
 * - "PORTFOLIO & PROJECTS" showcase panel with links & tech tags
 * - Bottom-left icon contact block (Email, Phone, Location)
 */
export const Template002: React.FC<TemplateProps> = ({ resume, design }) => {
  const {
    basics,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    customSections,
  } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const flatSkills = getFlatSkills(skills);
  const headline = basics.headline || basics.title || "Creative Director & Designer";

  // Split name for staggered giant header
  const nameParts = (basics.name?.trim() || "Candidate Name").split(/\s+/);
  const firstName = nameParts[0] || "CANDIDATE";
  const lastName = nameParts.slice(1).join(" ") || "NAME";

  // Approximate metrics for the DNA card
  const expCount = experience?.length || 3;
  const projCount = projects?.length || 4;
  const yearsCalc = Math.max(expCount * 2 + 1, 5);

  return (
    <article
      id="resume-document"
      className="relative w-full min-h-full text-[#D8C9BB] text-[9.5pt] leading-[1.42] box-border p-[12mm] md:p-[15mm] flex flex-col justify-between overflow-hidden shadow-2xl print:shadow-none print:w-full print:min-h-0 print:p-[10mm]"
      style={{
        background: "radial-gradient(ellipse at 45% 20%, #6E6358 0%, #52473D 55%, #3B322A 100%)",
        fontFamily:
          "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Subtle organic noise/gradient backdrop texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(#ECC984 0.75px, transparent 0.75px), radial-gradient(#ECC984 0.75px, #483E36 0.75px)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px",
        }}
      />

      {/* Right vertical rotated watermark badge */}
      <div
        className="absolute top-16 right-3 pointer-events-none select-none text-[11pt] tracking-[0.28em] uppercase font-bold text-[#A89A8B]/40"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        creative<span className="font-extrabold text-[#F2E7CF]/70">DIRECTOR</span>
      </div>

      <div className="relative z-10 w-full flex flex-col justify-between h-full">
        {/* ================= 1. GIANT DISPLAY HEADER ================= */}
        <header className="mb-6" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
          <div className="flex flex-col">
            <h1
              className="text-[34pt] md:text-[44pt] font-black uppercase tracking-tight leading-[0.88] text-[#E8DCCB] drop-shadow-md"
              style={{
                textShadow: "0 4px 14px rgba(0, 0, 0, 0.45)",
                letterSpacing: "-0.02em",
              }}
            >
              <span className="block">{firstName}</span>
              <span className="block text-[#F4E9D8]">{lastName}</span>
            </h1>

            {/* Handle / Full Title Bar */}
            <div className="mt-2.5 flex items-center gap-2 text-[11pt] md:text-[13pt] font-bold tracking-wide uppercase text-[#BFAFA0]">
              <span className="text-[#ECC984] font-extrabold text-[14pt]">@</span>
              <span className="text-[#F2E7CF] font-black tracking-wider">
                {basics.name || "CANDIDATE"}
              </span>
              <span className="text-[#A89A8B] font-light">•</span>
              <span className="text-[#ECC984] font-semibold tracking-normal text-[10pt] md:text-[11pt] normal-case">
                {headline}
              </span>
            </div>
          </div>
        </header>

        {/* ================= 2. MAIN GRID (LEFT DNA & PORTFOLIO / CENTER PHOTO / RIGHT JOURNEY & EDUCATION) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start flex-1">
          {/* ================= LEFT COLUMN (approx 5 cols) ================= */}
          <div className="md:col-span-5 space-y-5">
            {/* 2A. CREATIVE DNA (Summary & Metrics Card) */}
            {(basics.summary || resume.summary) && (
              <section
                className="rounded-2xl p-4 sm:p-5 border border-[#F2E7CF]/10 shadow-xl"
                style={{
                  backgroundColor: "rgba(38, 31, 25, 0.82)",
                  backdropFilter: "blur(12px)",
                  breakInside: "avoid",
                }}
              >
                <div className="flex items-center justify-between border-b border-[#F2E7CF]/10 pb-2 mb-2.5">
                  <h2 className="text-[12pt] font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>CREATIVE</span>
                    <span className="text-[#ECC984]">DNA</span>
                  </h2>
                </div>

                {/* Quick Impact Counters */}
                <div className="flex items-center gap-3 text-[9pt] font-bold tracking-wide text-[#F2E7CF] mb-3">
                  <span className="text-[#ECC984] font-extrabold">{projCount * 15}+</span>
                  <span>Projects.</span>
                  <span className="text-[#A89A8B]">•</span>
                  <span className="text-[#ECC984] font-extrabold">{yearsCalc}+</span>
                  <span>Years.</span>
                </div>

                <div className="text-[8.5pt] font-bold uppercase tracking-wider text-[#ECC984] mb-1">
                  THE VISUAL ALCHEMIST
                </div>
                <p className="text-[8.8pt] leading-[1.48] text-[#D8C9BB] text-justify font-normal">
                  {basics.summary || resume.summary}
                </p>
              </section>
            )}

            {/* 2B. PORTFOLIO & PROJECTS CARD */}
            {orderedSections.includes("projects") && projects && projects.length > 0 && (
              <section
                className="rounded-2xl p-4 border border-[#F2E7CF]/10 shadow-xl space-y-3"
                style={{
                  backgroundColor: "rgba(38, 31, 25, 0.82)",
                  backdropFilter: "blur(12px)",
                  breakInside: "avoid",
                }}
              >
                <div className="flex items-center justify-between border-b border-[#F2E7CF]/10 pb-1.5">
                  <h2 className="text-[11pt] font-extrabold uppercase tracking-wider text-white">
                    PORTFOLIO
                  </h2>
                  <span className="text-[7.5pt] text-[#ECC984] font-medium tracking-wide">
                    Featured Highlights
                  </span>
                </div>

                <div className="space-y-2.5">
                  {projects.slice(0, 3).map((proj) => (
                    <div key={proj.id} className="group">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9pt] font-bold text-[#F2E7CF] group-hover:text-[#ECC984] transition-colors">
                          {proj.name}
                        </span>
                        {proj.link && (
                          <span className="text-[7.5pt] text-[#ECC984] underline truncate max-w-[120px]">
                            {proj.link.replace(/^https?:\/\//, "")}
                          </span>
                        )}
                      </div>
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="text-[7.8pt] text-[#B8A99A] mt-0.5">
                          {proj.tech.slice(0, 4).join(" • ")}
                        </div>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <p className="text-[8pt] text-[#C4B5A5] mt-0.5 line-clamp-2 leading-tight">
                          {proj.bullets[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2C. CLIENTS / CERTIFICATIONS / AWARDS */}
            {certifications && certifications.length > 0 && (
              <section
                className="rounded-2xl p-3.5 border border-[#F2E7CF]/10 shadow-xl"
                style={{
                  backgroundColor: "rgba(38, 31, 25, 0.75)",
                  backdropFilter: "blur(12px)",
                  breakInside: "avoid",
                }}
              >
                <h3 className="text-[9.5pt] font-extrabold uppercase tracking-wider text-white mb-2">
                  CREDENTIALS & HONORS
                </h3>
                <div className="space-y-1.5 text-[8.5pt]">
                  {certifications.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="flex justify-between items-center">
                      <span className="font-semibold text-[#F2E7CF]">{cert.name}</span>
                      <span className="text-[7.5pt] text-[#A89A8B]">{cert.issuer}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ================= CENTER COLUMN: PORTRAIT STAGING (approx 3 cols) ================= */}
          <div className="md:col-span-3 flex flex-col items-center justify-center my-auto relative">
            {/* Candidate Portrait Card */}
            <div className="relative w-44 h-64 sm:w-48 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#ECC984]/30 bg-[#2D251F] group">
              {basics.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={basics.photo}
                  alt={basics.name || "Candidate Portrait"}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#3D332B] to-[#241D17] text-[#ECC984] p-4 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#ECC984]/40 flex items-center justify-center mb-3 bg-[#2D251F]">
                    <svg className="w-8 h-8 text-[#ECC984]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[9pt] font-extrabold uppercase tracking-wider text-[#F2E7CF]">
                    {basics.name || "PORTRAIT"}
                  </span>
                  <span className="text-[7.5pt] text-[#A89A8B] mt-1">Creative Leader</span>
                </div>
              )}

              {/* Gold gradient bottom edge vignette */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            {/* Decorative arrow pointing to skills or details */}
            <div className="hidden md:flex items-center gap-1.5 mt-3 text-[#ECC984] text-[8pt] font-bold tracking-wider uppercase">
              <svg className="w-6 h-6 stroke-[#ECC984]" viewBox="0 0 32 32" fill="none">
                <path d="M6 10C12 10 16 16 20 22M20 22L14 20M20 22L22 15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Skills & Path</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (approx 4 cols) ================= */}
          <div className="md:col-span-4 space-y-5">
            {/* 3A. EDUCATION SECTION */}
            {orderedSections.includes("education") && education && education.length > 0 && (
              <section className="space-y-2" style={{ breakInside: "avoid" }}>
                <h2 className="text-[12pt] font-extrabold uppercase tracking-wider text-white">
                  EDUCATION
                </h2>
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative pl-3.5 border-l-2 border-[#ECC984]/40">
                      <div className="font-bold text-[9pt] text-[#F2E7CF] leading-tight">
                        {edu.degree}
                      </div>
                      <div className="text-[8pt] text-[#C4B5A5] mt-0.5">
                        {edu.school}
                        {edu.location ? `, ${edu.location}` : ""}
                      </div>
                      <div className="text-[7.5pt] text-[#ECC984]/80 font-medium tracking-wide mt-0.5">
                        {edu.start ? `${edu.start} — ` : ""}
                        {edu.end || edu.year || "Present"}
                        {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3B. SKILLS TAG CLUSTER */}
            {orderedSections.includes("skills") && flatSkills.length > 0 && (
              <section className="space-y-2" style={{ breakInside: "avoid" }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-[11.5pt] font-extrabold uppercase tracking-wider text-[#ECC984]">
                    SKILLS
                  </h2>
                  <svg className="w-5 h-4 stroke-[#ECC984]" viewBox="0 0 24 16" fill="none">
                    <path d="M2 8C8 2 14 14 20 8M20 8L15 6M20 8L16 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-[8.5pt] leading-relaxed text-[#D8C9BB]">
                  {flatSkills.slice(0, 14).map((skill, idx) => (
                    <React.Fragment key={idx}>
                      <span className="font-medium text-[#F2E7CF] hover:text-[#ECC984] transition-colors">
                        {skill}
                      </span>
                      {idx < Math.min(flatSkills.length, 14) - 1 && (
                        <span className="text-[#ECC984] mx-1.5 font-bold select-none">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}

            {/* 3C. MY JOURNEY (Work Experience Card) */}
            {orderedSections.includes("experience") && experience && experience.length > 0 && (
              <section
                className="rounded-2xl p-4 sm:p-5 border border-[#F2E7CF]/10 shadow-xl space-y-3.5"
                style={{
                  backgroundColor: "rgba(38, 31, 25, 0.85)",
                  backdropFilter: "blur(12px)",
                  breakInside: "avoid",
                }}
              >
                <div className="border-b border-[#F2E7CF]/10 pb-1.5 flex items-baseline gap-1.5">
                  <span
                    className="text-[13pt] text-[#ECC984] font-semibold italic"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    My
                  </span>
                  <h2 className="text-[12pt] font-black uppercase tracking-wider text-white">
                    JOURNEY
                  </h2>
                </div>

                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="font-extrabold text-[9.5pt] uppercase tracking-wide text-[#F2E7CF]">
                        {exp.role}
                      </div>
                      <div className="text-[8.5pt] text-[#ECC984] font-medium leading-tight">
                        {exp.company}
                        {exp.location ? ` - ${exp.location}` : ""}
                      </div>
                      <div className="text-[7.5pt] text-[#A89A8B] uppercase tracking-wider mt-0.5">
                        {exp.start} — {exp.end || "Present"}
                        {exp.current ? " (Current)" : ""}
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-[8.2pt] text-[#D8C9BB] leading-snug">
                          {exp.bullets.slice(0, 3).map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-[#ECC984] mr-1.5 text-[7pt] select-none">•</span>
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
          </div>
        </div>

        {/* ================= 3. BOTTOM CONTACT STRIP ================= */}
        <footer
          className="mt-6 pt-3 border-t border-[#F2E7CF]/10 flex flex-wrap items-center justify-between gap-4 text-[8.8pt] font-medium text-[#F2E7CF]"
          style={{ breakInside: "avoid" }}
        >
          {basics.email && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ECC984]/15 flex items-center justify-center text-[#ECC984]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <a href={`mailto:${basics.email}`} className="hover:text-[#ECC984] transition-colors">
                {basics.email}
              </a>
            </div>
          )}

          {basics.phone && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ECC984]/15 flex items-center justify-center text-[#ECC984]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>{basics.phone}</span>
            </div>
          )}

          {basics.location && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ECC984]/15 flex items-center justify-center text-[#ECC984]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>{basics.location}</span>
            </div>
          )}

          {basics.linkedin && (
            <div className="flex items-center gap-2 text-[8pt] text-[#A89A8B]">
              <span className="text-[#ECC984] font-bold">in</span>
              <span>{basics.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
            </div>
          )}
        </footer>
      </div>
    </article>
  );
};
