"use client";

import { useEffect, useState } from "react";

interface ConceptNode {
  id: string;
  label: string;
  mastery: number;
  topicId: string;
}

interface ConceptMapProps {
  nodes: ConceptNode[];
  onNodeClick?: (nodeId: string) => void;
  width?: number;
  height?: number;
}

export default function ConceptMap({
  nodes,
  onNodeClick,
  width = 600,
  height = 420,
}: ConceptMapProps) {
  const [positions, setPositions] = useState<
    Array<{ x: number; y: number; vx: number; vy: number }>
  >([]);

  // Initialize positions in a circle
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    setPositions(
      nodes.map((_, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          vx: 0,
          vy: 0,
        };
      })
    );
  }, [nodes.length, width, height]);

  // Simple force-directed layout
  useEffect(() => {
    if (positions.length === 0) return;
    const centerX = width / 2;
    const centerY = height / 2;
    const repulsion = 10000;
    const attraction = 0.006;
    const damping = 0.85;
    const iterations = 50;

    let current = positions.map((p) => ({ ...p }));

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = current[j].x - current[i].x;
          const dy = current[j].y - current[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          current[i].vx -= fx;
          current[i].vy -= fy;
          current[j].vx += fx;
          current[j].vy += fy;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const dx = centerX - current[i].x;
        const dy = centerY - current[i].y;
        current[i].vx += dx * attraction;
        current[i].vy += dy * attraction;
      }
      for (let i = 0; i < nodes.length; i++) {
        current[i].vx *= damping;
        current[i].vy *= damping;
        current[i].x += current[i].vx;
        current[i].y += current[i].vy;
        const margin = 70;
        current[i].x = Math.max(margin, Math.min(width - margin, current[i].x));
        current[i].y = Math.max(margin, Math.min(height - margin, current[i].y));
      }
    }
    setPositions(current.map((p) => ({ x: p.x, y: p.y, vx: 0, vy: 0 })));
  }, [nodes, width, height]);

  const edges = (() => {
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        result.push({ x1: positions[i].x, y1: positions[i].y, x2: positions[j].x, y2: positions[j].y });
      }
    }
    return result;
  })();

  function getNodeColor(mastery: number): string {
    if (mastery < 0.4) return "#ff6b6b";
    if (mastery < 0.7) return "#f5c842";
    return "#00d4c0";
  }

  function getNodeGlow(mastery: number): string {
    if (mastery < 0.4) return "rgba(255, 107, 107, 0.25)";
    if (mastery < 0.7) return "rgba(245, 200, 66, 0.25)";
    return "rgba(0, 212, 192, 0.25)";
  }

  return (
    <div className="relative w-full flex justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[650px] h-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="cmBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124, 108, 240, 0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#cmBgGlow)" rx={16} />

        {/* Edges */}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.x1} y1={edge.y1}
            x2={edge.x2} y2={edge.y2}
            stroke="rgba(42, 42, 64, 0.35)"
            strokeWidth={1.5}
            className="transition-all duration-500"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const color = getNodeColor(node.mastery);
          const glow = getNodeGlow(node.mastery);
          const radius = 32 + node.mastery * 10;

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => onNodeClick?.(node.id)}
            >
              {/* Outer glow ring */}
              <circle
                cx={pos.x} cy={pos.y}
                r={radius + 14}
                fill={glow}
                className="transition-all duration-700"
              >
                <animate
                  attributeName="r"
                  values={`${radius + 10};${radius + 18};${radius + 10}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.7;0.4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Node circle */}
              <circle
                cx={pos.x} cy={pos.y}
                r={radius}
                fill="#14141f"
                stroke={color}
                strokeWidth={3}
                className="transition-all duration-700"
              >
                <animate
                  attributeName="r"
                  values={`${radius};${radius + 2};${radius}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Inner status dot */}
              <circle
                cx={pos.x} cy={pos.y}
                r={7}
                fill={color}
                className="transition-all duration-700"
              />

              {/* Mastery percentage - larger, centered */}
              <text
                x={pos.x}
                y={pos.y - 9}
                textAnchor="middle"
                fill={color}
                fontSize={15}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                className="transition-all duration-700"
              >
                {Math.round(node.mastery * 100)}%
              </text>

              {/* Label - larger text below node */}
              <text
                x={pos.x}
                y={pos.y + radius + 24}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize={13}
                fontWeight={500}
                fontFamily="var(--font-sans)"
                className="transition-all duration-700"
              >
                {node.label.length > 22
                  ? node.label.substring(0, 20) + "..."
                  : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">No concepts to display</p>
        </div>
      )}
    </div>
  );
}
