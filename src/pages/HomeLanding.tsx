import { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { 
  ArrowRight, Cpu, Award, Zap, Layers
} from 'lucide-react';
import ExplodedCarScene from '../components/ExplodedCarScene';


// Highlight hotspots on the exploded model
const COMPONENT_DETAILS = [
  {
    id: 'engine_block',
    name: 'Bloco do Motor JDM',
    desc: 'Motor 2JZ-GTE modificado. Pistões forjados, cabeçotes polidos e velas de irídio de alto desempenho.',
    price: '¥ 850,000',
    stock: 3,
    condition: 'Refabricado',
    category: 'Motor'
  },
  {
    id: 'hood',
    name: 'Capô de Fibra de Carbono',
    desc: 'Redução drástica de peso (-12kg). Entradas de ar funcionais para refrigeração do radiador e admissão.',
    price: '¥ 120,000',
    stock: 8,
    condition: 'Novo',
    category: 'Carroceria'
  },
  {
    id: 'intake',
    name: 'Coletor de Admissão de Alto Fluxo',
    desc: 'Alumínio usinado em CNC para fluxo ideal de ar/combustível e ganho imediato de potência.',
    price: '¥ 85,000',
    stock: 5,
    condition: 'Novo',
    category: 'Admissão'
  },
  {
    id: 'radiator',
    name: 'Radiador de Alumínio Triple Core',
    desc: 'Capacidade de arrefecimento ampliada em 40%. Colmeia de alta densidade e tampas bilhete.',
    price: '¥ 45,000',
    stock: 12,
    condition: 'Novo',
    category: 'Refrigeração'
  },
  {
    id: 'suspension',
    name: 'Coilovers Reguláveis Neomagnéticos',
    desc: 'Ajuste de altura, pré-carga e amortecimento em 32 níveis. Fluido hidráulico aeroespacial.',
    price: '¥ 180,000',
    stock: 6,
    condition: 'Novo',
    category: 'Suspensão'
  },
  {
    id: 'gearbox',
    name: 'Transmissão Manual de 6 Marchas V160',
    desc: 'Suporta até 1000 WHP. Relações de marcha curtas e engates extremamente precisos.',
    price: '¥ 600,000',
    stock: 2,
    condition: 'Usado',
    category: 'Transmissão'
  }
];

export default function HomeLanding() {

  // Loading States
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'logistix'>('details');

  // Interactive 3D States
  const [scrollPercent, setScrollPercent] = useState(0);
  const [selectedPart, setSelectedPart] = useState(COMPONENT_DETAILS[0]);

  // Simulated cyber logs
  useEffect(() => {
    if (loadingFinished) return;

    const logList = [
      'BOOTING WebGL 2.0 GRAPHICS ARCHITECTURE...',
      'ESTABLISHING SHADER INTEGRITY CONSTRAINTS...',
      'ALLOCATING MEMORY FOR THREEJS BUFFERS...',
      'PARSING EXPLODED GEOMETRIES FROM PUBLIC CACHE...',
      'DECRYPTION OF CHASSIS CHIPS: COMPLETE.',
      'MERGING SUSPENSION VECTORS...',
      'RESOLVING CORE ENGINE GEOMETRY...',
      'SYNCING REDIS TELEMETRY PRE-CACHE SLOT...',
      'ESTABLISHING NEON SHADER INTENSITY [cyan]...',
      'SYSTEM CALIBRATED AND READY FOR DEPLOYMENT.'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logList.length) {
        setLoadingLogs(prev => [...prev, `[SYSTEM] ${logList[logIndex]}`]);
        logIndex++;
      }
    }, 450);

    return () => clearInterval(logInterval);
  }, [loadingFinished]);

  // Loading progress interpolation
  useEffect(() => {
    if (loadingFinished) return;

    const interval = setInterval(() => {
      setDisplayPercent(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoadingFinished(true);
          }, 800);
          return 100;
        }
        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [loadingFinished]);

  // Listen to window scroll to feed scrollPercent into our 3D context
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setScrollPercent(pct);

      // Programmatically update selected hotspot based on active scroll section
      // 0% to 20% -> chassis / JDM intro (motor)
      // 20% to 40% -> suspension
      // 40% to 60% -> radiator or intake
      // 60% to 80% -> engine_block
      // 80% to 100% -> gearbox
      if (pct < 0.20) {
        setSelectedPart(COMPONENT_DETAILS[0]); // Bloco do Motor (fallback)
      } else if (pct >= 0.20 && pct < 0.40) {
        const suspension = COMPONENT_DETAILS.find(p => p.id === 'suspension');
        if (suspension) setSelectedPart(suspension);
      } else if (pct >= 0.40 && pct < 0.60) {
        const radiator = COMPONENT_DETAILS.find(p => p.id === 'radiator') || COMPONENT_DETAILS.find(p => p.id === 'intake');
        if (radiator) setSelectedPart(radiator);
      } else if (pct >= 0.60 && pct < 0.80) {
        const engine = COMPONENT_DETAILS.find(p => p.id === 'engine_block');
        if (engine) setSelectedPart(engine);
      } else {
        const gearbox = COMPONENT_DETAILS.find(p => p.id === 'gearbox');
        if (gearbox) setSelectedPart(gearbox);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set correct position on mount/refresh
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#020205] min-h-screen text-white relative font-sans selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
      
      {/* 1. INTRO PRELOADING OVERLAY (Compre Carregamento) */}
      {!loadingFinished && (
        <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col justify-between p-8 font-mono">
          {/* Top HUD */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-xs uppercase tracking-widest text-[#00E5FF] font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
              DAIG 3D ENGINE CORE v2.8.2
            </span>
            <span className="text-[10px] text-gray-500">
              LOC: /home/lswitch/car-parts-marketplce
            </span>
          </div>

          {/* Center Progress */}
          <div className="max-w-2xl w-full mx-auto space-y-8 my-auto">
            <div className="text-center space-y-3">
              <div className="inline-block p-4 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 animate-pulse">
                <Cpu className="w-12 h-12 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-display">
                Carregando Showroom 3D
              </h2>
              <p className="text-xs text-gray-400 font-light max-w-sm mx-auto">
                Inicializando shaders PBR e compilando a malha do carro explodido para garantir uma experiência de 60FPS sem travamentos.
              </p>
            </div>

            {/* Glowing Loading Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">OBJ GEOMETRY INGESTION</span>
                <span className="text-[#00E5FF] font-bold">{displayPercent}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#00E5FF] via-[#7000FF] to-[#0D75FF] transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.8)]"
                  style={{ width: `${displayPercent}%` }}
                />
              </div>
            </div>

            {/* Terminal Live Output logs */}
            <div className="bg-[#030307] border border-white/5 rounded-xl p-4 h-40 overflow-y-auto text-[10px] text-gray-400 space-y-1.5 scrollbar-thin select-none">
              {loadingLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#7000FF]">&gt;</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-gray-500">
            <span>READY STATE: AWAITING INTERACTIVE RUNTIME</span>
            <span>PRESS SPACE TO EXPEDITE (SIMULATED)</span>
          </div>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#00E5FF]">
              <Award className="w-3.5 h-3.5" />
              Exclusividade DAIG Garage
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Showroom <span className="neon-text">3D Explodido</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-xl font-light">
              Analise cada componente mecânico importado diretamente do Japão. Role a página para ver a desmontagem em tempo real com zoom e rotação sincronizados.
            </p>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 3D PLATFORM VIEWPORT & CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* NARRATIVE SCROLL LAYOUT (Split Screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Storytelling cards (5 cols) */}
          <div className="lg:col-span-5 space-y-12 pb-[10vh]">
            
            {/* Card 1: 0% - 20% */}
            <div className={`p-8 bg-[#07070f] border rounded-3xl shadow-xl transition-all duration-300 ${
              scrollPercent < 0.20 
                ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] scale-102 bg-[#090915]' 
                : 'border-white/5 opacity-40'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-[9px] uppercase font-bold rounded">Estágio 1</span>
                <span className="text-[10px] text-gray-500 font-mono">SCROLL: 0% - 20%</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">Engenharia Integrada JDM</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Inicie a experiência com o modelo automotivo totalmente montado e alinhado na horizontal. Observe a aerodinâmica activa e o chassi projetado no Japão.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#00E5FF] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Visualização Horizontal Ativa
              </div>
            </div>

            {/* Card 2: 20% - 40% */}
            <div className={`p-8 bg-[#07070f] border rounded-3xl shadow-xl transition-all duration-300 ${
              scrollPercent >= 0.20 && scrollPercent < 0.40 
                ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] scale-102 bg-[#090915]' 
                : 'border-white/5 opacity-40'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-[9px] uppercase font-bold rounded">Estágio 2</span>
                <span className="text-[10px] text-gray-500 font-mono">SCROLL: 20% - 40%</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">Suspensão de Alta Performance</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Ao rolar a página, as suspensões neomagnéticas e cubos de roda estendem-se para fora do chassi. Projetadas com 32 regulagens para estabilidade absoluta em curvas sob forças G severas.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Mapeando Coilovers Reguláveis
              </div>
            </div>

            {/* Card 3: 40% - 60% */}
            <div className={`p-8 bg-[#07070f] border rounded-3xl shadow-xl transition-all duration-300 ${
              scrollPercent >= 0.40 && scrollPercent < 0.60 
                ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] scale-102 bg-[#090915]' 
                : 'border-white/5 opacity-40'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-[9px] uppercase font-bold rounded">Estágio 3</span>
                <span className="text-[10px] text-gray-500 font-mono">SCROLL: 40% - 60%</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">Refrigeração & Indução</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                A grade do radiador triplo e o coletor de admissão de alto fluxo sobem, permitindo uma inspeção visual completa da passagem de fluxo de ar. Garantia de motor sempre frio em pista.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#00E5FF] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Inspeção de Radiador e Admissão
              </div>
            </div>

            {/* Card 4: 60% - 80% */}
            <div className={`p-8 bg-[#07070f] border rounded-3xl shadow-xl transition-all duration-300 ${
              scrollPercent >= 0.60 && scrollPercent < 0.80 
                ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] scale-102 bg-[#090915]' 
                : 'border-white/5 opacity-40'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-[9px] uppercase font-bold rounded">Estágio 4</span>
                <span className="text-[10px] text-gray-500 font-mono">SCROLL: 60% - 80%</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">Coração da Máquina: 2JZ-GTE</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                O bloco do motor eleva-se verticalmente para fora do chassis frame. A peça é o motor japonês 2JZ-GTE com pistões forjados e cabeçotes preparados, o ícone de performance JDM.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-pink-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                Módulo de Motor Destacado
              </div>
            </div>

            {/* Card 5: 80% - 100% */}
            <div className={`p-8 bg-[#07070f] border rounded-3xl shadow-xl transition-all duration-300 ${
              scrollPercent >= 0.80 
                ? 'border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.1)] scale-102 bg-[#090915]' 
                : 'border-white/5 opacity-40'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-[9px] uppercase font-bold rounded">Estágio 5</span>
                <span className="text-[10px] text-gray-500 font-mono">SCROLL: 80% - 100%</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">Transmissão e Eixo Cardã</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Na fase de desmontagem final, a transmissão manual V160 de 6 marchas recua. Projetada para suportar torque brutal e transferir potência sem perdas para as rodas traseiras.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-yellow-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Câmbio V160 em Posição de Destaque
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Canvas rendering (7 cols) - MERGES SEAMLESSLY WITHOUT VIDEO FRAME */}
          <div className="lg:col-span-7 sticky top-24 h-[75vh] w-full flex flex-col gap-4">
            <div className="relative flex-1 w-full bg-transparent overflow-hidden">
              
              {/* WebGL Canvas */}
              <Suspense fallback={
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-t-transparent border-[#00E5FF] rounded-full animate-spin" />
                  <span className="font-mono text-xs text-gray-400">CARREGANDO MUNDO JDM 3D...</span>
                </div>
              }>
                <Canvas camera={{ position: [5, 2.5, 5], fov: 45 }} shadows gl={{ antialias: true }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 15, 10]} intensity={1.8} castShadow />
                  <pointLight position={[-10, 10, -10]} intensity={0.8} />

                  <gridHelper args={[35, 35, '#111122', '#06060c']} position={[0, -1.2, 0]} />

                  <ExplodedCarScene 
                    explosionFactor={scrollPercent}
                    colorTheme="cyan"
                    wireframe={false}
                    autoRotate={false}
                    scrollPercent={scrollPercent}
                    interactiveMode="scroll"
                  />

                  <Sparkles 
                    count={180} 
                    scale={[12, 6, 12]} 
                    size={2} 
                    speed={0.4} 
                    color="#00E5FF" 
                  />

                  <OrbitControls 
                    enableDamping 
                    dampingFactor={0.08}
                    minDistance={3}
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 1.6}
                    minPolarAngle={Math.PI / 4}
                  />
                </Canvas>
              </Suspense>
            </div>

            {/* Premium, borderless floating component info */}
            <div className="bg-[#07070f]/85 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
                <div className="text-[10px] font-mono">
                  <span className="text-gray-500 uppercase block">Componente Ativo</span>
                  <span className="text-white font-bold text-xs">{selectedPart.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-500 font-mono block">PREÇO SUGERIDO JDM</span>
                <span className="text-sm font-mono font-bold text-[#00E5FF]">{selectedPart.price}</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. HIGH-CONVERTING CLIENT ACQUISITION MARKETING SECTIONS */}
      <section className="bg-[#05050a] border-y border-white/5 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full filter blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7000FF]/5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[#7000FF] font-mono text-xs uppercase tracking-widest font-bold">POR QUE ESCOLHER A DAIG?</span>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              A Plataforma Automotiva mais <span className="neon-text-purple">Avançada</span> do Mundo
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              Desenvolvida para colecionadores, oficinas de alta performance e revendedores autorizados no Japão. Unimos WebGL 3D, telemetria ultrarrápida com Redis e logística automatizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#07070f] border border-white/5 p-8 rounded-3xl space-y-4 hover:border-[#00E5FF]/40 transition-all hover:scale-102 group">
              <div className="p-4 bg-[#00E5FF]/10 rounded-2xl w-fit border border-[#00E5FF]/20 group-hover:bg-[#00E5FF] group-hover:text-black transition-all">
                <Cpu className="w-8 h-8 text-[#00E5FF] group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Showroom Interativo 3D</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Esqueça fotos 2D estáticas. Na DAIG, você inspeciona a topologia interna e componentes mecânicos explodidos antes de clicar no botão de compra.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#07070f] border border-white/5 p-8 rounded-3xl space-y-4 hover:border-[#7000FF]/40 transition-all hover:scale-102 group">
              <div className="p-4 bg-[#7000FF]/10 rounded-2xl w-fit border border-[#7000FF]/20 group-hover:bg-[#7000FF] group-hover:text-black transition-all">
                <Layers className="w-8 h-8 text-[#7000FF] group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Logistix WMS 3D</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Totalmente integrado com nosso WMS inteligente. Toda peça comprada é automaticamente roteada em tempo real pelas maiores transportadoras japonesas (Yamato/Sagawa).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#07070f] border border-white/5 p-8 rounded-3xl space-y-4 hover:border-[#0D75FF]/40 transition-all hover:scale-102 group">
              <div className="p-4 bg-[#0D75FF]/10 rounded-2xl w-fit border border-[#0D75FF]/20 group-hover:bg-[#0D75FF] group-hover:text-black transition-all">
                <Zap className="w-8 h-8 text-[#0D75FF] group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Garantia e Pagamento Stripe</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Transações financeiras ultra-seguras baseadas em escrow com proteção total do comprador. O dinheiro só é liberado ao vendedor após o recebimento e validação da peça.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE COMPONENT DIRECTORY SPEC TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="text-[#00E5FF] font-mono text-xs uppercase tracking-widest font-bold">COMPRA PREVISÍVEL</span>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              Catálogo de Peças do Showroom
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'details' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              Lista de Peças
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'specs' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              Especificações Técnicas
            </button>
          </div>
        </div>

        {activeTab === 'details' ? (
          <div className="bg-[#07070f] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 font-mono text-gray-400 text-[10px] uppercase">
                  <th className="p-5 font-semibold">Peça</th>
                  <th className="p-5 font-semibold">Categoria</th>
                  <th className="p-5 font-semibold">Estado</th>
                  <th className="p-5 font-semibold">Estoque</th>
                  <th className="p-5 font-semibold text-right">Preço Sugerido</th>
                  <th className="p-5 font-semibold text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light text-gray-300">
                {COMPONENT_DETAILS.map((part) => (
                  <tr 
                    key={part.id} 
                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                      selectedPart.id === part.id ? 'bg-[#00E5FF]/5' : ''
                    }`}
                    onClick={() => setSelectedPart(part)}
                  >
                    <td className="p-5 font-semibold text-white flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedPart.id === part.id ? 'bg-[#00E5FF]' : 'bg-gray-700'}`} />
                      {part.name}
                    </td>
                    <td className="p-5 font-mono text-[10px] text-gray-500">{part.category}</td>
                    <td className="p-5">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                        {part.condition}
                      </span>
                    </td>
                    <td className="p-5 font-mono">
                      {part.stock > 3 ? (
                        <span className="text-green-400">✓ Em Estoque ({part.stock})</span>
                      ) : (
                        <span className="text-yellow-500 font-bold">⚠️ Baixo Estoque ({part.stock})</span>
                      )}
                    </td>
                    <td className="p-5 text-right font-bold text-white font-mono">{part.price}</td>
                    <td className="p-5 text-center">
                      <Link 
                        to="/catalog"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all bg-white/5 border border-white/10 hover:bg-white hover:text-black`}
                      >
                        Ver Catálogo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPONENT_DETAILS.map((part) => (
              <div key={part.id} className="bg-[#07070f] border border-white/5 p-6 rounded-3xl space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">{part.category}</span>
                    <span className="text-xs font-bold text-white font-mono">{part.price}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">{part.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{part.desc}</p>
                </div>
                <button 
                  onClick={() => setSelectedPart(part)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-gray-300"
                >
                  Inspecionar em 3D
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. CONVERTING CALL TO ACTION BLOCK FOR CLIENTS */}
      <section className="relative py-28 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 via-[#7000FF]/5 to-[#0D75FF]/10" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Garanta sua peça rara hoje</span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Pronto para Elevar a <br />Performance do seu Carro?
          </h2>

          <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Seja você um colecionador buscando motores inteiros ou uma oficina especializada no Japão, a DAIG garante procedência e entrega expressa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00E5FF] hover:bg-[#00D97E] text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              Explorar Catálogo Completo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border-2 border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5 max-w-lg mx-auto">
            <div className="text-center">
              <span className="text-2xl font-bold font-mono text-white block">100%</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">Garantia Escrow</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold font-mono text-white block">0.18ms</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">Sincronização Redis</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold font-mono text-white block">Yamato</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">Logística Integrada</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
