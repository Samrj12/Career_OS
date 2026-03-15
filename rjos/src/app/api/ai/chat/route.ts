import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODELS } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts/system";
import { getAllNodes } from "@/actions/nodes";
import { getRecentActivities } from "@/actions/activities";
import { getTodayPlan } from "@/actions/plans";
import { db } from "@/db";
import type { PlanItem } from "@/lib/ai/schemas/plan";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const client = getAnthropicClient();
    const today = new Date().toISOString().split("T")[0];

    const [allNodes, recentActivities, todayPlan, latestReflection] = await Promise.all([
      getAllNodes(),
      getRecentActivities(5),
      getTodayPlan(),
      db.query.reflections.findFirst({ orderBy: (r, { desc }) => [desc(r.createdAt)] }),
    ]);

    // Build recent activity summary
    const recentActivitySummary = recentActivities.length
      ? recentActivities
          .map((a) => {
            const data = JSON.parse(a.extractedData || "{}");
            const date = new Date(a.loggedAt).toISOString().split("T")[0];
            return `${data.nodeTitle || "Unknown"}: ${a.timeSpent || 0}min on ${date}`;
          })
          .join("; ")
      : undefined;

    // Build today's plan summary
    let todayPlanSummary: string | undefined;
    if (todayPlan) {
      const items: PlanItem[] = JSON.parse(todayPlan.items);
      const completed = items.filter((i) => i.completed).length;
      todayPlanSummary = `${completed}/${items.length} items done — ${items
        .filter((i) => !i.completed)
        .slice(0, 3)
        .map((i) => i.action)
        .join(", ")}`;
    }

    // Build recent reflection summary
    let recentReflectionSummary: string | undefined;
    if (latestReflection) {
      const analysis = JSON.parse(latestReflection.aiAnalysis || "{}");
      if (analysis.burnoutScore !== undefined) {
        const date = new Date(latestReflection.createdAt).toISOString().split("T")[0];
        recentReflectionSummary = `[${date}] burnout ${Math.round(analysis.burnoutScore * 100)}%, motivation ${Math.round((analysis.motivationScore ?? 0) * 100)}% — themes: ${(analysis.keyThemes ?? []).join(", ")}`;
      }
    }

    const stream = await client.messages.stream({
      model: MODELS.smart,
      max_tokens: 2048,
      system: buildSystemPrompt(allNodes, today, {
        recentActivitySummary,
        todayPlanSummary,
        recentReflectionSummary,
      }),
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
