export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

export function json(data: unknown, status = 200) {
  const wrapped = status >= 200 && status < 300
    ? { success: true, data }
    : { success: false, error: data };
  return new Response(JSON.stringify(wrapped), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
