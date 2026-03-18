import { getAllNodes, getAllEdges } from "@/actions/nodes";
import { computeLayout } from "@/lib/graph/layout";
import { CareerGraph } from "@/components/graph/CareerGraph";

export default async function GraphPage() {
  const [dbNodes, dbEdges] = await Promise.all([getAllNodes(), getAllEdges()]);
  const { nodes: flowNodes, edges: flowEdges } = computeLayout(dbNodes, dbEdges);

  if (dbNodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--ink-3)]">
        <div className="text-center space-y-2">
          <p className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[var(--ink)]">No career graph yet</p>
          <p className="font-[family-name:var(--font-inter)] text-sm text-[var(--ink-3)]">Complete onboarding to generate your career graph.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      <CareerGraph
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        dbNodes={dbNodes}
      />
    </div>
  );
}
