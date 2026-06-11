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

export interface PostalResult {
  fullAddress: string
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
      city: r.address2 + r.address3,
      fullAddress: `${r.address1} ${r.address2} ${r.address3}`,
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
      state: data.state,
      city: p['place name'],
      fullAddress: `${p['place name']}, ${data.state}`,
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

  // Zipcloud: melhor para Japão (endereço completo com rua/bairro)
  if (country === 'JP') {
    const result = await fetchZipcloud(digits)
    if (result) return result
  }

  // Zippopotam.us: fallback global (JP sem rua, BR completo)
  return fetchZippopotamus(country, digits)
}
