"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateReviewButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setIsLoading(true);
    try {
      await fetch("/api/ai/review", { method: "POST" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={generate} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
      Generate Review
    </Button>
  );
}
