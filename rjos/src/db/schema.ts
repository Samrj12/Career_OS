import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Rudraksh"),
  createdAt: integer("created_at").notNull(),
  onboardingComplete: integer("onboarding_complete").notNull().default(0),
  // JSON: { timezone, theme, stressTolerance, dailyAvailableHours }
  preferences: text("preferences").default("{}"),
});

// ─── Nodes (Goals, Milestones, Skills, Habits, Tasks) ────────────────────────
export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'goal' | 'milestone' | 'skill' | 'habit' | 'task'
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'paused' | 'abandoned'
  progress: real("progress").notNull().default(0), // 0.0 – 1.0
  healthScore: real("health_score").notNull().default(1.0), // 0.0 – 1.0
  importance: integer("importance").notNull().default(5), // 1–10
  confidence: real("confidence").notNull().default(0.5), // 0.0 – 1.0
  momentum: real("momentum").notNull().default(0.0), // -1.0 – 1.0
  color: text("color").notNull().default("green"), // 'green' | 'yellow' | 'red' | 'blue'
  targetValue: real("target_value"), // e.g. 300 for "solve 300 leetcode"
  currentValue: real("current_value"), // e.g. 63
  targetDate: integer("target_date"), // unix timestamp
  // JSON: type-specific data + optional { position: { x, y } } for graph layout
  metadata: text("metadata").default("{}"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// ─── Edges ────────────────────────────────────────────────────────────────────
export const edges = sqliteTable(
  "edges",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("parent_child"), // 'parent_child' | 'dependency' | 'related'
    weight: real("weight").notNull().default(1.0),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [unique().on(t.sourceId, t.targetId)]
);

// ─── Activity Logs ────────────────────────────────────────────────────────────
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  nodeId: text("node_id").references(() => nodes.id, { onDelete: "set null" }),
  rawInput: text("raw_input").notNull(),
  timeSpent: integer("time_spent"), // minutes
  difficulty: integer("difficulty"), // 1–10
  focusLevel: integer("focus_level"), // 1–10
  impactScore: real("impact_score"), // 0.0 – 1.0 (AI-calculated)
  // JSON: full AI-extracted structured data
  extractedData: text("extracted_data").default("{}"),
  loggedAt: integer("logged_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

// ─── Reflections ──────────────────────────────────────────────────────────────
export const reflections = sqliteTable("reflections", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("daily"), // 'daily' | 'weekly' | 'monthly'
  content: text("content").notNull(),
  inputMethod: text("input_method").notNull().default("text"), // 'text' | 'voice'
  // JSON: { burnoutScore, motivationScore, confidenceScore, keyThemes[], recommendations[] }
  aiAnalysis: text("ai_analysis").default("{}"),
  periodStart: integer("period_start").notNull(),
  periodEnd: integer("period_end").notNull(),
  createdAt: integer("created_at").notNull(),
});

// ─── Plans ────────────────────────────────────────────────────────────────────
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'daily' | 'weekly' | 'monthly'
  planDate: text("plan_date").notNull(), // ISO date: '2026-03-15'
  // JSON array: [{ nodeId, action, estimatedMinutes, priority, rationale, completed }]
  items: text("items").notNull().default("[]"),
  aiReasoning: text("ai_reasoning"),
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'revised'
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'onboarding' | 'coaching' | 'logging' | 'reflection'
  startedAt: integer("started_at").notNull(),
  endedAt: integer("ended_at"),
  summary: text("summary"),
});

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  // JSON: tool_use results, structured outputs, etc.
  metadata: text("metadata").default("{}"),
  createdAt: integer("created_at").notNull(),
});

// ─── Habit Logs ───────────────────────────────────────────────────────────────
export const habitLogs = sqliteTable(
  "habit_logs",
  {
    id: text("id").primaryKey(),
    nodeId: text("node_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    completed: integer("completed").notNull().default(0), // boolean
    logDate: text("log_date").notNull(), // ISO date: '2026-03-15'
    streakCount: integer("streak_count").notNull().default(0),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [unique().on(t.nodeId, t.logDate)]
);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'weekly' | 'monthly'
  periodStart: integer("period_start").notNull(),
  periodEnd: integer("period_end").notNull(),
  // JSON: full report structure
  content: text("content").notNull().default("{}"),
  // JSON: { codingHours, problemsSolved, outreachCount, ... }
  stats: text("stats").notNull().default("{}"),
  strengths: text("strengths").default("[]"), // JSON array
  weaknesses: text("weaknesses").default("[]"), // JSON array
  recommendations: text("recommendations").default("[]"), // JSON array
  createdAt: integer("created_at").notNull(),
});

// ─── Quotes ───────────────────────────────────────────────────────────────────
export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  source: text("source").notNull(), // e.g. 'Bhagavad Gita 2.47'
  usedOn: text("used_on"), // ISO date — prevents repeats
});

// ─── Types (inferred from schema) ─────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Node = typeof nodes.$inferSelect;
export type InsertNode = typeof nodes.$inferInsert;
export type NodeType = "goal" | "milestone" | "skill" | "habit" | "task";
export type NodeStatus = "active" | "completed" | "paused" | "abandoned";
export type NodeColor = "green" | "yellow" | "red" | "blue";

export type Edge = typeof edges.$inferSelect;
export type InsertEdge = typeof edges.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

export type Reflection = typeof reflections.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
