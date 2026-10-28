"use client";

import React from "react";
import type { Resume, DesignMeta } from "@/types/resume";
import {
  getVisibleSectionOrder,
  getNormalizedSkills,
  getFontFamily,
  getMarginPadding,
  getSectionGapClass,
  resolveDesign,
} from "./templateUtils";

type TemplateProps = {
  resume: Resume;
  design?: Partial<DesignMeta>;
};

export const Fresher: React.FC<TemplateProps> = ({ resume, design: designOverride }) => {
  const { basics, education, projects, skills, experience, certifications, awards, languages, customSections } = resume;
  const design = resolveDesign(resume, designOverride);
  const orderedSections = getVisibleSectionOrder(resume);
  const normalizedSkills = getNormalizedSkills(skills);
  const headline = basics.headline || basics.title;

  const padding = getMarginPadding(design.margins);
  const fontFamily = getFontFamily(design.fontPairing);
  const gapClass = getSectionGapClass(design.sectionSpacing);

  // In Fresher template, if user hasn't customized sectionOrder, default to Education -> Projects -> Skills -> Experience
  const effectiveSections = orderedSections.length > 0 ? orderedSections : [
    "education",
    "projects",
    "skills",
    "experience",
    "certifications",
    "awards",
  ];

  return (
    <article
      id="resume-document"
      className="w-full min-h-full bg-white text-slate-900 box-border print:shadow-none print:w-full print:min-h-0 print:p-0"
      style={{
        padding,
        fontFamily,
        fontSize: `${10 * design.fontScale}pt`,
        lineHeight: design.lineHeight,
      }}
    >
      {/* Fresher Centered Semantic Header */}
      <header className="mb-4 text-center border-b pb-3" style={{ borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <h1 className="text-[20pt] font-extrabold uppercase tracking-tight text-slate-950">
          {basics.name || "Full Name"}
        </h1>
        {headline && (
          <p className="text-[11pt] font-semibold text-slate-700 mt-0.5">
            {headline}
          </p>
        )}
        <div className="text-[9.5pt] text-slate-600 mt-1.5 flex flex-wrap justify-center items-center gap-x-2">
          {basics.location && <span>{basics.location}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.email && (
            <span>
              • <a href={`mailto:${basics.email}`} className="text-slate-800 hover:underline">{basics.email}</a>
            </span>
          )}
          {basics.linkedin && (
            <span>
              • <a href={`https://${basics.linkedin.replace(/^https?:\/\//, "")}`} className="text-slate-800 hover:underline">{basics.linkedin}</a>
            </span>
          )}
          {basics.github && (
            <span>
              • <a href={`https://${basics.github.replace(/^https?:\/\//, "")}`} className="text-slate-800 hover:underline">{basics.github}</a>
            </span>
          )}
        </div>
      </header>

      {/* Dynamic Ordered Content Sections */}
      {effectiveSections.map((sectionId) => {
        // Summary
        if (sectionId === "summary" && (basics.summary || resume.summary)) {
          return (
            <section key="summary" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-1.5 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Career Objective & Summary
              </h2>
              <p className="text-slate-800 text-[10pt] leading-relaxed">
                {basics.summary || resume.summary}
              </p>
            </section>
          );
        }

        // Education (Fresher Priority #1)
        if (sectionId === "education" && education && education.length > 0) {
          return (
            <section key="education" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Education
              </h2>
              <div className="space-y-2.5">
                {education.map((item) => (
                  <div key={item.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-[10.5pt]">
                        {item.school}
                      </span>
                      <span className="text-[9.5pt] font-medium text-slate-600 shrink-0">
                        {item.year || item.end}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[10pt] text-slate-700 italic">
                      <span>{item.degree} {item.field ? `in ${item.field}` : ""}</span>
                      {item.gpa && <span className="font-semibold text-slate-800 not-italic">GPA: {item.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Featured Projects (Fresher Priority #2)
        if (sectionId === "projects" && projects && projects.length > 0) {
          return (
            <section key="projects" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Academic & Personal Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-[10pt]">
                        {proj.name}
                        {proj.link && (
                          <span className="font-normal text-[9pt] text-slate-600 ml-1.5">
                            | {proj.link}
                          </span>
                        )}
                      </span>
                      {proj.tech.length > 0 && (
                        <span className="text-[9pt] font-semibold text-slate-700 italic shrink-0">
                          {proj.tech.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[9.5pt] text-slate-800 mt-1">
                        {proj.bullets.filter(Boolean).map((bullet, idx) => (
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

        // Skills (Fresher Priority #3)
        if (sectionId === "skills" && normalizedSkills.length > 0) {
          return (
            <section key="skills" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-1.5 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Technical & Tool Proficiencies
              </h2>
              <div className="space-y-1.5 text-[9.5pt] text-slate-800">
                {normalizedSkills.map((cat) => (
                  <div key={cat.id || cat.category} className="leading-relaxed">
                    <span className="font-bold text-slate-900">{cat.category}: </span>
                    <span>{cat.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Experience (Internships & Roles)
        if (sectionId === "experience" && experience && experience.length > 0) {
          return (
            <section key="experience" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Internships & Work Experience
              </h2>
              <div className="space-y-3">
                {experience.map((item) => (
                  <div key={item.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-[10pt]">
                        {item.role} <span className="font-normal text-slate-600">— {item.company}</span>
                      </span>
                      <span className="text-[9pt] font-medium text-slate-600 shrink-0">
                        {item.start} – {item.end}
                      </span>
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-[9.5pt] text-slate-800 mt-0.5">
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

        // Certifications
        if (sectionId === "certifications" && certifications && certifications.length > 0) {
          return (
            <section key="certifications" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-1.5 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Certifications & Badges
              </h2>
              <div className="space-y-1 text-[9.5pt] text-slate-800">
                {certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span><strong>{c.name}</strong> — {c.issuer}</span>
                    {c.date && <span className="text-[9pt] text-slate-600">{c.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Awards
        if (sectionId === "awards" && awards && awards.length > 0) {
          return (
            <section key="awards" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-1.5 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Achievements & Hackathons
              </h2>
              <div className="space-y-1 text-[9.5pt] text-slate-800">
                {awards.map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span><strong>{a.title}</strong> — {a.issuer}</span>
                    {a.date && <span className="text-[9pt] text-slate-600">{a.date}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Languages
        if (sectionId === "languages" && languages && languages.length > 0) {
          return (
            <section key="languages" className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-1.5 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                Languages
              </h2>
              <p className="text-[9.5pt] text-slate-800">
                {languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
              </p>
            </section>
          );
        }

        // Custom Sections
        const customSec = customSections?.find((s) => s.id === sectionId);
        if (customSec && customSec.entries.length > 0) {
          return (
            <section key={customSec.id} className={gapClass}>
              <h2
                className="text-[11pt] font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: design.accent, borderColor: design.accent, breakAfter: "avoid", pageBreakAfter: "avoid" }}
              >
                {customSec.heading}
              </h2>
              <div className="space-y-2 text-[9.5pt]">
                {customSec.entries.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{entry.title}</span>
                      {entry.date && <span className="font-normal text-[9pt]">{entry.date}</span>}
                    </div>
                    {entry.subtitle && <div className="italic text-slate-700">{entry.subtitle}</div>}
                    {entry.bullets.length > 0 && (
                      <ul className="list-disc ml-5 space-y-0.5 text-slate-800 mt-0.5">
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

export default Fresher;
