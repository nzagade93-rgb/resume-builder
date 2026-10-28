"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type {
  Resume,
  Basics,
  Experience,
  Education,
  SkillCategory,
  Project,
  Certification,
  Language,
  Award,
  CustomSection,
  CustomEntry,
  DesignMeta,
  ResumeVersion,
  TailorDiff,
} from "@/types/resume";
import { sampleResume, getFlatSkills } from "@/types/resume";
import { loadResumeSafely, STORAGE_KEY_V2, LEGACY_STORAGE_KEY_V1 } from "@/lib/migration";
import { applyAcceptedDiffs } from "@/lib/tailor/diffEngine";

export const STORAGE_KEY_VERSIONS = "resume_builder_versions_v2";

interface ResumeContextType {
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
  // Basics
  updateBasics: (field: keyof Basics, value: string) => void;
  // Experience
  addExperience: () => void;
  duplicateExperience: (id: string) => void;
  updateExperience: (id: string, updated: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
  reorderBullets: (experienceId: string, startIndex: number, endIndex: number) => void;
  // Education
  addEducation: () => void;
  duplicateEducation: (id: string) => void;
  updateEducation: (id: string, updated: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (startIndex: number, endIndex: number) => void;
  // Skills
  skills: SkillCategory[];
  flatSkills: string[];
  addSkillCategory: (categoryName?: string) => void;
  updateSkillCategory: (id: string, category: string, items: string[]) => void;
  removeSkillCategory: (id: string) => void;
  setSkills: (skills: string[] | SkillCategory[]) => void;
  // Projects
  addProject: () => void;
  duplicateProject: (id: string) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // Custom Sections
  addCustomSection: (heading?: string) => void;
  removeCustomSection: (id: string) => void;
  updateCustomSectionHeading: (id: string, heading: string) => void;
  addCustomEntry: (sectionId: string) => void;
  updateCustomEntry: (sectionId: string, entryId: string, updated: Partial<CustomEntry>) => void;
  removeCustomEntry: (sectionId: string, entryId: string) => void;
  // Section Ordering & Visibility
  reorderSections: (startIndex: number, endIndex: number) => void;
  setSectionOrder: (newOrder: string[]) => void;
  toggleSectionHidden: (sectionId: string) => void;
  isSectionHidden: (sectionId: string) => boolean;
  toggleSectionVisibility: (sectionKey: string) => void;
  // Design & Meta
  updateDesignMeta: (design: Partial<DesignMeta>) => void;
  setPageSize: (size: "A4" | "Letter") => void;
  setTemplate: (templateId: string) => void;
  // Versions Management (Phase 5)
  versions: ResumeVersion[];
  activeVersionId: string | null;
  activeResume: Resume;
  createTailoredVersion: (params: {
    name: string;
    company: string;
    role: string;
    jdText: string;
    tailoredResume: Resume;
    diffs: TailorDiff[];
    coverLetter?: string;
  }) => string;
  deleteVersion: (versionId: string) => void;
  switchVersion: (versionId: string | null) => void;
  updateVersionDiffStatus: (versionId: string, diffId: string, status: "accepted" | "rejected") => void;
  acceptAllVersionDiffs: (versionId: string) => void;
  rejectAllVersionDiffs: (versionId: string) => void;
  updateVersionCoverLetter: (versionId: string, coverLetter: string) => void;
  // State helpers
  resetToSample: () => void;
  completionPercentage: number;
  sectionCompletion: {
    basics: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
  };
  saveStatus: string;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saveStatus, setSaveStatus] = useState<string>("Saved just now");

  // Load from localStorage safely with v1 migration and fallback protection
  const [resume, setResume] = useState<Resume>(() => {
    if (typeof window === "undefined") {
      return sampleResume;
    }
    try {
      // Check for v2 data first, then v1
      const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (storedV2) {
        return loadResumeSafely(storedV2).resume;
      }
      const storedV1 = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
      if (storedV1) {
        return loadResumeSafely(storedV1).resume;
      }
    } catch (err) {
      console.warn("[ResumeContext] Failed reading stored data:", err);
    }
    return sampleResume;
  });

  // Debounced autosave (400ms) with visible status
  useEffect(() => {
    setSaveStatus("Saving...");
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(resume));
        setSaveStatus("Saved just now");
      } catch (err) {
        console.error("Failed to persist resume to localStorage:", err);
        setSaveStatus("Autosave error");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [resume]);

  // ==========================================
  // Versions Management State (Phase 5)
  // ==========================================
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("[ResumeContext] Failed reading versions:", e);
    }
    return [];
  });

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  // Persist versions on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.error("Failed persisting versions:", e);
    }
  }, [versions]);

  // Active resume is either the tailored version's resume or the primary base resume
  const activeResume = useMemo(() => {
    if (!activeVersionId) return resume;
    const v = versions.find((ver) => ver.id === activeVersionId);
    return v ? v.tailoredResume : resume;
  }, [activeVersionId, versions, resume]);

  const createTailoredVersion = useCallback(
    (params: {
      name: string;
      company: string;
      role: string;
      jdText: string;
      tailoredResume: Resume;
      diffs: TailorDiff[];
      coverLetter?: string;
    }): string => {
      const newVersion: ResumeVersion = {
        id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: params.name || `${params.company} — ${params.role}`,
        company: params.company,
        role: params.role,
        createdAt: new Date().toISOString(),
        jdText: params.jdText,
        tailoredResume: params.tailoredResume,
        diffs: params.diffs,
        coverLetter: params.coverLetter,
      };

      setVersions((prev) => [newVersion, ...prev]);
      setActiveVersionId(newVersion.id);
      return newVersion.id;
    },
    []
  );

  const deleteVersion = useCallback(
    (versionId: string) => {
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      if (activeVersionId === versionId) {
        setActiveVersionId(null);
      }
    },
    [activeVersionId]
  );

  const switchVersion = useCallback((versionId: string | null) => {
    setActiveVersionId(versionId);
  }, []);

  const updateVersionDiffStatus = useCallback(
    (versionId: string, diffId: string, status: "accepted" | "rejected") => {
      setVersions((prev) =>
        prev.map((v) => {
          if (v.id !== versionId) return v;
          const updatedDiffs = v.diffs.map((d) => (d.id === diffId ? { ...d, status } : d));
          const updatedTailoredResume = applyAcceptedDiffs(resume, v.tailoredResume, updatedDiffs);
          return {
            ...v,
            diffs: updatedDiffs,
            tailoredResume: updatedTailoredResume,
          };
        })
      );
    },
    [resume]
  );

  const acceptAllVersionDiffs = useCallback(
    (versionId: string) => {
      setVersions((prev) =>
        prev.map((v) => {
          if (v.id !== versionId) return v;
          const updatedDiffs = v.diffs.map((d) => ({ ...d, status: "accepted" as const }));
          const updatedTailoredResume = applyAcceptedDiffs(resume, v.tailoredResume, updatedDiffs);
          return {
            ...v,
            diffs: updatedDiffs,
            tailoredResume: updatedTailoredResume,
          };
        })
      );
    },
    [resume]
  );

  const rejectAllVersionDiffs = useCallback(
    (versionId: string) => {
      setVersions((prev) =>
        prev.map((v) => {
          if (v.id !== versionId) return v;
          const updatedDiffs = v.diffs.map((d) => ({ ...d, status: "rejected" as const }));
          return {
            ...v,
            diffs: updatedDiffs,
            tailoredResume: JSON.parse(JSON.stringify(resume)),
          };
        })
      );
    },
    [resume]
  );

  const updateVersionCoverLetter = useCallback((versionId: string, coverLetter: string) => {
    setVersions((prev) =>
      prev.map((v) => (v.id === versionId ? { ...v, coverLetter } : v))
    );
  }, []);


  // Basics
  const updateBasics = useCallback((field: keyof Basics, value: string) => {
    setResume((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value,
        // sync headline and title
        ...(field === "headline" ? { title: value } : {}),
        ...(field === "title" ? { headline: value } : {}),
      },
    }));
  }, []);

  // Experience actions
  const addExperience = useCallback(() => {
    const newEntry: Experience = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      company: "New Company",
      role: "Position / Role",
      location: "",
      start: "2023",
      end: "Present",
      current: true,
      bullets: ["Accomplished [X] by executing [Y], yielding [Z] measurable impact."],
    };
    setResume((prev) => ({
      ...prev,
      experience: [newEntry, ...prev.experience],
    }));
  }, []);

  const duplicateExperience = useCallback((id: string) => {
    setResume((prev) => {
      const idx = prev.experience.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const original = prev.experience[idx];
      const copy: Experience = {
        ...original,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        company: `${original.company} (Copy)`,
      };
      const updated = [...prev.experience];
      updated.splice(idx + 1, 0, copy);
      return { ...prev, experience: updated };
    });
  }, []);

  const updateExperience = useCallback((id: string, updated: Partial<Experience>) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  }, []);

  const reorderExperience = useCallback((startIndex: number, endIndex: number) => {
    setResume((prev) => {
      const result = Array.from(prev.experience);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, experience: result };
    });
  }, []);

  const reorderBullets = useCallback((expId: string, startIndex: number, endIndex: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const bullets = Array.from(exp.bullets);
        const [removed] = bullets.splice(startIndex, 1);
        bullets.splice(endIndex, 0, removed);
        return { ...exp, bullets };
      }),
    }));
  }, []);

  // Education actions
  const addEducation = useCallback(() => {
    const newEntry: Education = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      school: "University / Institution",
      degree: "Degree / Program",
      field: "Field of Study",
      start: "2019",
      end: "2023",
      year: "2023",
      gpa: "",
    };
    setResume((prev) => ({
      ...prev,
      education: [newEntry, ...prev.education],
    }));
  }, []);

  const duplicateEducation = useCallback((id: string) => {
    setResume((prev) => {
      const idx = prev.education.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const original = prev.education[idx];
      const copy: Education = {
        ...original,
        id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        school: `${original.school} (Copy)`,
      };
      const updated = [...prev.education];
      updated.splice(idx + 1, 0, copy);
      return { ...prev, education: updated };
    });
  }, []);

  const updateEducation = useCallback((id: string, updated: Partial<Education>) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  }, []);

  const reorderEducation = useCallback((startIndex: number, endIndex: number) => {
    setResume((prev) => {
      const result = Array.from(prev.education);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, education: result };
    });
  }, []);

  // Skills actions
  const flatSkills = useMemo(() => getFlatSkills(resume.skills), [resume.skills]);

  const addSkillCategory = useCallback((categoryName = "New Category") => {
    const newCat: SkillCategory = {
      id: `skill-cat-${Date.now()}`,
      category: categoryName,
      items: ["Skill 1", "Skill 2"],
    };
    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, newCat],
    }));
  }, []);

  const updateSkillCategory = useCallback((id: string, category: string, items: string[]) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.map((cat) => (cat.id === id ? { ...cat, category, items } : cat)),
    }));
  }, []);

  const removeSkillCategory = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((c) => c.id !== id),
    }));
  }, []);

  const setSkills = useCallback((skillsInput: string[] | SkillCategory[]) => {
    setResume((prev) => {
      if (skillsInput.length > 0 && typeof skillsInput[0] === "string") {
        return {
          ...prev,
          skills: [
            {
              id: "skill-cat-default",
              category: "Core Skills",
              items: skillsInput as string[],
            },
          ],
        };
      }
      return {
        ...prev,
        skills: skillsInput as SkillCategory[],
      };
    });
  }, []);

  // Projects actions
  const addProject = useCallback(() => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "New Project",
      link: "github.com/username/project",
      tech: ["React", "TypeScript"],
      bullets: ["Built [feature] which improved [metric] by [number]%."],
    };
    setResume((prev) => ({
      ...prev,
      projects: [newProj, ...(prev.projects || [])],
    }));
  }, []);

  const duplicateProject = useCallback((id: string) => {
    setResume((prev) => {
      const list = prev.projects || [];
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy: Project = {
        ...list[idx],
        id: `proj-${Date.now()}`,
        name: `${list[idx].name} (Copy)`,
      };
      const updated = [...list];
      updated.splice(idx + 1, 0, copy);
      return { ...prev, projects: updated };
    });
  }, []);

  const updateProject = useCallback((id: string, updated: Partial<Project>) => {
    setResume((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id),
    }));
  }, []);

  // Custom sections
  const addCustomSection = useCallback((heading = "Custom Section") => {
    const newSection: CustomSection = {
      id: `custom-sec-${Date.now()}`,
      heading,
      entries: [
        {
          id: `entry-${Date.now()}`,
          title: "Entry Title",
          subtitle: "Subtitle / Role",
          date: "2024",
          bullets: ["Key detail or accomplishment."],
        },
      ],
    };
    setResume((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection],
      meta: {
        ...prev.meta,
        sectionOrder: [...prev.meta.sectionOrder, newSection.id],
      },
    }));
  }, []);

  const removeCustomSection = useCallback((id: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((s) => s.id !== id),
      meta: {
        ...prev.meta,
        sectionOrder: prev.meta.sectionOrder.filter((secId) => secId !== id),
      },
    }));
  }, []);

  const updateCustomSectionHeading = useCallback((id: string, heading: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) => (s.id === id ? { ...s, heading } : s)),
    }));
  }, []);

  const addCustomEntry = useCallback((sectionId: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          entries: [
            ...s.entries,
            {
              id: `entry-${Date.now()}`,
              title: "New Item",
              subtitle: "",
              date: "",
              bullets: ["Description of achievement."],
            },
          ],
        };
      }),
    }));
  }, []);

  const updateCustomEntry = useCallback((sectionId: string, entryId: string, updated: Partial<CustomEntry>) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...updated } : e)),
        };
      }),
    }));
  }, []);

  const removeCustomEntry = useCallback((sectionId: string, entryId: string) => {
    setResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          entries: s.entries.filter((e) => e.id !== entryId),
        };
      }),
    }));
  }, []);

  // Section Ordering & Visibility
  const reorderSections = useCallback((startIndex: number, endIndex: number) => {
    setResume((prev) => {
      const order = Array.from(prev.meta.sectionOrder);
      const [removed] = order.splice(startIndex, 1);
      order.splice(endIndex, 0, removed);
      return {
        ...prev,
        meta: {
          ...prev.meta,
          sectionOrder: order,
        },
      };
    });
  }, []);

  const setSectionOrder = useCallback((newOrder: string[]) => {
    setResume((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        sectionOrder: newOrder,
      },
    }));
  }, []);

  const toggleSectionHidden = useCallback((sectionId: string) => {
    setResume((prev) => {
      const isHidden = prev.meta.hiddenSections.includes(sectionId);
      const newHidden = isHidden
        ? prev.meta.hiddenSections.filter((s) => s !== sectionId)
        : [...prev.meta.hiddenSections, sectionId];
      return {
        ...prev,
        meta: {
          ...prev.meta,
          hiddenSections: newHidden,
        },
        sectionVisibility: {
          ...prev.sectionVisibility,
          [sectionId]: isHidden,
        },
      };
    });
  }, []);

  const isSectionHidden = useCallback(
    (sectionId: string) => {
      return resume.meta.hiddenSections.includes(sectionId);
    },
    [resume.meta.hiddenSections]
  );

  const toggleSectionVisibility = useCallback(
    (sectionKey: string) => {
      toggleSectionHidden(sectionKey);
    },
    [toggleSectionHidden]
  );

  // Design & Meta
  const updateDesignMeta = useCallback((design: Partial<DesignMeta>) => {
    setResume((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        design: {
          ...prev.meta.design,
          ...design,
        },
      },
    }));
  }, []);

  const setPageSize = useCallback((size: "A4" | "Letter") => {
    setResume((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        pageSize: size,
      },
    }));
  }, []);

  const setTemplate = useCallback((templateId: string) => {
    setResume((prev) => ({
      ...prev,
      template: templateId,
    }));
  }, []);

  // Reset to sample
  const resetToSample = useCallback(() => {
    setResume({ ...sampleResume });
  }, []);

  // Completion calculation
  const { completionPercentage, sectionCompletion } = useMemo(() => {
    let score = 0;
    const { basics, experience, education } = resume;

    // Basics: up to 30 points
    const hasName = Boolean(basics.name?.trim());
    const hasHeadline = Boolean(basics.headline?.trim() || basics.title?.trim());
    const hasEmail = Boolean(basics.email?.trim());
    const hasLocation = Boolean(basics.location?.trim());
    const hasSummary = Boolean(basics.summary?.trim() || resume.summary?.trim());

    if (hasName) score += 5;
    if (hasHeadline) score += 5;
    if (hasEmail) score += 5;
    if (hasLocation) score += 5;
    if (hasSummary) score += 10;
    const basicsComplete = hasName && hasHeadline && (hasEmail || hasLocation);

    // Experience: up to 30 points
    const hasExp = experience.length > 0;
    const hasExpBullets = experience.some((e) => e.bullets.some((b) => b.trim().length > 10));
    if (hasExp) score += 15;
    if (hasExpBullets) score += 15;
    const expComplete = hasExp && hasExpBullets;

    // Education: up to 15 points
    const hasEdu = education.length > 0 && education.some((e) => Boolean(e.school.trim() && e.degree.trim()));
    if (hasEdu) score += 15;
    const eduComplete = hasEdu;

    // Skills: up to 15 points
    const flat = getFlatSkills(resume.skills);
    const hasSkills = flat.length >= 3;
    if (hasSkills) score += 15;
    else if (flat.length > 0) score += 5;
    const skillsComplete = hasSkills;

    // Projects: 10 bonus points
    const hasProjects = (resume.projects?.length || 0) > 0;
    if (hasProjects) score += 10;

    return {
      completionPercentage: Math.min(score, 100),
      sectionCompletion: {
        basics: basicsComplete,
        experience: expComplete,
        education: eduComplete,
        skills: skillsComplete,
        projects: hasProjects,
      },
    };
  }, [resume]);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        setResume,
        updateBasics,
        addExperience,
        duplicateExperience,
        updateExperience,
        removeExperience,
        reorderExperience,
        reorderBullets,
        addEducation,
        duplicateEducation,
        updateEducation,
        removeEducation,
        reorderEducation,
        skills: resume.skills,
        flatSkills,
        addSkillCategory,
        updateSkillCategory,
        removeSkillCategory,
        setSkills,
        addProject,
        duplicateProject,
        updateProject,
        removeProject,
        addCustomSection,
        removeCustomSection,
        updateCustomSectionHeading,
        addCustomEntry,
        updateCustomEntry,
        removeCustomEntry,
        reorderSections,
        setSectionOrder,
        toggleSectionHidden,
        isSectionHidden,
        toggleSectionVisibility,
        updateDesignMeta,
        setPageSize,
        setTemplate,
        versions,
        activeVersionId,
        activeResume,
        createTailoredVersion,
        deleteVersion,
        switchVersion,
        updateVersionDiffStatus,
        acceptAllVersionDiffs,
        rejectAllVersionDiffs,
        updateVersionCoverLetter,
        resetToSample,
        completionPercentage,
        sectionCompletion,
        saveStatus,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};
