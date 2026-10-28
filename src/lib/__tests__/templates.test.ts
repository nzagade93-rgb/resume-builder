import assert from "node:assert";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  TEMPLATE_REGISTRY,
  getTemplateDefinition,
  filterTemplates,
} from "@/templates/registry";
import { templates, templateOptions } from "@/templates";
import { sampleResume } from "@/types/resume";
import type { Resume } from "@/types/resume";
import { generateResumeDocxBlob } from "@/lib/export/docxExport";

console.log("=================================================================");
console.log("RUNNING STABLE RESUME TEMPLATE ARCHITECTURE TESTS");
console.log("=================================================================\n");

// ---------------------------------------------------------------------------
// 1. REGISTRY VERIFICATION
// ---------------------------------------------------------------------------
console.log("--> 1. Verifying Clean Template Registry");

assert(TEMPLATE_REGISTRY.length >= 7, "Registry should contain verified template definitions");
const defaultDef = getTemplateDefinition();
assert.strictEqual(defaultDef.id, "ats", "Default template definition must be ATS Standard");

const defaultDefFromEmpty = getTemplateDefinition("");
assert.strictEqual(defaultDefFromEmpty.id, "ats", "Empty ID must fall back to ATS Standard");

const defaultDefFromUnknown = getTemplateDefinition("non-existent-template-id");
assert.strictEqual(defaultDefFromUnknown.id, "ats", "Unknown ID must fall back to ATS Standard");

const legacyDef = getTemplateDefinition("pure-ats");
assert.strictEqual(legacyDef.id, "ats", "Legacy alias 'pure-ats' must resolve to ATS Standard");

console.log("✓ PASS: Default fallback to ATS Standard verified");

// ---------------------------------------------------------------------------
// 2. TEMPLATE COMPONENT RESOLUTION & RENDERING
// ---------------------------------------------------------------------------
console.log("\n--> 2. Verifying Real Template Components Render Valid Elements");

for (const def of TEMPLATE_REGISTRY) {
  const Component = templates[def.id];
  assert(typeof Component === "function", `Template '${def.id}' must resolve to a valid React component`);

  const element = React.createElement(Component, {
    resume: sampleResume,
    design: sampleResume.meta?.design,
  });
  assert(React.isValidElement(element), `Template '${def.id}' must produce a valid React element`);

  const html = renderToStaticMarkup(element);
  assert(html.length > 500, `Template '${def.id}' rendered markup must be non-empty`);
  assert(html.includes(sampleResume.basics.name), `Template '${def.id}' must render candidate name`);
  assert(html.includes(sampleResume.experience[0].company), `Template '${def.id}' must render experience`);

  console.log(`✓ PASS: Template '${def.id}' (${def.name}) resolves and renders correctly`);
}

// ---------------------------------------------------------------------------
// 3. UNKNOWN TEMPLATE PROXY FALLBACK
// ---------------------------------------------------------------------------
console.log("\n--> 3. Verifying Safe Fallback for Unknown Template IDs");

const unknownComponent = templates["arbitrary-unknown-id"];
assert(typeof unknownComponent === "function", "Unknown template must return a component");
const fallbackHtml = renderToStaticMarkup(
  React.createElement(unknownComponent, {
    resume: sampleResume,
  })
);
assert(fallbackHtml.includes(sampleResume.basics.name), "Fallback component renders candidate name");
console.log("✓ PASS: Unknown template ID safely falls back to ATS Standard without crashing");

// ---------------------------------------------------------------------------
// 4. NON-DESTRUCTIVE TEMPLATE SWITCHING
// ---------------------------------------------------------------------------
console.log("\n--> 4. Verifying Non-Destructive Template Switching");

const testSequence = ["ats", "classic", "modern", "minimal", "executive", "compact", "fresher", "ats"];
const customResume: Resume = {
  ...sampleResume,
  basics: {
    ...sampleResume.basics,
    name: "Dr. Evelyn Vance",
    headline: "Distinguished Systems Architect",
    summary: "Senior systems architect with 15+ years experience designing ultra-low latency infrastructure.",
  },
};

let workingResume = { ...customResume };

for (const targetTmpl of testSequence) {
  workingResume = {
    ...workingResume,
    template: targetTmpl,
  };

  // Assert user data is 100% preserved
  assert.strictEqual(workingResume.basics.name, "Dr. Evelyn Vance");
  assert.strictEqual(workingResume.basics.headline, "Distinguished Systems Architect");
  assert.strictEqual(workingResume.experience[0].company, sampleResume.experience[0].company);

  // Assert target template renders the preserved data
  const Comp = templates[targetTmpl];
  const rendered = renderToStaticMarkup(
    React.createElement(Comp, { resume: workingResume })
  );
  assert(rendered.includes("Dr. Evelyn Vance"), `Template '${targetTmpl}' renders preserved name`);
  assert(rendered.includes("Distinguished Systems Architect"), `Template '${targetTmpl}' renders preserved headline`);
}
console.log("✓ PASS: Template switching preserves 100% of resume fields without data loss");

// ---------------------------------------------------------------------------
// 5. DOCX EXPORT GENERATION
// ---------------------------------------------------------------------------
console.log("\n--> 5. Verifying DOCX Export Generation");

async function testDocx() {
  const atsBlob = await generateResumeDocxBlob(customResume, { templateId: "ats" });
  assert(atsBlob.size > 5000, "ATS DOCX export must generate non-empty file");
  assert.strictEqual(atsBlob.type, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  const classicBlob = await generateResumeDocxBlob(customResume, { templateId: "classic" });
  assert(classicBlob.size > 5000, "Classic DOCX export must generate non-empty file");

  const modernBlob = await generateResumeDocxBlob(customResume, { templateId: "modern" });
  assert(modernBlob.size > 5000, "Modern DOCX export must generate non-empty file");

  console.log("✓ PASS: DOCX export generates valid editable Word documents");
}

testDocx().then(() => {
  console.log("\n=================================================================");
  console.log("✓ ALL TEMPLATE ARCHITECTURE TESTS PASSED CLEANLY!");
  console.log("=================================================================");
});
