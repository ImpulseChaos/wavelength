'use client'
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Graph } from './Graph'
import { useArtistStore } from '@/store/artistStore'
import { usePlayerStore } from '@/store/playerStore'
import type { GraphNode, GraphData } from '@/types/graph'
import type { SpotifyArtist, SpotifyTopTracksResponse } from '@/types/spotify'
import { getImageUrl } from '@/lib/utils'

export function SixDegrees() {
  const { graphOriginArtist, setSelectedArtist } = useArtistStore()
  const { setTrack } = usePlayerStore()
  const [mergedNodes, setMergedNodes] = useState<GraphNode[]>([])
  const [mergedEdges, setMergedEdges] = useState<import('@/types/graph').GraphEdge[]>([])
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [expandDepth, setExpandDepth] = useState(1)

  const artistId = graphOriginArtist?.id ?? null

  const { isLoading } = useQuery<GraphData>({
    queryKey: ['graph', artistId],
    queryFn: async () => {
      const res = await fetch(`/api/graph?artistId=${artistId}&depth=1`)
      const data: GraphData = await res.json()
      setMergedNodes(data.nodes)
      setMergedEdges(data.edges)
      setVisited(new Set([artistId!]))
      setExpandDepth(1)
      return data
    },
    enabled: !!artistId,
  })

  const handleNodeClick = useCallback(
    async (node: GraphNode) => {
      if (visited.has(node.id) || node.depth >= 3) return

      setVisited(prev => new Set([...prev, node.id]))
      const nextDepth = Math.min(expandDepth + 1, 3)
      setExpandDepth(nextDepth)

      try {
        const res = await fetch(`/api/graph?artistId=${node.id}&depth=${nextDepth}`)
        const data: GraphData = await res.json()

        setMergedNodes(prev => {
          const existing = new Set(prev.map(n => n.id))
          const newNodes = data.nodes
            .filter(n => !existing.has(n.id))
            .map(n => ({ ...n, depth: nextDepth }))
          return [...prev, ...newNodes]
        })

        setMergedEdges(prev => {
          const existingKeys = new Set(
            prev.map(e => {
              const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
              const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
              return `${s}-${t}`
            })
          )
          const newEdges = data.edges.filter(e => {
            const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
            const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
            return !existingKeys.has(`${s}-${t}`)
          })
          return [...prev, ...newEdges]
        })

        // Set as selected artist and fetch their top track
        const artist: SpotifyArtist = {
          id: node.id,
          name: node.name,
          genres: [],
          images: node.image ? [{ url: node.image, width: 300, height: 300 }] : [],
          popularity: node.popularity,
        }
        setSelectedArtist(artist)

        const topRes = await fetch(`/api/graph/top-track?artistId=${node.id}`)
        if (topRes.ok) {
          const { track } = await topRes.json()
          if (track) setTrack(track)
        }
      } catch (err) {
        console.error('Graph expand error:', err)
      }
    },
    [visited, expandDepth, setSelectedArtist, setTrack]
  )

  if (!graphOriginArtist) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
          <span className="text-3xl">🕸️</span>
        </div>
        <div>
          <h2
            className="text-3xl font-black tracking-widest"
            style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--text-primary)' }}
          >
            SIX DEGREES
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Play a track and click &ldquo;Explore Artist&rdquo; to build the graph
          </p>
        </div>
      </div>
    )
  }

  const originArt = graphOriginArtist.images?.[0]
    ? getImageUrl(graphOriginArtist.images, 'sm')
    : ''

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <div className="flex items-center gap-3">
        <div>
          <h2
            className="text-2xl font-black tracking-widest"
            style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--text-primary)' }}
          >
            SIX DEGREES
          </h2>
          <div className="flex items-center gap-2">
            {originArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={originArt} alt="" className="w-5 h-5 rounded-full" />
            )}
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Starting from <span style={{ color: 'var(--accent-primary)' }}>{graphOriginArtist.name}</span>
            </span>
          </div>
        </div>
        <div className="ml-auto text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          {mergedNodes.length} artists · depth {expandDepth}/3
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2" style={{ color: 'var(--text-muted)' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-t-transparent rounded-full"
              style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
            />
            <span className="text-sm">Building graph...</span>
          </div>
        ) : (
          <Graph
            nodes={mergedNodes}
            edges={mergedEdges}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Click nodes to expand · Max depth 3
      </p>
    </div>
  )
}
