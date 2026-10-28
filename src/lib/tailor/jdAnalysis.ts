import type { Resume, KeywordMatchDetail } from "@/types/resume";
import { BUILTIN_TECH_SKILLS, COMMON_STOP_WORDS } from "@/lib/keywords";
import { getFlatSkills } from "@/lib/schema";

export interface ParsedJd {
  company: string;
  role: string;
  seniority: "Intern" | "Entry-Level" | "Mid-Level" | "Senior" | "Lead / Staff" | "Principal" | "Management" | "Not specified";
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  allKeywords: string[];
}

export interface JdMatchReport {
  score: number; // 0 - 100
  matchedKeywords: KeywordMatchDetail[];
  trueSoundingKeywords: KeywordMatchDetail[]; // Adjacent skills (amber): "Add only if you really have this"
  missingGaps: KeywordMatchDetail[]; // Gaps (red)
  totalKeywords: number;
  parsedJd: ParsedJd;
}

// Adjacent tech skill mappings for "true-sounding" suggestions
const TECH_ADJACENCY_MAP: Record<string, string[]> = {
  react: ["next.js", "redux", "zustand", "tailwind", "typescript", "jest"],
  typescript: ["javascript", "node.js", "react", "next.js", "express"],
  javascript: ["typescript", "html", "css", "node.js", "react"],
  python: ["fastapi", "django", "flask", "docker", "sql", "postgresql"],
  node: ["express", "typescript", "rest", "postgresql", "mongodb", "docker"],
  "node.js": ["express", "typescript", "rest", "postgresql", "mongodb", "docker"],
  docker: ["kubernetes", "ci/cd", "github actions", "aws", "linux"],
  aws: ["docker", "terraform", "ci/cd", "cloud computing", "serverless"],
  sql: ["postgresql", "mysql", "nosql", "redis", "database design"],
  postgresql: ["sql", "redis", "prisma", "database design"],
  golang: ["docker", "kubernetes", "microservices", "grpc", "distributed systems"],
  java: ["spring", "spring boot", "microservices", "junit", "sql"],
};

/**
 * Heuristically parses a job description into structured sections and seniority.
 */
export function parseJobDescription(jd: string): ParsedJd {
  if (!jd || !jd.trim()) {
    return {
      company: "",
      role: "",
      seniority: "Not specified",
      responsibilities: [],
      requiredSkills: [],
      preferredSkills: [],
      allKeywords: [],
    };
  }

  const lines = jd.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const normalized = jd.toLowerCase();

  // 1. Detect Seniority
  let seniority: ParsedJd["seniority"] = "Not specified";
  if (/\b(principal|fellow|distinguished)\b/i.test(normalized)) {
    seniority = "Principal";
  } else if (/\b(staff|lead|architect|tech lead)\b/i.test(normalized)) {
    seniority = "Lead / Staff";
  } else if (/\b(director|head of|vp|engineering manager|manager)\b/i.test(normalized)) {
    seniority = "Management";
  } else if (/\b(senior|sr\.?|iii|iv)\b/i.test(normalized)) {
    seniority = "Senior";
  } else if (/\b(intern|internship|co-op)\b/i.test(normalized)) {
    seniority = "Intern";
  } else if (/\b(junior|jr\.?|associate|entry-level|entry level|graduate)\b/i.test(normalized)) {
    seniority = "Entry-Level";
  } else if (/\b(software engineer|developer|engineer|analyst)\b/i.test(normalized)) {
    seniority = "Mid-Level";
  }

  // 2. Detect Role & Company heuristically from first few lines
  let role = "";
  let company = "";

  for (const line of lines.slice(0, 5)) {
    const match = line.match(/^([A-Za-z0-9\s/-]{4,40})\s+(?:at|@)\s+([A-Za-z0-9\s.,&]{2,30})/i);
    if (match) {
      role = match[1].trim();
      company = match[2].trim();
      break;
    }
  }

  if (!role && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 60 && !firstLine.includes(".")) {
      role = firstLine.replace(/^(job description|role|title|position):\s*/i, "").trim();
    }
  }

  // 3. Segment lines into Responsibilities, Requirements (Required), and Preferred
  const responsibilities: string[] = [];
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];

  type SectionMode = "general" | "responsibilities" | "required" | "preferred";
  let mode: SectionMode = "general";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes("preferred") ||
      lower.includes("nice to have") ||
      lower.includes("bonus") ||
      lower.includes("plus")
    ) {
      mode = "preferred";
      continue;
    }
    if (
      lower.includes("requirement") ||
      lower.includes("qualifications") ||
      lower.includes("what you'll need") ||
      lower.includes("what you bring") ||
      lower.includes("must have")
    ) {
      mode = "required";
      continue;
    }
    if (
      lower.includes("responsibilit") ||
      lower.includes("what you'll do") ||
      lower.includes("the role") ||
      lower.includes("about the job")
    ) {
      mode = "responsibilities";
      continue;
    }

    const cleanContent = line.replace(/^[-*•–—\d.]+\s*/, "").trim();

    if (cleanContent.length > 5) {
      if (mode === "responsibilities") {
        responsibilities.push(cleanContent);
      } else if (mode === "required") {
        requiredSkills.push(cleanContent);
      } else if (mode === "preferred") {
        preferredSkills.push(cleanContent);
      }
    }
  }

  // 4. Extract all tech keywords and phrases
  const allKeywordsSet = new Set<string>();

  // Tech skills dictionary check
  for (const skill of BUILTIN_TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(normalized)) {
      allKeywordsSet.add(skill.toLowerCase());
    }
  }

  // Add words that appear with high frequency
  const cleaned = normalized.replace(/[^a-z0-9+#./\s-]/g, " ");
  const rawWords = cleaned.split(/\s+/).map((w) => w.trim()).filter((w) => w.length > 2);
  const freq = new Map<string, number>();

  for (const w of rawWords) {
    if (!COMMON_STOP_WORDS.has(w)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  for (const [w, count] of freq.entries()) {
    if (count >= 2 && !COMMON_STOP_WORDS.has(w)) {
      allKeywordsSet.add(w);
    }
  }

  return {
    company: company || "Target Company",
    role: role || "Target Role",
    seniority,
    responsibilities: responsibilities.slice(0, 10),
    requiredSkills: requiredSkills.slice(0, 15),
    preferredSkills: preferredSkills.slice(0, 10),
    allKeywords: Array.from(allKeywordsSet).sort(),
  };
}

/**
 * Searches the resume for exact occurrences and returns exact locations:
 * e.g. "Experience: TechCorp", "Skills: Frontend", "Project: Distributed Engine", "Summary"
 */
export function findKeywordLocationsInResume(kw: string, resume: Resume): string[] {
  const locations: string[] = [];
  const lowerKw = kw.toLowerCase();
  const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

  const testMatch = (text: string) => {
    return regex.test(text) || text.toLowerCase().includes(lowerKw);
  };

  // 1. Summary
  const summaryText = resume.basics.summary || resume.summary || "";
  if (testMatch(summaryText)) {
    locations.push("Summary");
  }

  // 2. Headline / Title
  const headline = resume.basics.headline || resume.basics.title || "";
  if (testMatch(headline)) {
    locations.push("Headline");
  }

  // 3. Skills
  const flatSkills = getFlatSkills(resume.skills);
  for (const s of flatSkills) {
    if (testMatch(s)) {
      locations.push(`Skills: ${s}`);
    }
  }

  // 4. Experience
  for (const exp of resume.experience) {
    const expText = `${exp.company} ${exp.role} ${exp.bullets.join(" ")}`;
    if (testMatch(expText)) {
      locations.push(`Experience: ${exp.company || "Role"}`);
    }
  }

  // 5. Projects
  for (const proj of resume.projects || []) {
    const projText = `${proj.name} ${proj.tech.join(" ")} ${proj.bullets.join(" ")}`;
    if (testMatch(projText)) {
      locations.push(`Project: ${proj.name || "Project"}`);
    }
  }

  // 6. Education
  for (const edu of resume.education) {
    const eduText = `${edu.school} ${edu.degree}`;
    if (testMatch(eduText)) {
      locations.push(`Education: ${edu.school || "School"}`);
    }
  }

  return Array.from(new Set(locations));
}

/**
 * Compares parsed JD keywords against the resume with exact location resolution
 * and true-sounding adjacent skill categorizations.
 */
export function analyzeJdMatch(jdText: string, resume: Resume): JdMatchReport {
  const parsed = parseJobDescription(jdText);
  const keywords = parsed.allKeywords;

  if (keywords.length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      trueSoundingKeywords: [],
      missingGaps: [],
      totalKeywords: 0,
      parsedJd: parsed,
    };
  }

  // Collect candidate's existing known tools to discover true-sounding adjacency
  const candidateTools = new Set<string>();
  const flatSkills = getFlatSkills(resume.skills).map((s) => s.toLowerCase());
  flatSkills.forEach((s) => candidateTools.add(s));

  for (const exp of resume.experience) {
    exp.bullets.forEach((b) => {
      BUILTIN_TECH_SKILLS.forEach((ts) => {
        const escaped = ts.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`\\b${escaped}\\b`, "i").test(b)) candidateTools.add(ts);
      });
    });
  }

  const matchedKeywords: KeywordMatchDetail[] = [];
  const trueSoundingKeywords: KeywordMatchDetail[] = [];
  const missingGaps: KeywordMatchDetail[] = [];

  for (const kw of keywords) {
    const locations = findKeywordLocationsInResume(kw, resume);

    if (locations.length > 0) {
      matchedKeywords.push({
        keyword: kw,
        locations,
        category: "required",
      });
    } else {
      // Check if this missing skill is adjacent to something the user already uses
      let isAdjacent = false;
      for (const tool of Array.from(candidateTools)) {
        const adjacentList = TECH_ADJACENCY_MAP[tool] || [];
        if (adjacentList.includes(kw)) {
          isAdjacent = true;
          break;
        }
      }

      if (isAdjacent) {
        trueSoundingKeywords.push({
          keyword: kw,
          locations: [],
          isTrueSounding: true,
          category: "preferred",
        });
      } else {
        missingGaps.push({
          keyword: kw,
          locations: [],
          isTrueSounding: false,
          category: "required",
        });
      }
    }
  }

  const total = keywords.length;
  const rawScore = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

  return {
    score: rawScore,
    matchedKeywords,
    trueSoundingKeywords,
    missingGaps,
    totalKeywords: total,
    parsedJd: parsed,
  };
}

export interface SectionChecklistItem {
  id: string;
  section: string;
  icon: string;
  status: "pass" | "warn" | "fail";
  label: string;
  detail: string;
  actionHint?: string;
}

/**
 * Free client-side, deterministic section-by-section checklist
 * evaluating resume alignment against target job description.
 */
export function getSectionMatchChecklist(
  resume: Resume,
  parsedJd: ParsedJd,
  matchReport: JdMatchReport
): SectionChecklistItem[] {
  const items: SectionChecklistItem[] = [];

  // 1. Basics & Title Alignment
  const hasBasics = Boolean(resume.basics.name && resume.basics.email);
  const headline = (resume.basics.headline || resume.basics.title || "").toLowerCase();
  const targetRole = (parsedJd.role || "").toLowerCase();
  const roleKeywords = targetRole.split(/\s+/).filter((w) => w.length > 2);
  const roleAligned = roleKeywords.length > 0 && roleKeywords.some((w) => headline.includes(w));

  if (!hasBasics) {
    items.push({
      id: "basics",
      section: "Contact & Title",
      icon: "👤",
      status: "fail",
      label: "Incomplete Contact Details",
      detail: "Add your full name, email, and location.",
      actionHint: "Required for ATS recruiter reach-outs",
    });
  } else if (!roleAligned && targetRole.length > 0 && targetRole !== "target role") {
    items.push({
      id: "basics",
      section: "Contact & Title",
      icon: "👤",
      status: "warn",
      label: "Headline Alignment",
      detail: `Your headline "${resume.basics.title || 'Professional'}" does not explicitly mention "${parsedJd.role}".`,
      actionHint: "Align title to boost initial ATS ranking",
    });
  } else {
    items.push({
      id: "basics",
      section: "Contact & Title",
      icon: "👤",
      status: "pass",
      label: "Title & Contact Aligned",
      detail: `Contact info complete and headline aligns with ${parsedJd.role || "target role"}.`,
    });
  }

  // 2. Professional Summary
  const summary = (resume.basics.summary || resume.summary || "").trim();
  const summaryMatches = matchReport.matchedKeywords.filter((k) =>
    k.locations.some((l) => l.toLowerCase().includes("summary"))
  );

  if (!summary) {
    items.push({
      id: "summary",
      section: "Professional Summary",
      icon: "📝",
      status: "warn",
      label: "No Summary Detected",
      detail: "A 2-3 sentence summary front-loads target keywords for recruiter screening.",
      actionHint: "Add summary (+10% score boost)",
    });
  } else if (summaryMatches.length === 0 && matchReport.totalKeywords > 0) {
    items.push({
      id: "summary",
      section: "Professional Summary",
      icon: "📝",
      status: "warn",
      label: "Summary Needs JD Keywords",
      detail: "Summary is present but does not mention top keywords from this JD.",
      actionHint: "Inject target keywords in summary",
    });
  } else {
    items.push({
      id: "summary",
      section: "Professional Summary",
      icon: "📝",
      status: "pass",
      label: "Targeted Professional Summary",
      detail: `Summary contains ${summaryMatches.length} matching target keyword${summaryMatches.length !== 1 ? "s" : ""}.`,
    });
  }

  // 3. Technical & Core Skills
  const flatSkills = getFlatSkills(resume.skills);
  const matchedSkillCount = matchReport.matchedKeywords.filter((k) =>
    k.locations.some((l) => l.toLowerCase().includes("skill"))
  ).length;

  if (flatSkills.length < 3) {
    items.push({
      id: "skills",
      section: "Skills Section",
      icon: "⚡",
      status: "fail",
      label: "Insufficient Skills Listed",
      detail: "Your resume lists fewer than 3 skills.",
      actionHint: "Add core technical competencies",
    });
  } else if (matchedSkillCount < Math.min(3, matchReport.totalKeywords)) {
    const missingExample = matchReport.missingGaps.slice(0, 3).map((g) => g.keyword).join(", ");
    items.push({
      id: "skills",
      section: "Skills Section",
      icon: "⚡",
      status: "warn",
      label: "Skill Coverage Gap",
      detail: `Only ${matchedSkillCount} skills directly match the job requirements.`,
      actionHint: missingExample ? `Add missing keywords: ${missingExample}` : "Add more role-specific skills",
    });
  } else {
    items.push({
      id: "skills",
      section: "Skills Section",
      icon: "⚡",
      status: "pass",
      label: "Strong Skill Coverage",
      detail: `${matchedSkillCount} target skills validated in your skills inventory.`,
    });
  }

  // 4. Work Experience & Impact
  const expCount = resume.experience.length;
  let metricBulletCount = 0;
  for (const exp of resume.experience) {
    for (const b of exp.bullets) {
      if (/\b\d+([.,]\d+)?%|\$\d+|\b\d+\s*(?:k|m|x|users|customers|queries|engineers)\b/i.test(b)) {
        metricBulletCount++;
      }
    }
  }

  const expMatches = matchReport.matchedKeywords.filter((k) =>
    k.locations.some((l) => l.toLowerCase().includes("experience"))
  );

  if (expCount === 0) {
    items.push({
      id: "experience",
      section: "Work Experience",
      icon: "💼",
      status: "fail",
      label: "No Work Experience Entries",
      detail: "Applicant Tracking Systems prioritize bullet points from verified work experience.",
      actionHint: "Add your recent roles",
    });
  } else if (metricBulletCount < 2) {
    items.push({
      id: "experience",
      section: "Work Experience",
      icon: "💼",
      status: "warn",
      label: "Low Measurable Impact Density",
      detail: `Only ${metricBulletCount} bullet point${metricBulletCount === 1 ? "" : "s"} contain measurable metrics (% or numbers).`,
      actionHint: "Quantify achievements with metrics (e.g. '+30% throughput')",
    });
  } else {
    items.push({
      id: "experience",
      section: "Work Experience",
      icon: "💼",
      status: "pass",
      label: "Proven Quantifiable Experience",
      detail: `${expMatches.length} keywords validated across ${expCount} roles with ${metricBulletCount} metric-backed bullets.`,
    });
  }

  // 5. Education & Credentials
  const hasEdu = resume.education.length > 0;
  if (!hasEdu) {
    items.push({
      id: "education",
      section: "Education",
      icon: "🎓",
      status: "warn",
      label: "Education Missing",
      detail: "Many enterprise ATS systems check for degree or equivalent training.",
      actionHint: "Add degree or bootcamp credentials",
    });
  } else {
    items.push({
      id: "education",
      section: "Education",
      icon: "🎓",
      status: "pass",
      label: "Education Verified",
      detail: `${resume.education[0]?.degree || "Degree"} from ${resume.education[0]?.school || "Institution"}.`,
    });
  }

  return items;
}
