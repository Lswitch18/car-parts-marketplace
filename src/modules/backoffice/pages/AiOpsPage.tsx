import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '@/modules/shared/lib/i18n';
import { api } from '@/modules/transactions/api/api';
import {
  Brain, Upload, Zap, Trash2, RefreshCw, CheckCircle2, XCircle,
  Clock, Activity, Server, Cpu, ImageIcon, ChevronDown, ChevronUp,
  AlertTriangle, Copy, Check, HardDrive, Download, Database
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────
interface AnalysisLogEntry {
  id: string;
  timestamp: string;
  thumbnail: string;
  isCarPart: boolean | null;
  brand: string;
  category: string;
  title: string;
  latencyMs: number;
  jsonValid: boolean;
  rawJson: string;
}

interface HealthStatus {
  status: 'idle' | 'checking' | 'online' | 'offline' | 'timeout';
  latencyMs: number | null;
  models: string[];
  runningModels?: string[];
  serverUrl: string;
  lastChecked: string | null;
}

const STORAGE_KEY = 'daig_ai_ops_log';
const MAX_LOG_ENTRIES = 50;
// Maximum image dimension before sending to AI (matches CreateListing behavior)
const MAX_IMAGE_SIZE = 256;

// ── Helpers ────────────────────────────────────────────────────────────

function loadLog(): AnalysisLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: AnalysisLogEntry[]) {
  // Only store up to MAX_LOG_ENTRIES to keep localStorage lean
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LOG_ENTRIES)));
}

/** Resize image to max dimension for faster AI processing */
function resizeImage(base64: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = base64;
  });
}

// ── Component ──────────────────────────────────────────────────────────

export default function AiOpsPage() {
  const { t } = useI18n();

  // Health Check state
  const [health, setHealth] = useState<HealthStatus>({
    status: 'idle',
    latencyMs: null,
    models: [],
    runningModels: [],
    serverUrl: import.meta.env.VITE_OLLAMA_API_URL || 'https://201.46.120.192.nip.io/api/chat',
    lastChecked: null,
  });

  // Model Manager state
  const [downloadModelName, setDownloadModelName] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ status: string, pct: number } | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Playground state
  const [selectedModel, setSelectedModel] = useState<string>('qwen3-vl:2b');
  const [playgroundImage, setPlaygroundImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [frontendStatusMessage, setFrontendStatusMessage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisRawJson, setAnalysisRawJson] = useState<string>('');
  const [analysisLatency, setAnalysisLatency] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log state
  const [logEntries, setLogEntries] = useState<AnalysisLogEntry[]>(loadLog);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Server Logs state
  const [serverLogs, setServerLogs] = useState<string>('');
  const [logsError, setLogsError] = useState<string | null>(null);
  const [serverMetrics, setServerMetrics] = useState<{
    memoryPercent: string;
    usedMemMb: number;
    totalMemMb: number;
    cpuPercent: string;
    hddPercent?: string;
    usedHddGb?: number;
    totalHddGb?: number;
  } | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  // ── Server Logs Stream ─────────────────────────────────────────────

  useEffect(() => {
    const abortController = new AbortController();
    
    const startStream = async () => {
      try {
        const baseUrl = import.meta.env.VITE_OLLAMA_API_URL || 'https://201.46.120.192.nip.io/api/chat';
        const logsUrl = baseUrl.replace(/\/api\/chat\/?$/, '/api/logs');
        
        const response = await fetch(logsUrl, {
          method: 'GET',
          headers: {
            'Authorization': import.meta.env.VITE_OLLAMA_API_AUTH || 'Basic YXBpOk0zdW4wbTNAQDE5OTE4'
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error('Falha ao conectar no micro-serviço de logs');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (reader) {
          setServerLogs(`[${new Date().toLocaleTimeString()}] 🟢 Conectado ao canal de métricas e logs.\n[${new Date().toLocaleTimeString()}] ⏳ Aguardando eventos do motor de IA...\n`);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.type === 'metrics') {
                    setServerMetrics({
                      memoryPercent: data.memoryPercent,
                      usedMemMb: data.usedMemMb,
                      totalMemMb: data.totalMemMb,
                      cpuPercent: data.cpuPercent,
                      hddPercent: data.hddPercent,
                      usedHddGb: data.usedHddGb,
                      totalHddGb: data.totalHddGb
                    });
                  } else if (data.type === 'log') {
                    const text = data.line.toLowerCase();
                    
                    let cleanMsg = '';
                    if (text.includes('decoding image') || text.includes('encoding mtmd batch')) {
                      cleanMsg = t('🔄 Lendo e processando a imagem... (CPU em uso intensivo)');
                    } else if (text.includes('image decoded')) {
                      cleanMsg = t('✅ Imagem decodificada. Procurando modelo, marca, montadora e ano de carros compatíveis...');
                    } else if (text.includes('prompt eval time')) {
                      cleanMsg = t('🧠 Finalizando a análise visual e estruturando a resposta...');
                    } else if (text.includes('eval time =')) {
                      cleanMsg = t('✨ Análise concluída com sucesso!');
                    } else if (text.includes('llama_server started')) {
                      cleanMsg = t('🚀 Motor Ollama iniciado e pronto.');
                    } else if (text.includes('llama_model_loader: loaded meta data')) {
                      cleanMsg = t('📦 Carregando modelo na memória...');
                    } else if (text.includes('| 500 |') && text.includes('post') && text.includes('/api/chat')) {
                      cleanMsg = t('❌ Falha no motor de IA (Timeout ou Erro 500) ao tentar processar a imagem.');
                    }

                    if (cleanMsg) {
                      setFrontendStatusMessage(cleanMsg);
                      
                      const timestamp = new Date().toLocaleTimeString();
                      const formattedLine = `[${timestamp}] ${cleanMsg}`;
                      
                      setServerLogs(prev => {
                        const lines = prev.trim().split('\n');
                        const lastLine = lines[lines.length - 1] || '';
                        if (lastLine.includes(cleanMsg)) return prev;

                        const newLogs = prev + formattedLine + '\n';
                        const linesArr = newLogs.trim().split('\n');
                        if (linesArr.length > 50) {
                          return linesArr.slice(linesArr.length - 50).join('\n') + '\n';
                        }
                        return newLogs;
                      });
                    }

                    if (logsRef.current) {
                      logsRef.current.scrollTop = logsRef.current.scrollHeight;
                    }
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setLogsError(err.message || 'Stream connection lost');
        }
      }
    };

    startStream();

    return () => {
      abortController.abort();
    };
  }, []);

  // ── Health Check & Model List ──────────────────────────────────────

  const runHealthCheck = useCallback(async () => {
    setHealth(prev => ({ ...prev, status: 'checking', latencyMs: null }));
    const ollamaBase = (import.meta.env.VITE_OLLAMA_API_URL || 'https://201.46.120.192.nip.io/api/chat').replace('/api/chat', '');
    const authHeader = import.meta.env.VITE_OLLAMA_API_AUTH || 'Basic YXBpOk0zdW4wbTNAQDE5OTE4';

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const [res, psRes] = await Promise.all([
        fetch(`${ollamaBase}/api/tags`, {
          method: 'GET',
          headers: { 'Authorization': authHeader },
          signal: controller.signal,
        }),
        fetch(`${ollamaBase}/api/ps`, {
          method: 'GET',
          headers: { 'Authorization': authHeader },
          signal: controller.signal,
        }).catch(() => null)
      ]);
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);

      if (!res.ok) {
        setHealth(prev => ({
          ...prev,
          status: 'offline',
          latencyMs: elapsed,
          models: [],
          runningModels: [],
          lastChecked: new Date().toISOString(),
        }));
        return;
      }

      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name || m.model || 'unknown');

      let runningModels: string[] = [];
      if (psRes && psRes.ok) {
        const psData = await psRes.json();
        runningModels = (psData.models || []).map((m: any) => m.name || m.model || 'unknown');
      }

      setHealth(prev => ({
        ...prev,
        status: 'online',
        latencyMs: elapsed,
        models,
        runningModels,
        lastChecked: new Date().toISOString(),
      }));

      // Set default selected model if we have models and it's not set or doesn't exist
      if (models.length > 0 && !models.includes(selectedModel)) {
        setSelectedModel(models.includes('qwen3-vl:2b') ? 'qwen3-vl:2b' : models[0]);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setHealth(prev => ({
        ...prev,
        status: err.name === 'AbortError' ? 'timeout' : 'offline',
        latencyMs: elapsed,
        models: [],
        runningModels: [],
        lastChecked: new Date().toISOString(),
      }));
    }
  }, [selectedModel]);

  // Initial health check
  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // ── Model Manager (Download) ───────────────────────────────────────

  const handleDownloadModel = async () => {
    if (!downloadModelName.trim() || isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress({ status: t('Starting...'), pct: 0 });

    try {
      const response = await api.ai.pullModel(downloadModelName.trim());
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.status) {
                  const pct = data.total && data.completed ? Math.round((data.completed / data.total) * 100) : 0;
                  setDownloadProgress({ status: data.status, pct });
                }
              } catch (e) { }
            }
          }
        }
      }
      setDownloadProgress({ status: t('Completed!'), pct: 100 });
      setDownloadModelName('');
      setTimeout(() => {
        setDownloadProgress(null);
        runHealthCheck();
      }, 3000);
    } catch (err: any) {
      setDownloadError(err.message || t('Download failed'));
      setDownloadProgress(null);
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Playground ─────────────────────────────────────────────────────

  const handleImageUpload = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAnalysisError(t('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError(t('File too large. Maximum size is 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const resized = await resizeImage(base64, MAX_IMAGE_SIZE);
      setPlaygroundImage(resized);
      setAnalysisResult(null);
      setAnalysisRawJson('');
      setAnalysisLatency(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const runAnalysis = useCallback(async () => {
    if (!playgroundImage) return;
    setAnalyzing(true);
    setFrontendStatusMessage(t('Imagem recebida. Iniciando análise...'));
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisRawJson('');

    const start = performance.now();
    try {
      const result = await api.ai.analyzePart(playgroundImage, 'pt', selectedModel);
      const elapsed = Math.round(performance.now() - start);
      setAnalysisLatency(elapsed);

      const rawStr = JSON.stringify(result, null, 2);
      setAnalysisRawJson(rawStr);
      setAnalysisResult(result);

      const entry: AnalysisLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        thumbnail: playgroundImage,
        isCarPart: result?.is_car_part ?? null,
        brand: result?.brand || '—',
        category: result?.category || '—',
        title: result?.title || '—',
        latencyMs: elapsed,
        jsonValid: true,
        rawJson: rawStr,
      };

      setLogEntries(prev => {
        const updated = [entry, ...prev];
        saveLog(updated);
        return updated;
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setAnalysisLatency(elapsed);
      setAnalysisError(err.message || t('AI analysis failed'));

      const entry: AnalysisLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        thumbnail: playgroundImage,
        isCarPart: null,
        brand: '—',
        category: '—',
        title: 'ERROR',
        latencyMs: elapsed,
        jsonValid: false,
        rawJson: err.message || 'unknown error',
      };

      setLogEntries(prev => {
        const updated = [entry, ...prev];
        saveLog(updated);
        return updated;
      });
    } finally {
      setAnalyzing(false);
    }
  }, [playgroundImage, selectedModel, t]);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(analysisRawJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  }, [analysisRawJson]);

  const clearLog = useCallback(() => {
    setLogEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Status helpers ─────────────────────────────────────────────────

  const statusColor = (s: HealthStatus['status']) => {
    switch (s) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'timeout': return 'text-yellow-400';
      case 'checking': return 'text-blue-400';
      default: return 'text-[#666]';
    }
  };

  const statusBgPulse = (s: HealthStatus['status']) => {
    switch (s) {
      case 'online': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
      case 'timeout': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
      case 'checking': return 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]';
      default: return 'bg-[#444]';
    }
  };

  const statusLabel = (s: HealthStatus['status']) => {
    switch (s) {
      case 'online': return t('Online');
      case 'offline': return t('Offline');
      case 'timeout': return t('Timeout');
      case 'checking': return t('Checking...');
      default: return t('Not checked');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1100px] mx-auto p-4 md:p-6 space-y-6 text-[#EDEDED] font-sans pb-20">

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-white">{t('AI Operations Center')}</h1>
          <p className="text-[12px] text-[#888]">{t('Monitor, test and debug the AI part analysis engine')}</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — Health Check
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Server size={16} className="text-[#888]" />
            <h2 className="text-[15px] font-semibold text-white">{t('Ollama Server Health')}</h2>
            <div className={`w-2.5 h-2.5 rounded-full ${statusBgPulse(health.status)} transition-all`} />
          </div>
          <button
            onClick={runHealthCheck}
            disabled={health.status === 'checking'}
            className="h-8 px-4 bg-[#1A1A1A] border border-[#333] rounded-lg text-[13px] font-medium text-[#EDEDED] hover:bg-[#2A2A2A] hover:border-[#444] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} className={health.status === 'checking' ? 'animate-spin' : ''} />
            {t('Run Health Check')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#111] border border-[#222] rounded-lg p-3">
            <div className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{t('Status')}</div>
            <div className={`text-[15px] font-semibold ${statusColor(health.status)}`}>
              {statusLabel(health.status)}
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-3">
            <div className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{t('Latency')}</div>
            <div className="text-[15px] font-mono text-white">
              {health.latencyMs !== null ? `${health.latencyMs}ms` : '—'}
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-3">
            <div className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{t('Models')}</div>
            <div className="text-[13px] text-[#EDEDED]">
              {health.models.length > 0
                ? health.models.join(', ')
                : health.status === 'online' ? t('None loaded') : '—'}
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-3">
            <div className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{t('Endpoint')}</div>
            <div className="text-[12px] text-[#AAA] font-mono truncate" title={health.serverUrl}>
              {health.serverUrl.replace('https://', '').replace('/api/chat', '')}
            </div>
          </div>
        </div>

        {health.lastChecked && (
          <div className="mt-3 text-[11px] text-[#555] flex items-center gap-1">
            <Clock size={10} />
            {t('Last checked')}: {new Date(health.lastChecked).toLocaleTimeString()}
          </div>
        )}

        {/* --- Model Downloader --- */}
        <div className="mt-5 pt-4 border-t border-[#222]">
          <h3 className="text-[13px] font-semibold text-white mb-2">{t('Download New Model')}</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={downloadModelName}
                onChange={(e) => setDownloadModelName(e.target.value)}
                placeholder={t('e.g., llama3.2-vision, gemma2')}
                className="w-full h-9 bg-[#111] border border-[#333] rounded-lg px-3 text-[13px] text-[#EDEDED] placeholder-[#555] focus:border-indigo-500 focus:outline-none transition-colors"
                disabled={isDownloading}
              />
            </div>
            <button
              onClick={handleDownloadModel}
              disabled={isDownloading || !downloadModelName.trim()}
              className="w-full sm:w-auto h-9 px-4 bg-[#1A1A1A] border border-[#333] rounded-lg text-[13px] font-medium text-[#EDEDED] hover:bg-[#2A2A2A] hover:border-[#444] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              {isDownloading ? t('Downloading...') : t('Pull Model')}
            </button>
          </div>
          
          {downloadError && (
            <div className="mt-3 text-[12px] text-red-400">{downloadError}</div>
          )}

          {downloadProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-[#888] mb-1">
                <span>{downloadProgress.status}</span>
                {downloadProgress.pct > 0 && <span>{downloadProgress.pct}%</span>}
              </div>
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${downloadProgress.pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — AI Playground
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="flex items-center gap-3 mb-5">
          <Zap size={16} className="text-amber-400" />
          <h2 className="text-[15px] font-semibold text-white">{t('AI Playground')}</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {t('LIVE')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Upload + Controls */}
          <div className="space-y-4">
            {/* Model Selector */}
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <label className="flex items-center justify-between text-[11px] text-[#666] uppercase tracking-wider mb-2">
                <span>{t('Select AI Model')}</span>
                {health.runningModels?.includes(selectedModel) && (
                  <span className="text-green-400 font-bold tracking-normal bg-green-400/10 px-1.5 py-0.5 rounded text-[9px]">
                    {t('LOADED IN RAM')}
                  </span>
                )}
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-9 bg-[#1A1A1A] border border-[#333] rounded-md px-2 text-[13px] text-[#EDEDED] focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {health.models.length > 0 ? (
                  health.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                ) : (
                  <option value="qwen3-vl:2b">qwen3-vl:2b</option>
                )}
              </select>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center gap-3 ${
                playgroundImage
                  ? 'border-[#333] bg-[#111]'
                  : 'border-[#333] hover:border-[#555] bg-[#0D0D0D] hover:bg-[#111]'
              }`}
            >
              {playgroundImage ? (
                <>
                  <img
                    src={playgroundImage}
                    alt="Preview"
                    className="max-h-[200px] rounded-lg object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaygroundImage(null);
                      setAnalysisResult(null);
                      setAnalysisRawJson('');
                      setAnalysisLatency(null);
                      setAnalysisError(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#222] border border-[#444] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center">
                    <Upload size={20} className="text-[#888]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] text-[#AAA]">{t('Drop an image here or click to upload')}</p>
                    <p className="text-[11px] text-[#666] mt-1">{t('JPEG, PNG, WebP • Max 10MB')}</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={!playgroundImage || analyzing}
              className="w-full min-h-10 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-[14px] rounded-lg hover:from-violet-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-violet-500/20 py-2"
            >
              {analyzing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="animate-spin" />
                    <span>{t('Analyzing...')}</span>
                  </div>
                  {frontendStatusMessage && (
                    <span className="text-[11px] font-normal opacity-90 text-center max-w-[90%]">
                      {frontendStatusMessage}
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain size={16} />
                  <span>{t('Run AI Analysis')}</span>
                </div>
              )}
            </button>

            {analysisLatency !== null && (
              <div className="flex items-center gap-4 px-3 py-2 bg-[#111] border border-[#222] rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#888]" />
                  <span className="text-[12px] text-[#AAA]">{t('Latency')}:</span>
                  <span className={`text-[12px] font-mono font-bold ${
                    analysisLatency < 5000 ? 'text-green-400' : analysisLatency < 15000 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(analysisLatency / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-[#888]" />
                  <span className="text-[12px] text-[#AAA]">{t('JSON')}:</span>
                  {analysisResult ? (
                    <CheckCircle2 size={14} className="text-green-400" />
                  ) : analysisError ? (
                    <XCircle size={14} className="text-red-400" />
                  ) : null}
                </div>
              </div>
            )}

            {analysisError && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-300">{analysisError}</p>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {analysisResult ? (
              <>
                <div className="bg-[#111] border border-[#222] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-white">{t('Analysis Result')}</h3>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      analysisResult.is_car_part
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {analysisResult.is_car_part ? t('✓ Car Part') : t('✗ Not a Car Part')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: t('Title'), value: analysisResult.title },
                      { label: t('Brand'), value: analysisResult.brand },
                      { label: t('Model'), value: analysisResult.model },
                      { label: t('Category'), value: analysisResult.category },
                      { label: t('Description'), value: analysisResult.description },
                      { label: t('Est. Price'), value: analysisResult.estimated_price ? `R$ ${analysisResult.estimated_price}` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <span className="text-[11px] text-[#666] w-[80px] shrink-0 pt-0.5">{label}</span>
                        <span className="text-[12px] text-[#EDEDED] break-words">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <span className="text-[12px] font-medium text-[#AAA]">{t('Raw JSON Response')}</span>
                    <div className="flex items-center gap-2">
                      {showRawJson && (
                        <button
                          onClick={(e) => { e.stopPropagation(); copyJson(); }}
                          className="p-1 rounded hover:bg-[#333] transition-colors"
                        >
                          {copiedJson ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-[#888]" />}
                        </button>
                      )}
                      {showRawJson ? <ChevronUp size={14} className="text-[#888]" /> : <ChevronDown size={14} className="text-[#888]" />}
                    </div>
                  </button>
                  {showRawJson && (
                    <div className="px-4 pb-3">
                      <pre className="text-[11px] font-mono text-green-300/80 bg-[#0A0A0A] border border-[#222] rounded-lg p-3 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
                        {analysisRawJson}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center bg-[#111] border border-[#222] rounded-lg gap-3">
                <ImageIcon size={32} className="text-[#333]" />
                <p className="text-[13px] text-[#555]">
                  {analyzing
                    ? t('Processing image with AI...')
                    : t('Upload an image and run analysis to see results')}
                </p>
                {analyzing && (
                  <div className="w-48 h-1.5 rounded-full bg-[#222] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — Server Logs & Metrics
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Server size={16} className="text-pink-400" />
            <h2 className="text-[15px] font-semibold text-white">{t('Server Metrics & Live Logs')}</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              <span className="text-[10px] font-bold text-pink-400">STREAMING</span>
            </div>
          </div>

          {/* Metrics Visualization */}
          {serverMetrics && (
            <div className="flex items-center gap-6">
              {/* CPU */}
              <div className="flex items-center gap-3">
                <Cpu size={14} className="text-[#888]" />
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#888] font-mono">CPU</span>
                    <span className="text-[10px] text-[#EDEDED] font-mono">{serverMetrics.cpuPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${parseFloat(serverMetrics.cpuPercent) > 80 ? 'bg-red-500' : parseFloat(serverMetrics.cpuPercent) > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${serverMetrics.cpuPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="flex items-center gap-3">
                <HardDrive size={14} className="text-[#888]" />
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#888] font-mono">RAM ({serverMetrics.usedMemMb}MB)</span>
                    <span className="text-[10px] text-[#EDEDED] font-mono">{serverMetrics.memoryPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${parseFloat(serverMetrics.memoryPercent) > 85 ? 'bg-red-500' : parseFloat(serverMetrics.memoryPercent) > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${serverMetrics.memoryPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* HDD */}
              {serverMetrics.hddPercent && (
                <div className="flex items-center gap-3">
                  <Database size={14} className="text-[#888]" />
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#888] font-mono">HDD ({serverMetrics.usedHddGb}GB)</span>
                      <span className="text-[10px] text-[#EDEDED] font-mono">{serverMetrics.hddPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${parseFloat(serverMetrics.hddPercent) > 90 ? 'bg-red-500' : parseFloat(serverMetrics.hddPercent) > 75 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                        style={{ width: `${serverMetrics.hddPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {logsError && (
          <div className="mb-4 flex items-start gap-2 px-3 py-2.5 bg-red-500/5 border border-red-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-300">{logsError}</p>
          </div>
        )}

        <div className="bg-[#050505] border border-[#222] rounded-lg overflow-hidden flex flex-col h-[300px]">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border-b border-[#222] shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px] font-mono text-[#666]">{t('AI Analysis Pipeline Status')}</span>
          </div>
          <div 
            ref={logsRef}
            className="p-4 overflow-x-auto overflow-y-auto flex-1 scroll-smooth"
          >
            {serverLogs ? (
              <pre className="text-[12px] font-mono text-green-400 whitespace-pre-wrap break-words leading-relaxed">
                {serverLogs}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-[#555] text-[13px] font-mono">
                <RefreshCw size={14} className="animate-spin mr-2" />
                {t('Connecting to real-time log stream...')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — Analysis Log History
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyan-400" />
            <h2 className="text-[15px] font-semibold text-white">{t('Analysis History')}</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222] text-[#888] border border-[#333]">
              {logEntries.length} {t('entries')}
            </span>
          </div>
          {logEntries.length > 0 && (
            <button
              onClick={clearLog}
              className="h-7 px-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[11px] font-medium text-[#888] hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-1.5"
            >
              <Trash2 size={11} />
              {t('Clear History')}
            </button>
          )}
        </div>

        {logEntries.length === 0 ? (
          <div className="py-8 flex flex-col items-center gap-2">
            <Activity size={24} className="text-[#333]" />
            <p className="text-[13px] text-[#555]">{t('No analysis tests yet. Use the playground above to start.')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-[#333] transition-colors"
              >
                <button
                  onClick={() => setExpandedLogId(expandedLogId === entry.id ? null : entry.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                >
                  <img
                    src={entry.thumbnail}
                    alt=""
                    className="w-9 h-9 rounded-md object-cover border border-[#333] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#EDEDED] truncate">{entry.title}</p>
                      <p className="text-[11px] text-[#666]">
                        {entry.brand} · {entry.category}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {entry.isCarPart === true && <CheckCircle2 size={14} className="text-green-400" />}
                      {entry.isCarPart === false && <XCircle size={14} className="text-red-400" />}
                      {entry.isCarPart === null && <AlertTriangle size={14} className="text-yellow-400" />}
                    </div>

                    <span className={`text-[11px] font-mono shrink-0 ${
                      entry.latencyMs < 5000 ? 'text-green-400' : entry.latencyMs < 15000 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {(entry.latencyMs / 1000).toFixed(1)}s
                    </span>

                    <div className="shrink-0">
                      {entry.jsonValid ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">JSON ✓</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">FAIL</span>
                      )}
                    </div>

                    <span className="text-[10px] text-[#555] shrink-0 hidden sm:block">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`text-[#666] shrink-0 transition-transform ${expandedLogId === entry.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expandedLogId === entry.id && (
                  <div className="px-3 pb-3 border-t border-[#222]">
                    <pre className="text-[10px] font-mono text-[#AAA] bg-[#0A0A0A] border border-[#222] rounded-lg p-2 mt-2 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words">
                      {entry.rawJson}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
