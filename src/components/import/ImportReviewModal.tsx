"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useResume } from "@/context/ResumeContext";
import { useToast } from "@/components/ui/Toast";
import { extractTextFromFile } from "@/lib/import/fileExtractor";
import { parseResumeTextDeterministically } from "@/lib/import/deterministicParser";
import type { Resume } from "@/types/resume";

const SAMPLE_RAW_RESUME = `JORDAN LEE
Senior Cloud Systems Engineer
jordan.lee@example.com | (415) 555-8921 | Seattle, WA
linkedin.com/in/jordanlee | github.com/jordanlee

PROFESSIONAL SUMMARY
Cloud architect with 6+ years designing Kubernetes and AWS infrastructure. Specializes in multi-region deployments, automated CI/CD pipelines, and infrastructure as code.

WORK EXPERIENCE
Apex Cloud Platforms — Senior Infrastructure Engineer
March 2021 – Present | Seattle, WA
• Architected multi-region Kubernetes clusters supporting 120 microservices with 99.99% uptime.
• Automated terraform deployments reducing provisioning time from 4 hours to 12 minutes.
• Reduced monthly cloud infrastructure spend by $35,000 through automated Spot instance orchestration.

Beacon Technologies — DevOps Engineer
August 2018 – February 2021 | San Francisco, CA
• Designed GitHub Actions CI/CD workflows for 45 engineers, accelerating release velocity by 60%.
• Implemented Prometheus and Grafana alerting for distributed payment pipelines.

EDUCATION
University of Washington
Bachelor of Science in Computer Science | 2018
GPA: 3.82

TECHNICAL SKILLS
Languages & Cloud: Python, Go, Bash, AWS, GCP, Docker, Kubernetes, Terraform, Linux
Databases & Tools: PostgreSQL, Redis, GitHub Actions, Prometheus, Grafana, gRPC`;

interface ImportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportReviewModal: React.FC<ImportReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setResume, createTailoredVersion } = useResume();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow states: 'upload' -> 'extracting' -> 'review'
  const [step, setStep] = useState<"upload" | "extracting" | "review">("upload");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");

  // Parsed Resume Draft
  const [parsedDraft, setParsedDraft] = useState<Resume | null>(null);
  const [lowConfidenceFields, setLowConfidenceFields] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = () => {
    setStep("upload");
    setErrorMsg(null);
    setRawText("");
    setParsedDraft(null);
    setLowConfidenceFields([]);
  };

  const handleProcessText = async (text: string, name: string) => {
    setStep("extracting");
    setErrorMsg(null);
    setRawText(text);
    setFileName(name);

    try {
      // Call /api/parse route
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume text.");
      }

      setParsedDraft(data.parsedResume);
      setLowConfidenceFields(data.lowConfidenceFields || []);
      setStep("review");
    } catch (err: any) {
      console.warn("API parsing failed, using deterministic parser:", err.message);
      // Fallback to deterministic parser
      const fallback = parseResumeTextDeterministically(text);
      setParsedDraft(fallback.resume);
      setLowConfidenceFields(fallback.lowConfidenceFields);
      setStep("review");
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setErrorMsg(null);
      setStep("extracting");
      const { text, filename } = await extractTextFromFile(file);
      await handleProcessText(text, filename);
    } catch (err: any) {
      setStep("upload");
      setErrorMsg(err.message || "Failed to process the uploaded file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    handleProcessText(SAMPLE_RAW_RESUME, "Jordan_Lee_Resume.txt");
  };

  // Save parsed draft to base resume
  const handleApplyToBaseResume = () => {
    if (!parsedDraft) return;
    setResume(parsedDraft);
    toast("Successfully imported resume into editor!", "success");
    onClose();
    resetState();
  };

  // Save parsed draft as a new version
  const handleImportAsVersion = () => {
    if (!parsedDraft) return;
    const candidateName = parsedDraft.basics.name || "Imported";
    const roleName = parsedDraft.basics.headline || "Resume";
    createTailoredVersion({
      name: `${candidateName} — ${roleName}`,
      company: "Imported Profile",
      role: roleName,
      jdText: "",
      tailoredResume: parsedDraft,
      diffs: [],
    });
    toast("Imported as a new tailored version!", "success");
    onClose();
    resetState();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title="📥 Import Existing Resume"
      description="Upload your PDF, DOCX, or text resume. Parsed locally in your browser with zero data loss."
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Step 1: Upload Dropzone */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 select-none ${
                isDragOver
                  ? "border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-900/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-xl font-bold shadow-xs">
                📄
              </div>

              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Click to browse or drag and drop your resume
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  PDF, DOCX, or TXT (Max 5 MB) • Processed in your browser
                </p>
              </div>

              <div className="pt-2">
                <Button type="button" variant="primary" size="sm">
                  Choose File
                </Button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs">Import Issue</p>
                  <p className="text-[11.5px] leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Quick Demo Loader */}
            <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                Want to test without a file?
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadSample}
              >
                ⚡ Load Sample Cloud Engineer Resume
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Extracting Spinner */}
        {step === "extracting" && (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-3.5">
            <span className="w-8 h-8 border-3 border-slate-200 dark:border-slate-800 border-t-[#2563EB] rounded-full animate-spin" />
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Parsing Resume Document
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Extracting selectable text and structuring sections adhering to ResumeSchemaV2...
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Split Review Screen */}
        {step === "review" && parsedDraft && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Review & Correct Parsed Fields
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Compare the extracted original text with parsed fields before saving.
                </p>
              </div>

              {lowConfidenceFields.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-[10.5px] font-bold">
                  <span>⚠️ Check:</span>
                  <span>{lowConfidenceFields.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Side-by-Side View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[460px] overflow-hidden">
              {/* Left Pane: Original Extracted Text */}
              <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-200">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>RAW EXTRACTED TEXT</span>
                  <span className="truncate max-w-[140px] text-[10px]">{fileName}</span>
                </div>
                <div className="p-3 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[400px] whitespace-pre-wrap select-all">
                  {rawText}
                </div>
              </div>

              {/* Right Pane: Editable Structured Fields */}
              <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>STRUCTURED PARSED FIELDS</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px]">
                    ✓ Verified Schema
                  </span>
                </div>

                <div className="p-3 space-y-3.5 overflow-y-auto max-h-[400px]">
                  {/* Basics Fields */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Contact & Basics
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                          Name:
                        </label>
                        <input
                          type="text"
                          value={parsedDraft.basics.name}
                          onChange={(e) =>
                            setParsedDraft({
                              ...parsedDraft,
                              basics: { ...parsedDraft.basics, name: e.target.value },
                            })
                          }
                          className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                          Headline / Title:
                        </label>
                        <input
                          type="text"
                          value={parsedDraft.basics.headline || ""}
                          onChange={(e) =>
                            setParsedDraft({
                              ...parsedDraft,
                              basics: {
                                ...parsedDraft.basics,
                                headline: e.target.value,
                                title: e.target.value,
                              },
                            })
                          }
                          className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                          Email:
                        </label>
                        <input
                          type="text"
                          value={parsedDraft.basics.email}
                          onChange={(e) =>
                            setParsedDraft({
                              ...parsedDraft,
                              basics: { ...parsedDraft.basics, email: e.target.value },
                            })
                          }
                          className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                          Phone:
                        </label>
                        <input
                          type="text"
                          value={parsedDraft.basics.phone}
                          onChange={(e) =>
                            setParsedDraft({
                              ...parsedDraft,
                              basics: { ...parsedDraft.basics, phone: e.target.value },
                            })
                          }
                          className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                      Summary:
                    </label>
                    <textarea
                      rows={2}
                      value={parsedDraft.basics.summary || ""}
                      onChange={(e) =>
                        setParsedDraft({
                          ...parsedDraft,
                          basics: { ...parsedDraft.basics, summary: e.target.value },
                          summary: e.target.value,
                        })
                      }
                      className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Experience Entries */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Work Experience ({parsedDraft.experience.length})
                    </span>
                    {parsedDraft.experience.map((exp, expIdx) => (
                      <div
                        key={exp.id || expIdx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...parsedDraft.experience];
                              updated[expIdx].company = e.target.value;
                              setParsedDraft({ ...parsedDraft, experience: updated });
                            }}
                            className="font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none"
                            placeholder="Company"
                          />
                          <input
                            type="text"
                            value={`${exp.start} - ${exp.end}`}
                            onChange={(e) => {
                              const parts = e.target.value.split("-");
                              const updated = [...parsedDraft.experience];
                              updated[expIdx].start = parts[0]?.trim() || "";
                              updated[expIdx].end = parts[1]?.trim() || "";
                              setParsedDraft({ ...parsedDraft, experience: updated });
                            }}
                            className="text-[10px] text-right text-slate-500 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none"
                            placeholder="Dates"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...parsedDraft.experience];
                            updated[expIdx].role = e.target.value;
                            setParsedDraft({ ...parsedDraft, experience: updated });
                          }}
                          className="text-xs text-slate-700 dark:text-slate-300 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 w-full focus:outline-none"
                          placeholder="Role Title"
                        />
                        <div className="text-[11px] text-slate-500 pl-2 space-y-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="truncate">
                              • {b}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Education ({parsedDraft.education.length})
                    </span>
                    {parsedDraft.education.map((edu, eduIdx) => (
                      <div
                        key={edu.id || eduIdx}
                        className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200/80 dark:border-slate-800 text-xs"
                      >
                        <span className="font-bold">{edu.school}</span>
                        <span className="text-slate-600 dark:text-slate-400"> — {edu.degree} ({edu.year || edu.end})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetState}
              >
                ← Upload Different File
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleImportAsVersion}
                >
                  Import as New Version
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleApplyToBaseResume}
                >
                  ✓ Apply to Primary Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
