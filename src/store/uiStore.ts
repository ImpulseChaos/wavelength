'use client'
import { create } from 'zustand'

export type Tab = 'vibe' | 'sixdegrees' | 'timemachine'

interface UIStore {
  activeTab: Tab
  timeMachineYear: number | null
  setActiveTab: (tab: Tab) => void
  openTimeMachine: (year: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'vibe',
  timeMachineYear: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openTimeMachine: (year) => set({ activeTab: 'timemachine', timeMachineYear: year }),
}))
