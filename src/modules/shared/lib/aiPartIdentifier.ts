/**
 * 🤖 DAIG AI PART IDENTIFIER (Regra Estrita de Uso da IA)
 * 
 * Regra do Sistema: O uso de Inteligência Artificial em toda a plataforma DAIG
 * (App Mobile da Empresa, SaaS Tenant ERP e Assistente do Marketplace)
 * é EXCLUSIVO e RESTRITO à IDENTIFICAÇÃO E EXTRAÇÃO DE INFORMAÇÕES DE PEÇAS AUTOMOTIVAS.
 * 
 * Capacidades Oficiais de Identificação por IA:
 * 1. Reconhecimento Visual por Foto (Marca, Modelo, Nome da Peça, Categoria, Lado e Estado).
 * 2. Leitura OCR de Gravuras Metálicas e Etiquetas (Código OEM, Número de Série do Bloco, VIN Chassi).
 * 3. Análise de Compatibilidade Veicular (Lista de carros/anos compatíveis).
 * 4. Estimativa de Preço Recomendado (Valores JPY/BRL baseados em mercado e condição).
 * 5. Interpretação por Voz / Linguagem Natural (Mapeamento de perguntas do cliente para a peça e localização WMS).
 */

export interface PartIdentificationInput {
  imageUrl?: string
  rawTextQuery?: string
  ocrMetalString?: string
}

export interface IdentifiedPartInfo {
  isCarPart: boolean
  title: string
  oemCode: string
  vehicleBrand: string
  vehicleModel: string
  yearCompatibility: string
  category: string
  conditionGrade: 'A+' | 'A' | 'B' | 'C'
  suggestedPriceJpy: number
  wmsRecommendedZone?: string
  compatibilityList: string[]
  confidenceScore: number
}

/**
 * Prompt Oficial para Identificação de Peças por IA
 */
export const SYSTEM_AI_PART_IDENTIFICATION_PROMPT = `
Você é o Motor de IA Especialista em Peças Automotivas da DAIG (Digital A.I. Garage).
Sua ÚNICA E EXCLUSIVA função é identificar peças de veículos a partir de fotos, gravuras em metal (OCR) ou consultas em linguagem natural.

Ao receber uma imagem ou texto, você DEVE extrair e responder estritamente:
1. Nome Exato da Peça (ex: Farol Dianteiro LED Esquerdo, Inversor Híbrido, Turbo RB26DETT Nismo)
2. Código OEM / Part Number Oficial (ex: OEM-33100-47820)
3. Veículo de Origem (Marca, Modelo, Faixa de Ano)
4. Categoria (Lataria, Motor, Injeção, Suspensão, Câmbio, Eletrônicos)
5. Compatibilidade Veicular Cruzada
6. Preço Estimado de Mercado em Ienes Japoneses (JPY)
`

/**
 * Função de Identificação Simulada para fallback/demo quando a API Gemini/OpenAI estiver em modo offline
 */
export function identifyPartInformation(input: PartIdentificationInput): IdentifiedPartInfo {
  const query = (input.rawTextQuery || input.ocrMetalString || '').toLowerCase()

  if (query.includes('turbo') || query.includes('rb26') || query.includes('skyline')) {
    return {
      isCarPart: true,
      title: 'Turbo Twin-Turbo RB26DETT Nismo Spec-R',
      oemCode: 'OEM-14411-AA300',
      vehicleBrand: 'Nissan',
      vehicleModel: 'Skyline GT-R BNR34',
      yearCompatibility: '1999 - 2002',
      category: 'Motor & Periféricos',
      conditionGrade: 'A+',
      suggestedPriceJpy: 185000,
      wmsRecommendedZone: 'Galpão A ➔ Corredor 04 ➔ Estante A ➔ Prateleira 2',
      compatibilityList: ['Nissan Skyline GT-R R32', 'Nissan Skyline GT-R R33', 'Nissan Skyline GT-R R34'],
      confidenceScore: 0.99
    }
  }

  if (query.includes('ecu') || query.includes('fit') || query.includes('modulo')) {
    return {
      isCarPart: true,
      title: 'Módulo de Injeção Eletrônica ECU Engine Control Unit',
      oemCode: 'OEM-37820-5R0-J61',
      vehicleBrand: 'Honda',
      vehicleModel: 'Fit GK3',
      yearCompatibility: '2015 - 2020',
      category: 'Injeção Eletrônica & Sensores',
      conditionGrade: 'A',
      suggestedPriceJpy: 38000,
      wmsRecommendedZone: 'Galpão A ➔ Corredor 04 ➔ Estante B ➔ Prateleira 3 ➔ Caixa 12',
      compatibilityList: ['Honda Fit GK3 (2015-2020)', 'Honda Vezel RU1', 'Honda Shuttle GP7'],
      confidenceScore: 0.98
    }
  }

  // Fallback Padrão: Toyota Prius ZVW30 Farol LED
  return {
    isCarPart: true,
    title: 'Farol Dianteiro Full LED Esquerdo (LHD/RHD)',
    oemCode: 'OEM-33100-47820',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Prius ZVW30',
    yearCompatibility: '2015 - 2022',
    category: 'Lataria & Iluminação',
    conditionGrade: 'A+',
    suggestedPriceJpy: 45000,
    wmsRecommendedZone: 'Galpão A ➔ Corredor 02 ➔ Estante C ➔ Prateleira 1',
    compatibilityList: ['Toyota Prius ZVW30 (2015-2022)', 'Toyota Prius PHV ZVW35'],
    confidenceScore: 0.99
  }
}
