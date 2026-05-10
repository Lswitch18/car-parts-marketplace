import { successResponse, errorResponse, corsHeaders } from '../utils/base.ts';

/**
 * Analyze Part Edge Function
 * Utiliza IA para identificar peças automotivas a partir de imagens.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('A imagem é obrigatória para análise');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      // Mock para quando a chave não estiver configurada
      console.log('GEMINI_API_KEY não configurada. Retornando dados mockados.');
      return new Response(JSON.stringify(successResponse({
        title: 'Turbina Garrett GT35 (Identificado via IA)',
        brand: 'nissan',
        model: 'Skyline GT-R',
        category: 'engine',
        condition: 'excellent',
        description: 'Turbina de alta performance identificada automaticamente. Compatível com motores RB26.',
        price: 4500
      }, 'Análise concluída (Modo Demonstração)')), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Integração real com Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Identifique esta peça automotiva. Retorne APENAS um JSON com os campos: title (título comercial), brand (id da marca em lowercase, ex: nissan, toyota, honda), model (modelo compatível), category (engine, transmission, suspension, body, interior, electrical, wheels), description (breve descrição técnica) e estimated_price (valor numérico sugerido em Reais). Se não tiver certeza, chute os valores mais prováveis para o mercado JDM." },
            { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] || image } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const result = await response.json();
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
