"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <Button size="sm" variant="outline" onClick={generate} disabled={loading} className="text-xs h-7">
      <Sparkles className="h-3 w-3 mr-1" />
      {loading ? "Generating…" : "Generate Plan"}
    </Button>
  );
}
