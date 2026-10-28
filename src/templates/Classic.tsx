"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import { getVisibleSectionOrder, getNormalizedSkills } from "./templateUtils";

type TemplateProps = {
  resume: Resume;
};

export const Classic: React.FC<TemplateProps> = ({ resume }) => {
  const { basics, experience, education, skills, projects, certifications, languages, awards, customSections } = resume;
  const orderedSections = getVisibleSectionOrder(resume);
  const normalizedSkills = getNormalizedSkills(skills);
  const headline = basics.headline || basics.title;

  return (
    <article
      id="resume-document"
      className="w-full min-h-full p-[16mm] bg-white text-gray-900 font-serif text-[10.5pt] leading-[1.38] box-border print:shadow-none print:w-full print:min-h-0 print:p-0"
    >
      {/* Centered Serif Header */}
      <header className="mb-5 text-center border-b-2 border-gray-900 pb-3" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <h1 className="text-[20pt] font-bold tracking-normal uppercase text-gray-950 font-serif">
          {basics.name || "Full Name"}
        </h1>
        {headline && (
          <p className="text-[11pt] italic text-gray-700 mt-0.5">
            {headline}
          </p>
        )}
        <div className="text-[10pt] text-gray-700 mt-1.5 flex flex-wrap justify-center items-center gap-x-2">
          {basics.location && <span>{basics.location}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.email && <span>• {basics.email}</span>}
          {basics.linkedin && <span>• {basics.linkedin}</span>}
          {basics.github && <span>• {basics.github}</span>}
        </div>
      </header>

      {/* Dynamic Ordered Sections */}
      {orderedSections.map((sectionId) => {
        // Summary
        if (sectionId === "summary" && (basics.summary || resume.summary)) {
          return (
            <section key="summary" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-1.5 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Professional Summary
              </h2>
              <p className="text-gray-800 text-[10pt] leading-relaxed text-justify">
                {basics.summary || resume.summary}
              </p>
            </section>
          );
        }

        // Experience
        if (sectionId === "experience" && experience && experience.length > 0) {
          return (
            <section key="experience" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-2 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Experience
              </h2>
              <div className="space-y-3">
                {experience.map((item) => (
                  <div
                    key={item.id}
                    className="entry"
                    style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                  >
                    <div className="flex justify-between items-baseline font-bold text-gray-950 gap-2">
                      <span className="break-words">{item.company}</span>
                      <span className="text-[10pt] font-normal text-gray-700 shrink-0 whitespace-nowrap">
                        {item.start} – {item.end}
                      </span>
                    </div>
                    <div className="text-[10pt] italic text-gray-800 mb-1 break-words">
                      {item.role} {item.location ? `| ${item.location}` : ""}
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[10pt] text-gray-800">
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
            <section key="education" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-2 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {education.map((item) => (
                  <div
                    key={item.id}
                    className="entry"
                    style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                  >
                    <div className="flex justify-between items-baseline font-bold text-gray-950 gap-2">
                      <span className="break-words">{item.school}</span>
                      <span className="text-[10pt] font-normal text-gray-700 shrink-0 whitespace-nowrap">{item.year || item.end}</span>
                    </div>
                    <div className="text-[10pt] italic text-gray-800 break-words">
                      {item.degree} {item.field ? `in ${item.field}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Skills
        if (sectionId === "skills" && normalizedSkills.length > 0) {
          return (
            <section key="skills" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-1.5 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Skills & Competencies
              </h2>
              <div className="space-y-1 text-[10pt] text-gray-800">
                {normalizedSkills.map((cat) => (
                  <div key={cat.id || cat.category}>
                    <span className="font-bold">{cat.category}: </span>
                    <span>{cat.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Projects
        if (sectionId === "projects" && projects && projects.length > 0) {
          return (
            <section key="projects" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-2 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Featured Projects
              </h2>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between font-bold text-gray-950">
                      <span>{p.name} {p.link ? `(${p.link})` : ""}</span>
                      <span className="text-[9.5pt] font-normal italic">{p.tech.join(", ")}</span>
                    </div>
                    {p.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[10pt] text-gray-800 mt-0.5">
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

        // Certifications
        if (sectionId === "certifications" && certifications && certifications.length > 0) {
          return (
            <section key="certifications" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-1.5 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Certifications
              </h2>
              <div className="space-y-1 text-[10pt] text-gray-800">
                {certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span><strong>{c.name}</strong> — {c.issuer}</span>
                    {c.date && <span className="text-[9.5pt]">{c.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Languages
        if (sectionId === "languages" && languages && languages.length > 0) {
          return (
            <section key="languages" className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-1.5 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Languages
              </h2>
              <p className="text-[10pt] text-gray-800">
                {languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
              </p>
            </section>
          );
        }

        // Custom Sections
        const customSec = customSections?.find((s) => s.id === sectionId);
        if (customSec && customSec.entries.length > 0) {
          return (
            <section key={customSec.id} className="mb-4">
              <h2
                className="text-[11.5pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-800 pb-0.5 mb-2 font-serif"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                {customSec.heading}
              </h2>
              <div className="space-y-2 text-[10pt]">
                {customSec.entries.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex justify-between font-bold text-gray-950">
                      <span>{entry.title}</span>
                      {entry.date && <span className="font-normal text-[9.5pt]">{entry.date}</span>}
                    </div>
                    {entry.subtitle && <div className="italic text-gray-800">{entry.subtitle}</div>}
                    {entry.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-gray-800 mt-0.5">
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
    </article>
  );
};

export default Classic;
