import { getAllNodes } from "@/actions/nodes";
import { Progress } from "@/components/ui/progress";

export async function MilestonesSummary() {
  const allNodes = await getAllNodes();
  const milestones = allNodes.filter((n) => n.type === "milestone");
  const completed = milestones.filter((n) => n.status === "completed");
  const active = milestones.filter((n) => n.status === "active");

  return (
    <div className="bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 flex flex-col md:flex-row min-h-[160px]">
      {/* Left Column - Achieved */}
      <div className="flex-1 md:pr-[24px] md:border-r border-dashed border-[var(--border)] mb-6 md:mb-0">
        {/* Section header with dashed underline */}
        <div className="mb-4 pb-2 relative">
          <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase text-[var(--ink-3)] tracking-widest">Achieved</h3>
          <svg className="absolute bottom-0 left-0 w-[80px] h-[4px] opacity-40" viewBox="0 0 80 4">
            <path d="M0 2 Q 20 0, 40 2 T 80 2" fill="none" stroke="var(--border-dark)" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          {completed.length === 0 ? (
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink-3)] italic">None yet — keep going!</p>
          ) : (
            completed.slice(0, 4).map((m) => (
              <div key={m.id} className="flex flex-row items-center gap-3 py-2">
                {/* Blue pushpin icon instead of green check */}
                <img
                  src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                  alt=""
                  className="w-[16px] h-[16px] object-contain shrink-0"
                />
                <span className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink)] font-medium truncate flex-1">{m.title}</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)] bg-[var(--paper-alt)] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {m.targetDate ? new Date(m.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : "RECENT"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - In Progress */}
      <div className="flex-1 md:pl-[24px]">
        <div className="mb-4 pb-2 relative">
          <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase text-[var(--ink-3)] tracking-widest">In Progress</h3>
          <svg className="absolute bottom-0 left-0 w-[80px] h-[4px] opacity-40" viewBox="0 0 80 4">
            <path d="M0 2 Q 20 0, 40 2 T 80 2" fill="none" stroke="var(--border-dark)" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          {active.length === 0 ? (
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink-3)] italic">Complete onboarding to see milestones.</p>
          ) : (
            active.slice(0, 4).map((m) => (
              <div key={m.id} className="py-2 flex flex-col">
                <div className="flex flex-row justify-between items-center mb-2">
                  <span className="font-[family-name:var(--font-inter)] text-[14px] font-medium text-[var(--ink)] truncate pr-2">{m.title}</span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-2)] font-semibold">{Math.round(m.progress * 100)}%</span>
                </div>
                <Progress value={Math.round(m.progress * 100)} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
