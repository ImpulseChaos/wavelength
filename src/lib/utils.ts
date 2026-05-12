import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getImageUrl(images: { url: string; width: number; height: number }[], size: 'sm' | 'md' | 'lg' = 'md'): string {
  if (!images || images.length === 0) return '/placeholder-album.png'
  const sorted = [...images].sort((a, b) => b.width - a.width)
  if (size === 'lg') return sorted[0]?.url ?? ''
  if (size === 'sm') return sorted[sorted.length - 1]?.url ?? ''
  return sorted[Math.floor(sorted.length / 2)]?.url ?? sorted[0]?.url ?? ''
}
