"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const PROMPTS = [
  "What went well today?",
  "What challenged you the most?",
  "What would you do differently?",
  "What are you grateful for?",
  "What drained your energy today?",
  "What gave you momentum?",
];

interface AnalysisResult {
  burnout: number;
  motivation: number;
  confidence: number;
  themes: string[];
  recommendations: string[];
  summary: string;
}

interface PastReflection {
  id: string;
  date: string;
  summary: string;
  sentiment: "good" | "challenging" | "difficult";
}

export function ReflectClient() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [pastReflections, setPastReflections] = useState<PastReflection[]>([]);
  const [promptIdx, setPromptIdx] = useState(0);

  // Rotate prompt
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit() {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: input }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      setAnalysis({
        burnout: data.burnout ?? 50,
        motivation: data.motivation ?? 70,
        confidence: data.confidence ?? 60,
        themes: data.themes ?? [],
        recommendations: data.recommendations ?? [],
        summary: data.summary ?? "",
      });

      // Add to past reflections
      setPastReflections((prev) => [
        {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          summary: data.summary || input.slice(0, 100),
          sentiment: (data.motivation ?? 70) > 60 ? "good" : (data.burnout ?? 50) > 70 ? "difficult" : "challenging",
        },
        ...prev,
      ]);

      setInput("");
    } catch {
      console.error("Reflection failed");
    } finally {
      setIsLoading(false);
    }
  }

  const sentimentColors: Record<string, string> = {
    good: "border-l-[var(--green)]",
    challenging: "border-l-[var(--amber)]",
    difficult: "border-l-[var(--red)]",
  };

  return (
    <div className="space-y-8">
      {/* Journal input — ruled page with amber margin line */}
      <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-6 overflow-hidden">
        {/* Amber vertical margin line on left */}
        <div className="absolute left-[48px] top-0 bottom-0 border-l-2 border-[var(--amber-border)] opacity-30 pointer-events-none" />

        {/* Rotating prompt */}
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] italic text-[var(--ink-3)] mb-3 pl-[40px] transition-all">
          {PROMPTS[promptIdx]}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your reflection..."
          rows={6}
          className="w-full bg-transparent border-0 rounded-[2px] pl-[40px] pr-4 py-2 font-[family-name:var(--font-inter)] text-[15px] text-[var(--ink)] outline-none focus:ring-0 resize-none"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #E8E0D4 27px, #E8E0D4 28px)",
            backgroundSize: "100% 28px",
            lineHeight: "28px",
          }}
        />

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="bg-[var(--amber)] text-white rounded-full px-6 py-2 font-[family-name:var(--font-playfair)] text-[14px] italic shadow-[3px_3px_0px_#92400E] hover:shadow-[2px_2px_0px_#92400E] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_#92400E] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reflect
          </button>
        </div>
      </div>

      {/* AI Analysis — circular gauge badges + recommendations */}
      {analysis && (
        <div className="space-y-6 animate-fade-slide-up">
          {/* Three circular gauges as round sticker badges */}
          <div className="flex gap-6 justify-center">
            {[
              { label: "Burnout", value: analysis.burnout, color: "var(--red)" },
              { label: "Motivation", value: analysis.motivation, color: "var(--green)" },
              { label: "Confidence", value: analysis.confidence, color: "var(--pin-blue)" },
            ].map((gauge) => {
              const circumference = 2 * Math.PI * 32;
              const offset = circumference - (gauge.value / 100) * circumference;
              return (
                <div key={gauge.label} className="flex flex-col items-center gap-2">
                  <div className="relative w-[80px] h-[80px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="var(--paper)" stroke="var(--border)" strokeWidth="4" />
                      <circle
                        cx="40" cy="40" r="32"
                        fill="none"
                        stroke={gauge.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[16px] font-bold text-[var(--ink)]">
                      {gauge.value}
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
                    {gauge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Key themes as eraser-shaped pill tags */}
          {analysis.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {analysis.themes.map((theme, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-[var(--paper-alt)] border border-[var(--border)] rounded-full px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-2)]">
                  <img
                    src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                    alt=""
                    className="w-[8px] h-[8px]"
                  />
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Recommendations as individually rotated small cards with pushpins */}
          {analysis.recommendations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.recommendations.map((rec, i) => {
                const rotations = [1.2, -0.8, 0.5, -1.5];
                return (
                  <div
                    key={i}
                    className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-4 pt-6"
                    style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}
                  >
                    <img
                      src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
                      alt=""
                      className="absolute -top-2 left-3 w-[14px] h-auto pointer-events-none select-none"
                    />
                    <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink)] leading-relaxed">{rec}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Past reflections — vertical dashed timeline with branching cards */}
      {pastReflections.length > 0 && (
        <div className="mt-8">
          <h3 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em] mb-4">Past Reflections</h3>
          <div className="relative pl-6">
            {/* Vertical dashed line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-0 border-l-[2px] border-dashed border-[var(--border)]" />

            {pastReflections.map((r) => (
              <div key={r.id} className="flex items-start gap-4 py-3 relative">
                {/* Pushpin point on the timeline */}
                <div className="absolute left-[-19px] top-4 w-[8px] h-[8px] rounded-full bg-[var(--amber)] border-2 border-[var(--paper)]" />
                {/* Branching card */}
                <div className={`flex-1 bg-[var(--paper)] border border-[var(--border)] border-l-[3px] ${sentimentColors[r.sentiment]} rounded-[2px] shadow-[var(--shadow-card)] p-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] uppercase">{r.date}</span>
                  </div>
                  <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink)] truncate">{r.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
