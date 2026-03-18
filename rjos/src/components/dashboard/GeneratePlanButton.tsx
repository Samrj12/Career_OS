"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function GeneratePlanButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        console.error("Plan generation failed:", body.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={generate}
      disabled={loading}
      className="bg-[var(--ink)] text-[var(--paper)] hover:shadow-[2px_2px_0px_var(--border-dark)] disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-4 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.08em] font-medium flex items-center gap-1.5 transition-all shadow-[3px_3px_0px_var(--border-dark)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_var(--border-dark)]"
    >
      <Sparkles className="h-3 w-3" />
      {loading ? "GENERATING..." : "GENERATE PLAN"}
    </button>
  );
}
