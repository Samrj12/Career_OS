import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, MODELS } from "@/lib/ai/client";
import { TOOLS } from "@/lib/ai/tools";
import { ReflectionAnalysisSchema } from "@/lib/ai/schemas/analysis";
import { buildReflectionPrompt } from "@/lib/ai/prompts/reflection";
import { db } from "@/db";
import { reflections } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    const today = new Date().toISOString().split("T")[0];
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 1024,
      messages: [{ role: "user", content: buildReflectionPrompt(content, today) }],
      tools: [TOOLS.analyzeReflection],
      tool_choice: "required",
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return NextResponse.json({ error: "No analysis" }, { status: 500 });
    }

    const parsed = ReflectionAnalysisSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analysis" }, { status: 500 });
    }

    // Save to DB
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    await db.insert(reflections).values({
      id: crypto.randomUUID(),
      type: "daily",
      content,
      inputMethod: "text",
      aiAnalysis: JSON.stringify(parsed.data),
      periodStart: start.getTime(),
      periodEnd: end.getTime(),
      createdAt: now,
    });

    return NextResponse.json({ analysis: parsed.data });
  } catch (err) {
    console.error("Reflect API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
