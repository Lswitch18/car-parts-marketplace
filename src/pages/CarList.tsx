import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Compass, Globe, Sparkles, ArrowRight, Shield } from 'lucide-react'

interface CarModel {
  name: string
  brand: string
  brandId: string
  category: 'esportivos' | 'suvs' | 'sedans' | 'eletricos'
  origin: 'japao' | 'europa' | 'eua' | 'china'
  yearRange: string
  description: string
  glowColor: string
}

const CARS_DATA: CarModel[] = [
  // JAPÃO
  {
    name: 'Skyline GT-R R34',
    brand: 'Nissan',
    brandId: 'nissan',
    category: 'esportivos',
    origin: 'japao',
    yearRange: '1999 - 2002',
    description: 'O lendário Godzilla JDM, famoso por seu motor RB26DETT e tração ATTESA E-TS.',
    glowColor: 'from-[#00e5ff] to-[#004d40]'
  },
  {
    name: 'Supra MK4',
    brand: 'Toyota',
    brandId: 'toyota',
    category: 'esportivos',
    origin: 'japao',
    yearRange: '1993 - 2002',
    description: 'Ícone da cultura JDM com o indestrutível motor 2JZ-GTE biturbo.',
    glowColor: 'from-[#ff3d00] to-[#3e2723]'
  },
  {
    name: 'Civic Type R FL5',
    brand: 'Honda',
    brandId: 'honda',
    category: 'esportivos',
    origin: 'japao',
    yearRange: '2022 - Presente',
    description: 'O rei da tração dianteira refinado para pistas com motor K20C1 turbo.',
    glowColor: 'from-[#ff1744] to-[#263238]'
  },
  {
    name: 'Land Cruiser 300',
    brand: 'Toyota',
    brandId: 'toyota',
    category: 'suvs',
    origin: 'japao',
    yearRange: '2021 - Presente',
    description: 'SUV de luxo supremo com capacidade off-road lendária e extrema robustez.',
    glowColor: 'from-[#ffd600] to-[#ffd600]/20'
  },
  {
    name: 'Forester STI',
    brand: 'Subaru',
    brandId: 'subaru',
    category: 'suvs',
    origin: 'japao',
    yearRange: '2004 - 2008',
    description: 'O crossover off-road com o DNA de rally do WRX STI.',
    glowColor: 'from-[#2979ff] to-[#2979ff]/20'
  },
  // EUROPA
  {
    name: '911 GT3 (992)',
    brand: 'Porsche',
    brandId: 'porsche',
    category: 'esportivos',
    origin: 'europa',
    yearRange: '2021 - Presente',
    description: 'Motor boxer aspirado de 4.0L e engenharia precisa de Weissach.',
    glowColor: 'from-[#ff6d00] to-[#ff6d00]/20'
  },
  {
    name: 'RS6 Avant',
    brand: 'Audi',
    brandId: 'audi',
    category: 'sedans',
    origin: 'europa',
    yearRange: '2020 - Presente',
    description: 'Super perua familiar com motor V8 biturbo e tração integral Quattro.',
    glowColor: 'from-[#d500f9] to-[#d500f9]/20'
  },
  {
    name: 'M3 Competition',
    brand: 'BMW',
    brandId: 'bmw',
    category: 'sedans',
    origin: 'europa',
    yearRange: '2021 - Presente',
    description: 'Sedan esportivo definitivo com motor S58 biturbo de 510 cv.',
    glowColor: 'from-[#2979ff] to-[#2979ff]/20'
  },
  {
    name: 'Cayenne Coupe',
    brand: 'Porsche',
    brandId: 'porsche',
    category: 'suvs',
    origin: 'europa',
    yearRange: '2019 - Presente',
    description: 'SUV com dinâmica de esportivo e silhueta coupé refinada.',
    glowColor: 'from-[#ff6d00] to-[#3e2723]'
  },
  // EUA / TESLA
  {
    name: 'Model S Plaid',
    brand: 'Tesla',
    brandId: 'tesla',
    category: 'eletricos',
    origin: 'eua',
    yearRange: '2021 - Presente',
    description: 'Hyper-sedan elétrico com aceleração de 0-100 km/h em 2.1 segundos e 1020 cv.',
    glowColor: 'from-[#00e5ff] to-[#1a237e]'
  },
  {
    name: 'Model Y',
    brand: 'Tesla',
    brandId: 'tesla',
    category: 'eletricos',
    origin: 'eua',
    yearRange: '2020 - Presente',
    description: 'O SUV elétrico mais vendido do mundo, combinando autonomia e segurança.',
    glowColor: 'from-[#00e5ff] to-[#006064]'
  },
  {
    name: 'Cybertruck',
    brand: 'Tesla',
    brandId: 'tesla',
    category: 'eletricos',
    origin: 'eua',
    yearRange: '2023 - Presente',
    description: 'Design exoesquelético poligonal de aço inoxidável e potência absurda.',
    glowColor: 'from-[#cfd8dc] to-[#37474f]'
  },
  // CHINA
  {
    name: 'Seal',
    brand: 'BYD',
    brandId: 'byd',
    category: 'eletricos',
    origin: 'china',
    yearRange: '2022 - Presente',
    description: 'Sedan elétrico de alta tecnologia baseado na e-Platform 3.0.',
    glowColor: 'from-[#00e676] to-[#1b5e20]'
  },
  {
    name: 'Han EV',
    brand: 'BYD',
    brandId: 'byd',
    category: 'eletricos',
    origin: 'china',
    yearRange: '2020 - Presente',
    description: 'Sedan de luxo elétrico com baterias Blade e refinamento premium.',
    glowColor: 'from-[#00e676] to-[#0d5302]'
  },
  {
    name: '001 FR',
    brand: 'Zeekr',
    brandId: 'zeekr',
    category: 'eletricos',
    origin: 'china',
    yearRange: '2023 - Presente',
    description: 'Shooting brake elétrico de altíssima performance com 1265 cv.',
    glowColor: 'from-[#ff1744] to-[#4a0e17]'
  },
  {
    name: 'ES8 Ultra',
    brand: 'NIO',
    brandId: 'nio',
    category: 'suvs',
    origin: 'china',
    yearRange: '2018 - Presente',
    description: 'SUV elétrico inteligente com suporte a troca de baterias rápida (Battery Swap).',
    glowColor: 'from-[#00b0ff] to-[#006064]'
  }
]

export default function CarList() {
  const [activeCategory, setActiveCategory] = useState<string>('todos')
  const [activeOrigin, setActiveOrigin] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCars = CARS_DATA.filter((car) => {
    const matchesCategory = activeCategory === 'todos' || car.category === activeCategory
    const matchesOrigin = activeOrigin === 'todos' || car.origin === activeOrigin
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesOrigin && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-[#ff3d00]/10 to-[#00e5ff]/10 rounded-full blur-3xl -z-10" />
          <span className="bg-[#ff3d00]/10 text-[#ff3d00] border border-[#ff3d00]/20 text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Compatibilidade de Veículos
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Selecione seu Modelo de Carro
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Explore modelos conhecidos do Japão, Europa, EUA (Tesla) e China organizados por categorias. Encontre as peças corretas para seu veículo.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#ff3d00] focus:ring-1 focus:ring-[#ff3d00] outline-none transition-all text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-[#00e5ff]" />
              <span>Garantia de encaixe JDM para peças oficiais</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Origin Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mr-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Origem:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'japao', label: 'Japão (JDM)' },
                { id: 'europa', label: 'Europa' },
                { id: 'eua', label: 'EUA (Tesla)' },
                { id: 'china', label: 'China EV' }
              ].map((origin) => (
                <button
                  key={origin.id}
                  onClick={() => setActiveOrigin(origin.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeOrigin === origin.id
                      ? 'bg-[#ff3d00] text-white border-[#ff3d00] shadow-md shadow-[#ff3d00]/10'
                      : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-gray-600'
                  }`}
                >
                  {origin.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mr-2 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Estilo:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'esportivos', label: 'Esportivos' },
                { id: 'suvs', label: 'SUVs & Off-road' },
                { id: 'sedans', label: 'Sedans' },
                { id: 'eletricos', label: 'Elétricos / EV' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeCategory === category.id
                      ? 'bg-[#00e5ff] text-[#0a0a0a] border-[#00e5ff] shadow-md shadow-[#00e5ff]/10'
                      : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Car Models Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <div
                key={car.name}
                className="group relative bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden hover:border-[#ff3d00]/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Car Card Decorator */}
                <div className="h-28 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center border-b border-[#1f1f1f]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${car.glowColor} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#121212_100%)]" />
                  
                  {/* Decorative Car Wireframe Silhouette */}
                  <span className="text-white/10 font-display text-4xl font-extrabold uppercase select-none tracking-widest group-hover:scale-105 transition-transform duration-300">
                    {car.brand}
                  </span>
                  
                  <div className="absolute bottom-2 left-3 flex gap-1">
                    <span className="bg-black/60 text-[9px] font-bold uppercase tracking-wider text-gray-300 px-2 py-0.5 rounded">
                      {car.origin === 'japao' ? '🇯🇵 JDM' : car.origin === 'europa' ? '🇪🇺 EUR' : car.origin === 'eua' ? '🇺🇸 USA' : '🇨🇳 CHN'}
                    </span>
                    <span className="bg-[#ff3d00]/20 text-[#ff3d00] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#ff3d00]/30">
                      {car.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{car.brand}</span>
                      <span>{car.yearRange}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-[#ff3d00] transition-colors">
                      {car.name}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {car.description}
                    </p>
                  </div>

                  <Link
                    to={`/catalog?search=${car.name.split(' ')[0]}`}
                    className="w-full bg-[#1c1c1c] hover:bg-[#ff3d00] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all group-hover:shadow-lg group-hover:shadow-[#ff3d00]/10 border border-[#2a2a2a] group-hover:border-[#ff3d00]"
                  >
                    <span>Ver Peças Compatíveis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#121212] border border-[#1f1f1f] rounded-2xl">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum carro atende aos filtros aplicados.</p>
            <button
              onClick={() => {
                setActiveCategory('todos')
                setActiveOrigin('todos')
                setSearchTerm('')
              }}
              className="text-[#ff3d00] hover:underline text-sm mt-2"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
