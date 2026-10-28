"use client";

import React from "react";
import { templateOptions, TemplateMeta } from "@/templates";
import { useResume } from "@/context/ResumeContext";

type TemplatePickerProps = {
  selectedTemplate: string;
  onSelect: (id: string) => void;
};

// Mini visual thumbnail representation of each template layout with actual user content cues
const MiniThumbnail: React.FC<{
  type: TemplateMeta["thumbnailType"];
  active: boolean;
  name: string;
  accentColor: string;
}> = ({ type, active, name, accentColor }) => {
  const shortName = name ? name.split(" ")[0].slice(0, 8) : "Alex";

  return (
    <div
      className={`w-12 h-16 rounded-[3px] border p-1 flex flex-col justify-between transition-all bg-white shadow-2xs select-none ${
        active ? "border-[#2563EB] ring-2 ring-[#2563EB]/25" : "border-slate-200"
      }`}
    >
      {/* ATS Standard */}
      {type === "single-column" && (
        <div className="space-y-1">
          <div className="text-[6px] font-black text-black truncate leading-none">{shortName}</div>
          <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
          <div className="h-[1px] w-full bg-black mt-0.5" />
          <div className="space-y-0.5 pt-0.5">
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-7 bg-slate-300 rounded-[1px]" />
          </div>
          <div className="h-[1px] w-full bg-slate-200 mt-0.5" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-5 bg-slate-300 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* Fresher Priority */}
      {type === "fresher-priority" && (
        <div className="space-y-1 text-center">
          <div className="text-[6px] font-black uppercase tracking-tight text-slate-900 truncate leading-none">
            {shortName}
          </div>
          <div className="h-[1px] w-full bg-teal-600 my-0.5" />
          <div className="text-[5px] text-teal-800 font-bold text-left pl-0.5">EDU</div>
          <div className="h-0.5 w-8 bg-slate-400 rounded-[1px]" />
          <div className="text-[5px] text-teal-800 font-bold text-left pl-0.5 mt-0.5">PROJ</div>
          <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
        </div>
      )}

      {/* Minimal Clean */}
      {type === "minimal-clean" && (
        <div className="space-y-1">
          <div className="text-[6px] font-light text-slate-900 truncate leading-none">{shortName}</div>
          <div className="h-0.5 w-6 bg-slate-300 rounded-[1px]" />
          <div className="h-[0.5px] w-full bg-slate-200 mt-1" />
          <div className="space-y-0.5 pt-0.5">
            <div className="h-0.5 w-full bg-slate-200 rounded-[1px]" />
            <div className="h-0.5 w-6 bg-slate-200 rounded-[1px]" />
          </div>
          <div className="h-[0.5px] w-full bg-slate-200 mt-1" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-7 bg-slate-200 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* Modern Right Sidebar */}
      {type === "right-sidebar" && (
        <div className="h-full flex flex-col">
          <div className="text-[6px] font-bold text-slate-900 truncate mb-0.5 leading-none">{shortName}</div>
          <div className="flex-1 flex gap-0.5">
            <div className="w-[66%] space-y-0.5">
              <div className="h-0.5 w-full bg-slate-400 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-4 bg-slate-300 rounded-[1px]" />
              <div className="h-0.5 w-full bg-slate-300 rounded-[1px] mt-0.5" />
            </div>
            <div className="w-[34%] bg-teal-50 border border-teal-100 rounded-[1px] p-0.5 space-y-0.5">
              <div className="h-0.5 w-full bg-teal-600 rounded-[1px]" />
              <div className="h-0.5 w-full bg-teal-400 rounded-[1px]" />
              <div className="h-0.5 w-full bg-teal-400 rounded-[1px]" />
            </div>
          </div>
        </div>
      )}

      {/* Executive Accent */}
      {type === "executive-accent" && (
        <div className="h-full flex flex-col relative pt-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-900" />
          <div className="text-[5.5px] font-bold uppercase tracking-wider text-slate-950 truncate leading-none mb-0.5">
            {shortName}
          </div>
          <div className="h-[1px] w-full bg-slate-200 mb-0.5" />
          <div className="space-y-0.5 flex-1">
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-7 bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px] mt-0.5" />
            <div className="h-0.5 w-5 bg-slate-300 rounded-[1px]" />
          </div>
        </div>
      )}

      {/* Dense Compact */}
      {type === "dense-compact" && (
        <div className="h-full flex flex-col space-y-0.5">
          <div className="text-[6px] font-black uppercase text-slate-950 truncate leading-none">{shortName}</div>
          <div className="h-[1px] w-full bg-slate-400" />
          <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
          <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
          <div className="h-[1px] w-full bg-slate-400 mt-0.5" />
          <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
          <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
        </div>
      )}

      {/* Centered Serif (Classic) */}
      {type === "centered-serif" && (
        <div className="space-y-1 text-center flex flex-col items-center">
          <div className="text-[6px] font-bold serif text-slate-950 truncate leading-none">{shortName}</div>
          <div className="h-0.5 w-5 bg-slate-400 rounded-[1px]" />
          <div className="h-[1px] w-full bg-slate-900 mt-0.5" />
          <div className="space-y-0.5 pt-0.5 w-full">
            <div className="h-0.5 w-full bg-slate-300 rounded-[1px]" />
            <div className="h-0.5 w-6 bg-slate-300 rounded-[1px]" />
          </div>
        </div>
      )}
    </div>
  );
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ selectedTemplate, onSelect }) => {
  const { resume } = useResume();

  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-1 select-none">
      {templateOptions.map((tmpl) => {
        const isActive = selectedTemplate === tmpl.id;
        return (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onSelect(tmpl.id)}
            className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-lg border text-left transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              isActive
                ? "bg-white dark:bg-[#0F172A] border-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/25"
                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <MiniThumbnail
              type={tmpl.thumbnailType}
              active={isActive}
              name={resume.basics.name}
              accentColor={tmpl.accentColor}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {tmpl.name}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 rounded uppercase ${
                    tmpl.isAtsSafe
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {tmpl.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[130px] mt-0.5">
                {tmpl.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
