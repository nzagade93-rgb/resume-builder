"use client";

import React from "react";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral:
      "bg-slate-100 text-[#0F172A] dark:bg-slate-800 dark:text-[#F8FAFC] border-slate-200 dark:border-slate-700/80",
    accent:
      "bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/50 dark:text-[#93C5FD] border-blue-200 dark:border-blue-900/60",
    success:
      "bg-emerald-50 text-[#065F46] dark:bg-emerald-950/50 dark:text-[#6EE7B7] border-emerald-200 dark:border-emerald-900/60",
    warning:
      "bg-amber-50 text-[#92400E] dark:bg-amber-950/50 dark:text-[#FCD34D] border-amber-200 dark:border-amber-900/60",
    danger:
      "bg-rose-50 text-[#991B1B] dark:bg-rose-950/50 dark:text-[#FCA5A5] border-rose-200 dark:border-rose-900/60",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-0.5 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-tight ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
