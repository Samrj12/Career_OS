import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const MODELS = {
  // Main reasoning model — coaching, planning, reviews
  smart: "claude-sonnet-4-6" as const,
  // Fast extraction model — activity logging, analysis
  fast: "claude-haiku-4-5-20251001" as const,
};
