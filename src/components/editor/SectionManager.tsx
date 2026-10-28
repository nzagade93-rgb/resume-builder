"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useResume } from "@/context/ResumeContext";

// Standard section definitions with default display titles and icons
const KNOWN_SECTIONS: Record<string, { title: string; icon: string; description: string }> = {
  summary: { title: "Professional Summary", icon: "📝", description: "Career overview & core impact" },
  experience: { title: "Work Experience", icon: "💼", description: "Roles, achievements & metrics" },
  education: { title: "Education", icon: "🎓", description: "Degrees, institutions & graduation" },
  skills: { title: "Skills & Technologies", icon: "⚡", description: "Grouped technical competencies" },
  projects: { title: "Featured Projects", icon: "🚀", description: "Key projects, repos & tech stacks" },
  certifications: { title: "Certifications", icon: "📜", description: "Licenses & industry credentials" },
  languages: { title: "Languages", icon: "🌐", description: "Language proficiencies" },
  awards: { title: "Honors & Awards", icon: "🏆", description: "Competitions & recognitions" },
  volunteering: { title: "Volunteering", icon: "🤝", description: "Community & leadership causes" },
  publications: { title: "Publications", icon: "📚", description: "Papers, articles & patents" },
};

interface SortableItemProps {
  id: string;
  isCustom: boolean;
  customHeading?: string;
  onRenameCustom?: (newHeading: string) => void;
  onRemoveCustom?: () => void;
  isHidden: boolean;
  onToggleHidden: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  isCustom,
  customHeading,
  onRenameCustom,
  onRemoveCustom,
  isHidden,
  onToggleHidden,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [headingValue, setHeadingValue] = useState(customHeading || "Custom Section");

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const known = KNOWN_SECTIONS[id];
  const title = isCustom ? customHeading || "Custom Section" : known?.title || id;
  const icon = isCustom ? "✨" : known?.icon || "📄";

  const handleRenameSubmit = () => {
    setIsEditing(false);
    if (onRenameCustom && headingValue.trim()) {
      onRenameCustom(headingValue.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all select-none ${
        isDragging
          ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/60 shadow-lg"
          : isHidden
          ? "border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/60 dark:bg-slate-900/30 opacity-60"
          : "border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F172A] shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.03)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] hover:border-[#CBD5E1] dark:hover:border-[#334155]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          title="Drag to reorder"
          aria-label={`Reorder ${title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <span className="text-sm shrink-0">{icon}</span>

        {/* Title or Editable Custom Heading */}
        <div className="min-w-0 flex-1">
          {isCustom && isEditing ? (
            <input
              type="text"
              autoFocus
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 w-full"
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-xs font-semibold truncate ${
                  isHidden
                    ? "text-[#64748B] dark:text-[#94A3B8] line-through"
                    : "text-[#0F172A] dark:text-[#F8FAFC]"
                }`}
              >
                {title}
              </span>
              {isCustom && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-[#64748B] hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer"
                  title="Rename heading"
                >
                  ✎
                </button>
              )}
            </div>
          )}
          {known?.description && (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
              {known.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={onToggleHidden}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
            isHidden
              ? "bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E293B]"
              : "bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-[#93C5FD] border-blue-200 dark:border-blue-900/50"
          }`}
          title={isHidden ? "Click to show on resume" : "Click to hide on resume"}
        >
          {isHidden ? "Hidden" : "Visible"}
        </button>

        {isCustom && onRemoveCustom && (
          <button
            type="button"
            onClick={onRemoveCustom}
            className="p-1 text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            title="Delete custom section"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const SectionManager: React.FC = () => {
  const {
    resume,
    setSectionOrder,
    toggleSectionHidden,
    isSectionHidden,
    addCustomSection,
    removeCustomSection,
    updateCustomSectionHeading,
  } = useResume();

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sectionOrder = resume.meta.sectionOrder || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(String(active.id));
      const newIndex = sectionOrder.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sectionOrder, oldIndex, newIndex);
        setSectionOrder(reordered);
      }
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      addCustomSection(newSectionTitle.trim());
      setNewSectionTitle("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Sections & Layout Order
        </h3>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
          Drag to reorder sections on the document. Toggle visibility to hide without losing data.
        </p>
      </div>

      {/* Dnd Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {sectionOrder.map((sectionId) => {
              const customSec = resume.customSections?.find((s) => s.id === sectionId);
              const isCustom = Boolean(customSec);

              return (
                <SortableItem
                  key={sectionId}
                  id={sectionId}
                  isCustom={isCustom}
                  customHeading={customSec?.heading}
                  onRenameCustom={(newHeading) => updateCustomSectionHeading(sectionId, newHeading)}
                  onRemoveCustom={() => removeCustomSection(sectionId)}
                  isHidden={isSectionHidden(sectionId)}
                  onToggleHidden={() => toggleSectionHidden(sectionId)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Custom Section Form / Button */}
      {showAddForm ? (
        <form
          onSubmit={handleAddCustom}
          className="p-5 bg-white dark:bg-[#0F172A] rounded-xl border border-[#2563EB] dark:border-[#3B82F6] shadow-xs space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              New Custom Section
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Leadership & Mentorship, Open Source, Public Speaking"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newSectionTitle.trim()}
              className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-lg disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              Add Section
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#3B82F6] hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          <span>+</span>
          <span>Add Custom Section</span>
        </button>
      )}
    </div>
  );
};

export default SectionManager;
