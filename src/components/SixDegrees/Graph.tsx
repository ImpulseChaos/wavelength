'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { GraphNode, GraphEdge } from '@/types/graph'

interface GraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick: (node: GraphNode) => void
  width?: number
  height?: number
}

interface Position {
  x: number
  y: number
}

export function Graph({ nodes, edges, onNodeClick, width = 800, height = 600 }: GraphProps) {
  const [positions, setPositions] = useState<Map<string, Position>>(new Map())
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

  useEffect(() => {
    // Stop any previous simulation
    simulationRef.current?.stop()

    const nodesCopy = nodes.map(n => ({ ...n }))

    simulationRef.current = d3
      .forceSimulation<GraphNode>(nodesCopy)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody<GraphNode>().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(28))
      .on('tick', () => {
        setPositions(new Map(nodesCopy.map(n => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }])))
      })

    return () => {
      simulationRef.current?.stop()
    }
  }, [nodes, edges, width, height])

  const getEdgeKey = (e: GraphEdge, i: number) => {
    const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
    const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
    return `${s}-${t}-${i}`
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Edges */}
      <g>
        {edges.map((e, i) => {
          const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
          const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
          const sp = positions.get(s)
          const tp = positions.get(t)
          if (!sp || !tp) return null
          return (
            <line
              key={getEdgeKey(e, i)}
              x1={sp.x}
              y1={sp.y}
              x2={tp.x}
              y2={tp.y}
              stroke="var(--border)"
              strokeWidth={Math.max(1, e.collaborations)}
              opacity={0.4}
            />
          )
        })}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map(n => {
          const pos = positions.get(n.id)
          if (!pos) return null
          const isOrigin = n.depth === 0
          const isExhausted = n.depth >= 3
          const r = isOrigin ? 28 : 18

          return (
            <g
              key={n.id}
              transform={`translate(${pos.x},${pos.y})`}
              onClick={() => !isExhausted && onNodeClick(n)}
              style={{ cursor: isExhausted ? 'default' : 'pointer' }}
            >
              {isOrigin && (
                <circle r={r + 12} fill="url(#node-glow)" opacity={0.6} />
              )}
              <circle
                r={r}
                fill="var(--bg-elevated)"
                stroke={isOrigin ? 'var(--accent-primary)' : isExhausted ? 'var(--text-muted)' : 'var(--border)'}
                strokeWidth={isOrigin ? 2 : 1}
              />
              {n.image ? (
                <>
                  <defs>
                    <clipPath id={`clip-${n.id}`}>
                      <circle r={r - 2} />
                    </clipPath>
                  </defs>
                  <image
                    href={n.image}
                    x={-(r - 2)}
                    y={-(r - 2)}
                    width={(r - 2) * 2}
                    height={(r - 2) * 2}
                    clipPath={`url(#clip-${n.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </>
              ) : null}
              <text
                textAnchor="middle"
                dy={r + 14}
                fontSize={10}
                fill="var(--text-muted)"
                style={{ pointerEvents: 'none' }}
              >
                {n.name.length > 14 ? n.name.slice(0, 13) + '…' : n.name}
              </text>
              {isExhausted && (
                <text textAnchor="middle" dy={4} fontSize={8} fill="var(--text-muted)">
                  max
                </text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
