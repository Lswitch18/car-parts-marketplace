import { successResponse, errorResponse, corsHeaders, requireAuth, supabase } from '../utils/base.ts';

/**
 * Normalize part number for database lookup (remove dashes, dots, spaces, special chars)
 */
function normalizePartNumber(partNo: string): string {
  return partNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Compute SHA-256 hash of a string using Web Crypto API (Deno-native)
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Calculate Levenshtein Distance between two strings
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between 0.0 and 1.0 based on Levenshtein Distance
 */
function getSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - getLevenshteinDistance(a, b) / maxLength;
}

/**
 * Decode brand and year locally from a 17-digit VIN (Chassis number)
 */
function decodeVinLocally(vin: string): { brand: string | null; year: number | null } {
  if (!vin || vin.length < 10) return { brand: null, year: null };
  const cleanVin = vin.toUpperCase().trim();
  const wmi = cleanVin.slice(0, 3);
  
  const wmiMap: Record<string, string> = {
    'JTD': 'toyota', 'JTE': 'toyota', 'JTM': 'toyota',
    'JHM': 'honda', 'JH4': 'honda', '1HG': 'honda', '5FN': 'honda',
    'JN1': 'nissan', '1N4': 'nissan',
    'JMB': 'mitsubishi',
    'JF1': 'subaru', '4S3': 'subaru',
    'JM1': 'mazda',
    '1FT': 'ford', '1FM': 'ford',
    '1GC': 'chevrolet', '1G1': 'chevrolet',
    'WVW': 'volkswagen', 'WVG': 'volkswagen',
    'WBA': 'bmw', 'WBS': 'bmw',
    'WDB': 'mercedes-benz', 'WDY': 'mercedes-benz',
    'WP0': 'porsche',
    'YS3': 'saab',
    'YV1': 'volvo',
    'SAD': 'jaguar', 'SAL': 'land rover',
    'KL3': 'chevrolet', 'KMH': 'hyundai', 'KNA': 'kia'
  };
  
  let brand: string | null = null;
  if (wmiMap[wmi]) {
    brand = wmiMap[wmi];
  } else {
    const prefix2 = wmi.slice(0, 2);
    const prefixMap: Record<string, string> = {
      'JA': 'isuzu', 'JF': 'subaru', 'JH': 'honda', 'JK': 'kawasaki',
      'JM': 'mazda', 'JN': 'nissan', 'JS': 'suzuki', 'JT': 'toyota',
      'KL': 'daewoo', 'KM': 'hyundai', 'KN': 'kia', 'WA': 'audi',
      'WB': 'bmw', 'WD': 'mercedes-benz', 'WP': 'porsche', 'WV': 'volkswagen'
    };
    if (prefixMap[prefix2]) {
      brand = prefixMap[prefix2];
    }
  }
  
  const char10 = cleanVin.charAt(9);
  const yearMap: Record<string, number> = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
    'W': 2028, 'X': 2029, 'Y': 2030,
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006,
    '7': 2007, '8': 2008, '9': 2009
  };
  
  const year = yearMap[char10] || null;
  return { brand, year };
}

function cleanJsonMarkdown(raw: string): string {
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return clean;
}

/**
 * Call Qwen3-VL Model via OpenRouter
 */
async function callQwen(base64Image: string, promptVision: string, apiKey: string): Promise<any> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://gaid.jp',
      'X-OpenRouter-Title': 'Gaid Parts Marketplace'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-vl-235b-a22b-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptVision },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = cleanJsonMarkdown(data.choices?.[0]?.message?.content || '{}');
  return JSON.parse(content);
}

/**
 * Call Gemini 2.5 Pro Model directly
 */
async function callGemini(base64Image: string, promptVision: string, apiKey: string): Promise<any> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: promptVision },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { response_mime_type: "application/json" }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${errData.error?.message || 'Unknown'}`);
  }
  const data = await response.json();
  const content = cleanJsonMarkdown(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  return JSON.parse(content);
}

/**
 * Analyze Part Edge Function
 * Orchestrates multi-model validation, local/web lookup, chassis decoding, and logs metrics.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const { image, language = 'pt', vin } = await req.json();

    if (!image) {
      throw new Error('A imagem é obrigatória para análise');
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const VIN_API_KEY = Deno.env.get('VIN_API_KEY');

    const imageHash = await sha256(image);

    const promptVision = `Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos:
{
  "is_car_part": boolean,
  "part_number": string | null,
  "brand": string (a marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan. Se for uma marca de autopeças como Bosch/Denso, retorne a marca do carro em que ela é aplicada),
  "model": string (o modelo do CARRO/VEÍCULO compatível, ex: prius, aqua, fit, note. NÃO retorne o modelo da própria peça, retorne o nome do carro),
  "category": string,
  "title": string,
  "description": string,
  "estimated_price": number,
  "confidence_score": number
}
IMPORTANTE: Retorne os textos descritivos (title e description) no idioma com código '${language}'.`;

    const base64Image = image.split(',')[1] || image;
    let visionResult: any = {};
    let qwenResult: any = null;
    let geminiResult: any = null;

    // FASE 1: VISÃO COMPUTACIONAL REDUNDANTE (Qwen3-VL + Gemini 2.5 Pro)
    if (OPENROUTER_API_KEY) {
      console.log('[analyze-part] Chamando Qwen3-VL via OpenRouter...');
      try {
        qwenResult = await callQwen(base64Image, promptVision, OPENROUTER_API_KEY);
        console.log('[analyze-part] Retorno Qwen:', qwenResult);
      } catch (err) {
        console.error('[analyze-part] Erro no Qwen3-VL:', err);
      }
    }

    // Se Qwen falhou ou retornou confiança abaixo de 0.95, acionamos Gemini para dupla validação
    const needsGemini = !qwenResult || qwenResult.confidence_score < 0.95 || !qwenResult.part_number;
    if (needsGemini && GEMINI_API_KEY) {
      console.log('[analyze-part] Chamando Gemini 2.5 Pro para verificação...');
      try {
        geminiResult = await callGemini(base64Image, promptVision, GEMINI_API_KEY);
        console.log('[analyze-part] Retorno Gemini:', geminiResult);
      } catch (err) {
        console.error('[analyze-part] Erro no Gemini:', err);
      }
    }

    // Unificar resultados dos modelos
    if (qwenResult && geminiResult) {
      const qwenPart = qwenResult.part_number || '';
      const geminiPart = geminiResult.part_number || '';
      const similarity = getSimilarity(normalizePartNumber(qwenPart), normalizePartNumber(geminiPart));

      if (similarity >= 0.95) {
        // Alta concordância
        visionResult = {
          ...qwenResult,
          confidence_score: 0.99
        };
      } else {
        // Baixa concordância: escolhe o que tem maior confiança nativa, ponderado por similaridade
        const best = (qwenResult.confidence_score || 0) >= (geminiResult.confidence_score || 0) ? qwenResult : geminiResult;
        visionResult = {
          ...best,
          confidence_score: Math.max(best.confidence_score || 0.5, 0.5) * similarity
        };
      }
    } else {
      visionResult = qwenResult || geminiResult || { is_car_part: false };
    }

    if (!visionResult.is_car_part) {
      return new Response(JSON.stringify(successResponse({ is_car_part: false })), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    let finalData = {
      ...visionResult,
      is_verified: false,
      brand_mismatch: false,
      source: 'vision_only',
      source_url: null,
      fallback_used: false
    };

    // FASE 2: VERIFICAÇÃO DE DADOS (BANCO LOCAL GROUND TRUTH)
    if (visionResult.part_number) {
      const normalizedCode = normalizePartNumber(visionResult.part_number);
      console.log(`[analyze-part] Código OEM detectado: ${visionResult.part_number}. Normalizado: ${normalizedCode}`);

      // 1. Procurar no parts_catalog local primeiro (Ground Truth)
      const { data: dbPart, error: dbError } = await supabase
        .from('parts_catalog')
        .select(`
          id, part_number, oem_number, name, description, price_reference, brand_id, category_id,
          brand:brands(id, name, slug),
          category:categories(id, name, slug)
        `)
        .or(`part_number.ilike.%${normalizedCode}%,oem_number.ilike.%${normalizedCode}%`)
        .limit(1)
        .maybeSingle();

      if (!dbError && dbPart) {
        console.log('[analyze-part] Registro encontrado no Banco de Dados Local!');
        finalData.title = dbPart.name;
        finalData.description = dbPart.description || finalData.description;
        finalData.estimated_price = dbPart.price_reference ? Number(dbPart.price_reference) : finalData.estimated_price;
        finalData.brand = dbPart.brand?.name || finalData.brand;
        finalData.brand_id = dbPart.brand_id;
        finalData.category = dbPart.category?.name || finalData.category;
        finalData.category_id = dbPart.category_id;
        finalData.is_verified = true;
        finalData.confidence_score = 0.99;
        finalData.source = 'local_catalog';
      } else {
        // 2. Não achou localmente. Rodar busca web via Perplexity Sonar
        if (OPENROUTER_API_KEY) {
          console.log('[analyze-part] Peça não encontrada localmente. Buscando na web com Perplexity...');
          const promptScraper = `Você é um Web Scraper especializado em catálogos oficiais de autopeças.
Sua missão é pesquisar na internet o Part Number (Número OEM): "${visionResult.part_number}" do fabricante "${visionResult.brand}".

Retorne APENAS um JSON válido e estrito contendo:
{
  "found": boolean,
  "part_number": string (o código oficial),
  "brand": string (marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan),
  "model": string (modelo de CARRO/VEÍCULO compatível, ex: fit, aqua, prius. NÃO retorne o nome do modelo da própria peça),
  "category": string,
  "title": string,
  "description": string,
  "estimated_price": number,
  "source_url": string | null
}`;

          try {
            const scraperResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://gaid.jp',
                'X-OpenRouter-Title': 'Gaid Parts Scraper'
              },
              body: JSON.stringify({
                model: 'perplexity/llama-3.1-sonar-large-128k-online',
                messages: [{ role: 'user', content: promptScraper }],
                temperature: 0.1,
              })
            });

            if (scraperResponse.ok) {
              const scraperData = await scraperResponse.json();
              const scraperContent = cleanJsonMarkdown(scraperData.choices?.[0]?.message?.content || '{}');
              const parsedScraper = JSON.parse(scraperContent);

              if (parsedScraper.found) {
                console.log('[analyze-part] Peça verificada com sucesso na web via Perplexity!');
                
                const visionBrandClean = visionResult.brand?.toLowerCase().trim();
                const scraperBrandClean = parsedScraper.brand?.toLowerCase().trim();
                const isBrandMatch = visionBrandClean === scraperBrandClean || 
                                     visionBrandClean?.includes(scraperBrandClean) || 
                                     scraperBrandClean?.includes(visionBrandClean);

                finalData.title = parsedScraper.title || finalData.title;
                finalData.description = parsedScraper.description || finalData.description;
                finalData.estimated_price = parsedScraper.estimated_price || finalData.estimated_price;
                finalData.brand = parsedScraper.brand || finalData.brand;
                finalData.model = parsedScraper.model || finalData.model;
                finalData.category = parsedScraper.category || finalData.category;
                finalData.source_url = parsedScraper.source_url;
                finalData.source = 'web_catalog';
                
                if (isBrandMatch) {
                  finalData.is_verified = true;
                  finalData.confidence_score = 0.98;
                } else {
                  console.warn(`[analyze-part] Brand mismatch detectado! Visão: ${visionBrandClean} | Scraper: ${scraperBrandClean}`);
                  finalData.brand_mismatch = true;
                  finalData.is_verified = false;
                  finalData.confidence_score = 0.60;
                }
              }
            }
          } catch (e) {
            console.error('[analyze-part] Falha no Scraper Perplexity:', e);
          }
        }
      }
    }

    // FASE 3: VALIDAR POR CHASSI (VIN) SE FORNECIDO E CONFIRMAR MODELO
    if (vin) {
      console.log(`[analyze-part] Validando com chassis/VIN: ${vin}`);
      const decodedVin = decodeVinLocally(vin);
      
      let externalVinResult: any = null;
      if (VIN_API_KEY) {
        try {
          console.log('[analyze-part] Buscando chassi na API de VIN...');
          const vinRes = await fetch(`https://api.levam.com/v1/vin/${vin}`, {
            headers: { 'Authorization': `Bearer ${VIN_API_KEY}` }
          });
          if (vinRes.ok) {
            externalVinResult = await vinRes.json();
          }
        } catch (vinErr) {
          console.error('[analyze-part] Erro na API de VIN:', vinErr);
        }
      }

      const vinBrand = externalVinResult?.manufacturer || decodedVin.brand;
      const vinYear = externalVinResult?.year || decodedVin.year;

      if (vinBrand) {
        console.log(`[analyze-part] Chassi resolvido para montadora: ${vinBrand}. Ano: ${vinYear}`);
        const cleanVinBrand = vinBrand.toLowerCase().trim();
        const cleanPartBrand = finalData.brand?.toLowerCase().trim() || '';

        const brandsMatch = cleanPartBrand.includes(cleanVinBrand) || cleanVinBrand.includes(cleanPartBrand);
        if (brandsMatch) {
          console.log('[analyze-part] Chassi da montadora bate com o fabricante da peça! Incrementando confiança.');
          finalData.confidence_score = Math.min(0.99, Math.max(finalData.confidence_score || 0.5, 0.95));
          finalData.fallback_used = true;
          if (vinYear) {
            finalData.description = `${finalData.description || ''}\n[Compatibilidade Confirmada via Chassi: ${vinBrand.toUpperCase()} ${vinYear}]`.trim();
          }
        } else {
          console.warn('[analyze-part] Conflito de marca entre Chassi e Peça!');
          finalData.brand_mismatch = true;
          finalData.confidence_score = Math.min(finalData.confidence_score || 0.5, 0.5);
        }
      }
    }

    // Garantir que a compatibilidade com o modelo de carro esteja descrita na descrição da peça
    if (finalData.model && finalData.description) {
      const cleanBrand = finalData.brand ? finalData.brand.toUpperCase() : '';
      const modelUpper = finalData.model.trim();
      let label = 'Compatibilidade sugerida';
      if (language === 'ja') {
        label = '推奨適合車種';
      } else if (language === 'en') {
        label = 'Suggested compatibility';
      }
      const compatibilityLine = `\n\n${label}: ${cleanBrand} ${modelUpper}`;
      if (!finalData.description.includes(label)) {
        finalData.description = `${finalData.description}${compatibilityLine}`.trim();
      }
    }

    // FASE 4: MAPEAR ID DE MARCA E CATEGORIA DO SUPABASE
    try {
      const { data: dbBrands } = await supabase.from('brands').select('id, name, slug');
      const { data: dbCategories } = await supabase.from('categories').select('id, name, slug');

      if (dbBrands && finalData.brand) {
        const cleanBrand = finalData.brand.toLowerCase().trim();
        const foundBrand = dbBrands.find((b: any) => 
          b.name.toLowerCase() === cleanBrand || b.slug.toLowerCase() === cleanBrand
        );
        if (foundBrand) {
          finalData.brand_id = foundBrand.id;
          finalData.brand = foundBrand.slug;
        }
      }

      if (dbCategories && finalData.category) {
        const cleanCategory = finalData.category.toLowerCase().trim();
        const foundCategory = dbCategories.find((c: any) => 
          c.name.toLowerCase() === cleanCategory || c.slug.toLowerCase() === cleanCategory
        );
        if (foundCategory) {
          finalData.category_id = foundCategory.id;
          finalData.category = foundCategory.slug;
        }
      }
    } catch (dbMappingErr) {
      console.warn('[analyze-part] Falha ao mapear brands/categories:', dbMappingErr);
    }

    // FASE 5: REGISTRAR LOG DE AUDITORIA E MÉTRICAS DE ACURÁCIA
    try {
      console.log('[analyze-part] Gravando log de auditoria...');
      const { error: logErr } = await supabase.from('analysis_logs').insert({
        input_image_hash: imageHash,
        part_number_detected: finalData.part_number || null,
        brand_detected: finalData.brand || null,
        confidence: finalData.confidence_score || 0.0,
        source: finalData.source || 'vision_only',
        brand_mismatch: finalData.brand_mismatch || false,
        was_fallback_used: finalData.fallback_used || false
      });
      if (logErr) {
        console.error('[analyze-part] Erro ao gravar log de auditoria:', logErr);
      }
    } catch (logErr) {
      console.error('[analyze-part] Exceção ao gravar log de auditoria:', logErr);
    }

    finalData._raw_ai_response = visionResult;

    return new Response(JSON.stringify(successResponse(finalData)), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[analyze-part] Ocorreu um erro no pipeline:', errorMessage);
    return new Response(JSON.stringify(errorResponse(errorMessage)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
