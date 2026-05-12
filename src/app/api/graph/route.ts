import { auth } from '@/auth'
import { spotifyFetch } from '@/lib/spotify'
import { prisma } from '@/lib/prisma'
import type { SpotifyArtist } from '@/types/spotify'
import type { GraphNode, GraphEdge } from '@/types/graph'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const artistId = searchParams.get('artistId')
  const depth = Math.min(parseInt(searchParams.get('depth') ?? '1'), 3)

  if (!artistId) return Response.json({ error: 'artistId required' }, { status: 400 })

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const cached = await prisma.graphEdgeCache.findMany({
      where: { artistId, fetchedAt: { gte: sevenDaysAgo } },
    })

    let relatedArtists: SpotifyArtist[]

    if (cached.length > 0) {
      relatedArtists = cached.map(c => ({
        id: c.relatedArtistId,
        name: '',
        genres: [],
        images: [],
        popularity: 0,
      }))
    } else {
      const data = await spotifyFetch<{ artists: SpotifyArtist[] }>(
        `/artists/${artistId}/related-artists`,
        session.accessToken
      )
      relatedArtists = data.artists.slice(0, 10)

      // Cache edges
      await Promise.allSettled(
        relatedArtists.map(a =>
          prisma.graphEdgeCache.upsert({
            where: { artistId_relatedArtistId: { artistId, relatedArtistId: a.id } },
            create: { artistId, relatedArtistId: a.id, fetchedAt: new Date() },
            update: { fetchedAt: new Date() },
          })
        )
      )
    }

    // Fetch full origin artist data
    const originArtist = await spotifyFetch<SpotifyArtist>(
      `/artists/${artistId}`,
      session.accessToken
    )

    // Fetch full related artist data (batch)
    const relatedIds = relatedArtists.map(a => a.id).filter(Boolean)
    let fullRelated: SpotifyArtist[] = []
    if (relatedIds.length > 0) {
      const batchData = await spotifyFetch<{ artists: SpotifyArtist[] }>(
        `/artists?ids=${relatedIds.join(',')}`,
        session.accessToken
      )
      fullRelated = batchData.artists ?? []
    }

    const nodes: GraphNode[] = [
      {
        id: originArtist.id,
        name: originArtist.name,
        image: originArtist.images?.[0]?.url ?? '',
        popularity: originArtist.popularity,
        depth: 0,
      },
      ...fullRelated.map(a => ({
        id: a.id,
        name: a.name,
        image: a.images?.[0]?.url ?? '',
        popularity: a.popularity,
        depth,
      })),
    ]

    const edges: GraphEdge[] = fullRelated.map(a => ({
      source: artistId,
      target: a.id,
      collaborations: 1,
    }))

    return Response.json({ nodes, edges })
  } catch (err) {
    console.error('Graph route error:', err)
    return Response.json({ error: 'Failed to fetch graph data' }, { status: 500 })
  }
}
