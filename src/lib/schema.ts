import { z } from "zod";

// ==========================================
// 1. BASICS & CONTACT
// ==========================================
export const BasicsSchema = z.object({
  name: z.string().default(""),
  headline: z.string().default(""),
  // Backward compatibility alias for v1 title
  title: z.string().optional(),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  portfolio: z.string().default(""),
  summary: z.string().default(""),
  photo: z.string().optional(),
  photoShape: z.enum(["circle", "square", "rounded"]).optional(),
});

// ==========================================
// 2. EXPERIENCE
// ==========================================
export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().optional().default(""),
  start: z.string().default(""),
  end: z.string().default(""),
  current: z.boolean().optional().default(false),
  bullets: z.array(z.string()).default([]),
});

// ==========================================
// 3. EDUCATION
// ==========================================
export const EducationSchema = z.object({
  id: z.string(),
  school: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().optional().default(""),
  location: z.string().optional(),
  start: z.string().optional().default(""),
  end: z.string().default(""),
  // Backward compatibility alias for v1 year
  year: z.string().optional(),
  gpa: z.string().optional().default(""),
});

// ==========================================
// 4. SKILLS (Grouped by Category)
// ==========================================
export const SkillCategorySchema = z.object({
  id: z.string(),
  category: z.string().default(""),
  items: z.array(z.string()).default([]),
});

// ==========================================
// 5. PROJECTS
// ==========================================
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  link: z.string().optional().default(""),
  tech: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

// ==========================================
// 6. CERTIFICATIONS
// ==========================================
export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

// ==========================================
// 7. LANGUAGES
// ==========================================
export const LanguageSchema = z.object({
  id: z.string(),
  language: z.string().default(""),
  proficiency: z.enum(["Native", "Fluent", "Professional", "Conversational"]).default("Professional"),
});

// ==========================================
// 8. AWARDS
// ==========================================
export const AwardSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().optional().default(""),
  summary: z.string().optional().default(""),
});

// ==========================================
// 9. VOLUNTEERING
// ==========================================
export const VolunteeringSchema = z.object({
  id: z.string(),
  organization: z.string().default(""),
  role: z.string().default(""),
  start: z.string().optional().default(""),
  end: z.string().optional().default(""),
  bullets: z.array(z.string()).default([]),
});

// ==========================================
// 10. PUBLICATIONS
// ==========================================
export const PublicationSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  publisher: z.string().default(""),
  date: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

// ==========================================
// 11. CUSTOM SECTIONS
// ==========================================
export const CustomEntrySchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  subtitle: z.string().optional().default(""),
  date: z.string().optional().default(""),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const CustomSectionSchema = z.object({
  id: z.string(),
  heading: z.string().default("Custom Section"),
  name: z.string().optional(),
  entries: z.array(CustomEntrySchema).default([]),
});

// ==========================================
// 12. DESIGN & RESUME META
// ==========================================
export const DesignMetaSchema = z.object({
  font: z.enum(["sans", "serif", "mono"]).default("sans"),
  fontPairing: z
    .enum([
      "modern-sans",
      "editorial-serif",
      "academic-classic",
      "tech-mono",
      "executive-elegance",
      "clean-minimal",
    ])
    .default("modern-sans"),
  accent: z.string().default("#0F766E"),
  fontScale: z.number().default(1.0),
  lineHeight: z.number().default(1.4),
  margins: z.enum(["compact", "normal", "generous"]).default("normal"),
  sectionSpacing: z.enum(["compact", "normal", "generous"]).default("normal"),
  targetPages: z.number().default(1),
});

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
  "volunteering",
  "publications",
] as const;

export const DEFAULT_DESIGN_META: z.infer<typeof DesignMetaSchema> = {
  font: "sans",
  fontPairing: "modern-sans",
  accent: "#0F766E",
  fontScale: 1.0,
  lineHeight: 1.4,
  margins: "normal",
  sectionSpacing: "normal",
  targetPages: 1,
};

export const ResumeMetaSchema = z.object({
  sectionOrder: z.array(z.string()).default([...DEFAULT_SECTION_ORDER]),
  hiddenSections: z.array(z.string()).default([]),
  pageSize: z.enum(["A4", "Letter"]).default("A4"),
  design: DesignMetaSchema.default(DEFAULT_DESIGN_META),
});

// Backward-compatibility section visibility map
export const SectionVisibilitySchema = z.record(z.string(), z.boolean()).optional();

// ==========================================
// FULL RESUME SCHEMA V2
// ==========================================
export const ResumeSchemaV2 = z.object({
  schemaVersion: z.literal(2).default(2),
  basics: BasicsSchema,
  summary: z.string().default(""),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillCategorySchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  awards: z.array(AwardSchema).default([]),
  volunteering: z.array(VolunteeringSchema).default([]),
  publications: z.array(PublicationSchema).default([]),
  customSections: z.array(CustomSectionSchema).default([]),
  meta: ResumeMetaSchema.default({
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    hiddenSections: [],
    pageSize: "A4",
    design: DEFAULT_DESIGN_META,
  }),
  // Backward compatibility fields
  template: z.string().optional().default("ats"),
  sectionVisibility: SectionVisibilitySchema,
});

// Infer TypeScript types from schemas
export type Basics = z.infer<typeof BasicsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Award = z.infer<typeof AwardSchema>;
export type Volunteering = z.infer<typeof VolunteeringSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type CustomEntry = z.infer<typeof CustomEntrySchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type DesignMeta = z.infer<typeof DesignMetaSchema>;
export type ResumeMeta = z.infer<typeof ResumeMetaSchema>;
export type Resume = z.infer<typeof ResumeSchemaV2>;

// Helper to get flat skills list across all categories
export function getFlatSkills(skills: SkillCategory[] | string[] | undefined): string[] {
  if (!skills || !Array.isArray(skills)) return [];
  if (skills.length === 0) return [];
  if (typeof skills[0] === "string") {
    return skills as string[];
  }
  return (skills as SkillCategory[]).flatMap((cat) => cat.items || []);
}

/**
 * Safely formats a candidate's resume title, trimming whitespace and preventing
 * awkward strings like "Hello 's Resume" or double apostrophes.
 */
export function formatResumeTitle(name?: string | null, fallback = "My Base Resume"): string {
  const trimmed = name?.trim();
  if (!trimmed) return fallback;
  if (/(\b|\s)(resume)$/i.test(trimmed)) return trimmed;
  if (trimmed.endsWith("'s") || trimmed.endsWith("’s")) return `${trimmed} Resume`;
  if (trimmed.endsWith("'") || trimmed.endsWith("’") || trimmed.endsWith("s") || trimmed.endsWith("S")) {
    return `${trimmed}' Resume`;
  }
  return `${trimmed}'s Resume`;
}
