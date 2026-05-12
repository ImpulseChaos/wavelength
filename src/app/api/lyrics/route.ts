import { auth } from '@/auth'
import { spotifyFetch } from '@/lib/spotify'
import type { SpotifyTrack } from '@/types/spotify'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('trackId')
  if (!trackId) return Response.json({ error: 'trackId required' }, { status: 400 })

  try {
    const track = await spotifyFetch<SpotifyTrack>(`/tracks/${trackId}`, session.accessToken)
    const artistName = track.artists[0]?.name ?? ''
    const trackName = track.name

    const apiKey = process.env.MUSIXMATCH_API_KEY
    if (!apiKey) return Response.json({ lines: [], trackId })

    const q = encodeURIComponent(`${trackName} ${artistName}`)
    const searchRes = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.search?q_track_artist=${q}&f_has_lyrics=1&apikey=${apiKey}&page_size=1`
    )
    const searchData = await searchRes.json()
    const mmTrackId = searchData?.message?.body?.track_list?.[0]?.track?.track_id

    if (!mmTrackId) return Response.json({ lines: [], trackId })

    const lyricsRes = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.subtitle.get?track_id=${mmTrackId}&subtitle_format=lrc&apikey=${apiKey}`
    )
    const lyricsData = await lyricsRes.json()
    const lrcBody: string = lyricsData?.message?.body?.subtitle?.subtitle_body ?? ''

    const lines = parseLrc(lrcBody)
    return Response.json({ lines, trackId })
  } catch {
    return Response.json({ lines: [], trackId })
  }
}

function parseLrc(lrc: string) {
  const lines: { time: number; text: string }[] = []
  const re = /\[(\d+):(\d+\.\d+)\](.*)/
  for (const line of lrc.split('\n')) {
    const m = line.match(re)
    if (!m) continue
    const time = parseInt(m[1]) * 60 + parseFloat(m[2])
    lines.push({ time, text: m[3].trim() })
  }
  return lines
}
