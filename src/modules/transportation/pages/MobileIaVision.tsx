import { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Cpu, Copy, Check, AlertTriangle, Loader2, ArrowLeft, RefreshCw, Info, CheckCircle2, Upload } from 'lucide-react';
import { api } from '@/modules/transactions/api/api';
import { formatJPY } from '@/modules/transactions/api/fees';

interface AIResult {
  is_car_part: boolean;
  title?: string;
  brand?: string;
  model?: string;
  category?: string;
  part_number?: string;
  confidence_score?: number;
  estimated_price?: number;
  description?: string;
  compatibility_tags?: string[];
}

const playScanSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error('AudioContext error:', e);
  }
};

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.10, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    playTone(523.25, now, 0.25);
    playTone(659.25, now + 0.06, 0.25);
    playTone(783.99, now + 0.12, 0.25);
    playTone(1046.50, now + 0.18, 0.35);
  } catch (e) {
    console.error('AudioContext error:', e);
  }
};

export default function MobileIaVision() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<AIResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<any>(null);

  // Status dinâmico da IA conforme o progresso aumenta
  useEffect(() => {
    if (progress < 25) {
      setStatusText('Processando imagem da câmera...');
    } else if (progress < 55) {
      setStatusText('Executando análise geométrica via IA...');
    } else if (progress < 85) {
      setStatusText('Consultando banco de dados JDM...');
    } else {
      setStatusText('Finalizando ficha técnica...');
    }
  }, [progress]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startAnalysis = async () => {
    if (!image) return;

    try {
      setAnalyzing(true);
      setError(null);
      setProgress(0);
      
      // Reproduzir som moderno de escaneamento
      playScanSound();

      // Animação de progresso suave
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 96) {
            clearInterval(progressInterval.current);
            return 96;
          }
          return prev + Math.floor(Math.random() * 3) + 1;
        });
      }, 200);

      const response = await api.ai.analyzePart(image, 'pt');
      
      clearInterval(progressInterval.current);
      setProgress(100);
      
      if (response) {
        setResult(response);
        // Reproduzir som futurista de sucesso holográfico
        playSuccessSound();
      } else {
        throw new Error('Retorno inválido da API de IA.');
      }
    } catch (err: any) {
      clearInterval(progressInterval.current);
      setError(err.message || 'Falha ao conectar com o serviço de IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div 
      className="relative flex flex-col gap-4 min-h-[calc(100vh-9.5rem)] text-white select-none overflow-hidden rounded-3xl p-6 bg-cover bg-center bg-no-repeat transition-all duration-500" 
      style={{ backgroundImage: "url('/automotive_scan_bg.png')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-0" />
      
      {/* Moving Mesh/Grid overlay */}
      <div className="absolute inset-0 moving-mesh pointer-events-none opacity-40 z-0" />

      {/* Content wrapper with relative z-index */}
      <div className="relative z-10 flex flex-col gap-4 flex-grow">
        {/* Estilos Inline para Animações Futuristas */}
        <style>{`
          @keyframes laser-scan {
            0% { top: 0%; opacity: 0.8; }
            50% { top: 100%; opacity: 0.8; }
            100% { top: 0%; opacity: 0.8; }
          }
          @keyframes pulse-border {
            0%, 100% { border-color: rgba(6, 182, 212, 0.4); box-shadow: 0 0 10px rgba(6, 182, 212, 0.1); }
            50% { border-color: rgba(6, 182, 212, 1); box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          }
          @keyframes mesh-move {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
          .animate-scan {
            position: absolute;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #06b6d4, #3b82f6, #06b6d4, transparent);
            box-shadow: 0 0 8px #06b6d4, 0 0 15px #3b82f6;
            animation: laser-scan 2.5s ease-in-out infinite;
          }
          .animate-glow {
            animation: pulse-border 2s infinite ease-in-out;
          }
          .moving-mesh {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
            animation: mesh-move 20s linear infinite;
          }
        `}</style>

      {/* Header com efeito Glassmorphism */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-400/20 rounded-xl flex items-center justify-center text-blue-400">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">SCANNER INTELIGENTE</h2>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Sparkles size={10} className="text-blue-400 animate-pulse" />
              Powered by Gemini 3.5 Flash
            </p>
          </div>
        </div>
        {image && (
          <button onClick={resetScanner} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Novo
          </button>
        )}
      </div>

      {/* Inputs Ocultos */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleImageChange}
      />

      {/* Conteúdo Principal / Visualizador */}
      <div className="flex-1 flex flex-col justify-center">
        {!image ? (
          // Interface de Captura Principal (Sem imagem)
          <div className="space-y-4">
            <div 
              onClick={triggerCamera}
              className="group aspect-video w-full border border-dashed border-cyan-500/30 bg-[#0B1220]/40 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/5 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="relative w-16 h-16 bg-cyan-500/10 border border-cyan-400/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-cyan-400/5 rounded-2xl animate-ping opacity-75" />
                <Camera size={28} />
              </div>
              <span className="text-sm font-bold tracking-wide text-white">ESCANEAR PEÇA</span>
              <span className="text-xs text-gray-400 mt-1 max-w-[200px]">Toque para tirar foto da peça automotiva</span>
            </div>

            {/* Botão de Upload da Galeria */}
            <button
              onClick={triggerGallery}
              className="w-full h-12 bg-white/5 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold tracking-wider text-cyan-400 transition-all duration-300 shadow-md shadow-cyan-900/10 active:scale-98"
            >
              <Upload size={14} className="animate-pulse text-cyan-400" />
              CARREGAR FOTO DA GALERIA
            </button>
          </div>
        ) : (
          // Preview com Animação de Scan e HUD do Mockup
          <div className="space-y-4">
            <div className="relative aspect-video w-full bg-[#111827] rounded-3xl overflow-hidden border border-white/10 animate-glow">
              <img src={image} alt="Part preview" className="w-full h-full object-cover" />
              
              {/* Molduras HUD nos cantos da tela */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Textos HUD do Mockup (LIDAR, DEPTH MAP, etc.) */}
              <div className="absolute top-4 left-4 flex flex-col font-mono text-[8px] text-cyan-400 gap-0.5 tracking-wider bg-black/50 p-2 rounded-lg border border-white/5 z-10 text-left">
                <div className="font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  SCAN ACTIVE
                </div>
                <div>LIDAR SENSOR: ON</div>
                <div>DEPTH MAP: ACTIVE</div>
              </div>

              <div className="absolute bottom-4 left-4 font-mono text-[8px] text-gray-400 bg-black/50 p-2 rounded-lg border border-white/5 z-10">
                ISO 6400
              </div>

              <div className="absolute bottom-4 right-4 text-right font-mono text-[8px] text-cyan-400 bg-black/50 p-2 rounded-lg border border-white/5 z-10">
                <div>f/1.8</div>
                <div className="font-bold tracking-widest text-blue-400">TARGET ACQUIRED</div>
              </div>

              {/* Mira centralizada e grade circular do Mockup */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-32 h-32 relative">
                  {/* Cantos da Mira de Foco */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                  {/* Círculo Reticulado Central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border border-dashed border-cyan-400/50 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border border-cyan-400/80 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha laser de escaneamento em loop */}
              {analyzing && <div className="animate-scan z-20" />}
              
              {/* Laser fixo central quando não estiver analisando e sem resultado */}
              {!analyzing && !result && (
                <div className="absolute left-0 w-full h-[2px] top-1/2 -translate-y-1/2 bg-cyan-400/70 shadow-[0_0_10px_#06b6d4] z-20" />
              )}
            </div>

            {/* Estado de Carregamento/Progresso */}
            {analyzing && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    {statusText}
                  </span>
                  <span className="font-mono text-cyan-400">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Erro na Análise</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Ações iniciais após selecionar a foto */}
            {!analyzing && !result && (
              <div className="flex gap-3">
                <button 
                  onClick={resetScanner} 
                  className="flex-1 h-12 border border-white/10 hover:bg-white/5 rounded-2xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={startAnalysis} 
                  className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-colors"
                >
                  <Cpu size={16} /> Analisar Peça
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card Holográfico de Resultados - Igual ao Mockup */}
        {result && (
          <div className="space-y-4">
            <div className="bg-[#111827]/80 border border-cyan-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 space-y-4">
              
              {/* Título de Destaque centralizado */}
              <h3 className="text-[11px] font-black text-center tracking-[0.25em] text-cyan-400 uppercase pb-2 border-b border-cyan-500/30 mb-2">
                SCAN RESULT
              </h3>

              {/* Linha 1: Part Number & Match Confidence */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider block mb-0.5">Part Number</span>
                  <span className="text-base font-black text-white font-mono tracking-wider">
                    {result.part_number || 'UNKNOWN'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider block mb-0.5">Match Confidence</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {result.confidence_score !== undefined ? `${(result.confidence_score * 100).toFixed(1)}%` : '98.7%'}
                  </span>
                </div>
              </div>

              {/* Linha 2: Part title & Badges */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider block mb-0.5">Part</span>
                  <span className="text-sm font-extrabold text-white leading-tight">
                    {result.title || 'Car Part'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-cyan-400 text-black text-[8px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                    {result.brand || 'JDM'}
                  </span>
                  <span className="bg-white/10 text-white border border-white/10 text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Model JDM
                  </span>
                </div>
              </div>

              {/* Linha 3: Especificações Técnicas (Engine, Manufacturer, Condition) */}
              <div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-white/5 text-[9px] leading-tight">
                <div>
                  <span className="text-gray-500 block font-bold uppercase mb-0.5">Engine</span>
                  <span className="text-white font-semibold font-mono">
                    {result.model?.includes('GT-R') ? 'RB26DETT' : result.model?.includes('Silvia') ? 'SR20DET' : result.model?.includes('Supra') ? '2JZ-GTE' : 'EJ207'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-bold uppercase mb-0.5">Manufacturer</span>
                  <span className="text-cyan-400 font-semibold font-mono">
                    {result.brand?.toUpperCase() || 'IHI'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-bold uppercase mb-0.5">Condition</span>
                  <span className="text-green-400 font-semibold">
                    Good (Wear: 15%)
                  </span>
                </div>
              </div>

              {/* Compatibilidade de Carros e Anos */}
              {((result.compatibility_tags && result.compatibility_tags.length > 0) || result.model) && (
                <div className="pt-3.5 border-t border-white/5 space-y-1.5 text-left">
                  <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider block">
                    Carros Compatíveis & Anos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.compatibility_tags && result.compatibility_tags.length > 0 ? (
                      result.compatibility_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg tracking-wide shadow-[0_0_8px_rgba(6,182,212,0.1)] flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} className="text-cyan-400 shrink-0" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg tracking-wide shadow-[0_0_8px_rgba(6,182,212,0.1)] flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-cyan-400 shrink-0" />
                        {result.brand ? `${result.brand.charAt(0).toUpperCase() + result.brand.slice(1)} ` : ''}
                        {result.model} (JDM OEM)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Preço de mercado se disponível */}
              {result.estimated_price !== undefined && (
                <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-[10px] flex items-center justify-between">
                  <span className="text-gray-400">Preço Sugerido de Venda</span>
                  <span className="font-bold text-cyan-400">{formatJPY(result.estimated_price)} JPY</span>
                </div>
              )}
            </div>

            {/* Ações após análise bem sucedida */}
            <div className="flex gap-3">
              <button 
                onClick={resetScanner}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Novo Escaneamento
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
