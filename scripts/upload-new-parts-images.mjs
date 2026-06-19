import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
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

async function uploadAndGetUrls() {
  const IMAGES_DIR = join(ROOT, 'public', 'parts-images')
  const files = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'))
  
  console.log(`📤 Uploading ${files.length} images to Supabase Storage...`)

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.createBucket('parts-images', {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('❌ Error creating bucket:', bucketError.message)
    return null
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
      console.error(`  ❌ Error uploading ${file}: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('parts-images')
      .getPublicUrl(file)

    urls[file] = publicUrl
    console.log(`  ✅ ${file} → ${publicUrl}`)
  }
  return urls
}

async function updateDatabase(urls) {
  if (!urls) return;

  const updates = [
    {
      id: '6eb482c5-005b-49b1-8810-fa2264b5e400',
      title: 'Toyota Supra A80 Body Kit Top Secret Carbon',
      image: urls['bodykit-supra.png']
    },
    {
      id: 'b6e7ac05-5f18-4b9b-ad9b-ac7ecf30eeaa',
      title: 'Turbinas GReddy T88-34D Rotary RX-7 FD3S',
      image: urls['turbo-rx7.png']
    },
    {
      id: '001aee72-c507-479a-b6d5-f7720d80b323',
      title: 'Coilovers Öhlins Road & Track WRX STI VAB',
      image: urls['coilovers-wrx.png']
    },
    {
      id: '5d1df2a3-9d7a-478b-9b22-34183607f061',
      title: 'Rodas Mugen MF10 16" Honda S2000 AP1',
      image: urls['wheels-mugen.png']
    },
    {
      id: '93f6ff31-e991-424f-ace7-556914cbe3a3',
      title: 'Motor VR38DETT Nissan GT-R R35 Completo',
      image: urls['engine-vr38dett.png']
    }
  ]

  console.log('\n✏️ Updating database records...')
  for (const item of updates) {
    if (!item.image) {
      console.warn(`  ⚠️ Missing image URL for ${item.title}, skipping database update.`);
      continue;
    }
    
    console.log(`  Updating ${item.title} -> ${item.image}`)
    const { error } = await supabase
      .from('parts')
      .update({ images: [item.image] })
      .eq('id', item.id)

    if (error) {
      console.error(`  ❌ Error updating ${item.title}:`, error.message)
    } else {
      console.log(`  ✅ Successfully updated ${item.title}`)
    }
  }
}

async function main() {
  const urls = await uploadAndGetUrls()
  await updateDatabase(urls)
  console.log('\n✨ Done!')
}

main().catch(err => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})
