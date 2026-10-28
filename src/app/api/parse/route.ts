import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { checkServerRateLimit } from "@/lib/ai/rateLimit";
import { parseResumeTextDeterministically } from "@/lib/import/deterministicParser";
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
            "Hourly AI request limit reached. Please wait a little while before parsing another document.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 2. Input validation
    const body = await req.json();
    const { text } = body as { text?: string };

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        { error: "Provided text is too short or empty for resume parsing." },
        { status: 400 }
      );
    }

    // Cap text at 15,000 characters to prevent excessive token usage
    const cappedText = text.trim().slice(0, 15000);

    // 3. Invoke AI Provider (Gemini free tier)
    const aiProvider = getAIProvider();

    const systemPrompt = `You are an expert ATS resume parser.
Non-negotiable rules:
1. TRUTHFULNESS: Never invent missing employers, titles, dates, degrees, skills, or metrics.
2. If a field is not explicitly present in the candidate's text, leave it empty or as an empty array.
3. Extract candidate basics (name, email, phone, location, linkedin, github, portfolio, summary).
4. Extract work experience (company, role, start, end, bullets).
5. Extract education (school, degree, year).
6. Extract skills grouped by category.
7. Return strictly valid JSON matching the ResumeSchemaV2.`;

    const userPrompt = `Extract the following raw resume text into structured Resume JSON:

---
${cappedText}
---`;

    let parsedResume: Resume;
    let lowConfidenceFields: string[] = [];

    try {
      parsedResume = await aiProvider.generateJSON<Resume>({
        system: systemPrompt,
        user: userPrompt,
        schema: ResumeSchemaV2,
        timeoutMs: 14000,
      });

      // Verification of parsed structure
      if (!parsedResume.basics?.name || parsedResume.basics.name.length < 2) {
        lowConfidenceFields.push("Candidate Name");
      }
      if (!parsedResume.basics?.email) {
        lowConfidenceFields.push("Email Address");
      }
      if (parsedResume.experience?.length === 0) {
        lowConfidenceFields.push("Work Experience");
      }
    } catch (aiErr: any) {
      console.warn("AI parsing failed, falling back to deterministic extraction:", aiErr.message);
      const fallbackResult = parseResumeTextDeterministically(cappedText);
      parsedResume = fallbackResult.resume;
      lowConfidenceFields = fallbackResult.lowConfidenceFields;
    }

    return NextResponse.json({
      parsedResume,
      lowConfidenceFields,
      originalText: cappedText,
      remaining,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while parsing the resume." },
      { status: 500 }
    );
  }
}
