import { Upload, X, Loader2, Sparkles, Box, CheckCircle, AlertTriangle } from 'lucide-react';
import { CarPartScannerAnimation } from './CarPartScannerAnimation';

interface Props {
  t: (key: string) => string;
  images: string[];
  aiError: string | null;
  aiEnabled: boolean;
  vin: string;
  analyzing: boolean;
  generating3D: boolean;
  aiProgress: number;
  model3DUrl: string | null;
  partNumber: string | null;
  isOfficialData: boolean;
  brandMismatch: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  setVin: (vin: string) => void;
  analyzeWithAI: () => void;
}

export function ListingImageUpload({
  t, images, aiError, aiEnabled, vin, analyzing, generating3D, aiProgress, model3DUrl,
  partNumber, isOfficialData, brandMismatch, handleImageChange, removeImage, setVin, analyzeWithAI
}: Props) {
  
  const getProgressMessage = () => {
    if (aiProgress < 20) return t('Lendo textura e volumetria...');
    if (aiProgress < 45) return t('Identificando montadora...');
    if (aiProgress < 75) return t('Buscando cruzamento de especificações OEM...');
    if (aiProgress < 96) return t('Calculando Matriz de Preço (Mercado Japonês)...');
    return t('Sincronizando Anúncio...');
  };

  const format = (template: string, params: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (_, k: string) => params[k] ?? '');

  return (
    <div>
      <label className="block text-text-secondary text-sm mb-2">{t('Fotos do produto')}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 p-1 bg-error rounded-full text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          <Upload className="w-6 h-6 text-text-secondary" />
        </label>
      </div>

      {aiError && (
        <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3 text-error">
          <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{aiError}</p>
        </div>
      )}

      {images.length > 0 && aiEnabled && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-text-secondary text-xs mb-1">
              {t('Número do Chassi / VIN (Opcional - Ajuda a IA a ser 98% precisa)')}
            </label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:border-[#0D75FF] focus:outline-none transition-colors"
              placeholder={t('Ex: JTD123456789...')}
            />
          </div>
          
          <div className="w-full">
            {!analyzing ? (
              <button
                type="button"
                onClick={analyzeWithAI}
                disabled={generating3D}
                className="relative group w-full flex items-center justify-start space-x-5 bg-gradient-to-r from-[#06080F] via-[#0D75FF]/10 to-[#00E5FF]/5 hover:from-[#0D75FF]/20 hover:via-[#0D75FF]/30 hover:to-[#00E5FF]/20 border border-[#0D75FF]/40 hover:border-[#00E5FF]/80 px-6 py-6 rounded-2xl transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(13,117,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              >
                {/* Reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12 ease-in-out" />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(0,229,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                
                {/* Large Icon Container on the left */}
                <div className="flex-shrink-0 p-4 rounded-2xl bg-black/50 border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
                    {/* Robot Head */}
                    <rect x="3" y="7" width="18" height="10" rx="2" />
                    <path d="M12 7V3" />
                    <path d="M10 3h4" />
                    {/* Left eye */}
                    <circle cx="8.5" cy="12" r="1.5" />
                    {/* Magnifying glass over right eye */}
                    <circle cx="15.5" cy="12" r="2.5" />
                    <path d="M17.268 13.768L20 16.5" />
                  </svg>
                </div>

                <div className="flex flex-col items-start text-left flex-1 relative z-10">
                  <span className="inline-block px-2 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase mb-2 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    {t('Visão Computacional Ativa')}
                  </span>
                  <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#00E5FF] tracking-wide drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                    {t('Preencha o formulário com IA')}
                  </span>
                  <span className="text-sm text-[#0D75FF] font-medium tracking-wider uppercase opacity-90 mt-1">
                    {t('Preenchimento Mágico em 3 segundos')}
                  </span>
                </div>
                
                {/* Decorative right arrow */}
                <div className="hidden sm:block absolute right-6 text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ) : (
              <CarPartScannerAnimation progress={aiProgress} message={getProgressMessage()} />
            )}
            
            {/* Status do 3D Engine */}
            {(generating3D || model3DUrl) && (
              <div className="mt-3 w-full flex items-center justify-center space-x-2 bg-surface border border-border px-4 py-3 rounded-xl">
                {generating3D ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm font-medium text-purple-400">{t('Renderizando volumetria 3D (TripoSR)...')}</span>
                  </>
                ) : (
                  <>
                    <Box className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-400">{t('Modelo 3D Interativo Gerado!')}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {partNumber && (
        <div className="space-y-3 mt-4">
          <div className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${isOfficialData ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]' : 'bg-surface border-border text-text'}`}>
            {isOfficialData ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
            )}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                {isOfficialData ? t('Dados Oficiais do Fabricante') : t('Part Number Identificado')}
              </h3>
              <p className="text-sm opacity-80">
                {isOfficialData 
                  ? format(t('O código OEM {partNumber} foi validado no catálogo do fabricante. As especificações abaixo são 100% precisas.'), { partNumber }) 
                  : format(t('O código {partNumber} foi lido pela IA, porém não foi encontrado na base oficial. Os dados abaixo são estimativas.'), { partNumber })}
              </p>
            </div>
          </div>

          {brandMismatch && (
            <div className="p-4 rounded-lg border flex items-start gap-3 bg-red-500/10 border-red-500/30 text-red-500">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold mb-1">{t('Divergência de Montadora Detectada')}</h3>
                <p className="text-sm opacity-80">
                  {t('A IA identificou a marca a partir do logotipo na peça, mas o código OEM pode pertencer a outra montadora.')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
