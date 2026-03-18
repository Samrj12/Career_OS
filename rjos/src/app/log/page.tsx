import { ActivityLogClient } from "@/components/activity/ActivityLogClient";
import { getAllNodes } from "@/actions/nodes";
import { getRecentActivities } from "@/actions/activities";

export default async function LogPage() {
  const [nodes, recentActivities] = await Promise.all([
    getAllNodes(),
    getRecentActivities(10),
  ]);

  return (
    <div className="max-w-[680px] mx-auto p-8 animate-fade-slide-up">
      <div className="mb-[28px]">
        <h1 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-2">Log Activity</h1>
        <p className="font-[family-name:var(--font-playfair)] text-[28px] text-[var(--ink)]">
          What did you work on?
        </p>
      </div>
      <ActivityLogClient nodes={nodes} recentActivities={recentActivities} />
    </div>
  );
}
