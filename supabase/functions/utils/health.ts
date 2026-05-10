import { successResponse, corsHeaders } from '../utils/base.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  return new Response(JSON.stringify(successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'JAPANCAR PARTS API',
    version: '1.0.0',
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
});