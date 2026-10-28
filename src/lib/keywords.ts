import type { Resume } from "@/types/resume";
import { getFlatSkills } from "@/lib/schema";

export const COMMON_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "arent", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "dont", "down", "during",
  "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here",
  "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isnt", "it",
  "its", "itself", "just", "me", "more", "most", "must", "my", "myself", "no", "nor", "not", "of",
  "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own",
  "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who",
  "whom", "why", "with", "wont", "would", "you", "your", "yours", "yourself", "yourselves",
  "will", "shall", "may", "might", "must", "across", "along", "behind", "around", "within", "without",
  "candidate", "candidates", "applicant", "applicants", "role", "position", "job", "responsibilities",
  "requirements", "qualifications", "preferred", "plus", "experience", "years", "working", "work",
  "team", "teams", "ability", "strong", "good", "great", "excellent", "looking", "join", "help",
  "opportunity", "opportunities", "company", "day", "days", "ideal", "successful", "must-have"
]);

export const BUILTIN_TECH_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "golang", "go", "rust", "ruby",
  "php", "swift", "kotlin", "scala", "sql", "nosql", "postgresql", "postgres", "mysql", "mongodb",
  "redis", "elasticsearch", "react", "react.js", "next.js", "vue", "angular", "node.js", "node",
  "express", "fastapi", "django", "flask", "spring", "spring boot", "graphql", "rest", "restful", "api", "apis",
  "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp", "google cloud",
  "terraform", "ansible", "ci/cd", "github actions", "gitlab", "jenkins", "git", "linux", "unix",
  "microservices", "distributed systems", "system design", "html", "html5", "css", "css3",
  "tailwind", "tailwindcss", "redux", "zustand", "jest", "cypress", "playwright", "unit testing",
  "agile", "scrum", "jira", "kafka", "rabbitmq", "data engineering", "machine learning", "ai",
  "llm", "prompt engineering", "devops", "cloud computing", "security", "oauth", "jwt"
];

/**
 * Extracts normalized tokens and 2-word phrases from text.
 */
export function extractKeywordsFromJd(jd: string): string[] {
  if (!jd || !jd.trim()) return [];

  const normalized = jd.toLowerCase();
  
  // Clean punctuation while preserving meaningful tech punctuation like +, #, ., /
  const cleaned = normalized.replace(/[^a-z0-9+#./\s-]/g, " ");
  const rawWords = cleaned.split(/\s+/).map((w) => w.trim()).filter((w) => w.length > 1);

  const filteredWords = rawWords.filter((w) => !COMMON_STOP_WORDS.has(w));

  // Count single words
  const frequencyMap = new Map<string, number>();
  for (const word of filteredWords) {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  // Count 2-word phrases
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (!COMMON_STOP_WORDS.has(w1) && !COMMON_STOP_WORDS.has(w2)) {
      const bigram = `${w1} ${w2}`;
      frequencyMap.set(bigram, (frequencyMap.get(bigram) || 0) + 1);
    }
  }

  const keywordsSet = new Set<string>();

  // Rule 1: Keep single words and 2-word phrases appearing at least twice
  for (const [phrase, count] of frequencyMap.entries()) {
    if (count >= 2 && phrase.length > 2) {
      keywordsSet.add(phrase);
    }
  }

  // Rule 2: Check against built-in tech skills list
  for (const skill of BUILTIN_TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(normalized)) {
      keywordsSet.add(skill);
    }
  }

  return Array.from(keywordsSet).sort();
}

/**
 * Compares JD keywords against the entire text content of a resume.
 */
export function matchKeywordsWithResume(
  keywords: string[],
  resume: Resume
): {
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  matchPercentage: number;
} {
  if (!keywords || keywords.length === 0) {
    return { matchedKeywords: [], missingKeywords: [], totalKeywords: 0, matchPercentage: 0 };
  }

  // Create unified searchable resume corpus
  const flatSkills = getFlatSkills(resume.skills);
  const headline = resume.basics.headline || resume.basics.title || "";
  const resumeTextParts: string[] = [
    resume.basics.name || "",
    headline,
    resume.basics.summary || resume.summary || "",
    resume.basics.location || "",
    ...flatSkills,
    ...resume.experience.map((e) => `${e.company} ${e.role} ${e.bullets.join(" ")}`),
    ...resume.education.map((ed) => `${ed.school} ${ed.degree} ${ed.year || ed.end || ""}`),
    ...(resume.projects || []).map((p) => `${p.name} ${p.tech.join(" ")} ${p.bullets.join(" ")}`),
  ];

  const resumeCorpus = resumeTextParts.join(" ").toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(resumeCorpus) || resumeCorpus.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const total = keywords.length;
  const matchPercentage = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  return {
    matchedKeywords: matched,
    missingKeywords: missing,
    totalKeywords: total,
    matchPercentage,
  };
}
