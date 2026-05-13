export const BRANDS = [
  {
    id: 'nissan',
    name: 'Nissan',
    models: ['GT-R', 'Skyline', 'Silvia', 'Fairlady Z', '350Z', '370Z', 'Altima', 'Sentra']
  },
  {
    id: 'toyota',
    name: 'Toyota',
    models: ['Supra', 'AE86', 'GT86', 'GR86', 'MR2', 'Celica', 'Land Cruiser', 'GR Corolla']
  },
  {
    id: 'honda',
    name: 'Honda',
    models: ['NSX', 'S2000', 'Civic Type R', 'Integra', 'Accord', 'Prelude', 'CR-Z']
  },
  {
    id: 'mazda',
    name: 'Mazda',
    models: ['RX-7', 'RX-8', 'MX-5', 'Miata', 'Mazda3', 'Mazda6']
  },
  {
    id: 'subaru',
    name: 'Subaru',
    models: ['WRX STI', 'WRX', 'BRZ', 'Impreza', 'Legacy', 'Forester']
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    models: ['Lancer Evo', 'Lancer', 'FTO', '3000GT', 'Eclipse', 'Pajero']
  },
  {
    id: 'lexus',
    name: 'Lexus',
    models: ['LFA', 'RC F', 'GS F', 'IS F', 'LC', 'LS', 'NX', 'RX']
  },
  {
    id: 'acura',
    name: 'Acura',
    models: ['NSX', 'Integra Type R', 'RLX', 'TLX', 'RDX']
  },
  {
    id: 'infiniti',
    name: 'Infiniti',
    models: ['G35', 'G37', 'Q60', 'Q50', 'FX', 'QX']
  },
  {
    id: 'porsche',
    name: 'Porsche',
    models: ['911', 'Cayman', 'Boxster', 'Panamera', 'Macan', 'Cayenne']
  },
  {
    id: 'bmw',
    name: 'BMW',
    models: ['M3', 'M4', 'M5', '3 Series', '5 Series', 'X5', 'Z4']
  },
  {
    id: 'audi',
    name: 'Audi',
    models: ['RS3', 'RS6', 'R8', 'A4', 'A6', 'Q5', 'TT']
  }
]

export const CATEGORIES = [
  { id: 'body-kits', name: 'Body Kits', icon: 'Car' },
  { id: 'wings-spoilers', name: 'Wings & Spoilers', icon: 'Triangle' },
  { id: 'wheels', name: 'Wheels & Rims', icon: 'Circle' },
  { id: 'brakes', name: 'Brakes', icon: 'Disc' },
  { id: 'suspension', name: 'Suspension', icon: 'ArrowUpDown' },
  { id: 'engine', name: 'Engine', icon: 'Cylinder' },
  { id: 'exhaust', name: 'Exhaust', icon: 'Wind' },
  { id: 'interior', name: 'Interior', icon: 'Armchair' },
  { id: 'lighting', name: 'Lighting', icon: 'Lightbulb' },
  { id: 'aero', name: 'Aero', icon: 'Waves' },
  { id: 'turbo', name: 'Turbo & Boost', icon: 'Zap' },
  { id: 'cooling', name: 'Cooling', icon: 'Thermometer' },
  { id: 'electronics', name: 'Electronics', icon: 'Cpu' },
  { id: 'transmission', name: 'Transmission', icon: 'Gear' },
  { id: 'fuel', name: 'Fuel System', icon: 'Fuel' }
]

export const CONDITIONS = [
  { id: 'new', label: 'Novo', description: 'Produto novo, na embalagem original' },
  { id: 'used', label: 'Usado', description: 'Produto usado, em boas condições' },
  { id: 'refurbished', label: 'Reformado', description: 'Produto revisado e reformado' }
]

export const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i)

export const BRAND_UUIDS: Record<string, string> = {
  nissan: '11111111-1111-1111-1111-111111111111',
  toyota: '22222222-2222-2222-2222-222222222222',
  honda: '33333333-3333-3333-3333-333333333333',
  mazda: '44444444-4444-4444-4444-444444444444',
  subaru: '55555555-5555-5555-5555-555555555555',
  mitsubishi: '66666666-6666-6666-6666-666666666666',
  lexus: '77777777-7777-7777-7777-777777777777',
  acura: '88888888-8888-8888-8888-888888888888',
  infiniti: '99999999-9999-9999-9999-999999999999',
}

export const UUID_TO_BRAND: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_UUIDS).map(([slug, uuid]) => [uuid, slug])
)