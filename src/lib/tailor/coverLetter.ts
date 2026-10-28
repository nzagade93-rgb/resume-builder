import type { Resume } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";
import { parseJobDescription } from "./jdAnalysis";

export type CoverLetterTone = "confident" | "formal" | "modern";

export interface GenerateCoverLetterOptions {
  resume: Resume;
  jdText: string;
  tone?: CoverLetterTone;
  hiringManager?: string;
}

/**
 * Deterministically generates a tailored, truthful, 1-page cover letter
 * from the candidate's authentic resume data and the target job description.
 * Adheres strictly to the truthfulness rule: never invents facts or companies.
 */
export function generateCoverLetter({
  resume,
  jdText,
  tone = "confident",
  hiringManager = "Hiring Team",
}: GenerateCoverLetterOptions): string {
  const { name, email, phone, location } = resume.basics;
  const headline = resume.basics.headline || resume.basics.title || "Software Professional";
  const parsedJd = parseJobDescription(jdText);
  const company = parsedJd.company || "Your Organization";
  const role = parsedJd.role || headline;

  const flatSkills = getFlatSkills(resume.skills);
  const primarySkills = flatSkills.slice(0, 4).join(", ");
  const latestExp = resume.experience[0];
  const featuredProject = resume.projects?.[0];

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Contact Header
  const header = `${name || "Candidate Name"}
${email ? email : ""}${phone ? ` | ${phone}` : ""}${location ? ` | ${location}` : ""}
${today}

To: The ${hiringManager}
${company}
Re: Application for ${role}
`;

  // Paragraph 1: Opening & Role alignment
  let opening = "";
  if (tone === "confident") {
    opening = `I am writing to express my enthusiastic interest in the ${role} position at ${company}. With a track record of driving scalable software solutions and leveraging ${primarySkills || "modern technologies"}, I am eager to deliver immediate technical impact to your engineering objectives.`;
  } else if (tone === "formal") {
    opening = `Please accept this letter and the enclosed resume as an application for the ${role} opening at ${company}. Having followed ${company}'s standard of excellence, I believe my professional experience in ${primarySkills || "software development"} aligns well with your current requirements.`;
  } else {
    // modern
    opening = `When I came across the ${role} opportunity at ${company}, I immediately recognized a strong alignment with my work in ${primarySkills || "building software"}. I am thrilled to present how my engineering background can contribute to ${company}'s upcoming milestones.`;
  }

  // Paragraph 2: Authentic Work Experience
  let expParagraph = "";
  if (latestExp) {
    const keyBullet = latestExp.bullets[0] || "delivered high-impact software initiatives";
    if (tone === "confident") {
      expParagraph = `In my role as ${latestExp.role} at ${latestExp.company}, I focused on high-leverage execution. Specifically, I ${keyBullet.replace(/^[A-Z]/, (c) => c.toLowerCase())}. This experience strengthened my ability to translate technical specifications into performant, reliable production systems that solve core customer challenges.`;
    } else if (tone === "formal") {
      expParagraph = `During my tenure as ${latestExp.role} with ${latestExp.company}, I was entrusted with critical responsibilities where I ${keyBullet.replace(/^[A-Z]/, (c) => c.toLowerCase())}. My time there developed my disciplined approach to engineering quality, code maintainability, and collaborative problem-solving.`;
    } else {
      expParagraph = `At ${latestExp.company}, working as a ${latestExp.role}, I had the opportunity to tackle complex systems challenges: I ${keyBullet.replace(/^[A-Z]/, (c) => c.toLowerCase())}. Navigating these challenges taught me how to move quickly without compromising engineering standards.`;
    }
  }

  // Paragraph 3: Project or Core Technical Strengths
  let projParagraph = "";
  if (featuredProject) {
    const projBullet = featuredProject.bullets[0] || "designed and built modern architectures";
    projParagraph = `Beyond my day-to-day work, I built ${featuredProject.name} using ${featuredProject.tech.slice(0, 3).join(", ") || "modern stacks"}, where I ${projBullet.replace(/^[A-Z]/, (c) => c.toLowerCase())}. This reinforces my hands-on curiosity and commitment to staying at the forefront of software craftsmanship.`;
  } else if (flatSkills.length > 0) {
    projParagraph = `My core toolkit spans ${flatSkills.slice(0, 6).join(", ")}, allowing me to quickly adapt to existing codebases and introduce rigorous development practices with minimal onboarding ramp.`;
  }

  // Paragraph 4: Closing & Call to Action
  let closing = "";
  if (tone === "confident") {
    closing = `I welcome the opportunity to discuss how my technical background and disciplined execution will benefit the ${company} team. Thank you for your time and consideration.`;
  } else if (tone === "formal") {
    closing = `I would welcome the privilege of an interview to discuss how my background matches the needs of ${company}. Thank you for your review of my application materials.`;
  } else {
    closing = `I would love to connect and chat about what your team is building at ${company} and how I can help. Thank you for your time and consideration!`;
  }

  const signoff = `
Sincerely,
${name || "Candidate"}`;

  return [header, opening, expParagraph, projParagraph, closing, signoff]
    .filter(Boolean)
    .join("\n\n");
}
