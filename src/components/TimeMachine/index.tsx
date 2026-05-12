'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChartList } from './ChartList'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import type { SpotifyTrack } from '@/types/spotify'

const GENRES = [
  { value: '', label: 'Any Genre' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'r-n-b', label: 'R&B' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'country', label: 'Country' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'soul', label: 'Soul' },
]

const MIN_YEAR = 1960
const MAX_YEAR = new Date().getFullYear()

export function TimeMachine() {
  const { timeMachineYear } = useUIStore()
  const { setTrack } = usePlayerStore()
  const [year, setYear] = useState(timeMachineYear ?? 1985)
  const [genre, setGenre] = useState('')
  const [generated, setGenerated] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null)

  // Sync year if opened from NowPlaying "This Era"
  useEffect(() => {
    if (timeMachineYear) {
      setYear(timeMachineYear)
      setGenerated(false)
      setPlaylistUrl(null)
    }
  }, [timeMachineYear])

  const { data, isFetching, refetch } = useQuery<{ tracks: SpotifyTrack[]; year: number }>({
    queryKey: ['timemachine', year, genre],
    queryFn: async () => {
      const params = new URLSearchParams({ year: String(year) })
      if (genre) params.set('genre', genre)
      const res = await fetch(`/api/timemachine?${params}`)
      return res.json()
    },
    enabled: generated,
    staleTime: 60_000,
  })

  const saveMutation = useMutation<{ playlistUrl: string }, Error, void>({
    mutationFn: async () => {
      const uris = data?.tracks.map(t => t.uri) ?? []
      const res = await fetch('/api/timemachine/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackUris: uris, year }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: d => setPlaylistUrl(d.playlistUrl),
  })

  function handleGenerate() {
    setPlaylistUrl(null)
    if (generated) {
      refetch()
    } else {
      setGenerated(true)
    }
  }

  // Decade ticks for the slider
  const decades: number[] = []
  for (let y = MIN_YEAR; y <= MAX_YEAR; y += 10) decades.push(y)

  return (
    <div className="flex flex-col h-full gap-4 p-6 overflow-y-auto">
      <div>
        <h2
          className="text-3xl font-black tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--text-primary)' }}
        >
          TIME MACHINE
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Travel to any era and rediscover its sound
        </p>
      </div>

      {/* Year display */}
      <div className="text-center">
        <motion.span
          key={year}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black"
          style={{
            fontFamily: 'var(--font-bebas-neue), sans-serif',
            color: 'var(--accent-secondary)',
            display: 'inline-block',
            letterSpacing: '0.05em',
          }}
        >
          {year}
        </motion.span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={e => { setYear(parseInt(e.target.value)); setGenerated(false) }}
          className="w-full accent-[var(--accent-secondary)]"
          style={{ accentColor: 'var(--accent-secondary)' }}
        />
        <div className="flex justify-between">
          {decades.map(d => (
            <button
              key={d}
              onClick={() => { setYear(d); setGenerated(false) }}
              className="text-xs hover:opacity-100 transition-opacity"
              style={{ color: year >= d && year < d + 10 ? 'var(--accent-secondary)' : 'var(--text-muted)', opacity: 0.6 }}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Genre picker */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map(g => (
          <button
            key={g.value}
            onClick={() => setGenre(g.value)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              background: genre === g.value ? 'var(--accent-secondary)' : 'var(--bg-elevated)',
              color: genre === g.value ? 'var(--bg-primary)' : 'var(--text-muted)',
              border: `1px solid ${genre === g.value ? 'var(--accent-secondary)' : 'var(--border)'}`,
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isFetching}
        className="self-start px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ background: 'var(--accent-secondary)', color: '#fff' }}
      >
        {isFetching ? 'Generating...' : 'Generate'}
      </button>

      {/* Results */}
      {data?.tracks && data.tracks.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sounds of {data.year}
            </p>
            {!playlistUrl ? (
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity disabled:opacity-50"
                style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)', border: '1px solid var(--border)' }}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save to Spotify'}
              </button>
            ) : (
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: '#1DB954', color: '#fff' }}
              >
                Open in Spotify ↗
              </a>
            )}
          </div>
          <ChartList tracks={data.tracks} onTrackClick={t => setTrack(t)} />
        </div>
      )}

      {data?.tracks?.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No tracks found for this era. Try a different year.
        </p>
      )}
    </div>
  )
}
