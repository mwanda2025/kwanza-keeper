"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface BudgetProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/**
 * A circular progress indicator for budget tracking.
 * Features dynamic colors (Green, Orange, Red) and smooth mount animations.
 */
export function BudgetProgressRing({
  percentage,
  size = 140,
  strokeWidth = 14,
  label,
  className
}: BudgetProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Animate on mount to provide a dynamic feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, percentage)));
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const offset = circumference - (animatedProgress / 100) * circumference;

  const getTextColor = (p: number) => {
    if (p < 60) return 'text-emerald-500';
    if (p < 90) return 'text-amber-500';
    return 'text-destructive';
  };

  const getStrokeColor = (p: number) => {
    if (p < 60) return 'stroke-emerald-500';
    if (p < 90) return 'stroke-amber-500';
    return 'stroke-destructive';
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 select-none", className)}>
      <div className="relative group transition-transform duration-500 active:scale-95" style={{ width: size, height: size }}>
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-10 transition-colors duration-1000",
          animatedProgress < 60 ? "bg-emerald-500" : animatedProgress < 90 ? "bg-amber-500" : "bg-destructive"
        )} />

        <svg className="absolute inset-0 -rotate-90 drop-shadow-sm" width={size} height={size}>
          {/* Background Ring */}
          <circle
            className="text-muted/20"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Ring */}
          <circle
            className={cn("transition-all duration-1000 ease-out", getStrokeColor(animatedProgress))}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            <span className={cn("text-3xl font-black font-code leading-none transition-colors duration-500", getTextColor(animatedProgress))}>
              {Math.round(percentage)}<span className="text-xs ml-0.5">%</span>
            </span>
            {label && (
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 px-3 leading-tight max-w-[100px]">
                {label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
