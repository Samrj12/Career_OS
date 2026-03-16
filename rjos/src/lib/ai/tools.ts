import type OpenAI from "openai";

// OpenAI tool definitions with JSON schemas

export const TOOLS: Record<string, OpenAI.ChatCompletionTool> = {
  generateGraph: {
    type: "function",
    function: {
      name: "generate_career_graph",
      description: "Generate the initial career graph based on the onboarding interview. Creates all nodes (goals, milestones, skills, habits, tasks) and their relationships.",
      parameters: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            description: "All nodes in the career graph",
            items: {
              type: "object",
              properties: {
                tempId: { type: "string", description: "Temporary ID (e.g. 'goal_1', 'milestone_2')" },
                type: { type: "string", enum: ["goal", "milestone", "skill", "habit", "task"] },
                title: { type: "string", minLength: 1, maxLength: 100 },
                description: { type: "string" },
                importance: { type: "integer", minimum: 1, maximum: 10, default: 5 },
                targetValue: { type: "number", description: "Numeric target, e.g. 300 for 300 leetcode problems" },
                currentValue: { type: "number", description: "Current numeric value" },
                targetDate: { type: "string", description: "ISO date string, e.g. '2026-12-31'" },
              },
              required: ["tempId", "type", "title"],
            },
            minItems: 3,
          },
          edges: {
            type: "array",
            description: "Directed edges connecting nodes",
            items: {
              type: "object",
              properties: {
                sourceTempId: { type: "string" },
                targetTempId: { type: "string" },
                type: { type: "string", enum: ["parent_child", "dependency", "related"], default: "parent_child" },
              },
              required: ["sourceTempId", "targetTempId"],
            },
          },
          habits: {
            type: "array",
            description: "Daily habits auto-generated from goals",
            items: {
              type: "object",
              properties: {
                tempId: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                parentTempId: { type: "string", description: "Which skill or milestone this habit supports" },
                importance: { type: "integer", minimum: 1, maximum: 10, default: 5 },
              },
              required: ["tempId", "title", "parentTempId"],
            },
          },
          summary: { type: "string", description: "1-2 sentence summary of the career plan" },
        },
        required: ["nodes", "edges", "habits", "summary"],
      },
    },
  },

  generateDailyPlan: {
    type: "function",
    function: {
      name: "generate_daily_plan",
      description: "Generate a prioritized daily plan based on the current career graph state and recent activity.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            minItems: 1,
            maxItems: 10,
            items: {
              type: "object",
              properties: {
                nodeId: { type: "string" },
                nodeTitle: { type: "string" },
                action: { type: "string" },
                estimatedMinutes: { type: "integer", minimum: 5, maximum: 480 },
                priority: { type: "integer", minimum: 1, maximum: 5, description: "1 = highest" },
                rationale: { type: "string" },
                completed: { type: "boolean", default: false },
              },
              required: ["nodeId", "nodeTitle", "action", "estimatedMinutes", "priority", "rationale"],
            },
          },
          totalMinutes: { type: "integer" },
          reasoning: { type: "string" },
          motivationalNote: { type: "string" },
        },
        required: ["items", "totalMinutes", "reasoning", "motivationalNote"],
      },
    },
  },

  extractActivity: {
    type: "function",
    function: {
      name: "extract_activity",
      description: "Extract structured data from a natural language activity log entry.",
      parameters: {
        type: "object",
        properties: {
          nodeId: { type: ["string", "null"], description: "ID of the most relevant graph node, or null" },
          nodeTitle: { type: ["string", "null"] },
          timeSpent: { type: ["integer", "null"], description: "Minutes spent" },
          difficulty: { type: ["integer", "null"], minimum: 1, maximum: 10 },
          focusLevel: { type: ["integer", "null"], minimum: 1, maximum: 10 },
          impactScore: { type: ["number", "null"], minimum: 0, maximum: 1 },
          quantitativeProgress: {
            type: ["object", "null"],
            properties: {
              value: { type: "number" },
              description: { type: "string" },
            },
            required: ["value", "description"],
          },
          followUpQuestions: {
            type: "array",
            maxItems: 3,
            items: { type: "string" },
          },
          summary: { type: "string" },
        },
        required: ["nodeId", "nodeTitle", "timeSpent", "difficulty", "focusLevel", "impactScore", "followUpQuestions", "summary"],
      },
    },
  },

  generateWeeklyReport: {
    type: "function",
    function: {
      name: "generate_weekly_report",
      description: "Generate a structured weekly performance report with insights, strengths, weaknesses, and next-week recommendations.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "2-3 sentence overall weekly summary" },
          strengths: {
            type: "array",
            maxItems: 5,
            items: { type: "string" },
            description: "What went well this week — specific, quantified where possible",
          },
          weaknesses: {
            type: "array",
            maxItems: 5,
            items: { type: "string" },
            description: "What needs improvement or was missed this week",
          },
          recommendations: {
            type: "array",
            maxItems: 5,
            items: { type: "string" },
            description: "Concrete, specific actions for next week",
          },
          focusArea: { type: "string", description: "The single most important focus for next week" },
        },
        required: ["summary", "strengths", "weaknesses", "recommendations", "focusArea"],
      },
    },
  },

  analyzeReflection: {
    type: "function",
    function: {
      name: "analyze_reflection",
      description: "Analyze a daily reflection for burnout, motivation, confidence and productivity trends.",
      parameters: {
        type: "object",
        properties: {
          burnoutScore: { type: "number", minimum: 0, maximum: 1 },
          motivationScore: { type: "number", minimum: 0, maximum: 1 },
          confidenceScore: { type: "number", minimum: 0, maximum: 1 },
          energyLevel: { type: "number", minimum: 0, maximum: 1 },
          keyThemes: { type: "array", maxItems: 5, items: { type: "string" } },
          recommendations: { type: "array", maxItems: 3, items: { type: "string" } },
          aiResponse: { type: "string" },
        },
        required: ["burnoutScore", "motivationScore", "confidenceScore", "energyLevel", "keyThemes", "recommendations", "aiResponse"],
      },
    },
  },
};
