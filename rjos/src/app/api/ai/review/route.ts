import { NextResponse } from "next/server";
import { getOpenAIClient, MODELS } from "@/lib/ai/client";
import { buildWeeklyReviewPrompt } from "@/lib/ai/prompts/review";
import { TOOLS } from "@/lib/ai/tools";
import { db } from "@/db";
import { activityLogs, habitLogs, reports } from "@/db/schema";
import { gte } from "drizzle-orm";

export async function POST() {
  try {
    const now = Date.now();
    const weekStart = now - 7 * 86_400_000;

    const [weekActivities, weekHabits] = await Promise.all([
      db.query.activityLogs.findMany({ where: gte(activityLogs.loggedAt, weekStart) }),
      db.query.habitLogs.findMany({ where: gte(habitLogs.createdAt, weekStart) }),
    ]);

    const activityData = weekActivities.map((a) => {
      const data = JSON.parse(a.extractedData || "{}");
      return {
        nodeTitle: data.nodeTitle || "Unknown",
        timeSpent: a.timeSpent || 0,
        date: new Date(a.loggedAt).toISOString().split("T")[0],
      };
    });

    const habitData = weekHabits.map((h) => ({
      nodeTitle: h.nodeId,
      completed: h.completed === 1,
      date: h.logDate,
    }));

    // Use actual active days in the week, not a hardcoded 7
    const activeDays = new Set(weekActivities.map((a) => new Date(a.loggedAt).toISOString().split("T")[0])).size;
    const planCompletionRate = activeDays / 7;

    const prompt = buildWeeklyReviewPrompt(
      { activityLogs: activityData, habitLogs: habitData, planCompletionRate },
      new Date(weekStart).toISOString().split("T")[0],
      new Date(now).toISOString().split("T")[0]
    );

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 1024,
      tools: [TOOLS.generateWeeklyReport],
      tool_choice: "required",
      messages: [{ role: "user", content: prompt }],
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return NextResponse.json({ error: "AI did not return a structured report" }, { status: 500 });
    }

    const reportData = JSON.parse(toolCall.function.arguments) as {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      focusArea: string;
    };

    const totalHours = weekActivities.reduce((s, a) => s + (a.timeSpent || 0), 0) / 60;
    const habitCompletionRate = weekHabits.length
      ? weekHabits.filter((h) => h.completed === 1).length / weekHabits.length
      : 0;

    const stats = {
      activeHours: Math.round(totalHours * 10) / 10,
      activitiesLogged: weekActivities.length,
      habitCompletionPct: Math.round(habitCompletionRate * 100),
      activeDays,
    };

    await db.insert(reports).values({
      id: crypto.randomUUID(),
      type: "weekly",
      periodStart: weekStart,
      periodEnd: now,
      content: JSON.stringify({ summary: reportData.summary, focusArea: reportData.focusArea }),
      stats: JSON.stringify(stats),
      strengths: JSON.stringify(reportData.strengths),
      weaknesses: JSON.stringify(reportData.weaknesses),
      recommendations: JSON.stringify(reportData.recommendations),
      createdAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review generation error:", err);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
