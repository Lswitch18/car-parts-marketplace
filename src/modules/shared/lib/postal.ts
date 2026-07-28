interface ZipcloudResult {
  address1: string
  address2: string
  address3: string
}

interface ZipcloudResponse {
  status: number
  results?: ZipcloudResult[]
  message?: string
}

interface ZippopotamusPlace {
  'place name': string
  state: string
  'state abbreviation': string
}

interface ZippopotamusResponse {
  country: string
  state: string
  places: ZippopotamusPlace[]
}

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface PostalResult {
  fullAddress: string
  street?: string
  city: string
  state: string
}

async function fetchZipcloud(digits: string): Promise<PostalResult | null> {
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`)
    if (!res.ok) return null
    const data: ZipcloudResponse = await res.json()
    if (data.status !== 200 || !data.results?.length) return null
    const r = data.results[0]
    return {
      state: r.address1,
      city: r.address2,
      street: r.address3 ? `${r.address2} ${r.address3}` : r.address2,
      fullAddress: `${r.address1} ${r.address2} ${r.address3}`.trim(),
    }
  } catch {
    return null
  }
}

async function fetchViaCEP(digits: string): Promise<PostalResult | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!res.ok) return null
    const data: ViaCEPResponse = await res.json()
    if (data.erro) return null
    const street = [data.logradouro, data.bairro].filter(Boolean).join(', ')
    return {
      state: data.uf,
      city: data.localidade,
      street: street,
      fullAddress: street,
    }
  } catch {
    return null
  }
}

async function fetchZippopotamus(country: string, digits: string): Promise<PostalResult | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/${country}/${digits}`)
    if (!res.ok) return null
    const data: ZippopotamusResponse = await res.json()
    if (!data.places?.length) return null
    const p = data.places[0]
    return {
      state: p.state || data.state,
      city: p['place name'],
      fullAddress: `${p['place name']}, ${p.state || data.state}`,
    }
  } catch {
    return null
  }
}

const COUNTRIES_BY_LENGTH: Record<number, string> = {
  8: 'BR',
  7: 'JP',
}

export async function fetchPostal(code: string): Promise<PostalResult | null> {
  const digits = code.replace(/\D/g, '')
  const country = COUNTRIES_BY_LENGTH[digits.length]
  if (!country) return null

  // ViaCEP: Melhor para o Brasil
  if (country === 'BR') {
    const result = await fetchViaCEP(digits)
    if (result) return result
  }

  // Zipcloud: melhor para Japão (endereço completo com rua/bairro)
  if (country === 'JP') {
    const result = await fetchZipcloud(digits)
    if (result) return result
  }

  // Zippopotam.us: fallback global
  return fetchZippopotamus(country, digits)
}
