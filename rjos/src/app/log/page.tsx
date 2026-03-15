import { ActivityLogClient } from "@/components/activity/ActivityLogClient";
import { getAllNodes } from "@/actions/nodes";
import { getRecentActivities } from "@/actions/activities";

export default async function LogPage() {
  const [nodes, recentActivities] = await Promise.all([
    getAllNodes(),
    getRecentActivities(10),
  ]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log Activity</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Tell me what you worked on today. I&apos;ll extract the details and update your graph.
        </p>
      </div>
      <ActivityLogClient nodes={nodes} recentActivities={recentActivities} />
    </div>
  );
}
