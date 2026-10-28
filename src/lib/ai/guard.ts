/**
 * Programmatic Zero-Hallucination Truthfulness Guard
 * 
 * Non-negotiable rule: AI may reword, reorder, and emphasize real experience.
 * It must NEVER invent employers, titles, dates, degrees, skills, tools, or numbers.
 * If a metric would help, suggest "Add a number here if you have one."
 */

export interface GuardResult {
  isTruthful: boolean;
  violations: string[];
  cleanOutput?: string;
  feedbackMessage?: string;
}

// Well-known tech giants & employers frequently hallucinated by LLMs
const HALLUCINATED_COMPANY_WATCHLIST = [
  "google",
  "meta",
  "facebook",
  "amazon",
  "apple",
  "netflix",
  "microsoft",
  "stripe",
  "uber",
  "airbnb",
  "tesla",
  "twitter",
  "openai",
  "anthropic",
  "mckinsey",
  "goldman sachs",
  "oracle",
  "salesforce",
];

// Degree patterns
const DEGREE_PATTERNS = [
  /\b(ph\.?d\.?|doctorate)\b/i,
  /\b(m\.?s\.?|master'?s|mba)\b/i,
  /\b(b\.?s\.?|b\.?a\.?|bachelor'?s)\b/i,
];

/**
 * Extracts normalized numerical tokens (numbers, percentages, currency)
 */
export function extractNumbers(text: string): string[] {
  if (!text) return [];
  // Match tokens like: $500K, 35%, 10x, 2.5M, 50, 99.999%
  const matches = text.match(/\$?\d+(?:\.\d+)?(?:%|x|k|m|b)?(?=[\s,.;:!?)]|$)/gi) || [];
  return matches.map((m) => m.toLowerCase().trim());
}

/**
 * Extracts 4-digit calendar years
 */
export function extractYears(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\b(19\d\d|20\d\d)\b/g) || [];
  return Array.from(new Set(matches));
}

/**
 * Verifies that the AI suggestion does not introduce any invented metrics,
 * employers, dates, or credentials not already present in the user's input.
 */
export function verifyTruthfulness(
  input: string,
  output: string,
  allowedContext = ""
): GuardResult {
  const violations: string[] = [];

  const combinedAllowed = `${input} ${allowedContext}`.toLowerCase();
  const outputLower = output.toLowerCase();

  // 1. NUMBER / METRIC CHECK
  const inputNumbers = new Set(extractNumbers(combinedAllowed));
  const outputNumbers = extractNumbers(output);

  for (const num of outputNumbers) {
    // Single digit numbers 0-9 that could be written as words are allowed if context supports
    const pureNum = num.replace(/[^\d.]/g, "");
    if (pureNum.length === 1 && !num.includes("%") && !num.includes("$")) {
      continue;
    }

    if (!inputNumbers.has(num)) {
      violations.push(`Invented metric or number: "${num}"`);
    }
  }

  // 2. YEAR / DATE CHECK
  const inputYears = new Set(extractYears(combinedAllowed));
  const outputYears = extractYears(output);

  for (const year of outputYears) {
    if (!inputYears.has(year)) {
      violations.push(`Invented calendar year: "${year}"`);
    }
  }

  // 3. EMPLOYER HALLUCINATION CHECK
  for (const company of HALLUCINATED_COMPANY_WATCHLIST) {
    const companyRegex = new RegExp(`\\b${company}\\b`, "i");
    if (companyRegex.test(outputLower) && !companyRegex.test(combinedAllowed)) {
      violations.push(`Invented employer/company: "${company.toUpperCase()}"`);
    }
  }

  // 4. DEGREE CREDENTIAL CHECK
  for (const degreeRegex of DEGREE_PATTERNS) {
    const outputMatch = output.match(degreeRegex);
    if (outputMatch) {
      const inputMatch = combinedAllowed.match(degreeRegex);
      if (!inputMatch) {
        violations.push(`Invented degree credential: "${outputMatch[0]}"`);
      }
    }
  }

  const isTruthful = violations.length === 0;

  return {
    isTruthful,
    violations,
    cleanOutput: isTruthful ? output : undefined,
    feedbackMessage: isTruthful
      ? "Suggestion verified: 100% truthful to your real experience."
      : `AI attempted to introduce unverified facts (${violations.join("; ")}). Discarded to maintain truthfulness.`,
  };
}
