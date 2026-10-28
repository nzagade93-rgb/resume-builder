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

export const Minimal: React.FC<TemplateProps> = ({ resume, design: designOverride }) => {
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
      className="w-full min-h-full bg-white text-slate-800 box-border print:shadow-none print:w-full print:min-h-0 print:p-0"
      style={{
        padding,
        fontFamily,
        fontSize: `${9.75 * design.fontScale}pt`,
        lineHeight: design.lineHeight,
      }}
    >
      {/* Minimal Header */}
      <header className="mb-6 pb-2" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <h1 className="text-[22pt] font-light tracking-tight text-slate-900 leading-none">
          {basics.name || "Full Name"}
        </h1>
        {headline && (
          <p className="text-[10.5pt] font-normal tracking-wide text-slate-500 mt-1">
            {headline}
          </p>
        )}
        <div className="text-[9pt] text-slate-400 mt-2 flex flex-wrap items-center gap-x-2.5">
          {basics.location && <span>{basics.location}</span>}
          {basics.email && (
            <span>
              / <a href={`mailto:${basics.email}`} className="text-slate-600 hover:text-slate-900">{basics.email}</a>
            </span>
          )}
          {basics.phone && <span>/ {basics.phone}</span>}
          {basics.linkedin && (
            <span>
              / <a href={`https://${basics.linkedin.replace(/^https?:\/\//, "")}`} className="text-slate-600 hover:text-slate-900">{basics.linkedin}</a>
            </span>
          )}
          {basics.github && (
            <span>
              / <a href={`https://${basics.github.replace(/^https?:\/\//, "")}`} className="text-slate-600 hover:text-slate-900">{basics.github}</a>
            </span>
          )}
        </div>
      </header>

      {/* Dynamic Ordered Content Sections */}
      {orderedSections.map((sectionId) => {
        // Summary
        if (sectionId === "summary" && (basics.summary || resume.summary)) {
          return (
            <section key="summary" className={gapClass} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <div className="border-t border-slate-200/80 pt-2 mb-1.5 flex items-baseline justify-between">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Profile
                </h2>
              </div>
              <p className="text-slate-700 text-[9.5pt] leading-relaxed max-w-2xl">
                {basics.summary || resume.summary}
              </p>
            </section>
          );
        }

        // Experience
        if (sectionId === "experience" && experience && experience.length > 0) {
          return (
            <section key="experience" className={gapClass}>
              <div className="border-t border-slate-200/80 pt-2 mb-2.5">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Experience
                </h2>
              </div>
              <div className="space-y-3.5">
                {experience.map((item) => (
                  <div key={item.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-semibold text-slate-900 text-[10pt]">
                        {item.role} <span className="font-normal text-slate-500">— {item.company}</span>
                      </span>
                      <span className="text-[8.5pt] text-slate-400 shrink-0">
                        {item.start} – {item.end}
                      </span>
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="ml-3.5 space-y-0.5 text-slate-600 text-[9pt] mt-1 list-disc">
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
            <section key="education" className={gapClass} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <div className="border-t border-slate-200/80 pt-2 mb-2">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Education
                </h2>
              </div>
              <div className="space-y-2">
                {education.map((item) => (
                  <div key={item.id} className="flex justify-between items-baseline gap-2 text-[9.5pt]">
                    <div>
                      <span className="font-medium text-slate-900">{item.school}</span>
                      <span className="text-slate-500 ml-1.5">— {item.degree}</span>
                    </div>
                    <span className="text-[8.5pt] text-slate-400 shrink-0">{item.year || item.end}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Skills
        if (sectionId === "skills" && normalizedSkills.length > 0) {
          return (
            <section key="skills" className={gapClass} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <div className="border-t border-slate-200/80 pt-2 mb-2">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Expertise
                </h2>
              </div>
              <div className="space-y-1 text-[9pt] text-slate-600">
                {normalizedSkills.map((cat) => (
                  <div key={cat.id || cat.category}>
                    <span className="font-medium text-slate-800 mr-1.5">{cat.category}:</span>
                    <span>{cat.items.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Projects
        if (sectionId === "projects" && projects && projects.length > 0) {
          return (
            <section key="projects" className={gapClass}>
              <div className="border-t border-slate-200/80 pt-2 mb-2">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Projects
                </h2>
              </div>
              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div key={p.id} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-slate-900 text-[9.5pt]">
                        {p.name} {p.link ? `(${p.link})` : ""}
                      </span>
                      <span className="text-[8.5pt] text-slate-400">{p.tech.join(" · ")}</span>
                    </div>
                    {p.bullets.length > 0 && (
                      <ul className="ml-3.5 space-y-0.5 text-slate-600 text-[9pt] mt-0.5 list-disc">
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
            <section key="certifications" className={gapClass}>
              <div className="border-t border-slate-200/80 pt-2 mb-2">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Certifications
                </h2>
              </div>
              <div className="space-y-1 text-[9pt] text-slate-600">
                {certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span><strong className="font-medium text-slate-800">{c.name}</strong> — {c.issuer}</span>
                    {c.date && <span className="text-[8.5pt] text-slate-400">{c.date}</span>}
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
              <div className="border-t border-slate-200/80 pt-2 mb-1.5">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Languages
                </h2>
              </div>
              <p className="text-[9pt] text-slate-600">
                {languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}
              </p>
            </section>
          );
        }

        // Awards
        if (sectionId === "awards" && awards && awards.length > 0) {
          return (
            <section key="awards" className={gapClass}>
              <div className="border-t border-slate-200/80 pt-2 mb-1.5">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  Awards
                </h2>
              </div>
              <div className="space-y-1 text-[9pt] text-slate-600">
                {awards.map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span><strong className="font-medium text-slate-800">{a.title}</strong> — {a.issuer}</span>
                    {a.date && <span className="text-[8.5pt] text-slate-400">{a.date}</span>}
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
            <section key={customSec.id} className={gapClass}>
              <div className="border-t border-slate-200/80 pt-2 mb-2">
                <h2 className="text-[9.5pt] font-semibold uppercase tracking-widest text-slate-400">
                  {customSec.heading}
                </h2>
              </div>
              <div className="space-y-2 text-[9pt]">
                {customSec.entries.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex justify-between font-medium text-slate-900">
                      <span>{entry.title}</span>
                      {entry.date && <span className="text-slate-400 text-[8.5pt]">{entry.date}</span>}
                    </div>
                    {entry.subtitle && <div className="text-slate-500 italic">{entry.subtitle}</div>}
                    {entry.bullets.length > 0 && (
                      <ul className="ml-3.5 space-y-0.5 text-slate-600 mt-0.5 list-disc">
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

export default Minimal;
