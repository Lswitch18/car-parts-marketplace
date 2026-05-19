import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { 
  Sparkles as SparklesIcon, Upload, Shield, Layers, AlertTriangle, Play, RefreshCw, Eye, Download, ShoppingBag, Terminal, Cpu
} from 'lucide-react';
import ExplodedCarScene from '../../components/ExplodedCarScene';

export default function ImageTo3D() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiEngine, setAiEngine] = useState<'triposr' | 'trellis' | 'unique3d'>('trellis');
  const [polyCount, setPolyCount] = useState<'low' | 'medium' | 'high'>('medium');
  const [textureRes, setTextureRes] = useState<'2k' | '4k' | '8k'>('4k');
  const [useDraco, setUseDraco] = useState(true);
  
  // Status states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // WebGL Interactive States
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setScanSuccess(false);
      setScanProgress(0);
      setScanLogs([]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Simulates high-fidelity AI generation console logs
  const runGenerationSimulation = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setScanSuccess(false);

    const logMessages = [
      '[SYSTEM] Inicializando pipeline do gerador AI...',
      '[SUPABASE] Autenticação de privilégios de Admin confirmada.',
      `[AI ENGINE] Utilizando modelo de aprendizado profundo: ${aiEngine.toUpperCase()} v2.1`,
      '[GPU CLUSTER] Alocando unidade de processamento gráfico NVIDIA A100...',
      '[IMAGE ANALYZER] Redimensionando imagem de entrada e removendo plano de fundo (Background Removal)...',
      '[IMAGE ANALYZER] Imagem isolada com sucesso. Analisando orientação espacial e profundidade...',
      `[${aiEngine.toUpperCase()}] Inicializando pipeline de difusão esparsa de nuvem de pontos (Sparse Point Cloud)...`,
      `[${aiEngine.toUpperCase()}] Construindo malha poligonal base (Implicit Mesh Reconstruction)...`,
      `[${aiEngine.toUpperCase()}] Gerando geometria detalhada das partes e quinas mecânicas (Dense Voxel Generation)...`,
      '[TOPOLOGY] Resolvendo quinas, furos e reentrâncias da geometria 3D...',
      '[UV UNWRAP] Mapeando coordenadas de textura UV...',
      `[TEXTURE GENERATOR] Projetando mapas de textura realistas PBR com resolução de ${textureRes.toUpperCase()}...`,
      useDraco ? '[DRACO COMPRESSION] Compactando malha 3D e índices WebGL (reduzindo tamanho em ~85%)...' : '[COMPRESSION] Pulando compressão Draco.',
      '[WEBGL VERIFIER] Validando integridade geométrica da malha WebGL (0 erros de topologia encontrados).',
      '[EXPORT] Gerando arquivo final otimizado no formato GLB binário...',
      '[SYSTEM] Sucesso! Modelo 3D carregado na GPU para visualização interativa em tempo real.'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages.length) {
        setScanLogs(prev => [...prev, logMessages[currentLogIndex]]);
        setScanProgress(Math.min(((currentLogIndex + 1) / logMessages.length) * 100, 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanSuccess(true);
      }
    }, 900);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  return (
    <div className="min-h-screen bg-[#07070a] text-white p-6 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-300px] right-[-300px] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Admin Card */}
      <div className="max-w-7xl mx-auto bg-[#0a0a0f]/90 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Acesso Administrativo
              </span>
              <span className="bg-purple-900/30 text-purple-400 border border-purple-800/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" />
                AI Model Beta
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-300 to-[#00E5FF] bg-clip-text text-transparent">
              Gerador de Modelos 3D AI
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Crie arquivos WebGL tridimensionais ultraleves de alta precisão (.glb) a partir de fotografias de peças e motores em tempo recorde utilizando inteligência artificial generativa.
            </p>
          </div>
        </div>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Side Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Engine Picker */}
            <div className="bg-[#0f0f16]/90 border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-md font-bold flex items-center gap-2 border-b border-gray-800 pb-2 text-[#00E5FF]">
                <Layers className="w-4.5 h-4.5 text-primary" />
                1. Algoritmo de Reconstrução
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'trellis'}
                    onChange={() => setAiEngine('trellis')}
                    className="mt-1 accent-primary"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">TRELLIS 2 (Microsoft)</p>
                    <p className="text-xs text-gray-400">Qualidade ultra-alta com materiais PBR, ideal para blocos de motor e geometrias rígidas complexas.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'triposr'}
                    onChange={() => setAiEngine('triposr')}
                    className="mt-1 accent-primary"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">TripoSR (Stability AI)</p>
                    <p className="text-xs text-gray-400">Velocidade extrema de 0.5s local. Otimizado para geração leve e rápida de peças simples.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'unique3d'}
                    onChange={() => setAiEngine('unique3d')}
                    className="mt-1 accent-primary"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Unique3D (AiuniAI)</p>
                    <p className="text-xs text-gray-400">Excelente fidelidade de cores, texturas coloridas realistas e malhas limpas para a web.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* WebGL Parameters */}
            <div className="bg-[#0f0f16]/90 border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-md font-bold flex items-center gap-2 border-b border-gray-800 pb-2 text-[#00E5FF]">
                <Cpu className="w-4.5 h-4.5 text-primary" />
                2. Otimizações de WebGL
              </h2>

              <div className="space-y-4">
                {/* Polycount */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400 block">Resolução da Malha Poligonal:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setPolyCount(option)}
                        disabled={isScanning}
                        className={`text-xs py-2 rounded-lg border font-medium uppercase transition-all ${
                          polyCount === option
                            ? 'bg-primary/20 text-primary border-primary/50'
                            : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {option === 'low' ? 'Low WebGL' : option === 'medium' ? 'Médio' : 'Raw High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texture resolution */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400 block">Resolução Máxima de Textura:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['2k', '4k', '8k'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setTextureRes(option)}
                        disabled={isScanning}
                        className={`text-xs py-2 rounded-lg border font-medium uppercase transition-all ${
                          textureRes === option
                            ? 'bg-primary/20 text-primary border-primary/50'
                            : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draco toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-white block">Compressão Google Draco</span>
                    <span className="text-[10px] text-gray-400">Reduz tamanho do arquivo em até 85%.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useDraco}
                      onChange={() => setUseDraco(!useDraco)}
                      disabled={isScanning}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-gray-900" />
                  </label>
                </div>
              </div>
            </div>

            {/* Help Alerts */}
            <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-4 flex gap-3 text-xs text-yellow-400/90 leading-relaxed">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500" />
              <div>
                <span className="font-bold block mb-1">Dica de Upload:</span>
                Para o melhor resultado de escaneamento tridimensional, envie imagens com o objeto no centro, sob iluminação clara e sem sombras complexas que possam cobrir as quinas mecânicas.
              </div>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* If model has not been generated yet */}
            {!scanSuccess ? (
              <div className="bg-[#0f0f16]/90 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                
                {/* Upload border / Image preview */}
                {imagePreview ? (
                  <div className="w-full max-w-lg aspect-square relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Peça enviada" 
                      className="max-w-full max-h-full object-contain relative z-10" 
                    />
                    
                    {/* Laser scanning effect */}
                    {isScanning && (
                      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
                        {/* Laser horizontal line moving vertically */}
                        <div 
                          className="w-full h-1 bg-[#00E5FF] shadow-[0_0_15px_#00E5FF] absolute left-0"
                          style={{
                            animation: 'scanAnimation 2.2s ease-in-out infinite',
                            top: '0%'
                          }}
                        />
                        {/* Matrix-like mesh grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px] opacity-60" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-800 hover:border-primary/50 rounded-xl p-12 text-center cursor-pointer transition-all hover:bg-gray-900/30 group max-w-md"
                  >
                    <Upload className="w-12 h-12 text-gray-500 group-hover:text-primary transition-colors mx-auto mb-4" />
                    <span className="text-sm font-bold text-white block mb-1">Upload da Fotografia</span>
                    <span className="text-xs text-gray-400 block mb-4">Arraste a foto ou clique para buscar arquivos locais (PNG, JPG).</span>
                    <button className="bg-gray-900 group-hover:bg-primary/20 text-gray-300 group-hover:text-primary border border-gray-800 group-hover:border-primary/45 px-4 py-2 rounded-lg text-xs font-semibold transition-all">
                      Escolher Imagem
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden" 
                />

                {/* Scan Buttons / Actions */}
                {imagePreview && !isScanning && (
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={triggerFileInput}
                      className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
                    >
                      Alterar Imagem
                    </button>
                    <button 
                      onClick={runGenerationSimulation}
                      className="bg-gradient-to-r from-primary to-[#0D75FF] hover:from-[#00d97e] hover:to-[#0D75FF] text-gray-900 px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-gray-900" />
                      Iniciar Escaneamento AI
                    </button>
                  </div>
                )}

                {/* Progress bar under process */}
                {isScanning && (
                  <div className="w-full max-w-lg mt-6 space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-primary animate-pulse flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Gerando Malha Tridimensional...
                      </span>
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-[#0D75FF] rounded-full transition-all duration-300 shadow-[0_0_10px_#00E5FF]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 3D Interactive WebGL Sandbox View on Success!
              <div className="bg-[#0f0f16]/90 border border-gray-800 rounded-xl overflow-hidden min-h-[450px] flex flex-col relative">
                
                {/* 3D WebGL Canvas */}
                <div className="w-full flex-grow aspect-[16/9] min-h-[350px] relative bg-[#07070a]">
                  <Canvas shadows camera={{ position: [0, 1.8, 3.5], fov: 45 }}>
                    <color attach="background" args={['#07070a']} />
                    <ambientLight intensity={0.25} />
                    
                    {/* Futuristic studio grid illumination */}
                    <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                    <pointLight position={[0, 4, 0]} intensity={1.2} color="#00E5FF" />
                    
                    <Suspense fallback={null}>
                      <ExplodedCarScene 
                        explosionFactor={0}
                        colorTheme="cyan"
                        wireframe={wireframe}
                        autoRotate={autoRotate}
                        scrollPercent={0}
                        interactiveMode="sandbox"
                      />
                      <Sparkles count={50} scale={3.5} size={1.2} speed={0.4} color="#00E5FF" opacity={0.3} />
                    </Suspense>

                    <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 1.8} />
                  </Canvas>

                  {/* Badges / Hot overlays */}
                  <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                    <span className="bg-emerald-950/45 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                      <Eye className="w-3.5 h-3.5" />
                      Visualização Ativa (WebGL)
                    </span>
                  </div>

                  {/* Render Controls Overlay */}
                  <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => setWireframe(!wireframe)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all ${
                        wireframe 
                          ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                          : 'bg-[#0f0f16]/75 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {wireframe ? 'Modo Sólido' : 'Modo Wireframe'}
                    </button>

                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all ${
                        autoRotate 
                          ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                          : 'bg-[#0f0f16]/75 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {autoRotate ? 'Parar Rotação' : 'Auto Rotacionar'}
                    </button>
                  </div>
                </div>

                {/* 3D Success Stats & Export Actions */}
                <div className="bg-gray-900/50 p-6 border-t border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Modelo 3D Gerado com Sucesso!
                    </span>
                    <p className="text-xs text-gray-400">
                      Tamanho: <strong className="text-white">4.32 MB</strong> | Polígonos: <strong className="text-white">82,410</strong> | Draco: <strong className="text-emerald-400">Compactado</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setScanSuccess(false)}
                      className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Gerar Novo
                    </button>
                    
                    <a
                      href="/car_engine_scan.glb"
                      download="car_engine_scan.glb"
                      className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download GLB (WebGL)
                    </a>

                    <button 
                      onClick={() => alert('Peça integrada ao estoque com sucesso!')}
                      className="bg-gradient-to-r from-primary to-[#0D75FF] hover:from-[#00d97e] hover:to-[#0D75FF] text-gray-900 px-6 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-gray-900" />
                      Publicar no Catálogo
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* AI Generator Real-time Console Log */}
            <div className="bg-[#07070c] border border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-[#0f0f16] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400">
                <span className="flex items-center gap-2 text-primary">
                  <Terminal className="w-4 h-4 text-primary" />
                  Terminal de Logs do Cluster AI
                </span>
                <span className="bg-gray-900 text-gray-500 px-2 py-0.5 rounded text-[10px]">Realtime</span>
              </div>
              <div className="p-4 font-mono text-[11px] leading-relaxed text-gray-400 max-h-48 overflow-y-auto space-y-1 select-text">
                {scanLogs.length === 0 ? (
                  <p className="text-gray-600 italic">Aguardando comando de inicialização...</p>
                ) : (
                  scanLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`${log.includes('Sucesso!') || log.includes('confirmada') ? 'text-emerald-400' : log.includes('Compactando') || log.includes('Otimizações') ? 'text-cyan-400' : ''}`}
                    >
                      {log}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes scanAnimation {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 98%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
