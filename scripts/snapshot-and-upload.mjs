import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

import 'dotenv/config'

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

const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const SNAPSHOT_DIR = join(ROOT, 'supabase', `snapshot-${TS}`)

async function snapshot() {
  mkdirSync(SNAPSHOT_DIR, { recursive: true })
  console.log(`📸 Snapshot → ${SNAPSHOT_DIR}`)

  // List all tables in public schema
  const { data: tables, error } = await supabase.rpc('get_tables')
  if (error || !tables) {
    // Fallback: known tables
    const knownTables = [
      'brands', 'categories', 'parts', 'parts_categories',
      'profiles', 'vehicles', 'vehicle_models',
      'listings', 'favorites',
      'auctions', 'auction_bids',
      'transactions', 'orders', 'order_items',
      'messages', 'conversations',
      'reviews', 'notifications',
      'addresses', 'shipping_options',
      'parts_images'
    ]
    for (const table of knownTables) {
      await dumpTable(table)
    }
  } else {
    for (const row of tables) {
      const name = row.tablename || row.table_name || row.name
      if (name && !name.startsWith('_')) await dumpTable(name)
    }
  }

  writeFileSync(join(SNAPSHOT_DIR, '_metadata.json'), JSON.stringify({
    exported_at: TS,
    supabase_url: SUPABASE_URL,
    project_ref: 'clqubcryhbrjlupkgeva'
  }, null, 2))

  console.log(`✅ Snapshot concluído em ${SNAPSHOT_DIR}`)
}

async function dumpTable(name) {
  console.log(`  📋 Exportando ${name}...`)
  const { data, error, count } = await supabase
    .from(name)
    .select('*', { count: 'exact' })
  
  if (error) {
    console.log(`  ⏭️  ${name}: ${error.message}`)
    return
  }
  
  writeFileSync(join(SNAPSHOT_DIR, `${name}.json`), JSON.stringify(data, null, 2))
  console.log(`  ✅ ${name}: ${data.length} registros`)
}

async function uploadImages() {
  const IMAGES_DIR = join(ROOT, 'public', 'parts-images')
  const files = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'))
  
  console.log(`\n📤 Upload de ${files.length} imagens para Supabase Storage...`)

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.createBucket('parts-images', {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('❌ Erro ao criar bucket:', bucketError.message)
    return
  }

  const urls = {}
  for (const file of files) {
    const filePath = join(IMAGES_DIR, file)
    const buffer = readFileSync(filePath)
    console.log(`  📤 Uploading ${file}...`)
    
    const { error: uploadError } = await supabase.storage
      .from('parts-images')
      .upload(file, buffer, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (uploadError) {
      console.error(`  ❌ Erro ${file}: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('parts-images')
      .getPublicUrl(file)

    urls[file] = publicUrl
    console.log(`  ✅ ${file} → ${publicUrl}`)
  }

  // Save URLs for SQL update
  writeFileSync(join(ROOT, 'supabase', 'storage-urls.json'), JSON.stringify(urls, null, 2))
  console.log(`\n✅ URLs salvas em supabase/storage-urls.json`)
}

async function main() {
  console.log('🚀 DAIG Snapshot + Upload\n')
  await snapshot()
  await uploadImages()
  console.log('\n✨ Concluído!')
}

main().catch(err => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})
