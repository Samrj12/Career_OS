import { ReflectClient } from "@/components/ReflectClient";

export default function ReflectPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="max-w-[640px] mx-auto p-8 animate-fade-slide-up">
      <div className="mb-[20px] relative">
        <h1 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-2">Daily Reflection</h1>
        <p className="font-[family-name:var(--font-playfair)] text-[24px] text-[var(--ink)]">
          {today}
        </p>
        {/* Dashed SVG flourish under date */}
        <svg className="mt-2 w-[120px] h-[6px] opacity-40" viewBox="0 0 120 6">
          <path d="M0 3 Q 30 0, 60 3 T 120 3" fill="none" stroke="var(--border-dark)" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      </div>
      <ReflectClient />
    </div>
  );
}
