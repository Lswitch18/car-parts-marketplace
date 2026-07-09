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
   * @deprecated Usar a Edge Function analyze-part no backend para maior confiabilidade e segurança.
   */
  lookupPartNumber: async (partNumber: string): Promise<ManufacturerPartData | null> => {
    console.warn("[manufacturerApi] lookupPartNumber client-side is deprecated. Use Edge Function analyze-part instead.");
    const cleanPartNumber = partNumber.trim().toUpperCase();
    return mockDatabase[cleanPartNumber] || {
      part_number: cleanPartNumber,
      brand: "Desconhecida",
      model: "Universal",
      category: "engine",
      title: `[MOCK] Peça OEM ${cleanPartNumber}`,
      description: `Função cliente deprecada. Código OEM: ${cleanPartNumber}.`,
      estimated_price: 1000
    };
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
