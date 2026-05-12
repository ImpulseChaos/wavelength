'use client'
import { formatMs } from '@/lib/utils'

interface ProgressBarProps {
  progressMs: number
  durationMs: number
}

export function ProgressBar({ progressMs, durationMs }: ProgressBarProps) {
  const pct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full rounded-full h-1" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-1 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: 'var(--accent-primary)' }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        <span>{formatMs(progressMs)}</span>
        <span>{formatMs(durationMs)}</span>
      </div>
    </div>
  )
}
