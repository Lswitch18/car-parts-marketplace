import { Upload, X, Loader2, Sparkles, Box, CheckCircle, AlertTriangle } from 'lucide-react';

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
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-text-secondary text-xs mb-1">
              {t('Número do Chassi / VIN (Opcional - Ajuda a IA a ser 98% precisa)')}
            </label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none"
              placeholder="Ex: JTD123456789..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {!analyzing ? (
              <button
                type="button"
                onClick={analyzeWithAI}
                disabled={generating3D}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 text-primary border border-primary/30 px-4 py-3 rounded-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{t('Análise de IA (Auto Preenchimento)')}</span>
              </button>
            ) : (
              <div className="flex-1 relative overflow-hidden bg-surface border border-primary/30 px-4 py-3 rounded-lg flex flex-col justify-center transition-all">
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">
                      {aiProgress < 20 ? t('Lendo imagem e textura...') : 
                       aiProgress < 45 ? t('Identificando peça e montadora...') : 
                       aiProgress < 75 ? t('Buscando especificações...') : 
                       aiProgress < 96 ? t('Consultando valor de mercado...') :
                       t('Finalizando...')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary">{Math.min(100, Math.round(aiProgress))}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden relative z-10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0D75FF] to-[#00f0ff] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                    style={{ width: `${Math.min(100, aiProgress)}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-lg"></div>
              </div>
            )}
            
            {/* Status do 3D Engine */}
            {(generating3D || model3DUrl) && (
              <div className="flex-1 flex items-center justify-center space-x-2 bg-surface border border-border px-4 py-3 rounded-lg">
                {generating3D ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm font-medium text-purple-400">{t('Renderizando 3D (TripoSR)...')}</span>
                  </>
                ) : (
                  <>
                    <Box className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-400">{t('Modelo 3D Gerado com Sucesso!')}</span>
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
                  ? t(`O código OEM ${partNumber} foi validado no catálogo do fabricante. As especificações abaixo são 100% precisas.`) 
                  : t(`O código ${partNumber} foi lido pela IA, porém não foi encontrado na base oficial. Os dados abaixo são estimativas.`)}
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
