"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceInput } from "@/components/chat/VoiceInput";
import { Loader2, Send } from "lucide-react";

const PROMPTS = [
  "What went well today?",
  "What didn't go as planned?",
  "How was your energy level?",
  "What will you do differently tomorrow?",
];

interface Analysis {
  burnoutScore: number;
  motivationScore: number;
  confidenceScore: number;
  energyLevel: number;
  keyThemes: string[];
  recommendations: string[];
  aiResponse: string;
}

export function ReflectClient() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function handleSubmit() {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Prompt pills */}
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setContent((prev) => prev + (prev ? "\n\n" : "") + p + " ")}
            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did today go? Be honest — this is just for you..."
            rows={6}
            className="w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
          <div className="flex gap-2">
            <VoiceInput
              onTranscript={(text) => setContent((prev) => prev + (prev ? " " : "") + text)}
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading || !content.trim()} className="ml-auto">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isLoading ? "Analyzing..." : "Reflect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{analysis.aiResponse}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Motivation", value: analysis.motivationScore },
                { label: "Confidence", value: analysis.confidenceScore },
                { label: "Energy", value: analysis.energyLevel },
                { label: "Burnout Risk", value: 1 - analysis.burnoutScore, invert: true },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-[hsl(var(--border))]">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--primary))]"
                      style={{ width: `${Math.round(value * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium">{Math.round(value * 100)}%</p>
                </div>
              ))}
            </div>

            {analysis.keyThemes.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5">Key Themes</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.keyThemes.map((t, i) => (
                    <span key={i} className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5">For Tomorrow</p>
                {analysis.recommendations.map((r, i) => (
                  <p key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex gap-1.5">
                    <span className="text-[hsl(var(--primary))]">→</span>
                    {r}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
