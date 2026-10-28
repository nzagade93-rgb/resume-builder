"use client";

import React from "react";
import type { Resume } from "@/types/resume";
import {
  getVisibleSectionOrder,
  getNormalizedSkills,
  getFontFamily,
  getMarginPadding,
  getSectionGapClass,
  resolveDesign,
} from "./templateUtils";
import type { DesignMeta } from "@/types/resume";

type TemplateProps = {
  resume: Resume;
  design?: Partial<DesignMeta>;
};

export const Ats: React.FC<TemplateProps> = ({ resume, design: designOverride }) => {
  const { basics, experience, education, skills, projects, certifications, languages, awards, customSections } = resume;
  const design = resolveDesign(resume, designOverride);
  const orderedSections = getVisibleSectionOrder(resume);
  const normalizedSkills = getNormalizedSkills(skills);

  const headline = basics.headline || basics.title;
  const padding = getMarginPadding(design.margins);
  const fontFamily = getFontFamily(design.fontPairing);
  const gapClass = getSectionGapClass(design.sectionSpacing);

  return (
    <article
      id="resume-document"
      className="w-full min-h-full bg-white text-black font-sans box-border print:shadow-none print:w-full print:min-h-0 print:p-0"
      style={{
        padding,
        fontFamily,
        fontSize: `${10.5 * design.fontScale}pt`,
        lineHeight: design.lineHeight,
      }}
    >
      {/* Name and Contact Header */}
      <header className="mb-4 text-left border-b border-black pb-2" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <h1 className="text-[18pt] font-bold leading-tight uppercase tracking-tight text-black">
          {basics.name || "Full Name"}
        </h1>
        {headline && (
          <p className="text-[11pt] font-medium text-black mt-0.5">
            {headline}
          </p>
        )}
        <div className="text-[10pt] text-black mt-1 flex flex-wrap gap-x-2">
          {basics.location && <span>{basics.location}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.email && <span>• {basics.email}</span>}
          {basics.linkedin && <span>• {basics.linkedin}</span>}
          {basics.github && <span>• {basics.github}</span>}
        </div>
      </header>

      {/* Dynamic Ordered Sections */}
      {orderedSections.map((sectionId) => {
        // 1. Summary
        if (sectionId === "summary" && (basics.summary || resume.summary)) {
          return (
            <section key="summary" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-1.5"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Summary
              </h2>
              <p className="text-black text-[10.5pt] leading-relaxed">
                {basics.summary || resume.summary}
              </p>
            </section>
          );
        }

        // 2. Experience
        if (sectionId === "experience" && experience && experience.length > 0) {
          return (
            <section key="experience" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-2"
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
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-black break-words">{item.role}</span>
                      <span className="text-[10pt] text-black shrink-0 whitespace-nowrap">
                        {item.start} – {item.end}
                      </span>
                    </div>
                    <div className="text-[10.5pt] italic text-black mb-1 break-words">
                      {item.company} {item.location ? `• ${item.location}` : ""}
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[10.5pt] text-black">
                        {item.bullets.filter(Boolean).map((bullet, idx) => (
                          <li key={idx} className="leading-normal">
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

        // 3. Education
        if (sectionId === "education" && education && education.length > 0) {
          return (
            <section key="education" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-2"
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
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-black break-words">{item.school}</span>
                      <span className="text-[10pt] text-black shrink-0 whitespace-nowrap">
                        {item.year || item.end}
                      </span>
                    </div>
                    <div className="text-[10.5pt] text-black italic break-words">
                      {item.degree} {item.field ? `in ${item.field}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // 4. Skills
        if (sectionId === "skills" && normalizedSkills.length > 0) {
          return (
            <section key="skills" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-1.5"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Skills & Technologies
              </h2>
              <div className="space-y-1.5 text-[10.5pt] text-black">
                {normalizedSkills.map((cat) => (
                  <div key={cat.id || cat.category} className="leading-relaxed">
                    <span className="font-bold">{cat.category}: </span>
                    <span>{cat.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // 5. Projects
        if (sectionId === "projects" && projects && projects.length > 0) {
          return (
            <section key="projects" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-2"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Featured Projects
              </h2>
              <div className="space-y-2.5">
                {projects.map((proj) => (
                  <div key={proj.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-black break-words">
                        {proj.name} {proj.link ? `(${proj.link})` : ""}
                      </span>
                      {proj.tech.length > 0 && (
                        <span className="text-[10pt] text-black italic">
                          {proj.tech.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[10.5pt] text-black mt-1">
                        {proj.bullets.filter(Boolean).map((bullet, idx) => (
                          <li key={idx} className="leading-normal">
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

        // 6. Certifications
        if (sectionId === "certifications" && certifications && certifications.length > 0) {
          return (
            <section key="certifications" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-1.5"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Certifications
              </h2>
              <div className="space-y-1 text-[10.5pt] text-black">
                {certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="font-semibold">{c.name} — {c.issuer}</span>
                    {c.date && <span className="text-[10pt]">{c.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // 7. Languages
        if (sectionId === "languages" && languages && languages.length > 0) {
          return (
            <section key="languages" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-1.5"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Languages
              </h2>
              <p className="text-[10.5pt] text-black">
                {languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
              </p>
            </section>
          );
        }

        // 8. Awards
        if (sectionId === "awards" && awards && awards.length > 0) {
          return (
            <section key="awards" className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-1.5"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Honors & Awards
              </h2>
              <div className="space-y-1 text-[10.5pt] text-black">
                {awards.map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span>
                      <strong>{a.title}</strong> — {a.issuer}
                    </span>
                    {a.date && <span className="text-[10pt]">{a.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // 9. Custom Sections
        const customSec = customSections?.find((s) => s.id === sectionId);
        if (customSec && customSec.entries.length > 0) {
          return (
            <section key={customSec.id} className="mb-4">
              <h2
                className="text-[12pt] font-bold uppercase tracking-wide text-black border-b border-black mb-2"
                style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                {customSec.heading}
              </h2>
              <div className="space-y-2">
                {customSec.entries.map((entry) => (
                  <div key={entry.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-black">{entry.title}</span>
                      {entry.date && <span className="text-[10pt] text-black">{entry.date}</span>}
                    </div>
                    {entry.subtitle && (
                      <div className="text-[10.5pt] italic text-black">{entry.subtitle}</div>
                    )}
                    {entry.bullets && entry.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[10.5pt] text-black mt-0.5">
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

export default Ats;
