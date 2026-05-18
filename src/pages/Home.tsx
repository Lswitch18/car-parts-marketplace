import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowRight, Search, Shield, Truck, Star, Zap, Wrench, Gauge, Disc,
  Sliders, ShieldCheck, Play, Pause, RotateCcw, Compass, Layers, 
  Palette, Eye, Award
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BRANDS, CATEGORIES } from '../lib/constants'
import { useI18n } from '../lib/i18n'
import MotionFrameScene from '../components/MotionFrameScene'

export default function Home() {
  const { t } = useI18n()

  // 3D Motion Frame states
  const [speed, setSpeed] = useState<number>(1.2);
  const [distortion, setDistortion] = useState<number>(1.0);
  const [glow, setGlow] = useState<number>(1.5);
  const [colorTheme, setColorTheme] = useState<'blue' | 'purple' | 'cyan'>('purple');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const skills = [
    { name: 'Modelagem 3D Avançada (Hard Surface & Organic)', level: 98, desc: 'Topologia limpa, otimização de malha e design de alta fidelidade para web.' },
    { name: 'Motion Graphics & Dinâmicas de Fluidos', level: 95, desc: 'Animações fluidas de quadros, simulações físicas e interpolações complexas.' },
    { name: 'WebGL, Three.js & Custom Shaders', level: 93, desc: 'Programação de Shaders GLSL, otimização de render e integração com React.' },
    { name: 'Iluminação Realista & PBR Texturing', level: 96, desc: 'Mapas de textura PBR de alta resolução, iluminação de estúdio física e volumétrica.' }
  ];

  const handleReset3D = () => {
    setSpeed(1.2);
    setDistortion(1.0);
    setGlow(1.5);
    setColorTheme('purple');
    setWireframe(false);
    setIsPlaying(true);
  };

  const getThemeColorClass = () => {
    if (colorTheme === 'blue') return 'from-[#0D75FF] to-[#00E5FF]';
    if (colorTheme === 'purple') return 'from-[#7000FF] to-[#FF007A]';
    return 'from-[#00E5FF] to-[#00D97E]';
  };

  const getThemeTextClass = () => {
    if (colorTheme === 'blue') return 'text-[#0D75FF]';
    if (colorTheme === 'purple') return 'text-[#7000FF]';
    return 'text-[#00E5FF]';
  };

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

      {/* 3D DESIGN SPECIALIST - MOTION FRAME SHOWCASE SECTION */}
      <section className="py-24 bg-background relative overflow-hidden border-t border-border/50">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7000FF]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#7000FF]/25 to-[#0D75FF]/25 border border-[#7000FF]/40 rounded-full px-4 py-1.5 mb-6">
              <Award className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-purple-300 text-xs font-semibold tracking-wider uppercase">{t('Especialidade em Design 3D & WebGL')}</span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('Interativo')} <span className="neon-text-purple">Motion Frame</span> 3D
            </h2>
            
            <p className="text-lg text-text-secondary font-light">
              {t('Explore a manipulação geométrica em tempo real com nosso motor WebGL de alta performance. Ajuste os parâmetros de rotação, shaders e emissão da moldura abaixo.')}
            </p>
          </div>

          {/* Core Interactive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 3D Canvas Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="card p-4 relative overflow-hidden border border-white/5 bg-[#07070f]/90 backdrop-blur-xl rounded-2xl shadow-2xl">
                
                {/* Floating telemetry */}
                <div className="absolute top-6 left-6 z-20 flex items-center space-x-2 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/10 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span>Render Ativo</span>
                  </span>
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] uppercase font-bold tracking-wider text-gray-300 border border-white/10">
                    WebGL 2.0
                  </span>
                </div>
                
                <div className="absolute top-6 right-6 z-20 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-gray-400 border border-white/10 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>{t('Orbitar')}</span>
                  </span>
                </div>

                {/* 3D Scene */}
                <div className="h-[400px] md:h-[500px] w-full relative">
                  <MotionFrameScene 
                    speed={isPlaying ? speed : 0} 
                    distortion={distortion} 
                    glow={glow} 
                    colorTheme={colorTheme}
                    wireframe={wireframe}
                  />
                </div>

                {/* Bottom Quick Controls */}
                <div className="flex items-center justify-between mt-4 px-2 border-t border-white/5 pt-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 text-gray-300 hover:text-white"
                      title={isPlaying ? 'Pausar animação' : 'Iniciar animação'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleReset3D}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 text-gray-300 hover:text-white"
                      title="Resetar parâmetros"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Vertices: 3.6K | Triangles: 7.2K | 60FPS
                  </div>
                </div>

              </div>

              {/* Practical WMS Integration Banner */}
              <div className="card p-6 border border-[#7000FF]/25 bg-gradient-to-r from-[#7000FF]/5 via-[#0D75FF]/5 to-transparent backdrop-blur-md rounded-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-[#7000FF]/20 to-[#0D75FF]/20 border border-[#7000FF]/30 rounded-2xl flex-shrink-0">
                  <Layers className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{t('Caso de Uso Real: Logistix WMS')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t('Esta tecnologia de modelagem e shaders foi implementada diretamente no módulo')} <Link to="/admin" className="text-purple-400 hover:underline font-semibold">{t('Armazém 3D')}</Link>, 
                    {t(' fornecendo renderizações em tempo real e monitoramento volumétrico das zonas de armazenamento e prateleiras de peças.')}
                  </p>
                </div>
              </div>

            </div>

            {/* Customization & Specs Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Sliders Control Panel */}
              <div className="card p-6 bg-[#07070f]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-2.5 mb-6 border-b border-white/5 pb-4">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold">{t('Ajustes do Renderizador')}</h2>
                </div>

                <div className="space-y-5">
                  {/* Colors */}
                  <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2.5 flex items-center space-x-1.5">
                      <Palette className="w-4 h-4" />
                      <span>{t('Paleta de Cor')}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['purple', 'blue', 'cyan'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setColorTheme(theme)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all hover:scale-102 active:scale-98 ${
                            colorTheme === theme
                              ? `bg-gradient-to-r ${getThemeColorClass()} text-black border-transparent shadow-lg font-bold`
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          {theme === 'purple' ? 'Void Purple' : theme === 'blue' ? 'Neon Blue' : 'Cyber Cyan'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t('Velocidade de Rotação')}</span>
                      <span className="text-xs text-purple-400 font-mono font-bold">{speed.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3.0" 
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7000FF]"
                    />
                  </div>

                  {/* Noise */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t('Distorção Geométrica')}</span>
                      <span className="text-xs text-cyan-400 font-mono font-bold">{distortion.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="2.5" 
                      step="0.1"
                      value={distortion}
                      onChange={(e) => setDistortion(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    />
                  </div>

                  {/* Glow */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t('Brilho Emissivo')}</span>
                      <span className="text-xs text-pink-500 font-mono font-bold">{(glow * 10).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3.0" 
                      step="0.1"
                      value={glow}
                      onChange={(e) => setGlow(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF007A]"
                    />
                  </div>

                  {/* Wireframe */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span>{t('Malha Estrutural (Wireframe)')}</span>
                    </span>
                    <button
                      onClick={() => setWireframe(!wireframe)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                        wireframe ? 'bg-gradient-to-r ' + getThemeColorClass() : 'bg-white/10'
                      }`}
                    >
                      <div 
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          wireframe ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                </div>
              </div>

              {/* Specialist Skill levels */}
              <div className="card p-6 bg-[#07070f]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-2.5 mb-6 border-b border-white/5 pb-4">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-bold">{t('Métricas de Especialidade 3D')}</h2>
                </div>

                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-200">{skill.name}</span>
                        <span className={`text-sm font-bold font-mono ${getThemeTextClass()}`}>{skill.level}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full bg-gradient-to-r ${getThemeColorClass()} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(13,117,255,0.4)]`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-light">{skill.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

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