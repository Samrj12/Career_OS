import { db } from "@/db";
import { quotes } from "@/db/schema";
import { getGreeting, todayISO } from "@/lib/utils/dates";
import { ne, isNull, or, eq } from "drizzle-orm";

export async function Greeting() {
  const greeting = getGreeting();
  const today = todayISO();

  const unusedQuotes = await db.query.quotes.findMany({
    where: or(isNull(quotes.usedOn), ne(quotes.usedOn, today)),
    limit: 10,
  });

  // eslint-disable-next-line react-hooks/purity
  const idx = Math.floor(Date.now() / 1000) % (unusedQuotes.length || 1);
  const quote = unusedQuotes[idx];

  if (quote) {
    await db.update(quotes).set({ usedOn: today }).where(eq(quotes.id, quote.id));
  }

  return (
    <div className="relative w-full">
      {/* Paper clip at top-left */}
      <img
        src="/assets/stationary_elements/xSXenWs1UJkTy0XAXVlAQAAwlE.png"
        alt=""
        className="absolute -top-4 -left-3 w-[36px] h-auto pointer-events-none select-none z-10 rotate-[-8deg]"
      />

      {/* Main greeting card — paper sheet rotated slightly */}
      <div
        className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-8 overflow-hidden"
        style={{ transform: "rotate(-0.5deg)" }}
      >
        {/* SF map ambient at 4% opacity */}
        <img
          src="/assets/maps/maps (1).png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none select-none"
        />

        <div className="relative z-[1]">
          <h1 className="font-[family-name:var(--font-playfair)] text-[40px] tracking-tight text-[var(--ink)]">
            {greeting}, RJ
          </h1>
        </div>

        {/* Quote as overlapping sticky note */}
        {quote && (
          <div
            className="absolute bottom-4 right-6 max-w-[320px] bg-[var(--amber-light)] border border-[var(--amber-border)] rounded-[2px] px-4 py-3 shadow-[var(--shadow-pin)] z-[2]"
            style={{ transform: "rotate(1.5deg)" }}
          >
            <p className="font-[family-name:var(--font-inter)] italic text-[13px] text-[var(--ink-2)] leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] mt-1 block">
              — {quote.source}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
