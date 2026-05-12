import { auth } from '@/auth'
import { spotifyFetch, resolveSpotifyIds } from '@/lib/spotify'
import { prisma } from '@/lib/prisma'
import type { SpotifyRecommendationsResponse } from '@/types/spotify'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? '1990')
  const genre = searchParams.get('genre')

  const chartTracks = await prisma.chartData.findMany({
    where: { year },
    orderBy: { rank: 'asc' },
    take: 10,
  })

  if (chartTracks.length === 0) {
    // No chart data seeded yet — fall back to Spotify genre/era search
    const params = new URLSearchParams({
      seed_genres: genre ?? 'pop',
      limit: '20',
      target_energy: '0.7',
    })
    const data = await spotifyFetch<SpotifyRecommendationsResponse>(
      `/recommendations?${params}`,
      session.accessToken
    )
    return Response.json({ tracks: data.tracks, year, source: 'fallback' })
  }

  const seedTrackIds = await resolveSpotifyIds(chartTracks, session.accessToken)

  if (seedTrackIds.length === 0) {
    return Response.json({ tracks: [], year })
  }

  const params = new URLSearchParams({
    seed_tracks: seedTrackIds.slice(0, 5).join(','),
    limit: '20',
    ...(genre ? { seed_genres: genre } : {}),
  })

  const data = await spotifyFetch<SpotifyRecommendationsResponse>(
    `/recommendations?${params}`,
    session.accessToken
  )

  return Response.json({ tracks: data.tracks, year })
}
