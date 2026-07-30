"use client";

import { useEffect, useRef, useState } from "react";

interface ConceptNode {
  id: string;
  label: string;
  mastery: number; // 0-1
  topicId: string;
}

interface ConceptMapProps {
  nodes: ConceptNode[];
  onNodeClick?: (nodeId: string) => void;
  width?: number;
  height?: number;
}

/**
 * Animated SVG concept map with force-directed layout.
 *
 * Nodes are colored by mastery (red → yellow → green) and
 * animate smoothly when their mastery score changes.
 *
 * This is the single best visual moment in Lucid.
 */
export default function ConceptMap({
  nodes,
  onNodeClick,
  width = 600,
  height = 400,
}: ConceptMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<
    Array<{ x: number; y: number; vx: number; vy: number }>
  >([]);
  const animFrameRef = useRef<number | null>(null);

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
    const repulsion = 8000;
    const attraction = 0.005;
    const damping = 0.85;
    const iterations = 60;

    let currentPositions = positions.map((p) => ({ ...p }));

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = currentPositions[j].x - currentPositions[i].x;
          const dy = currentPositions[j].y - currentPositions[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          currentPositions[i].vx -= fx;
          currentPositions[i].vy -= fy;
          currentPositions[j].vx += fx;
          currentPositions[j].vy += fy;
        }
      }

      // Attraction to center
      for (let i = 0; i < nodes.length; i++) {
        const dx = centerX - currentPositions[i].x;
        const dy = centerY - currentPositions[i].y;
        currentPositions[i].vx += dx * attraction;
        currentPositions[i].vy += dy * attraction;
      }

      // Apply velocities
      for (let i = 0; i < nodes.length; i++) {
        currentPositions[i].vx *= damping;
        currentPositions[i].vy *= damping;
        currentPositions[i].x += currentPositions[i].vx;
        currentPositions[i].y += currentPositions[i].vy;

        // Keep within bounds
        const margin = 60;
        currentPositions[i].x = Math.max(
          margin,
          Math.min(width - margin, currentPositions[i].x)
        );
        currentPositions[i].y = Math.max(
          margin,
          Math.min(height - margin, currentPositions[i].y)
        );
      }
    }

    setPositions(currentPositions.map((p) => ({ x: p.x, y: p.y, vx: 0, vy: 0 })));
  }, [nodes, width, height]);

  // Compute edge connections (fully connected graph, but faded)
  const edges = (() => {
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        result.push({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[j].x,
          y2: positions[j].y,
        });
      }
    }
    return result;
  })();

  function getNodeColor(mastery: number): string {
    if (mastery < 0.4) return "#ff6b6b";
    if (mastery < 0.7) return "#fdcb6e";
    return "#00cec9";
  }

  function getNodeGlow(mastery: number): string {
    if (mastery < 0.4) return "rgba(255, 107, 107, 0.3)";
    if (mastery < 0.7) return "rgba(253, 203, 110, 0.3)";
    return "rgba(0, 206, 201, 0.3)";
  }

  return (
    <div className="relative w-full flex justify-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[600px] h-auto"
        style={{ overflow: "visible" }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(108, 92, 231, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" rx={16} />

        {/* Edges */}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="rgba(42, 42, 62, 0.4)"
            strokeWidth={1}
            className="transition-all duration-500"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const color = getNodeColor(node.mastery);
          const glow = getNodeGlow(node.mastery);
          const radius = 28 + node.mastery * 8;

          return (
            <g
              key={node.id}
              className="cursor-pointer transition-all duration-700"
              onClick={() => onNodeClick?.(node.id)}
              style={{ transition: "transform 0.7s ease" }}
            >
              {/* Glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius + 12}
                fill={glow}
                className="transition-all duration-700"
              >
                <animate
                  attributeName="r"
                  values={`${radius + 8};${radius + 16};${radius + 8}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0.8;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill="var(--color-surface)"
                stroke={color}
                strokeWidth={3}
                className="transition-all duration-700"
              >
                <animate
                  attributeName="r"
                  values={`${radius};${radius + 3};${radius}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Inner dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={6}
                fill={color}
                className="transition-all duration-700"
              />

              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + radius + 20}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize={11}
                fontFamily="var(--font-sans)"
                className="transition-all duration-700"
              >
                {node.label.length > 20
                  ? node.label.substring(0, 18) + "..."
                  : node.label}
              </text>

              {/* Mastery percentage */}
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill={color}
                fontSize={12}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                className="transition-all duration-700"
              >
                {Math.round(node.mastery * 100)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
