import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { verifyTruthfulness } from "@/lib/ai/guard";
import { checkServerRateLimit } from "@/lib/ai/rateLimit";
import { parseJobDescription, analyzeJdMatch } from "@/lib/tailor/jdAnalysis";
import { generateTailorDiffs } from "@/lib/tailor/diffEngine";
import { ResumeSchemaV2 } from "@/lib/schema";
import type { Resume } from "@/types/resume";

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting (10 requests per hour per IP)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { allowed, remaining } = checkServerRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded (10 requests per hour). Please try again in a little while.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 2. Validate request input
    const body = await req.json();
    const { resume, jd } = body as { resume?: Resume; jd?: string };

    if (!resume || !resume.basics) {
      return NextResponse.json({ error: "Missing or invalid resume payload." }, { status: 400 });
    }

    if (!jd || !jd.trim()) {
      return NextResponse.json({ error: "Please enter or paste a job description." }, { status: 400 });
    }

    // Cap JD at 8,000 characters
    const cappedJd = jd.trim().slice(0, 8000);

    // 3. Deterministic JD parsing and keyword matching
    const parsedJd = parseJobDescription(cappedJd);
    const matchReport = analyzeJdMatch(cappedJd, resume);

    // 4. Generate Tailored Resume via AI Provider
    const aiProvider = getAIProvider();

    const systemPrompt = `You are an expert ATS resume tailoring engine.
Non-negotiable rules:
1. TRUTHFULNESS: Reword, reorder, and emphasize REAL experience.
2. NEVER invent employers, titles, dates, degrees, skills, tools, or numbers.
3. Every number, percentage, or dollar amount in your output MUST appear in the candidate's original input.
4. Reword summary in 2-3 lines tailored to the target role.
5. Reorder and reword bullets to mirror job requirements only where experience supports it.
6. Return the exact same JSON resume schema.`;

    const userPrompt = `Target Role: ${parsedJd.role} at ${parsedJd.company} (${parsedJd.seniority})
Job Description Keywords: ${parsedJd.allKeywords.slice(0, 20).join(", ")}

Original Candidate Resume:
${JSON.stringify(resume, null, 2)}

Return the tailored resume matching the ResumeSchemaV2. Preserve all existing IDs.`;

    let tailoredCandidate: Resume;
    try {
      tailoredCandidate = await aiProvider.generateJSON<Resume>({
        system: systemPrompt,
        user: userPrompt,
        schema: ResumeSchemaV2,
        timeoutMs: 14000,
      });
    } catch (aiErr: any) {
      console.warn("AI tailoring failed, utilizing deterministic tailoring fallback:", aiErr.message);
      // Deterministic fallback: deep copy resume with reordered skills and aligned summary
      tailoredCandidate = JSON.parse(JSON.stringify(resume));
      const targetSummary = `Targeting the ${parsedJd.role} role at ${parsedJd.company}. ${resume.basics.summary || resume.summary || ""}`;
      tailoredCandidate.basics.summary = targetSummary.trim();
    }

    // 5. Run Programmatic Truthfulness Guard on each rewritten text
    const corpusOriginal = JSON.stringify(resume).toLowerCase();

    // Guard summary
    const originalSummary = resume.basics.summary || resume.summary || "";
    const newSummary = tailoredCandidate.basics.summary || tailoredCandidate.summary || "";
    if (newSummary && newSummary !== originalSummary) {
      const summaryGuard = verifyTruthfulness(originalSummary, newSummary, corpusOriginal);
      if (!summaryGuard.isTruthful) {
        // Discard hallucinated summary
        tailoredCandidate.basics.summary = originalSummary;
        if (tailoredCandidate.summary) tailoredCandidate.summary = originalSummary;
      }
    }

    // Guard experience bullets
    for (const exp of tailoredCandidate.experience) {
      const origExp = resume.experience.find((e) => e.id === exp.id);
      if (!origExp) continue;

      exp.bullets = exp.bullets.map((tailoredBullet, idx) => {
        const origBullet = origExp.bullets[idx] || "";
        if (!origBullet || tailoredBullet === origBullet) return tailoredBullet;

        const bulletGuard = verifyTruthfulness(origBullet, tailoredBullet, corpusOriginal);
        // If hallucination is detected, revert to original bullet!
        return bulletGuard.isTruthful ? tailoredBullet : origBullet;
      });
    }

    // 6. Generate granular side-by-side diffs
    const diffs = generateTailorDiffs(resume, tailoredCandidate);

    return NextResponse.json({
      tailoredResume: tailoredCandidate,
      diffs,
      matchReport,
      company: parsedJd.company,
      role: parsedJd.role,
      seniority: parsedJd.seniority,
      remaining,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while tailoring resume." },
      { status: 500 }
    );
  }
}
