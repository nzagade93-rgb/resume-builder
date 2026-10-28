# Resume Template Inventory

This inventory tracks all resume templates in the application, their component locations, visual characteristics, implementation status, and export fidelity.

---

## Current Baseline Templates (Core / Stable)

| ID | Name | Category | Component Location | Distinctive Characteristics | Gallery Status | Editor Status | PDF Export | DOCX Export | Testing Status |
|---|---|---|---|---|---|---|---|---|---|
| `ats` | ATS Standard | ATS Standard | `src/templates/Ats.tsx` | Single-column, black & white, high scannability, clear typography hierarchy, ATS-safe. Default fallback. | Verified | Verified | Verified | Verified | Tested & Passed |
| `classic` | Classic Traditional | Traditional | `src/templates/Classic.tsx` | Centered serif header, ivy-league styling, horizontal divider lines, formal margins. | Verified | Verified | Verified | Verified | Tested & Passed |
| `modern` | Modern Professional | Modern | `src/templates/Modern.tsx` | Two-column asymmetric (main + 28% teal-accented sidebar for skills/contact), sans-serif. | Verified | Verified | Verified | Verified | Tested & Passed |
| `minimal` | Clean Minimalist | Minimal | `src/templates/Minimal.tsx` | Swiss-inspired minimalist layout, generous whitespace, understated slate typography. | Verified | Verified | Verified | Verified | Tested & Passed |
| `executive` | Executive Brief | Executive | `src/templates/Executive.tsx` | Navy leadership accent band, small-caps name, structured executive sections. | Verified | Verified | Verified | Verified | Tested & Passed |
| `compact` | Compact Dense | ATS Standard | `src/templates/Compact.tsx` | Space-efficient single-page layout, tighter margins, dense content hierarchy. | Verified | Verified | Verified | Verified | Tested & Passed |
| `fresher` | Entry-Level / Student | Entry Level | `src/templates/Fresher.tsx` | Education and projects prioritized ahead of experience, purple accent tags, clear student layout. | Verified | Verified | Verified | Verified | Tested & Passed |

---

## Incremental Recreated Templates (From Reference Images)

*Templates will be recorded below as each reference image is uploaded and implemented sequentially (`template-001`, `template-002`, etc.).*

| ID | Name | Reference Image | Component Location | Distinctive Characteristics | Gallery Status | Editor Status | PDF Export | DOCX Export | Testing Status |
|---|---|---|---|---|---|---|---|---|---|
| `template-001` | Creative Studio | Reference Image 1 (`30. Creative`) | `src/templates/Template001/Template001.tsx` | Two-column (62% main / 38% sidebar), upper-right rounded portrait with dark navy curved hook, royal blue headline, horizontal proficiency skill bars, organic peach/navy bottom waves. | Verified | Verified | Verified | Verified | Tested & Passed |
| `template-002` | Editorial Director | Reference Image 2 (`Bendroye Bossing`) | `src/templates/Template002/Template002.tsx` | Earth-tone dark taupe ambient canvas, giant display typography, floating espresso glassmorphism panels, center portrait staging, gold accent details (#ECC984). | Verified | Verified | Verified | Verified | Tested & Passed |
| `template-003` | Split Forest & Sage | Reference Image 3 (`Morgan Maxwell`) | `src/templates/Template003/Template003.tsx` | Two-tone split background (light sage/bone left, deep forest green right), floating About Me banner across columns, circular framed portrait, 3D pill tabs, and language donut meters. | Verified | Verified | Verified | Verified | Tested & Passed |
| `template-004` | Playful 3D Studio | Reference Image 4 (`Shivam Kaushal`) | `src/templates/Template004/Template004.tsx` | Light cream canvas with 3D tangerine clay accents (#E86034), solid & outlined display headline, center portrait with warm aura, split education/contact, and 4-column skill capsule matrix. | Verified | Verified | Verified | Verified | Tested & Passed |
| `template-005` | Creative Organic Green | Reference Image 5 (`Jullii`) | `src/templates/Template005/Template005.tsx` | Botanical green theme, layered concentric circle portrait backdrop, two-tone bold display title (forest + leaf green), ragged brush-stroke badges, software app icon grid, and dual curved waves. | Verified | Verified | Verified | Verified | Tested & Passed |

---

## Architectural Protocol

1. **Sequential IDs**: Use `template-001`, `template-002`, etc., without overwriting or skipping.
2. **Component Isolation**: Each template resides in its dedicated file or folder (`src/templates/TemplateXXX/` or `src/templates/TemplateXXX.tsx`).
3. **Data Integrity**: Consumes standard `Resume` canonical model from `src/types/resume.ts`. No mock or hardcoded sample data.
4. **Editor Synchronization**: Same React component is used in `PreviewCanvas` (actual editor) and `TemplatePreviewModal` (gallery preview).
5. **Fallback Safety**: Any unrecognized template ID resolves safely to `templates["ats"]`.
