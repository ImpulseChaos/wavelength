'use client'
import { create } from 'zustand'
import type { SpotifyTrack, AudioFeatures, SpotifyPlayerState } from '@/types/spotify'

interface PlayerStore {
  currentTrack: SpotifyTrack | null
  audioFeatures: AudioFeatures | null
  isPlaying: boolean
  progressMs: number
  setPlayerState: (state: SpotifyPlayerState) => void
  setFeatures: (features: AudioFeatures) => void
  setTrack: (track: SpotifyTrack) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  audioFeatures: null,
  isPlaying: false,
  progressMs: 0,
  setPlayerState: (state) =>
    set({
      currentTrack: state.item,
      isPlaying: state.is_playing,
      progressMs: state.progress_ms,
    }),
  setFeatures: (features) => set({ audioFeatures: features }),
  setTrack: (track) => set({ currentTrack: track }),
}))
