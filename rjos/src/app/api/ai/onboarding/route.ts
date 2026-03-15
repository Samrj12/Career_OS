import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODELS } from "@/lib/ai/client";
import { TOOLS } from "@/lib/ai/tools";
import { buildOnboardingSystemPrompt } from "@/lib/ai/prompts/system";
import { GeneratedGraphSchema } from "@/lib/ai/schemas/graph";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const client = getAnthropicClient();

    const stream = await client.messages.stream({
      model: MODELS.smart,
      max_tokens: 4096,
      system: buildOnboardingSystemPrompt(),
      messages,
      tools: [TOOLS.generateGraph],
    });

    // Return a streaming response
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
                encoder.encode(`data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`)
              );
            }

            if (event.type === "content_block_stop") {
              // Check if a tool was used (graph generation)
              const message = await stream.finalMessage();
              const toolUse = message.content.find((b) => b.type === "tool_use");
              if (toolUse && toolUse.type === "tool_use" && toolUse.name === "generate_career_graph") {
                const parsed = GeneratedGraphSchema.safeParse(toolUse.input);
                if (parsed.success) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "graph_generated", graph: parsed.data })}\n\n`
                    )
                  );
                }
              }
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
    console.error("Onboarding API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
