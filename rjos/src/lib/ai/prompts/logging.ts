import type { Node } from "@/db/schema";

export function buildLoggingPrompt(nodes: Node[], rawInput: string): string {
  const nodeList = nodes
    .filter((n) => n.status === "active")
    .map((n) => `  ${n.id}: "${n.title}" (${n.type})`)
    .join("\n");

  return `Extract structured data from this activity log entry.

USER'S LOG:
"${rawInput}"

AVAILABLE NODES IN RJ'S GRAPH:
${nodeList}

EXTRACTION RULES:
1. Match the activity to the most specific relevant node.
2. If time is mentioned (e.g. "3 hours"), convert to minutes.
3. Estimate difficulty and focus from context clues.
4. Calculate impact score based on: relevance to goals + time invested + difficulty.
5. If critical info is missing (time spent, which node), include follow-up questions.
6. If quantitative progress was made (e.g. "solved 2 problems"), extract it.

Call the extract_activity tool with the structured data.`;
}
