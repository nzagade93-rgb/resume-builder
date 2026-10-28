"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import { getVisibleSectionOrder, getNormalizedSkills } from "./templateUtils";

type TemplateProps = {
  resume: Resume;
};

export const Executive: React.FC<TemplateProps> = ({ resume }) => {
  const { basics, experience, education, skills, projects, certifications, customSections } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const normalizedSkills = getNormalizedSkills(skills);
  const headline = basics.headline || basics.title;

  return (
    <article
      id="resume-document"
      className="w-full min-h-full p-[18mm] bg-white text-slate-900 font-sans text-[10pt] leading-[1.4] box-border print:shadow-none print:w-full print:min-h-0 print:p-0 relative"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Thin top accent band */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-slate-900 print:bg-slate-900" />

      {/* Header with generous spacing & Small Caps */}
      <header className="mb-6 pb-4 border-b border-slate-200" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1
              className="text-[22pt] font-semibold tracking-widest text-slate-950 uppercase"
              style={{ fontVariant: "small-caps" }}
            >
              {basics.name || "Full Name"}
            </h1>
            {headline && (
              <p className="text-[11pt] font-medium text-slate-600 tracking-wide mt-0.5">
                {headline}
              </p>
            )}
          </div>

          <div className="text-right text-[9pt] text-slate-500 space-y-0.5 shrink-0">
            {basics.location && <div>{basics.location}</div>}
            {basics.email && <div>{basics.email}</div>}
            {basics.phone && <div>{basics.phone}</div>}
            {basics.linkedin && <div>{basics.linkedin}</div>}
          </div>
        </div>

        {/* Summary */}
        {orderedSections.includes("summary") && (basics.summary || resume.summary) && (
          <p className="mt-4 text-[9.5pt] leading-relaxed text-slate-700 max-w-3xl italic border-l-2 border-slate-900 pl-3">
            {basics.summary || resume.summary}
          </p>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="space-y-6">
        {orderedSections
          .filter((secId) => secId !== "summary")
          .map((sectionId) => {
            // Experience
            if (sectionId === "experience" && experience && experience.length > 0) {
              return (
                <section key="experience">
                  <h2
                    className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-3.5 border-b border-slate-200 flex items-baseline justify-between"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    <span className="text-slate-950">Executive Experience</span>
                    <span className="text-[9pt] font-normal text-slate-400 normal-case">History & Milestones</span>
                  </h2>

                  <div className="space-y-4">
                    {experience.map((item) => (
                      <div
                        key={item.id}
                        className="entry"
                        style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-950 text-[10pt] break-words">
                            {item.role}
                          </span>
                          <span className="text-[9pt] font-medium text-slate-500 shrink-0 whitespace-nowrap">
                            {item.start} – {item.end}
                          </span>
                        </div>
                        <div className="text-[9.5pt] font-semibold text-slate-600 mb-1 break-words">
                          {item.company} {item.location ? `| ${item.location}` : ""}
                        </div>
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="list-disc ml-4 space-y-1 text-slate-700 text-[9.5pt]">
                            {item.bullets.filter(Boolean).map((bullet, idx) => (
                              <li key={idx} className="leading-relaxed">
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
                    className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200 flex items-baseline justify-between"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    <span className="text-slate-950">Academic Credentials</span>
                    <span className="text-[9pt] font-normal text-slate-400 normal-case">Education & Degrees</span>
                  </h2>
                  <div className="space-y-2.5">
                    {education.map((item) => (
                      <div
                        key={item.id}
                        className="entry"
                        style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                      >
                        <div className="flex justify-between items-baseline gap-2 font-bold text-slate-900">
                          <span className="break-words text-[10pt]">{item.school}</span>
                          <span className="text-[9pt] font-medium text-slate-500 shrink-0">{item.year || item.end}</span>
                        </div>
                        <div className="text-[9.5pt] text-slate-600 break-words">{item.degree}</div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // Skills
            if (sectionId === "skills" && normalizedSkills.length > 0) {
              return (
                <section key="skills" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <h2
                    className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200 flex items-baseline justify-between"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    <span className="text-slate-950">Core Competencies</span>
                    <span className="text-[9pt] font-normal text-slate-400 normal-case">Skills & Tools</span>
                  </h2>
                  <div className="space-y-2">
                    {normalizedSkills.map((cat) => (
                      <div key={cat.id || cat.category} className="text-[9pt]">
                        <span className="font-bold text-slate-900 mr-2">{cat.category}:</span>
                        <span className="text-slate-700">{cat.items.join(" • ")}</span>
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
                    className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200 flex items-baseline justify-between"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    <span className="text-slate-950">Strategic Initiatives</span>
                    <span className="text-[9pt] font-normal text-slate-400 normal-case">Projects</span>
                  </h2>
                  <div className="space-y-2.5">
                    {projects.map((p) => (
                      <div key={p.id}>
                        <div className="flex justify-between font-bold text-slate-900 text-[9.5pt]">
                          <span>{p.name}</span>
                          <span className="font-normal text-[9pt] text-slate-500">{p.tech.join(", ")}</span>
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
                    className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200 flex items-baseline justify-between"
                    style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
                  >
                    <span className="text-slate-950">{customSec.heading}</span>
                    <span className="text-[9pt] font-normal text-slate-400 normal-case">Custom</span>
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
    </article>
  );
};

export default Executive;
