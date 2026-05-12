'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { SpotifyTrack } from '@/types/spotify'
import { getImageUrl, formatMs } from '@/lib/utils'

interface TrackCardProps {
  track: SpotifyTrack
  index: number
  onClick: () => void
}

export function TrackCard({ track, index, onClick }: TrackCardProps) {
  const albumArt = getImageUrl(track.album.images, 'sm')

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors group"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      whileHover={{ borderColor: 'var(--accent-primary)', scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={albumArt} alt={track.album.name} fill className="object-cover" sizes="48px" />
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
}
