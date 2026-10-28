"use client";

import React, { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { AiImproveModal } from "./AiImproveModal";
import { Input } from "@/components/ui/Input";

export const ProjectsEditor: React.FC = () => {
  const {
    resume,
    addProject,
    duplicateProject,
    updateProject,
    removeProject,
    toggleSectionHidden,
    isSectionHidden,
  } = useResume();

  const isHidden = isSectionHidden("projects");
  const projects = resume.projects || [];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // AI Modal State
  const [activeAiBullet, setActiveAiBullet] = useState<{
    projId: string;
    bIdx: number;
    text: string;
    projectName: string;
  } | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulletChange = (projId: string, bullets: string[], index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    updateProject(projId, { bullets: updated });
  };

  const handleAddBullet = (projId: string, bullets: string[]) => {
    updateProject(projId, { bullets: [...bullets, ""] });
  };

  const handleRemoveBullet = (projId: string, bullets: string[], index: number) => {
    const updated = bullets.filter((_, i) => i !== index);
    updateProject(projId, { bullets: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Featured Projects ({projects.length})
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
            Key software products, open-source repositories, or architecture prototypes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!isHidden}
              onChange={() => toggleSectionHidden("projects")}
              className="rounded accent-[#2563EB] w-3.5 h-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            />
            <span>Visible</span>
          </label>

          <button
            type="button"
            onClick={addProject}
            className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-full shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>+</span>
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* 2. Project Tip */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-[#1E293B] flex items-start gap-3">
        <span className="text-base shrink-0 leading-none mt-0.5">🚀</span>
        <div className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold block mb-0.5">
            Demonstrate Technical Decisions
          </strong>
          Highlight technical challenges solved, stack choices (e.g. Next.js, Rust, Docker), and active links or GitHub stars.
        </div>
      </div>

      {/* 3. Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-10 border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mb-3">No featured projects added yet.</p>
          <button
            type="button"
            onClick={addProject}
            className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] text-white rounded-full transition cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            + Add First Project
          </button>
        </div>
      )}

      {/* 4. Projects Cards */}
      <div className="space-y-4">
        {projects.map((proj, index) => {
          const isItemCollapsed = collapsed[proj.id];
          return (
            <div
              key={proj.id}
              className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-[#E2E8F0] dark:border-[#1E293B] select-none">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => toggleCollapse(proj.id)}
                >
                  <span className="text-xs font-bold font-mono text-[#64748B] dark:text-[#94A3B8]">#{index + 1}</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs truncate block tracking-tight">
                      {proj.name || "Untitled Project"}
                    </span>
                    {proj.link && (
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate block">
                        {proj.link}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => duplicateProject(proj.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(proj.id)}
                    className="w-7 h-7 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    {isItemCollapsed ? "▼" : "▲"}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              {!isItemCollapsed && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Project Title"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      placeholder="e.g. Distributed Cache Engine"
                    />

                    <Input
                      label="Live Link / GitHub Repo"
                      value={proj.link || ""}
                      onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                      placeholder="e.g. github.com/user/project"
                    />

                    <div className="sm:col-span-2">
                      <Input
                        label="Technologies Used"
                        value={proj.tech ? proj.tech.join(", ") : ""}
                        onChange={(e) =>
                          updateProject(proj.id, {
                            tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. Go, Redis, Docker, Prometheus"
                      />
                    </div>
                  </div>

                  {/* Project Bullets */}
                  <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block tracking-tight">
                          Project Bullets ({proj.bullets.length})
                        </label>
                        <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          Highlight technical impact and quantifiable metrics.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddBullet(proj.id, proj.bullets)}
                        className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        + Add Bullet
                      </button>
                    </div>

                    <div className="space-y-3">
                      {proj.bullets.map((bullet, bIdx) => (
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
                                handleBulletChange(proj.id, proj.bullets, bIdx, e.target.value)
                              }
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] resize-y leading-relaxed shadow-2xs"
                              placeholder="Engineered [X] solving [Y], achieving [Z]..."
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(proj.id, proj.bullets, bIdx)}
                              className="text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] p-1 text-xs cursor-pointer focus-visible:outline-none"
                              title="Delete Bullet"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 pl-4">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveAiBullet({
                                  projId: proj.id,
                                  bIdx,
                                  text: bullet,
                                  projectName: proj.name,
                                })
                              }
                              className="font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                            >
                              <span>✨ Polish with AI</span>
                            </button>
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
          allowedContext={`Project: ${activeAiBullet.projectName}`}
          onAccept={(improvedText) => {
            const p = projects.find((item) => item.id === activeAiBullet.projId);
            if (p) {
              handleBulletChange(p.id, p.bullets, activeAiBullet.bIdx, improvedText);
            }
            setActiveAiBullet(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsEditor;
