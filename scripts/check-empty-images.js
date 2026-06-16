import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  const { data: parts, error: fetchError } = await supabase
    .from('parts')
    .select('id, title');

  if (fetchError) {
    console.error('Error fetching parts list:', fetchError);
    return;
  }

  console.log(`Checking ${parts.length} parts...`);

  for (const part of parts) {
    const { data, error } = await supabase
      .from('parts')
      .select('*, brands(name), categories(name), profiles!parts_seller_id_fkey(full_name, avatar_url, rating, is_verified, total_sales)')
      .eq('id', part.id)
      .single();

    if (error) {
      console.error(`❌ Part "${part.title}" (ID: ${part.id}) failed detail query:`, error.message);
    } else {
      console.log(`✅ Part "${part.title}" (ID: ${part.id}) succeeded!`);
    }
  }
}

run();
