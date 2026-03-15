import { getTodayPlan } from "@/actions/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanItem } from "@/lib/ai/schemas/plan";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { GeneratePlanButton } from "./GeneratePlanButton";

export async function TodayPlan() {
  const plan = await getTodayPlan();
  const items: PlanItem[] = plan ? JSON.parse(plan.items) : [];
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Today&apos;s Plan</CardTitle>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{items.length}
              </Badge>
            )}
            <GeneratePlanButton />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            No plan yet — click &quot;Generate Plan&quot; to get today&apos;s AI plan.
          </p>
        ) : (
          items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-tight ${item.completed ? "line-through text-[hsl(var(--muted-foreground))]" : ""}`}>
                  {item.action}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {item.estimatedMinutes}min
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {items.length > 5 && (
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            +{items.length - 5} more
          </p>
        )}
      </CardContent>
    </Card>
  );
}
