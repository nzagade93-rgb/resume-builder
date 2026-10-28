import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  BorderStyle,
} from "docx";
import type { Resume } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";

import { getTemplateDefinition } from "@/templates/registry";

export interface DocxExportOptions {
  pageSize?: "A4" | "Letter";
  fontFamily?: string;
  templateId?: string;
}

/**
 * Builds an ATS-safe Microsoft Word (.docx) document strictly conforming
 * to ATS best practices:
 * - Real Heading 1 and Heading 2 styles
 * - Real Word bullet point lists (bullet: { level: 0 })
 * - Zero layout tables or textboxes
 * - Clean standard Arial / Calibri / Georgia font matching selected template
 * - Strictly respects section order and hidden sections
 */
export async function generateResumeDocxBlob(
  resume: Resume,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const pageSize = options.pageSize || resume.meta?.pageSize || "A4";
  const templateId = options.templateId || "classic";
  const templateDef = getTemplateDefinition(templateId);
  const accentHex = (templateDef.accentColor || "#0F766E").replace("#", "");
  const defaultFont =
    templateDef.fontType === "Serif"
      ? "Georgia"
      : templateDef.fontType === "Mono"
      ? "Consolas"
      : "Calibri";
  const fontFamily = options.fontFamily || defaultFont;
  const isCentered =
    templateDef.layoutFamily === "traditional" ||
    templateDef.id === "classic";

  // Dimensions in twips (1 inch = 1440 twips)
  const pageDimensions =
    pageSize === "A4"
      ? { width: 11906, height: 16838 } // A4: 8.27 x 11.69 inches
      : { width: 12240, height: 15840 }; // Letter: 8.5 x 11.0 inches

  const children: Paragraph[] = [];

  // Helper for section heading (Heading 2)
  const createSectionHeading = (title: string): Paragraph => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: accentHex || "666666",
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22, // 11pt
          font: fontFamily,
          color: accentHex || "111827",
        }),
      ],
    });
  };

  // 1. CANDIDATE HEADER (Heading 1 + Contact Line)
  const candidateName = resume.basics.name || "Candidate Name";
  const headline = resume.basics.headline || resume.basics.title || "";
  const contactParts = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.linkedin,
    resume.basics.github,
    resume.basics.portfolio,
  ].filter(Boolean);

  const headerAlignment = isCentered ? AlignmentType.CENTER : AlignmentType.LEFT;

  // Name (Heading 1)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: headerAlignment,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: candidateName,
          bold: true,
          size: 36, // 18pt
          font: fontFamily,
          color: accentHex,
        }),
      ],
    })
  );

  // Headline
  if (headline) {
    children.push(
      new Paragraph({
        alignment: headerAlignment,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: headline,
            italics: true,
            size: 22, // 11pt
            font: fontFamily,
            color: "374151",
          }),
        ],
      })
    );
  }

  // Contact info line
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 18, // 9pt
            font: fontFamily,
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // 2. RENDER SECTIONS RESPECTING ORDER & HIDDEN SECTIONS
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
        children.push(createSectionHeading("Professional Summary"));
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 120 },
            children: [
              new TextRun({
                text: summaryText,
                size: 20, // 10pt
                font: fontFamily,
                color: "1F2937",
              }),
            ],
          })
        );
      }
    }

    // B. EXPERIENCE
    else if (sectionId === "experience" && resume.experience?.length > 0) {
      children.push(createSectionHeading("Work Experience"));

      for (const exp of resume.experience) {
        const companyLine = [exp.company, exp.location].filter(Boolean).join(" — ");
        const dateLine = [exp.start, exp.end || "Present"].filter(Boolean).join(" – ");

        // Company + Date line
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: companyLine,
                bold: true,
                size: 21, // 10.5pt
                font: fontFamily,
                color: "111827",
              }),
              new TextRun({
                text: dateLine ? `    (${dateLine})` : "",
                italics: true,
                size: 19,
                font: fontFamily,
                color: "4B5563",
              }),
            ],
          })
        );

        // Role
        if (exp.role) {
          children.push(
            new Paragraph({
              spacing: { before: 0, after: 60 },
              children: [
                new TextRun({
                  text: exp.role,
                  bold: true,
                  italics: true,
                  size: 20,
                  font: fontFamily,
                  color: "0F766E",
                }),
              ],
            })
          );
        }

        // Bullets (Native Word Bullets)
        for (const bullet of exp.bullets) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 40 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: 19, // 9.5pt
                  font: fontFamily,
                  color: "1F2937",
                }),
              ],
            })
          );
        }
      }
    }

    // C. EDUCATION
    else if (sectionId === "education" && resume.education?.length > 0) {
      children.push(createSectionHeading("Education"));

      for (const edu of resume.education) {
        const yearText = edu.year || (edu.start && edu.end ? `${edu.start} – ${edu.end}` : edu.end || "");
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: edu.school,
                bold: true,
                size: 21,
                font: fontFamily,
                color: "111827",
              }),
              new TextRun({
                text: yearText ? `    (${yearText})` : "",
                italics: true,
                size: 19,
                font: fontFamily,
                color: "4B5563",
              }),
            ],
          })
        );

        const degreeText = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join("  •  ");
        if (degreeText) {
          children.push(
            new Paragraph({
              spacing: { before: 0, after: 80 },
              children: [
                new TextRun({
                  text: degreeText,
                  italics: true,
                  size: 19,
                  font: fontFamily,
                  color: "374151",
                }),
              ],
            })
          );
        }
      }
    }

    // D. SKILLS
    else if (sectionId === "skills") {
      const flatSkills = getFlatSkills(resume.skills);
      if (flatSkills.length > 0) {
        children.push(createSectionHeading("Technical Skills"));

        if (Array.isArray(resume.skills) && typeof resume.skills[0] === "object") {
          for (const cat of resume.skills as any[]) {
            if (!cat.items || cat.items.length === 0) continue;
            children.push(
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: `${cat.category}: `,
                    bold: true,
                    size: 19,
                    font: fontFamily,
                    color: "111827",
                  }),
                  new TextRun({
                    text: cat.items.join(", "),
                    size: 19,
                    font: fontFamily,
                    color: "374151",
                  }),
                ],
              })
            );
          }
        } else {
          children.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({
                  text: flatSkills.join("  •  "),
                  size: 19,
                  font: fontFamily,
                  color: "1F2937",
                }),
              ],
            })
          );
        }
      }
    }

    // E. PROJECTS
    else if (sectionId === "projects" && resume.projects?.length > 0) {
      children.push(createSectionHeading("Featured Projects"));

      for (const proj of resume.projects) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 20 },
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 21,
                font: fontFamily,
                color: "111827",
              }),
              new TextRun({
                text: proj.link ? `    (${proj.link})` : "",
                italics: true,
                size: 18,
                font: fontFamily,
                color: "0F766E",
              }),
            ],
          })
        );

        if (proj.tech && proj.tech.length > 0) {
          children.push(
            new Paragraph({
              spacing: { before: 0, after: 40 },
              children: [
                new TextRun({
                  text: `Technologies: ${proj.tech.join(", ")}`,
                  size: 18,
                  font: fontFamily,
                  color: "4B5563",
                }),
              ],
            })
          );
        }

        for (const bullet of proj.bullets) {
          if (!bullet.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 40 },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: 19,
                  font: fontFamily,
                  color: "1F2937",
                }),
              ],
            })
          );
        }
      }
    }
  }

  // Construct Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: pageDimensions,
            margin: {
              top: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.6),
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers a direct browser download of the generated .docx file.
 */
export async function downloadResumeDocx(
  resume: Resume,
  filename?: string,
  options?: DocxExportOptions
): Promise<void> {
  const templateId = options?.templateId || resume.template || "classic";
  const blob = await generateResumeDocxBlob(resume, { ...options, templateId });
  const candidateName = (resume.basics.name || "Resume").replace(/\s+/g, "_");
  const roleName = (resume.basics.headline || resume.basics.title || "").replace(/\s+/g, "_");
  const finalFilename = filename || `${candidateName}${roleName ? `_${roleName}` : ""}_Resume.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  a.click();
  URL.revokeObjectURL(url);
}
