import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://clqubcryhbrjlupkgeva.supabase.co';
const supabaseKey = 'sb_publishable_qmK1AvvoZuK_Vgc5ZE26uw_KeLoNOFt';
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  const { data, error, count } = await supabase.from('parts').select('id, title, status', { count: 'exact' });
  console.log('Total de partes:', count);
  console.log('Partes publicas encontradas:', data?.length);
  if (data) {
     const statusCount = data.reduce((acc, p) => { acc[p.status] = (acc[p.status]||0)+1; return acc; }, {});
     console.log('Contagem de status:', statusCount);
     console.log(data);
  }
  if (error) console.error(error);
}
check();
