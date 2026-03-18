import { getTodayPlan } from "@/actions/plans";
import type { PlanItem } from "@/lib/ai/schemas/plan";
import { GeneratePlanButton } from "./GeneratePlanButton";

export async function TodayPlan() {
  const plan = await getTodayPlan();
  const items: PlanItem[] = plan ? JSON.parse(plan.items) : [];
  const completedCount = items.filter((i) => i.completed).length;
  const mockDate = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="group relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 flex flex-col">
      {/* Binder clip centered on top edge */}
      <img
        src="/assets/stationary_elements/IZtPd7BuOJHldUCqNnSSAp9sA.png"
        alt=""
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-[40px] h-auto pointer-events-none select-none z-10"
      />

      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-row items-center gap-2">
          <span className="font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold tracking-widest text-[var(--ink-3)] uppercase">TODAY</span>
        </div>
        <div className="flex flex-row items-center gap-3">
          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] bg-[var(--paper-alt)] px-2 py-1 rounded-full">{mockDate}</span>
          <GeneratePlanButton />
        </div>
      </div>
      <div className="border-b border-dashed border-[var(--border)] my-2" />

      <div className="flex flex-col flex-1 mt-2">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[120px]">
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink-3)] text-center">
              No plan yet — Generate Plan
            </p>
          </div>
        ) : (
          items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <div key={i} className={`flex flex-row gap-4 items-center py-[10px] ${!isLast ? 'border-b border-dashed border-[var(--border)]' : ''}`}>
                {/* Pushpin dot checkbox */}
                <div className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.completed
                    ? 'bg-[var(--pin-blue)] border-[var(--pin-blue)]'
                    : 'border-[var(--border-dark)] bg-transparent'
                }`}>
                  {item.completed && (
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  )}
                </div>
                <p className={`font-[family-name:var(--font-inter)] text-[14px] ${item.completed ? 'line-through text-[var(--ink-3)]' : 'text-[var(--ink)] font-medium'} flex-1 min-w-0 truncate`}>
                  {item.action}
                </p>
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] ml-auto bg-[var(--paper-alt)] px-2 py-0.5 rounded-full">
                  {item.estimatedMinutes}m
                </span>
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 text-right border-t border-dashed border-[var(--border)] pt-4">
          <span className="font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold text-[var(--ink-3)]">
            {completedCount} / {items.length} done
          </span>
        </div>
      )}
    </div>
  );
}
