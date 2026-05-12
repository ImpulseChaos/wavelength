import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3'

export interface GraphNode extends SimulationNodeDatum {
  id: string
  name: string
  image: string
  popularity: number
  depth: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  collaborations: number
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
