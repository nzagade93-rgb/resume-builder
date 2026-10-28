import { Resume, sampleResume } from "@/types/resume";
import { ResumeSchemaV2, DEFAULT_SECTION_ORDER } from "@/lib/schema";

export const STORAGE_KEY_V2 = "resume_builder_data_v2";
export const LEGACY_STORAGE_KEY_V1 = "resume_builder_data_v1";
export const BACKUP_KEY_PREFIX = "resume_builder_backup_corrupted_";

/**
 * Migrates any raw resume object (legacy v1, partial, or v2) to a valid Resume v2 schema.
 * Preserves user data without hallucinating new fields or deleting existing info.
 */
export function migrateToV2(raw: unknown): Resume {
  if (!raw || typeof raw !== "object") {
    return { ...sampleResume };
  }

  const obj = raw as Record<string, unknown>;

  // If already v2 with matching schema, validate and sanitize
  if (obj.schemaVersion === 2) {
    const parsed = ResumeSchemaV2.safeParse(obj);
    if (parsed.success) {
      return parsed.data;
    }
  }

  // 1. Migrate basics & headline
  const rawBasics = (obj.basics && typeof obj.basics === "object" ? obj.basics : {}) as Record<string, unknown>;
  const headline = String(rawBasics.headline || rawBasics.title || "");
  const title = String(rawBasics.title || rawBasics.headline || "");
  const summary = String(rawBasics.summary || obj.summary || "");

  const basics = {
    name: String(rawBasics.name || ""),
    headline,
    title,
    email: String(rawBasics.email || ""),
    phone: String(rawBasics.phone || ""),
    location: String(rawBasics.location || ""),
    linkedin: String(rawBasics.linkedin || ""),
    github: String(rawBasics.github || ""),
    portfolio: String(rawBasics.portfolio || ""),
    summary,
  };

  // 2. Migrate experience
  const rawExp = Array.isArray(obj.experience) ? obj.experience : [];
  const experience = rawExp.map((exp: unknown, idx: number) => {
    const e = (exp && typeof exp === "object" ? exp : {}) as Record<string, unknown>;
    return {
      id: String(e.id || `exp-${idx}-${Math.random().toString(36).substr(2, 5)}`),
      company: String(e.company || ""),
      role: String(e.role || ""),
      location: String(e.location || ""),
      start: String(e.start || ""),
      end: String(e.end || ""),
      current: Boolean(e.current || e.end === "Present"),
      bullets: Array.isArray(e.bullets) ? e.bullets.map((b) => String(b)) : [],
    };
  });

  // 3. Migrate education
  const rawEdu = Array.isArray(obj.education) ? obj.education : [];
  const education = rawEdu.map((edu: unknown, idx: number) => {
    const ed = (edu && typeof edu === "object" ? edu : {}) as Record<string, unknown>;
    const year = String(ed.year || ed.end || "");
    return {
      id: String(ed.id || `edu-${idx}-${Math.random().toString(36).substr(2, 5)}`),
      school: String(ed.school || ""),
      degree: String(ed.degree || ""),
      field: String(ed.field || ""),
      start: String(ed.start || ""),
      end: year,
      year,
      gpa: String(ed.gpa || ""),
    };
  });

  // 4. Migrate skills (flat array from v1 -> categorized array in v2)
  let skills: Resume["skills"] = [];
  if (Array.isArray(obj.skills)) {
    if (obj.skills.length > 0 && typeof obj.skills[0] === "string") {
      skills = [
        {
          id: "skills-core",
          category: "Core Skills & Technologies",
          items: obj.skills.map((s: unknown) => String(s)),
        },
      ];
    } else {
      skills = obj.skills.map((cat: unknown, idx: number) => {
        const c = (cat && typeof cat === "object" ? cat : {}) as Record<string, unknown>;
        return {
          id: String(c.id || `skill-cat-${idx}`),
          category: String(c.category || "General Skills"),
          items: Array.isArray(c.items) ? c.items.map((i: unknown) => String(i)) : [],
        };
      });
    }
  }

  // 5. Migrate meta, sectionOrder, and hiddenSections
  const rawMeta = (obj.meta && typeof obj.meta === "object" ? obj.meta : {}) as Record<string, unknown>;
  const rawVisibility = (obj.sectionVisibility && typeof obj.sectionVisibility === "object" ? obj.sectionVisibility : {}) as Record<string, unknown>;

  // Convert legacy sectionVisibility (where value === false) to hiddenSections list
  const legacyHidden: string[] = [];
  Object.entries(rawVisibility).forEach(([section, isVisible]) => {
    if (isVisible === false) {
      legacyHidden.push(section);
    }
  });

  const hiddenSections = Array.isArray(rawMeta.hiddenSections)
    ? (rawMeta.hiddenSections as string[])
    : legacyHidden;

  const sectionOrder = Array.isArray(rawMeta.sectionOrder) && rawMeta.sectionOrder.length > 0
    ? (rawMeta.sectionOrder as string[])
    : [...DEFAULT_SECTION_ORDER];

  const rawDesign = (rawMeta.design && typeof rawMeta.design === "object" ? rawMeta.design : {}) as Record<string, unknown>;

  const meta = {
    sectionOrder,
    hiddenSections,
    pageSize: rawMeta.pageSize === "Letter" ? ("Letter" as const) : ("A4" as const),
    design: {
      font: rawDesign.font === "serif" ? ("serif" as const) : rawDesign.font === "mono" ? ("mono" as const) : ("sans" as const),
      fontPairing: (["modern-sans", "editorial-serif", "academic-classic", "tech-mono", "executive-elegance", "clean-minimal"].includes(String(rawDesign.fontPairing))
        ? rawDesign.fontPairing
        : "modern-sans") as "modern-sans" | "editorial-serif" | "academic-classic" | "tech-mono" | "executive-elegance" | "clean-minimal",
      accent: String(rawDesign.accent || "#0F766E"),
      fontScale: typeof rawDesign.fontScale === "number" ? rawDesign.fontScale : 1.0,
      lineHeight: typeof rawDesign.lineHeight === "number" ? rawDesign.lineHeight : 1.4,
      margins: (rawDesign.margins === "compact" || rawDesign.margins === "generous" ? rawDesign.margins : "normal") as "compact" | "normal" | "generous",
      sectionSpacing: (rawDesign.sectionSpacing === "compact" || rawDesign.sectionSpacing === "generous" ? rawDesign.sectionSpacing : "normal") as "compact" | "normal" | "generous",
      targetPages: typeof rawDesign.targetPages === "number" ? rawDesign.targetPages : 1,
    },
  };

  const v2Resume: Resume = {
    schemaVersion: 2,
    basics,
    summary,
    experience,
    education,
    skills,
    projects: Array.isArray(obj.projects) ? (obj.projects as Resume["projects"]) : [],
    certifications: Array.isArray(obj.certifications) ? (obj.certifications as Resume["certifications"]) : [],
    languages: Array.isArray(obj.languages) ? (obj.languages as Resume["languages"]) : [],
    awards: Array.isArray(obj.awards) ? (obj.awards as Resume["awards"]) : [],
    volunteering: Array.isArray(obj.volunteering) ? (obj.volunteering as Resume["volunteering"]) : [],
    publications: Array.isArray(obj.publications) ? (obj.publications as Resume["publications"]) : [],
    customSections: Array.isArray(obj.customSections) ? (obj.customSections as Resume["customSections"]) : [],
    meta,
    template: String(obj.template || "ats"),
    sectionVisibility: rawVisibility as Record<string, boolean>,
  };

  return v2Resume;
}

/**
 * Loads resume data safely from localStorage.
 * If data is corrupted JSON, creates a backup key without deleting the corrupted content,
 * and falls back safely to the default resume.
 */
export function loadResumeSafely(storedString: string | null): { resume: Resume; backupKey?: string } {
  if (!storedString || storedString.trim() === "") {
    return { resume: { ...sampleResume } };
  }

  try {
    const parsed = JSON.parse(storedString);
    const migrated = migrateToV2(parsed);
    return { resume: migrated };
  } catch (err) {
    const backupKey = `${BACKUP_KEY_PREFIX}${Date.now()}`;
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(backupKey, storedString);
      } catch {
        // Storage might be full, safe ignore
      }
    }
    // Warn without logging personal data
    console.warn(`[SafeResumeStorage] Corrupted data detected. Preserved copy at ${backupKey}. Initialized safe fallback.`);
    return { resume: { ...sampleResume }, backupKey };
  }
}
