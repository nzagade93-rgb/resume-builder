"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  exportAllUserDataJson,
  deleteAllUserData,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { useResume } from "@/context/ResumeContext";
import { useTheme } from "@/context/ThemeContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { toast } = useToast();
  const { resetToSample } = useResume();
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Export All Data
  const handleExportData = () => {
    try {
      setIsExporting(true);
      const jsonString = exportAllUserDataJson();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_builder_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast("Your complete resume history, versions, and applications were downloaded.", "success");
    } catch {
      toast("An error occurred while compiling your data.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Delete All Data
  const handleDeleteAllData = async () => {
    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      toast('Please type "DELETE" in the input field to proceed.', "warning");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAllUserData();
      resetToSample();
      setShowDeleteConfirm(false);
      setDeleteInput("");
      onClose();

      toast("All local resumes, snapshots, tailored versions, and cloud sessions have been permanently wiped.", "success");

      // Reload page after a brief moment to ensure pristine blank state
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch {
      toast("Failed to erase all data completely.", "error");
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy, Storage & Account Settings"
      description="Manage your data ownership, cloud persistence, and strict privacy controls."
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* PRIVACY & DATA GUARANTEE BANNER */}
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 flex items-start gap-3.5">
          <span className="text-xl shrink-0">🛡️</span>
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">
              Non-Negotiable Privacy Guarantee
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Your resume contains sensitive personal information. We never log resume contents,
              sell your profile, or transmit your data to third-party ad networks. You maintain 100%
              ownership and can export or wipe everything at any moment.
            </p>
          </div>
        </div>

        {/* APPEARANCE & THEME (Light / Dark / System) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🎨 Appearance & Theme</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose between sleek dark mode, crisp light mode, or match system settings.
            </p>
          </div>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-semibold select-none shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                theme === "light"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>☀️</span>
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                theme === "dark"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🌙</span>
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                theme === "system"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🖥️</span>
              <span>System</span>
            </button>
          </div>
        </div>

        {/* CLOUD SYNC & ACCOUNT STATUS */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>☁️ Storage & Multi-Device Sync</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {isSupabaseConfigured ? "Supabase Cloud Ready" : "Guest Mode (Local)"}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isSupabaseConfigured
                  ? "Connected to cloud backend. Sign in to seamlessly sync your resumes across mobile and laptop."
                  : "All data is currently stored locally in your browser's private storage (zero servers)."}
              </p>
            </div>
            {onOpenAuth && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                Sign In / Sync
              </Button>
            )}
          </div>
        </div>

        {/* DATA PORTABILITY (EXPORT ALL) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📥 Export All My Data</span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                JSON Bundle
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download every resume version, automatic snapshot, job application, and custom section in a portable JSON file.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            loading={isExporting}
            className="shrink-0"
          >
            Export All (.json)
          </Button>
        </div>

        {/* DANGER ZONE: DELETE ALL DATA */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <span>⚠️ Danger Zone: Delete All My Data</span>
              </h4>
              <p className="text-xs text-rose-700/90 dark:text-rose-300/80 mt-0.5 leading-relaxed">
                Permanently wipes all resumes, tailored versions, snapshot history, applications, and cloud rows. This action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0"
              >
                Delete All Data
              </Button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/80 space-y-3">
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                To confirm permanent deletion, type <span className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded text-rose-900 dark:text-rose-100">DELETE</span> below:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 font-mono transition"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteAllData}
                  loading={isDeleting}
                  disabled={deleteInput.trim().toUpperCase() !== "DELETE"}
                >
                  Confirm Erase
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
