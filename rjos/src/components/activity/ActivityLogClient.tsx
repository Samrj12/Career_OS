"use client";

import { useState } from "react";
import type { Node, ActivityLog } from "@/db/schema";
import { Loader2 } from "lucide-react";

interface Props {
  nodes: Node[];
  recentActivities: ActivityLog[];
}

interface ExtractionResult {
  nodeTitle: string | null;
  timeSpent: number | null;
  difficulty: number | null;
  focusLevel: number | null;
  impactScore: number | null;
  followUpQuestions: string[];
  summary: string;
}

export function ActivityLogClient({ nodes, recentActivities }: Props) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/ai/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, nodeIds: nodes.map((n) => n.id) }),
      });

      if (!res.ok) throw new Error("Failed to process activity");
      const data = await res.json();
      setResult(data.extraction);

      if (!data.extraction.followUpQuestions?.length) {
        await saveActivity(data.extraction, data.nodeId);
        setSaved(true);
      }
    } catch {
      setError("Failed to process your log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveActivity(extraction: ExtractionResult, nodeId: string | null) {
    await fetch("/api/ai/log/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput: input, extraction, nodeId }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Input card — thick amber top border, "FIELD REPORT" stamp */}
      <div className="relative bg-[var(--paper)] border border-[var(--border)] border-t-[4px] border-t-[var(--amber)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px]">
        {/* Rubber stamp */}
        <div className="absolute top-4 right-4 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.12em] text-[var(--ink)] opacity-[0.15] -rotate-[5deg] select-none pointer-events-none">
          FIELD REPORT
        </div>

        <div className="mb-[6px]">
          <label className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">WHAT YOU DID</label>
        </div>
        {/* Textarea with ruled-paper lines */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Solved 2 graph problems on LeetCode today and spent 3 hours on my backend project"
          rows={4}
          className="w-full bg-transparent border-0 rounded-[2px] p-[12px] font-[family-name:var(--font-inter)] text-[16px] text-[var(--ink)] outline-none focus:ring-0 resize-none"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, var(--border) 27px, var(--border) 28px)",
            backgroundSize: "100% 28px",
            lineHeight: "28px",
          }}
        />
        <div className="mt-[20px]">
          {/* Eraser-shaped pill button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="w-full bg-[var(--ink)] text-[var(--paper)] rounded-full px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] shadow-[3px_3px_0px_var(--border-dark)] hover:shadow-[2px_2px_0px_var(--border-dark)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_var(--border-dark)] transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "PROCESSING..." : "LOG ENTRY"}
          </button>
        </div>
      </div>

      {/* Result — stamp receipt card */}
      {result && (
        <div className="bg-[var(--paper)] border border-dashed border-[var(--border-dark)] border-l-[3px] border-l-[var(--amber)] border-l-solid rounded-[2px] shadow-[var(--shadow-card)] p-[20px] pl-[16px] animate-stamp-in">
          <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--amber)] mb-4 tracking-[0.1em]">
            AI EXTRACTED
          </div>
          <div className="space-y-2">
            {result.nodeTitle && (
              <div className="flex gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] w-24 uppercase">Node</span>
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{result.nodeTitle}</span>
              </div>
            )}
            {result.timeSpent && (
              <div className="flex gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] w-24 uppercase">Time</span>
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{result.timeSpent}m</span>
              </div>
            )}
            {result.difficulty && (
              <div className="flex gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] w-24 uppercase">Difficulty</span>
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{result.difficulty}/10</span>
              </div>
            )}
            {result.focusLevel && (
              <div className="flex gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] w-24 uppercase">Focus</span>
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{result.focusLevel}/10</span>
              </div>
            )}
            {result.summary && (
              <div className="flex gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] w-24 uppercase">Summary</span>
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)]">{result.summary}</span>
              </div>
            )}
            {saved && (
              <div className="mt-4 flex items-center gap-2">
                <img
                  src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                  alt=""
                  className="w-[14px] h-[14px] animate-pin-drop"
                />
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--green)]">Activity pinned to your graph!</span>
              </div>
            )}
            {error && <div className="mt-4 font-[family-name:var(--font-inter)] text-[14px] text-[var(--red)]">{error}</div>}
          </div>
        </div>
      )}

      {/* Recent — thin paper strips with vertical dashed timeline */}
      {recentActivities.length > 0 && (
        <div className="mt-[32px]">
          <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em] mb-4">
            RECENT
          </div>
          <div className="relative pl-6">
            {/* Vertical dashed timeline */}
            <div className="absolute left-[7px] top-0 bottom-0 w-0 border-l-[2px] border-dashed border-[var(--border)]" />

            {recentActivities.map((a) => {
              const data: ExtractionResult = JSON.parse(a.extractedData || "{}");
              const dateStr = new Date(a.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
              return (
                <div key={a.id} className="flex items-center gap-4 py-[8px] relative">
                  {/* Timeline dot */}
                  <div className="absolute left-[-19px] w-[8px] h-[8px] rounded-full bg-[var(--border-dark)] border-2 border-[var(--paper)]" />
                  {/* Time badge (eraser-shaped) */}
                  <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--paper)] bg-[var(--ink-3)] px-2 py-0.5 rounded-full min-w-[50px] text-center uppercase">{dateStr}</span>
                  <span className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink)] truncate flex-1">{data.summary || a.rawInput}</span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] ml-auto">{a.timeSpent ? `${a.timeSpent}M` : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
