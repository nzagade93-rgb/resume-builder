"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import { getVisibleSectionOrder, getNormalizedSkills } from "./templateUtils";
import { getFlatSkills } from "@/types/resume";

type TemplateProps = {
  resume: Resume;
};

export const Modern: React.FC<TemplateProps> = ({ resume }) => {
  const { basics, experience, education, skills, projects, customSections } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const flatSkills = getFlatSkills(skills);
  const headline = basics.headline || basics.title;
  const tealAccent = "#0F766E";

  const showSkills = orderedSections.includes("skills") && flatSkills.length > 0;

  return (
    <article
      id="resume-document"
      className="w-full min-h-full p-[16mm] bg-white text-slate-900 text-[10pt] leading-[1.38] box-border print:shadow-none print:w-full print:min-h-0 print:p-0 flex flex-col justify-between"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div>
        {/* Header spanning top */}
        <header className="mb-6 pb-4 border-b border-slate-200" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
          <h1
            className="text-[24pt] font-bold text-slate-900 tracking-tight leading-none mb-1"
            style={{ fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif" }}
          >
            {basics.name || "Full Name"}
          </h1>
          {headline && (
            <p className="text-[12pt] font-medium" style={{ color: tealAccent }}>
              {headline}
            </p>
          )}
        </header>

        {/* 2-Column Body: 72% Left Main, 28% Right Sidebar */}
        <div className="flex gap-6 items-start">
          {/* Main Content (72%) */}
          <main className="w-[72%] space-y-5">
            {orderedSections
              .filter((secId) => secId !== "skills")
              .map((sectionId) => {
                // Summary
                if (sectionId === "summary" && (basics.summary || resume.summary)) {
                  return (
                    <section key="summary" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                      <h2
                        className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                        style={{ color: tealAccent, borderColor: tealAccent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
                      >
                        Summary
                      </h2>
                      <p className="text-slate-700 leading-relaxed text-[9.5pt]">
                        {basics.summary || resume.summary}
                      </p>
                    </section>
                  );
                }

                // Experience
                if (sectionId === "experience" && experience && experience.length > 0) {
                  return (
                    <section key="experience">
                      <h2
                        className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-3 border-b"
                        style={{ color: tealAccent, borderColor: tealAccent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
                      >
                        Experience
                      </h2>
                      <div className="space-y-4">
                        {experience.map((item) => (
                          <div
                            key={item.id}
                            className="entry"
                            style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                          >
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="font-bold text-slate-900 text-[10pt] break-words">
                                {item.role}
                              </span>
                              <span className="text-[9pt] font-medium text-slate-500 shrink-0 whitespace-nowrap">
                                {item.start} – {item.end}
                              </span>
                            </div>
                            <div className="text-[9.5pt] font-semibold text-slate-700 mb-1 break-words">
                              {item.company}
                            </div>
                            {item.bullets && item.bullets.length > 0 && (
                              <ul className="list-disc ml-4 space-y-1 text-slate-700 text-[9.5pt]">
                                {item.bullets.filter(Boolean).map((bullet, idx) => (
                                  <li key={idx} className="leading-snug">
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                // Education
                if (sectionId === "education" && education && education.length > 0) {
                  return (
                    <section key="education" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                      <h2
                        className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
                        style={{ color: tealAccent, borderColor: tealAccent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
                      >
                        Education
                      </h2>
                      <div className="space-y-2.5">
                        {education.map((item) => (
                          <div
                            key={item.id}
                            className="entry"
                            style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                          >
                            <div className="flex justify-between items-baseline gap-2 font-bold text-slate-900">
                              <span className="break-words text-[9.5pt]">{item.school}</span>
                              <span className="text-[9pt] font-normal text-slate-500 shrink-0">{item.year || item.end}</span>
                            </div>
                            <div className="text-[9.5pt] text-slate-600 break-words">{item.degree}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                // Projects
                if (sectionId === "projects" && projects && projects.length > 0) {
                  return (
                    <section key="projects">
                      <h2
                        className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
                        style={{ color: tealAccent, borderColor: tealAccent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
                      >
                        Projects
                      </h2>
                      <div className="space-y-2">
                        {projects.map((p) => (
                          <div key={p.id}>
                            <div className="flex justify-between items-baseline font-bold text-slate-900 text-[9.5pt]">
                              <span>{p.name}</span>
                              <span className="text-[9pt] font-normal text-slate-500">{p.tech.join(", ")}</span>
                            </div>
                            {p.bullets.length > 0 && (
                              <ul className="list-disc ml-4 space-y-0.5 text-slate-700 text-[9pt] mt-0.5">
                                {p.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                // Custom Sections
                const customSec = customSections?.find((s) => s.id === sectionId);
                if (customSec && customSec.entries.length > 0) {
                  return (
                    <section key={customSec.id}>
                      <h2
                        className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
                        style={{ color: tealAccent, borderColor: tealAccent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
                      >
                        {customSec.heading}
                      </h2>
                      <div className="space-y-2">
                        {customSec.entries.map((entry) => (
                          <div key={entry.id}>
                            <div className="flex justify-between font-bold text-slate-900 text-[9.5pt]">
                              <span>{entry.title}</span>
                              {entry.date && <span className="font-normal text-[8.5pt]">{entry.date}</span>}
                            </div>
                            {entry.subtitle && <div className="text-[9pt] italic text-slate-600">{entry.subtitle}</div>}
                            {entry.bullets.length > 0 && (
                              <ul className="list-disc ml-4 space-y-0.5 text-slate-700 text-[9pt] mt-0.5">
                                {entry.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                return null;
              })}
          </main>

          {/* Right Sidebar (28%) with contact and skills as rounded tags */}
          <aside className="w-[28%] bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 space-y-5">
            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="text-[9.5pt] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Contact
              </h3>
              <div className="space-y-1 text-[9pt] text-slate-600 break-words">
                {basics.location && (
                  <div>
                    <span className="block text-[8pt] uppercase font-bold text-slate-400">Location</span>
                    <span>{basics.location}</span>
                  </div>
                )}
                {basics.email && (
                  <div>
                    <span className="block text-[8pt] uppercase font-bold text-slate-400">Email</span>
                    <a href={`mailto:${basics.email}`} className="text-slate-800 hover:underline">
                      {basics.email}
                    </a>
                  </div>
                )}
                {basics.phone && (
                  <div>
                    <span className="block text-[8pt] uppercase font-bold text-slate-400">Phone</span>
                    <span>{basics.phone}</span>
                  </div>
                )}
                {basics.linkedin && (
                  <div>
                    <span className="block text-[8pt] uppercase font-bold text-slate-400">LinkedIn</span>
                    <span className="text-slate-800">{basics.linkedin}</span>
                  </div>
                )}
                {basics.github && (
                  <div>
                    <span className="block text-[8pt] uppercase font-bold text-slate-400">GitHub</span>
                    <span className="text-slate-800">{basics.github}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills as Rounded Tags */}
            {showSkills && (
              <div className="space-y-2">
                <h3 className="text-[9.5pt] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {flatSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-0.5 rounded-full text-[8.5pt] font-medium border"
                      style={{
                        backgroundColor: "#F0FDFA",
                        color: "#0F766E",
                        borderColor: "#CCFBF1",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
};

export default Modern;
