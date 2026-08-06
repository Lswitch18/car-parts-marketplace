import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Canvas } from '@react-three/fiber';
import { 
  ArrowLeft, Cpu, Compass, Activity, Sliders, Gauge, 
  RotateCcw, CheckCircle, Eye
} from 'lucide-react';
import ImmersiveCarScene from '@/modules/parts-catalog/components/ImmersiveCarScene';

export default function ImmersiveExperience() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [themeColor, setThemeColor] = useState<'purple' | 'cyan' | 'blue'>('cyan');
  const [telemetryMode, setTelemetryMode] = useState<boolean>(true);
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  
  const [fps, setFps] = useState<number>(60);
  const [turboPsi, setTurboPsi] = useState<number>(0.0);
  const [throttle, setThrottle] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll tracking logic
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulation loop for fps and turbo pressures
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.round(59 + Math.random() * 2.0));
      if (throttle > 0) {
        setTurboPsi(parseFloat((throttle * 2.2 + Math.random() * 0.4).toFixed(1)));
      } else {
        setTurboPsi(parseFloat((Math.random() * 0.1).toFixed(1)));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [throttle]);

  const getSectionTitle = () => {
    if (scrollProgress < 0.25) return '01 // Aerodinâmica JDM';
    if (scrollProgress < 0.6) return '02 // Revelação do Bloco';
    if (scrollProgress < 0.85) return '03 // Coletor e Turbocharge';
    return '04 // Exaustão Dinâmica';
  };

  const getSectionDescription = () => {
    if (scrollProgress < 0.25) {
      return 'Primeira fase de análise estrutural. A câmera foca no perfil aerodinâmico baixo e no splitter dianteiro do esportivo japonês. O coeficiente de arrasto é minimizado para máxima eficiência na estrada.';
    }
    if (scrollProgress < 0.6) {
      return 'O capô do motor abre suavemente em 3D, revelando o bloco de cilindros duplo com tampas de válvula personalizadas e iluminação neon sincronizada com o sistema eletrônico da DAIG.';
    }
    if (scrollProgress < 0.85) {
      return 'Zoom detalhado no sistema de superalimentação de alta fidelidade: o compressor turbocharger e o tubo de admissão do intercooler frontal. Ideal para peças de motor de alto desempenho.';
    }
    return 'Inspeção do eixo de exaustão traseiro e canos de descarga. Os gases de escape são expelidos em tempo real com simulação de fluxo de partículas responsivas no espaço tridimensional.';
  };

  const triggerThrottle = () => {
    setThrottle(10);
    setTimeout(() => setThrottle(0), 1200);
  };

  return (
    <div ref={containerRef} className="relative min-h-[400vh] bg-[#020205] text-white selection:bg-[#00E5FF] selection:text-black">
      
      {/* 1. FIXED BACKGROUND 3D CANVAS */}
      <div className="fixed inset-0 z-0 w-screen h-screen pointer-events-none">
        <Canvas camera={{ position: [6.5, 1.8, 6.5], fov: 45 }} gl={{ antialias: true }}>
          <ImmersiveCarScene 
            scrollProgress={scrollProgress} 
            themeColor={themeColor}
            telemetryMode={telemetryMode}
            performanceMode={performanceMode}
          />
        </Canvas>
      </div>

      {/* 2. DYNAMIC HUD LAYOUT - FIXED OVERLAYS */}
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between w-full pointer-events-auto">
          <Link 
            to="/" 
            className="flex items-center space-x-2 px-4 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-wider font-semibold font-mono">Voltar à DAIG</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1.5 bg-black/60 backdrop-blur-xl border border-[#00E5FF]/20 rounded-xl text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] flex items-center space-x-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
              <span>ACTIVE THEORY ENGINE</span>
            </span>
          </div>
        </div>

        {/* Mid section HUD grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 items-center my-6 overflow-hidden">
          
          {/* Left Panel: WebGL Telemetry (Telemetry Mode Only) */}
          {telemetryMode && (
            <div className="col-span-12 md:col-span-4 lg:col-span-3 pointer-events-auto self-start space-y-4">
              <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4.5 h-4.5 text-[#00E5FF] animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-200">Telemetria</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/25 rounded text-[8px] font-mono text-green-400">ACTIVE</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-500 block uppercase">WEBGL RENDER</span>
                    <span className="text-sm font-bold text-gray-200">{fps} FPS</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-500 block uppercase">TURBO BOOST</span>
                    <span className="text-sm font-bold text-pink-500">{turboPsi} PSI</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-500 block uppercase">3D VECTORS</span>
                    <span className="text-sm font-bold text-green-400">600</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-500 block uppercase">SCENE FPS</span>
                    <span className="text-sm font-bold text-[#00E5FF]">{fps} FPS</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Throttle HUD */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Gauge className="w-5 h-5 text-pink-500" />
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block uppercase">Aceleração</span>
                    <span className="text-xs font-bold text-gray-200">Acelerador Eletrônico</span>
                  </div>
                </div>
                <button
                  onClick={triggerThrottle}
                  disabled={throttle > 0}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-black text-xs font-mono font-bold uppercase rounded-xl hover:from-pink-400 hover:to-red-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  ACELERAR
                </button>
              </div>
            </div>
          )}

          {/* Right Panel: Scroll-based Inspection Details */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 lg:col-start-10 pointer-events-auto self-start space-y-4">
            
            {/* Scroll Indicator checklist */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-2xl space-y-4">
              <span className="text-[10px] text-[#00E5FF] font-mono tracking-widest block uppercase font-bold">
                {getSectionTitle()}
              </span>
              
              <h3 className="text-xl font-bold font-display tracking-tight text-white leading-tight">
                {scrollProgress < 0.25 ? 'Análise de Silhueta' : scrollProgress < 0.6 ? 'Engenharia Interna' : scrollProgress < 0.85 ? 'Turbocompressor' : 'Exaustão Espacial'}
              </h3>
              
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                {getSectionDescription()}
              </p>

              {/* Steps timeline indicator */}
              <div className="space-y-2.5 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">CHASSIS / VECTORS</span>
                  <span className={scrollProgress >= 0.0 ? 'text-[#00E5FF]' : 'text-gray-600'}>
                    {scrollProgress >= 0.25 ? '✓ COMPLETO' : 'INSPECIONANDO'}
                  </span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00E5FF] transition-all duration-300"
                    style={{ width: `${Math.min(scrollProgress * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Tip card */}
            <div className="bg-black/60 backdrop-blur-xl border border-[#00E5FF]/20 p-4 rounded-xl shadow-xl flex items-center space-x-3">
              <Compass className="w-6 h-6 text-[#00E5FF] animate-spin" style={{ animationDuration: '8s' }} />
              <div className="text-[10px] text-gray-400 font-mono">
                <span className="text-white font-bold block uppercase tracking-wider">Scroll Control</span>
                Use o scroll do mouse ou arraste a tela para movimentar a câmera cinematicamente.
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Control HUD Panel */}
        <div className="w-full pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-gray-200">Painel do Motor 3D</span>
            </div>
            
            {/* Color Switcher */}
            <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
              {(['purple', 'cyan', 'blue'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  className={`w-6 h-6 rounded-lg border transition-all ${
                    themeColor === color 
                      ? 'border-transparent shadow-lg scale-110' 
                      : 'border-transparent hover:bg-white/5 opacity-55'
                  }`}
                  style={{
                    backgroundColor: color === 'purple' ? '#7000FF' : color === 'cyan' ? '#00E5FF' : '#0D75FF'
                  }}
                  title={`Esquema ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Hologram Beam & Performance mode toggles */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTelemetryMode(!telemetryMode)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center space-x-2 ${
                telemetryMode 
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>SCAN HOLOGRÁFICO</span>
            </button>

            <button
              onClick={() => setPerformanceMode(!performanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center space-x-2 ${
                performanceMode 
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>PRESETS REDUZIDOS</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. INVISIBLE LAYER FOR SCROLL HEIGHT CONTROLLER */}
      {/* We use multiple relative divs to block vertical scroll height correctly */}
      <div className="h-screen relative z-10 select-none pointer-events-none flex items-center justify-center">
        <div className="text-center max-w-xl mx-auto px-4 bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/5">
          <span className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded text-[9px] font-mono tracking-widest text-[#00E5FF] uppercase block w-fit mx-auto mb-4">
            JDM IMMERSIVE SHOWCASE
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display leading-tight tracking-tight text-white mb-4">
            ActiveTheory <br /><span className="text-[#00E5FF]">3D Experience</span>
          </h1>
          <p className="text-sm text-gray-400 font-light mb-6">
            Uma imersão completa em tempo real. Continue descendo a página para acionar a câmera cinemática e abrir o capô do carro.
          </p>
          <div className="animate-bounce inline-block border-2 border-white/20 p-2.5 rounded-full">
            <div className="w-2 h-4 bg-[#00E5FF] rounded-full mx-auto" />
          </div>
        </div>
      </div>

      <div className="h-screen relative z-10 select-none pointer-events-none" />
      <div className="h-screen relative z-10 select-none pointer-events-none" />
      
      {/* Footer Section */}
      <div className="h-screen relative z-10 pointer-events-none flex items-end justify-center pb-20">
        <div className="text-center bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-[#00E5FF]/20 max-w-lg mx-auto pointer-events-auto">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">Fim do Diagnóstico 3D</h2>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Todos os 600 vetores de física foram simulados e armazenados em cache. Essa tecnologia garante carregamentos rápidos para modelos 3D volumétricos.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-[#00E5FF] text-black text-xs font-mono font-bold rounded-lg hover:scale-105 transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REINICIAR CÂMERA</span>
            </button>
            <Link 
              to="/"
              className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-mono font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              VOLTAR AO HOME
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
