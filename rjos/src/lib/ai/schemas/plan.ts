import { z } from "zod";

export const PlanItemSchema = z.object({
  nodeId: z.string().describe("ID of the node this task relates to"),
  nodeTitle: z.string().describe("Human-readable title of the node"),
  action: z.string().describe("Specific action to take, e.g. 'Solve 2 graph problems on LeetCode'"),
  estimatedMinutes: z.number().int().min(5).max(480),
  priority: z.number().int().min(1).max(5).describe("1 = highest priority"),
  rationale: z.string().describe("Why this is on today's plan"),
  completed: z.boolean().default(false),
});

export const GeneratedPlanSchema = z.object({
  items: z.array(PlanItemSchema).min(1).max(10),
  totalMinutes: z.number().int(),
  reasoning: z.string().describe("Overall reasoning for this plan"),
  motivationalNote: z.string().describe("Short motivational message for the day"),
});

export type PlanItem = z.infer<typeof PlanItemSchema>;
export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;
