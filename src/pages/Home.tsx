import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Search, Shield, Truck, Star, Zap, Wrench, Gauge, Disc } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BRANDS, CATEGORIES } from '../lib/constants'
import { Product } from '../types'
import { useI18n } from '../lib/i18n'

export default function Home() {
  const { t } = useI18n()
  const { data: products } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('*, profiles(name, avatar_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8)
      
      if (error) throw error
      return data as (Product & { profiles: { name: string; avatar_url: string } })[]
    }
  })

  const getCategoryIcon = (icon: string) => {
    const icons: Record<string, React.ReactNode> = {
      Car: <Wrench className="w-6 h-6" />,
      Triangle: <ArrowRight className="w-6 h-6" />,
      Circle: <Gauge className="w-6 h-6" />,
      Disc: <Disc className="w-6 h-6" />,
      ArrowUpDown: <ArrowRight className="w-6 h-6" rotate={90} />,
      Cylinder: <Zap className="w-6 h-6" />,
      Wind: <Zap className="w-6 h-6" />,
      Armchair: <Wrench className="w-6 h-6" />,
      Lightbulb: <Zap className="w-6 h-6" />,
      Waves: <Zap className="w-6 h-6" />,
      Zap: <Zap className="w-6 h-6" />,
      Thermometer: <Zap className="w-6 h-6" />,
      Cpu: <Zap className="w-6 h-6" />,
      Gear: <Wrench className="w-6 h-6" />,
      Fuel: <Zap className="w-6 h-6" />
    }
    return icons[icon] || <Wrench className="w-6 h-6" />
  }

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/10 via-transparent to-[#ff0000]/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-[#ffd700]/20 border border-[#ffd700]/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-[#ffd700]" />
              <span className="text-[#b8860b] text-sm font-medium"> marketplace JDM #1 do Brasil</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('Encontre as melhores')} {' '}
              <span className="text-gradient">peças JDM</span>
              <br />{t('para seu carro')}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-xl">
              {t('O maior marketplace de peças automotivas japonesas do Brasil')}
              {t('Qualidade garantida, entrega rápida e segurança total')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center space-x-2 bg-[#ffd700] hover:bg-[#e6c200] text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
              >
                <Search className="w-5 h-5" />
                <span>{t('Explorar Catálogo')}</span>
              </Link>
              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center space-x-2 bg-white border-2 border-[#ffd700] text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:bg-[#ffd700]"
              >
                <span>{t('Vender Peças')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center space-x-8 mt-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">5000+</p>
                <p className="text-gray-600 text-sm">{t('Peças à venda')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">500+</p>
                <p className="text-gray-600 text-sm">{t('Vendedores')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">98%</p>
                <p className="text-gray-600 text-sm">{t('Satisfação')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-4">
            Categorias
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Encontre exatamente o que precisa para seu projeto
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="bg-white p-6 text-center rounded-xl shadow-md hover:shadow-lg hover:border-[#ffd700] border-2 border-transparent transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#ffd700]/10 flex items-center justify-center text-[#ffd700] group-hover:bg-[#ffd700] group-hover:text-white transition-colors">
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 className="text-gray-900 font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-4">
            Marcas Disponíveis
          </h2>
          <p className="text-gray-600 text-center mb-12">
            As melhores marcas japonesas em um só lugar
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to={`/catalog?brand=${brand.id}`}
                className="bg-white p-6 text-center rounded-xl shadow-md hover:shadow-lg hover:border-[#ffd700] border-2 border-transparent transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gradient">{brand.name[0]}</span>
                </div>
                <h3 className="text-gray-900 font-medium hover:text-[#ffd700] transition-colors">
                  {brand.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1">{brand.models.length} modelos</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-3xl font-bold text-gray-900">
                  Últimas Novidades
                </h2>
                <p className="text-gray-600 mt-2">
                  As peças mais recentes adicionadas ao catálogo
                </p>
              </div>
              <Link
                to="/catalog"
                className="text-[#ffd700] hover:text-[#e6c200] flex items-center space-x-2 transition-colors font-medium"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:border-[#ffd700] border-2 border-transparent transition-all"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Wrench className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge">
                        {product.condition === 'new' ? 'Novo' : product.condition === 'used' ? 'Usado' : 'Reformado'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold mb-2 truncate hover:text-[#ffd700] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {product.brand} {product.model}
                    </p>
                    <p className="text-[#ffd700] font-bold text-xl">
                      R$ {product.price.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 text-center rounded-xl shadow-md border-2 border-transparent hover:border-[#ffd700] transition-all">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#ffd700]" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Compra Segura</h3>
              <p className="text-gray-600">
                Proteção total para suas compras com garantia de entrega e devolução.
              </p>
            </div>
            <div className="bg-white p-8 text-center rounded-xl shadow-md border-2 border-transparent hover:border-[#ffd700] transition-all">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff0000]/20 flex items-center justify-center">
                <Truck className="w-8 h-8 text-[#ff0000]" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">
                Envio para todo Brasil com rastreamento em tempo real.
              </p>
            </div>
            <div className="bg-white p-8 text-center rounded-xl shadow-md border-2 border-transparent hover:border-[#ffd700] transition-all">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                <Star className="w-8 h-8 text-[#ffd700]" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Qualidade Garantida</h3>
              <p className="text-gray-600">
                Peças originais e de procedência com verificação de autenticidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#ffd700] to-[#ff0000]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Pronto para vender suas peças?
          </h2>
          <p className="text-white/80 text-xl mb-8">
            Junte-se a milhares de vendedores e alcance milhões de compradores!
          </p>
          <Link
            to="/create-listing"
            className="inline-block bg-white text-[#ffd700] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Começar a Vender
          </Link>
        </div>
      </section>
    </div>
  )
}