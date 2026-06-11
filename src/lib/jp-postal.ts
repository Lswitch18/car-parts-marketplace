interface ZipcloudResult {
  address1: string
  address2: string
  address3: string
  kana1: string
  kana2: string
  kana3: string
}

interface ZipcloudResponse {
  status: number
  results?: ZipcloudResult[]
  message?: string
}

export async function fetchJpPostal(code: string): Promise<{
  fullAddress: string
  city: string
  state: string
} | null> {
  const digits = code.replace(/\D/g, '')
  if (digits.length !== 7) return null

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
