"use server";

import { db } from "@/db";
import { plans } from "@/db/schema";
import type { GeneratedPlan, PlanItem } from "@/lib/ai/schemas/plan";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { todayISO } from "@/lib/utils/dates";

export async function savePlan(type: "daily" | "weekly" | "monthly", planDate: string, generated: GeneratedPlan) {
  const now = Date.now();

  // Check if a plan already exists for this date+type
  const existing = await db.query.plans.findFirst({
    where: and(eq(plans.type, type), eq(plans.planDate, planDate)),
  });

  if (existing) {
    const [updated] = await db
      .update(plans)
      .set({
        items: JSON.stringify(generated.items),
        aiReasoning: generated.reasoning,
        status: "revised",
        updatedAt: now,
      })
      .where(eq(plans.id, existing.id))
      .returning();
    revalidatePath("/");
    return updated;
  }

  const [plan] = await db
    .insert(plans)
    .values({
      id: crypto.randomUUID(),
      type,
      planDate,
      items: JSON.stringify(generated.items),
      aiReasoning: generated.reasoning,
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidatePath("/");
  return plan;
}

export async function getTodayPlan() {
  return db.query.plans.findFirst({
    where: and(eq(plans.type, "daily"), eq(plans.planDate, todayISO())),
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });
}

export async function togglePlanItem(planId: string, itemIndex: number) {
  const plan = await db.query.plans.findFirst({ where: eq(plans.id, planId) });
  if (!plan) return;

  const items: PlanItem[] = JSON.parse(plan.items);
  if (items[itemIndex]) {
    items[itemIndex].completed = !items[itemIndex].completed;
  }

  const [updated] = await db
    .update(plans)
    .set({ items: JSON.stringify(items), updatedAt: Date.now() })
    .where(eq(plans.id, planId))
    .returning();

  revalidatePath("/");
  return updated;
}
