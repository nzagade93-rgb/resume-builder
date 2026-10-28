import type { Resume } from "@/types/resume";

/**
 * Initiates the browser print dialog to generate a native vector PDF.
 * Dynamically assigns document.title to "Name_Role_Resume" so the browser's
 * PDF printer automatically sets the exact professional filename.
 */
export function printVectorPdf(resume: Resume, customFilename?: string): void {
  if (typeof window === "undefined") return;

  const candidateName = (resume.basics.name || "Candidate").replace(/[^a-zA-Z0-9]/g, "_");
  const roleName = (resume.basics.headline || resume.basics.title || "Resume").replace(/[^a-zA-Z0-9]/g, "_");
  const targetFilename = customFilename || `${candidateName}_${roleName}_Resume`;

  const previousTitle = document.title;
  document.title = targetFilename;

  // Trigger print
  window.print();

  // Restore document title cleanly after print dialog closes
  setTimeout(() => {
    document.title = previousTitle;
  }, 1000);
}
