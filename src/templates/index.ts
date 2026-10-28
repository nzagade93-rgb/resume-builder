import React from "react";
import type { Resume, DesignMeta } from "@/types/resume";
import { Ats } from "./Ats";
import { Classic } from "./Classic";
import { Modern } from "./Modern";
import { Minimal } from "./Minimal";
import { Executive } from "./Executive";
import { Compact } from "./Compact";
import { Fresher } from "./Fresher";
import { Template001 } from "./Template001";
import { Template002 } from "./Template002";
import { Template003 } from "./Template003";
import { Template004 } from "./Template004";
import { Template005 } from "./Template005";
import {
  TEMPLATE_REGISTRY,
  TemplateDefinition,
  getTemplateDefinition,
  filterTemplates,
  GALLERY_FILTERS,
  type GalleryFilterId,
  TEMPLATE_ALIASES,
} from "./registry";

export type TemplateComponentProps = {
  resume: Resume;
  design?: Partial<DesignMeta>;
};

// Map of verified actual template components
const registryTemplateComponents: Record<string, React.FC<TemplateComponentProps>> = {
  ats: Ats,
  classic: Classic,
  modern: Modern,
  minimal: Minimal,
  executive: Executive,
  compact: Compact,
  fresher: Fresher,
  "template-001": Template001,
  template001: Template001,
  "template-002": Template002,
  template002: Template002,
  "template-003": Template003,
  template003: Template003,
  "template-004": Template004,
  template004: Template004,
  "template-005": Template005,
  template005: Template005,
};

export const templates: Record<string, React.FC<TemplateComponentProps>> = new Proxy(
  registryTemplateComponents,
  {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      if (prop in TEMPLATE_ALIASES && TEMPLATE_ALIASES[prop] in target) {
        return target[TEMPLATE_ALIASES[prop]];
      }
      // Guaranteed fallback to basic ATS template
      return target["ats"];
    },
  }
);

// Backward compatibility TemplateMeta shape
export type TemplateMeta = TemplateDefinition & {
  badge: string;
  thumbnailType:
    | "single-column"
    | "fresher-priority"
    | "minimal-clean"
    | "right-sidebar"
    | "executive-accent"
    | "dense-compact"
    | "centered-serif"
    | "creative-organic"
    | "editorial-stage"
    | "split-two-tone"
    | "playful-clay"
    | "organic-green";
};

export const templateOptions: TemplateMeta[] = TEMPLATE_REGISTRY.map((t) => ({
  ...t,
  badge: t.isAtsSafe ? "ATS-Safe" : t.isTwoColumn ? "2-Col" : "Standard",
  thumbnailType:
    t.layoutFamily === "organic-green"
      ? "organic-green"
      : t.layoutFamily === "playful-studio"
      ? "playful-clay"
      : t.layoutFamily === "split"
      ? "split-two-tone"
      : t.layoutFamily === "editorial"
      ? "editorial-stage"
      : t.layoutFamily === "creative"
      ? "creative-organic"
      : t.layoutFamily === "modern"
      ? "right-sidebar"
      : t.layoutFamily === "executive"
      ? "executive-accent"
      : t.layoutFamily === "traditional"
      ? "centered-serif"
      : t.layoutFamily === "minimal"
      ? "minimal-clean"
      : t.layoutFamily === "fresher"
      ? "fresher-priority"
      : t.layoutFamily === "compact"
      ? "dense-compact"
      : "single-column",
}));

export {
  TEMPLATE_REGISTRY,
  getTemplateDefinition,
  filterTemplates,
  GALLERY_FILTERS,
  type GalleryFilterId,
  Ats,
  Classic,
  Modern,
  Minimal,
  Executive,
  Compact,
  Fresher,
  Template001,
  Template002,
  Template003,
  Template004,
  Template005,
};

export default templates;
