import { successResponse, errorResponse, corsHeaders, requireAuth } from '../utils/base.ts';

function cleanJsonMarkdown(raw: string): string {
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return clean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Apenas usuários autenticados podem certificar preços
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const body = await req.json();
    const { title, brand, model, part_number, condition, suggested_price } = body;

    if (!title || suggested_price === undefined || suggested_price === null) {
      throw new Error('Título e preço sugerido são obrigatórios para a certificação.');
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!OPENROUTER_API_KEY && !GEMINI_API_KEY) {
      throw new Error('Chaves de API de IA não configuradas no servidor.');
    }

    const prompt = `Você é um especialista em avaliação e precificação de autopeças usadas no mercado japonês (JDM) e global.
Sua tarefa é analisar o preço sugerido pelo vendedor para uma peça e verificar se ele está dentro de uma faixa de valor de mercado realista.
Leve em consideração a marca, modelo do carro e condição da peça. Os valores são na moeda inserida pelo usuário (provavelmente JPY ou BRL, assuma pelo contexto do título se necessário, mas foque em verificar proporções razoáveis de mercado). Se o valor sugerido for muito distante da realidade do mercado (superfaturado ou absurdamente barato a ponto de ser suspeito), marque is_fair como falso.

Dados da peça:
- Título: "${title}"
- Marca do carro compatível: "${brand || 'Desconhecida'}"
- Modelo do carro: "${model || 'Desconhecido'}"
- Part Number / OEM: "${part_number || 'N/A'}"
- Condição: "${condition || 'Desconhecida'}"
- Preço sugerido pelo vendedor: ${suggested_price}

Retorne APENAS um JSON válido e estrito contendo:
{
  "is_fair": boolean (true se o preço estiver condizente com o mercado e com a peça, false se for muito abusivo ou fora da realidade),
  "recommended_min": number (menor preço razoável estimado para esta peça no mercado na moeda do preço sugerido),
  "recommended_max": number (maior preço razoável estimado para a peça),
  "reasoning": string (Uma mensagem amigável e comercial em português de até 3 frases justificando a avaliação para o vendedor. Ex: 'O preço de ¥15.000 está dentro da média para peças originais Honda usadas.', ou 'O valor sugerido está acima da média do mercado. Considere revisar o preço para algo entre a nossa faixa recomendada para atrair mais compradores.')
}`;

    let resultJson: any = null;

    if (OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://daig.jp',
          'X-OpenRouter-Title': 'DAIG Price Certifier'
        },
        body: JSON.stringify({
          model: 'google/gemini-3.5-flash',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 500,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }
      const data = await response.json();
      const content = cleanJsonMarkdown(data.choices?.[0]?.message?.content || '{}');
      resultJson = JSON.parse(content);

    } else if (GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      const data = await response.json();
      const content = cleanJsonMarkdown(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      resultJson = JSON.parse(content);
    }

    if (!resultJson) {
      throw new Error('Falha ao gerar resposta da IA.');
    }

    return new Response(JSON.stringify(successResponse(resultJson)), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[certify-price] Erro:', errorMessage);
    return new Response(JSON.stringify(errorResponse(errorMessage)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
