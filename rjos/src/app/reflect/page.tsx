import { ReflectClient } from "@/components/ReflectClient";

export default function ReflectPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Reflection</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          How did today go? Share your thoughts — I&apos;ll analyze trends and give you insights.
        </p>
      </div>
      <ReflectClient />
    </div>
  );
}
