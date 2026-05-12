'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { AlbumArt } from '@/components/shared/AlbumArt'
import { AudioFeatureBars } from './AudioFeatureBars'
import { ProgressBar } from './ProgressBar'
import { LyricsPanel } from './LyricsPanel'
import { usePlayerStore } from '@/store/playerStore'
import { useArtistStore } from '@/store/artistStore'
import { useUIStore } from '@/store/uiStore'
import type { SpotifyPlayerState, AudioFeatures } from '@/types/spotify'
import { getImageUrl } from '@/lib/utils'

export function NowPlaying() {
  const { data: session, status } = useSession()
  const { setPlayerState, setFeatures, currentTrack, audioFeatures, isPlaying, progressMs } = usePlayerStore()
  const { setGraphOrigin } = useArtistStore()
  const { openTimeMachine, setActiveTab } = useUIStore()

  const { data } = useQuery<{ playerState: SpotifyPlayerState | null; audioFeatures: AudioFeatures | null }>({
    queryKey: ['player'],
    queryFn: () => fetch('/api/player').then(r => r.json()),
    enabled: status === 'authenticated',
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (data?.playerState) {
      setPlayerState(data.playerState)
    }
    if (data?.audioFeatures) {
      setFeatures(data.audioFeatures)
    }
  }, [data, setPlayerState, setFeatures])

  if (status === 'loading') {
    return <SidebarSkeleton />
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <div className="text-4xl font-black tracking-widest" style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--accent-primary)' }}>
          WAVELENGTH
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Connect your Spotify to start listening
        </p>
        <button
          onClick={() => signIn('spotify')}
          className="px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
        >
          Connect Spotify
        </button>
      </div>
    )
  }

  const track = currentTrack
  const artist = track?.artists[0]
  const releaseYear = track?.album?.release_date
    ? parseInt(track.album.release_date.split('-')[0])
    : null
  const albumArtSrc = track ? getImageUrl(track.album.images, 'lg') : ''

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* App title */}
      <div className="flex items-center justify-between">
        <span
          className="text-2xl font-black tracking-widest"
          style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', color: 'var(--accent-primary)' }}
        >
          WAVELENGTH
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs px-2 py-1 rounded"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Sign out
        </button>
      </div>

      {/* Album art */}
      {track ? (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <AlbumArt
            src={albumArtSrc}
            alt={track.album.name}
            size={256}
            isPlaying={isPlaying}
            className="w-full !h-64 !w-auto mx-auto"
          />

          <div>
            <p className="font-semibold text-base leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {track.name}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
              {track.artists.map(a => a.name).join(', ')}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {track.album.name}
            </p>
          </div>

          <ProgressBar progressMs={progressMs} durationMs={track.duration_ms} />

          <AudioFeatureBars features={audioFeatures} />

          <LyricsPanel trackId={track.id} progressMs={progressMs} />

          {/* Cross-feature buttons */}
          <div className="flex gap-2 mt-1">
            {artist && (
              <button
                onClick={() => {
                  setGraphOrigin(artist)
                  setActiveTab('sixdegrees')
                }}
                className="flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)', border: '1px solid var(--border)' }}
              >
                Explore Artist
              </button>
            )}
            {releaseYear && (
              <button
                onClick={() => openTimeMachine(releaseYear)}
                className="flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-elevated)', color: 'var(--accent-secondary)', border: '1px solid var(--border)' }}
              >
                This Era ({releaseYear})
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            <span className="text-2xl">🎵</span>
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Open Spotify and play something
          </p>
        </div>
      )}

      {/* User info */}
      {session?.user && (
        <div className="mt-auto pt-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
          )}
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {session.user.name}
          </span>
        </div>
      )}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="h-6 w-32 rounded" style={{ background: 'var(--bg-elevated)' }} />
      <div className="w-full h-64 rounded-lg" style={{ background: 'var(--bg-elevated)' }} />
      <div className="h-4 w-3/4 rounded" style={{ background: 'var(--bg-elevated)' }} />
      <div className="h-3 w-1/2 rounded" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  )
}
