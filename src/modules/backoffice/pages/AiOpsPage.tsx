import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '@/modules/shared/lib/i18n';
import { api } from '@/modules/transactions/api/api';
import { getRedisKeys, deleteRedisKey, getCache } from '@/modules/shared/lib/redisCache';
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

const DEFAULT_SYSTEM_PROMPT = `Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos:
{
  "is_car_part": boolean (true se a imagem contiver uma peça de carro, etiqueta/sticker de peça, motor, radiador ou componente automotivo, false caso contrário),
  "part_number": string | null,
  "brand": string (a marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan. Se for uma marca de autopeças como Bosch/Denso, retorne a marca do carro em que ela é aplicada),
  "model": string (o modelo do CARRO/VEÍCULO compatível, ex: prius, aqua, fit, note. NÃO retorne o modelo da própria peça, retorne o nome do carro),
  "category": string,
  "title": string,
  "description": string (descrição técnica altamente detalhada. Você DEVE extrair e incluir especificações cruciais como amperagem/Ah, voltagem/V, CCA, dimensões e polaridade no caso de baterias. Além disso, DEVE listar as principais marcas e modelos de carros compatíveis conhecidos para esta peça, ex: compatível com Honda Fit, Toyota Prius, etc.),
  "estimated_price": number,
  "confidence_score": number
}
IMPORTANTE: Retorne os textos descritivos (title e description) no idioma com código 'pt'.`;

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

const HudCorners = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />
  </>
);

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

  // New States for enhanced AI Playground & Quality Metrics
  const [analysisMode, setAnalysisMode] = useState<'pipeline' | 'local'>('pipeline');
  const [playgroundVin, setPlaygroundVin] = useState<string>('');
  const [logsTab, setLogsTab] = useState<'db' | 'local'>('db');
  
  const [dbLogs, setDbLogs] = useState<AnalysisLogEntry[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingDbLogs, setLoadingDbLogs] = useState<boolean>(false);
  const [dbLogsError, setDbLogsError] = useState<string | null>(null);
  const [openrouterData, setOpenrouterData] = useState<any>(null);
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    return localStorage.getItem('daig_ai_ops_custom_prompt') || DEFAULT_SYSTEM_PROMPT;
  });
  const [isSavedPrompt, setIsSavedPrompt] = useState<boolean>(true);

  // Log state
  const [logEntries, setLogEntries] = useState<AnalysisLogEntry[]>(loadLog);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Tab layout state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'playground' | 'prompt' | 'redis'>('dashboard');
  const [redisKeys, setRedisKeys] = useState<string[]>([]);
  const [loadingRedis, setLoadingRedis] = useState<boolean>(false);
  const [selectedRedisKey, setSelectedRedisKey] = useState<string | null>(null);
  const [selectedRedisValue, setSelectedRedisValue] = useState<any>(null);
  const [redisError, setRedisError] = useState<string | null>(null);

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

  const saveCustomPrompt = useCallback(() => {
    localStorage.setItem('daig_ai_ops_custom_prompt', systemPrompt);
    setIsSavedPrompt(true);
  }, [systemPrompt]);

  const resetDefaultPrompt = useCallback(() => {
    if (window.confirm(t('Are you sure you want to restore the default system instructions?'))) {
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      localStorage.removeItem('daig_ai_ops_custom_prompt');
      setIsSavedPrompt(true);
    }
  }, [t]);

  const loadRedisKeys = useCallback(async () => {
    setLoadingRedis(true);
    setRedisError(null);
    try {
      const keys = await getRedisKeys('ai_analysis_or_*');
      setRedisKeys(keys);
    } catch (e: any) {
      setRedisError(e.message || 'Error loading Redis keys');
    } finally {
      setLoadingRedis(false);
    }
  }, []);

  const loadRedisValue = useCallback(async (key: string) => {
    setSelectedRedisKey(key);
    setSelectedRedisValue(null);
    try {
      const val = await getCache(key);
      setSelectedRedisValue(val);
    } catch (e: any) {
      console.warn('Error reading Redis key:', e);
    }
  }, []);

  const deleteKey = useCallback(async (key: string) => {
    const ok = await deleteRedisKey(key);
    if (ok) {
      if (selectedRedisKey === key) {
        setSelectedRedisKey(null);
        setSelectedRedisValue(null);
      }
      loadRedisKeys();
    }
  }, [selectedRedisKey, loadRedisKeys]);

  const clearAllCache = useCallback(async () => {
    if (!window.confirm(t('Are you sure you want to delete all cached AI classification payloads?'))) return;
    try {
      setLoadingRedis(true);
      for (const key of redisKeys) {
        await deleteRedisKey(key);
      }
      setSelectedRedisKey(null);
      setSelectedRedisValue(null);
      await loadRedisKeys();
    } catch (e: any) {
      setRedisError(e.message || 'Error clearing keys');
    } finally {
      setLoadingRedis(false);
    }
  }, [redisKeys, loadRedisKeys, t]);

  useEffect(() => {
    if (activeTab === 'redis') {
      loadRedisKeys();
    }
  }, [activeTab, loadRedisKeys]);

  const loadDbLogs = useCallback(async () => {
    setLoadingDbLogs(true);
    setDbLogsError(null);
    try {
      const res = await api.ai.fetchAuditLogs();
      const parsedLogs: AnalysisLogEntry[] = (res.logs || []).map((log: any) => ({
        id: log.id,
        timestamp: log.created_at,
        thumbnail: '', // Sem thumbnail para logs do banco
        isCarPart: Number(log.confidence || 0) > 0.0 && !log.brand_mismatch, 
        brand: log.brand_detected || '—',
        category: log.source || '—',
        title: log.part_number_detected ? `${t('Código')}: ${log.part_number_detected}` : t('Peça Automotiva'),
        latencyMs: 0,
        jsonValid: true,
        rawJson: JSON.stringify(log, null, 2),
      }));
      setDbLogs(parsedLogs);
      setDbStats(res.stats);
      setOpenrouterData(res.openrouter || null);
    } catch (err: any) {
      console.error('Error fetching db logs:', err);
      setDbLogsError(err.message || t('Failed to load global audit logs'));
      setOpenrouterData(null);
    } finally {
      setLoadingDbLogs(false);
    }
  }, [t]);

  // Initial health check & db logs load
  useEffect(() => {
    runHealthCheck();
    loadDbLogs();
  }, [runHealthCheck, loadDbLogs]);

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
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisRawJson('');

    const start = performance.now();

    if (analysisMode === 'pipeline') {
      setFrontendStatusMessage(t('Imagem enviada. Iniciando pipeline redundante no backend...'));
      try {
        const result = await api.ai.analyzePart(playgroundImage, 'pt', playgroundVin, systemPrompt);
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

        // Recarregar os logs globais do banco para atualizar as estatísticas
        loadDbLogs();
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
    } else {
      // MODO LOCAL: Chamada direta ao Ollama local
      setFrontendStatusMessage(t('Enviando imagem diretamente para o modelo Ollama local...'));
      try {
        const base64ImageOnly = playgroundImage.split(',')[1] || playgroundImage;
        const promptVision = systemPrompt;

        const response = await fetch(health.serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': import.meta.env.VITE_OLLAMA_API_AUTH || 'Basic YXBpOk0zdW4wbTNAQDE5OTE4'
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'user',
                content: promptVision,
                images: [base64ImageOnly]
              }
            ],
            format: 'json',
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`${t('Ollama API error')}: HTTP ${response.status}`);
        }

        const data = await response.json();
        const content = data.message?.content || '{}';
        
        let parsedResult: any = {};
        let isValid = false;
        try {
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
          }
          parsedResult = JSON.parse(cleanContent);
          isValid = true;
        } catch (jsonErr) {
          console.warn('Falha ao parsear JSON retornado pelo Ollama:', jsonErr);
          parsedResult = { error_parse: true, raw: content };
        }

        const elapsed = Math.round(performance.now() - start);
        setAnalysisLatency(elapsed);
        setAnalysisRawJson(JSON.stringify(parsedResult, null, 2));
        setAnalysisResult(parsedResult);

        const entry: AnalysisLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          thumbnail: playgroundImage,
          isCarPart: parsedResult.is_car_part ?? null,
          brand: parsedResult.brand || '—',
          category: parsedResult.category || '—',
          title: parsedResult.title || `Local: ${selectedModel}`,
          latencyMs: elapsed,
          jsonValid: isValid,
          rawJson: JSON.stringify(parsedResult, null, 2),
        };

        setLogEntries(prev => {
          const updated = [entry, ...prev];
          saveLog(updated);
          return updated;
        });

      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);
        setAnalysisLatency(elapsed);
        setAnalysisError(err.message || t('Local AI analysis failed'));

        const entry: AnalysisLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          thumbnail: playgroundImage,
          isCarPart: null,
          brand: '—',
          category: '—',
          title: 'LOCAL ERROR',
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
    }
  }, [playgroundImage, selectedModel, analysisMode, playgroundVin, health.serverUrl, t, loadDbLogs, systemPrompt]);

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
    <div className="relative min-h-screen cyber-grid bg-[#020205] p-4 md:p-6 text-[#EDEDED] font-sans pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/20 via-black/40 to-cyan-950/10 pointer-events-none" />
      <div className="max-w-[1100px] mx-auto space-y-6 relative z-10">

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

      {/* Sci-Fi Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1e293b] pb-px mb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`h-9 px-4 text-[12px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'dashboard'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-400/5'
              : 'border-transparent text-[#666] hover:text-[#AAA]'
          }`}
        >
          <Activity size={14} />
          {t('Dashboard & Billing')}
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`h-9 px-4 text-[12px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'playground'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-400/5'
              : 'border-transparent text-[#666] hover:text-[#AAA]'
          }`}
        >
          <Zap size={14} />
          {t('AI Playground')}
        </button>
        <button
          onClick={() => setActiveTab('prompt')}
          className={`h-9 px-4 text-[12px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'prompt'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-400/5'
              : 'border-transparent text-[#666] hover:text-[#AAA]'
          }`}
        >
          <Brain size={14} />
          {t('Prompt Training')}
        </button>
        <button
          onClick={() => setActiveTab('redis')}
          className={`h-9 px-4 text-[12px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'redis'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-400/5'
              : 'border-transparent text-[#666] hover:text-[#AAA]'
          }`}
        >
          <Database size={14} />
          {t('Redis Cache')}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 gap-6">

        {/* OpenRouter Billing & Key Status Card */}
        <div className="bg-[#080810]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300 animate-cyber-pulse flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
          <HudCorners />
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-indigo-400" />
                <h2 className="text-[15px] font-semibold text-white tracking-wide">{t('OpenRouter API & Billing')}</h2>
                {openrouterData?.key ? (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    openrouterData.key.is_active 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {openrouterData.key.is_active ? t('Active') : t('Inactive')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#222] text-[#666] border border-[#333]">
                    {t('Loading...')}
                  </span>
                )}
              </div>
              <button
                onClick={loadDbLogs}
                disabled={loadingDbLogs}
                className="h-8 px-4 bg-[#141624] border border-[#2c324e] rounded-lg text-[13px] font-medium text-[#EDEDED] hover:bg-[#1a1d30] hover:border-indigo-500/30 hover:text-white disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} className={loadingDbLogs ? 'animate-spin' : ''} />
                {t('Refresh Credits')}
              </button>
            </div>

            {openrouterData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#121422] border border-[#22283d] rounded-lg p-3.5 hover:border-[#3b4260] transition-colors">
                    <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1 font-semibold">{t('Key Label')}</div>
                    <div className="text-[13px] font-bold text-white truncate" title={openrouterData?.key?.label}>
                      {openrouterData?.key?.label || '—'}
                    </div>
                  </div>
                  <div className="bg-[#121422] border border-[#22283d] rounded-lg p-3.5 hover:border-[#3b4260] transition-colors">
                    <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1 font-semibold">{t('Spent Credits')}</div>
                    <div className="text-[15px] font-mono font-bold text-red-400">
                      ${Number(openrouterData?.key?.usage || 0).toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-[#121422] border border-[#22283d] rounded-lg p-3.5 hover:border-[#3b4260] transition-colors">
                    <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1 font-semibold">{t('Key Credit Limit')}</div>
                    <div className="text-[14px] font-mono font-bold text-[#AAA]">
                      {openrouterData?.key?.limit !== null ? `$${Number(openrouterData.key.limit).toFixed(2)}` : t('Unlimited')}
                    </div>
                  </div>
                  <div className="bg-[#121422] border border-[#22283d] rounded-lg p-3.5 hover:border-[#3b4260] transition-colors">
                    <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1 font-semibold">{t('Limit Remaining')}</div>
                    <div className="text-[14px] font-mono font-bold text-green-400">
                      {openrouterData?.key?.limit_remaining !== null ? `$${Number(openrouterData.key.limit_remaining).toFixed(4)}` : t('Unlimited')}
                    </div>
                  </div>
                </div>

                {/* Account-wide Credits if management key available */}
                {openrouterData.credits && (
                  <div className="mt-4 pt-4 border-t border-[#22283d] space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#888] font-semibold">{t('Account Balance')}</span>
                      <span className="font-mono text-green-400 font-bold">
                        ${(Number(openrouterData.credits.total_credits || 0) - Number(openrouterData.credits.total_usage || 0)).toFixed(4)} {t('remaining')}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#121422] rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(100, (Number(openrouterData.credits.total_usage || 0) / Math.max(1, Number(openrouterData.credits.total_credits || 1))) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#666] font-mono font-semibold">
                      <span>{t('Total Spent')}: ${Number(openrouterData.credits.total_usage || 0).toFixed(4)}</span>
                      <span>{t('Total Purchased')}: ${Number(openrouterData.credits.total_credits || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-[#555] text-[13px]">
                <Cpu size={24} className="animate-pulse mb-2 text-[#333]" />
                <p>{t('Carregando informações da API...')}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-[10px] text-[#555] flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-[#666]" />
            <span>{t('Consultas financeiras utilizam a chave OPENROUTER_API_KEY do backend.')}</span>
          </div>
        </div>

      </div>
      )}

      {activeTab === 'playground' && (
        <div className="bg-[#080810]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 relative overflow-hidden shadow-2xl transition-all duration-300 animate-cyber-pulse">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
        <HudCorners />

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
            {/* Mode Selection */}
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <label className="text-[11px] text-[#666] uppercase tracking-wider mb-2 block font-semibold">
                {t('Analysis Mode')}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#1A1A1A] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAnalysisMode('pipeline')}
                  className={`h-8 rounded-md text-[12px] font-semibold transition-all ${
                    analysisMode === 'pipeline'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  {t('Production Pipeline')}
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisMode('local')}
                  className={`h-8 rounded-md text-[12px] font-semibold transition-all ${
                    analysisMode === 'local'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  {t('Direct Local Model')}
                </button>
              </div>
            </div>

            {/* Model Selector (Only visible for local mode) */}
            {analysisMode === 'local' ? (
              <div className="bg-[#111] border border-[#222] rounded-lg p-3 transition-all animate-fadeIn">
                <label className="flex items-center justify-between text-[11px] text-[#666] uppercase tracking-wider mb-2 font-semibold">
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
            ) : (
              <div className="bg-[#111]/40 border border-[#222]/30 rounded-lg p-3 text-[11px] text-[#888] leading-relaxed">
                <span className="text-[#AAA] font-semibold block mb-1">⚡ {t('Redundant Production Engine')}</span>
                {t('This mode triggers the production visual pipeline (Qwen3-VL 235B + Gemini 3.5 Flash) integrated with official part catalog search (local DB + web scrap via Perplexity Sonar) and chassis cross-referencing.')}
              </div>
            )}

            {/* VIN / Chassis Input */}
            {analysisMode === 'pipeline' && (
              <div className="bg-[#111] border border-[#222] rounded-lg p-3 transition-all animate-fadeIn">
                <label className="text-[11px] text-[#666] uppercase tracking-wider mb-2 block font-semibold">
                  {t('Número de Chassi / VIN (Opcional)')}
                </label>
                <input
                  type="text"
                  value={playgroundVin}
                  onChange={(e) => setPlaygroundVin(e.target.value)}
                  placeholder={t('e.g., JTD123456789...')}
                  className="w-full h-9 bg-[#1A1A1A] border border-[#333] rounded-md px-3 text-[13px] text-[#EDEDED] placeholder-[#444] focus:border-violet-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            )}

            {/* System Prompt Editor (Prompt Playground) */}
            <div className="bg-[#121422] border border-[#22283d] rounded-lg p-3 transition-all">
              <button
                type="button"
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="w-full flex items-center justify-between text-[11px] text-white uppercase tracking-wider font-semibold hover:text-violet-400 transition-colors"
              >
                <span>⚙️ {t('System Prompt Editor (Prompt Playground)')}</span>
                <span className="text-[10px] text-violet-400 font-mono">
                  {showPromptEditor ? t('[ Hide ]') : t('[ Edit ]')}
                </span>
              </button>
              
              {showPromptEditor && (
                <div className="mt-3.5 space-y-2.5 animate-fadeIn">
                  <p className="text-[11px] text-[#888] leading-normal">
                    {t('Adjust the system instructions below to test and fine-tune how the models behave during image classification.')}
                  </p>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={12}
                    className="w-full bg-[#0d0e17] border border-[#2c324e] rounded-md p-3 text-[11.5px] font-mono text-[#DEDEDE] placeholder-[#555] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setSystemPrompt(
                        `Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos:
{
  "is_car_part": boolean (true se a imagem contiver uma peça de carro, etiqueta/sticker de peça, motor, radiador ou componente automotivo, false caso contrário),
  "part_number": string | null,
  "brand": string (a marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan. Se for uma marca de autopeças como Bosch/Denso, retorne a marca do carro em que ela é aplicada),
  "model": string (o modelo do CARRO/VEÍCULO compatível, ex: prius, aqua, fit, note. NÃO retorne o modelo da própria peça, retorne o nome do carro),
  "category": string,
  "title": string,
  "description": string (descrição técnica altamente detalhada. Você DEVE extrair e incluir especificações cruciais como amperagem/Ah, voltagem/V, CCA, dimensões e polaridade no caso de baterias. Além disso, DEVE listar as principais marcas e modelos de carros compatíveis conhecidos para esta peça, ex: compatível com Honda Fit, Toyota Prius, etc.),
  "estimated_price": number,
  "confidence_score": number
}
IMPORTANTE: Retorne os textos descritivos (title e description) no idioma com código 'pt'.`
                      )}
                      className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors animate-pulse"
                    >
                      {t('Reset Default Prompt')}
                    </button>
                    <span className="text-[9px] text-[#666] font-mono">
                      {systemPrompt.length} chars
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[220px] flex flex-col items-center justify-center gap-3 overflow-hidden ${
                playgroundImage
                  ? 'border-[#22283d] bg-[#0c0d16]/30'
                  : 'border-[#1e293b] hover:border-cyan-500/40 bg-[#08080f] hover:bg-[#0c0c16] shadow-inner'
              }`}
            >
              {/* Laser scanner line when analyzing */}
              {analyzing && <div className="animate-cyber-scan" />}

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
      )}

      {activeTab === 'dashboard' && (
        <div className="bg-[#080810]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 relative overflow-hidden shadow-2xl transition-all duration-300 animate-cyber-pulse">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
        <HudCorners />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyan-400" />
            <h2 className="text-[15px] font-semibold text-white">{t('Analysis History')}</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222] text-[#888] border border-[#333]">
              {logsTab === 'db' ? dbLogs.length : logEntries.length} {t('entries')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {logsTab === 'db' && (
              <button
                onClick={loadDbLogs}
                disabled={loadingDbLogs}
                className="h-7 px-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[11px] font-medium text-[#888] hover:text-white transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={11} className={loadingDbLogs ? 'animate-spin' : ''} />
                {t('Reload')}
              </button>
            )}
            {logsTab === 'local' && logEntries.length > 0 && (
              <button
                onClick={clearLog}
                className="h-7 px-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[11px] font-medium text-[#888] hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={11} />
                {t('Clear History')}
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#222] mb-5">
          <button
            onClick={() => setLogsTab('db')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              logsTab === 'db'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-[#666] hover:text-[#AAA]'
            }`}
          >
            {t('Global Audit Logs (Database)')}
          </button>
          <button
            onClick={() => setLogsTab('local')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              logsTab === 'local'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-[#666] hover:text-[#AAA]'
            }`}
          >
            {t('Local Playground Tests')}
          </button>
        </div>

        {/* Quality Metrics Dashboard */}
        {logsTab === 'db' && dbStats && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111]/60 border border-[#222] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">{t('Volume Total')}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{dbStats.absoluteTotal}</span>
                  <span className="text-[9px] text-[#555]">{t('análises')}</span>
                </div>
              </div>
              
              <div className="bg-[#111]/60 border border-[#222] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">{t('Confiança Média')}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-green-400">{(dbStats.avgConfidence * 100).toFixed(1)}%</span>
                  <span className="text-[9px] text-[#555]">{t('acurácia')}</span>
                </div>
              </div>
              
              <div className="bg-[#111]/60 border border-[#222] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">{t('Divergências')}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold ${dbStats.mismatchCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{dbStats.mismatchCount}</span>
                  <span className="text-[9px] text-[#555]">
                    ({dbStats.sampleSize > 0 ? ((dbStats.mismatchCount / dbStats.sampleSize) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="bg-[#111]/60 border border-[#222] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">{t('Correções de Chassi')}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-indigo-400">{dbStats.fallbackCount}</span>
                  <span className="text-[9px] text-[#555]">{t('resolvidos')}</span>
                </div>
              </div>
            </div>

            {/* Source Distribution Bar */}
            {dbStats.sampleSize > 0 && (
              <div className="bg-[#111]/30 border border-[#222]/80 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-[#666] uppercase tracking-wider font-semibold">{t('Distribuição de Origem dos Dados')}</span>
                  <span className="text-[10px] text-[#888]">{t('Amostra de')} {dbStats.sampleSize} {t('itens')}</span>
                </div>
                <div className="h-3 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${((dbStats.sources.local_catalog || 0) / dbStats.sampleSize) * 100}%` }}
                    title={`Catálogo Local: ${dbStats.sources.local_catalog || 0}`}
                  />
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${((dbStats.sources.web_catalog || 0) / dbStats.sampleSize) * 100}%` }}
                    title={`Catálogo Web (Perplexity): ${dbStats.sources.web_catalog || 0}`}
                  />
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${((dbStats.sources.vision_only || 0) / dbStats.sampleSize) * 100}%` }}
                    title={`Somente Visão: ${dbStats.sources.vision_only || 0}`}
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-[#888]">Catálogo Local ({dbStats.sources.local_catalog || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] text-[#888]">Catálogo Web ({dbStats.sources.web_catalog || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-[#888]">Somente Visão ({dbStats.sources.vision_only || 0})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {logsTab === 'db' ? (
          loadingDbLogs ? (
            <div className="py-8 flex flex-col items-center gap-2">
              <RefreshCw size={24} className="text-cyan-400 animate-spin" />
              <p className="text-[13px] text-[#555]">{t('Carregando logs de auditoria globais...')}</p>
            </div>
          ) : dbLogsError ? (
            <div className="py-8 flex flex-col items-center gap-2 text-red-400">
              <AlertTriangle size={24} />
              <p className="text-[13px]">{dbLogsError}</p>
              <button 
                onClick={loadDbLogs}
                className="mt-2 h-7 px-3 bg-[#221010] border border-red-500/20 text-red-300 rounded hover:bg-[#331515] text-[11px] transition-colors"
              >
                {t('Tentar Novamente')}
              </button>
            </div>
          ) : dbLogs.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2">
              <Activity size={24} className="text-[#333]" />
              <p className="text-[13px] text-[#555]">{t('Nenhum log de auditoria global encontrado no banco.')}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {dbLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-[#333] transition-colors"
                >
                  <button
                    onClick={() => setExpandedLogId(expandedLogId === entry.id ? null : entry.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                  >
                    <div className="w-9 h-9 rounded-md bg-[#1C1D24] border border-[#2B2D3A] flex items-center justify-center shrink-0">
                      <Database size={16} className="text-[#666]" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] text-[#EDEDED] truncate font-semibold">{entry.title}</p>
                        <p className="text-[11px] text-[#666]">
                          {entry.brand} · <span className="font-mono text-[10px] text-cyan-400/80">{entry.category}</span>
                        </p>
                      </div>

                      <div className="shrink-0">
                        {entry.isCarPart ? (
                          <CheckCircle2 size={14} className="text-green-400" />
                        ) : (
                          <AlertTriangle size={14} className="text-yellow-400" />
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
                      <pre className="text-[10px] font-mono text-[#AAA] bg-[#0A0A0A] border border-[#222] rounded-lg p-2 mt-2 overflow-x-auto max-h-[250px] overflow-y-auto whitespace-pre-wrap break-words">
                        {entry.rawJson}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          logEntries.length === 0 ? (
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
          )
        )}
      </div>
      )}

      {activeTab === 'prompt' && (
        <div className="bg-[#080810]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300 animate-cyber-pulse">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(124,58,237,0.4)]" />
          <HudCorners />
          
          <div className="flex items-center gap-3 mb-5 border-b border-[#22283d] pb-4">
            <Brain size={18} className="text-violet-400" />
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-wide">{t('System Prompt Tuning (AI Training)')}</h2>
              <p className="text-[11px] text-[#666] mt-0.5">{t('Refine rules and structural response templates here to train how the AI behaves during analyses.')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => {
                    setSystemPrompt(e.target.value);
                    setIsSavedPrompt(false);
                  }}
                  rows={18}
                  className="w-full bg-[#050508] border border-[#2c324e] rounded-lg p-4 text-[12px] font-mono text-[#DEDEDE] leading-relaxed focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-[#555] font-mono">
                  {systemPrompt.length} chars
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#111322] border border-[#22283d] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSavedPrompt ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`} />
                  <span className="text-[11px] text-[#AAA] font-medium">
                    {isSavedPrompt ? t('Active Custom Prompt Enabled') : t('Unsaved changes in prompt')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetDefaultPrompt}
                    className="text-[11.5px] text-[#888] hover:text-white font-medium transition-colors bg-[#1a1d30]/50 hover:bg-[#1a1d30] px-3 py-1.5 rounded border border-[#2c324e]"
                  >
                    {t('Restore Default')}
                  </button>
                  <button
                    type="button"
                    onClick={saveCustomPrompt}
                    className={`h-8 px-4 rounded text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-lg ${
                      isSavedPrompt
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:from-violet-500 hover:to-indigo-400 shadow-violet-500/10 active:scale-95'
                    }`}
                  >
                    <Check size={13} />
                    {isSavedPrompt ? t('Saved') : t('Save Training')}
                  </button>
                </div>
              </div>
            </div>

            {/* Presets and Guidelines */}
            <div className="space-y-4">
              <div className="bg-[#121422] border border-[#22283d] rounded-lg p-4 space-y-3">
                <h3 className="text-[12px] font-semibold text-white tracking-wider uppercase">{t('Model Target Presets')}</h3>
                <p className="text-[11px] text-[#888] leading-relaxed">{t('Quickly switch between pre-tuned instruction frameworks optimized for different parts categories:')}</p>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setSystemPrompt(prev => prev + `\n\nADICIONAL: Foque em extrair amperagem (Ah), polaridade, CCA e tamanho se a peça for uma bateria.`);
                      setIsSavedPrompt(false);
                    }}
                    className="w-full text-left text-[11px] text-[#BBB] hover:text-white bg-[#1a1d30]/50 border border-[#2c324e] rounded p-2 hover:bg-[#1a1d30] transition-colors"
                  >
                    🔋 <strong>{t('Battery Analyzer Add-on')}</strong>
                    <span className="block text-[10px] text-[#666] mt-0.5">{t('Instructs AI to fetch capacity specs')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSystemPrompt(prev => prev + `\n\nADICIONAL: Se houver part number na peça, extraia exatamente como escrito.`);
                      setIsSavedPrompt(false);
                    }}
                    className="w-full text-left text-[11px] text-[#BBB] hover:text-white bg-[#1a1d30]/50 border border-[#2c324e] rounded p-2 hover:bg-[#1a1d30] transition-colors"
                  >
                    🔍 <strong>{t('Part Number Specialist')}</strong>
                    <span className="block text-[10px] text-[#666] mt-0.5">{t('Prioritize identification sticker scan')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#121422] border border-[#22283d] rounded-lg p-4 space-y-2">
                <h3 className="text-[12px] font-semibold text-white tracking-wider uppercase">{t('Tuning Guidelines')}</h3>
                <ul className="text-[11px] text-[#888] space-y-2 list-disc list-inside">
                  <li>{t('Return ONLY valid, parsable JSON matching the fields requested.')}</li>
                  <li>{t('Avoid any markdown wrap besides standard JSON.')}</li>
                  <li>{t('Specify vehicle compatibility mapping in detail for the description field.')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'redis' && (
        <div className="bg-[#080810]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300 animate-cyber-pulse">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-600 via-indigo-500 to-violet-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
          <HudCorners />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#22283d] pb-4">
            <div className="flex items-center gap-3">
              <Database size={18} className="text-cyan-400" />
              <div>
                <h2 className="text-[15px] font-semibold text-white tracking-wide">{t('Upstash Redis Cache')}</h2>
                <p className="text-[11px] text-[#666] mt-0.5">{t('Inspect, query, and clear cached AI visual analysis records in Upstash Redis.')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadRedisKeys}
                disabled={loadingRedis}
                className="h-8 px-3.5 bg-[#141624] border border-[#2c324e] rounded-lg text-[12px] font-medium text-[#EDEDED] hover:bg-[#1a1d30] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={loadingRedis ? 'animate-spin' : ''} />
                {t('Reload Keys')}
              </button>
              {redisKeys.length > 0 && (
                <button
                  onClick={clearAllCache}
                  disabled={loadingRedis}
                  className="h-8 px-3.5 bg-red-950/20 border border-red-900/30 rounded-lg text-[12px] font-semibold text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  {t('Clear Cache')}
                </button>
              )}
            </div>
          </div>

          {redisError && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/5 border border-red-500/20 rounded-lg text-[12px] text-red-400">
              {redisError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Keys list */}
            <div className="md:col-span-1 border border-[#22283d] bg-[#050508] rounded-lg p-3 flex flex-col h-[400px]">
              <div className="text-[10px] text-[#666] uppercase tracking-wider mb-2 font-semibold flex items-center justify-between">
                <span>{t('Cached Keys')}</span>
                <span className="font-mono text-cyan-400">{redisKeys.length}</span>
              </div>

              {loadingRedis && redisKeys.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#555] text-xs">
                  <RefreshCw size={14} className="animate-spin mr-1.5" />
                  {t('Loading keys...')}
                </div>
              ) : redisKeys.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#444] text-[11px] text-center px-4 leading-normal">
                  {t('No cached AI classifications found in Redis.')}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {redisKeys.map(k => (
                    <div 
                      key={k} 
                      className={`group flex items-center justify-between p-2 rounded text-[11.5px] font-mono cursor-pointer transition-colors border ${
                        selectedRedisKey === k 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                          : 'bg-[#121422]/40 border-transparent hover:bg-[#121422] text-[#AAA]'
                      }`}
                      onClick={() => loadRedisValue(k)}
                    >
                      <span className="truncate flex-1 pr-2">{k.replace('ai_analysis_or_', '')}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteKey(k);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-[#555] transition-opacity p-0.5"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inspector */}
            <div className="md:col-span-2 border border-[#22283d] bg-[#050508] rounded-lg p-4 flex flex-col h-[400px]">
              {selectedRedisKey ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-[#22283d] pb-2.5 mb-3">
                    <div className="min-w-0 flex-1 pr-4">
                      <span className="text-[10px] text-[#666] uppercase tracking-wider block font-semibold">{t('Active Inspector Key')}</span>
                      <span className="font-mono text-[11px] text-cyan-400 truncate block mt-0.5">{selectedRedisKey}</span>
                    </div>
                    <button
                      onClick={() => deleteKey(selectedRedisKey)}
                      className="h-7 px-3 bg-red-950/20 border border-red-900/30 rounded text-[11px] font-semibold text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 size={11} />
                      {t('Delete Key')}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[#0a0a0f] border border-[#1e293b]/50 rounded-lg p-3 font-mono text-[11.5px] text-[#E0E0E0] whitespace-pre-wrap">
                    {selectedRedisValue ? (
                      <pre className="text-green-400 leading-relaxed">
                        {JSON.stringify(selectedRedisValue, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#555]">
                        <RefreshCw size={14} className="animate-spin mr-1.5" />
                        {t('Fetching cache payload...')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-[#555]">
                  <Database size={24} className="mb-2 text-[#333]" />
                  <p className="text-xs">{t('Select a cache key from the list to inspect its contents.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
