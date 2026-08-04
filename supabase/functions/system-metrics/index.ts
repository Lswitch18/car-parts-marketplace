import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return false;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return !!profile?.role?.includes('admin');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    if (!(await requireAdmin(req))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    const startTime = performance.now();

    // Helper function to safely get table count without throwing 404s
    const safeCount = async (tableName: string) => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('id', { count: 'exact' })
          .limit(1);
        if (error) return 0;
        return count || 0;
      } catch {
        return 0;
      }
    };

    // Query core tables concurrently
    const [partsCount, profilesCount, transactionsCount] = await Promise.all([
      safeCount('parts'),
      safeCount('profiles'),
      safeCount('transactions')
    ]);

    // Query storage bucket safely
    let storageFilesCount = 0;
    try {
      const { data } = await supabase.storage.from('parts-images').list('', { limit: 100 });
      if (data) storageFilesCount = data.length;
    } catch {
      storageFilesCount = 0;
    }

    const endTime = performance.now();
    const pingMs = Math.round(endTime - startTime);

    const totalRows = partsCount + profilesCount + transactionsCount;
    const estimatedDbSizeMb = Number((0.15 + totalRows * 0.015).toFixed(2));
    const storageSizeMb = Number((storageFilesCount * 0.35 + 0.1).toFixed(2));

    const metrics = {
      partsCount,
      profilesCount,
      transactionsCount,
      totalRows,
      estimatedDbSizeMb,
      storageFilesCount,
      storageSizeMb,
      pingMs,
      region: 'hnd1 (Tokyo, JP)',
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      {
        status: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error fetching metrics' }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
});
