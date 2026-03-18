"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node as FlowNode,
  type Edge as FlowEdge,
  type NodeMouseHandler,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NODE_TYPES } from "./GraphNodes";
import { NodeDetailPanel } from "./NodeDetailPanel";
import type { Node } from "@/db/schema";
import { updateNode } from "@/actions/nodes";

interface CareerGraphProps {
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
  dbNodes: Node[];
}

export function CareerGraph({ flowNodes, flowEdges, dbNodes }: CareerGraphProps) {
  const [nodes] = useState(flowNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Style edges as dashed route lines
  const styledEdges = flowEdges.map((edge) => ({
    ...edge,
    style: {
      stroke: "var(--border-dark)",
      strokeWidth: 1.5,
      strokeDasharray: "8 6",
    },
    animated: true,
  }));

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const dbNode = dbNodes.find((n) => n.id === node.id);
      setSelectedNode(dbNode ?? null);
    },
    [dbNodes]
  );

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: FlowNode) => {
      const dbNode = dbNodes.find((n) => n.id === node.id);
      if (!dbNode) return;

      let metadata: Record<string, unknown> = {};
      try { metadata = JSON.parse(dbNode.metadata || "{}"); } catch {}

      metadata.position = { x: node.position.x, y: node.position.y };
      await updateNode(node.id, { metadata: JSON.stringify(metadata) });
    },
    [dbNodes]
  );

  return (
    <div className="flex h-full w-full relative">
      {/* SF blue map at 8% opacity as background */}
      <img
        src="/assets/maps/maps (1).png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none select-none z-0"
      />
      {/* CSS vignette */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, var(--bg) 100%)"
      }} />

      <div className="flex-1 relative z-[2]">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={NODE_TYPES}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background
            variant={"lines" as BackgroundVariant}
            gap={24}
            size={1}
            color="var(--border)"
          />
          <Controls className="!bg-[var(--paper)] !border-[var(--border)] !rounded-full !shadow-[var(--shadow-card)] [&>button]:!rounded-full [&>button]:!border-[var(--border)]" />
          <MiniMap
            className="!bg-[var(--paper)] !border-2 !border-[#5CA8A0] !rounded-[2px]"
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                green: "#22c55e",
                yellow: "#eab308",
                red: "#ef4444",
                blue: "#3b82f6",
              };
              return colors[(node.data as { color?: string })?.color ?? "green"] ?? "#22c55e";
            }}
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
