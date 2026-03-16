import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, MODELS } from "@/lib/ai/client";
import { TOOLS } from "@/lib/ai/tools";
import { buildOnboardingSystemPrompt } from "@/lib/ai/prompts/system";
import { GeneratedGraphSchema } from "@/lib/ai/schemas/graph";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const client = getOpenAIClient();

    const stream = await client.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 4096,
      messages: [
        { role: "system", content: buildOnboardingSystemPrompt() },
        ...messages,
      ],
      tools: [TOOLS.generateGraph],
      tool_choice: "auto",
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let toolCallName = "";
          let toolCallArgs = "";

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text: delta.content })}\n\n`)
              );
            }

            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.function?.name) toolCallName = tc.function.name;
                if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
              }
            }

            if (
              chunk.choices[0]?.finish_reason === "tool_calls" &&
              toolCallName === "generate_career_graph"
            ) {
              const parsed = GeneratedGraphSchema.safeParse(JSON.parse(toolCallArgs));
              if (parsed.success) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "graph_generated", graph: parsed.data })}\n\n`
                  )
                );
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
