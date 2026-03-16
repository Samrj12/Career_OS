import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, MODELS } from "@/lib/ai/client";
import { TOOLS } from "@/lib/ai/tools";
import { ActivityExtractionSchema } from "@/lib/ai/schemas/analysis";
import { buildLoggingPrompt } from "@/lib/ai/prompts/logging";
import { getAllNodes } from "@/actions/nodes";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const nodes = await getAllNodes();
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: MODELS.fast,
      max_tokens: 1024,
      messages: [{ role: "user", content: buildLoggingPrompt(nodes, input) }],
      tools: [TOOLS.extractActivity],
      tool_choice: "required",
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return NextResponse.json({ error: "No extraction" }, { status: 500 });
    }

    const parsed = ActivityExtractionSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid extraction" }, { status: 500 });
    }

    // Find matching node
    const nodeId = parsed.data.nodeId
      ? nodes.find((n) => n.id === parsed.data.nodeId)?.id ?? null
      : null;

    return NextResponse.json({ extraction: parsed.data, nodeId });
  } catch (err) {
    console.error("Log API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
