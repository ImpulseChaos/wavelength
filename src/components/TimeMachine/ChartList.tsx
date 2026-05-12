'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { SpotifyTrack } from '@/types/spotify'
import { getImageUrl, formatMs } from '@/lib/utils'

interface ChartListProps {
  tracks: SpotifyTrack[]
  onTrackClick: (track: SpotifyTrack) => void
}

export function ChartList({ tracks, onTrackClick }: ChartListProps) {
  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track, i) => {
        const art = getImageUrl(track.album.images, 'sm')
        return (
          <motion.button
            key={track.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 30 }}
            onClick={() => onTrackClick(track)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            whileHover={{ borderColor: 'var(--accent-secondary)', scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <span
              className="text-lg font-black w-8 text-right flex-shrink-0"
              style={{
                fontFamily: 'var(--font-bebas-neue), sans-serif',
                color: i < 3 ? 'var(--accent-secondary)' : 'var(--text-muted)',
              }}
            >
              {i + 1}
            </span>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={art} alt={track.album.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {track.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {formatMs(track.duration_ms)}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
