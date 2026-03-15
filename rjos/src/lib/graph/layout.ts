import dagre from "dagre";
import type { Node as FlowNode, Edge as FlowEdge } from "@xyflow/react";
import type { Node, Edge } from "@/db/schema";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

/** Convert DB nodes + edges to React Flow nodes + edges with dagre layout */
export function computeLayout(
  dbNodes: Node[],
  dbEdges: Edge[]
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB", // top-to-bottom hierarchy
    nodesep: 60,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  // Add nodes to dagre — use saved position if available, else auto-layout
  for (const node of dbNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges to dagre
  for (const edge of dbEdges) {
    if (edge.type === "parent_child") {
      g.setEdge(edge.sourceId, edge.targetId);
    }
  }

  dagre.layout(g);

  // Convert to React Flow format
  const flowNodes: FlowNode[] = dbNodes.map((node) => {
    const dagreNode = g.node(node.id);

    // Use saved position from metadata if available
    let metadata: { position?: { x: number; y: number } } = {};
    try {
      metadata = JSON.parse(node.metadata || "{}");
    } catch {}

    const position = metadata.position || {
      x: dagreNode ? dagreNode.x - NODE_WIDTH / 2 : 0,
      y: dagreNode ? dagreNode.y - NODE_HEIGHT / 2 : 0,
    };

    return {
      id: node.id,
      type: node.type, // matches custom node types registered in CareerGraph
      position,
      data: {
        ...node,
        label: node.title,
      },
      draggable: true,
    };
  });

  const flowEdges: FlowEdge[] = dbEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    type: "smoothstep",
    animated: edge.type === "dependency",
    style: {
      stroke:
        edge.type === "dependency"
          ? "#94a3b8"
          : edge.type === "related"
          ? "#64748b"
          : "#475569",
      strokeWidth: edge.type === "parent_child" ? 2 : 1.5,
    },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}
