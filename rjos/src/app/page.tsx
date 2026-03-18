import { Suspense } from "react";
import { Greeting } from "@/components/dashboard/Greeting";
import { TodayPlan } from "@/components/dashboard/TodayPlan";
import { MilestonesSummary } from "@/components/dashboard/MilestonesSummary";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { getRecentActivities } from "@/actions/activities";
import { Skeleton } from "@/components/ui/skeleton";

async function GrowthChartWrapper() {
  const activities = await getRecentActivities(90);

  const byDay: Record<string, number> = {};
  for (const a of activities) {
    if (!a.timeSpent) continue;
    const date = new Date(a.loggedAt).toISOString().split("T")[0];
    byDay[date] = (byDay[date] || 0) + a.timeSpent;
  }

  const data = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, minutes]) => ({ date, minutes }));

  return <GrowthChart data={data} />;
}

function LoadingSkeleton() {
  return <Skeleton className="h-24 w-full" />;
}

export default function DashboardPage() {
  return (
    <div className="max-w-[1100px] mx-auto p-4 sm:p-8 pt-12 relative min-h-screen animate-fade-slide-up">
      {/* Greeting */}
      <div className="relative mb-12">
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
          <Greeting />
        </Suspense>
      </div>

      {/* Plans row — Today, Week, Month with rotations and pushpins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-[32px] relative">
        {/* Dashed SVG route line connecting the three cards */}
        <svg className="absolute top-1/2 left-0 w-full h-[2px] pointer-events-none select-none -translate-y-1/2 z-0 hidden lg:block" preserveAspectRatio="none" viewBox="0 0 1000 2">
          <path d="M 80 1 Q 250 -8, 500 1 T 920 1" fill="none" stroke="var(--border-dark)" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.5" />
        </svg>

        <div className="relative z-[1]">
          <Suspense fallback={<LoadingSkeleton />}>
            <TodayPlan />
          </Suspense>
        </div>

        {/* This Week — rotated +1deg with orange pushpin */}
        <div className="relative z-[1]" style={{ transform: "rotate(1deg)" }}>
          <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 flex flex-col">
            {/* Orange pushpin at top-right */}
            <img
              src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
              alt=""
              className="absolute -top-3 right-4 w-[20px] h-auto pointer-events-none select-none z-10"
            />
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">This Week</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] bg-[var(--paper-alt)] px-2 py-1 rounded-full">MAR 16-22</span>
            </div>
            <div className="border-b border-dashed border-[var(--border)] my-2" />
            <div className="flex-1 flex items-center justify-center min-h-[120px]">
              <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink-3)]">
                Generates after your first daily plan
              </p>
            </div>
          </div>
        </div>

        {/* This Month — rotated -0.5deg with blue pushpin */}
        <div className="relative z-[1]" style={{ transform: "rotate(-0.5deg)" }}>
          <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 flex flex-col">
            {/* Blue pushpin at top-left */}
            <img
              src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
              alt=""
              className="absolute -top-3 left-4 w-[20px] h-auto pointer-events-none select-none z-10"
            />
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">This Month</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] bg-[var(--paper-alt)] px-2 py-1 rounded-full">MAR 2026</span>
            </div>
            <div className="border-b border-dashed border-[var(--border)] my-2" />
            <div className="flex-1 flex items-center justify-center min-h-[120px]">
              <p className="font-[family-name:var(--font-inter)] text-[13px] text-[var(--ink-3)]">
                Generates after your first daily plan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <MilestonesSummary />
        </Suspense>
      </div>

      {/* Growth chart */}
      <div className="mt-[24px]">
        <Suspense fallback={<LoadingSkeleton />}>
          <GrowthChartWrapper />
        </Suspense>
      </div>
    </div>
  );
}
