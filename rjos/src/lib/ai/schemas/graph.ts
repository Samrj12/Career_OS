import { z } from "zod";

export const NodeTypeSchema = z.enum(["goal", "milestone", "skill", "habit", "task"]);
export const NodeColorSchema = z.enum(["green", "yellow", "red", "blue"]);

export const AINodeSchema = z.object({
  tempId: z.string().describe("Temporary ID used to reference this node in edges (e.g. 'goal_1', 'milestone_2')"),
  type: NodeTypeSchema,
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  importance: z.number().int().min(1).max(10).default(5),
  targetValue: z.number().optional().describe("Numeric target, e.g. 300 for 300 leetcode problems"),
  currentValue: z.number().optional().describe("Current numeric value, e.g. 63"),
  targetDate: z.string().optional().describe("ISO date string, e.g. '2026-12-31'"),
});

export const AIEdgeSchema = z.object({
  sourceTempId: z.string().describe("tempId of parent/source node"),
  targetTempId: z.string().describe("tempId of child/target node"),
  type: z.enum(["parent_child", "dependency", "related"]).default("parent_child"),
});

export const GeneratedGraphSchema = z.object({
  nodes: z.array(AINodeSchema).min(3).describe("All nodes in the career graph"),
  edges: z.array(AIEdgeSchema).describe("Directed edges connecting nodes"),
  habits: z.array(z.object({
    tempId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    parentTempId: z.string().describe("Which skill or milestone this habit supports"),
    importance: z.number().int().min(1).max(10).default(5),
  })).describe("Daily habits auto-generated from goals"),
  summary: z.string().describe("1-2 sentence summary of the career plan"),
});

export type AINode = z.infer<typeof AINodeSchema>;
export type AIEdge = z.infer<typeof AIEdgeSchema>;
export type GeneratedGraph = z.infer<typeof GeneratedGraphSchema>;
