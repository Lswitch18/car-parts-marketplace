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