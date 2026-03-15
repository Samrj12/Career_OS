"use server";

import { db } from "@/db";
import { habitLogs, nodes } from "@/db/schema";
import { eq, and, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { todayISO } from "@/lib/utils/dates";

export async function checkInHabit(nodeId: string, completed: boolean, notes?: string) {
  const today = todayISO();
  const existing = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.nodeId, nodeId), eq(habitLogs.logDate, today)),
  });

  // Calculate streak
  const streak = await calculateStreak(nodeId, today, completed);

  if (existing) {
    const [updated] = await db
      .update(habitLogs)
      .set({ completed: completed ? 1 : 0, streakCount: streak, notes })
      .where(eq(habitLogs.id, existing.id))
      .returning();
    revalidatePath("/");
    return updated;
  }

  const [log] = await db
    .insert(habitLogs)
    .values({
      id: crypto.randomUUID(),
      nodeId,
      completed: completed ? 1 : 0,
      logDate: today,
      streakCount: streak,
      notes,
      createdAt: Date.now(),
    })
    .returning();

  revalidatePath("/");
  return log;
}

async function calculateStreak(nodeId: string, today: string, completedToday: boolean): Promise<number> {
  if (!completedToday) return 0;

  // Get recent logs in descending order
  const recentLogs = await db.query.habitLogs.findMany({
    where: and(eq(habitLogs.nodeId, nodeId), lte(habitLogs.logDate, today)),
    orderBy: [desc(habitLogs.logDate)],
    limit: 365,
  });

  let streak = 1;
  for (let i = 0; i < recentLogs.length - 1; i++) {
    const current = new Date(recentLogs[i].logDate);
    const next = new Date(recentLogs[i + 1].logDate);
    const diff = (current.getTime() - next.getTime()) / 86_400_000;
    if (diff === 1 && recentLogs[i + 1].completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getTodayHabits() {
  const today = todayISO();
  const habitNodes = await db.query.nodes.findMany({
    where: eq(nodes.type, "habit"),
  });

  const todayLogs = await db.query.habitLogs.findMany({
    where: eq(habitLogs.logDate, today),
  });

  const logMap = new Map(todayLogs.map((l) => [l.nodeId, l]));

  return habitNodes
    .filter((n) => n.status === "active")
    .map((n) => ({
      node: n,
      log: logMap.get(n.id) || null,
      completed: logMap.get(n.id)?.completed === 1,
      streak: logMap.get(n.id)?.streakCount || 0,
    }));
}
