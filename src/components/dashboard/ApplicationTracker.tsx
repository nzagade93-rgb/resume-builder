"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { JobApplication, ApplicationStatus } from "@/types/database";
import { loadApplications, saveApplications } from "@/lib/supabase/client";
import { useResume } from "@/context/ResumeContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatResumeTitle } from "@/lib/schema";

interface StatusColumn {
  id: ApplicationStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  borderLeftColor: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyHint: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  {
    id: "wishlist",
    label: "Wishlist",
    dotColor: "bg-slate-400 dark:bg-slate-500",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
    borderColor: "border-slate-300 dark:border-slate-700",
    borderLeftColor: "border-l-slate-400 dark:border-l-slate-500",
    emptyIcon: "✨",
    emptyTitle: "Wishlist is empty",
    emptyHint: "Save dream companies and aspirational roles to tailor for later.",
  },
  {
    id: "applied",
    label: "Applied",
    dotColor: "bg-[#2563EB]",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeText: "text-[#2563EB] dark:text-[#60A5FA]",
    borderColor: "border-blue-300 dark:border-blue-700",
    borderLeftColor: "border-l-[#2563EB] dark:border-l-[#3B82F6]",
    emptyIcon: "📨",
    emptyTitle: "No applications submitted",
    emptyHint: "Track resumes you've submitted to monitor response timelines.",
  },
  {
    id: "interviewing",
    label: "Interviewing",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeText: "text-amber-800 dark:text-amber-300",
    borderColor: "border-amber-300 dark:border-amber-700",
    borderLeftColor: "border-l-amber-500 dark:border-l-amber-400",
    emptyIcon: "🎯",
    emptyTitle: "No active interviews",
    emptyHint: "Move roles here once recruiters reach out for screening calls.",
  },
  {
    id: "offer",
    label: "Offer",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    borderLeftColor: "border-l-emerald-500 dark:border-l-emerald-400",
    emptyIcon: "🏆",
    emptyTitle: "No offers yet",
    emptyHint: "Keep tailoring and preparing—your first offer will land here!",
  },
  {
    id: "rejected",
    label: "Archived / Rejected",
    dotColor: "bg-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeText: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-300 dark:border-rose-700",
    borderLeftColor: "border-l-rose-400 dark:border-l-rose-500",
    emptyIcon: "🗄️",
    emptyTitle: "Archive is clear",
    emptyHint: "Closed loops or declined opportunities are cataloged here.",
  },
];

// Lightweight SVG Sparkline Component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 68;
  const height = 24;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Company Monogram Avatar Helper
const getCompanyMonogram = (name: string) => {
  const clean = (name || "").trim();
  if (!clean) {
    return {
      letter: "?",
      bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    };
  }
  const letter = clean.charAt(0).toUpperCase();
  const palette: Record<string, string> = {
    A: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
    B: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
    C: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
    D: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
    E: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    F: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
    G: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/60",
    H: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60",
    I: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900/60",
    L: "bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/60",
    M: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-900/60",
    N: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900/60",
    O: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
    P: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-900/60",
    S: "bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/60",
    T: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/60",
    U: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60",
    W: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
  };
  const bg =
    palette[letter] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  return { letter, bg };
};

// Days Ago Calculator
const getDaysAgo = (dateStr: string): { days: number; label: string } => {
  if (!dateStr) return { days: 0, label: "Recently" };
  try {
    const target = new Date(dateStr);
    const now = new Date();
    // Normalize to date-only for precision
    const diffTime = Math.max(0, now.getTime() - target.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { days: 0, label: "Today" };
    if (diffDays === 1) return { days: 1, label: "1d ago" };
    if (diffDays < 30) return { days: diffDays, label: `${diffDays}d ago` };
    const months = Math.floor(diffDays / 30);
    return { days: diffDays, label: `${months}mo ago` };
  } catch {
    return { days: 0, label: "Recently" };
  }
};

// Follow-up status check (7+ days with no update in applied or interviewing status)
const needsFollowUp = (app: JobApplication): boolean => {
  if (app.status !== "applied" && app.status !== "interviewing") return false;
  const refDate = app.updatedAt || app.appliedDate;
  const { days } = getDaysAgo(refDate);
  return days >= 7;
};

const formatAppDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

type SortField = "company" | "role" | "status" | "appliedDate" | "location" | "salaryRange";

interface ApplicationTrackerProps {
  onCountChange?: (count: number) => void;
  onOpenEditor?: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  onCountChange,
  onOpenEditor,
}) => {
  const { resume, versions, switchVersion } = useResume();
  const { toast } = useToast();

  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Drag and Drop state
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);

  // Table sorting state
  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Form state for adding/editing
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedDate: string;
    location: string;
    salaryRange: string;
    notes: string;
    linkedResumeTitle: string;
  }>({
    company: "",
    role: "",
    status: "applied",
    appliedDate: new Date().toISOString().slice(0, 10),
    location: "",
    salaryRange: "",
    notes: "",
    linkedResumeTitle: formatResumeTitle(resume.basics.name, "Primary Resume"),
  });

  // Load applications on mount with initial skeleton timeout for smooth entry
  useEffect(() => {
    const loaded = loadApplications();
    if (loaded.length === 0) {
      // Seed high-quality initial samples for candidates
      const sampleApps: JobApplication[] = [
        {
          id: "app-sample-1",
          company: "Stripe",
          role: "Senior Full Stack Engineer",
          status: "interviewing",
          appliedDate: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
          location: "San Francisco, CA (Remote)",
          salaryRange: "$180k - $210k",
          linkedResumeTitle: "Primary Resume",
          notes: "Round 2 technical architecture interview scheduled for Thursday.",
          createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        },
        {
          id: "app-sample-2",
          company: "Linear",
          role: "Product Engineer",
          status: "applied",
          appliedDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
          location: "Remote",
          salaryRange: "$170k - $195k",
          linkedResumeTitle: "Linear - Product Engineer",
          notes: "Applied with tailored resume and cover letter via referral.",
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "app-sample-3",
          company: "Notion",
          role: "Frontend Systems Engineer",
          status: "offer",
          appliedDate: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
          location: "New York, NY",
          salaryRange: "$190k - $215k",
          linkedResumeTitle: "Primary Resume",
          notes: "Written offer letter received. Reviewing compensation breakdown.",
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ];
      setApps(sampleApps);
      saveApplications(sampleApps);
      onCountChange?.(sampleApps.length);
    } else {
      setApps(loaded);
      onCountChange?.(loaded.length);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [onCountChange]);

  const updateAppsState = (updated: JobApplication[]) => {
    setApps(updated);
    saveApplications(updated);
    onCountChange?.(updated.length);
  };

  const handleSaveApp = () => {
    if (!formData.company.trim() || !formData.role.trim()) {
      toast("Company and Role are required.", "warning");
      return;
    }

    if (editingAppId) {
      const updated = apps.map((a) =>
        a.id === editingAppId
          ? {
              ...a,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      updateAppsState(updated);
      toast("Application details updated.", "success");
    } else {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newApp, ...apps];
      updateAppsState(updated);
      toast("Job application tracked.", "success");
    }

    setIsAddModalOpen(false);
    setEditingAppId(null);
  };

  const handleDeleteApp = (id: string, company: string) => {
    const updated = apps.filter((a) => a.id !== id);
    updateAppsState(updated);
    toast(`Removed ${company} from your tracker.`, "info");
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const updated = apps.map((a) =>
      a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
    );
    updateAppsState(updated);
    const colName = STATUS_COLUMNS.find((c) => c.id === newStatus)?.label || newStatus;
    toast(`Moved to ${colName}.`, "info");
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingAppId(id);
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, targetColId: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingAppId;
    setDragOverColumn(null);
    setDraggingAppId(null);

    if (!id) return;
    const targetApp = apps.find((a) => a.id === id);
    if (!targetApp || targetApp.status === targetColId) return;

    handleStatusChange(id, targetColId);
  };

  // Click on Linked Resume chip: opens that exact resume version in the editor
  const handleOpenLinkedResume = (resumeTitle?: string) => {
    if (!resumeTitle) return;

    // Check if it matches a tailored version
    const matchedVersion = versions.find(
      (v) =>
        v.name === resumeTitle ||
        resumeTitle.includes(v.name) ||
        (v.company && resumeTitle.includes(v.company))
    );

    if (matchedVersion) {
      switchVersion(matchedVersion.id);
      toast(`Switched to "${matchedVersion.name}" version.`, "success");
    } else {
      switchVersion(null);
      toast(`Switched to primary resume.`, "info");
    }

    if (onOpenEditor) {
      onOpenEditor();
    }
  };

  const openEditModal = (app: JobApplication) => {
    setEditingAppId(app.id);
    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      appliedDate: app.appliedDate,
      location: app.location || "",
      salaryRange: app.salaryRange || "",
      notes: app.notes || "",
      linkedResumeTitle: app.linkedResumeTitle || "Primary Resume",
    });
    setIsAddModalOpen(true);
  };

  const openNewModal = (preselectedStatus: ApplicationStatus = "applied") => {
    setEditingAppId(null);
    setFormData({
      company: "",
      role: "",
      status: preselectedStatus,
      appliedDate: new Date().toISOString().slice(0, 10),
      location: "",
      salaryRange: "",
      notes: "",
      linkedResumeTitle: formatResumeTitle(resume.basics.name, "Primary Resume"),
    });
    setIsAddModalOpen(true);
  };

  // Pipeline Metric Counts & Conversions
  const stats = useMemo(() => {
    const total = apps.length;
    const wishlist = apps.filter((a) => a.status === "wishlist").length;
    const applied = apps.filter((a) => a.status === "applied").length;
    const interviewing = apps.filter((a) => a.status === "interviewing").length;
    const offer = apps.filter((a) => a.status === "offer").length;
    const rejected = apps.filter((a) => a.status === "rejected").length;

    // Conversion rates
    const appliedBase = applied + interviewing + offer + rejected;
    const interviewRate =
      appliedBase > 0 ? Math.round(((interviewing + offer) / appliedBase) * 100) : 0;
    const offerRate =
      interviewing + offer > 0 ? Math.round((offer / (interviewing + offer)) * 100) : 0;
    const overallYield = total > 0 ? Math.round((offer / total) * 100) : 0;

    return {
      total,
      wishlist,
      applied,
      interviewing,
      offer,
      rejected,
      interviewRate,
      offerRate,
      overallYield,
    };
  }, [apps]);

  // Filtered & Sorted applications
  const filteredApps = useMemo(() => {
    let result = apps;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(query) ||
          a.role.toLowerCase().includes(query) ||
          (a.location && a.location.toLowerCase().includes(query)) ||
          (a.notes && a.notes.toLowerCase().includes(query))
      );
    }

    return [...result].sort((a, b) => {
      let comp = 0;
      if (sortField === "company") {
        comp = a.company.localeCompare(b.company);
      } else if (sortField === "role") {
        comp = a.role.localeCompare(b.role);
      } else if (sortField === "status") {
        comp = a.status.localeCompare(b.status);
      } else if (sortField === "appliedDate") {
        comp = (a.appliedDate || "").localeCompare(b.appliedDate || "");
      } else if (sortField === "location") {
        comp = (a.location || "").localeCompare(b.location || "");
      } else if (sortField === "salaryRange") {
        comp = (a.salaryRange || "").localeCompare(b.salaryRange || "");
      }
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [apps, searchQuery, sortField, sortDirection]);

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. PREMIUM KPI METRICS CARDS
          ========================================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs h-32 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Roles Card (Neutral) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total Roles
                </span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
                  {stats.total}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-lg shadow-xs shrink-0">
                💼
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span>Active Hunt</span>
              </span>
              <Sparkline data={[2, 3, 3, 5, 4, 6, stats.total || 4]} color="#64748B" />
            </div>
          </div>

          {/* Applied Card (Blue) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider block">
                  Applied
                </span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2563EB] dark:text-[#60A5FA] font-mono tabular-nums mt-1">
                  {stats.applied}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-lg shadow-xs shrink-0">
                📨
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-[#2563EB] dark:bg-blue-950/50 dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40">
                <span>↑ 3 submitted</span>
              </span>
              <Sparkline data={[1, 1, 2, 3, 2, 4, Math.max(stats.applied, 1)]} color="#2563EB" />
            </div>
          </div>

          {/* Interviewing Card (Amber) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Interviewing
                </span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-1">
                  {stats.interviewing}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center text-lg shadow-xs shrink-0">
                🎯
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                <span>{stats.interviewRate}% interview rate</span>
              </span>
              <Sparkline data={[0, 1, 1, 2, 1, 2, Math.max(stats.interviewing, 1)]} color="#D97706" />
            </div>
          </div>

          {/* Offers Card (Green) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Offers
                </span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                  {stats.offer}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-lg shadow-xs shrink-0">
                🏆
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <span>{stats.offerRate}% conversion</span>
              </span>
              <Sparkline data={[0, 0, 1, 0, 1, 1, Math.max(stats.offer, 1)]} color="#059669" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. PIPELINE FUNNEL STRIP
          ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Pipeline Conversion Funnel
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              • Real-time throughput
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Overall Yield: <strong className="text-emerald-600 dark:text-emerald-400">{stats.overallYield}%</strong>
          </span>
        </div>

        {/* Funnel Steps Container */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Step 1: Wishlist */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 relative">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Wishlist
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                {stats.wishlist}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Prospecting pool</p>
          </div>

          {/* Step 2: Applied */}
          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 relative">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                Applied
              </span>
              <span className="font-mono tabular-nums font-bold text-[#2563EB] dark:text-[#60A5FA]">
                {stats.applied}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Applications</span>
              <span className="text-[10px] font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                100% in
              </span>
            </div>
          </div>

          {/* Step 3: Interviewing */}
          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 relative">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Interviewing
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400">
                {stats.interviewing}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Passed screen</span>
              <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-white dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                {stats.interviewRate}% conv
              </span>
            </div>
          </div>

          {/* Step 4: Offer */}
          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 relative">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Offer
              </span>
              <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                {stats.offer}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Final selection</span>
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900">
                {stats.offerRate}% conv
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TOOLBAR: SEARCH, VIEW TOGGLE, PRIMARY ACTION
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search company, role, location, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition duration-150"
          />
        </div>

        {/* View Segmented Toggle + Track Button */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-semibold select-none">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z"
                />
              </svg>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <span>Table</span>
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openNewModal("applied")}
          >
            <span>+</span>
            <span>Track Application</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          4. KANBAN BOARD VIEW (Smooth Drag & Drop, Left Border, Quick Action on Hover)
          ========================================================================= */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none snap-x snap-mandatory scroll-smooth px-1">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            const isColumnDropTarget = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={handleDragLeaveColumn}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`flex flex-col flex-1 shrink-0 snap-start min-w-[260px] sm:min-w-[280px] xl:min-w-[260px] 2xl:min-w-[300px] max-w-[340px] rounded-xl p-3.5 border transition-all duration-150 min-h-[520px] ${
                  isColumnDropTarget
                    ? "border-2 border-dashed border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#2563EB]/20 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120]"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dotColor}`} />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider truncate">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-mono tabular-nums">
                      {colApps.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openNewModal(col.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition duration-150 cursor-pointer text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    title={`Add application to ${col.label}`}
                  >
                    +
                  </button>
                </div>

                {/* Dropzone Hint when dragging */}
                {isColumnDropTarget && (
                  <div className="mb-3 p-2.5 rounded-lg border-2 border-dashed border-[#2563EB]/60 bg-blue-100/50 dark:bg-blue-900/30 text-center text-xs text-[#2563EB] dark:text-[#60A5FA] font-medium animate-pulse">
                    Drop to move to {col.label}
                  </div>
                )}

                {/* Cards List */}
                <div className="flex-1 space-y-3">
                  {colApps.map((app) => {
                    const monogram = getCompanyMonogram(app.company);
                    const daysAgo = getDaysAgo(app.appliedDate);
                    const followUpAlert = needsFollowUp(app);
                    const isDragging = draggingAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragEnd={() => {
                          setDraggingAppId(null);
                          setDragOverColumn(null);
                        }}
                        className={`group relative p-3.5 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 border-l-[4px] ${col.borderLeftColor} shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 space-y-2.5 text-xs cursor-grab active:cursor-grabbing ${
                          isDragging ? "opacity-40 scale-[0.98] ring-2 ring-[#2563EB]/40" : ""
                        }`}
                      >
                        {/* 1. Header: Monogram Avatar + Company + Role + Hover Quick Action Menu */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Company Avatar / Monogram */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${monogram.bg} shadow-xs`}
                              title={app.company}
                            >
                              {monogram.letter}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition duration-150 truncate">
                                {app.company}
                              </h4>
                              <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold truncate mt-0.5">
                                {app.role}
                              </p>
                            </div>
                          </div>

                          {/* Days Ago label (visible by default) */}
                          <span className="text-[10.5px] font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                            {daysAgo.label}
                          </span>
                        </div>

                        {/* Quick-Action Menu (Hover Only: Move Stage, Edit, Delete) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          {/* Quick Move Select */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span>Move:</span>
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app.id, e.target.value as ApplicationStatus)
                              }
                              aria-label={`Move ${app.company} stage`}
                              className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
                            >
                              {STATUS_COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Edit & Delete Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(app)}
                              className="p-1 rounded text-slate-500 hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
                              title="Edit application"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApp(app.id, app.company)}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                              title="Delete application"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* 2. Location & Salary Compact Chips */}
                        {(app.location || app.salaryRange) && (
                          <div className="flex flex-wrap gap-1.5">
                            {app.location && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <span>📍</span>
                                <span className="truncate max-w-[140px]">{app.location}</span>
                              </span>
                            )}
                            {app.salaryRange && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                                <span>💰</span>
                                <span>{app.salaryRange}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* 3. Linked Resume Version Clickable Chip (Opens That Exact Resume) */}
                        {app.linkedResumeTitle && (
                          <button
                            type="button"
                            onClick={() => handleOpenLinkedResume(app.linkedResumeTitle)}
                            className="w-full text-left inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 hover:border-blue-300 transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
                            title="Click to open this tailored resume version in the editor"
                          >
                            <span className="shrink-0">📄</span>
                            <span className="truncate flex-1">{app.linkedResumeTitle}</span>
                            <span className="shrink-0 text-[10px] text-blue-500 opacity-80 group-hover:opacity-100">
                              ↗
                            </span>
                          </button>
                        )}

                        {/* 4. Notes snippet if present */}
                        {app.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* 5. Follow-Up Reminder Badge (7+ days with no update) */}
                        {followUpAlert && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[10.5px] font-semibold">
                            <span className="animate-pulse">⏰</span>
                            <span>Follow up needed (7d+ without update)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Better Empty State: illustration, 1-line explanation, primary action */}
                  {colApps.length === 0 && (
                    <div className="py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-2.5 bg-white/50 dark:bg-slate-900/30">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg shadow-xs">
                        {col.emptyIcon}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {col.emptyTitle}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug max-w-[200px] mx-auto">
                          {col.emptyHint}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openNewModal(col.id)}
                        className="mt-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-900/40 transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        + Add to {col.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
            5. TABLE VIEW: Sticky Header, Sortable Columns, Row Hover, Status Pills
            ========================================================================= */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800 select-none shadow-xs">
              <tr>
                <th
                  onClick={() => handleToggleSort("company")}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company & Role</span>
                    {sortField === "company" && (
                      <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort("status")}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage</span>
                    {sortField === "status" && (
                      <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort("appliedDate")}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date Applied</span>
                    {sortField === "appliedDate" && (
                      <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort("location")}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Location & Comp</span>
                    {sortField === "location" && (
                      <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5">Linked Resume</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const colMeta = STATUS_COLUMNS.find((c) => c.id === app.status);
                const monogram = getCompanyMonogram(app.company);
                const followUpAlert = needsFollowUp(app);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs border ${monogram.bg} shrink-0`}
                        >
                          {monogram.letter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 block">
                              {app.company}
                            </span>
                            {followUpAlert && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                title="7+ days with no update"
                              >
                                Follow-up
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                            {app.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          colMeta?.badgeBg || ""
                        } ${colMeta?.badgeText || ""}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colMeta?.dotColor}`} />
                        <span>{colMeta?.label || app.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums whitespace-nowrap">
                      {formatAppDate(app.appliedDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {app.location || "—"}
                      </div>
                      {app.salaryRange && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {app.salaryRange}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {app.linkedResumeTitle ? (
                        <button
                          type="button"
                          onClick={() => handleOpenLinkedResume(app.linkedResumeTitle)}
                          className="text-[#2563EB] dark:text-[#60A5FA] font-semibold text-xs hover:underline cursor-pointer flex items-center gap-1"
                          title="Open this resume version in editor"
                        >
                          <span>📄</span>
                          <span className="truncate max-w-[140px]">{app.linkedResumeTitle}</span>
                          <span>↗</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(app)}
                        className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded px-1"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id, app.company)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded px-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No applications matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          6. ADD / EDIT APPLICATION MODAL
          ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingAppId ? "Edit Job Application" : "Track New Job Application"}
        description="Record target company, interview stage, and link your customized resume version."
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Stripe, Apple, Linear"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Role Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Pipeline Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition cursor-pointer"
              >
                {STATUS_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Applied Date
              </label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote / San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Salary / Comp Range
              </label>
              <input
                type="text"
                placeholder="e.g. $180k - $210k"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Linked Resume Version
            </label>
            <select
              value={formData.linkedResumeTitle}
              onChange={(e) => setFormData({ ...formData, linkedResumeTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition cursor-pointer"
            >
              <option value="Primary Resume">Primary Resume</option>
              {versions.map((v) => (
                <option key={v.id} value={v.name}>
                  🎯 {v.name} ({v.company} - {v.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Notes & Next Steps
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Referral by Alex. Hiring manager interview next Tuesday. Prepared system design notes."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition resize-y"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveApp}>
              {editingAppId ? "Save Changes" : "Track Application"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationTracker;
