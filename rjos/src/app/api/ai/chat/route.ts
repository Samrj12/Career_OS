import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODELS } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts/system";
import { getAllNodes } from "@/actions/nodes";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const client = getAnthropicClient();
    const allNodes = await getAllNodes();
    const today = new Date().toISOString().split("T")[0];

    const stream = await client.messages.stream({
      model: MODELS.smart,
      max_tokens: 2048,
      system: buildSystemPrompt(allNodes, today),
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
