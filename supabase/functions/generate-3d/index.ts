import { successResponse, errorResponse, corsHeaders } from '../utils/base.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const apiKey = Deno.env.get('REPLICATE_API_KEY');

    if (body.id) {
      return await handleStatusCheck(body.id, apiKey);
    }

    if (body.image) {
      return await handleStartPrediction(body.image, apiKey);
    }

    throw new Error('Envie { image: "url" } para iniciar ou { id: "prediction_id" } para consultar');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(JSON.stringify(errorResponse(msg)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function handleStartPrediction(image: string, apiKey: string | undefined) {
  if (!apiKey) {
    return new Response(JSON.stringify(successResponse({
      id: 'demo',
      status: 'demo',
    })), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://api.replicate.com/v1/models/stabilityai/triposr/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: { image } }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API error: ${err}`);
  }

  const prediction = await res.json();

  return new Response(JSON.stringify(successResponse({
    id: prediction.id,
    status: prediction.status,
    urls: prediction.urls,
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function handleStatusCheck(id: string, apiKey: string | undefined) {
  if (!apiKey) {
    return new Response(JSON.stringify(successResponse({
      status: 'demo',
      output: null,
    })), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate status error: ${err}`);
  }

  const result = await res.json();

  return new Response(JSON.stringify(successResponse({
    status: result.status,
    output: result.output,
    error: result.error,
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
