import { z } from "zod";

export const ActivityExtractionSchema = z.object({
  nodeId: z.string().nullable().describe("ID of the most relevant graph node, or null if unclear"),
  nodeTitle: z.string().nullable(),
  timeSpent: z.number().int().min(1).nullable().describe("Minutes spent on this activity"),
  difficulty: z.number().int().min(1).max(10).nullable().describe("1=trivial, 10=extremely hard"),
  focusLevel: z.number().int().min(1).max(10).nullable().describe("1=very distracted, 10=deep focus"),
  impactScore: z.number().min(0).max(1).nullable().describe("Estimated impact on career goals, 0-1"),
  quantitativeProgress: z.object({
    value: z.number(),
    description: z.string().describe("e.g. '2 LeetCode problems solved'"),
  }).nullable().describe("Any measurable progress made"),
  followUpQuestions: z.array(z.string()).max(3).describe("Questions to ask user if data is incomplete"),
  summary: z.string().describe("One-sentence summary of the logged activity"),
});

export const ReflectionAnalysisSchema = z.object({
  burnoutScore: z.number().min(0).max(1).describe("0=no burnout, 1=severe burnout"),
  motivationScore: z.number().min(0).max(1).describe("0=no motivation, 1=highly motivated"),
  confidenceScore: z.number().min(0).max(1).describe("0=no confidence, 1=very confident"),
  energyLevel: z.number().min(0).max(1).describe("0=exhausted, 1=high energy"),
  keyThemes: z.array(z.string()).max(5).describe("Key themes detected in the reflection"),
  recommendations: z.array(z.string()).max(3).describe("Actionable recommendations based on reflection"),
  aiResponse: z.string().describe("Empathetic response to the reflection"),
});

export type ActivityExtraction = z.infer<typeof ActivityExtractionSchema>;
export type ReflectionAnalysis = z.infer<typeof ReflectionAnalysisSchema>;
