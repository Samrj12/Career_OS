"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { Node } from "@/db/schema";

// Color mapping from node.color → Tailwind classes
const COLOR_STYLES = {
  green: {
    border: "border-green-500",
    bg: "bg-green-500/10",
    dot: "bg-green-500",
    text: "text-green-400",
  },
  yellow: {
    border: "border-yellow-500",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-500",
    text: "text-yellow-400",
  },
  red: {
    border: "border-red-500",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
    text: "text-red-400",
  },
  blue: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
    text: "text-blue-400",
  },
};

const TYPE_ICON: Record<string, string> = {
  goal: "🎯",
  milestone: "🏁",
  skill: "⚡",
  habit: "🔄",
  task: "✓",
};

interface GraphNodeData extends Node {
  label: string;
}

function BaseNode({ data, selected }: NodeProps & { data: GraphNodeData }) {
  const color = data.color as keyof typeof COLOR_STYLES;
  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.green;
  const progress = Math.round(data.progress * 100);

  return (
    <div
      className={cn(
        "relative w-48 rounded-xl border-2 px-3 py-2.5 cursor-pointer transition-all",
        styles.border,
        styles.bg,
        selected && "ring-2 ring-[hsl(var(--ring))] ring-offset-1 ring-offset-[hsl(var(--background))]"
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[hsl(var(--border))]" />

      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5 shrink-0">{TYPE_ICON[data.type] ?? "●"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate text-[hsl(var(--foreground))]">
            {data.title}
          </p>
          {/* Progress bar */}
          <div className="mt-1.5 h-1 w-full rounded-full bg-[hsl(var(--muted))]">
            <div
              className={cn("h-full rounded-full transition-all", styles.dot)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className={cn("text-[10px] font-medium", styles.text)}>
              {data.targetValue != null
                ? `${data.currentValue ?? 0}/${data.targetValue}`
                : `${progress}%`}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {Math.round(data.healthScore * 100)}% health
            </span>
          </div>
        </div>
      </div>

      {/* Momentum dot */}
      <div
        className={cn(
          "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--background))]",
          data.momentum > 0.2 ? "bg-green-400" : data.momentum < -0.2 ? "bg-red-400" : "bg-yellow-400"
        )}
      />

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[hsl(var(--border))]" />
    </div>
  );
}

export const GoalNode = memo(BaseNode);
export const MilestoneNode = memo(BaseNode);
export const SkillNode = memo(BaseNode);
export const HabitNode = memo(BaseNode);
export const TaskNode = memo(BaseNode);

export const NODE_TYPES = {
  goal: GoalNode,
  milestone: MilestoneNode,
  skill: SkillNode,
  habit: HabitNode,
  task: TaskNode,
};
