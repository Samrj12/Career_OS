import type { NodeColor } from "@/db/schema";

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate momentum from recent vs previous activity counts.
 * recentCount: activities in last 7 days
 * previousCount: activities in days 8-14
 * Returns -1.0 to 1.0
 */
export function calculateMomentum(recentCount: number, previousCount: number): number {
  if (previousCount === 0) {
    return clamp(recentCount * 0.2, -1, 1);
  }
  return clamp((recentCount - previousCount) / previousCount, -1, 1);
}

/**
 * Calculate health score for a node.
 * Returns 0.0 to 1.0
 */
export function calculateHealthScore(params: {
  progress: number; // 0–1
  momentum: number; // -1–1
  targetDate: number | null | undefined;
  createdAt: number;
  daysSinceLastActivity: number | null;
}): number {
  const { progress, momentum, targetDate, createdAt, daysSinceLastActivity } = params;
  const now = Date.now();

  // Time factor: how on-track are we relative to timeline?
  let timeFactor = 1.0;
  if (targetDate) {
    const totalDuration = targetDate - createdAt;
    const elapsed = now - createdAt;
    const expectedProgress = totalDuration > 0 ? elapsed / totalDuration : 0;
    if (expectedProgress > 0) {
      timeFactor = clamp(progress / expectedProgress, 0, 1.5) / 1.5;
    }
  } else {
    timeFactor = progress; // Without deadline, use raw progress
  }

  // Momentum factor: normalized 0–1
  const momentumFactor = (momentum + 1.0) / 2.0;

  // Recency factor: decays over 14 days of inactivity
  const recencyFactor =
    daysSinceLastActivity !== null && daysSinceLastActivity !== undefined
      ? Math.max(1.0 - daysSinceLastActivity / 14.0, 0)
      : 0.5;

  return clamp(timeFactor * 0.4 + momentumFactor * 0.3 + recencyFactor * 0.3, 0, 1);
}

/**
 * Derive color from node state.
 */
export function deriveColor(status: string, healthScore: number): NodeColor {
  if (status === "completed") return "blue";
  if (healthScore >= 0.7) return "green";
  if (healthScore >= 0.4) return "yellow";
  return "red";
}

/**
 * Calculate aggregated progress for a parent node based on its children.
 */
export function aggregateProgress(
  children: Array<{ progress: number; importance: number }>
): number {
  if (children.length === 0) return 0;
  const totalWeight = children.reduce((sum, c) => sum + c.importance, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = children.reduce(
    (sum, c) => sum + c.progress * c.importance,
    0
  );
  return clamp(weightedSum / totalWeight, 0, 1);
}

/**
 * Calculate aggregated health score for a parent node.
 */
export function aggregateHealthScore(
  children: Array<{ healthScore: number; importance: number }>
): number {
  if (children.length === 0) return 1.0;
  const totalWeight = children.reduce((sum, c) => sum + c.importance, 0);
  if (totalWeight === 0) return 1.0;
  const weightedSum = children.reduce(
    (sum, c) => sum + c.healthScore * c.importance,
    0
  );
  return clamp(weightedSum / totalWeight, 0, 1);
}

/**
 * Calculate average momentum for a parent node.
 */
export function aggregateMomentum(children: Array<{ momentum: number }>): number {
  if (children.length === 0) return 0;
  const avg = children.reduce((sum, c) => sum + c.momentum, 0) / children.length;
  return clamp(avg, -1, 1);
}

/** Format progress as a percentage string */
export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

/** Format health score as a label */
export function healthLabel(score: number): string {
  if (score >= 0.8) return "Excellent";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Fair";
  if (score >= 0.2) return "Poor";
  return "Critical";
}
