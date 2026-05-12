import { auth } from '@/auth'
import { spotifyFetch } from '@/lib/spotify'
import { getClaudeClient } from '@/lib/claude'
import type { SpotifyRecommendationsResponse } from '@/types/spotify'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await request.json()
  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 })
  }

  let features: Record<string, unknown> = {}

  try {
    const claude = getClaudeClient()
    const message = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `You are a music recommendation assistant. Convert the user's vibe description
into Spotify audio feature target values. Return ONLY a valid JSON object with these
optional fields: target_valence, target_energy, target_danceability, target_acousticness,
target_tempo, seed_genres (array of valid Spotify genre strings, max 2).
All numeric values 0.0–1.0 except target_tempo (40–200 BPM).
No explanation, no markdown fences, just the raw JSON object.`,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    features = JSON.parse(text.trim())
  } catch {
    // fallback to empty features — Spotify will use its own defaults
  }

  const seedGenres = Array.isArray(features.seed_genres)
    ? (features.seed_genres as string[]).slice(0, 2).join(',')
    : 'pop'

  const { seed_genres: _sg, ...numericFeatures } = features

  const params = new URLSearchParams({
    limit: '20',
    seed_genres: seedGenres,
    ...Object.fromEntries(
      Object.entries(numericFeatures).map(([k, v]) => [k, String(v)])
    ),
  })

  const data = await spotifyFetch<SpotifyRecommendationsResponse>(
    `/recommendations?${params}`,
    session.accessToken
  )

  return Response.json({ tracks: data.tracks, audioFeatures: features, prompt })
}
