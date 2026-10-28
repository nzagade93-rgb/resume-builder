import { parseJobDescription, findKeywordLocationsInResume, analyzeJdMatch } from "../tailor/jdAnalysis";
import { sampleResume } from "@/types/resume";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log("Running Phase 5 JD Analysis & Location Unit Tests...\n");

// 1. Seniority Detection Tests
const seniorJd = "We are seeking a Senior Backend Engineer to build APIs...";
const parsedSenior = parseJobDescription(seniorJd);
assert(parsedSenior.seniority === "Senior", "Detects Senior seniority level");

const staffJd = "Looking for a Staff Software Architect to drive technical strategy...";
const parsedStaff = parseJobDescription(staffJd);
assert(parsedStaff.seniority === "Lead / Staff", "Detects Lead / Staff seniority level");

const internJd = "Join us as a Software Engineering Intern for Summer 2025...";
const parsedIntern = parseJobDescription(internJd);
assert(parsedIntern.seniority === "Intern", "Detects Intern seniority level");

// 2. Company & Role Extraction
const stripeJd = `Senior Full Stack Engineer at Stripe
San Francisco, CA

About the role:
Build payment infrastructure.`;
const parsedStripe = parseJobDescription(stripeJd);
assert(parsedStripe.role === "Senior Full Stack Engineer", "Extracts role 'Senior Full Stack Engineer'");
assert(parsedStripe.company === "Stripe", "Extracts company 'Stripe'");

// 3. Keyword Location Tracking in Sample Resume
const reactLocations = findKeywordLocationsInResume("react", sampleResume);
assert(reactLocations.length > 0, "Finds 'react' in sample resume");
assert(
  reactLocations.some((loc) => loc.includes("Experience") || loc.includes("Skills")),
  `Resolved exact location for react: ${reactLocations.join(", ")}`
);

const dockerLocations = findKeywordLocationsInResume("docker", sampleResume);
assert(dockerLocations.length > 0, "Finds 'docker' in sample resume");

// 4. Adjacent "True-Sounding" Opportunities
const sampleWithReactOnly = JSON.parse(JSON.stringify(sampleResume));
// Target JD asks for React (present), Redux (adjacent to React), and Rust (unfamiliar gap)
const techJd = `Looking for an engineer proficient in React, Redux, and Rust.`;
const report = analyzeJdMatch(techJd, sampleWithReactOnly);

assert(report.matchedKeywords.some((k) => k.keyword === "react"), "Matches 'react' as present");
assert(
  report.trueSoundingKeywords.some((k) => k.keyword === "redux"),
  "Categorizes adjacent Redux as true-sounding opportunity (amber)"
);
assert(
  report.missingGaps.some((k) => k.keyword === "rust"),
  "Categorizes unfamiliar Rust as missing gap (red)"
);

// 5. Score Ring Computation
assert(report.score > 0 && report.score <= 100, `Calculates match percentage score: ${report.score}%`);

console.log("\nJD Analysis Suite: All tests passed cleanly!\n");
