import type { Resume, SkillCategory, DesignMeta } from "@/types/resume";
import { DEFAULT_SECTION_ORDER } from "@/lib/schema";

/**
 * Checks if a given section is visible according to both meta.hiddenSections and legacy sectionVisibility.
 */
export function isSectionVisible(resume: Resume, sectionId: string): boolean {
  if (resume.meta?.hiddenSections?.includes(sectionId)) {
    return false;
  }
  if (resume.sectionVisibility && resume.sectionVisibility[sectionId] === false) {
    return false;
  }
  return true;
}

/**
 * Returns the effective ordered list of visible section IDs.
 */
export function getVisibleSectionOrder(resume: Resume): string[] {
  const customIds = (resume.customSections || []).map((s) => s.id);
  const baseOrder = resume.meta?.sectionOrder && resume.meta.sectionOrder.length > 0
    ? resume.meta.sectionOrder
    : [...DEFAULT_SECTION_ORDER];

  // Include any custom IDs not in sectionOrder at the end
  const fullOrder = [...baseOrder];
  for (const cId of customIds) {
    if (!fullOrder.includes(cId)) {
      fullOrder.push(cId);
    }
  }

  return fullOrder.filter((secId) => isSectionVisible(resume, secId));
}

/**
 * Normalizes skills input into structured categories for rendering.
 */
export function getNormalizedSkills(skills: Resume["skills"]): { id: string; category: string; items: string[] }[] {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return [];
  }
  if (typeof skills[0] === "string") {
    return [
      {
        id: "skills-default",
        category: "Skills & Technologies",
        items: skills as unknown as string[],
      },
    ];
  }
  return skills as SkillCategory[];
}

/**
 * Maps font pairing choice to CSS font-family string.
 */
export function getFontFamily(fontPairing?: string): string {
  switch (fontPairing) {
    case "editorial-serif":
      return "var(--font-fraunces), 'Fraunces', 'Georgia', serif";
    case "academic-classic":
      return "'Merriweather', 'Georgia', 'Times New Roman', serif";
    case "tech-mono":
      return "var(--font-geist-mono), 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace";
    case "executive-elegance":
      return "'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', serif";
    case "clean-minimal":
      return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case "modern-sans":
    default:
      return "var(--font-geist-sans), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
}

/**
 * Returns page padding in mm/inches based on margin selection.
 */
export function getMarginPadding(margins?: "compact" | "normal" | "generous"): string {
  switch (margins) {
    case "compact":
      return "10mm";
    case "generous":
      return "22mm";
    case "normal":
    default:
      return "16mm";
  }
}

/**
 * Returns section bottom margin spacing class based on sectionSpacing selection.
 */
export function getSectionGapClass(spacing?: "compact" | "normal" | "generous"): string {
  switch (spacing) {
    case "compact":
      return "mb-2.5";
    case "generous":
      return "mb-6";
    case "normal":
    default:
      return "mb-4";
  }
}

/**
 * Returns page dimensions based on pageSize.
 */
export function getPageDimensions(pageSize?: "A4" | "Letter"): { width: string; minHeight: string } {
  if (pageSize === "Letter") {
    return { width: "8.5in", minHeight: "11in" };
  }
  return { width: "210mm", minHeight: "297mm" };
}

/**
 * Merges design overrides from props with resume.meta.design.
 */
export function resolveDesign(resume: Resume, designOverride?: Partial<DesignMeta>): DesignMeta {
  const base = resume.meta?.design || {
    font: "sans" as const,
    fontPairing: "modern-sans" as const,
    accent: "#0F766E",
    fontScale: 1.0,
    lineHeight: 1.4,
    margins: "normal" as const,
    sectionSpacing: "normal" as const,
    targetPages: 1,
  };

  return {
    ...base,
    ...designOverride,
    fontPairing: designOverride?.fontPairing || base.fontPairing || "modern-sans",
    sectionSpacing: designOverride?.sectionSpacing || base.sectionSpacing || "normal",
    targetPages: designOverride?.targetPages || base.targetPages || 1,
  };
}
