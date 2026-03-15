import type { Node } from "@/db/schema";

export function buildPlanningPrompt(
  nodes: Node[],
  date: string,
  availableHours: number,
  recentActivitySummary: string
): string {
  const activeNodes = nodes.filter(
    (n) => n.status === "active" && n.type !== "goal"
  );

  const behind = activeNodes.filter((n) => n.color === "red").map((n) => n.title);
  const onTrack = activeNodes.filter((n) => n.color === "green").map((n) => n.title);
  const needsAttention = activeNodes.filter((n) => n.color === "yellow").map((n) => n.title);

  return `Generate a focused, achievable daily plan for RJ on ${date}.

Available time today: ${availableHours} hours (${availableHours * 60} minutes)

GRAPH STATUS:
- Behind schedule (red): ${behind.join(", ") || "none"}
- Needs attention (yellow): ${needsAttention.join(", ") || "none"}
- On track (green): ${onTrack.join(", ") || "none"}

RECENT ACTIVITY:
${recentActivitySummary || "No recent activity."}

PLANNING RULES:
1. Prioritize red nodes first — they need the most attention.
2. Never schedule more than ${availableHours * 60} total minutes.
3. Max 10 items in the plan.
4. Each item must reference a specific node ID from the graph.
5. Be specific about actions — not "work on LeetCode" but "solve 2 graph problems on LeetCode".
6. Include at least one habit-maintenance item if habits are lagging.
7. Leave room for unexpected tasks — don't fill 100% of time.

Call the generate_daily_plan tool with the plan.`;
}
