import { runAtsChecker } from "../ats/checker";
import { sampleResume } from "@/types/resume";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log("Running Phase 5 ATS Checker Unit Tests...\n");

// 1. Clean Sample Resume Check
const initialResult = runAtsChecker(sampleResume);
assert(initialResult.score >= 80, `Sample resume scores well: ${initialResult.score}/100`);
assert(initialResult.rating === "Good" || initialResult.rating === "Excellent", "Sample resume rating is Good/Excellent");
assert(initialResult.summary.passedCount > 0, "Contains passed verification checks");

// 2. Critical Missing Candidate Name & Invalid Email
const brokenResume = JSON.parse(JSON.stringify(sampleResume));
brokenResume.basics.name = "";
brokenResume.basics.email = "not-an-email";

const brokenResult = runAtsChecker(brokenResume);
assert(brokenResult.issues.some((i) => i.id === "contact-name" && i.severity === "critical"), "Flags missing candidate name as critical");
assert(brokenResult.issues.some((i) => i.id === "contact-email" && i.severity === "critical"), "Flags invalid email as critical");
assert(brokenResult.score < initialResult.score, "Severe score reduction for missing critical contact info");

// 3. Weak / Passive Phrase Detection
const passiveResume = JSON.parse(JSON.stringify(sampleResume));
passiveResume.experience[0].bullets[0] = "Responsible for building UI components and helped with database migrations.";

const passiveResult = runAtsChecker(passiveResume);
assert(
  passiveResult.issues.some((i) => i.id === "weak-phrases"),
  "Detects 'responsible for' and flags weak/passive phrasing"
);

// 4. Repeated Action Verbs Detection
const repeatedVerbResume = JSON.parse(JSON.stringify(sampleResume));
repeatedVerbResume.experience[0].bullets = [
  "Led the engineering initiative for payment processing.",
  "Led cross-functional sprint planning sessions weekly.",
  "Led database partitioning across distributed clusters.",
  "Led frontend optimization reducing page load time.",
];

const repeatedResult = runAtsChecker(repeatedVerbResume);
assert(
  repeatedResult.issues.some((i) => i.id === "repeated-verbs"),
  "Detects repeated action verb 'led' used 4 times"
);

// 5. Bullet Length Checks
const bulletLengthResume = JSON.parse(JSON.stringify(sampleResume));
bulletLengthResume.experience[0].bullets = [
  "Fixed bugs.", // < 7 words
  "This is a massive paragraph bullet point that goes on and on and on without ever coming to a clean point and contains more than forty individual words in order to trigger the run-on bullet point warning for automated ATS checkers today.", // > 40 words
];

const bulletLengthResult = runAtsChecker(bulletLengthResume);
assert(
  bulletLengthResult.issues.some((i) => i.id === "bullets-short"),
  "Detects one-liner bullet point under 7 words"
);
assert(
  bulletLengthResult.issues.some((i) => i.id === "bullets-long"),
  "Detects run-on bullet point over 40 words"
);

// 6. Issue Sorting Order Verification
assert(
  brokenResult.issues[0].severity === "critical",
  "Critical issues are prioritized at the top of the list"
);

console.log("\nATS Checker Suite: All tests passed cleanly!\n");
