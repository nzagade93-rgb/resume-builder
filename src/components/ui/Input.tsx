"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      helperText,
      errorMessage,
      leftElement,
      rightElement,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight"
          >
            {label} {required && <span className="text-[#DC2626] dark:text-[#EF4444]">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 text-[#475569] dark:text-[#94A3B8] pointer-events-none flex items-center">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-150 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] placeholder:italic shadow-2xs focus:outline-none focus:ring-2 ${
              leftElement ? "pl-9" : ""
            } ${rightElement ? "pr-9" : ""} ${
              hasError
                ? "border-[#DC2626] dark:border-[#EF4444] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                : "border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 text-[#475569] dark:text-[#94A3B8] flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {errorMessage ? (
          <p className="text-xs font-medium text-[#DC2626] dark:text-[#EF4444]">{errorMessage}</p>
        ) : helperText ? (
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
