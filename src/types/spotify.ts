export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  preview_url: string | null
  external_urls: { spotify: string }
  uri: string
}

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  images: SpotifyImage[]
  popularity: number
  followers?: { total: number }
  external_urls?: { spotify: string }
}

export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
}

export interface AudioFeatures {
  id: string
  danceability: number
  energy: number
  valence: number
  acousticness: number
  instrumentalness: number
  tempo: number
  loudness: number
  speechiness: number
  key: number
  mode: number
  time_signature: number
}

export interface SpotifyPlayerState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
  device: { id: string; name: string; type: string }
}

export interface VibeSearchResult {
  tracks: SpotifyTrack[]
  audioFeatures: Partial<AudioFeatures>
  prompt: string
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[]
}

export interface SpotifyTopTracksResponse {
  tracks: SpotifyTrack[]
}

export interface LyricLine {
  time: number
  text: string
}

export interface SyncedLyrics {
  lines: LyricLine[]
  trackId: string
}
