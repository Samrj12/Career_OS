export function buildReflectionPrompt(content: string, date: string): string {
  return `Analyze this daily reflection from RJ (${date}).

REFLECTION:
"${content}"

ANALYSIS RULES:
1. Detect burnout signals: mentions of exhaustion, feeling stuck, overwhelm, loss of purpose.
2. Detect motivation signals: excitement, progress mentions, eagerness for tomorrow.
3. Assess confidence from language tone and outcome descriptions.
4. Energy level: explicit or implicit mentions of energy, tiredness, vitality.
5. Extract key themes (max 5): what was this day really about?
6. Generate 1-3 actionable recommendations for tomorrow.
7. Write a warm, brief empathetic response (2-3 sentences) — like a mentor who truly gets it.

Quote a relevant line from the Bhagavad Gita or Mahabharata in your response if it fits naturally.

Call the analyze_reflection tool with your analysis.`;
}
