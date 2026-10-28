import type { Resume, TailorDiff } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";

/**
 * Computes granular side-by-side differences between the original base resume
 * and the AI-tailored candidate resume, with human-readable rationale.
 */
export function generateTailorDiffs(
  baseResume: Resume,
  tailoredResume: Resume
): TailorDiff[] {
  const diffs: TailorDiff[] = [];

  // 1. Summary comparison
  const baseSummary = (baseResume.basics.summary || baseResume.summary || "").trim();
  const tailoredSummary = (tailoredResume.basics.summary || tailoredResume.summary || "").trim();

  if (baseSummary && tailoredSummary && baseSummary !== tailoredSummary) {
    diffs.push({
      id: "diff-summary",
      section: "summary",
      path: "Professional Summary",
      originalText: baseSummary,
      tailoredText: tailoredSummary,
      reason: "Reframed summary to highlight target job competencies while strictly preserving real experience.",
      status: "pending",
    });
  }

  // 2. Experience Bullets comparison
  for (const baseExp of baseResume.experience) {
    const tailoredExp =
      tailoredResume.experience.find((e) => e.id === baseExp.id) ||
      tailoredResume.experience.find(
        (e) => e.company.toLowerCase().trim() === baseExp.company.toLowerCase().trim()
      );

    if (!tailoredExp) continue;

    // Check each bullet
    const maxLen = Math.max(baseExp.bullets.length, tailoredExp.bullets.length);
    for (let i = 0; i < maxLen; i++) {
      const originalBullet = (baseExp.bullets[i] || "").trim();
      const tailoredBullet = (tailoredExp.bullets[i] || "").trim();

      if (originalBullet && tailoredBullet && originalBullet !== tailoredBullet) {
        diffs.push({
          id: `diff-exp-${baseExp.id}-${i}`,
          section: "experience",
          targetId: baseExp.id,
          bulletIndex: i,
          path: `${baseExp.company || "Experience"} — Bullet #${i + 1}`,
          originalText: originalBullet,
          tailoredText: tailoredBullet,
          reason: "Reworded with high-relevance action verbs matching job description responsibilities.",
          status: "pending",
        });
      }
    }
  }

  // 3. Projects comparison
  if (baseResume.projects && tailoredResume.projects) {
    for (const baseProj of baseResume.projects) {
      const tailoredProj =
        tailoredResume.projects.find((p) => p.id === baseProj.id) ||
        tailoredResume.projects.find(
          (p) => p.name.toLowerCase().trim() === baseProj.name.toLowerCase().trim()
        );

      if (!tailoredProj) continue;

      const maxLen = Math.max(baseProj.bullets.length, tailoredProj.bullets.length);
      for (let i = 0; i < maxLen; i++) {
        const origB = (baseProj.bullets[i] || "").trim();
        const tailB = (tailoredProj.bullets[i] || "").trim();

        if (origB && tailB && origB !== tailB) {
          diffs.push({
            id: `diff-proj-${baseProj.id}-${i}`,
            section: "projects",
            targetId: baseProj.id,
            bulletIndex: i,
            path: `${baseProj.name || "Project"} — Bullet #${i + 1}`,
            originalText: origB,
            tailoredText: tailB,
            reason: "Aligned technical implementation details with target architectural requirements.",
            status: "pending",
          });
        }
      }
    }
  }

  // 4. Skills Order comparison
  const baseSkillsFlat = getFlatSkills(baseResume.skills).map((s) => s.toLowerCase());
  const tailoredSkillsFlat = getFlatSkills(tailoredResume.skills).map((s) => s.toLowerCase());

  if (
    baseSkillsFlat.length > 0 &&
    tailoredSkillsFlat.length > 0 &&
    JSON.stringify(baseSkillsFlat) !== JSON.stringify(tailoredSkillsFlat)
  ) {
    diffs.push({
      id: "diff-skills",
      section: "skills",
      path: "Skills Prioritization",
      originalText: getFlatSkills(baseResume.skills).slice(0, 10).join(", "),
      tailoredText: getFlatSkills(tailoredResume.skills).slice(0, 10).join(", "),
      reason: "Reordered technical skills to surface technologies specifically prioritized in the JD.",
      status: "pending",
    });
  }

  return diffs;
}

/**
 * Applies accepted diffs to produce a modified tailored resume,
 * safely ignoring any diffs marked as rejected or pending.
 */
export function applyAcceptedDiffs(
  baseResume: Resume,
  tailoredResume: Resume,
  diffs: TailorDiff[]
): Resume {
  // Start with a deep clone of base resume
  const result: Resume = JSON.parse(JSON.stringify(baseResume));

  for (const diff of diffs) {
    if (diff.status !== "accepted") continue;

    if (diff.section === "summary") {
      result.basics.summary = diff.tailoredText;
      if (result.summary !== undefined) result.summary = diff.tailoredText;
    } else if (diff.section === "experience" && diff.targetId && diff.bulletIndex !== undefined) {
      const exp = result.experience.find((e) => e.id === diff.targetId);
      if (exp && exp.bullets[diff.bulletIndex] !== undefined) {
        exp.bullets[diff.bulletIndex] = diff.tailoredText;
      }
    } else if (diff.section === "projects" && diff.targetId && diff.bulletIndex !== undefined && result.projects) {
      const proj = result.projects.find((p) => p.id === diff.targetId);
      if (proj && proj.bullets[diff.bulletIndex] !== undefined) {
        proj.bullets[diff.bulletIndex] = diff.tailoredText;
      }
    } else if (diff.section === "skills") {
      // Apply tailored skills
      result.skills = JSON.parse(JSON.stringify(tailoredResume.skills));
    }
  }

  return result;
}
