'use client'
import { create } from 'zustand'
import type { SpotifyArtist } from '@/types/spotify'

interface ArtistStore {
  selectedArtist: SpotifyArtist | null
  graphOriginArtist: SpotifyArtist | null
  setSelectedArtist: (artist: SpotifyArtist) => void
  setGraphOrigin: (artist: SpotifyArtist) => void
}

export const useArtistStore = create<ArtistStore>((set) => ({
  selectedArtist: null,
  graphOriginArtist: null,
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),
  setGraphOrigin: (artist) => set({ graphOriginArtist: artist }),
}))
