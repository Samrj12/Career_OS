"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GenerateReviewButton({ isFirst = false }: { isFirst?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/review", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Review generation failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={generate}
      disabled={loading}
      className={`rounded-full font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] transition-all active:translate-y-[1px] active:translate-x-[1px] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 ${
        isFirst
          ? "bg-[var(--amber)] text-white px-6 py-2.5 shadow-[3px_3px_0px_#92400E] hover:shadow-[2px_2px_0px_#92400E] active:shadow-[1px_1px_0px_#92400E]"
          : "bg-[var(--ink)] text-[var(--paper)] px-4 py-1.5 shadow-[3px_3px_0px_var(--border-dark)] hover:shadow-[2px_2px_0px_var(--border-dark)] active:shadow-[1px_1px_0px_var(--border-dark)]"
      }`}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      {loading ? "GENERATING..." : "GENERATE BRIEFING"}
    </button>
  );
}
