// Mock para simular uma integração com a API de fabricantes (ex: TecDoc, Partslink24)
export interface ManufacturerPartData {
  part_number: string;
  brand: string;
  model: string;
  category: string;
  title: string;
  description: string;
  estimated_price: number;
  year_start?: number;
  year_end?: number;
}

const mockDatabase: Record<string, ManufacturerPartData> = {
  // Exemplos genéricos de códigos OEM e seus retornos oficiais
  "14411-1VA0A": {
    part_number: "14411-1VA0A",
    brand: "nissan",
    model: "GT-R",
    category: "engine",
    title: "Turbina Original Garrett GT35 - Nissan GT-R",
    description: "Turbocompressor genuíno Nissan (Fabricação Garrett) para motores VR38DETT. Peça de reposição oficial com número de série validado.",
    estimated_price: 15500,
    year_start: 2008,
    year_end: 2024,
  },
  "11200-RNR-A00": {
    part_number: "11200-RNR-A00",
    brand: "honda",
    model: "Civic",
    category: "engine",
    title: "Cárter de Óleo do Motor K20 - Honda Civic Type R",
    description: "Cárter de óleo inferior genuíno para motor K20Z3. Especificação original OEM.",
    estimated_price: 1200,
    year_start: 2006,
    year_end: 2011,
  },
  "16100-39436": {
    part_number: "16100-39436",
    brand: "toyota",
    model: "Supra",
    category: "engine",
    title: "Bomba D'água Original 2JZ-GTE - Toyota Supra",
    description: "Bomba de água genuína Aisin para motores 2JZ-GTE. Acompanha junta original.",
    estimated_price: 1850,
    year_start: 1993,
    year_end: 2002,
  }
};

export const manufacturerApi = {
  /**
   * Busca os dados oficiais da peça baseados no Part Number / Código OEM.
   * Utiliza a IA conectada via OpenRouter para varrer os dados públicos de catálogos
   * da Bosch, Denso, Honda, Toyota e outras montadoras.
   */
  lookupPartNumber: async (partNumber: string): Promise<ManufacturerPartData | null> => {
    console.log(`[manufacturerApi] Buscando part number oficial: ${partNumber}`);
    
    const cleanPartNumber = partNumber.trim().toUpperCase();
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn("VITE_OPENROUTER_API_KEY não configurada, usando dados de fallback.");
      return mockDatabase[cleanPartNumber] || null;
    }

    const prompt = `Você é um Web Scraper especializado em catálogos de autopeças (Bosch eCat, Denso Aftermarket, Catálogos Oficiais da Honda, Toyota, Nissan, etc). 
Sua missão é pesquisar na sua base de dados o Part Number (Número OEM): "${cleanPartNumber}".

Retorne APENAS um JSON válido e estrito contendo:
- "part_number": o código exato
- "brand": a montadora ou fabricante da peça em lowercase (ex: bosch, denso, honda, nissan, toyota)
- "model": modelo do carro em que a peça aplica
- "category": categoria da peça (engine, transmission, suspension, body, interior, electrical, wheels)
- "title": Um título comercial preciso (ex: "Bico Injetor Bosch Original...")
- "description": Especificações técnicas completas extraídas do fabricante
- "estimated_price": Um valor estimado de mercado (apenas números, em reais BRL).
Se você não encontrar a peça, tente inferir a fabricante pelo padrão do código.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-OpenRouter-Title': 'Car Parts Marketplace - Catalog Search'
        },
        body: JSON.stringify({
          // Utilizando modelo Sonar Online da Perplexity que faz buscas na web em tempo real
          // ou Gemini Flash se preferir um fallback rápido.
          model: 'perplexity/llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'user', content: prompt }
          ],
        })
      });

      if (!response.ok) {
        // Fallback pro modelo Flash caso a conta não tenha créditos premium para o Perplexity
        const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-OpenRouter-Title': 'Car Parts Marketplace'
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });
        
        if (!fallbackRes.ok) throw new Error('Ambas as APIs de catálogo falharam');
        const fallbackData = await fallbackRes.json();
        return parseResponse(fallbackData.choices[0].message.content);
      }

      const data = await response.json();
      return parseResponse(data.choices[0].message.content);

    } catch (e) {
      console.error("[manufacturerApi] Erro ao buscar catálogo:", e);
      return mockDatabase[cleanPartNumber] || {
        part_number: cleanPartNumber,
        brand: "Desconhecida",
        model: "Universal",
        category: "engine",
        title: `[CATÁLOGO] Peça OEM ${cleanPartNumber}`,
        description: `Dados de catálogo indisponíveis no momento. Código buscado: ${cleanPartNumber}.`,
        estimated_price: 1000
      };
    }
  }
};

function parseResponse(content: string): ManufacturerPartData | null {
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```json')) cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (cleanContent.startsWith('```')) cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
  
  try {
    const parsed = JSON.parse(cleanContent);
    return {
      part_number: parsed.part_number,
      brand: parsed.brand?.toLowerCase(),
      model: parsed.model,
      category: parsed.category?.toLowerCase(),
      title: parsed.title,
      description: parsed.description,
      estimated_price: parsed.estimated_price || 0,
      year_start: parsed.year_start,
      year_end: parsed.year_end
    };
  } catch (err) {
    console.error("Erro no parse do JSON do catálogo", err, cleanContent);
    return null;
  }
}
