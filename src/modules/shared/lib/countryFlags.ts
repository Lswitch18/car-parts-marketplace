export const COUNTRY_FLAGS: Record<string, string> = {
  'Japan': '🇯🇵',
  'Germany': '🇩🇪',
  'USA': '🇺🇸',
  'UK': '🇬🇧',
  'France': '🇫🇷',
  'Italy': '🇮🇹',
  'South Korea': '🇰🇷',
  'China': '🇨🇳',
  'Sweden': '🇸🇪',
  'Czech Republic': '🇨🇿',
  'Spain': '🇪🇸',
  'Russia': '🇷🇺',
  'India': '🇮🇳',
  'Netherlands': '🇳🇱',
  'Malaysia': '🇲🇾',
  'Romania': '🇷🇴',
  'Austria': '🇦🇹',
  'East Germany': '🇩🇪',
}

export function getCountryFlag(country: string | null): string {
  if (!country) return '🌍'
  return COUNTRY_FLAGS[country] || '🌍'
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
  ]
  if (!country) return 99
  const idx = order.indexOf(country)
  return idx === -1 ? 50 : idx
}
