import { generateResumeDocxBlob } from "../export/docxExport";
import { exportToTxt } from "../export/txtExport";
import { verifyResumeReadingOrder } from "../export/pdfVerification";
import { sampleResume } from "@/types/resume";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

async function runTests() {
  console.log("Running Phase 6 Export Suite Unit Tests...\n");

  // 1. DOCX Generation Tests
  const docxBlob = await generateResumeDocxBlob(sampleResume, { pageSize: "A4" });
  assert(Boolean(docxBlob), "generateResumeDocxBlob returns a valid Blob");
  assert(docxBlob.size > 2000, `DOCX Blob size is realistic (${docxBlob.size} bytes)`);
  assert(
    docxBlob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    `MIME type matches Word standard: ${docxBlob.type}`
  );

  const letterBlob = await generateResumeDocxBlob(sampleResume, { pageSize: "Letter" });
  assert(letterBlob.size > 2000, `US Letter DOCX Blob generated successfully (${letterBlob.size} bytes)`);

  // 2. Plain Text (.txt) Generation Tests
  const txtOutput = exportToTxt(sampleResume);
  assert(typeof txtOutput === "string" && txtOutput.length > 300, "Generates plain text output string");
  assert(txtOutput.includes(sampleResume.basics.name.toUpperCase()), "Plain text includes candidate name in uppercase");
  assert(txtOutput.includes(sampleResume.basics.email), "Plain text includes candidate email");
  assert(txtOutput.includes("WORK EXPERIENCE"), "Plain text contains WORK EXPERIENCE divider");
  assert(txtOutput.includes("TECHNICAL SKILLS"), "Plain text contains TECHNICAL SKILLS divider");
  assert(txtOutput.includes("•"), "Plain text contains bullet points (•)");

  // 3. ATS Readability & Heading Order Verification Tests
  const cleanCheck = verifyResumeReadingOrder(sampleResume);
  assert(cleanCheck.passed, "Sample resume passes ATS readability verification");
  assert(cleanCheck.score === 100, "Clean resume scores 100 on readability check");
  assert(cleanCheck.nameFound, "Candidate name verified at top");
  assert(cleanCheck.emailFound, "Email verified in contact block");
  assert(cleanCheck.headingsInOrder, "Headings verified in linear sequential order");

  // Missing name check
  const brokenResume = JSON.parse(JSON.stringify(sampleResume));
  brokenResume.basics.name = "";
  const missingNameCheck = verifyResumeReadingOrder(brokenResume);
  assert(!missingNameCheck.passed, "Readability check fails when candidate name is missing");
  assert(missingNameCheck.problems.some((p) => p.includes("name")), "Flags missing candidate name");

  // Hidden core sections check
  const hiddenExpResume = JSON.parse(JSON.stringify(sampleResume));
  hiddenExpResume.meta.hiddenSections = ["experience"];
  const hiddenCheck = verifyResumeReadingOrder(hiddenExpResume);
  assert(!hiddenCheck.passed, "Readability check fails when core experience section is hidden");

  // 4. Base Resume Non-Destruction Check
  const snapshotBefore = JSON.stringify(sampleResume);
  await generateResumeDocxBlob(sampleResume);
  exportToTxt(sampleResume);
  verifyResumeReadingOrder(sampleResume);
  const snapshotAfter = JSON.stringify(sampleResume);
  assert(snapshotBefore === snapshotAfter, "Resume data is strictly immutable across all export operations");

  console.log("\nExport Suite: All tests passed cleanly!\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
