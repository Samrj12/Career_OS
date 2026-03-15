"use server";

import { db } from "@/db";
import { users, nodes, edges } from "@/db/schema";
import type { GeneratedGraph } from "@/lib/ai/schemas/graph";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function persistGeneratedGraph(graph: GeneratedGraph) {
  const now = Date.now();

  // Map tempId → real UUID
  const idMap = new Map<string, string>();

  // First pass: create all node records
  const nodeValues = [
    ...graph.nodes.map((n) => {
      const id = crypto.randomUUID();
      idMap.set(n.tempId, id);
      return {
        id,
        type: n.type,
        title: n.title,
        description: n.description,
        importance: n.importance ?? 5,
        targetValue: n.targetValue,
        currentValue: n.currentValue ?? 0,
        targetDate: n.targetDate ? new Date(n.targetDate).getTime() : undefined,
        progress: 0,
        healthScore: 1.0,
        confidence: 0.5,
        momentum: 0,
        color: "green" as const,
        status: "active" as const,
        metadata: "{}",
        createdAt: now,
        updatedAt: now,
      };
    }),
    // Add habits
    ...graph.habits.map((h) => {
      const id = crypto.randomUUID();
      idMap.set(h.tempId, id);
      return {
        id,
        type: "habit" as const,
        title: h.title,
        description: h.description,
        importance: h.importance ?? 5,
        targetValue: undefined,
        currentValue: undefined,
        targetDate: undefined,
        progress: 0,
        healthScore: 1.0,
        confidence: 0.5,
        momentum: 0,
        color: "green" as const,
        status: "active" as const,
        metadata: "{}",
        createdAt: now,
        updatedAt: now,
      };
    }),
  ];

  await db.insert(nodes).values(nodeValues);

  // Second pass: create edges
  const edgeValues = [
    ...graph.edges.map((e) => ({
      id: crypto.randomUUID(),
      sourceId: idMap.get(e.sourceTempId)!,
      targetId: idMap.get(e.targetTempId)!,
      type: e.type ?? "parent_child",
      weight: 1.0,
      createdAt: now,
    })),
    // Habit → parent edges
    ...graph.habits.map((h) => ({
      id: crypto.randomUUID(),
      sourceId: idMap.get(h.parentTempId)!,
      targetId: idMap.get(h.tempId)!,
      type: "parent_child" as const,
      weight: 1.0,
      createdAt: now,
    })),
  ].filter((e) => e.sourceId && e.targetId);

  if (edgeValues.length > 0) {
    await db.insert(edges).values(edgeValues);
  }

  // Mark onboarding complete
  await db.update(users).set({ onboardingComplete: 1 }).where(eq(users.name, "Rudraksh"));

  revalidatePath("/");
  revalidatePath("/graph");

  return { nodeCount: nodeValues.length, edgeCount: edgeValues.length };
}

export async function getUser() {
  return db.query.users.findFirst();
}

export async function isOnboardingComplete(): Promise<boolean> {
  const user = await db.query.users.findFirst();
  return (user?.onboardingComplete ?? 0) === 1;
}
