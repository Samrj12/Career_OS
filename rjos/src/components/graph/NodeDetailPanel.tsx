"use client";

import { X, TrendingUp, TrendingDown, Minus, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatProgress, healthLabel } from "@/lib/graph/calculations";
import { formatDate, formatRelative } from "@/lib/utils/dates";
import type { Node } from "@/db/schema";

interface NodeDetailPanelProps {
  node: Node;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  goal: "Goal",
  milestone: "Milestone",
  skill: "Skill",
  habit: "Habit",
  task: "Task",
};

const COLOR_VARIANT: Record<string, "green" | "yellow" | "red" | "blue"> = {
  green: "green",
  yellow: "yellow",
  red: "red",
  blue: "blue",
};

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const progressPct = Math.round(node.progress * 100);
  const healthPct = Math.round(node.healthScore * 100);

  function MomentumIcon() {
    if (node.momentum > 0.2) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (node.momentum < -0.2) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-400" />;
  }

  function momentumLabel() {
    if (node.momentum > 0.5) return "High";
    if (node.momentum > 0.2) return "Rising";
    if (node.momentum > -0.2) return "Steady";
    if (node.momentum > -0.5) return "Declining";
    return "Stalled";
  }

  return (
    <div className="w-80 h-full overflow-y-auto border-l border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={COLOR_VARIANT[node.color] ?? "default"}>
              {TYPE_LABELS[node.type] ?? node.type}
            </Badge>
            <Badge variant={COLOR_VARIANT[node.color] ?? "default"}>
              {node.color === "blue" ? "Completed" : node.color === "green" ? "On Track" : node.color === "yellow" ? "Needs Attention" : "Behind"}
            </Badge>
          </div>
          <h2 className="mt-2 text-base font-semibold leading-tight break-words">{node.title}</h2>
          {node.description && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{node.description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-[hsl(var(--muted-foreground))]">Progress</span>
          <span className="font-medium">
            {node.targetValue != null
              ? `${node.currentValue ?? 0} / ${node.targetValue}`
              : formatProgress(node.progress)}
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Health</p>
          <p className="mt-0.5 text-sm font-semibold">{healthLabel(node.healthScore)}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{healthPct}%</p>
        </div>
        <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Momentum</p>
          <div className="mt-0.5 flex items-center gap-1">
            <MomentumIcon />
            <p className="text-sm font-semibold">{momentumLabel()}</p>
          </div>
        </div>
        <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Importance</p>
          <p className="mt-0.5 text-sm font-semibold">{node.importance}/10</p>
        </div>
        <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Confidence</p>
          <p className="mt-0.5 text-sm font-semibold">{Math.round(node.confidence * 100)}%</p>
        </div>
      </div>

      {/* Target & Dates */}
      {node.targetDate && (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>Target: {formatDate(node.targetDate)}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Target className="h-3 w-3 shrink-0" />
        <span>Created {formatRelative(node.createdAt)}</span>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-[hsl(var(--border))] p-3">
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Status</p>
        <p className="text-sm capitalize font-medium">{node.status}</p>
      </div>
    </div>
  );
}
