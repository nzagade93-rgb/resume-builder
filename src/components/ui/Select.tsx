"use client";

import React, { forwardRef } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      helperText,
      errorMessage,
      options,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError}
            className={`w-full appearance-none px-3 py-2 text-sm rounded-lg border transition-all duration-150 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] pr-9 shadow-2xs focus:outline-none focus:ring-2 cursor-pointer ${
              hasError
                ? "border-[#DC2626] dark:border-[#EF4444] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                : "border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/25 focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#475569] dark:text-[#94A3B8]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = "Select";
