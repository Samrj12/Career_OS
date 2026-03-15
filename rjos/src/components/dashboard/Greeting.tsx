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

  const quote = unusedQuotes[Math.floor(Math.random() * unusedQuotes.length)];

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
