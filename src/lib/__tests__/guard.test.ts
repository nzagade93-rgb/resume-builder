import { verifyTruthfulness, extractNumbers, extractYears } from "../ai/guard";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("Running Truthfulness Guard Unit Tests...\n");

// 1. Acceptance test: Guard blocks an invented company
const inputCompany = "Engineered automated data pipelines for customer analytics.";
const outputHallucinatedCompany = "Engineered automated data pipelines at Google for customer analytics.";
const resultCompany = verifyTruthfulness(inputCompany, outputHallucinatedCompany);
assert(!resultCompany.isTruthful, "Blocks invented company 'Google'");
assert(
  resultCompany.violations.some((v) => v.includes("Invented employer/company")),
  "Records company violation message"
);

// 2. Acceptance test: Guard blocks an invented percentage metric
const inputMetric = "Worked on database performance and made queries faster.";
const outputHallucinatedMetric = "Architected PostgreSQL query optimization, reducing latency by 45%.";
const resultMetric = verifyTruthfulness(inputMetric, outputHallucinatedMetric);
assert(!resultMetric.isTruthful, "Blocks invented percentage metric '45%'");
assert(
  resultMetric.violations.some((v) => v.includes("45%")),
  "Flags specific hallucinated metric '45%'"
);

// 3. Test: Guard blocks invented dollar figure
const inputDollar = "Helped team reduce cloud infrastructure costs.";
const outputDollar = "Spearheaded cloud resource optimization, saving $1.2M in annual costs.";
const resultDollar = verifyTruthfulness(inputDollar, outputDollar);
assert(!resultDollar.isTruthful, "Blocks invented financial metric '$1.2M'");

// 4. Test: Guard blocks invented calendar year
const inputYear = "Graduated with degree in Computer Science.";
const outputYear = "Graduated with degree in Computer Science in 2024.";
const resultYear = verifyTruthfulness(inputYear, outputYear);
assert(!resultYear.isTruthful, "Blocks invented calendar year '2024'");

// 5. Test: Guard blocks invented degree credential
const inputDegree = "Led engineering initiatives across distributed systems.";
const outputDegree = "Completed an MBA while leading engineering initiatives across distributed systems.";
const resultDegree = verifyTruthfulness(inputDegree, outputDegree);
assert(!resultDegree.isTruthful, "Blocks invented degree credential 'MBA'");

// 6. Test: Valid truthful rewording with existing metric passes
const inputValid = "Reduced backend API latency by 35% using Redis edge caching.";
const outputValid = "Spearheaded Redis edge caching deployment, slashing backend API latency by 35%.";
const resultValid = verifyTruthfulness(inputValid, outputValid);
assert(resultValid.isTruthful, "Allows truthful rewording that retains legitimate input metric '35%'");
assert(resultValid.violations.length === 0, "No violations on truthful suggestion");
assert(Boolean(resultValid.cleanOutput), "Returns clean output on verified suggestion");

// 7. Test: Valid truthful rewording without metrics passes
const inputNoMetrics = "Responsible for building checkout components in React.";
const outputNoMetrics = "Architected reusable, accessible checkout components in React.";
const resultNoMetrics = verifyTruthfulness(inputNoMetrics, outputNoMetrics);
assert(resultNoMetrics.isTruthful, "Allows strong action verb substitution without invented numbers");

console.log("\nTruthfulness Guard Suite: 7 passed, 0 failed.\n");
