"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { AiImproveModal } from "./AiImproveModal";
import { Input } from "@/components/ui/Input";

export const ExperienceEditor: React.FC = () => {
  const {
    resume,
    addExperience,
    duplicateExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    toggleSectionVisibility,
  } = useResume();
  const { experience, sectionVisibility } = resume;
  const isExperienceVisible = sectionVisibility?.experience !== false;

  // Track collapsed status of entries
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // AI Modal State
  const [activeAiBullet, setActiveAiBullet] = useState<{
    expId: string;
    bIdx: number;
    text: string;
    company: string;
  } | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulletChange = (expId: string, bullets: string[], index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    updateExperience(expId, { bullets: updated });
  };

  const handleAddBullet = (expId: string, bullets: string[]) => {
    updateExperience(expId, { bullets: [...bullets, ""] });
  };

  const handleRemoveBullet = (expId: string, bullets: string[], index: number) => {
    const updated = bullets.filter((_, i) => i !== index);
    updateExperience(expId, { bullets: updated });
  };

  const handleReorderBullet = (expId: string, bullets: string[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= bullets.length) return;
    const result = Array.from(bullets);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    updateExperience(expId, { bullets: result });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Work Experience ({experience.length})
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
            Document your professional positions and career impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isExperienceVisible}
              onChange={() => toggleSectionVisibility("experience")}
              className="rounded accent-[#2563EB] w-3.5 h-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            />
            <span>Visible</span>
          </label>

          <button
            type="button"
            onClick={addExperience}
            className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>+</span>
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* 2. Pro Formula Tip */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-[#1E293B] flex items-start gap-3">
        <span className="text-base shrink-0 leading-none mt-0.5">💡</span>
        <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold block mb-0.5">
            Google XYZ Formula
          </strong>
          Format bullets as: <em>&quot;Accomplished [X], measured by [Y], by doing [Z]&quot;</em>. Begin with punchy action verbs (e.g. <em>Architected, Scaled, Streamlined</em>) and include quantifiable metrics.
        </div>
      </div>

      {/* 3. Empty State */}
      {experience.length === 0 && (
        <div className="text-center py-10 border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mb-3">No work experience entries added yet.</p>
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] text-white rounded-full transition cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            + Add First Role
          </button>
        </div>
      )}

      {/* 4. Experience Cards */}
      <div className="space-y-4">
        {experience.map((item, index) => {
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
                      {item.role || "Untitled Role"} {item.company ? `— ${item.company}` : ""}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                      {item.start || "Start Date"} – {item.end || "End Date"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Up / Down Reorder */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderExperience(index, index - 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === experience.length - 1}
                    onClick={() => reorderExperience(index, index + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title="Move Down"
                  >
                    ↓
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => duplicateExperience(item.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title="Duplicate Entry"
                  >
                    Copy
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeExperience(item.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                    title="Delete Entry"
                  >
                    Delete
                  </button>

                  {/* Collapse Toggle */}
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
                    <Input
                      label="Company Name"
                      value={item.company}
                      onChange={(e) => updateExperience(item.id, { company: e.target.value })}
                      placeholder="e.g. Apple, Stripe, Airbnb"
                    />

                    <Input
                      label="Role / Title"
                      value={item.role}
                      onChange={(e) => updateExperience(item.id, { role: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                    />

                    <Input
                      label="Start Date"
                      value={item.start}
                      onChange={(e) => updateExperience(item.id, { start: e.target.value })}
                      placeholder="e.g. Jan 2021"
                    />

                    <Input
                      label="End Date"
                      value={item.end}
                      onChange={(e) => updateExperience(item.id, { end: e.target.value })}
                      placeholder="e.g. Present"
                    />
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block tracking-tight">
                          Key Achievements & Bullets ({item.bullets.length})
                        </label>
                        <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          Target 3-5 bullets with quantified metrics.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddBullet(item.id, item.bullets)}
                        className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        + Add Bullet
                      </button>
                    </div>

                    <div className="space-y-3">
                      {item.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 border border-[#E2E8F0] dark:border-[#1E293B] space-y-2"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-[#64748B] dark:text-[#94A3B8] text-xs mt-1.5">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) =>
                                handleBulletChange(item.id, item.bullets, bIdx, e.target.value)
                              }
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] resize-y leading-relaxed shadow-2xs"
                              placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."
                            />
                            <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                              <button
                                type="button"
                                disabled={bIdx === 0}
                                onClick={() => handleReorderBullet(item.id, item.bullets, bIdx, bIdx - 1)}
                                className="text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white p-1 text-[10px] disabled:opacity-20 cursor-pointer focus-visible:outline-none"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={bIdx === item.bullets.length - 1}
                                onClick={() => handleReorderBullet(item.id, item.bullets, bIdx, bIdx + 1)}
                                className="text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white p-1 text-[10px] disabled:opacity-20 cursor-pointer focus-visible:outline-none"
                                title="Move Down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(item.id, item.bullets, bIdx)}
                                className="text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] p-1 text-xs cursor-pointer focus-visible:outline-none"
                                title="Delete Bullet"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 pl-4">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveAiBullet({
                                  expId: item.id,
                                  bIdx,
                                  text: bullet,
                                  company: item.company,
                                })
                              }
                              className="font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                            >
                              <span>✨ Polish with AI</span>
                            </button>

                            {!/\d/.test(bullet) && bullet.trim().length > 15 && (
                              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium italic">
                                💡 Tip: Add numbers/metrics if possible
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Bullet Improvement Modal */}
      {activeAiBullet && (
        <AiImproveModal
          isOpen={!!activeAiBullet}
          onClose={() => setActiveAiBullet(null)}
          originalText={activeAiBullet.text}
          mode="bullet"
          allowedContext={`Company: ${activeAiBullet.company}`}
          onAccept={(improvedText) => {
            const exp = experience.find((e) => e.id === activeAiBullet.expId);
            if (exp) {
              handleBulletChange(exp.id, exp.bullets, activeAiBullet.bIdx, improvedText);
            }
            setActiveAiBullet(null);
          }}
        />
      )}
    </div>
  );
};

export default ExperienceEditor;
