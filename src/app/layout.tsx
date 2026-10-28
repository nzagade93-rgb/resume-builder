import type { Metadata, Viewport } from "next";
import { Inter, Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Elite AI Resume Builder | Truthful ATS Resumes & Job Tailoring",
    template: "%s | Elite AI Resume Builder",
  },
  description:
    "Build, design, improve, ATS-check, tailor to a job description, and export professional resumes in minutes with zero AI hallucinations and complete privacy.",
  keywords: [
    "resume builder",
    "ATS resume",
    "AI resume tailoring",
    "truthful AI",
    "job description match",
    "cover letter generator",
    "career switcher resume",
    "fresher resume",
  ],
  authors: [{ name: "Elite Resume Team" }],
  creator: "Elite AI Resume Builder",
  publisher: "Elite AI Resume Builder",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Elite AI Resume Builder — Truthful ATS Resumes",
    description:
      "Create a resume, see what's missing for your target job, and get a truthful tailored version in minutes with visible diffs.",
    type: "website",
    locale: "en_US",
    siteName: "Elite AI Resume Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite AI Resume Builder",
    description: "Truthful ATS resumes, job tailoring diffs, and privacy-first data storage.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
