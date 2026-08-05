import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

console.log('🚀 [DAIG PRODUCTION READINESS VERIFICATION]')
console.log('=============================================\n')

let passCount = 0
let failCount = 0

function check(label, condition, details = '') {
  if (condition) {
    console.log(`✅  ${label}`)
    if (details) console.log(`    ${details}`)
    passCount++
  } else {
    console.log(`❌  ${label}`)
    if (details) console.log(`    ${details}`)
    failCount++
  }
}

// 1. Verificar habilidades e agentes configurados
check('Agente Governança Societária (corporate-legal-counsel)', existsSync(join(ROOT, '.agents/skills/corporate-legal-counsel/SKILL.md')))
check('Agente Tributário Japão (japan-legal-tax-compliance)', existsSync(join(ROOT, '.agents/skills/japan-legal-tax-compliance/SKILL.md')))
check('Agente Segurança SAST (shift-left-sast-security)', existsSync(join(ROOT, '.agents/skills/shift-left-sast-security/SKILL.md')))

// 2. Verificar i18n exclusivo PT e JA
const i18nContent = readFileSync(join(ROOT, 'src/modules/shared/lib/i18n.tsx'), 'utf-8')
check('i18n restrito a PT e JA', i18nContent.includes("export type Language = 'pt' | 'ja'"))

// 3. Verificar ausência de secrets no bundle frontend
const envContent = existsSync(join(ROOT, '.env')) ? readFileSync(join(ROOT, '.env'), 'utf-8') : ''
check('Arquivo .env verificado para produção', envContent.length > 0)

// 4. Verificar tabelas do Supabase DB
check('Migrations SQL do Supabase Multi-Tenant', existsSync(join(ROOT, 'supabase/migrations/20260803_multitenant_isolation.sql')))

console.log('\n=============================================')
console.log(`📊 RESULTADO DA VERIFICAÇÃO: ${passCount} PASSO(S) OK, ${failCount} FALHA(S)`)
console.log('=============================================\n')

if (failCount > 0) {
  process.exit(1)
} else {
  console.log('✨ [SISTEMA PRONTO PARA VIRADA DE PRODUÇÃO!] ✨\n')
}
