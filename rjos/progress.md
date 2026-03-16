# RJ-OS Progress Log

## 2026-03-16

### Fix: tailwindcss-animate incompatibility with Tailwind v4
- Replaced `tailwindcss-animate` (Tailwind v3 PostCSS plugin) with `tw-animate-css` (pure CSS, Tailwind v4 compatible)
- Updated `src/app/globals.css`: `@import "tailwindcss-animate"` → `@import "tw-animate-css"`
- Updated `package.json` dependency accordingly

### Feat: Migrate AI backend from Anthropic to OpenAI
- Replaced `@anthropic-ai/sdk` with `openai` package
- `src/lib/ai/client.ts`: OpenAI singleton client; models → `gpt-4o` (smart), `gpt-4o-mini` (fast)
- `src/lib/ai/tools.ts`: converted all 5 tool definitions to OpenAI function-calling format
- API routes updated:
  - `api/ai/chat` — streaming conversation via `chat.completions.create({ stream: true })`
  - `api/ai/onboarding` — streaming + tool use (accumulates tool call args across stream chunks)
  - `api/ai/log` — structured activity extraction via `tool_choice: "required"`
  - `api/ai/reflect` — reflection analysis via tool call
  - `api/ai/review` — weekly report generation via tool call
  - `api/ai/plan` — daily plan generation via tool call
- `.env.example`: `ANTHROPIC_API_KEY` → `OPENAI_API_KEY`
- **Action required**: update `.env.local` to use `OPENAI_API_KEY`
