import { NextResponse } from "next/server";
import { getAnthropicClient, MODELS } from "@/lib/ai/client";
import { buildWeeklyReviewPrompt } from "@/lib/ai/prompts/review";
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

    const totalPlanned = 7;
    const completedDays = new Set(weekActivities.map((a) => new Date(a.loggedAt).toISOString().split("T")[0])).size;
    const planCompletionRate = completedDays / totalPlanned;

    const prompt = buildWeeklyReviewPrompt(
      { activityLogs: activityData, habitLogs: habitData, planCompletionRate },
      new Date(weekStart).toISOString().split("T")[0],
      new Date(now).toISOString().split("T")[0]
    );

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";

    // Parse AI response into structured sections
    const totalHours = weekActivities.reduce((s, a) => s + (a.timeSpent || 0), 0) / 60;
    const habitCompletionRate = weekHabits.length
      ? weekHabits.filter((h) => h.completed === 1).length / weekHabits.length
      : 0;

    const stats = {
      activeHours: Math.round(totalHours * 10) / 10,
      activitiesLogged: weekActivities.length,
      habitCompletionPct: Math.round(habitCompletionRate * 100),
      activeDays: completedDays,
    };

    // Simple section parsing
    const strengths = extractListSection(text, ["strength", "went well", "strong"]);
    const weaknesses = extractListSection(text, ["weakness", "missed", "needs work", "behind"]);
    const recommendations = extractListSection(text, ["recommend", "next week", "should", "increase", "reduce"]);

    await db.insert(reports).values({
      id: crypto.randomUUID(),
      type: "weekly",
      periodStart: weekStart,
      periodEnd: now,
      content: JSON.stringify({ text }),
      stats: JSON.stringify(stats),
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
      recommendations: JSON.stringify(recommendations),
      createdAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review generation error:", err);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}

function extractListSection(text: string, keywords: string[]): string[] {
  const lines = text.split("\n");
  const results: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      inSection = true;
    }
    if (inSection && (line.startsWith("-") || line.match(/^\d+\./))) {
      const item = line.replace(/^[-\d.)\s]+/, "").trim();
      if (item) results.push(item);
    }
    if (inSection && line.trim() === "" && results.length > 0) {
      break;
    }
  }

  return results.slice(0, 5);
}
