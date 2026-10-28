import {
  Resume,
  Basics,
  Experience,
  Education,
  SkillCategory,
  Project,
  Certification,
  Language,
  Award,
  Volunteering,
  Publication,
  CustomEntry,
  CustomSection,
  DesignMeta,
  ResumeMeta,
  getFlatSkills,
} from "@/lib/schema";

export type {
  Resume,
  Basics,
  Experience,
  Education,
  SkillCategory,
  Project,
  Certification,
  Language,
  Award,
  Volunteering,
  Publication,
  CustomEntry,
  CustomSection,
  DesignMeta,
  ResumeMeta,
};

export { getFlatSkills };

export type SectionVisibility = {
  summary?: boolean;
  experience?: boolean;
  education?: boolean;
  skills?: boolean;
  projects?: boolean;
  certifications?: boolean;
  languages?: boolean;
  awards?: boolean;
  volunteering?: boolean;
  publications?: boolean;
  [key: string]: boolean | undefined;
};

export const sampleResume: Resume = {
  schemaVersion: 2,
  basics: {
    name: "Alex Morgan",
    headline: "Senior Full Stack Software Engineer",
    title: "Senior Full Stack Software Engineer",
    email: "alex.morgan@example.com",
    phone: "(555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
    portfolio: "alexmorgan.dev",
    photo: "",
    photoShape: "circle",
    summary:
      "Results-oriented Senior Software Engineer with 6+ years of experience architecting scalable distributed web platforms, high-throughput microservices, and modern user-centric interfaces. Track record of driving engineering velocity and reducing system latency.",
  },
  summary:
    "Results-oriented Senior Software Engineer with 6+ years of experience architecting scalable distributed web platforms, high-throughput microservices, and modern user-centric interfaces. Track record of driving engineering velocity and reducing system latency.",
  experience: [
    {
      id: "exp-1",
      company: "Vercel Inc.",
      role: "Senior Frontend Engineer",
      location: "San Francisco, CA",
      start: "Jan 2023",
      end: "Present",
      current: true,
      bullets: [
        "Architected core dashboard features serving over 2M developers with sub-100ms response times.",
        "Reduced client bundle size by 34% by implementing intelligent route-based code splitting and edge caching.",
        "Mentored 5 junior and mid-level engineers across product and infrastructure initiatives.",
      ],
    },
    {
      id: "exp-2",
      company: "Stripe",
      role: "Software Engineer",
      location: "South San Francisco, CA",
      start: "Jun 2020",
      end: "Dec 2022",
      current: false,
      bullets: [
        "Engineered fault-tolerant checkout webhooks processing 10M+ daily events with 99.999% reliability.",
        "Built responsive accessibility-compliant checkout components that increased payment completion rates by 4.2%.",
        "Collaborated with cross-functional product and security teams to achieve PCI-DSS Level 1 compliance.",
      ],
    },
    {
      id: "exp-3",
      company: "Dropbox",
      role: "Junior Software Engineer",
      location: "San Francisco, CA",
      start: "Aug 2018",
      end: "May 2020",
      current: false,
      bullets: [
        "Developed automated file sync health telemetry monitoring pipelines in Python and TypeScript.",
        "Resolved 80+ customer-reported synchronization edge cases, reducing weekly escalation tickets by 18%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      field: "Computer Science",
      start: "2014",
      end: "2018",
      year: "2018",
      gpa: "3.85",
    },
  ],
  skills: [
    {
      id: "skill-cat-1",
      category: "Languages & Frameworks",
      items: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "Go"],
    },
    {
      id: "skill-cat-2",
      category: "Databases & Cloud",
      items: ["PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "GraphQL"],
    },
    {
      id: "skill-cat-3",
      category: "Tools & Methodologies",
      items: ["Tailwind CSS", "Git", "CI/CD", "Agile / Scrum", "Microservices"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Scheduler",
      link: "github.com/alexmorgan/task-scheduler",
      tech: ["Go", "Redis", "gRPC", "Docker"],
      bullets: [
        "Designed and implemented a distributed task queue handling 50K concurrent tasks with exponential backoff retries.",
        "Achieved 99.98% execution rate with automated leader election using Redis Raft consensus.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023",
      url: "aws.amazon.com/certification",
    },
  ],
  languages: [
    {
      id: "lang-1",
      language: "English",
      proficiency: "Native",
    },
    {
      id: "lang-2",
      language: "Spanish",
      proficiency: "Conversational",
    },
  ],
  awards: [
    {
      id: "award-1",
      title: "Vercel Innovation Hackathon 1st Place",
      issuer: "Vercel",
      date: "2023",
      summary: "Built an AI-powered automated edge routing optimizer.",
    },
  ],
  volunteering: [],
  publications: [],
  customSections: [],
  meta: {
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
      "awards",
      "volunteering",
      "publications",
    ],
    hiddenSections: [],
    pageSize: "A4",
    design: {
      font: "sans",
      fontPairing: "modern-sans",
      accent: "#0F766E",
      fontScale: 1.0,
      lineHeight: 1.4,
      margins: "normal",
      sectionSpacing: "normal",
      targetPages: 1,
    },
  },
  template: "ats",
  sectionVisibility: {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    languages: true,
    awards: true,
  },
};

// ==========================================
// Phase 5: Tailor 2.0, Versions & ATS Types
// ==========================================

export interface TailorDiff {
  id: string;
  section: "summary" | "experience" | "skills" | "projects";
  targetId?: string;
  bulletIndex?: number;
  path: string; // e.g. "Professional Summary" or "Acme Corp - Bullet #2"
  originalText: string;
  tailoredText: string;
  reason: string; // One-line why explanation
  status: "pending" | "accepted" | "rejected";
}

export interface ResumeVersion {
  id: string;
  name: string; // e.g. "Stripe - Staff Frontend Engineer"
  company: string;
  role: string;
  createdAt: string;
  jdText: string;
  tailoredResume: Resume;
  diffs: TailorDiff[];
  coverLetter?: string;
  matchScore?: number;
}

export interface KeywordMatchDetail {
  keyword: string;
  locations: string[]; // e.g. ["Experience: TechCorp", "Skills: Frontend"]
  isTrueSounding?: boolean; // Adjacent skill: "Add only if you really have this"
  category?: "required" | "preferred" | "general";
}

export type AtsSeverity = "critical" | "warning" | "good";

export interface AtsIssue {
  id: string;
  category: string;
  severity: AtsSeverity;
  title: string;
  description: string;
  suggestion: string;
  impactScore: number;
}

export interface AtsCheckResult {
  score: number; // 0 - 100
  rating: "Needs Work" | "Good" | "Excellent";
  issues: AtsIssue[];
  summary: {
    criticalCount: number;
    warningCount: number;
    passedCount: number;
  };
}

