"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import type { GeneratedGraph } from "@/lib/ai/schemas/graph";
import { persistGeneratedGraph } from "@/actions/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [graphGenerated, setGraphGenerated] = useState(false);

  async function handleGraphGenerated(graph: GeneratedGraph) {
    if (graphGenerated) return; // prevent double-processing
    setIsGeneratingGraph(true);
    setGraphGenerated(true);
    try {
      const result = await persistGeneratedGraph(graph);
      console.log(`Graph created: ${result.nodeCount} nodes, ${result.edgeCount} edges`);
      // Redirect to the graph page after a short delay
      setTimeout(() => router.push("/graph"), 2000);
    } catch (err) {
      console.error("Failed to save graph:", err);
    } finally {
      setIsGeneratingGraph(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight">RJ-OS</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Career Operating System · Onboarding
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 mx-auto w-full max-w-2xl">
        {isGeneratingGraph ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent mx-auto" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Building your career graph...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-80px)]">
            <ChatInterface
              endpoint="/api/ai/onboarding"
              onGraphGenerated={handleGraphGenerated}
              placeholder="Tell me about yourself..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
