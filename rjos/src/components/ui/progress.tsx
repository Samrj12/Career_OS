"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        className={cn("relative h-[6px] w-full", className)}
        {...props}
      >
        {/* Dashed track */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-0 border-t-[2px] border-dashed border-[var(--border-dark)]" />
        </div>

        {/* Solid amber fill (route line) */}
        <div
          className="absolute top-0 left-0 h-full flex items-center transition-all duration-500"
          style={{ width: `${pct}%` }}
        >
          <div className="w-full h-0 border-t-[2px] border-solid border-[var(--amber)]" />
        </div>

        {/* Pin marker at endpoint */}
        {pct > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full bg-[var(--amber)] shadow-[var(--shadow-pin)] transition-all duration-500"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
