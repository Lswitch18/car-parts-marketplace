export const JP_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Tóquio': { lat: 35.6762, lng: 139.6503 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Yokohama': { lat: 35.4437, lng: 139.6380 },
  'Osaka': { lat: 34.6937, lng: 135.5023 },
  'Nagoya': { lat: 35.1815, lng: 136.9066 },
  'Sapporo': { lat: 43.0618, lng: 141.3545 },
  'Fukuoka': { lat: 33.5904, lng: 130.4017 },
  'Kobe': { lat: 34.6901, lng: 135.1955 },
  'Kyoto': { lat: 35.0116, lng: 135.7681 },
  'Hiroshima': { lat: 34.3853, lng: 132.4553 },
  'Fuji': { lat: 35.1614, lng: 138.6763 },
  'Shizuoka': { lat: 34.9756, lng: 138.3828 },
  'Mitaka': { lat: 35.6835, lng: 139.5595 },
  'Chiba': { lat: 35.6073, lng: 140.1063 },
  'Gifu': { lat: 35.4233, lng: 136.7606 },
  'Kanagawa': { lat: 35.4478, lng: 139.6425 },
};

export function getCityCoords(cidade: string, estado: string): { lat: number; lng: number } {
  return JP_CITY_COORDS[cidade] || JP_CITY_COORDS[estado] || { lat: 35.6762, lng: 139.6503 };
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function sortByDistance<T extends { destino_cidade?: string; destino_estado?: string }>(
  items: T[],
): Promise<T[]> {
  const pos = await getCurrentPositionSafe();
  if (!pos) return items;

  return [...items].sort((a, b) => {
    const ca = getCityCoords(a.destino_cidade || '', a.destino_estado || '');
    const cb = getCityCoords(b.destino_cidade || '', b.destino_estado || '');
    return haversineKm(pos.latitude, pos.longitude, ca.lat, ca.lng) -
      haversineKm(pos.latitude, pos.longitude, cb.lat, cb.lng);
  });
}

async function getCurrentPositionSafe(): Promise<{ latitude: number; longitude: number } | null> {
  if (!navigator.geolocation) return null;
  try {
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 120000 },
      );
    });
  } catch {
    return null;
  }
}
