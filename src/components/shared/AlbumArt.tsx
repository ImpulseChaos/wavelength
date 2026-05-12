'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AlbumArtProps {
  src: string
  alt: string
  size?: number
  isPlaying?: boolean
  className?: string
}

export function AlbumArt({ src, alt, size = 80, isPlaying = false, className }: AlbumArtProps) {
  return (
    <motion.div
      className={cn('relative rounded-lg overflow-hidden flex-shrink-0', className)}
      style={{ width: size, height: size }}
      animate={
        isPlaying
          ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0px rgba(232,255,71,0)', '0 0 24px rgba(232,255,71,0.3)', '0 0 0px rgba(232,255,71,0)'] }
          : { scale: 1 }
      }
      transition={isPlaying ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <Image
        src={src || '/placeholder-album.png'}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </motion.div>
  )
}
