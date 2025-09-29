"use client"

import React from 'react';
import { Flow } from '@canvas-llm/shared';

interface FlowPreviewProps {
  flow: Flow;
  className?: string;
}

export function FlowPreview({ flow, className = "" }: FlowPreviewProps) {
  const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
  const edges = Array.isArray(flow.edges) ? flow.edges : [];

  return (
    <div className={`relative bg-muted/30 border rounded-md overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 200 120"
        className="w-full h-24"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }}
      >
        {/* Render edges */}
        {edges.map((edge, index) => {
          // Simple line representation for edges
          const sourceX = 40 + (index % 3) * 60;
          const sourceY = 30 + Math.floor(index / 3) * 40;
          const targetX = 40 + ((index + 1) % 3) * 60;
          const targetY = 30 + Math.floor((index + 1) / 3) * 40;
          
          return (
            <line
              key={edge.id || index}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        {/* Render nodes */}
        {nodes.slice(0, 6).map((node, index) => {
          const x = 40 + (index % 3) * 60;
          const y = 30 + Math.floor(index / 3) * 40;
          
          return (
            <g key={node.id || index}>
              <rect
                x={x - 15}
                y={y - 10}
                width="30"
                height="20"
                rx="4"
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="hsl(var(--primary))"
              />
            </g>
          );
        })}

        {/* Show "+" if there are more nodes */}
        {nodes.length > 6 && (
          <g>
            <circle
              cx="170"
              cy="60"
              r="8"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            <text
              x="170"
              y="64"
              textAnchor="middle"
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
            >
              +{nodes.length - 6}
            </text>
          </g>
        )}
      </svg>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-muted-foreground">Empty Canvas</div>
        </div>
      )}
    </div>
  );
}
