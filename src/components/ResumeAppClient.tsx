"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ResumeProvider } from "@/context/ResumeContext";
import { ResumeApp } from "@/components/ResumeApp";

export const ResumeAppClient: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ResumeProvider>
          <ResumeApp />
        </ResumeProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};
