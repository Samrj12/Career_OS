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
  const [nodes, setNodes] = useState(flowNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const dbNode = dbNodes.find((n) => n.id === node.id);
      setSelectedNode(dbNode ?? null);
    },
    [dbNodes]
  );

  // Save position when user drags a node
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
    <div className="flex h-full w-full">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
          className="bg-[hsl(var(--background))]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="opacity-30"
          />
          <Controls className="!bg-[hsl(var(--card))] !border-[hsl(var(--border))]" />
          <MiniMap
            className="!bg-[hsl(var(--card))] !border-[hsl(var(--border))]"
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

      {/* Side panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
