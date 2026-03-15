import { db } from "@/db";
import { quotes } from "@/db/schema";
import { getGreeting, todayISO } from "@/lib/utils/dates";
import { ne, isNull, or, eq } from "drizzle-orm";

export async function Greeting() {
  const greeting = getGreeting();
  const today = todayISO();

  // Pick a quote not used today
  const unusedQuotes = await db.query.quotes.findMany({
    where: or(isNull(quotes.usedOn), ne(quotes.usedOn, today)),
    limit: 10,
  });

  // Server Component — Date.now() runs once on the server, never during client re-render
  // eslint-disable-next-line react-hooks/purity
  const idx = Math.floor(Date.now() / 1000) % (unusedQuotes.length || 1);
  const quote = unusedQuotes[idx];

  if (quote) {
    await db.update(quotes).set({ usedOn: today }).where(eq(quotes.id, quote.id));
  }

  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, RJ 👋
      </h1>
      {quote && (
        <div className="rounded-xl bg-[hsl(var(--muted))] px-4 py-3 max-w-2xl">
          <p className="text-sm italic text-[hsl(var(--foreground))]">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">— {quote.source}</p>
        </div>
      )}
    </div>
  );
}
