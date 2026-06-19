import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, useGLTF } from '@react-three/drei';
import { 
  Sparkles as SparklesIcon, Upload, Shield, Layers, AlertTriangle, Play, RefreshCw, Download, ShoppingBag, Terminal, Cpu
} from 'lucide-react';
import * as THREE from 'three';
import { supabase } from '@/modules/shared/lib/supabase';

function Model3DViewer({ modelUrl, autoRotate }: { modelUrl: string; autoRotate: boolean }) {
  const gltf = useGLTF(modelUrl);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.06;
    }
  });

  return <primitive ref={meshRef} object={gltf.scene} />;
}

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
  const [autoRotate, setAutoRotate] = useState(true);

  // Real 3D Generation States
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = (msg: string) => {
    setScanLogs(prev => [...prev, msg]);
  };

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

  const runRealGeneration = async () => {
    if (!imagePreview) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setScanSuccess(false);
    setModelUrl(null);

    addLog('[SYSTEM] Inicializando pipeline do gerador 3D...');
    addLog('[STORAGE] Enviando imagem para o Supabase Storage...');

    try {
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      const ext = blob.type === 'image/png' ? '.png' : '.jpg';
      const fileName = `3d-scans/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('parts-images')
        .upload(fileName, blob);

      if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('parts-images')
        .getPublicUrl(fileName);

      addLog('[UPLOAD] Imagem enviada com sucesso.');
      setScanProgress(25);
      addLog(`[AI ENGINE] Chamando ${aiEngine.toUpperCase()} via API...`);

      const { data: startResp, error: startError } = await supabase.functions.invoke('generate-3d', {
        body: { image: publicUrl },
      });

      if (startError) throw startError;

      const startData = startResp?.data;
      if (!startData) throw new Error('Resposta inválida do servidor');

      if (startData.status === 'demo') {
        addLog('[SYSTEM] Modo demonstração — configure REPLICATE_API_KEY');
        addLog('[SYSTEM] Exibindo visualização 2D da imagem enviada.');
        setIsScanning(false);
        setScanSuccess(true);
        return;
      }

      addLog(`[REPLICATE] Predição iniciada: ${startData.id}`);
      setScanProgress(40);

      let attempts = 0;
      const maxAttempts = 60;

      const poll = async () => {
        attempts++;
        const { data: statusResp, error: statusError } = await supabase.functions.invoke('generate-3d', {
          body: { id: startData.id },
        });

        if (statusError) {
          addLog(`[ERROR] ${statusError.message}`);
          return;
        }

        const s = statusResp?.data;
        if (!s) return;

        if (s.status === 'succeeded') {
          const glbUrl = s.output;
          setModelUrl(glbUrl);
          setScanProgress(100);
          addLog(`[SUCCESS] Modelo 3D gerado com sucesso!`);
          addLog('[SYSTEM] Carregando malha WebGL na GPU...');
          setTimeout(() => {
            setIsScanning(false);
            setScanSuccess(true);
          }, 500);
          return;
        }

        if (s.status === 'failed') {
          addLog(`[ERROR] ${s.error || 'Falha na geração'}`);
          setIsScanning(false);
          return;
        }

        setScanProgress(Math.min(40 + (attempts / maxAttempts) * 55, 95));
        addLog(`[PROGRESS] Reconstruindo geometria... (${attempts * 2}s)`);

        if (attempts >= maxAttempts) {
          addLog('[ERROR] Tempo limite excedido');
          setIsScanning(false);
          return;
        }

        setTimeout(poll, 2000);
      };

      setTimeout(poll, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`[ERROR] ${msg}`);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  return (
    <div className="min-h-screen bg-background text-white p-6 relative overflow-hidden font-sans">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none z-0" />
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(13,117,255,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(112,0,255,0.08) 0%, transparent 65%)' }} />

      {/* Main Admin Card */}
      <div className="max-w-7xl mx-auto bg-surface border border-border rounded-2xl p-8 relative z-10 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="badge flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Acesso Administrativo
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: 'rgba(112,0,255,0.15)', color: '#a855f7', border: '1px solid rgba(112,0,255,0.3)' }}>
                <SparklesIcon className="w-3.5 h-3.5" />
                AI Model Beta
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-300 to-[#00E5FF] bg-clip-text text-transparent">
              Gerador de Modelos 3D AI
            </h1>
            <p className="text-text-muted text-sm mt-1 max-w-2xl">
              Crie arquivos WebGL tridimensionais ultraleves de alta precisão (.glb) a partir de fotografias de peças e motores em tempo recorde utilizando inteligência artificial generativa.
            </p>
          </div>
        </div>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Side Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Engine Picker */}
            <div className="card space-y-4" style={{ padding: '1.25rem' }}>
              <h2 className="font-display text-md font-bold flex items-center gap-2 border-b border-border pb-2 text-daig-cyan">
                <Layers className="w-4.5 h-4.5 text-daig-blue" />
                1. Algoritmo de Reconstrução
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-[#18182a] border border-border rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'trellis'}
                    onChange={() => setAiEngine('trellis')}
                    className="mt-1 accent-daig-blue"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">TRELLIS 2 (Microsoft)</p>
                    <p className="text-xs text-text-muted">Qualidade ultra-alta com materiais PBR, ideal para blocos de motor e geometrias rígidas complexas.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-[#18182a] border border-border rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'triposr'}
                    onChange={() => setAiEngine('triposr')}
                    className="mt-1 accent-daig-blue"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">TripoSR (Stability AI)</p>
                    <p className="text-xs text-text-muted">Velocidade extrema de 0.5s local. Otimizado para geração leve e rápida de peças simples.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-[#18182a] border border-border rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="aiEngine"
                    checked={aiEngine === 'unique3d'}
                    onChange={() => setAiEngine('unique3d')}
                    className="mt-1 accent-daig-blue"
                    disabled={isScanning}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Unique3D (AiuniAI)</p>
                    <p className="text-xs text-text-muted">Excelente fidelidade de cores, texturas coloridas realistas e malhas limpas para a web.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* WebGL Parameters */}
              <div className="card space-y-4" style={{ padding: '1.25rem' }}>
              <h2 className="font-display text-md font-bold flex items-center gap-2 border-b border-border pb-2 text-daig-cyan">
                <Cpu className="w-4.5 h-4.5 text-daig-blue" />
                2. Otimizações de WebGL
              </h2>

              <div className="space-y-4">
                {/* Polycount */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted block">Resolução da Malha Poligonal:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setPolyCount(option)}
                        disabled={isScanning}
                        className={`text-xs py-2 rounded-lg border font-medium uppercase transition-all ${
                          polyCount === option
                            ? 'bg-daig-blue/20 text-daig-blue border-daig-blue/50'
                            : 'bg-[var(--bg-elevated)] text-text-muted border-border hover:border-daig-blue/30'
                        }`}
                      >
                        {option === 'low' ? 'Low WebGL' : option === 'medium' ? 'Médio' : 'Raw High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texture resolution */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted block">Resolução Máxima de Textura:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['2k', '4k', '8k'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setTextureRes(option)}
                        disabled={isScanning}
                        className={`text-xs py-2 rounded-lg border font-medium uppercase transition-all ${
                          textureRes === option
                            ? 'bg-daig-blue/20 text-daig-blue border-daig-blue/50'
                            : 'bg-[var(--bg-elevated)] text-text-muted border-border hover:border-daig-blue/30'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draco toggle */}
                <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] border border-border rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-white block">Compressão Google Draco</span>
                    <span className="text-[10px] text-text-muted">Reduz tamanho do arquivo em até 85%.</span>
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
            <div className="card flex gap-3 text-xs text-yellow-400/90 leading-relaxed" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', padding: '1rem' }}>
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
              <div className="card p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                
                {/* Upload border / Image preview */}
                {imagePreview ? (
                  <div className="w-full max-w-lg aspect-square relative rounded-xl overflow-hidden border border-border bg-[var(--bg-elevated)] flex items-center justify-center">
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
                    className="border-2 border-dashed border-border hover:border-daig-blue/50 rounded-xl p-12 text-center cursor-pointer transition-all hover:bg-[var(--bg-elevated)] group max-w-md"
                  >
                    <Upload className="w-12 h-12 text-text-muted group-hover:text-daig-blue transition-colors mx-auto mb-4" />
                    <span className="font-display text-sm font-bold text-white block mb-1">Upload da Fotografia</span>
                    <span className="text-xs text-text-muted block mb-4">Arraste a foto ou clique para buscar arquivos locais (PNG, JPG).</span>
                    <button className="btn-ghost text-xs">
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
                      className="btn-ghost"
                    >
                      Alterar Imagem
                    </button>
                    <button 
                      onClick={runRealGeneration}
                      className="btn-neon"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Escaneamento AI
                    </button>
                  </div>
                )}

                {/* Progress bar under process */}
                {isScanning && (
                  <div className="w-full max-w-lg mt-6 space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-daig-blue animate-pulse flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Gerando Malha Tridimensional...
                      </span>
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-daig-blue to-[#0D75FF] rounded-full transition-all duration-300 shadow-[0_0_10px_#00E5FF]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 3D Interactive WebGL Sandbox View on Success!
              <div className="card overflow-hidden min-h-[450px] flex flex-col relative">
                
                {/* 3D WebGL Canvas */}
                <div className="w-full flex-grow aspect-[16/9] min-h-[350px] relative" style={{ background: 'var(--bg-void)' }}>
                  <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 45 }}>
                    <color attach="background" args={['#07070a']} />
                    <ambientLight intensity={0.3} />
                    
                    <directionalLight position={[5, 10, 5]} intensity={1.5} />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                    
                    <Suspense fallback={null}>
                      {modelUrl ? (
                        <Model3DViewer modelUrl={modelUrl} autoRotate={autoRotate} />
                      ) : (
                        <mesh>
                          <planeGeometry args={[2.8, 2.8]} />
                          <meshPhysicalMaterial color="#1a1a2e" metalness={0.1} roughness={0.3} />
                        </mesh>
                      )}
                      <Sparkles count={30} scale={3} size={0.8} speed={0.3} color="#00E5FF" opacity={0.2} />
                    </Suspense>

                    <OrbitControls enableZoom={true} enablePan={true} />
                  </Canvas>

                  {/* Render Controls Overlay */}
                  <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all ${
                        autoRotate 
                          ? 'bg-daig-blue/20 text-daig-blue border-daig-blue/50 shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                          : 'bg-[var(--bg-elevated)]/75 text-text-secondary border-border hover:border-daig-blue/30'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {autoRotate ? 'Parar Rotação' : 'Auto Rotacionar'}
                    </button>
                  </div>
                </div>

                {/* 3D Success Stats & Export Actions */}
                <div className="p-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Modelo 3D Gerado com Sucesso!
                    </span>
                    <p className="text-xs text-text-muted">
                      Resolução: <strong className="text-white">Textura Original</strong> | Formato: <strong className="text-white">GLB (WebGL)</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setScanSuccess(false)}
                      className="btn-ghost text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Gerar Novo
                    </button>
                    
                    <a
                      href={imagePreview || ''}
                      download="modelo-3d-scan.png"
                      className="btn-ghost text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Imagem
                    </a>

                    <button 
                      onClick={() => alert('Peça enviada para análise. Em breve disponível no catálogo!')}
                      className="btn-neon text-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Publicar no Catálogo
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* AI Generator Real-time Console Log */}
            <div className="card overflow-hidden" style={{ padding: 0 }}>
              <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs font-bold text-text-muted" style={{ background: 'var(--bg-elevated)' }}>
                <span className="flex items-center gap-2 text-daig-blue">
                  <Terminal className="w-4 h-4" />
                  Terminal de Logs do Cluster AI
                </span>
                <span className="bg-[var(--bg-void)] text-text-muted px-2 py-0.5 rounded text-[10px]">Realtime</span>
              </div>
              <div className="p-4 font-mono text-[11px] leading-relaxed text-text-muted max-h-48 overflow-y-auto space-y-1 select-text" style={{ background: 'var(--bg-void)' }}>
                {scanLogs.length === 0 ? (
                  <p className="text-text-muted italic">Aguardando comando de inicialização...</p>
                ) : (
                  scanLogs.map((log, index) => (
                    log ? (
                      <div 
                        key={index} 
                        className={`${log.includes('Sucesso!') || log.includes('confirmada') ? 'text-emerald-400' : log.includes('Compactando') || log.includes('Otimizações') ? 'text-cyan-400' : ''}`}
                      >
                        {log}
                      </div>
                    ) : null
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
