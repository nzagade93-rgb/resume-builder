import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai/provider";
import { verifyTruthfulness } from "@/lib/ai/guard";
import { checkServerRateLimit } from "@/lib/ai/rateLimit";

const RequestSchema = z.object({
  mode: z.enum(["summary", "bullet", "job-bullets", "skills-suggest", "tone"]),
  text: z.string().min(1, "Input text cannot be empty").max(2000, "Text exceeds 2,000 character limit"),
  tone: z.enum(["entry-level", "mid", "executive"]).optional().default("mid"),
  jobDescription: z.string().max(3000).optional(),
  allowedContext: z.string().max(2000).optional(),
});

const AIResponseSchema = z.object({
  suggestion: z.string(),
  metricNudge: z.string().optional(),
  changesSummary: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. In-memory IP rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkServerRateLimit(ip);

    if (!rateLimit.allowed) {
      const waitMinutes = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 60000));
      return NextResponse.json(
        {
          error: "Rate limit reached",
          message: `You have reached the free AI limit (10 requests/hour). Please wait ${waitMinutes} minutes or edit directly.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 2. Validate request payload
    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { mode, text, tone, jobDescription, allowedContext } = parseResult.data;

    // 3. Construct prompt based on mode with strict truthfulness instructions
    const systemPrompt = `You are an elite, truthful executive resume editor.
CRITICAL NON-NEGOTIABLE TRUTHFULNESS RULES:
1. You may reword, reorder, eliminate weak passive words, and emphasize real achievements.
2. You must NEVER invent employers, job titles, dates, degrees, or tools.
3. You must NEVER invent numbers, metrics, percentages, or dollar amounts. If a metric would strengthen the bullet, provide a metric nudge asking the user: "Add a number here if you have one" rather than generating one.
4. Output MUST adhere strictly to the JSON schema: {"suggestion": "...", "metricNudge": "...", "changesSummary": "..."}`;

    let userPrompt = "";
    if (mode === "bullet") {
      userPrompt = `Mode: Bullet Improvement (Target tone: ${tone}).
Format the following bullet using the Google XYZ formula ("Accomplished [X] by doing [Z], leading to [Y]"):
Bullet: "${text}"`;
    } else if (mode === "summary") {
      userPrompt = `Mode: Professional Summary Polish (Target tone: ${tone}).
Polish the following professional summary into 2-3 punchy, high-impact sentences without inventing any credentials:
Summary: "${text}"`;
    } else if (mode === "job-bullets") {
      userPrompt = `Mode: Tailor Bullet to Job (Target tone: ${tone}).
Target Job Context: "${jobDescription || "Software Engineer"}"
Existing Bullet: "${text}"
Emphasize relevant keywords ONLY where the user's actual experience supports it. Do NOT hallucinate new tools.`;
    } else if (mode === "tone") {
      userPrompt = `Mode: Tone Adjustment to ${tone.toUpperCase()}.
Reframe the following text for a ${tone} level professional while preserving all factual data:
Text: "${text}"`;
    } else {
      userPrompt = `Mode: Skills Extraction & Suggestion.
From the following experience text, extract skills mentioned and suggest 2-3 related tools:
Text: "${text}"`;
    }

    // 4. Generate candidate response with AI provider
    const provider = getAIProvider();
    const aiOutput = await provider.generateJSON({
      system: systemPrompt,
      user: userPrompt,
      schema: AIResponseSchema,
      timeoutMs: 12000,
    });

    // 5. Programmatic Truthfulness Guard check
    const guardCheck = verifyTruthfulness(text, aiOutput.suggestion, allowedContext);

    // If bullet has no numbers, provide a metric nudge if not already provided
    let metricNudge = aiOutput.metricNudge;
    if (!/\d/.test(text) && !metricNudge) {
      metricNudge = "Add a number if you have one (e.g. latency reduced, users served, % growth)";
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      suggestion: guardCheck.isTruthful ? aiOutput.suggestion : text,
      isTruthful: guardCheck.isTruthful,
      violations: guardCheck.violations,
      feedbackMessage: guardCheck.feedbackMessage,
      metricNudge,
      changesSummary: aiOutput.changesSummary,
      remaining: rateLimit.remaining,
    });
  } catch (err: unknown) {
    // Never log personal resume data
    console.error("[api/improve] Processing error occurred:", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json(
      {
        error: "AI service error",
        message: "An error occurred while generating the suggestion. Please try again.",
      },
      { status: 500 }
    );
  }
}
