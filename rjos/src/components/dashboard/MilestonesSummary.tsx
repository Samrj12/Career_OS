import { getAllNodes } from "@/actions/nodes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export async function MilestonesSummary() {
  const allNodes = await getAllNodes();
  const milestones = allNodes.filter((n) => n.type === "milestone");
  const completed = milestones.filter((n) => n.status === "completed");
  const active = milestones.filter((n) => n.status === "active");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Achieved */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>🏆</span> Milestones Achieved
            <Badge variant="blue" className="ml-auto">{completed.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {completed.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">None yet — keep going!</p>
          ) : (
            completed.slice(0, 4).map((m) => (
              <div key={m.id} className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                <span className="text-blue-400">✓</span>
                <span className="truncate">{m.title}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Planned */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>🎯</span> Milestones In Progress
            <Badge variant="secondary" className="ml-auto">{active.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {active.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Complete onboarding to see milestones.</p>
          ) : (
            active.slice(0, 4).map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[70%]">{m.title}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{Math.round(m.progress * 100)}%</span>
                </div>
                <Progress
                  value={Math.round(m.progress * 100)}
                  className={`h-1.5 ${m.color === "red" ? "[&>div]:bg-red-500" : m.color === "yellow" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
