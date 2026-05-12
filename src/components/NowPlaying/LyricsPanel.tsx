'use client'
import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { LyricLine } from '@/types/spotify'

interface LyricsPanelProps {
  trackId: string | null
  progressMs: number
}

export function LyricsPanel({ trackId, progressMs }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['lyrics', trackId],
    queryFn: async () => {
      const res = await fetch(`/api/lyrics?trackId=${trackId}`)
      return res.json() as Promise<{ lines: LyricLine[]; trackId: string }>
    },
    enabled: !!trackId,
    staleTime: Infinity,
  })

  const lines = data?.lines ?? []
  const progressSec = progressMs / 1000

  const activeIndex = lines.reduce((acc, line, i) => {
    return line.time <= progressSec ? i : acc
  }, -1)

  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return
    const el = containerRef.current.children[activeIndex] as HTMLElement
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  if (!trackId) return null
  if (lines.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
        No lyrics available
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      className="max-h-48 overflow-y-auto flex flex-col gap-1 py-2"
      style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className="text-sm text-center px-2 py-0.5 rounded transition-all duration-300"
          style={{
            color: i === activeIndex ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: i === activeIndex ? 600 : 400,
            fontSize: i === activeIndex ? '0.95rem' : '0.85rem',
          }}
        >
          {line.text || '♪'}
        </p>
      ))}
    </div>
  )
}
