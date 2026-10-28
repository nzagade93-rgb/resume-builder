import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

export interface AIProvider {
  name: string;
  generateJSON<T>(params: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
    timeoutMs?: number;
  }): Promise<T>;
}

// ==========================================
// 1. GEMINI PROVIDER (gemini-2.5-flash, free tier)
// ==========================================
export class GeminiProvider implements AIProvider {
  name = "gemini-2.5-flash";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateJSON<T>({
    system,
    user,
    schema,
    timeoutMs = 12000,
  }: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
    timeoutMs?: number;
  }): Promise<T> {
    // If no key is set, use deterministic honest fallback so demo works
    if (!this.apiKey) {
      return this.handleFallback(system, user, schema);
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const prompt = `${system}\n\nIMPORTANT: Return ONLY valid JSON adhering strictly to the requested schema. Do not invent any numbers, companies, or facts.\n\nUser request:\n${user}`;

    // Retry with exponential backoff on 429 rate limit errors (up to 3 retries)
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2, // Low temperature to maximize adherence and reduce hallucinations
          },
        });

        clearTimeout(timeoutId);

        const text = response.text?.trim() || "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonString);

        return schema.parse(parsed);
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit = String(err).includes("429") || String(err).toLowerCase().includes("quota");
        if (isRateLimit && attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    console.warn("[GeminiProvider] API error, falling back to rule-based response:", lastError);
    return this.handleFallback(system, user, schema);
  }

  /**
   * Deterministic honest rule-based fallback when GEMINI_API_KEY is not yet provided.
   * Guarantees zero invented metrics, dates, or companies.
   */
  private handleFallback<T>(system: string, user: string, schema: z.ZodType<T>): T {
    // If user is improving a bullet
    const bulletMatch = user.match(/bullet:\s*"([^"]+)"/i) || user.match(/bullet:\s*([^\n]+)/i);
    const originalText = bulletMatch ? bulletMatch[1].trim() : user.trim();

    // Clean up weak opening phrases
    let polished = originalText
      .replace(/^(responsible for|worked on|helped with|assisted in|participated in|did|handled)\s+/i, "")
      .trim();

    // Capitalize first letter
    polished = polished.charAt(0).toUpperCase() + polished.slice(1);

    // Pick strong action verb if missing
    if (!/^(architected|engineered|spearheaded|developed|accelerated|streamlined|orchestrated|delivered|built|automated)/i.test(polished)) {
      polished = `Spearheaded ${polished.toLowerCase()}`;
    }

    // Ensure ending period
    if (!polished.endsWith(".")) {
      polished += ".";
    }

    const mockResponse = {
      suggestion: polished,
      metricNudge: /\d/.test(originalText)
        ? undefined
        : "Add a number here if you have one (e.g. latency, users, % growth)",
      changesSummary: "Strengthened opening action verb and removed passive phrasing.",
    };

    try {
      return schema.parse(mockResponse);
    } catch {
      return mockResponse as unknown as T;
    }
  }
}

// ==========================================
// 2. GROQ PROVIDER STUB (for future zero-cost swapping)
// ==========================================
export class GroqProvider implements AIProvider {
  name = "groq-llama-3";

  async generateJSON<T>({
    system,
    user,
    schema,
  }: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
  }): Promise<T> {
    // Stub for Groq API integration (OpenAI-compatible client)
    throw new Error("Groq provider is not yet configured. Use GeminiProvider.");
  }
}

// Factory function
export function getAIProvider(): AIProvider {
  return new GeminiProvider();
}
