import OpenAI from "openai";

// Singleton OpenAI client
let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export const MODELS = {
  // Main reasoning model — coaching, planning, reviews
  smart: "gpt-4o" as const,
  // Fast extraction model — activity logging, analysis
  fast: "gpt-4o-mini" as const,
};
