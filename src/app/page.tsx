'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { NowPlaying } from '@/components/NowPlaying'
import { VibeSearch } from '@/components/VibeSearch'
import { SixDegrees } from '@/components/SixDegrees'
import { TimeMachine } from '@/components/TimeMachine'
import { TabBar } from '@/components/shared/TabBar'
import { useUIStore } from '@/store/uiStore'

export default function Home() {
  const { activeTab } = useUIStore()

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left sidebar — Now Playing */}
      <aside
        className="w-80 flex-shrink-0 flex flex-col overflow-hidden border-r"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <NowPlaying />
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <TabBar />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {activeTab === 'vibe' && <VibeSearch />}
              {activeTab === 'sixdegrees' && <SixDegrees />}
              {activeTab === 'timemachine' && <TimeMachine />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
