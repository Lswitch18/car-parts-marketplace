const { getBrands, getModelsByBrand, searchParts } = require('auto-parts-db')
require('dotenv').config({ path: '.env' })

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = 'clqubcryhbrjlupkgeva'
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

const dryRun = process.argv.includes('--dry-run')
const BATCH_SIZE = 50

if (!ACCESS_TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env')
  process.exit(1)
}

async function query(sql) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`SQL error: ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function enrichBrands() {
  console.log('\n=== Enriquecendo Marcas ===')
  const brands = getBrands()
  let count = 0

  for (let i = 0; i < brands.length; i += BATCH_SIZE) {
    const batch = brands.slice(i, i + BATCH_SIZE)
    const values = batch.map(name => {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      return `('${name.replace(/'/g, "''")}', '${slug}')`
    }).join(',\n')

    const sql = `insert into brands (name, slug) values\n${values}\non conflict (slug) do nothing;`
    if (dryRun) {
      console.log(`  [DRY-RUN] Insert ${batch.length} brands (${batch[0]}..${batch[batch.length-1]})`)
    } else {
      try {
        await query(sql)
        count += batch.length
        console.log(`  ✓ ${batch.length} brands (${batch[0]}..${batch[batch.length-1]})`)
      } catch (e) {
        console.error(`  ✗ Error inserting batch: ${e.message}`)
      }
    }
  }
  console.log(`  Total: ${count} marcas`)
}

async function enrichModels() {
  console.log('\n=== Enriquecendo Modelos ===')
  const brands = getBrands()
  let count = 0

  for (const brandName of brands) {
    const slug = brandName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const models = getModelsByBrand(brandName)
    if (!models || models.length === 0) continue

    const values = []
    for (const model of models) {
      const gen = model.generations?.[0]
      const nameClean = model.name.replace(/'/g, "''")
      const genName = gen?.name ? gen.name.replace(/'/g, "''") : null
      const yearStart = gen?.yearFrom || null
      const yearEnd = gen?.yearTo || null
      values.push(`(
        (select id from brands where slug = '${slug}'),
        '${nameClean}',
        ${genName ? `'${genName}'` : 'null'},
        ${yearStart || 'null'},
        ${yearEnd || 'null'}
      )`)
    }

    if (values.length === 0) continue

    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batch = values.slice(i, i + BATCH_SIZE)
      const sql = `insert into vehicle_models (brand_id, name, generation, year_start, year_end) values\n${batch.join(',\n')}\non conflict do nothing;`
      if (dryRun) {
        console.log(`  [DRY-RUN] ${brandName}: ${batch.length} models`)
      } else {
        try {
          await query(sql)
          count += batch.length
        } catch (e) {
          // skip conflicts
        }
      }
    }
    if (!dryRun) console.log(`  ✓ ${brandName}: ${values.length} modelos`)
  }
  console.log(`  Total: ${count} modelos`)
}

async function enrichParts() {
  console.log('\n=== Enriquecendo Peças ===')
  const queries = [
    'brake', 'brake pad', 'brake disc', 'brake rotor',
    'filter', 'oil filter', 'air filter', 'cabin filter', 'fuel filter',
    'spark', 'spark plug',
    'suspension', 'shock', 'strut', 'control arm', 'ball joint',
    'battery',
    'belt', 'timing belt', 'serpentine belt',
    'wiper', 'wiper blade',
    'headlight', 'taillight', 'fog light',
    'radiator', 'water pump', 'thermostat',
    'alternator', 'starter',
    'clutch', 'flywheel',
    'exhaust', 'muffler', 'catalytic converter',
    'engine mount', 'transmission mount',
    'tie rod', 'sway bar', 'bushing',
    'gasket', 'head gasket', 'valve cover gasket',
    'sensor', 'oxygen sensor', 'MAF sensor',
    'hose', 'coolant hose', 'vacuum hose',
    'ignition coil', 'ignition wire',
    'fuel pump', 'fuel injector',
  ]
  let count = 0
  const seen = new Set()

  for (const q of queries) {
    const parts = searchParts(q)
    if (!parts || parts.length === 0) continue

    const values = []
    for (const part of parts) {
      const key = part.slug || part.name
      if (seen.has(key)) continue
      seen.add(key)

      const nameClean = (part.name || key).replace(/'/g, "''")
      const pnClean = key.replace(/'/g, "''")
      values.push(`('${pnClean}', '${nameClean}', 'auto-parts-db')`)
    }

    if (values.length === 0) continue

    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batch = values.slice(i, i + BATCH_SIZE)
      const sql = `insert into parts_catalog (part_number, name, source) values\n${batch.join(',\n')}\non conflict (part_number) where brand_id is null do nothing;`
      if (dryRun) {
        console.log(`  [DRY-RUN] ${q}: ${batch.length} parts`)
      } else {
        try {
          await query(sql)
          count += batch.length
        } catch (e) {
          console.error(`  ✗ Error: ${e.message}`)
        }
      }
    }
    if (!dryRun) console.log(`  ✓ "${q}": ${values.length} peças`)
  }
  console.log(`  Total: ${count} peças`)
}

async function main() {
  console.log(`🚗 Enriquecimento do banco de peças ${dryRun ? '(DRY-RUN)' : ''}`)
  console.log(`   Projeto: ${PROJECT_REF}`)

  await enrichBrands()
  await enrichModels()
  await enrichParts()

  console.log('\n✅ Enriquecimento concluído!')
}

main().catch(console.error)
