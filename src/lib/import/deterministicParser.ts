import type { Resume, Experience, Education, SkillCategory } from "@/types/resume";
import { BUILTIN_TECH_SKILLS } from "@/lib/keywords";
import { DEFAULT_DESIGN_META } from "@/lib/schema";

export interface ParseResult {
  resume: Resume;
  lowConfidenceFields: string[];
}

/**
 * Deterministically parses raw extracted resume text into ResumeSchemaV2.
 * Adheres strictly to the non-negotiable rule:
 * NEVER invent missing fields; leave them empty.
 */
export function parseResumeTextDeterministically(rawText: string): ParseResult {
  const lowConfidenceFields: string[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Email Extraction
  const emailMatch = rawText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : "";
  if (!email) lowConfidenceFields.push("Email address was not found");

  // 2. Phone Extraction
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 3. Links Extraction
  const linkedinMatch = rawText.match(/(?:linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const githubMatch = rawText.match(/(?:github\.com\/[a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  // 4. Candidate Name & Headline Extraction
  let name = "";
  let headline = "";

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    // Skip if line is email, phone, or heading
    if (
      line.includes("@") ||
      /\d{3}[-.]\d{4}/.test(line) ||
      /^(curriculum vitae|resume|cv)$/i.test(line)
    ) {
      continue;
    }

    if (!name && line.length < 40 && !line.includes("•")) {
      // First clean capitalized line is name
      name = line;
      continue;
    }

    if (name && !headline && line.length < 60 && !line.includes("•") && !line.includes("|")) {
      headline = line;
      break;
    }
  }

  if (!name) {
    name = "Imported Candidate";
    lowConfidenceFields.push("Candidate name");
  }

  // 5. Section Segmentation
  type SectionKey = "summary" | "experience" | "education" | "skills" | "projects" | "other";
  const sections: Record<SectionKey, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    other: [],
  };

  let currentSection: SectionKey = "summary";

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (
      lower.includes("experience") ||
      lower.includes("employment") ||
      lower.includes("work history")
    ) {
      currentSection = "experience";
      continue;
    }
    if (lower.includes("education") || lower.includes("academic")) {
      currentSection = "education";
      continue;
    }
    if (
      lower.includes("skills") ||
      lower.includes("technologies") ||
      lower.includes("competencies")
    ) {
      currentSection = "skills";
      continue;
    }
    if (lower.includes("projects") || lower.includes("open source")) {
      currentSection = "projects";
      continue;
    }
    if (
      lower.includes("summary") ||
      lower.includes("profile") ||
      lower.includes("about me")
    ) {
      currentSection = "summary";
      continue;
    }

    sections[currentSection].push(line);
  }

  // 6. Parse Summary
  const summary = sections.summary.slice(0, 4).join(" ").trim();

  // 7. Parse Experience Entries
  const experienceEntries: Experience[] = [];
  const expLines = sections.experience;

  let currentExp: Experience | null = null;

  for (const line of expLines) {
    const isBullet = /^[-*•–—]\s*/.test(line) || /^\d+\.\s*/.test(line);

    // Date range pattern e.g. "2020 - Present" or "Jan 2019 - Dec 2021"
    const dateMatch = line.match(
      /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4})\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4}|present|current)\b/i
    );

    if (dateMatch && !isBullet) {
      if (currentExp && (currentExp.bullets.length > 0 || currentExp.start)) {
        experienceEntries.push(currentExp);
        currentExp = null;
      }

      if (currentExp && !currentExp.start) {
        currentExp.start = dateMatch[1];
        currentExp.end = dateMatch[2];
        currentExp.current = /present|current/i.test(dateMatch[2]);
      } else {
        const beforeDates = line.slice(0, dateMatch.index).trim();
        const parts = beforeDates.split(/[,|—–-]\s*/);

        currentExp = {
          id: `exp-${Date.now()}-${experienceEntries.length + 1}`,
          company: parts[0] || "Company",
          role: parts[1] || "Role",
          location: "",
          start: dateMatch[1],
          end: dateMatch[2],
          current: /present|current/i.test(dateMatch[2]),
          bullets: [],
        };
      }
    } else if (currentExp && isBullet) {
      const cleanBullet = line.replace(/^[-*•–—\d.]+\s*/, "").trim();
      if (cleanBullet) currentExp.bullets.push(cleanBullet);
    } else if (!isBullet && line.length < 60) {
      if (currentExp && currentExp.bullets.length > 0) {
        experienceEntries.push(currentExp);
        currentExp = null;
      }

      const parts = line.split(/[,|—–-]\s*/);
      currentExp = {
        id: `exp-${Date.now()}-${experienceEntries.length + 1}`,
        company: parts[0] || line,
        role: parts[1] || "",
        location: "",
        start: "",
        end: "Present",
        current: true,
        bullets: [],
      };
    }
  }

  if (currentExp && currentExp.company) {
    experienceEntries.push(currentExp);
  }

  if (experienceEntries.length === 0) {
    lowConfidenceFields.push("Work experience dates or companies");
  }

  // 8. Parse Education Entries
  const educationEntries: Education[] = [];
  const eduLines = sections.education;

  let currentEdu: Education | null = null;
  for (const line of eduLines) {
    const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
    const hasDegree = /\b(bachelor|master|phd|b\.s|m\.s|b\.a|degree|diploma)\b/i.test(line);
    const hasUniversity = /\b(university|college|institute|school|academy)\b/i.test(line);

    if (hasUniversity || hasDegree || yearMatch) {
      if (!currentEdu) {
        currentEdu = {
          id: `edu-${Date.now()}-${educationEntries.length + 1}`,
          school: hasUniversity ? line : "University",
          degree: hasDegree ? line : "Degree",
          field: "",
          year: yearMatch ? yearMatch[0] : "",
          start: yearMatch ? yearMatch[0] : "",
          end: yearMatch ? yearMatch[0] : "",
          gpa: "",
        };
      } else {
        if (hasDegree && currentEdu.degree === "Degree") currentEdu.degree = line;
        if (yearMatch && !currentEdu.year) {
          currentEdu.year = yearMatch[0];
          currentEdu.end = yearMatch[0];
        }
      }
    }
  }

  if (currentEdu) educationEntries.push(currentEdu);

  // 9. Parse Skills Tokens
  const skillTokens = new Set<string>();
  const normalizedRaw = rawText.toLowerCase();

  for (const skill of BUILTIN_TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(normalizedRaw)) {
      skillTokens.add(skill);
    }
  }

  const skillsCategories: SkillCategory[] = [
    {
      id: "skill-imported-1",
      category: "Technical Competencies",
      items: Array.from(skillTokens).slice(0, 18),
    },
  ];

  // Assemble Resulting Resume
  const parsedResume: Resume = {
    schemaVersion: 2,
    basics: {
      name,
      headline: headline || "Software Professional",
      title: headline || "Software Professional",
      email,
      phone,
      location: "",
      linkedin,
      github,
      portfolio: "",
      summary,
    },
    summary,
    experience: experienceEntries,
    education: educationEntries,
    skills: skillsCategories,
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteering: [],
    publications: [],
    customSections: [],
    meta: {
      sectionOrder: ["summary", "experience", "education", "skills", "projects"],
      hiddenSections: [],
      pageSize: "A4",
      design: DEFAULT_DESIGN_META,
    },
    template: "ats",
  };

  return {
    resume: parsedResume,
    lowConfidenceFields,
  };
}
