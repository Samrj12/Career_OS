# RJ-OS — Personal Career Operating System

## Quick Start
```bash
npm install
cp .env.example .env.local   # Add your OPENAI_API_KEY
mkdir -p data
npx drizzle-kit push
npx tsx src/db/seed.ts       # Seed quotes table
npm run dev
```

## Tech Stack
- **Next.js 15+** (App Router, TypeScript, React 19)
- **SQLite** (`better-sqlite3`) + **Drizzle ORM** — local single-file database at `data/rjos.db`
- **React Flow** (`@xyflow/react`) + **dagre** — interactive career graph visualization
- **shadcn/ui** + **Tailwind CSS** — UI components
- **Recharts** — analytics charts (via shadcn Chart component)
- **OpenAI API** (`openai`) — all AI features (gpt-4o / gpt-4o-mini)
- **Web Speech API** — voice journaling (browser-native, Chrome only)

## Architecture

### Data Flow
- **Server Components** fetch data directly from SQLite on every render (no stale cache)
- **Server Actions** (`src/actions/`) handle all data mutations
- **Route Handlers** (`src/app/api/ai/`) only for AI streaming responses (coaching, onboarding)
- No client-side state management library — database is the source of truth

### AI Integration
- All data-producing AI calls use `tool_use` with **Zod schemas** — no free-text parsing
- Streaming only for conversational UI (coaching, onboarding)
- Base system prompt always includes: current graph summary, recent activity, plan status, active streaks
- Conversation context: last 20 messages + graph summary (summarize older messages)

### Graph Logic
- Single `nodes` table with `type` discriminator (`goal|milestone|skill|habit|task`)
- Parent nodes aggregate children's metrics via weighted average
- Node metrics (`health_score`, `momentum`, `color`) recalculated on every write, stored on the node
- Layout computed with dagre on page load; pinned positions stored in `metadata.position`

## Key Directories
```
src/db/           Drizzle schema, DB connection singleton, seed
src/lib/ai/       Anthropic client, prompts, Zod schemas, tool definitions
src/lib/graph/    Health score calculations, dagre layout, graph traversal
src/actions/      Server Actions: nodes, edges, activities, plans, habits, reports
src/app/api/ai/   Route Handlers: streaming chat, onboarding
src/components/
  graph/          React Flow custom nodes (5 types), NodeDetailPanel, CareerGraph
  dashboard/      Greeting, plan cards, milestone summary, growth chart
  chat/           Shared ChatInterface, MessageBubble, VoiceInput
  activity/       ActivityForm, ActivityHistory
  habits/         HabitTracker, HabitCard
  ui/             shadcn/ui components
```

## Conventions
- UUIDs for all primary keys (`crypto.randomUUID()`)
- Dates stored as Unix timestamps (INTEGER) in DB
- All AI structured outputs validated with Zod before DB writes
- Node color: `blue` = completed, `green` = health ≥ 0.7, `yellow` = ≥ 0.4, `red` < 0.4

## Database
```bash
npx drizzle-kit push    # Apply schema changes (dev)
npx drizzle-kit studio  # Open Drizzle Studio (DB browser)
```
Database file: `data/rjos.db` (gitignored)

## Pages
| Route | Purpose |
|---|---|
| `/` | Dashboard |
| `/onboarding` | First-run AI interview |
| `/graph` | Interactive career graph |
| `/meet` | AI coaching chat |
| `/log` | Activity logging |
| `/reflect` | Daily reflection |
| `/review` | Weekly/monthly reports |
