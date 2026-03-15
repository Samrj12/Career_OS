import { getAllNodes, getAllEdges } from "@/actions/nodes";
import { computeLayout } from "@/lib/graph/layout";
import { CareerGraph } from "@/components/graph/CareerGraph";

export default async function GraphPage() {
  const [dbNodes, dbEdges] = await Promise.all([getAllNodes(), getAllEdges()]);
  const { nodes: flowNodes, edges: flowEdges } = computeLayout(dbNodes, dbEdges);

  if (dbNodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No career graph yet</p>
          <p className="text-sm">Complete onboarding to generate your career graph.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <CareerGraph
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        dbNodes={dbNodes}
      />
    </div>
  );
}
