# Elite AI Resume Builder

> **Create a resume, see what's missing for your target job, and get a truthful tailored version in minutes, with a visible diff of what changed and why.**

An open-source, ATS-optimized resume platform built for freshers, experienced professionals, and career switchers. Powered by Next.js 16 (App Router), TypeScript (strict), Tailwind CSS, and Google Gemini 2.5 Flash.

---

## 💎 Core Differentiator & Non-Negotiable Rules

1. **TRUTHFULNESS GUARANTEE**:
   - The AI writing engine may reword, reorder, and emphasize real candidate experience, but it **never invents** employers, titles, dates, degrees, skills, tools, or numbers.
   - Every AI suggestion passes through a programmatic **Truthfulness Guard** (`src/lib/ai/guard.ts`) that verifies that every metric in the output existed in the input. If a violation is caught, the suggestion is discarded.
   - If a metric would help an achievement, the system displays an honest nudge: *"Add a number here if you have one."*

2. **HUMAN IN CONTROL**:
   - AI outputs are always presented as non-destructive suggestions with **Accept**, **Edit**, and **Reject** controls. The system **never silently overwrites** user content.

3. **ATS COMPLIANCE & SAFETY**:
   - Real selectable vector text, single-column ATS templates, standard semantic headings, zero text trapped in images, no layout tables, and no decorative skill bars in ATS templates.

4. **PRIVACY FIRST**:
   - Resumes are sensitive personal data. The platform **never logs resume content** and never transmits it anywhere except the explicit AI endpoint triggered by the user. Includes instant **"Export all my data"** (JSON) and **"Delete all my data"** (permanent wipe).

5. **DATA SAFETY & AUTO-MIGRATION**:
   - Automatic debounced saving, versioned schemas with migration functions (`schemaVersion: 2`), and safe `localStorage` parsing that backs up corrupted data into reserved backup keys without crashing.

---

## 🛠️ Stack & Architecture

- **Framework**: Next.js 16 (App Router) with Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with customized design tokens (Neutral Slate base with `#0F766E` Deep Teal accent)
- **AI Engine**: Google Gemini 2.5 Flash via server-side API routes (`/api/improve`, `/api/tailor`, `/api/parse`) behind a swappable `AIProvider` abstraction (`src/lib/ai/provider.ts`)
- **Document Processing**:
  - `docx`: ATS-compliant Microsoft Word (.docx) generation with native bullet lists and semantic headings.
  - `pdfjs-dist`: In-browser text extraction and automated PDF reading-order verification.
  - `mammoth`: In-browser DOCX text extraction.
- **Database & Sync**: Supabase (PostgreSQL with strict Row Level Security) + seamless offline Guest Mode.
- **Testing**: Complete unit testing suite with 10 test files and 140+ passing unit tests.

---

## 🎨 6 Curated Resume Templates

All templates strictly maintain white paper (`#ffffff`) for print fidelity and optical scanner contrast:

1. **ATS Standard** (`Ats.tsx`): Strict single-column, standard semantic headings, 16mm padding, certified ATS-safe.
2. **Modern** (`Modern.tsx`): Editorial serif header, narrow right-hand contact/skills sidebar (28%), `#0F766E` teal accenting.
3. **Executive** (`Executive.tsx`): 4px top accent band, small-caps name styling, generous letter spacing, two-tone headings.
4. **Compact** (`Compact.tsx`): Dense 9.5pt typography, inline bullet-separated skills (`•`), designed to maximize single-page density.
5. **Fresher / Student** (`Fresher.tsx`): Education and featured projects prioritized first, followed by categorized technical skills.
6. **Minimal** (`Minimal.tsx`): Generous whitespace, elegant hairline horizontal dividers, distraction-free typography.

---

## 🚀 Key Modules & Feature Suite

### 1. Match & Tailor 2.0 (Flagship Feature)
- **Job Description Analysis**: Deterministic keyword extraction + seniority, company, and role detection.
- **Keyword Match Ring**: Animated SVG score gauge labeled honestly: *"Keyword match estimate, not an ATS guarantee."*
- **Exact Resume Location Badges**: Shows where each keyword appears (e.g. `[Experience: TechCorp]`, `[Skill: Frontend]`).
- **Opportunity & Gap Badging**: Identifies true-sounding adjacent skills labeled *"Add only if you really have this"* alongside missing keyword gaps.
- **Isolated Branch Versions**: Tailoring creates a separate resume version (`Company — Role`) without mutating the master resume.
- **Diff Engine**: Side-by-side and inline diffs showing what changed and a one-line rationale, with per-diff Accept / Reject and "Accept All".

### 2. Deterministic ATS Scanner
- Evaluates resumes across 9 critical rule categories:
  - Missing essential contact info (Email, Phone, Location)
  - Non-standard section headings
  - Date uniformity and format consistency
  - Bullet point length (flags one-liners < 7 words and run-ons > 40 words)
  - Passive voice and weak phrases (e.g. *"responsible for"*, *"helped with"*)
  - Repeated action verbs (e.g. *"led"* used > 3 times)
  - Target page overflow warnings

### 3. Truthful Cover Letter Generator
- Generates 1-page tailored cover letters aligned strictly with the candidate's real experience and target role.
- Tone selectors: `Confident`, `Formal / Executive`, `Modern / Startup`.
- Live editable preview with instant copy and text download.

### 4. Multi-Format Export
- **Vector PDF**: Crisp selectable text, embedded fonts, working hyperlinks, dynamic filename injection (`Name_Role_Resume.pdf`).
- **ATS-Safe Word DOCX**: Native headings, bullet lists, no layout tables, Arial/Calibri fonts.
- **Plain Text (.txt)**: Clean plain-text formatting for direct job portal pasting.
- **Automated PDF Readability Verification**: Uses `pdfjs-dist` to verify that the generated document can be accurately read in sequential order by ATS scanners.

### 5. Multi-Format Resume Import
- Upload PDF or DOCX files (up to 5 MB).
- In-browser text extraction (protects user privacy by extracting client-side before parsing).
- Gemini JSON parser extracts structured data without hallucinating unprovided fields.
- Dual-pane review screen comparing extracted raw text against structured editable fields.

### 6. Persistence, Dashboard & Job Tracker
- **Resume Library**: Save multiple resume branches, duplicate, rename, or start fresh from scratch.
- **Version History**: Automated revision snapshots (up to 25) with 1-click restore.
- **Job Application Tracker**: Kanban board and Table view tracking application stages (`Wishlist`, `Applied`, `Interviewing`, `Offer`, `Rejected`), salary ranges, locations, and linked resume versions.
- **User Privacy Controls**: "Export All My Data" (portable JSON bundle) and "Delete All My Data" (permanent purge).

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Gemini API Key for AI Writing, Tailoring, and Import Parsing (Free Tier)
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Supabase Free Plan credentials for Multi-Device Cloud Sync
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note**: All core features—including resume creation, section manager, design panel, templates, ATS checker, PDF export, Word export, and local persistence—work 100% offline in Guest Mode without any external API keys.

---

## 💻 Local Development Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd resume-builder
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run All Unit Tests**:
   ```bash
   npx -y tsx src/lib/__tests__/keywords.test.ts && \
   npx -y tsx src/lib/__tests__/edge-cases.test.ts && \
   npx -y tsx src/lib/__tests__/migration.test.ts && \
   npx -y tsx src/lib/__tests__/guard.test.ts && \
   npx -y tsx src/lib/__tests__/jdAnalysis.test.ts && \
   npx -y tsx src/lib/__tests__/tailorVersions.test.ts && \
   npx -y tsx src/lib/__tests__/atsChecker.test.ts && \
   npx -y tsx src/lib/__tests__/export.test.ts && \
   npx -y tsx src/lib/__tests__/import.test.ts && \
   npx -y tsx src/lib/__tests__/accountsDashboard.test.ts
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Vercel (Hobby Free Plan)

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add `GEMINI_API_KEY`.
4. Deploy! The project builds with zero configuration.

---

## 📄 License

MIT License. Designed and built with pride for career seekers worldwide.
