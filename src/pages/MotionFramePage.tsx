import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sliders, ShieldCheck, Cpu, Play, Pause, 
  RotateCcw, Compass, ArrowLeft, Layers, Palette, Eye, Award
} from 'lucide-react';
import MotionFrameScene from '../components/MotionFrameScene';

export default function MotionFramePage() {
  // 3D Scene states
  const [speed, setSpeed] = useState<number>(1.2);
  const [distortion, setDistortion] = useState<number>(1.0);
  const [glow, setGlow] = useState<number>(1.5);
  const [colorTheme, setColorTheme] = useState<'blue' | 'purple' | 'cyan'>('purple');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Skill Metrics
  const skills = [
    { name: 'Modelagem 3D Avançada (Hard Surface & Organic)', level: 98, desc: 'Topologia limpa, otimização de malha e design de alta fidelidade para web.' },
    { name: 'Motion Graphics & Dinâmicas de Fluidos', level: 95, desc: 'Animações fluidas de quadros, simulações físicas e interpolações complexas.' },
    { name: 'WebGL, Three.js & Custom Shaders', level: 93, desc: 'Programação de Shaders GLSL, otimização de render e integração com React.' },
    { name: 'Iluminação Realista & PBR Texturing', level: 96, desc: 'Mapas de textura PBR de alta resolução, iluminação de estúdio física e volumétrica.' }
  ];

  const handleReset = () => {
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

  return (
    <div className="min-h-screen bg-[#020205] text-white py-12 relative overflow-hidden font-sans">
      {/* Background Neon Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#0D75FF]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#7000FF]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-[#00E5FF]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link 
            to="/profile" 
            className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para o Perfil</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              <span>Nível Especialista Certificado</span>
            </span>
            <span className="px-3 py-1 bg-[#7000FF]/15 border border-[#7000FF]/30 rounded-full text-xs font-semibold text-purple-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>DAIG 3D Module v2.4</span>
            </span>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6">
            Especialista em <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] via-[#7000FF] to-[#FF007A]">Design 3D</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            Painel interativo demonstrando habilidades de alta fidelidade em motion design, WebGL, 
            e estruturação de malha 3D. Experimente a manipulação geométrica em tempo real no modelo abaixo.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: 3D Motion Frame Canvas */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-4 relative overflow-hidden border border-white/5 bg-[#07070f]/90 backdrop-blur-xl rounded-2xl shadow-2xl">
              {/* Floating tags */}
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
                  <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Arraste para Orbitar</span>
                </span>
              </div>

              {/* 3D Scene */}
              <div className="h-[450px] md:h-[550px] w-full relative">
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
                    onClick={handleReset}
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

            {/* Practical Application Banner */}
            <div className="card p-6 border border-[#7000FF]/25 bg-gradient-to-r from-[#7000FF]/5 via-[#0D75FF]/5 to-transparent backdrop-blur-md rounded-2xl flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-[#7000FF]/20 to-[#0D75FF]/20 border border-[#7000FF]/30 rounded-2xl flex-shrink-0">
                <Layers className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Aplicação Prática no DAIG</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Esta expertise 3D foi empregada no desenvolvimento do módulo <Link to="/admin" className="text-purple-400 hover:underline font-semibold">Armazém 3D Logistix WMS</Link>, 
                  proporcionando monitoramento volumétrico em tempo real de contêineres e prateleiras para frotas de peças japonesas.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Skill Metrics */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Customization Glassmorphism Control Panel */}
            <div className="card p-6 bg-[#07070f]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
              <div className="flex items-center space-x-2.5 mb-6 border-b border-white/5 pb-4">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold">Ajustes Geométricos & Shaders</h2>
              </div>

              <div className="space-y-5">
                {/* Palette selection */}
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2.5 flex items-center space-x-1.5">
                    <Palette className="w-4 h-4" />
                    <span>Esquema de Cor Holográfica</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['purple', 'blue', 'cyan'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setColorTheme(theme)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all hover:scale-102 active:scale-98 ${
                          colorTheme === theme
                            ? `bg-gradient-to-r ${getThemeColorClass()} text-black border-transparent shadow-lg`
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {theme === 'purple' ? 'Void Purple' : theme === 'blue' ? 'Neon Blue' : 'Cyber Cyan'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Velocidade de Rotação</span>
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

                {/* Distortion Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Distorção / Ruído</span>
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

                {/* Glow Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Brilho Emissivo (Moldura)</span>
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

                {/* Wireframe toggle */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span>Visualizar Malha Estrutural</span>
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

            {/* Expert Skill Badges Card */}
            <div className="card p-6 bg-[#07070f]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
              <div className="flex items-center space-x-2.5 mb-6 border-b border-white/5 pb-4">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-bold">Métricas de Especialidade</h2>
              </div>

              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-200">{skill.name}</span>
                      <span className={`text-sm font-bold font-mono ${getThemeTextClass()}`}>{skill.level}%</span>
                    </div>
                    {/* Glowing progress bar */}
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

        {/* Footer info badge */}
        <div className="text-center border-t border-white/5 pt-8 text-xs text-gray-600 font-mono">
          DAIG © 2026 | Desenvolvido por Antigravity com amor e precisão 3D.
        </div>
      </div>
    </div>
  );
}
