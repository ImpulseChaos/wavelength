import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// Parses Billboard Hot 100 CSV data
// Download from: https://github.com/HipsterVizNinja/random-data/tree/main/Music/hot-100
// Place the CSV as prisma/hot-100.csv before running
async function main() {
  const csvPath = join(__dirname, 'hot-100.csv')

  let raw: string
  try {
    raw = readFileSync(csvPath, 'utf-8')
  } catch {
    console.log('No hot-100.csv found — skipping chart seed.')
    console.log('Download it from: https://github.com/HipsterVizNinja/random-data/tree/main/Music/hot-100')
    return
  }

  const lines = raw.split('\n').slice(1) // skip header
  const records: {
    year: number
    week: string
    rank: number
    title: string
    artist: string
  }[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    // CSV format: chart_week,rank,song,performer,...
    const cols = line.split(',')
    if (cols.length < 4) continue
    const week = cols[0].replace(/"/g, '').trim()
    const rank = parseInt(cols[1])
    const title = cols[2].replace(/"/g, '').trim()
    const artist = cols[3].replace(/"/g, '').trim()
    const year = parseInt(week.split('-')[0])

    if (isNaN(rank) || isNaN(year) || !title || !artist) continue
    records.push({ year, week, rank, title, artist })
  }

  console.log(`Seeding ${records.length} chart entries...`)

  // Upsert in batches of 500
  const batchSize = 500
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    await prisma.$transaction(
      batch.map(r =>
        prisma.chartData.upsert({
          where: { id: `${r.week}-${r.rank}` },
          create: { id: `${r.week}-${r.rank}`, ...r },
          update: {},
        })
      )
    )
    console.log(`  ${Math.min(i + batchSize, records.length)}/${records.length}`)
  }

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
