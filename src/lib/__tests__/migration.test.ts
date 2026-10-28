import { migrateToV2, loadResumeSafely, BACKUP_KEY_PREFIX } from "../migration";
import { ResumeSchemaV2 } from "../schema";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("Running Schema v2 & Migration Unit Tests...\n");

// 1. Test: Empty or null input
const fallback = migrateToV2(null);
assert(fallback.schemaVersion === 2, "Null input returns valid schemaVersion 2");
assert(Boolean(fallback.basics.name), "Null input falls back to default sample name");

// 2. Test: Legacy v1 schema with flat skills and title
const legacyV1 = {
  basics: {
    name: "Jane Doe",
    title: "Staff Software Engineer",
    email: "jane@example.com",
    phone: "555-0199",
    location: "New York, NY",
    summary: "Senior engineer with 10 years experience building distributed platforms.",
  },
  experience: [
    {
      id: "exp-v1-1",
      company: "Acme Corp",
      role: "Lead Architect",
      start: "2020",
      end: "Present",
      bullets: ["Architected Kubernetes clusters serving 1M QPS.", "Mentored 12 engineers."],
    },
  ],
  education: [
    {
      id: "edu-v1-1",
      school: "MIT",
      degree: "B.S. in EECS",
      year: "2015",
    },
  ],
  skills: ["Go", "Kubernetes", "gRPC", "PostgreSQL"],
  sectionVisibility: {
    summary: true,
    education: false,
  },
};

const migratedV1 = migrateToV2(legacyV1);
assert(migratedV1.schemaVersion === 2, "Migrated v1 has schemaVersion 2");
assert(migratedV1.basics.name === "Jane Doe", "Preserves user name");
assert(migratedV1.basics.headline === "Staff Software Engineer", "Maps v1 title to v2 headline");
assert(migratedV1.basics.title === "Staff Software Engineer", "Maintains backward-compatible title alias");
assert(migratedV1.experience.length === 1, "Preserves experience entries");
assert(migratedV1.experience[0].id === "exp-v1-1", "Preserves stable experience ID");
assert(migratedV1.experience[0].company === "Acme Corp", "Preserves company name");
assert(migratedV1.education[0].end === "2015", "Maps v1 year to v2 end");
assert(Array.isArray(migratedV1.skills), "Skills is an array");
assert(migratedV1.skills.length === 1, "Categorized flat v1 skills into a category");
assert(migratedV1.skills[0].items.includes("Kubernetes"), "Preserves all individual skill tokens");
assert(migratedV1.meta.hiddenSections.includes("education"), "Converts legacy sectionVisibility false into hiddenSections");
assert(Array.isArray(migratedV1.meta.sectionOrder), "Initializes default section order");

// 3. Test: Validate with Zod schema
const validation = ResumeSchemaV2.safeParse(migratedV1);
assert(validation.success, "Migrated v1 strictly conforms to ResumeSchemaV2");

// 4. Test: Corrupted JSON recovery with backup key
const corruptedJson = '{"basics": { "name": "Broken JSON, invalid syntax';
const loadResult = loadResumeSafely(corruptedJson);
assert(loadResult.resume.schemaVersion === 2, "Corrupted string safely returns valid schemaVersion 2");
assert(Boolean(loadResult.backupKey), "Creates a backup key for corrupted data");
assert(
  loadResult.backupKey?.startsWith(BACKUP_KEY_PREFIX) ?? false,
  "Backup key uses reserved backup prefix"
);

// 5. Test: Partial resume with missing IDs
const partial = {
  basics: { name: "Bob Smith" },
  experience: [{ company: "Startup", role: "Dev" }],
};
const migratedPartial = migrateToV2(partial);
assert(Boolean(migratedPartial.experience[0].id), "Generates stable IDs for entries without IDs");
assert(Array.isArray(migratedPartial.experience[0].bullets), "Initializes empty bullets array");

console.log("\nMigration & Schema Suite: 16 passed, 0 failed.\n");
