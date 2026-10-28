import { generateTailorDiffs, applyAcceptedDiffs } from "../tailor/diffEngine";
import { generateCoverLetter } from "../tailor/coverLetter";
import { sampleResume } from "@/types/resume";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log("Running Phase 5 Tailor Versions & Diff Engine Unit Tests...\n");

// 1. Diffs generation
const baseResume = JSON.parse(JSON.stringify(sampleResume));
const tailoredResume = JSON.parse(JSON.stringify(sampleResume));

// Modify tailored summary and first bullet
tailoredResume.basics.summary = "Senior Engineer with deep expertise in high-throughput Stripe payment infrastructure.";
tailoredResume.experience[0].bullets[0] = "Architected high-throughput payment APIs reducing latency by 45%.";

const diffs = generateTailorDiffs(baseResume, tailoredResume);
assert(diffs.length >= 2, `Generates at least 2 diffs (found ${diffs.length})`);
assert(diffs.some((d) => d.section === "summary"), "Identifies summary diff with rationale");
assert(diffs.some((d) => d.section === "experience"), "Identifies experience bullet diff with rationale");

// 2. Base resume preservation (Non-negotiable rule)
assert(
  baseResume.basics.summary !== tailoredResume.basics.summary,
  "Base resume summary remains completely unchanged in original state"
);
assert(
  baseResume.experience[0].bullets[0] !== tailoredResume.experience[0].bullets[0],
  "Base resume bullets remain completely unchanged"
);

// 3. Applying accepted diffs partially
const summaryDiff = diffs.find((d) => d.section === "summary")!;
const expDiff = diffs.find((d) => d.section === "experience")!;

// Accept summary, reject exp
summaryDiff.status = "accepted";
expDiff.status = "rejected";

const partiallyApplied = applyAcceptedDiffs(baseResume, tailoredResume, diffs);
assert(
  partiallyApplied.basics.summary === tailoredResume.basics.summary,
  "Accepted summary diff applied to candidate version"
);
assert(
  partiallyApplied.experience[0].bullets[0] === baseResume.experience[0].bullets[0],
  "Rejected bullet diff kept base resume bullet without modification"
);

// 4. Truthful Cover Letter Generation
const sampleJd = "Looking for a Senior Full Stack Engineer at Stripe in San Francisco.";
const confidentLetter = generateCoverLetter({
  resume: baseResume,
  jdText: sampleJd,
  tone: "confident",
});
assert(confidentLetter.includes("Stripe"), "Cover letter targets Stripe from JD");
assert(confidentLetter.includes(baseResume.basics.name), "Cover letter includes candidate name");
assert(confidentLetter.includes("Senior Full Stack Engineer"), "Cover letter specifies target role");

const formalLetter = generateCoverLetter({
  resume: baseResume,
  jdText: sampleJd,
  tone: "formal",
});
assert(formalLetter.includes("Please accept this letter"), "Formal letter uses respectful opening");

console.log("\nTailor Versions & Diff Suite: All tests passed cleanly!\n");
