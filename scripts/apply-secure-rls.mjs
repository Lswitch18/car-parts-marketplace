import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load environment variables from .env
dotenv.config({ path: join(ROOT, '.env') });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT = 'clqubcryhbrjlupkgeva';
const API = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error("❌ SUPABASE_ACCESS_TOKEN is missing in .env");
  process.exit(1);
}

async function runSQL(label, filePath) {
  const sql = readFileSync(filePath, 'utf-8');
  console.log(`\n▶️  Executing ${label} (${sql.length} bytes)...`);

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ ${label} failed (${res.status}):`);
    console.error(text.slice(0, 1000));
    return false;
  }

  console.log(`  ✅ SQL executed successfully!`);
  return true;
}

async function main() {
  const migrationPath = join(ROOT, 'supabase/migrations/20260713_secure_rls.sql');
  const ok = await runSQL('Secure RLS policies migration', migrationPath);
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
