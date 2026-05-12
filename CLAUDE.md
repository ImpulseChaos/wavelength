# Wavelength — Architecture Reference

## What this app does
Music intelligence platform with 4 features: Vibe Search, Now Playing, Six Degrees, Time Machine.
All features share state through Zustand. Every feature connects through a central selected track/artist.

## Key architectural rules
1. D3 for math only — never call d3.select() on the DOM. React renders all SVG elements from simulation state.
2. All Spotify API calls go through Next.js Route Handlers — never call Spotify directly from client components.
3. NextAuth handles all OAuth and token refresh — never manually manage Spotify tokens.
4. "use client" is required on: any component using Zustand, React Query, D3, Framer Motion, or browser APIs.
5. Zustand stores are the single source of truth for cross-feature state.

## Project layout
Everything lives under `src/`. Path alias `@/*` maps to `src/*`.
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — feature components
- `src/lib/` — server-side helpers (spotify, claude, redis, prisma)
- `src/store/` — Zustand stores
- `src/types/` — shared TypeScript types

## Store responsibilities
- playerStore: current track, audio features, playback state (is_playing, progressMs)
- artistStore: selectedArtist (for UI display), graphOriginArtist (root of Six Degrees graph)
- uiStore: activeTab, timeMachineYear — openTimeMachine(year) sets both atomically

## Type source of truth
types/spotify.ts — all Spotify shapes live here. Never redefine inline.
types/graph.ts — D3 node/edge types.

## Cross-feature navigation
- NowPlaying "Explore Artist" → sets artistStore.graphOriginArtist, sets uiStore.activeTab = 'sixdegrees'
- NowPlaying "This Era" → calls uiStore.openTimeMachine(releaseYear)
- VibeSearch track click → sets playerStore track, sets uiStore.activeTab = 'nowplaying' (sidebar highlights)
- SixDegrees node click → sets artistStore.selectedArtist, fetches their top track, sets playerStore

## API rate limiting
Spotify enforces per-user rate limits. The /api/player route is polled every 3s — do not add more polling routes.
Use Vercel KV to cache graph data (TTL 7 days) and player state (TTL 3s) to reduce Spotify calls.

## Deployment
Single Vercel project. No separate backend. Environment variables set in Vercel dashboard.
Run `vercel env pull .env.local` to sync env vars to local dev.
