"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceInput } from "@/components/chat/VoiceInput";
import { formatRelative } from "@/lib/utils/dates";
import type { Node, ActivityLog } from "@/db/schema";
import { Loader2, Send } from "lucide-react";

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

      // Auto-save if no follow-up questions
      if (!data.extraction.followUpQuestions?.length) {
        await saveActivity(data.extraction, data.nodeId);
        setSaved(true);
      }
    } catch (e) {
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
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Solved 2 graph problems on LeetCode today and spent 3 hours on my backend project"
            rows={4}
            className="w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
          <div className="flex gap-2">
            <VoiceInput
              onTranscript={(text) => setInput((prev) => prev + (prev ? " " : "") + text)}
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading || !input.trim()} className="ml-auto">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? "Processing..." : "Log Activity"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Extracted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.nodeTitle && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Node:</span>
                <Badge variant="secondary">{result.nodeTitle}</Badge>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {result.timeSpent && <div className="rounded bg-[hsl(var(--muted))] p-2 text-center"><div className="font-bold">{result.timeSpent}m</div><div className="text-[hsl(var(--muted-foreground))]">time</div></div>}
              {result.difficulty && <div className="rounded bg-[hsl(var(--muted))] p-2 text-center"><div className="font-bold">{result.difficulty}/10</div><div className="text-[hsl(var(--muted-foreground))]">difficulty</div></div>}
              {result.focusLevel && <div className="rounded bg-[hsl(var(--muted))] p-2 text-center"><div className="font-bold">{result.focusLevel}/10</div><div className="text-[hsl(var(--muted-foreground))]">focus</div></div>}
            </div>
            {result.summary && <p className="text-xs text-[hsl(var(--muted-foreground))]">{result.summary}</p>}
            {result.followUpQuestions?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Follow-up questions:</p>
                {result.followUpQuestions.map((q, i) => (
                  <p key={i} className="text-xs text-[hsl(var(--muted-foreground))]">• {q}</p>
                ))}
              </div>
            )}
            {saved && <p className="text-xs text-green-400">✓ Activity saved and graph updated!</p>}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Recent */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((a) => {
              const data: ExtractionResult = JSON.parse(a.extractedData || "{}");
              return (
                <div key={a.id} className="border-b border-[hsl(var(--border))] pb-2 last:border-0 last:pb-0">
                  <p className="text-xs font-medium truncate">{data.summary || a.rawInput}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span>{formatRelative(a.loggedAt)}</span>
                    {a.timeSpent && <span>{a.timeSpent}min</span>}
                    {data.nodeTitle && <span>{data.nodeTitle}</span>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
