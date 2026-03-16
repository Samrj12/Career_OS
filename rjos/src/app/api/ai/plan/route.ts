import { NextResponse } from "next/server";
import { getOpenAIClient, MODELS } from "@/lib/ai/client";
import { buildPlanningPrompt } from "@/lib/ai/prompts/planning";
import { TOOLS } from "@/lib/ai/tools";
import { savePlan } from "@/actions/plans";
import { getAllNodes } from "@/actions/nodes";
import { getRecentActivities } from "@/actions/activities";
import { db } from "@/db";
import { todayISO } from "@/lib/utils/dates";
import type { GeneratedPlan } from "@/lib/ai/schemas/plan";

export async function POST() {
  try {
    const [allNodes, recentActivities, user] = await Promise.all([
      getAllNodes(),
      getRecentActivities(10),
      db.query.users.findFirst(),
    ]);

    if (allNodes.length === 0) {
      return NextResponse.json({ error: "No career graph found. Complete onboarding first." }, { status: 400 });
    }

    const activitySummary = recentActivities.length
      ? recentActivities
          .slice(0, 5)
          .map((a) => {
            const data = JSON.parse(a.extractedData || "{}");
            const date = new Date(a.loggedAt).toISOString().split("T")[0];
            return `- ${data.nodeTitle || "Unknown"}: ${a.timeSpent || 0}min on ${date}`;
          })
          .join("\n")
      : "No recent activity.";

    const prefs = user?.preferences ? JSON.parse(user.preferences) : {};
    const availableHours: number = prefs.dailyAvailableHours ?? 6;

    const today = todayISO();
    const prompt = buildPlanningPrompt(allNodes, today, availableHours, activitySummary);

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 1024,
      tools: [TOOLS.generateDailyPlan],
      tool_choice: "required",
      messages: [{ role: "user", content: prompt }],
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return NextResponse.json({ error: "AI did not return a plan" }, { status: 500 });
    }

    const plan = await savePlan("daily", today, JSON.parse(toolCall.function.arguments) as GeneratedPlan);
    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("Plan generation error:", err);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
