import { auth } from '@/auth'
import { spotifyFetch } from '@/lib/spotify'
import type { SpotifyTopTracksResponse } from '@/types/spotify'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const artistId = searchParams.get('artistId')
  if (!artistId) return Response.json({ error: 'artistId required' }, { status: 400 })

  const data = await spotifyFetch<SpotifyTopTracksResponse>(
    `/artists/${artistId}/top-tracks?market=US`,
    session.accessToken
  )

  return Response.json({ track: data.tracks?.[0] ?? null })
}
