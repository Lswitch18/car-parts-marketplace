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

    const AI_PROVIDER = Deno.env.get('AI_PROVIDER') || 'gemini'; // 'gemini' or 'ollama'
    const OLLAMA_API_URL = Deno.env.get('OLLAMA_API_URL') || 'http://201.46.120.192/api/chat';
    const OLLAMA_AUTH_TOKEN = Deno.env.get('OLLAMA_AUTH_TOKEN'); // For Basic Auth (e.g., base64(user:pass))
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    const prompt = "Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos: is_car_part (boolean: true se for uma peça/carro, false se for outra coisa como animal, pessoa, paisagem), title (título comercial otimizado), brand (id da marca em lowercase, ex: nissan, toyota, honda), model (modelo compatível), category (engine, transmission, suspension, body, interior, electrical, wheels), description (descrição técnica detalhada) e estimated_price (valor numérico sugerido em Reais). Se is_car_part for false, você pode deixar os outros campos vazios ou com valores genéricos.";
    const base64Image = image.split(',')[1] || image;

    let aiData;

    if (AI_PROVIDER === 'ollama') {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (OLLAMA_AUTH_TOKEN) {
        headers['Authorization'] = `Basic ${OLLAMA_AUTH_TOKEN}`;
      }

      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'llava',
          messages: [
            {
              role: 'user',
              content: prompt,
              images: [base64Image]
            }
          ],
          format: 'json',
          stream: false
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Ollama API Error:', result);
        throw new Error(`Erro na API Ollama: ${result.error || 'Erro desconhecido'}`);
      }

      const aiText = result.message?.content || '{}';
      aiData = JSON.parse(aiText);

    } else {
      // Integração com Gemini API
      if (!GEMINI_API_KEY) {
        throw new Error('A chave de API do Gemini não está configurada no Supabase.');
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }],
          generationConfig: { response_mime_type: "application/json" }
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
      aiData = JSON.parse(aiText);
    }

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
