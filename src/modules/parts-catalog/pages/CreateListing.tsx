import { Gavel, Box, Loader2 } from 'lucide-react';
import { useCreateListing } from '../hooks/useCreateListing';
import { AiVisionBanner } from '../components/create-listing/AiVisionBanner';
import { ListingImageUpload } from '../components/create-listing/ListingImageUpload';
import { ListingFormFields } from '../components/create-listing/ListingFormFields';
import { ListingPriceSection } from '../components/create-listing/ListingPriceSection';

export default function CreateListing() {
  const { state, actions } = useCreateListing();

  if (state.showLimitModal) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Limite Mensal Atingido</h2>
          <p className="text-text-secondary mb-6">
            Você atingiu o limite de 50 anúncios gratuitos para pessoa física (Kojin).
            Abra uma conta Pessoa Jurídica (Hojin) ou torne-se Parceiro Desmanche para envios ilimitados.
          </p>
          <button onClick={() => window.location.href = '/settings/profile'} className="btn-primary w-full py-3">
            Atualizar Perfil para PJ
          </button>
        </div>
      </div>
    );
  }

  if (state.showUnverifiedModal) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-amber-500">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aprovação Pendente</h2>
          <p className="text-text-secondary mb-6">
            Como lojista, você já anunciou 20 peças. Para remover este limite, precisamos validar seu Kobutsu-sho (Licença de Usados) e sua conta bancária japonesa.
          </p>
          <button onClick={() => window.location.href = '/settings/profile'} className="btn-primary w-full py-3">
            Concluir Verificação da Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text">{state.t('Anunciar Peça JDM')}</h1>
            <p className="text-text-secondary">{state.t('Preencha os detalhes ou deixe a IA fazer o trabalho pesado.')}</p>
          </div>

          <div className="flex items-center space-x-4 bg-surface p-2 rounded-lg border border-border">
            <button
              onClick={() => actions.setIsAuction(false)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                !state.isAuction 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4" />
                <span>{state.t('Preço Fixo')}</span>
              </div>
            </button>
            <button
              onClick={() => actions.setIsAuction(true)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                state.isAuction 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'text-text-secondary hover:text-amber-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gavel className="w-4 h-4" />
                <span>{state.t('Leilão Ao Vivo')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {state.aiEnabled && (
          <AiVisionBanner 
            onAnalyze={actions.analyzeWithAI} 
            analyzing={state.analyzing} 
            progress={state.aiProgress} 
          />
        )}

        <div className="card p-8">
          <form onSubmit={(e) => { e.preventDefault(); actions.createListing.mutate(); }} className="space-y-6">
            
            <ListingImageUpload 
              t={state.t}
              images={state.images}
              aiError={state.aiError}
              aiEnabled={state.aiEnabled}
              vin={state.vin}
              analyzing={state.analyzing}
              generating3D={state.generating3D}
              aiProgress={state.aiProgress}
              model3DUrl={state.model3DUrl}
              partNumber={state.partNumber}
              isOfficialData={state.isOfficialData}
              brandMismatch={state.brandMismatch}
              handleImageChange={actions.handleImageChange}
              removeImage={actions.removeImage}
              setVin={actions.setVin}
              analyzeWithAI={actions.analyzeWithAI}
            />

            <ListingFormFields 
              t={state.t}
              formData={state.formData}
              setFormData={actions.setFormData}
              compatibilityTags={state.compatibilityTags}
              setCompatibilityTags={actions.setCompatibilityTags}
              newTagInput={state.newTagInput}
              setNewTagInput={actions.setNewTagInput}
            />

            <ListingPriceSection 
              t={state.t}
              isAuction={state.isAuction}
              formData={state.formData}
              setFormData={actions.setFormData}
              certifyingPrice={state.certifyingPrice}
              priceCertification={state.priceCertification}
              handleCertifyPrice={actions.handleCertifyPrice}
              setPriceCertification={actions.setPriceCertification}
            />

            <div className="pt-6 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={state.uploading || state.analyzing || state.images.length === 0}
                className="btn-primary w-full md:w-auto px-8 py-4 text-base shadow-[0_0_15px_rgba(13,117,255,0.3)] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {state.uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{state.t('Publicando Anúncio...')}</span>
                  </>
                ) : (
                  <>
                    {state.isAuction ? <Gavel className="w-5 h-5" /> : <Box className="w-5 h-5" />}
                    <span>{state.isAuction ? state.t('Publicar Leilão Ao Vivo') : state.t('Publicar Peça à Venda')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}