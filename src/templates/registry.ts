export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: "ATS Standard" | "Traditional" | "Modern" | "Minimal" | "Executive" | "Entry Level";
  layoutFamily: "ats" | "traditional" | "modern" | "minimal" | "executive" | "compact" | "fresher" | "creative" | "editorial" | "split" | "playful-studio" | "organic-green";
  supportsPhoto: boolean;
  isTwoColumn: boolean;
  isAtsSafe: boolean;
  supportsDocx: boolean;
  supportsPdf: boolean;
  accentColor: string;
  fontType: "Sans" | "Serif" | "Mono";
  tags: string[];
  referenceImage?: string;
  implementationStatus?: "verified" | "in-progress" | "planned";
}

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "ats",
    name: "ATS Standard",
    description: "Single-column format strictly optimized for Applicant Tracking Systems with maximum scannability and clear hierarchy.",
    category: "ATS Standard",
    layoutFamily: "ats",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#000000",
    fontType: "Sans",
    tags: ["ats", "standard", "clean", "scannable", "universal"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional centered serif layout with formal section headings, conservative margins, and ivy-league corporate styling.",
    category: "Traditional",
    layoutFamily: "traditional",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#111827",
    fontType: "Serif",
    tags: ["classic", "traditional", "serif", "harvard", "legal", "finance"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Modern two-column design featuring a 28% right sidebar for contact and skills with refined teal accents.",
    category: "Modern",
    layoutFamily: "modern",
    supportsPhoto: false,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#0F766E",
    fontType: "Sans",
    tags: ["modern", "two-column", "teal", "sidebar", "product", "creative"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Swiss-inspired minimalist layout with ample whitespace, understated typography, and clean divider accents.",
    category: "Minimal",
    layoutFamily: "minimal",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#334155",
    fontType: "Sans",
    tags: ["minimal", "clean", "swiss", "design", "tech"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Prestigious leadership design with small-caps name, top accent band, and generous leadership section spacing.",
    category: "Executive",
    layoutFamily: "executive",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#0F172A",
    fontType: "Sans",
    tags: ["executive", "leadership", "management", "director", "c-level"],
  },
  {
    id: "compact",
    name: "Compact",
    description: "High-density single-page format designed to pack comprehensive experience without wasted whitespace.",
    category: "ATS Standard",
    layoutFamily: "compact",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#0F172A",
    fontType: "Sans",
    tags: ["compact", "dense", "1-page", "engineering", "technical"],
  },
  {
    id: "fresher",
    name: "Fresher",
    description: "Education and academic projects prioritized above work experience, ideal for students and career switchers.",
    category: "Entry Level",
    layoutFamily: "fresher",
    supportsPhoto: false,
    isTwoColumn: false,
    isAtsSafe: true,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#0F766E",
    fontType: "Sans",
    tags: ["fresher", "student", "entry-level", "graduate", "early-career"],
  },
  {
    id: "template-001",
    name: "Creative Studio",
    description: "Creative photographer layout with organic background shapes, upper-right portrait, dual-column structure, and visual skill meters.",
    category: "Modern",
    layoutFamily: "creative",
    supportsPhoto: true,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#0F2942",
    fontType: "Sans",
    tags: ["creative", "stylized", "2-column", "photo", "photographer", "portfolio", "modern", "visual-skills"],
    referenceImage: "ChatGPT Image Oct 27, 2026, 12_15_05 PM.png (30. Creative)",
    implementationStatus: "verified",
  },
  {
    id: "template-002",
    name: "Editorial Director",
    description: "High-impact editorial designer resume with warm taupe ambient canvas, giant display typography, floating espresso glass panels, and central portrait staging.",
    category: "Modern",
    layoutFamily: "editorial",
    supportsPhoto: true,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#ECC984",
    fontType: "Sans",
    tags: ["editorial", "creative", "director", "designer", "portfolio", "bold", "dark-mode", "gold-accent", "photo"],
    referenceImage: "Bendroye Bossing (@ Muhammad Sharil Abdullah)",
    implementationStatus: "verified",
  },
  {
    id: "template-003",
    name: "Split Forest & Sage",
    description: "Two-tone split layout with light sage/bone canvas on the left and deep hunter green on the right, floating About Me banner, circular portrait, and 3D pill tabs.",
    category: "Modern",
    layoutFamily: "split",
    supportsPhoto: true,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#9CAF88",
    fontType: "Sans",
    tags: ["split", "two-tone", "green", "sage", "forest", "graphic-designer", "modern", "photo", "pill-tabs"],
    referenceImage: "Morgan Maxwell (Graphic Designer)",
    implementationStatus: "verified",
  },
  {
    id: "template-004",
    name: "Playful 3D Studio",
    description: "Vibrant creative studio layout with 3D tangerine clay accents, outlined display typography, ambient portrait glow, split education/contact, and modular skill cards.",
    category: "Modern",
    layoutFamily: "playful-studio",
    supportsPhoto: true,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#E86034",
    fontType: "Sans",
    tags: ["playful", "3d", "tangerine", "claymorphism", "designer", "studio", "creative", "photo", "modern"],
    referenceImage: "Graphic & Web Designer (Shivam Kaushal)",
    implementationStatus: "verified",
  },
  {
    id: "template-005",
    name: "Creative Organic Green",
    description: "Creative designer resume with botanical green theme, layered concentric circle portrait backdrop, two-tone bold display title, ragged brush-stroke badges, software app icon grid, and dual curved waves.",
    category: "Modern",
    layoutFamily: "organic-green",
    supportsPhoto: true,
    isTwoColumn: true,
    isAtsSafe: false,
    supportsDocx: true,
    supportsPdf: true,
    accentColor: "#164E28",
    fontType: "Sans",
    tags: ["creative", "green", "organic", "botanical", "graphic-designer", "brush-badge", "modern", "photo", "software-grid"],
    referenceImage: "Graphic Designer (Jullii)",
    implementationStatus: "verified",
  },
];

export const TEMPLATE_MAP: Record<string, TemplateDefinition> = Object.fromEntries(
  TEMPLATE_REGISTRY.map((t) => [t.id, t])
);

// Backward-compatibility aliases
export const TEMPLATE_ALIASES: Record<string, string> = {
  "pure-ats": "ats",
  "prime-ats": "ats",
  "ats-standard": "ats",
  traditional: "classic",
  minimalist: "minimal",
  "entry-level": "fresher",
  "student-resume": "fresher",
  template001: "template-001",
  creative: "template-001",
  "30-creative": "template-001",
  template002: "template-002",
  editorial: "template-002",
  bendroye: "template-002",
  template003: "template-003",
  "split-forest": "template-003",
  "morgan-maxwell": "template-003",
  template004: "template-004",
  playful: "template-004",
  "shivam-kaushal": "template-004",
  template005: "template-005",
  "organic-green": "template-005",
  jullii: "template-005",
  "graphic-designer": "template-005",
};

/**
 * Looks up a template definition by ID.
 * Returns the matched definition, or falls back reliably to ATS Standard.
 */
export function getTemplateDefinition(templateId?: string): TemplateDefinition {
  if (!templateId) return TEMPLATE_REGISTRY[0];
  const normalized = templateId.toLowerCase();
  const resolvedId = TEMPLATE_ALIASES[normalized] || normalized;
  return TEMPLATE_MAP[resolvedId] || TEMPLATE_REGISTRY[0]; // fallback to ATS Standard
}

export type GalleryFilterId =
  | "all"
  | "ats"
  | "two-column"
  | "traditional"
  | "modern"
  | "minimal"
  | "executive";

export interface GalleryFilterOption {
  id: GalleryFilterId;
  label: string;
  icon: string;
  description: string;
}

export const GALLERY_FILTERS: GalleryFilterOption[] = [
  { id: "all", label: "All Templates", icon: "✨", description: "All available verified resume layouts" },
  { id: "ats", label: "ATS-Safe", icon: "🛡️", description: "Scanner-certified linear formats" },
  { id: "two-column", label: "Two-Column", icon: "📑", description: "Split-column and sidebar formats" },
  { id: "traditional", label: "Traditional", icon: "🏛️", description: "Conservative serif styling" },
  { id: "modern", label: "Modern", icon: "💼", description: "Contemporary professional styling" },
];

/**
 * Filter templates based on active filter and search query.
 */
export function filterTemplates(
  activeFilterOrTemplates: TemplateDefinition[] | GalleryFilterId,
  activeFilterOrSearch?: GalleryFilterId | string,
  searchQuery?: string
): TemplateDefinition[] {
  let filtered: TemplateDefinition[];
  let activeFilter: GalleryFilterId;
  let qStr: string;

  if (Array.isArray(activeFilterOrTemplates)) {
    filtered = activeFilterOrTemplates;
    activeFilter = (activeFilterOrSearch as GalleryFilterId) || "all";
    qStr = searchQuery || "";
  } else {
    filtered = TEMPLATE_REGISTRY;
    activeFilter = activeFilterOrTemplates;
    qStr = (activeFilterOrSearch as string) || "";
  }

  // Filter by category
  switch (activeFilter) {
    case "ats":
      filtered = filtered.filter((t) => t.isAtsSafe);
      break;
    case "two-column":
      filtered = filtered.filter((t) => t.isTwoColumn);
      break;
    case "traditional":
      filtered = filtered.filter((t) => t.category === "Traditional");
      break;
    case "modern":
      filtered = filtered.filter((t) => t.category === "Modern");
      break;
    case "all":
    default:
      break;
  }

  // Filter by search query
  const q = (qStr || "").trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }

  return filtered;
}
