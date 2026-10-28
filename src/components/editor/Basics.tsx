"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { AiImproveModal } from "./AiImproveModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export const BasicsEditor: React.FC = () => {
  const { resume, updateBasics, toggleSectionVisibility } = useResume();
  const { basics, sectionVisibility } = resume;
  const isSummaryVisible = sectionVisibility?.summary !== false;

  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Personal Information
        </h3>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
          Your core identity, target headline, contact details, and online profiles.
        </p>
      </div>

      {/* 2. Core Contact Grid */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={basics.name}
            onChange={(e) => updateBasics("name", e.target.value)}
            placeholder="e.g. Alex Morgan"
            required
          />

          <Input
            label="Target Headline / Title"
            value={basics.headline || basics.title || ""}
            onChange={(e) => updateBasics("headline", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />

          <Input
            type="email"
            label="Email Address"
            value={basics.email}
            onChange={(e) => updateBasics("email", e.target.value)}
            placeholder="alex.morgan@example.com"
            required
          />

          <Input
            type="tel"
            label="Phone Number"
            value={basics.phone}
            onChange={(e) => updateBasics("phone", e.target.value)}
            placeholder="+1 (555) 234-5678"
          />

          <Input
            label="Location (City, Country)"
            value={basics.location}
            onChange={(e) => updateBasics("location", e.target.value)}
            placeholder="e.g. San Francisco, CA"
          />

          <Input
            label="LinkedIn URL"
            value={basics.linkedin}
            onChange={(e) => updateBasics("linkedin", e.target.value)}
            placeholder="linkedin.com/in/alexmorgan"
          />

          <Input
            label="GitHub / Portfolio"
            value={basics.github || basics.portfolio || ""}
            onChange={(e) => updateBasics("github", e.target.value)}
            placeholder="github.com/alexmorgan"
          />
        </div>
      </div>

      {/* 3. Profile Photo Section */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block tracking-tight">
            Profile Photo
          </label>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Used by photo-enabled templates. Leave blank if not required.
          </span>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div
            className={`w-14 h-14 shrink-0 border border-[#E2E8F0] dark:border-[#1E293B] bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] shadow-2xs ${
              basics.photoShape === "square"
                ? "rounded-lg"
                : basics.photoShape === "rounded"
                ? "rounded-xl"
                : "rounded-full"
            }`}
          >
            {basics.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={basics.photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-2">
            <label className="px-3.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC] rounded-full cursor-pointer transition focus-within:ring-2 focus-within:ring-[#2563EB]">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      updateBasics("photo", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            {basics.photo && (
              <button
                type="button"
                onClick={() => updateBasics("photo", "")}
                className="px-3 py-1.5 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}

            {/* Shape selector */}
            <div className="flex items-center gap-1 ml-auto text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-xs mr-1">Shape:</span>
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                {(["circle", "rounded", "square"] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => updateBasics("photoShape", shape)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                      (basics.photoShape || "circle") === shape
                        ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Professional Summary */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block tracking-tight">
              Professional Summary
            </label>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              2-3 impactful sentences highlighting your top career achievements and value.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              <span>✨ Polish with AI</span>
            </button>
          </div>
        </div>

        <Textarea
          rows={3}
          value={basics.summary}
          onChange={(e) => updateBasics("summary", e.target.value)}
          placeholder="e.g. Versatile Senior Software Engineer with 6+ years of experience architecting distributed cloud systems and optimizing microservices for millions of users..."
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSummaryVisible}
              onChange={() => toggleSectionVisibility("summary")}
              className="rounded accent-[#2563EB] w-3.5 h-3.5"
            />
            <span>Include Summary Section on Resume</span>
          </label>
        </div>
      </div>

      {/* AI Improvement Modal */}
      {aiModalOpen && (
        <AiImproveModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          originalText={basics.summary || "Results-oriented engineer with deep expertise."}
          mode="summary"
          onAccept={(newSummary) => updateBasics("summary", newSummary)}
        />
      )}
    </div>
  );
};

export default BasicsEditor;
