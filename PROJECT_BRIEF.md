# PROJECT BRIEF: Elite AI Resume Builder

## Product
A resume platform for freshers, experienced professionals and career switchers:
build, design, improve, ATS-check, tailor to a job description, and export resumes.
Core differentiator: "Create a resume, see what's missing for your target job, and
get a truthful tailored version in minutes, with a visible diff of what changed and why."

## Stack (free-only for now)
Next.js (App Router) + TypeScript (strict) + Tailwind, src/ directory.
AI: Google Gemini free tier via server-side API routes, behind a provider
abstraction (src/lib/ai/provider.ts) so Groq or another provider can be swapped in.
Storage: localStorage now, Supabase free plan later. Hosting: Vercel Hobby.
No paid services. Secrets only in .env.local, never in client code.

## Non-negotiable rules
1. TRUTHFULNESS: AI may reword, reorder, and emphasize real experience. It must NEVER
   invent employers, titles, dates, degrees, skills, tools, or numbers. If a metric
   would help, suggest "Add a number here if you have one."
2. HUMAN IN CONTROL: AI output is always shown as a suggestion with Accept / Reject.
   Never silently overwrite user content.
3. ATS SAFETY: real selectable text, single-column ATS template, standard headings,
   no text in images, no tables for core content, no icons/skill bars in ATS templates.
4. PRIVACY: resumes are personal data. Never log resume content. Never send it
   anywhere except the AI route the user triggered. Provide "Delete all my data".
5. DATA SAFETY: never lose user data. Autosave, safe localStorage parsing,
   versioned schema with migrations.

## Design principles
Premium, calm, confident. One accent color, a strict type scale (4 sizes), 4/8px
spacing grid, consistent radius and shadows, design tokens in CSS variables / Tailwind
config. Every interactive element has hover, focus-visible, active, disabled and
loading states. Light and dark app theme (resume paper always white). Smooth, subtle
motion (150-250ms), respecting prefers-reduced-motion. No default-looking UI.

## Code quality
Modular components, small files, no giant page.tsx. Validate all external input with
zod (API bodies, AI output, imported JSON, localStorage). Typed errors and friendly
user messages. Unit tests for pure logic (keywords, validators, migrations).
Accessible: labels, keyboard navigation, visible focus, WCAG AA contrast.

## Definition of done (every task)
Builds with `npm run build`, no TS errors, no console errors, works at 375px, 768px
and 1440px widths, empty / long / invalid data handled, and a short summary of what
changed is given at the end.
