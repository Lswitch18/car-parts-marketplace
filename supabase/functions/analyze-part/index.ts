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

    // Integração real com Gemini API (Usando Gemini 1.5 Pro)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Identifique esta peça automotiva. Retorne APENAS um JSON com os campos: title (título comercial otimizado para vendas e SEO), brand (id da marca em lowercase, ex: nissan, toyota, honda), model (modelo compatível detalhado), category (engine, transmission, suspension, body, interior, electrical, wheels), description (descrição técnica detalhada e persuasiva focada em conversão, mencionando estado visual da peça se possível) e estimated_price (valor numérico sugerido em Reais, realista para o mercado de peças JDM). Se não tiver certeza exata, faça a melhor estimativa possível para o mercado de peças usadas automotivas." },
            { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] || image } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const result = await response.json();
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('Falha ao gerar análise com Gemini Pro');
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
