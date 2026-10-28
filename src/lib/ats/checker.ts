import type { Resume, AtsCheckResult, AtsIssue, AtsSeverity } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";
import { getTemplateDefinition } from "@/templates/registry";

// Action verbs library for ATS scoring
export const STRONG_ACTION_VERBS = new Set([
  "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
  "advanced", "advised", "allocated", "analyzed", "architected", "assembled",
  "automated", "benchmarked", "boosted", "built", "calculated", "centralized",
  "championed", "collaborated", "compiled", "composed", "configured", "consolidated",
  "constructed", "coordinated", "created", "customized", "debugged", "decreased",
  "delivered", "deployed", "designed", "developed", "devised", "diagnosed",
  "directed", "documented", "doubled", "drove", "eliminated", "enabled",
  "enforced", "engineered", "enhanced", "established", "evaluated", "exceeded",
  "executed", "expanded", "expedited", "fabricated", "facilitated", "formulated",
  "generated", "governed", "guided", "halved", "headed", "identified",
  "implemented", "improved", "increased", "initiated", "innovated", "inspected",
  "installed", "instituted", "integrated", "invented", "investigated", "launched",
  "led", "leveraged", "managed", "maximized", "measured", "mentored",
  "migrated", "minimized", "modeled", "modernized", "monitored", "negotiated",
  "optimized", "orchestrated", "organized", "overhauled", "oversaw", "pioneered",
  "planned", "prepared", "produced", "programmed", "promoted", "prototyped",
  "published", "rebuilt", "redesigned", "reduced", "refactored", "refined",
  "remodeled", "reorganized", "replaced", "resolved", "restructured", "revamped",
  "scaled", "scheduled", "secured", "simplified", "spearheaded", "standardized",
  "steered", "streamlined", "strengthened", "structured", "supervised", "surpassed",
  "trained", "transformed", "transitioned", "tripled", "troubleshot", "unified",
  "upgraded", "validated", "verified"
]);

// Weak / passive phrases to avoid
export const WEAK_PHRASES = [
  "responsible for",
  "duties included",
  "helped with",
  "helped to",
  "assisted with",
  "worked on",
  "tasked with",
  "participated in",
  "tried to",
  "attempted to",
  "contributed to",
  "served as",
];

/**
 * Deterministically checks resume for ATS parsing safety, formatting,
 * impact density, repeated verbs, and standard section structure.
 */
export function runAtsChecker(resume: Resume): AtsCheckResult {
  const issues: AtsIssue[] = [];
  let score = 100;

  // 1. Check Basics / Contact Information
  const { name, email, phone, location } = resume.basics;
  const headline = resume.basics.headline || resume.basics.title;

  if (!name || name.trim().length < 2) {
    issues.push({
      id: "contact-name",
      category: "Contact Info",
      severity: "critical",
      title: "Missing Candidate Name",
      description: "Applicant Tracking Systems require a clear, identifiable candidate name at the top.",
      suggestion: "Enter your full legal name in the Basics tab.",
      impactScore: -15,
    });
    score -= 15;
  } else {
    issues.push({
      id: "contact-name-ok",
      category: "Contact Info",
      severity: "good",
      title: "Candidate Name Present",
      description: `Name '${name}' is clearly formatted for parsing.`,
      suggestion: "",
      impactScore: 0,
    });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    issues.push({
      id: "contact-email",
      category: "Contact Info",
      severity: "critical",
      title: "Missing or Invalid Email",
      description: "Recruiters and automated schedulers cannot reach you without a valid email address.",
      suggestion: "Add a valid standard email address (e.g. name@domain.com).",
      impactScore: -12,
    });
    score -= 12;
  } else {
    issues.push({
      id: "contact-email-ok",
      category: "Contact Info",
      severity: "good",
      title: "Valid Email Address",
      description: `Contact email is valid: ${email}.`,
      suggestion: "",
      impactScore: 0,
    });
  }

  // Phone number
  if (!phone || phone.trim().length < 7) {
    issues.push({
      id: "contact-phone",
      category: "Contact Info",
      severity: "warning",
      title: "Missing Phone Number",
      description: "Many ATS portals require a phone number for SMS notifications and recruiters.",
      suggestion: "Add a phone number with country/area code in Basics.",
      impactScore: -5,
    });
    score -= 5;
  }

  // Location
  if (!location || location.trim().length < 3) {
    issues.push({
      id: "contact-location",
      category: "Contact Info",
      severity: "warning",
      title: "Missing Location / City",
      description: "ATS geographic filters often eliminate applicants without a city/state or 'Remote' tag.",
      suggestion: "Specify your city and state/country (e.g. 'San Francisco, CA' or 'Remote').",
      impactScore: -4,
    });
    score -= 4;
  }

  // Headline
  if (!headline || headline.trim().length < 3) {
    issues.push({
      id: "contact-headline",
      category: "Contact Info",
      severity: "warning",
      title: "Missing Professional Headline",
      description: "A target title (e.g. 'Senior Full Stack Engineer') anchors your resume for keyword matching.",
      suggestion: "Add your target title or current specialty.",
      impactScore: -5,
    });
    score -= 5;
  }

  // 2. Summary Section
  const summary = resume.basics.summary || resume.summary || "";
  if (!summary || summary.trim().length < 30) {
    issues.push({
      id: "summary-empty",
      category: "Summary",
      severity: "warning",
      title: "Short or Missing Professional Summary",
      description: "A 2-3 sentence executive summary provides critical initial keyword indexing.",
      suggestion: "Write a 2-3 sentence overview highlighting your core domain and years of experience.",
      impactScore: -6,
    });
    score -= 6;
  } else if (summary.split(/\s+/).length > 90) {
    issues.push({
      id: "summary-long",
      category: "Summary",
      severity: "warning",
      title: "Summary is Too Long",
      description: "Recruiters spend 6 seconds scanning. A summary over 90 words risks being skipped.",
      suggestion: "Trim your summary to 30-70 impactful words.",
      impactScore: -4,
    });
    score -= 4;
  } else {
    issues.push({
      id: "summary-ok",
      category: "Summary",
      severity: "good",
      title: "Concise Professional Summary",
      description: "Summary length is ideal for quick ATS keyword extraction.",
      suggestion: "",
      impactScore: 0,
    });
  }

  // 3. Experience Section & Bullets
  if (!resume.experience || resume.experience.length === 0) {
    issues.push({
      id: "experience-empty",
      category: "Work Experience",
      severity: "critical",
      title: "No Work Experience Entries",
      description: "Work experience is the most heavily weighted section in automated ATS indexing.",
      suggestion: "Add at least one professional work experience or internship entry.",
      impactScore: -25,
    });
    score -= 25;
  } else {
    const allBullets: string[] = [];
    const firstWordCount = new Map<string, number>();
    let shortBulletsCount = 0;
    let longBulletsCount = 0;
    let missingMetricsCount = 0;
    let weakPhraseCount = 0;
    const weakFound: string[] = [];

    for (const exp of resume.experience) {
      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        allBullets.push(bullet);

        // Check word length
        const words = bullet.trim().split(/\s+/);
        if (words.length < 7) shortBulletsCount++;
        if (words.length > 40) longBulletsCount++;

        // Action verb at start
        const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "");
        if (firstWord) {
          firstWordCount.set(firstWord, (firstWordCount.get(firstWord) || 0) + 1);
        }

        // Metrics check (digits or percentages)
        if (!/\d/.test(bullet)) {
          missingMetricsCount++;
        }

        // Weak phrase check
        const lowerBullet = bullet.toLowerCase();
        for (const wp of WEAK_PHRASES) {
          if (lowerBullet.includes(wp)) {
            weakPhraseCount++;
            if (!weakFound.includes(wp)) weakFound.push(wp);
          }
        }
      }
    }

    // Bullet lengths issue
    if (shortBulletsCount > 0) {
      issues.push({
        id: "bullets-short",
        category: "Work Experience",
        severity: "warning",
        title: `${shortBulletsCount} Bullet Point${shortBulletsCount > 1 ? "s are" : " is"} Too Brief`,
        description: "One-liner bullets under 7 words rarely convey technical context or result.",
        suggestion: "Use the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
        impactScore: -4,
      });
      score -= 4;
    }

    if (longBulletsCount > 0) {
      issues.push({
        id: "bullets-long",
        category: "Work Experience",
        severity: "warning",
        title: `${longBulletsCount} Bullet Point${longBulletsCount > 1 ? "s are" : " is"} Run-On`,
        description: "Bullets over 40 words resemble paragraphs and lose reader attention.",
        suggestion: "Split complex accomplishments into two distinct, focused bullets.",
        impactScore: -4,
      });
      score -= 4;
    }

    // Weak phrases
    if (weakPhraseCount > 0) {
      issues.push({
        id: "weak-phrases",
        category: "Work Experience",
        severity: "warning",
        title: `Weak or Passive Language Detected (${weakFound.join(", ")})`,
        description: `Passive phrases like '${weakFound[0]}' weaken your perceived ownership and impact.`,
        suggestion: `Replace '${weakFound[0]}' with strong action verbs like 'Architected', 'Spearheaded', or 'Orchestrated'.`,
        impactScore: -6,
      });
      score -= 6;
    } else {
      issues.push({
        id: "weak-phrases-ok",
        category: "Work Experience",
        severity: "good",
        title: "Strong Active Voice",
        description: "No passive phrasing or 'responsible for' clichés found.",
        suggestion: "",
        impactScore: 0,
      });
    }

    // Repetitive action verbs
    const repeatedVerbs: string[] = [];
    for (const [verb, count] of firstWordCount.entries()) {
      if (count > 3 && STRONG_ACTION_VERBS.has(verb)) {
        repeatedVerbs.push(`${verb} (${count}x)`);
      }
    }

    if (repeatedVerbs.length > 0) {
      issues.push({
        id: "repeated-verbs",
        category: "Work Experience",
        severity: "warning",
        title: `Repeated Action Verbs: ${repeatedVerbs.join(", ")}`,
        description: "Using the exact same verb over 3 times feels repetitive to automated scanners.",
        suggestion: "Diversify your vocabulary with alternative verbs (e.g. 'Engineered', 'Overhauled', 'Directed').",
        impactScore: -3,
      });
      score -= 3;
    }

    // Measurable results / numbers
    if (allBullets.length > 0 && missingMetricsCount / allBullets.length > 0.6) {
      issues.push({
        id: "missing-metrics",
        category: "Work Experience",
        severity: "warning",
        title: "Low Metric Density Across Bullets",
        description: "Over 60% of your experience bullets do not mention numbers, percentages, or scale.",
        suggestion: "Add truthful metrics where applicable: 'Add a number if you have one' (e.g. latency, team size, users).",
        impactScore: -5,
      });
      score -= 5;
    } else {
      issues.push({
        id: "metrics-ok",
        category: "Work Experience",
        severity: "good",
        title: "Quantified Impact Present",
        description: "Your experience bullets feature numbers and measurable outcomes.",
        suggestion: "",
        impactScore: 0,
      });
    }
  }

  // 4. Skills Section
  const flatSkills = getFlatSkills(resume.skills);
  if (flatSkills.length < 5) {
    issues.push({
      id: "skills-insufficient",
      category: "Skills",
      severity: "critical",
      title: "Insufficient Listed Skills",
      description: `Only ${flatSkills.length} skills listed. Most ATS filters score against 10-25 technical competencies.`,
      suggestion: "Add technical languages, frameworks, cloud platforms, and developer tooling in the Skills tab.",
      impactScore: -10,
    });
    score -= 10;
  } else {
    issues.push({
      id: "skills-ok",
      category: "Skills",
      severity: "good",
      title: "Strong Technical Skills Section",
      description: `${flatSkills.length} relevant competencies indexed and parseable.`,
      suggestion: "",
      impactScore: 0,
    });
  }

  // 5. Education Section
  if (!resume.education || resume.education.length === 0) {
    issues.push({
      id: "education-empty",
      category: "Education",
      severity: "warning",
      title: "Missing Education Section",
      description: "Many company ATS job postings strictly require degree level verification.",
      suggestion: "Add your university, degree, or relevant certification program.",
      impactScore: -5,
    });
    score -= 5;
  } else {
    issues.push({
      id: "education-ok",
      category: "Education",
      severity: "good",
      title: "Education Section Verified",
      description: "Degree and institution details are present.",
      suggestion: "",
      impactScore: 0,
    });
  }

  // 6. Section Order & Standard Headings
  const standardSections = ["experience", "education", "skills"];
  const missingCore = standardSections.filter((sec) => !resume.meta.sectionOrder.includes(sec));
  if (missingCore.length > 0) {
    issues.push({
      id: "standard-headings",
      category: "ATS Format",
      severity: "critical",
      title: `Missing Standard Headings (${missingCore.join(", ")})`,
      description: "ATS software expects standard industry headings like 'Experience', 'Education', and 'Skills'.",
      suggestion: "Restore standard section names in the Sections Manager.",
      impactScore: -8,
    });
    score -= 8;
  }

  // 7. Template Layout & Graphic/Photo Compatibility
  const tplId = resume.template || "classic";
  const tplDef = getTemplateDefinition(tplId);
  if (tplDef) {
    if (tplDef.isTwoColumn) {
      issues.push({
        id: "template-columns",
        category: "ATS Format",
        severity: "warning",
        title: `Two-Column Layout (${tplDef.name})`,
        description: `Template '${tplDef.name}' uses a multi-column layout. Legacy enterprise ATS systems (e.g. Taleo) may parse across columns instead of down, mixing text order.`,
        suggestion: "For high-volume enterprise job applications, consider switching to a single-column ATS template (Prime ATS, Pure ATS, Simple ATS).",
        impactScore: -5,
      });
      score -= 5;
    } else if (tplDef.isAtsSafe) {
      issues.push({
        id: "template-ats-safe",
        category: "ATS Format",
        severity: "good",
        title: `ATS Optimized Layout (${tplDef.name})`,
        description: "Single-column linear hierarchy verified for seamless, accurate machine extraction.",
        suggestion: "",
        impactScore: 0,
      });
    }

    if (resume.basics.photo) {
      issues.push({
        id: "template-photo-warning",
        category: "ATS Format",
        severity: "warning",
        title: "Profile Photo Embedded",
        description: "US and UK ATS portals frequently flag or discard resumes with photos to avoid anti-discrimination litigation.",
        suggestion: "Remove or disable photo for corporate applications in the US, UK, and Canada.",
        impactScore: -4,
      });
      score -= 4;
    }
  }

  // Ensure score stays in [0, 100]
  const finalScore = Math.max(10, Math.min(100, score));

  // Determine rating
  let rating: AtsCheckResult["rating"] = "Needs Work";
  if (finalScore >= 85) rating = "Excellent";
  else if (finalScore >= 68) rating = "Good";

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const passedCount = issues.filter((i) => i.severity === "good").length;

  // Sort issues: critical first, then warning, then good
  const severityRank: Record<AtsSeverity, number> = {
    critical: 0,
    warning: 1,
    good: 2,
  };
  issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return {
    score: finalScore,
    rating,
    issues,
    summary: {
      criticalCount,
      warningCount,
      passedCount,
    },
  };
}
