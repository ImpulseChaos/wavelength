import type { JWT } from 'next-auth/jwt'
import type { SpotifyTrack } from '@/types/spotify'

const BASE = 'https://api.spotify.com/v1'

export async function spotifyFetch<T = unknown>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 204) return null as T
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Spotify ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    })

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: params.toString(),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error)

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    }
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

export async function resolveSpotifyIds(
  tracks: { title: string; artist: string; spotifyId: string | null }[],
  accessToken: string
): Promise<string[]> {
  const ids: string[] = []

  for (const track of tracks) {
    if (track.spotifyId) {
      ids.push(track.spotifyId)
      continue
    }
    try {
      const q = encodeURIComponent(`track:${track.title} artist:${track.artist}`)
      const result = await spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
        `/search?q=${q}&type=track&limit=1`,
        accessToken
      )
      const found = result?.tracks?.items?.[0]
      if (found) ids.push(found.id)
    } catch {
      // skip unresolvable tracks
    }
  }

  return ids
}
