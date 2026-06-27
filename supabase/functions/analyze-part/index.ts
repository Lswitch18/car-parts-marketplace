import { successResponse, errorResponse, corsHeaders, requireAuth } from '../utils/base.ts';

/**
 * Analyze Part Edge Function
 * Utiliza IA para identificar peças automotivas a partir de imagens.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Security: Require auth to protect API quotas
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('A imagem é obrigatória para análise');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('A chave de API do Gemini não está configurada no Supabase.');
    }

    // Integração real com Gemini API (Usando Gemini 2.5 Pro)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos: is_car_part (boolean: true se for uma peça/carro, false se for outra coisa como animal, pessoa, paisagem), title (título comercial otimizado), brand (id da marca em lowercase, ex: nissan, toyota, honda), model (modelo compatível), category (engine, transmission, suspension, body, interior, electrical, wheels), description (descrição técnica detalhada) e estimated_price (valor numérico sugerido em Reais). Se is_car_part for false, você pode deixar os outros campos vazios ou com valores genéricos." },
            { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] || image } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Gemini API Error:', result);
      throw new Error(`Erro na API Gemini: ${result.error?.message || 'Erro desconhecido'}`);
    }
    
    if (!result.candidates || result.candidates.length === 0) {
      console.error('Unexpected Gemini Response:', result);
      throw new Error('A API do Gemini retornou uma resposta vazia ou inesperada.');
    }
    
    const aiText = result.candidates[0].content.parts[0].text;
    const aiData = JSON.parse(aiText);

    return new Response(JSON.stringify(successResponse(aiData)), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(JSON.stringify(errorResponse(errorMessage)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
