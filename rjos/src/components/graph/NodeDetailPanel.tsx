"use client";

import { X } from "lucide-react";
import { formatProgress, healthLabel } from "@/lib/graph/calculations";
import { formatDate, formatRelative } from "@/lib/utils/dates";
import { Progress } from "@/components/ui/progress";
import type { Node } from "@/db/schema";

interface NodeDetailPanelProps {
  node: Node;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const progressPct = Math.round(node.progress * 100);
  const healthPct = Math.round(node.healthScore * 100);

  return (
    <div className="absolute right-0 top-0 h-full w-[320px] bg-[var(--paper)] border-l-[2px] border-[var(--border)] shadow-[-6px_0_16px_rgba(0,0,0,0.06)] p-[24px] flex flex-col gap-6 overflow-y-auto z-10 animate-fade-slide-up">
      {/* Notebook spiral binding on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[12px] flex flex-col justify-start pt-6 gap-[14px] pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-full border-2 border-[var(--border-dark)] bg-[var(--paper-alt)] mx-auto" />
        ))}
      </div>

      <div className="flex flex-row items-start justify-between pl-4">
        <div className="flex flex-col items-start gap-2">
          <div className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase px-[8px] py-[2px] rounded-full font-bold bg-[var(--paper-alt)] text-[var(--ink-2)]">
            {node.type}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-[20px] text-[var(--ink)] leading-tight break-words">
            {node.title}
          </h2>
        </div>
        <button onClick={onClose} className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors mt-[-4px] mr-[-4px] p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {node.description && (
        <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] pl-4">
          {node.description}
        </p>
      )}

      {/* Progress — route tracker */}
      <div className="flex flex-col gap-1.5 pl-4">
        <div className="flex justify-between font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)]">
          <span>PROGRESS</span>
          <span className="text-[var(--ink)]">
            {node.targetValue != null
              ? `${node.currentValue ?? 0} / ${node.targetValue}`
              : formatProgress(node.progress)}
          </span>
        </div>
        <Progress value={progressPct} />
      </div>

      {/* Stats grid — dashed-bordered stamped boxes */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 pl-4">
        {[
          { label: "Health", value: `${healthPct}%` },
          { label: "Momentum", value: node.momentum > 0.2 ? "High" : node.momentum < -0.2 ? "Low" : "Steady" },
          { label: "Importance", value: `${node.importance}/10` },
          { label: "Confidence", value: `${Math.round(node.confidence * 100)}%` },
        ].map((stat) => (
          <div key={stat.label} className="py-[12px] border-b border-dashed border-[var(--border)] flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase text-[var(--ink-3)] mb-1">{stat.label}</span>
            <span className="font-[family-name:var(--font-inter)] text-[18px] font-semibold text-[var(--ink)] leading-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-2 mt-2 pl-4">
        {node.targetDate && (
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase text-[var(--ink-3)]">Target Date</span>
            <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{formatDate(node.targetDate)}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase text-[var(--ink-3)]">Created</span>
          <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{formatRelative(node.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
