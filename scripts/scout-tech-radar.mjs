#!/usr/bin/env node
/**
 * Tech Radar Scout — roda semanalmente (manual ou cron)
 * Verifica versões em package.json vs npm registry (fetch) e gera artifacts/tech-radar.json
 * Uso: node scripts/scout-tech-radar.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const PKG = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'))
const DEPS = PKG.dependencies

async function latest(pkg) {
  try {
    const r = await fetch(`https://registry.npmjs.org/${pkg}/latest`, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return null
    const j = await r.json()
    return j.version
  } catch { return null }
}

const watch = ['gsap', 'lenis', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'lucide-react']

async function run() {
  console.log('🔍 Tech Radar Scout — scanning', watch.join(', '))
  const results = []
  for (const p of watch) {
    const cur = DEPS[p] || 'not-found'
    const lat = await latest(p)
    const drift = lat && cur && !cur.includes(lat) ? 'outdated' : 'ok'
    results.push({ pkg: p, current: cur, latest: lat, drift })
    console.log(`  ${p}: ${cur} → ${lat} (${drift})`)
  }
  const radarPath = resolve('artifacts/tech-radar-live.json')
  if (!existsSync('artifacts')) mkdirSync('artifacts', { recursive: true })
  writeFileSync(radarPath, JSON.stringify({ date: new Date().toISOString().slice(0,10), live: results }, null, 2))
  console.log('✅ wrote', radarPath)
}

run()
