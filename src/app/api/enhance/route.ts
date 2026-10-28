import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const { action, text, context, jobDescription } = await req.json();

    const anthropic = new Anthropic({
      apiKey,
    });

    let prompt = "";
    if (action === "summary") {
      prompt = `You are an executive resume coach and ATS optimization specialist. 
Rewrite the following resume summary to make it compelling, concise, and impact-driven. 
Highlight strengths, leadership, and technical prowess. Return only the revised summary text without any preamble or quotes.

Original Summary:
"${text}"
${context ? `\nCandidate Background / Target Role: ${context}` : ""}`;
    } else if (action === "bullet") {
      prompt = `You are a professional resume writer specializing in high-impact achievement bullet points.
Rewrite the following resume bullet point using the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").
Use a strong action verb, quantify impact where possible, and make it ATS-friendly.
Return only the improved bullet point without quotes or commentary.

Original Bullet:
"${text}"`;
    } else if (action === "tailor") {
      prompt = `You are an expert career consultant.
Compare this candidate's resume information with the provided job description and suggest 3-5 high-impact keywords, skills, or bullet adjustments to maximize ATS alignment and relevance.
Return concise, actionable suggestions in bullet points.

Job Description:
${jobDescription}

Resume Summary / Background:
${text}`;
    } else {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const firstBlock = message.content[0];
    const resultText = firstBlock.type === "text" ? firstBlock.text : "";

    return NextResponse.json({ result: resultText });
  } catch (error: any) {
    console.error("AI Enhance error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI enhancement request" },
      { status: 500 }
    );
  }
}
