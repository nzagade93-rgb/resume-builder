"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Non-negotiable Rule 4: never log resume content in errors
    console.error("Application error encountered:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-2xl mx-auto">
          ⚠️
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Something went wrong
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          An unexpected interface error occurred. Don&apos;t worry—your resume data remains safely preserved in your browser&apos;s storage.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button variant="primary" size="sm" onClick={() => reset()}>
            Try Again
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Reload Home
          </Button>
        </div>
      </div>
    </div>
  );
}
