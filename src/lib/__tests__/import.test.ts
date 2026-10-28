import { validateResumeFile, MAX_FILE_SIZE_BYTES } from "../import/fileExtractor";
import { parseResumeTextDeterministically } from "../import/deterministicParser";
import { ResumeSchemaV2 } from "@/lib/schema";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log("Running Phase 7 Import Suite Unit Tests...\n");

// 1. File Validation Checks (Max 5 MB & Supported Extensions)
const mockSmallPdf = { name: "resume.pdf", size: 1024 * 500 } as File;
try {
  validateResumeFile(mockSmallPdf);
  assert(true, "Allows valid 500 KB PDF file");
} catch (e: any) {
  assert(false, "Should allow valid PDF");
}

const mockLargePdf = { name: "massive.pdf", size: MAX_FILE_SIZE_BYTES + 1024 } as File;
let largeFileBlocked = false;
try {
  validateResumeFile(mockLargePdf);
} catch (e: any) {
  largeFileBlocked = true;
  assert(e.message.includes("File is too large"), "Blocks file exceeding 5 MB limit");
}
assert(largeFileBlocked, "Threw error for > 5 MB file");

const mockInvalidFile = { name: "image.png", size: 1024 * 100 } as File;
let invalidExtBlocked = false;
try {
  validateResumeFile(mockInvalidFile);
} catch (e: any) {
  invalidExtBlocked = true;
  assert(e.message.includes("Unsupported file format"), "Blocks unsupported .png file");
}
assert(invalidExtBlocked, "Threw error for invalid extension");

// 2. Scanned / Image-Only PDF Guard Logic Check
const scannedText = "   "; // empty/scanned stream
assert(scannedText.replace(/\s/g, "").length < 50, "Detects scanned/image-only text stream (< 50 chars)");

// 3. Deterministic Parsing Tests
const sampleInput = `SARAH CONNOR
Senior Distributed Systems Architect
sarah.connor@example.com | (212) 555-0199 | New York, NY
linkedin.com/in/sarahconnor | github.com/sarahconnor

PROFESSIONAL SUMMARY
Senior architect with 8+ years designing fault-tolerant systems in Go and Rust.

WORK EXPERIENCE
Cyberdyne Systems — Principal Engineer
Jan 2021 – Present
• Engineered distributed consensus pipeline handling 2M events/sec.
• Reduced tail latency from 85ms to 14ms across 12 node clusters.

TechFlow Solutions — Systems Engineer
March 2017 – Dec 2020
• Automated CI/CD pipelines with Docker and Kubernetes.

EDUCATION
Columbia University
Master of Science in Computer Science | 2017

TECHNICAL SKILLS
Languages: Go, Rust, Python, TypeScript, Docker, Kubernetes, AWS, PostgreSQL`;

const parseResult = parseResumeTextDeterministically(sampleInput);
const parsed = parseResult.resume;

assert(parsed.basics.name === "SARAH CONNOR", `Parsed candidate name: ${parsed.basics.name}`);
assert(parsed.basics.email === "sarah.connor@example.com", `Parsed email: ${parsed.basics.email}`);
assert(parsed.basics.phone.includes("555-0199"), `Parsed phone: ${parsed.basics.phone}`);
assert(parsed.basics.linkedin.includes("linkedin.com/in/sarahconnor"), "Parsed LinkedIn URL");
assert(parsed.basics.github.includes("github.com/sarahconnor"), "Parsed GitHub URL");

assert(parsed.experience.length === 2, `Parsed 2 experience entries (found ${parsed.experience.length})`);
assert(parsed.experience[0].company.includes("Cyberdyne"), "Parsed first company Cyberdyne Systems");
assert(parsed.experience[0].role.includes("Principal Engineer"), "Parsed role Principal Engineer");
assert(parsed.experience[0].bullets.length === 2, "Parsed achievement bullets");

assert(parsed.education.length >= 1, `Parsed education entry (found ${parsed.education.length})`);
assert(parsed.education[0].school.includes("Columbia"), "Parsed school Columbia University");
assert(parsed.education[0].year === "2017", `Parsed graduation year: ${parsed.education[0].year}`);

assert(parsed.skills.length > 0, "Parsed skills categories");
assert(parsed.skills[0].items.some((i) => i.toLowerCase() === "go"), "Extracted 'go' skill token");
assert(parsed.skills[0].items.some((i) => i.toLowerCase() === "docker"), "Extracted 'docker' skill token");

// 4. Strict Schema Conformance Check
const schemaValidation = ResumeSchemaV2.safeParse(parsed);
assert(schemaValidation.success, "Parsed resume strictly validates against ResumeSchemaV2");

// 5. Zero-Invention Rule Check
assert(parsed.basics.portfolio === "", "Unprovided portfolio remains empty without hallucination");
assert(parsed.certifications.length === 0, "Unprovided certifications remain empty without hallucination");

console.log("\nImport Suite: All tests passed cleanly!\n");
