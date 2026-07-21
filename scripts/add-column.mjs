import dotenv from 'dotenv';
import path from 'path';

// Load .env configuration
dotenv.config();

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT = 'clqubcryhbrjlupkgeva';
const API = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;

async function addColumn() {
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('Erro: SUPABASE_ACCESS_TOKEN não encontrado no .env');
    process.exit(1);
  }

  const query = 'ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;';
  console.log(`Executing SQL: ${query}`);

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ Falhou (${res.status}):`);
    console.error(text);
    process.exit(1);
  }

  console.log('✅ Coluna stripe_payment_id adicionada com sucesso!');
}

addColumn();
