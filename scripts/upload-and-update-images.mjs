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
      console.error(`  ❌ Error ${file}: ${uploadError.message}`)
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
      id: 'd968971a-fb47-4235-b5b1-0c6f1adec46c',
      title: 'Nissan Silvia S15 Body Kit Top Secret Carbon',
      image: urls['bodykit-top-secret-s15.png']
    },
    {
      id: 'b624f8cb-8d07-4130-9db9-71d022a5cf0f',
      title: 'Toyota Supra A80 Turbo HKS GT3540',
      image: urls['turbo-hks-gt3540.png']
    },
    {
      id: '162f009c-9b14-4e87-a337-629cd272771d',
      title: 'Mazda RX-7 FD3S Motor 13B-REW Twin Turbo',
      image: urls['engine-13b-rew.png']
    },
    {
      id: 'fd88ec3b-e7fd-4fd9-afa3-a56cefdb84c8',
      title: 'Honda NSX NA1 Suspensão TEIN Mono Sport',
      image: urls['suspension-tein-monosport-nsx.png']
    },
    {
      id: 'ee23e58e-43fe-431a-95c6-850bc39e044a',
      title: 'Honda S2000 Kit Freios Brembo GT 4 Pistões',
      image: urls['brakes-brembo-gt-s2000.png']
    },
    {
      id: '3c25ecea-8ee0-4d11-b740-d6e98485d3c1',
      title: 'Subaru WRX STI Rodas BBS RI-A 18"',
      image: urls['wheels-bbs-ria-18.png']
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
