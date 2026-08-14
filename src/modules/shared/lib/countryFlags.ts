export const COUNTRY_FLAGS: Record<string, string> = {
  'Japan': '🇯🇵',
  'JAPAN': '🇯🇵',
  'Germany': '🇩🇪',
  'GERMANY': '🇩🇪',
  'USA': '🇺🇸',
  'UK': '🇬🇧',
  'France': '🇫🇷',
  'FRANCE': '🇫🇷',
  'Italy': '🇮🇹',
  'ITALY': '🇮🇹',
  'South Korea': '🇰🇷',
  'SOUTH KOREA': '🇰🇷',
  'China': '🇨🇳',
  'CHINA': '🇨🇳',
  'Sweden': '🇸🇪',
  'SWEDEN': '🇸🇪',
  'Czech Republic': '🇨🇿',
  'Spain': '🇪🇸',
  'SPAIN': '🇪🇸',
  'Russia': '🇷🇺',
  'RUSSIA': '🇷🇺',
  'India': '🇮🇳',
  'Netherlands': '🇳🇱',
  'Malaysia': '🇲🇾',
  'Romania': '🇷🇴',
  'Austria': '🇦🇹',
  'East Germany': '🇩🇪',
  'Other': '🌍',
  'OTHER': '🌍',
}

export const BRAND_COUNTRY_MAP: Record<string, string> = {
  // Japan (JDM)
  'nissan': 'Japan',
  'toyota': 'Japan',
  'honda': 'Japan',
  'mazda': 'Japan',
  'subaru': 'Japan',
  'mitsubishi': 'Japan',
  'suzuki': 'Japan',
  'daihatsu': 'Japan',
  'lexus': 'Japan',
  'acura': 'Japan',
  'infiniti': 'Japan',
  'datsun': 'Japan',
  'isuzu': 'Japan',
  'mitsuoka': 'Japan',
  'hino': 'Japan',
  'komatsu': 'Japan',
  'mugen': 'Japan',
  'greddy': 'Japan',
  'hks': 'Japan',
  'spoon': 'Japan',
  'tomei': 'Japan',
  'nismo': 'Japan',
  'trd': 'Japan',
  'ralliart': 'Japan',
  'sti': 'Japan',

  // Germany
  'bmw': 'Germany',
  'mercedes-benz': 'Germany',
  'mercedes': 'Germany',
  'audi': 'Germany',
  'porsche': 'Germany',
  'volkswagen': 'Germany',
  'vw': 'Germany',
  'opel': 'Germany',
  'jetta': 'Germany',
  'hanomag': 'Germany',
  'kogel': 'Germany',
  'kögel': 'Germany',
  'man': 'Germany',
  'schmitz': 'Germany',
  'schmitz cargobull': 'Germany',
  'alpina': 'Germany',
  'ruf': 'Germany',

  // Italy
  'alfa-romeo': 'Italy',
  'alfa romeo': 'Italy',
  'ferrari': 'Italy',
  'lamborghini': 'Italy',
  'maserati': 'Italy',
  'fiat': 'Italy',
  'lancia': 'Italy',
  'abarth': 'Italy',
  'ducati': 'Italy',
  'pagani': 'Italy',

  // France
  'citroen': 'France',
  'citroën': 'France',
  'peugeot': 'France',
  'renault': 'France',
  'alpine': 'France',
  'bugatti': 'France',
  'ds': 'France',

  // USA
  'ford': 'USA',
  'chevrolet': 'USA',
  'dodge': 'USA',
  'jeep': 'USA',
  'tesla': 'USA',
  'gmc': 'USA',
  'cadillac': 'USA',
  'chrysler': 'USA',
  'buick': 'USA',
  'lincoln': 'USA',
  'pontiac': 'USA',
  'shelby': 'USA',

  // UK
  'aston-martin': 'UK',
  'aston martin': 'UK',
  'bentley': 'UK',
  'jaguar': 'UK',
  'land-rover': 'UK',
  'land rover': 'UK',
  'lotus': 'UK',
  'mclaren': 'UK',
  'mini': 'UK',
  'rolls-royce': 'UK',
  'rolls royce': 'UK',

  // Russia
  'газ': 'Russia',
  'gaz': 'Russia',
  'lada': 'Russia',
  'uaz': 'Russia',
  'vaz': 'Russia',
  'kamaz': 'Russia',

  // Sweden
  'volvo': 'Sweden',
  'saab': 'Sweden',
  'koenigsegg': 'Sweden',
  'scania': 'Sweden',
  'ohlins': 'Sweden',
  'オーリンズ': 'Sweden',

  // South Korea
  'hyundai': 'South Korea',
  'kia': 'South Korea',
  'genesis': 'South Korea',
}

export function resolveBrandCountry(name: string, slug?: string, dbCountry?: string | null): string {
  const normName = name.toLowerCase().trim()
  const normSlug = (slug || '').toLowerCase().trim()

  if (BRAND_COUNTRY_MAP[normSlug]) return BRAND_COUNTRY_MAP[normSlug]
  if (BRAND_COUNTRY_MAP[normName]) return BRAND_COUNTRY_MAP[normName]

  if (dbCountry && dbCountry.trim() && dbCountry.toLowerCase() !== 'other') {
    const formatted = dbCountry.trim()
    const found = Object.keys(COUNTRY_FLAGS).find(
      c => c.toLowerCase() === formatted.toLowerCase()
    )
    if (found) return found.charAt(0).toUpperCase() + found.slice(1).toLowerCase()
    return formatted
  }

  return 'Other'
}

export function getCountryFlag(country: string | null): string {
  if (!country) return '🌍'
  const matched = Object.keys(COUNTRY_FLAGS).find(
    c => c.toLowerCase() === country.toLowerCase().trim()
  )
  return matched ? COUNTRY_FLAGS[matched] : '🌍'
}

export function getCountryDisplayName(country: string | null, t: (key: string) => string): string {
  if (!country) return t('Outros')
  const translated = t(country)
  if (translated && translated !== country) return translated
  const formatted = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
  return t(formatted) || country
}

export function getCountryOrder(country: string | null): number {
  const order = [
    'Japan',
    'Germany',
    'USA',
    'UK',
    'France',
    'Italy',
    'South Korea',
    'China',
    'Sweden',
    'Russia',
    'Spain',
    'Other'
  ]
  if (!country) return 99
  const idx = order.findIndex(c => c.toLowerCase() === country.toLowerCase().trim())
  return idx === -1 ? 50 : idx
}

