import { extractKeywordsFromJd, matchKeywordsWithResume } from "../keywords";
import { migrateToV2 } from "../migration";
import type { Resume } from "@/types/resume";

const mockResume: Resume = migrateToV2({
  basics: {
    name: "Jane Doe",
    title: "Senior Full Stack Engineer",
    email: "jane@example.com",
    phone: "555-0100",
    location: "New York, NY",
    summary: "Experienced developer building React, TypeScript, and Node.js microservices with Docker.",
  },
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      role: "Lead Developer",
      start: "2021",
      end: "Present",
      bullets: [
        "Architected high-throughput REST APIs using PostgreSQL and Redis.",
        "Deployed containerized apps to AWS using CI/CD pipelines.",
      ],
    },
  ],
  education: [
    {
      id: "1",
      school: "MIT",
      degree: "Computer Science",
      year: "2020",
    },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"],
});

export function runKeywordsTests() {
  console.log("Running Keyword Helper Unit Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Empty text handling
  const emptyKeywords = extractKeywordsFromJd("");
  assert(emptyKeywords.length === 0, "Empty JD returns empty keyword list");

  // Test 2: Extraction of built-in skills
  const jdWithSkills = "We are seeking a React and TypeScript engineer who knows Docker and AWS.";
  const extractedSkills = extractKeywordsFromJd(jdWithSkills);
  assert(extractedSkills.includes("react"), "Detects 'react' from built-in skill dictionary");
  assert(extractedSkills.includes("typescript"), "Detects 'typescript' from built-in skill dictionary");
  assert(extractedSkills.includes("docker"), "Detects 'docker' from built-in skill dictionary");
  assert(extractedSkills.includes("aws"), "Detects 'aws' from built-in skill dictionary");

  // Test 3: Common repeated words that are not skills but are emphasized
  const jdWithFrequencies =
    "Must have deep distributed systems background. We scale distributed systems to millions. distributed systems architecture is key.";
  const extractedFrequencies = extractKeywordsFromJd(jdWithFrequencies);
  assert(
    extractedFrequencies.some((k) => k.includes("distributed")),
    "Extracts repeating keyword phrases with count >= 2"
  );

  // Test 4: Keyword matching against mock resume
  const matchResult = matchKeywordsWithResume(
    ["react", "typescript", "rust", "kubernetes"],
    mockResume
  );
  assert(matchResult.matchedKeywords.includes("react"), "Correctly matches 'react' present in resume");
  assert(matchResult.matchedKeywords.includes("typescript"), "Correctly matches 'typescript' present in resume");
  assert(matchResult.totalKeywords === 4, "Total keyword count matches input length");
  assert(matchResult.matchPercentage === 50, "Calculates accurate match percentage (2/4 = 50%)");
  assert(matchResult.missingKeywords.includes("rust"), "Correctly identifies 'rust' as missing keyword");
  assert(matchResult.missingKeywords.includes("kubernetes"), "Correctly identifies 'kubernetes' as missing keyword");

  // Test 5: Full match scenario
  const fullMatch = matchKeywordsWithResume(["react", "docker"], mockResume);
  assert(fullMatch.matchPercentage === 100, "100% match when all JD skills are in resume");

  console.log(`\nTest Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

// Auto-run if executed directly via tsx
if (require.main === module) {
  runKeywordsTests();
}
