import { Loader2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '@/modules/shared/lib/constants';

interface Props {
  t: (key: string) => string;
  isAuction: boolean;
  formData: any;
  setFormData: (data: any) => void;
  certifyingPrice: boolean;
  priceCertification: any;
  handleCertifyPrice: () => void;
  setPriceCertification: (data: any) => void;
}

export function ListingPriceSection({
  t, isAuction, formData, setFormData, certifyingPrice, priceCertification,
  handleCertifyPrice, setPriceCertification
}: Props) {
  return (
    <>
      {isAuction ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
          <div>
            <label className="block text-text-secondary text-sm mb-2">{t('Lance Inicial (¥)')} *</label>
            <input
              type="number"
              value={formData.startingBid}
              onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
              placeholder={t('Ex: 5000')}
              required={isAuction}
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">{t('Comprar Agora (Opcional)')}</label>
            <input
              type="number"
              value={formData.buyNowPrice}
              onChange={(e) => setFormData({ ...formData, buyNowPrice: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
              placeholder={t('Ex: 15000')}
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">{t('Duração do Leilão')}</label>
            <select
              value={formData.auctionDurationHours}
              onChange={(e) => setFormData({ ...formData, auctionDurationHours: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
            >
              <option value="24">{t('24 h (1 dia)')}</option>
              <option value="72">{t('72 h (3 dias)')}</option>
              <option value="168">{t('168 h (7 dias)')}</option>
              <option value="336">{t('336 h (14 dias)')}</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-text-secondary text-sm">{t('Preço')} *</label>
              <button
                type="button"
                onClick={handleCertifyPrice}
                disabled={certifyingPrice || !formData.price || !formData.title}
                className="text-xs flex items-center space-x-1 text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
              >
                {certifyingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{t('Certificar com IA')}</span>
              </button>
            </div>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value });
                setPriceCertification(null);
              }}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
              placeholder={t('0,00')}
              required={!isAuction}
            />
            {priceCertification && (
              <div className={`mt-2 p-3 rounded-lg border text-sm flex items-start space-x-2 ${priceCertification.is_fair ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-600'}`}>
                {priceCertification.is_fair ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-semibold">{priceCertification.is_fair ? t('Preço Aprovado pela IA') : t('Atenção ao Preço')}</p>
                  <p className="text-xs opacity-90 mt-0.5">{priceCertification.reasoning}</p>
                  {!priceCertification.is_fair && priceCertification.recommended_min && priceCertification.recommended_max && (
                    <p className="text-xs font-medium mt-1">{t('Faixa Recomendada')}: ¥{priceCertification.recommended_min} - ¥{priceCertification.recommended_max}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">{t('Categoria')} *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
              required
            >
              <option value="">{t('Selecione')}</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{t(cat.name)}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
