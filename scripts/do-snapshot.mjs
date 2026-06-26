import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente (.env).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws }
})

const SNAPSHOT_DIR = join(ROOT, 'snapshot')

async function snapshot() {
  mkdirSync(SNAPSHOT_DIR, { recursive: true })
  console.log(`📸 Snapshot → ${SNAPSHOT_DIR}`)

  const { data: tables, error } = await supabase.rpc('get_tables')
  if (error || !tables) {
    const knownTables = [
      'brands', 'categories', 'parts', 'parts_categories',
      'profiles', 'vehicles', 'vehicle_models',
      'listings', 'favorites', 'auctions', 'auction_bids',
      'transactions', 'orders', 'order_items',
      'messages', 'conversations', 'reviews', 'notifications',
      'addresses', 'shipping_options', 'parts_images'
    ]
    for (const table of knownTables) await dumpTable(table)
  } else {
    for (const row of tables) {
      const name = row.tablename || row.table_name || row.name
      if (name && !name.startsWith('_')) await dumpTable(name)
    }
  }
  console.log(`✅ Snapshot concluído em ${SNAPSHOT_DIR}`)
  process.exit(0)
}

async function dumpTable(name) {
  console.log(`  📋 Exportando ${name}...`)
  const { data, error } = await supabase.from(name).select('*')
  if (error) {
    console.log(`  ⏭️  ${name}: ${error.message}`)
    return
  }
  writeFileSync(join(SNAPSHOT_DIR, `${name}.json`), JSON.stringify(data, null, 2))
  console.log(`  ✅ ${name}: ${data?.length || 0} registros`)
}

snapshot()
