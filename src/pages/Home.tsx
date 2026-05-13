import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Search, Shield, Truck, Star, Zap, Wrench, Gauge, Disc } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BRANDS, CATEGORIES } from '../lib/constants'
import { useI18n } from '../lib/i18n'

export default function Home() {
  const { t } = useI18n()
  const { data: products } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name), profiles(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8)
      
      if (error) throw error
      return data || []
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
    <div className="bg-background min-h-screen text-text">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-daig-blue/10 via-transparent to-daig-purple/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(13, 117, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(112, 0, 255, 0.1) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-daig-blue/20 border border-daig-blue/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-daig-cyan" />
              <span className="text-daig-cyan text-sm font-medium">{t('DAIG - A plataforma definitiva para compra e venda')}</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-text mb-6 leading-tight">
              {t('Encontre com facilidade as melhores')} <span className="neon-text">peças</span>
              <br />{t('para seu carro')}
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-xl">
              {t('O maior marketplace de peças automotivas do Japão')}<br />
              {t('Qualidade garantida, entrega rápida em todo o Japão e segurança total')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center space-x-2 bg-daig-blue hover:bg-daig-blue/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-[0_0_15px_rgba(13,117,255,0.5)]"
              >
                <Search className="w-5 h-5" />
                <span>{t('Explorar Catálogo')}</span>
              </Link>
              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center space-x-2 bg-surface border-2 border-daig-blue text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:bg-daig-blue/10"
              >
                <span>{t('Vender Peças')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center space-x-8 mt-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">5000+</p>
                <p className="text-text-secondary text-sm">{t('Peças à venda')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-text-secondary text-sm">{t('Vendedores')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-text-secondary text-sm">{t('Satisfação')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-4">
            Categorias
          </h2>
          <p className="text-text-secondary text-center mb-12">
            Encontre exatamente o que precisa para seu projeto
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="bg-background p-6 text-center rounded-xl shadow-md hover:shadow-lg hover:border-daig-blue border border-border transition-all group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-daig-blue/10 flex items-center justify-center text-daig-blue group-hover:bg-daig-blue group-hover:text-white transition-colors shadow-[0_0_10px_rgba(13,117,255,0.2)]">
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 className="text-white font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-4">
            Marcas Disponíveis
          </h2>
          <p className="text-text-secondary text-center mb-12">
            As melhores marcas automotivas em um só lugar
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to={`/catalog?brand=${brand.id}`}
                className="bg-surface p-6 text-center rounded-xl shadow-md hover:shadow-lg hover:border-daig-blue border border-border transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-background flex items-center justify-center border border-border/50 group-hover:border-daig-blue/50">
                  <span className="text-2xl font-bold neon-text">{brand.name[0]}</span>
                </div>
                <h3 className="text-white font-medium hover:text-daig-blue transition-colors">
                  {brand.name}
                </h3>
                <p className="text-text-secondary text-xs mt-1">{brand.models.length} modelos</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-20 bg-surface border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-3xl font-bold text-white">
                  Últimas Novidades
                </h2>
                <p className="text-text-secondary mt-2">
                  As peças mais recentes adicionadas ao catálogo
                </p>
              </div>
              <Link
                to="/catalog"
                className="text-daig-blue hover:text-daig-cyan flex items-center space-x-2 transition-colors font-medium"
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
                  className="bg-background rounded-xl shadow-md overflow-hidden hover:shadow-[0_0_15px_rgba(13,117,255,0.3)] border border-border hover:border-daig-blue transition-all group"
                >
                  <div className="aspect-square bg-surface relative overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <Wrench className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-daig-blue text-white text-xs font-bold px-2 py-1 rounded">
                        {product.condition === 'new' ? 'Novo' : product.condition === 'used' ? 'Usado' : 'Reformado'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 truncate group-hover:text-daig-blue transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-2">
                      {product.brand} {product.model}
                    </p>
                    <p className="text-daig-cyan font-bold text-xl">
                      ¥ {product.price.toLocaleString('ja-JP')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 text-center rounded-xl shadow-md border border-border hover:border-daig-purple transition-all group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-daig-purple/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-all">
                <Shield className="w-8 h-8 text-daig-purple" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Compra Segura</h3>
              <p className="text-text-secondary">
                Proteção total para suas compras com garantia de entrega e devolução.
              </p>
            </div>
            <div className="bg-surface p-8 text-center rounded-xl shadow-md border border-border hover:border-daig-cyan transition-all group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-daig-cyan/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all">
                <Truck className="w-8 h-8 text-daig-cyan" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Entrega Rápida</h3>
              <p className="text-text-secondary">
                {t('Envio para todo Japão com rastreamento em tempo real')}
              </p>
            </div>
            <div className="bg-surface p-8 text-center rounded-xl shadow-md border border-border hover:border-daig-blue transition-all group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-daig-blue/20 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(13,117,255,0.4)] transition-all">
                <Star className="w-8 h-8 text-daig-blue" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Qualidade Garantida</h3>
              <p className="text-text-secondary">
                Peças originais e de procedência com verificação de autenticidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-daig-blue/20 to-daig-purple/20" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Pronto para vender suas peças?
          </h2>
          <p className="text-text-secondary text-xl mb-8">
            Junte-se a milhares de vendedores e alcance milhões de compradores na DAIG!
          </p>
          <Link
            to="/create-listing"
            className="inline-block bg-daig-blue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-daig-blue/80 transition-colors shadow-[0_0_15px_rgba(13,117,255,0.5)]"
          >
            Começar a Vender
          </Link>
        </div>
      </section>

      {/* Marquee de Marcas - Watermark Style */}
      <section className="py-12 bg-background border-t border-border overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex w-[200%] animate-marquee">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div key={`${brand.id}-${i}`} className="flex-1 flex justify-center items-center px-8 opacity-20 hover:opacity-50 transition-opacity grayscale">
              <span className="font-display font-bold text-3xl md:text-5xl text-white tracking-widest uppercase whitespace-nowrap">
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        `}</style>
      </section>
    </div>
  )
}