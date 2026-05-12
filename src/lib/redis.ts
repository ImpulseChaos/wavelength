import { kv } from '@vercel/kv'

export { kv }

export const KEYS = {
  spotifyRefresh: (userId: string) => `spotify:refresh:${userId}`,
  rateLimit: (userId: string) => `rate:spotify:${userId}`,
  graphArtist: (artistId: string) => `graph:artist:${artistId}`,
} as const
