"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useResume } from "@/context/ResumeContext";
import { useToast } from "@/components/ui/Toast";
import { loadSnapshots, recordSnapshot } from "@/lib/supabase/client";
import type { VersionSnapshot } from "@/types/database";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resume, setResume } = useResume();
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSnapshots(loadSnapshots());
    }
  }, [isOpen]);

  const handleCreateSnapshot = () => {
    recordSnapshot(
      resume,
      customNote.trim() || `Manual Snapshot (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
      "User-initiated checkpoint snapshot"
    );
    setSnapshots(loadSnapshots());
    setCustomNote("");
    toast("Saved new version checkpoint!", "success");
  };

  const handleRestore = (snap: VersionSnapshot) => {
    // Record current state before restoring
    recordSnapshot(resume, "Pre-Restore Auto-Backup", "Created automatically before restoring an earlier snapshot.");
    setResume(snap.resumeSnapshot);
    toast(`Restored version from ${new Date(snap.timestamp).toLocaleDateString()}`, "success");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⏱️ Version History & Snapshots"
      description="Review automatic revision snapshots and restore any previous version with 1-click."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Manual Snapshot Creator */}
        <div className="flex items-center gap-2 p-3.5 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Label this checkpoint (e.g. 'Before tailoring for Google')..."
            className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16] transition"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCreateSnapshot}
          >
            📸 Create Checkpoint
          </Button>
        </div>

        {/* Snapshots Timeline List */}
        {snapshots.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-xl block mb-1">⏱️</span>
            <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">No version snapshots yet.</p>
            <p className="text-[11px] mt-0.5">
              Checkpoints are created automatically as you tailor and edit your resume.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {snapshots.map((snap) => {
              const dateObj = new Date(snap.timestamp);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={snap.id}
                  className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {snap.title}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {snap.description}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestore(snap)}
                    className="shrink-0"
                  >
                    ↻ Restore
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
