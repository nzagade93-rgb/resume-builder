"use client";

import React from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 110,
  strokeWidth = 9,
  label = "Match Score",
  sublabel = "estimate, not an ATS guarantee",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Curated color palette
  const strokeColor =
    clampedScore >= 75
      ? "#10b981" // emerald-500
      : clampedScore >= 50
      ? "#f59e0b" // amber-500
      : "#f43f5e"; // rose-500

  const trackColor = "currentColor";

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            stroke={trackColor}
            fill="transparent"
          />
          {/* Animated progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {clampedScore}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Match
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[210px] leading-tight italic">
          &quot;{sublabel}&quot;
        </p>
      </div>
    </div>
  );
};
