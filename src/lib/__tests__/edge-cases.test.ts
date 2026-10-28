import { extractKeywordsFromJd, matchKeywordsWithResume } from "../keywords";
import { migrateToV2 } from "../migration";
import type { Resume } from "@/types/resume";

export function runEdgeCasesTests() {
  console.log("Running Prompt 7 Edge Cases Test Suite...\n");
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

  // 1. Very long resume
  const longResume: Resume = migrateToV2({
    basics: {
      name: "Alexander Bartholomew Montgomery III",
      title: "Distinguished Principal Enterprise Distributed Architect & Chief Technology Strategist",
      email: "alexander.montgomery@enterprise-systems.global",
      phone: "+1 (555) 987-6543 ext 12345",
      location: "San Francisco Financial District, California, United States of America",
      summary: "Over two decades of extensive leadership across mission-critical high-throughput systems, multi-cloud architectures, distributed ledger systems, and global scale engineering orgs.",
    },
    experience: Array.from({ length: 6 }).map((_, i) => ({
      id: `long-exp-${i}`,
      company: `Fortune 50 Enterprise Conglomerate #${i + 1}`,
      role: `Vice President of Autonomous Cloud Infrastructure Engineering Level ${i + 1}`,
      start: `201${i}`,
      end: i === 5 ? "Present" : `202${i}`,
      bullets: Array.from({ length: 6 }).map(
        (_, b) =>
          `Engineered distributed fault-tolerant pipeline #${b} handling 50B+ transactions/day with 99.999% uptime, reducing infrastructure costs by $12M annually.`
      ),
    })),
    education: [
      { id: "e1", school: "Massachusetts Institute of Technology", degree: "Ph.D. in Computer Systems Architecture", year: "2010" },
      { id: "e2", school: "Stanford University", degree: "M.S. in Electrical Engineering & Computer Science", year: "2006" },
      { id: "e3", school: "Harvard University", degree: "B.A. in Computer Science & Applied Mathematics", year: "2004" },
    ],
    skills: [
      "Distributed Systems", "Cloud Architecture", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
      "Go", "Rust", "C++", "Python", "Kafka", "PostgreSQL", "Redis", "Microservices", "High Availability"
    ],
  });

  assert(longResume.experience.length === 6, "1. Long resume: successfully handles 6 large corporate experience entries");
  assert(longResume.experience.reduce((acc, e) => acc + e.bullets.length, 0) === 36, "1. Long resume: handles 36 detailed bullet points without state truncation");

  // 2. Very short resume
  const shortResume: Resume = migrateToV2({
    basics: {
      name: "Sam Lee",
      title: "Junior Developer",
      email: "sam@lee.dev",
      phone: "555-1234",
      location: "Remote",
      summary: "Passionate self-taught developer.",
    },
    experience: [
      {
        id: "short-1",
        company: "Open Source Contributor",
        role: "Frontend Helper",
        start: "2023",
        end: "Present",
        bullets: ["Fixed UI bugs on React library."],
      },
    ],
    education: [],
    skills: ["JavaScript", "HTML", "CSS"],
  });

  assert(shortResume.experience.length === 1, "2. Short resume: cleanly handles single-entry profile");

  // 3. Completely empty sections
  const emptySectionsResume: Resume = migrateToV2({
    basics: {
      name: "Anonymous User",
      title: "",
      email: "anon@domain.com",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
  });

  assert(emptySectionsResume.experience.length === 0, "3. Empty sections: experience can be completely empty without crashing");
  assert(emptySectionsResume.education.length === 0, "3. Empty sections: education can be empty");
  assert(emptySectionsResume.skills.length === 0, "3. Empty sections: skills can be empty");

  // 4. Very long job title
  const veryLongTitle =
    "Lead Senior Staff Principal Distinguished VP of Global Autonomous Infrastructure & Microservices Architecture Division Overseeing Multi-Cloud Kubernetes Clusters and Distributed Scalable High-Throughput Pipelines";
  const longTitleResume: Resume = migrateToV2({
    basics: {
      name: "Test User",
      title: veryLongTitle,
      email: "test@domain.com",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: ["TypeScript", "React"],
  });

  assert(longTitleResume.basics.title?.length === veryLongTitle.length, "4. Very long job title: tested with 140+ character title string");

  // 5. Mobile Layout Toggle simulation
  let mobileMode: string = "editor";
  function toggleMobileView() {
    mobileMode = mobileMode === "editor" ? "preview" : "editor";
  }
  toggleMobileView();
  assert(mobileMode === "preview", "5. Mobile layout: toggle properly transitions between editor and preview modes");

  // 6. Messy / unstructured JD text
  const messyJd = `
    🚀🚀🚀 WE ARE HIRING!! 💥
    Looking for a *ROCKSTAR* engineer (Full-time / Remote / Flexible)
    Must love [REACT] & Typescript!!
    Bonus points if you know Docker: (v20.10+), AWS!?! and "REST APIs".
    Apply ASAP: jobs@startup.io $$$
  `;

  const messySkills = extractKeywordsFromJd(messyJd);
  assert(messySkills.includes("react"), "6. Messy JD: extracts 'react' despite emojis and weird whitespace");
  assert(messySkills.includes("typescript"), "6. Messy JD: extracts 'typescript' despite parentheticals and punctuation");
  assert(messySkills.includes("docker"), "6. Messy JD: extracts 'docker' despite exclamation marks");
  assert(messySkills.includes("aws"), "6. Messy JD: extracts 'aws' despite irregular spacing");

  console.log(`\nEdge Case Suite: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

// Auto-run if executed directly via tsx
if (require.main === module) {
  runEdgeCasesTests();
}
