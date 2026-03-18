"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { Node } from "@/db/schema";

/* Each node type is a distinct desk object */
const TYPE_STYLES: Record<string, {
  bg: string; border: string; label: string;
  tint: string; decoration: "clip" | "pin-blue" | "pin-orange" | "eraser" | "paperclip";
}> = {
  goal:      { bg: "#FFFEF9", border: "#C8C2B8", label: "#92400E", tint: "#FEF9C3", decoration: "clip" },
  milestone: { bg: "#F8FBFF", border: "#93C5FD", label: "#1D4ED8", tint: "#DBEAFE", decoration: "pin-blue" },
  skill:     { bg: "#F0FFF4", border: "#86EFAC", label: "#166534", tint: "#DCFCE7", decoration: "eraser" },
  habit:     { bg: "#FFF9F0", border: "#FDBA74", label: "#C2410C", tint: "#FED7AA", decoration: "pin-orange" },
  task:      { bg: "#FAFAF9", border: "#D6D3D1", label: "#57534E", tint: "#F5F5F4", decoration: "paperclip" },
};

const HEALTH_COLORS: Record<string, string> = {
  green: "#22C55E",
  yellow: "#EAB308",
  red: "#EF4444",
  blue: "#3B82F6",
};

interface GraphNodeData extends Node {
  label: string;
}

function BaseNode({ data, selected }: NodeProps & { data: GraphNodeData }) {
  const typeStyle = TYPE_STYLES[data.type] || TYPE_STYLES.task;
  const healthColor = HEALTH_COLORS[data.color] || HEALTH_COLORS.green;

  let momentumText = "→ steady";
  if (data.momentum > 0.2) momentumText = "↑ high";
  else if (data.momentum < -0.2) momentumText = "↓ low";

  const isGoal = data.type === "goal";
  const isHabit = data.type === "habit";

  // Random slight rotation for habit nodes (sticky note feel)
  const rotation = isHabit ? ((data.title.length % 3) - 1) * 0.8 : 0;

  return (
    <div
      className={cn(
        "relative rounded-[2px] border-[1.5px] px-[14px] py-[10px] cursor-pointer transition-all shadow-[var(--shadow-card)] font-[family-name:var(--font-inter)]",
        isGoal ? "min-w-[180px]" : "min-w-[140px]",
        selected && "ring-2 ring-[var(--amber)] ring-offset-2 ring-offset-[var(--bg)]"
      )}
      style={{
        backgroundColor: typeStyle.bg,
        borderColor: selected ? 'var(--amber)' : typeStyle.border,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[var(--border)] opacity-0" />

      {/* Decoration: binder clip for goals, pushpins for milestones/habits, etc */}
      {typeStyle.decoration === "clip" && (
        <img
          src="/assets/stationary_elements/IZtPd7BuOJHldUCqNnSSAp9sA.png"
          alt=""
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-[24px] h-auto pointer-events-none select-none"
        />
      )}
      {typeStyle.decoration === "pin-blue" && (
        <img
          src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
          alt=""
          className="absolute -top-2.5 left-2 w-[14px] h-auto pointer-events-none select-none"
        />
      )}
      {typeStyle.decoration === "pin-orange" && (
        <img
          src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
          alt=""
          className="absolute -top-2.5 left-2 w-[14px] h-auto pointer-events-none select-none"
        />
      )}
      {typeStyle.decoration === "paperclip" && (
        <img
          src="/assets/stationary_elements/xSXenWs1UJkTy0XAXVlAQAAwlE.png"
          alt=""
          className="absolute -top-2 right-1 w-[16px] h-auto pointer-events-none select-none rotate-[5deg]"
        />
      )}

      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span
            className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.1em]"
            style={{ color: typeStyle.label }}
          >
            {data.type}
          </span>
          {/* Red sticker badge for goal health */}
          {isGoal && (
            <div className="relative">
              <img
                src="/assets/stationary_elements/vhuvBaB6OLTuK6imOMo4WGjMDQ.png"
                alt=""
                className="w-[20px] h-[20px] object-contain"
              />
              <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[7px] text-white font-bold">
                {Math.round(data.healthScore * 100)}
              </span>
            </div>
          )}
        </div>
        <p className={cn(
          "text-[13px] font-semibold text-[var(--ink)] mt-[3px] leading-tight",
          isGoal ? "max-w-[200px] font-[family-name:var(--font-playfair)]" : "max-w-[160px]"
        )}>
          {data.title}
        </p>

        {/* Skill level badge (eraser-shaped) */}
        {typeStyle.decoration === "eraser" && (
          <span className="mt-2 self-start bg-[var(--ink)] text-[var(--paper)] font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full">
            LVL {Math.ceil(data.progress * 10)}
          </span>
        )}

        {/* Progress route tracker for milestones */}
        {data.type === "milestone" && (
          <div className="mt-2 relative h-[4px] w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-0 border-t border-dashed border-[var(--border-dark)]" />
            </div>
            <div className="absolute top-0 left-0 h-full flex items-center" style={{ width: `${Math.round(data.progress * 100)}%` }}>
              <div className="w-full h-0 border-t-[2px] border-solid border-[var(--pin-blue)]" />
            </div>
            {data.progress > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[var(--pin-blue)]"
                style={{ left: `${Math.round(data.progress * 100)}%` }}
              />
            )}
          </div>
        )}

        <div className="flex flex-row items-center justify-between mt-[10px]">
          <div
            className="w-[8px] h-[8px] rounded-full"
            style={{ backgroundColor: healthColor }}
          />
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[var(--ink-3)]">
            {momentumText}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[var(--border)] opacity-0" />
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
