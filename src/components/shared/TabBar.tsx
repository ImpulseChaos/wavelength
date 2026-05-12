'use client'
import { motion } from 'framer-motion'
import { useUIStore, type Tab } from '@/store/uiStore'

const TABS: { id: Tab; label: string }[] = [
  { id: 'vibe', label: 'Vibe Search' },
  { id: 'sixdegrees', label: 'Six Degrees' },
  { id: 'timemachine', label: 'Time Machine' },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{
            color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-muted)',
          }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'var(--accent-primary)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
