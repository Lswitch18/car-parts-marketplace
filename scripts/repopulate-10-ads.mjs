import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
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

const ARTIFACTS_DIR = '/home/lswitch/.gemini/antigravity-ide/brain/8838d632-9683-4d98-9e48-f805608d363e'

const partData = [
  { filePrefix: 'steering_wheel_', title: 'カーボンファイバーレーシングステアリングホイール (アルカンターラ)', price: 150000, category: 'interior' },
  { filePrefix: 'exhaust_system_', title: 'チタン製キャットバックエキゾーストシステム', price: 350000, category: 'exhaust' },
  { filePrefix: 'intercooler_', title: 'ポリッシュドアルミニウム フロントマウントインタークーラー', price: 120000, category: 'engine' },
  { filePrefix: 'big_brake_kit_', title: '高性能6ピストンビッグブレーキキット', price: 450000, category: 'brakes' },
  { filePrefix: 'turbo_manifold_', title: 'ステンレス製ターボエキゾーストマニホールド', price: 200000, category: 'exhaust' },
  { filePrefix: 'racing_seat_', title: 'カーボンファイバー製フルバケットシート', price: 250000, category: 'interior' },
  { filePrefix: 'forged_piston_', title: '高圧縮鍛造ピストン＆コンロッドセット', price: 180000, category: 'engine' },
  { filePrefix: 'carbon_hood_', title: 'JDM ベント付きカーボンファイバーボンネット', price: 280000, category: 'body-kits' },
  { filePrefix: 'sequential_gearbox_', title: 'ビレットモータースポーツシーケンシャルギアボックス', price: 2500000, category: 'transmission' },
  { filePrefix: 'ecu_standalone_', title: 'スタンドアローンフルコンECU', price: 400000, category: 'electronics' }
]

async function main() {
  console.log('🔍 Buscando 10 usuários não-admins...')
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'user')
    .limit(10)
    
  if (userError) throw userError
  
  if (users.length < 10) {
    console.warn(`⚠️ Encontrados apenas ${users.length} usuários. Alguns usuários receberão mais de um anúncio se houver repetição (ou falhará).`)
  }

  console.log('🔍 Buscando categorias do banco...')
  const { data: categories, error: catError } = await supabase.from('categories').select('id, slug')
  if (catError) throw catError

  const getCategoryId = (slug) => {
    const found = categories.find(c => c.slug === slug)
    return found ? found.id : categories[0].id
  }

  const artifactsFiles = readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.png'))
  
  for (let i = 0; i < partData.length; i++) {
    const data = partData[i]
    const user = users[i % users.length]
    
    const file = artifactsFiles.find(f => f.startsWith(data.filePrefix))
    if (!file) {
      console.error(`❌ Arquivo de imagem para ${data.filePrefix} não encontrado!`)
      continue
    }

    const filePath = join(ARTIFACTS_DIR, file)
    const buffer = readFileSync(filePath)
    
    const storageFileName = `auto-gen-${Date.now()}-${file}`
    console.log(`📤 Fazendo upload de ${storageFileName}...`)
    
    const { error: uploadError } = await supabase.storage
      .from('parts-images')
      .upload(storageFileName, buffer, {
        contentType: 'image/png',
        upsert: true
      })
      
    if (uploadError) {
      console.error(`  ❌ Erro no upload: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('parts-images')
      .getPublicUrl(storageFileName)

    console.log(`✅ Upload concluído: ${publicUrl}`)
    
    console.log(`📝 Criando anúncio para usuário ${user.id}...`)
    const { error: insertError } = await supabase
      .from('parts')
      .insert({
        seller_id: user.id,
        title: data.title,
        description: 'スタジオで撮影された本物の製品写真です。最高品質のJDMパーツ。',
        price: data.price,
        condition: 'new',
        images: [publicUrl],
        status: 'active',
        category_id: getCategoryId(data.category),
        brand_id: null
      })
      
    if (insertError) {
      console.error(`  ❌ Erro ao inserir no banco: ${insertError.message}`)
    } else {
      console.log(`✅ Anúncio "${data.title}" criado com sucesso!`)
    }
  }
  
  console.log('\n🚀 Processo concluído!')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
