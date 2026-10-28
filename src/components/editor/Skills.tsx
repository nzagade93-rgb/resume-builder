"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";

export const SkillsEditor: React.FC = () => {
  const {
    resume,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    toggleSectionHidden,
    isSectionHidden,
  } = useResume();

  const isHidden = isSectionHidden("skills");
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addSkillCategory(newCatName.trim());
      setNewCatName("");
      setShowAddCat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Skills & Competencies ({resume.skills.length})
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
            Group skills into distinct categories (e.g. Languages, Cloud, Frameworks).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!isHidden}
              onChange={() => toggleSectionHidden("skills")}
              className="rounded accent-[#2563EB] w-3.5 h-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            />
            <span>Visible</span>
          </label>

          <button
            type="button"
            onClick={() => setShowAddCat(true)}
            className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>+</span>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 2. ATS Tip */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-[#1E293B] flex items-start gap-3">
        <span className="text-base shrink-0 leading-none mt-0.5">⚡</span>
        <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold block mb-0.5">
            Recruiter & ATS Scannability
          </strong>
          Categorized skills make your resume 3x faster to scan. Aim for 4–8 concrete tools or technologies per category.
        </div>
      </div>

      {/* 3. Add Category Modal / Form */}
      {showAddCat && (
        <form
          onSubmit={handleAddCategorySubmit}
          className="p-5 bg-white dark:bg-[#0F172A] rounded-xl border border-[#2563EB] dark:border-[#3B82F6] shadow-xs space-y-3 animate-in fade-in duration-150"
        >
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block tracking-tight">
            New Category Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Cloud & Infrastructure, Programming Languages, Frameworks"
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => setShowAddCat(false)}
              className="px-4 py-2 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-lg disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* 4. Skills Categories Cards */}
      <div className="space-y-4">
        {resume.skills.map((cat) => (
          <div
            key={cat.id}
            className="p-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={cat.category}
                onChange={(e) => updateSkillCategory(cat.id, e.target.value, cat.items)}
                className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-transparent border-b border-dashed border-[#CBD5E1] dark:border-[#334155] focus:border-[#2563EB] focus:outline-none pb-0.5 tracking-tight"
                placeholder="Category Name"
              />
              <button
                type="button"
                onClick={() => removeSkillCategory(cat.id)}
                className="text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded"
              >
                Delete Category
              </button>
            </div>

            {/* Comma-separated input for rapid editing */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Skills (comma-separated):
              </label>
              <input
                type="text"
                value={cat.items.join(", ")}
                onChange={(e) => {
                  const items = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSkillCategory(cat.id, cat.category, items);
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB]"
                placeholder="e.g. TypeScript, React, Next.js, Node.js, GraphQL"
              />
            </div>

            {/* Pill preview of skills in category */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cat.items.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] rounded-full border border-[#E2E8F0] dark:border-[#1E293B]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = cat.items.filter((_, idx) => idx !== sIdx);
                      updateSkillCategory(cat.id, cat.category, updated);
                    }}
                    className="text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsEditor;
