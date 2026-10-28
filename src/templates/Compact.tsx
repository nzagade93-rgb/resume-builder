"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import { getVisibleSectionOrder, getNormalizedSkills } from "./templateUtils";
import { getFlatSkills } from "@/types/resume";

type TemplateProps = {
  resume: Resume;
};

export const Compact: React.FC<TemplateProps> = ({ resume }) => {
  const { basics, experience, education, skills, projects, customSections } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const flatSkills = getFlatSkills(skills);
  const headline = basics.headline || basics.title;

  return (
    <article
      id="resume-document"
      className="w-full min-h-full p-[12mm] bg-white text-slate-900 font-sans text-[9.5pt] leading-[1.28] box-border print:shadow-none print:w-full print:min-h-0 print:p-0"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Tight Compact Header */}
      <header className="mb-3 border-b-2 border-slate-900 pb-1.5" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <h1 className="text-[17pt] font-extrabold uppercase tracking-tight text-slate-950">
              {basics.name || "Full Name"}
            </h1>
            {headline && (
              <p className="text-[10pt] font-semibold text-slate-700">
                {headline}
              </p>
            )}
          </div>
          <div className="text-right text-[8.5pt] text-slate-600 flex flex-wrap gap-x-2">
            {basics.location && <span>{basics.location}</span>}
            {basics.phone && <span>• {basics.phone}</span>}
            {basics.email && <span>• {basics.email}</span>}
            {basics.linkedin && <span>• {basics.linkedin}</span>}
          </div>
        </div>

        {/* Compact Summary */}
        {orderedSections.includes("summary") && (basics.summary || resume.summary) && (
          <p className="mt-1 text-[9pt] leading-tight text-slate-700">
            {basics.summary || resume.summary}
          </p>
        )}
      </header>

      {/* Sections with tight spacing */}
      <main className="space-y-3">
        {orderedSections
          .filter((secId) => secId !== "summary")
          .map((sectionId) => {
            // Experience
            if (sectionId === "experience" && experience && experience.length > 0) {
              return (
                <section key="experience">
                  <h2
                    className="text-[10.5pt] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1.5"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    Experience
                  </h2>
                  <div className="space-y-2">
                    {experience.map((item) => (
                      <div
                        key={item.id}
                        className="entry"
                        style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-950 text-[9.5pt] break-words">
                            {item.role} <span className="font-normal text-slate-600">at {item.company}</span>
                          </span>
                          <span className="text-[8.5pt] text-slate-500 shrink-0 whitespace-nowrap">
                            {item.start} – {item.end}
                          </span>
                        </div>
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="list-disc ml-4 space-y-0.5 text-slate-700 text-[9pt] mt-0.5">
                            {item.bullets.filter(Boolean).map((bullet, idx) => (
                              <li key={idx} className="leading-tight">
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
                    className="text-[10.5pt] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    Education
                  </h2>
                  <div className="space-y-1">
                    {education.map((item) => (
                      <div
                        key={item.id}
                        className="entry flex justify-between items-baseline gap-2 text-[9pt]"
                        style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                      >
                        <span className="font-bold text-slate-900 break-words">
                          {item.school} <span className="font-normal italic text-slate-600">— {item.degree}</span>
                        </span>
                        <span className="text-[8.5pt] text-slate-500 shrink-0">{item.year || item.end}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // Inline Skills
            if (sectionId === "skills" && flatSkills.length > 0) {
              return (
                <section key="skills" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <h2
                    className="text-[10.5pt] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    Skills
                  </h2>
                  <p className="text-[9pt] text-slate-800 leading-snug">
                    {flatSkills.join(" • ")}
                  </p>
                </section>
              );
            }

            // Projects
            if (sectionId === "projects" && projects && projects.length > 0) {
              return (
                <section key="projects">
                  <h2
                    className="text-[10.5pt] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    Projects
                  </h2>
                  <div className="space-y-1.5">
                    {projects.map((p) => (
                      <div key={p.id}>
                        <div className="flex justify-between font-bold text-slate-900 text-[9pt]">
                          <span>{p.name}</span>
                          <span className="font-normal text-[8pt] text-slate-500">{p.tech.join(", ")}</span>
                        </div>
                        {p.bullets.length > 0 && (
                          <ul className="list-disc ml-4 space-y-0.5 text-slate-700 text-[8.5pt]">
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
                    className="text-[10.5pt] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    {customSec.heading}
                  </h2>
                  <div className="space-y-1.5 text-[9pt]">
                    {customSec.entries.map((entry) => (
                      <div key={entry.id}>
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{entry.title}</span>
                          {entry.date && <span className="font-normal text-[8pt]">{entry.date}</span>}
                        </div>
                        {entry.bullets.length > 0 && (
                          <ul className="list-disc ml-4 space-y-0.5 text-slate-700 text-[8.5pt]">
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
    </article>
  );
};

export default Compact;
