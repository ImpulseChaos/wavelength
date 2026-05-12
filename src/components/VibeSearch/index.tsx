'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { TrackCard } from './TrackCard'
import { usePlayerStore } from '@/store/playerStore'
import type { VibeSearchResult, SpotifyTrack } from '@/types/spotify'

export function VibeSearch() {
  const [prompt, setPrompt] = useState('')
  const { setTrack } = usePlayerStore()

  const mutation = useMutation<VibeSearchResult, Error, string>({
    mutationFn: async (p: string) => {
      const res = await fetch('/api/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      })
      if (!res.ok) throw new Error('Failed to search')
      return res.json()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    mutation.mutate(prompt)
  }

  function handleTrackClick(track: SpotifyTrack) {
    setTrack(track)
  }

  return (
    <div className="flex flex-col h-full gap-4 p-6">
      <div>
        <h2
          className="text-3xl font-black tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--text-primary)' }}
        >
          VIBE SEARCH
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Describe a mood and get a matching playlist
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder="Describe a vibe, mood, or moment..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          type="submit"
          disabled={mutation.isPending || !prompt.trim()}
          className="self-start px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
        >
          {mutation.isPending ? 'Searching...' : 'Find My Vibe'}
        </button>
      </form>

      {/* Loading waveform */}
      <AnimatePresence>
        {mutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-1 py-8"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: 'var(--accent-primary)' }}
                animate={{ height: ['8px', '32px', '8px'] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {mutation.isError && (
        <p className="text-sm" style={{ color: '#ff6b6b' }}>
          Something went wrong. Try again.
        </p>
      )}

      {/* Results */}
      {mutation.data && (
        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {mutation.data.tracks.length} tracks for &ldquo;{mutation.data.prompt}&rdquo;
          </p>
          {mutation.data.tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} onClick={() => handleTrackClick(track)} />
          ))}
        </div>
      )}
    </div>
  )
}
