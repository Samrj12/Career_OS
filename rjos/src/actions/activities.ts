"use server";

import { db } from "@/db";
import { activityLogs, nodes } from "@/db/schema";
import type { ActivityExtraction } from "@/lib/ai/schemas/analysis";
import { eq, and, gte, lte, lt } from "drizzle-orm";
import { recalculateNodeMetrics } from "./nodes";
import { revalidatePath } from "next/cache";

export async function saveActivityLog(params: {
  nodeId: string | null;
  rawInput: string;
  extraction: ActivityExtraction;
}) {
  const { nodeId, rawInput, extraction } = params;
  const now = Date.now();

  // Compute days since last activity BEFORE inserting the new log
  let daysSinceLastActivity: number | null = null;
  if (nodeId) {
    const lastLog = await db.query.activityLogs.findFirst({
      where: and(eq(activityLogs.nodeId, nodeId), lt(activityLogs.loggedAt, now)),
      orderBy: (a, { desc }) => [desc(a.loggedAt)],
    });
    if (lastLog) {
      daysSinceLastActivity = Math.floor((now - lastLog.loggedAt) / 86_400_000);
    }
  }

  const [log] = await db
    .insert(activityLogs)
    .values({
      id: crypto.randomUUID(),
      nodeId,
      rawInput,
      timeSpent: extraction.timeSpent,
      difficulty: extraction.difficulty,
      focusLevel: extraction.focusLevel,
      impactScore: extraction.impactScore,
      extractedData: JSON.stringify(extraction),
      loggedAt: now,
      createdAt: now,
    })
    .returning();

  // Update quantitative progress on the node if available
  if (nodeId && extraction.quantitativeProgress) {
    const node = await db.query.nodes.findFirst({ where: eq(nodes.id, nodeId) });
    if (node && node.targetValue !== null) {
      const newValue = (node.currentValue || 0) + extraction.quantitativeProgress.value;
      const newProgress = Math.min(newValue / node.targetValue, 1.0);
      await db.update(nodes).set({
        currentValue: newValue,
        progress: newProgress,
        updatedAt: now,
      }).where(eq(nodes.id, nodeId));
    }
  }

  // Recalculate metrics for the node
  if (nodeId) {
    const sevenDaysAgo = now - 7 * 86_400_000;
    const fourteenDaysAgo = now - 14 * 86_400_000;

    const recentLogs = await db.query.activityLogs.findMany({
      where: and(
        eq(activityLogs.nodeId, nodeId),
        gte(activityLogs.loggedAt, sevenDaysAgo)
      ),
    });
    const previousLogs = await db.query.activityLogs.findMany({
      where: and(
        eq(activityLogs.nodeId, nodeId),
        gte(activityLogs.loggedAt, fourteenDaysAgo),
        lte(activityLogs.loggedAt, sevenDaysAgo)
      ),
    });

    await recalculateNodeMetrics(nodeId, recentLogs.length, previousLogs.length, daysSinceLastActivity);
  }

  revalidatePath("/");
  revalidatePath("/log");
  revalidatePath("/graph");

  return log;
}

export async function getRecentActivities(limit = 20) {
  return db.query.activityLogs.findMany({
    orderBy: (a, { desc }) => [desc(a.loggedAt)],
    limit,
  });
}
