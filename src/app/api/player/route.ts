import { auth } from '@/auth'
import { spotifyFetch } from '@/lib/spotify'
import type { SpotifyPlayerState, AudioFeatures } from '@/types/spotify'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const playerState = await spotifyFetch<SpotifyPlayerState>(
      '/me/player',
      session.accessToken
    )

    if (!playerState?.item) {
      return Response.json({ playerState: null, audioFeatures: null })
    }

    const audioFeatures = await spotifyFetch<AudioFeatures>(
      `/audio-features/${playerState.item.id}`,
      session.accessToken
    )

    return Response.json({ playerState, audioFeatures })
  } catch (err) {
    console.error('Player route error:', err)
    return Response.json({ error: 'Failed to fetch player state' }, { status: 500 })
  }
}
