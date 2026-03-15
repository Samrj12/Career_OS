"use server";

import { db } from "@/db";
import { nodes, edges } from "@/db/schema";
import type { InsertNode, InsertEdge } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  calculateMomentum,
  calculateHealthScore,
  deriveColor,
  aggregateProgress,
  aggregateHealthScore,
  aggregateMomentum,
} from "@/lib/graph/calculations";

export async function createNode(data: Omit<InsertNode, "createdAt" | "updatedAt">) {
  const now = Date.now();
  const [node] = await db
    .insert(nodes)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning();
  revalidatePath("/graph");
  revalidatePath("/");
  return node;
}

export async function updateNode(id: string, data: Partial<InsertNode>) {
  const [node] = await db
    .update(nodes)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(nodes.id, id))
    .returning();
  revalidatePath("/graph");
  revalidatePath("/");
  return node;
}

export async function deleteNode(id: string) {
  await db.delete(nodes).where(eq(nodes.id, id));
  revalidatePath("/graph");
}

export async function getAllNodes() {
  return db.query.nodes.findMany({ orderBy: (n, { asc }) => [asc(n.createdAt)] });
}

export async function getAllEdges() {
  return db.query.edges.findMany();
}

export async function createEdge(data: Omit<InsertEdge, "createdAt">) {
  const [edge] = await db
    .insert(edges)
    .values({ ...data, createdAt: Date.now() })
    .returning();
  revalidatePath("/graph");
  return edge;
}

/**
 * Recalculate metrics (health, momentum, color) for a node
 * and propagate changes up the tree to parent nodes.
 */
export async function recalculateNodeMetrics(
  nodeId: string,
  recentActivityCount: number,
  previousActivityCount: number,
  daysSinceLastActivity: number | null
) {
  const node = await db.query.nodes.findFirst({ where: eq(nodes.id, nodeId) });
  if (!node) return;

  const momentum = calculateMomentum(recentActivityCount, previousActivityCount);
  const healthScore = calculateHealthScore({
    progress: node.progress,
    momentum,
    targetDate: node.targetDate,
    createdAt: node.createdAt,
    daysSinceLastActivity,
  });
  const color = deriveColor(node.status, healthScore);

  await db
    .update(nodes)
    .set({ momentum, healthScore, color, updatedAt: Date.now() })
    .where(eq(nodes.id, nodeId));

  // Propagate up to parents
  await propagateMetricsUp(nodeId);
}

async function propagateMetricsUp(childId: string) {
  // Find parent edges where this node is the target
  const parentEdges = await db.query.edges.findMany({
    where: eq(edges.targetId, childId),
  });

  for (const edge of parentEdges) {
    if (edge.type !== "parent_child") continue;
    await recalculateParentFromChildren(edge.sourceId);
    await propagateMetricsUp(edge.sourceId);
  }
}

async function recalculateParentFromChildren(parentId: string) {
  const parent = await db.query.nodes.findFirst({ where: eq(nodes.id, parentId) });
  if (!parent) return;

  // Get all children
  const childEdges = await db.query.edges.findMany({
    where: eq(edges.sourceId, parentId),
  });
  const childIds = childEdges
    .filter((e) => e.type === "parent_child")
    .map((e) => e.targetId);

  if (childIds.length === 0) return;

  const children = await db.query.nodes.findMany({
    where: inArray(nodes.id, childIds),
  });

  const progress = aggregateProgress(children);
  const healthScore = aggregateHealthScore(children);
  const momentum = aggregateMomentum(children);
  const color = deriveColor(parent.status, healthScore);

  await db
    .update(nodes)
    .set({ progress, healthScore, momentum, color, updatedAt: Date.now() })
    .where(eq(nodes.id, parentId));
}
