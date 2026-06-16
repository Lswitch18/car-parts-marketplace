import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT = 'clqubcryhbrjlupkgeva'
const API = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`

async function runSQL(label, filePath) {
  const sql = readFileSync(filePath, 'utf-8')
  console.log(`\n▶️  ${label} (${sql.length} bytes)...`)

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`❌ ${label} falhou (${res.status}):`)
    console.error(text.slice(0, 500))
    return false
  }

  // Try to parse as JSON — if empty return, it's probably fine
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  Resultados: ${data.length} linha(s)`)
      console.table(data.slice(0, 5))
    } else {
      console.log(`  ✅ Executado com sucesso`)
    }
  } catch {
    console.log(`  ✅ Executado (sem resultados tabulares)`)
  }
  return true
}

async function main() {
  let ok = true

  ok = await runSQL('Brands + Categories', join(ROOT, 'supabase/seed-v4-brands.sql')) && ok
  if (ok) {
    ok = await runSQL('Parts (DO block)', join(ROOT, 'supabase/seed-v4-parts.sql')) && ok
  }

  // Final verification
  console.log('\n🔍 Verificação final...')
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT LEFT(title, 50) AS titulo, LEFT(images[1], 80) AS imagem, updated_at FROM parts ORDER BY updated_at DESC LIMIT 20`
    })
  })
  const data = await res.json()
  if (Array.isArray(data)) {
    console.table(data.map(r => ({
      titulo: r.titulo,
      imagem: (r.imagem || '').includes('storage') ? '✅ Storage' : (r.imagem || '').includes('wikimedia') ? '🌐 Wikimedia' : '❓ ' + (r.imagem || '').slice(0, 40),
      updated: r.updated_at?.slice(0, 19)
    })))
  }

  console.log(`\n${ok ? '✅ Tudo concluído!' : '⚠️  Alguns passos falharam'}`)
}

main().catch(err => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})
