import type { Resume } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";

/**
 * Generates clean, standard ASCII plain-text suitable for pasting into
 * text-only job portals, email bodies, or terminal readers.
 */
export function exportToTxt(resume: Resume): string {
  const lines: string[] = [];
  const divider = "=".repeat(60);

  // 1. Contact Header
  const name = (resume.basics.name || "CANDIDATE NAME").toUpperCase();
  const headline = resume.basics.headline || resume.basics.title || "";
  const contactParts = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.linkedin,
    resume.basics.github,
    resume.basics.portfolio,
  ].filter(Boolean);

  lines.push(name);
  if (headline) lines.push(headline);
  if (contactParts.length > 0) lines.push(contactParts.join(" | "));
  lines.push("");

  const sectionOrder = resume.meta?.sectionOrder || [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
  ];
  const hiddenSections = new Set(resume.meta?.hiddenSections || []);

  for (const sectionId of sectionOrder) {
    if (hiddenSections.has(sectionId)) continue;

    // A. SUMMARY
    if (sectionId === "summary") {
      const summaryText = (resume.basics.summary || resume.summary || "").trim();
      if (summaryText) {
        lines.push(divider);
        lines.push("PROFESSIONAL SUMMARY");
        lines.push(divider);
        lines.push(summaryText);
        lines.push("");
      }
    }

    // B. EXPERIENCE
    else if (sectionId === "experience" && resume.experience?.length > 0) {
      lines.push(divider);
      lines.push("WORK EXPERIENCE");
      lines.push(divider);

      for (const exp of resume.experience) {
        const companyLine = [exp.company, exp.location].filter(Boolean).join(" — ");
        const dateLine = [exp.start, exp.end || "Present"].filter(Boolean).join(" – ");

        lines.push(`${companyLine}${dateLine ? ` (${dateLine})` : ""}`);
        if (exp.role) lines.push(`Role: ${exp.role}`);

        for (const bullet of exp.bullets) {
          if (!bullet.trim()) continue;
          lines.push(`  • ${bullet.trim()}`);
        }
        lines.push("");
      }
    }

    // C. EDUCATION
    else if (sectionId === "education" && resume.education?.length > 0) {
      lines.push(divider);
      lines.push("EDUCATION");
      lines.push(divider);

      for (const edu of resume.education) {
        const yearText = edu.year || (edu.start && edu.end ? `${edu.start} – ${edu.end}` : edu.end || "");
        lines.push(`${edu.school}${yearText ? ` (${yearText})` : ""}`);
        const degreeLine = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join(" • ");
        if (degreeLine) lines.push(`  ${degreeLine}`);
        lines.push("");
      }
    }

    // D. SKILLS
    else if (sectionId === "skills") {
      const flatSkills = getFlatSkills(resume.skills);
      if (flatSkills.length > 0) {
        lines.push(divider);
        lines.push("TECHNICAL SKILLS");
        lines.push(divider);

        if (Array.isArray(resume.skills) && typeof resume.skills[0] === "object") {
          for (const cat of resume.skills as any[]) {
            if (!cat.items || cat.items.length === 0) continue;
            lines.push(`${cat.category}: ${cat.items.join(", ")}`);
          }
        } else {
          lines.push(flatSkills.join(", "));
        }
        lines.push("");
      }
    }

    // E. PROJECTS
    else if (sectionId === "projects" && resume.projects?.length > 0) {
      lines.push(divider);
      lines.push("FEATURED PROJECTS");
      lines.push(divider);

      for (const proj of resume.projects) {
        lines.push(`${proj.name}${proj.link ? ` (${proj.link})` : ""}`);
        if (proj.tech && proj.tech.length > 0) {
          lines.push(`Technologies: ${proj.tech.join(", ")}`);
        }
        for (const bullet of proj.bullets) {
          if (!bullet.trim()) continue;
          lines.push(`  • ${bullet.trim()}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n").trim() + "\n";
}

/**
 * Triggers a direct browser download of the plain-text resume.
 */
export function downloadResumeTxt(resume: Resume, filename?: string): void {
  const text = exportToTxt(resume);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const candidateName = (resume.basics.name || "Resume").replace(/\s+/g, "_");
  const roleName = (resume.basics.headline || resume.basics.title || "").replace(/\s+/g, "_");
  const finalFilename = filename || `${candidateName}${roleName ? `_${roleName}` : ""}_Resume.txt`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  a.click();
  URL.revokeObjectURL(url);
}
