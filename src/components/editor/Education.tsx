"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { Input } from "@/components/ui/Input";

export const EducationEditor: React.FC = () => {
  const {
    resume,
    addEducation,
    duplicateEducation,
    updateEducation,
    removeEducation,
    reorderEducation,
    toggleSectionVisibility,
  } = useResume();
  const { education, sectionVisibility } = resume;
  const isEducationVisible = sectionVisibility?.education !== false;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Education ({education.length})
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
            Academic degrees, institutions, and graduation credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEducationVisible}
              onChange={() => toggleSectionVisibility("education")}
              className="rounded accent-[#2563EB] w-3.5 h-3.5"
            />
            <span>Visible</span>
          </label>

          <button
            type="button"
            onClick={addEducation}
            className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>+</span>
            <span>Add Education</span>
          </button>
        </div>
      </div>

      {/* 2. Formatting Tip */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-[#1E293B] flex items-start gap-3">
        <span className="text-base shrink-0 leading-none mt-0.5">🎓</span>
        <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold block mb-0.5">
            Education Best Practices
          </strong>
          Place education below work experience if you have 2+ years of industry experience. Mention honors or GPA only if 3.5 or higher.
        </div>
      </div>

      {/* 3. Empty State */}
      {education.length === 0 && (
        <div className="text-center py-10 border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mb-3">No education entries added yet.</p>
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] text-white rounded-full transition cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            + Add Degree or School
          </button>
        </div>
      )}

      {/* 4. Education Cards */}
      <div className="space-y-4">
        {education.map((item, index) => {
          const isCollapsed = collapsed[item.id];
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-[#E2E8F0] dark:border-[#1E293B] select-none">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => toggleCollapse(item.id)}
                >
                  <span className="text-xs font-bold font-mono text-[#64748B] dark:text-[#94A3B8]">#{index + 1}</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs truncate block tracking-tight">
                      {item.school || "School / University"}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                      {item.degree || "Degree"} {item.year ? `• ${item.year}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderEducation(index, index - 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === education.length - 1}
                    onClick={() => reorderEducation(index, index + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title="Move Down"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateEducation(item.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => removeEducation(item.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCollapse(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    {isCollapsed ? "▼" : "▲"}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              {!isCollapsed && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Institution / University"
                        value={item.school}
                        onChange={(e) => updateEducation(item.id, { school: e.target.value })}
                        placeholder="e.g. Stanford University"
                      />
                    </div>

                    <Input
                      label="Degree"
                      value={item.degree}
                      onChange={(e) => updateEducation(item.id, { degree: e.target.value })}
                      placeholder="e.g. Bachelor of Science"
                    />

                    <Input
                      label="Field of Study"
                      value={item.field || ""}
                      onChange={(e) => updateEducation(item.id, { field: e.target.value })}
                      placeholder="e.g. Computer Science"
                    />

                    <Input
                      label="Graduation Year / Dates"
                      value={item.year || item.end || ""}
                      onChange={(e) => updateEducation(item.id, { year: e.target.value, end: e.target.value })}
                      placeholder="e.g. 2022 or 2018 – 2022"
                    />

                    <Input
                      label="GPA / Honors (Optional)"
                      value={item.gpa || ""}
                      onChange={(e) => updateEducation(item.id, { gpa: e.target.value })}
                      placeholder="e.g. 3.9 / 4.0 or Cum Laude"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EducationEditor;
