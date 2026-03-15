import { Suspense } from "react";
import { Greeting } from "@/components/dashboard/Greeting";
import { TodayPlan } from "@/components/dashboard/TodayPlan";
import { MilestonesSummary } from "@/components/dashboard/MilestonesSummary";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { getRecentActivities } from "@/actions/activities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function GrowthChartWrapper() {
  const activities = await getRecentActivities(90);

  // Aggregate by day
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
  return <Skeleton className="h-24 w-full rounded-xl" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <Greeting />
      </Suspense>

      {/* Plans row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<LoadingSkeleton />}>
          <TodayPlan />
        </Suspense>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">📅 This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Weekly plan generates after your first daily plan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">🗓️ This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Monthly overview available after first week.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
        <MilestonesSummary />
      </Suspense>

      {/* Growth chart */}
      <Suspense fallback={<LoadingSkeleton />}>
        <GrowthChartWrapper />
      </Suspense>
    </div>
  );
}
