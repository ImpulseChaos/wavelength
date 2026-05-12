'use client'
import { motion } from 'framer-motion'
import type { AudioFeatures } from '@/types/spotify'

const FEATURES: { key: keyof AudioFeatures; label: string; color: string }[] = [
  { key: 'energy', label: 'Energy', color: 'var(--accent-primary)' },
  { key: 'danceability', label: 'Dance', color: '#7c86ff' },
  { key: 'valence', label: 'Mood', color: '#ff6b35' },
  { key: 'acousticness', label: 'Acoustic', color: '#4ecdc4' },
]

export function AudioFeatureBars({ features }: { features: AudioFeatures | null }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {FEATURES.map(({ key, label, color }) => {
        const value = features ? (features[key] as number) : 0
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="text-xs w-14 text-right flex-shrink-0"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {label}
            </span>
            <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--bg-elevated)' }}>
              <motion.div
                className="h-1.5 rounded-full"
                style={{ background: color }}
                animate={{ width: `${value * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            <span
              className="text-xs w-8 flex-shrink-0"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {value.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
