import { motion, AnimatePresence } from 'framer-motion';
import { BRANDS, CONDITIONS, YEARS } from '@/modules/shared/lib/constants';

interface Props {
  t: (key: string) => string;
  formData: any;
  setFormData: (data: any) => void;
  compatibilityTags: string[];
  setCompatibilityTags: (tags: string[]) => void;
  newTagInput: string;
  setNewTagInput: (input: string) => void;
}

export function ListingFormFields({
  t, formData, setFormData, compatibilityTags, setCompatibilityTags, newTagInput, setNewTagInput
}: Props) {
  const selectedBrand = BRANDS.find(b => b.id === formData.brand);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">{t('Marca')} *</label>
          <select
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="">{t('Selecione')}</option>
            {BRANDS.map(brand => (
              <option key={brand.id} value={brand.id}>{t(brand.name)}</option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {formData.brand && selectedBrand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-text-secondary text-sm mb-2">{t('Modelo')} *</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
                required
              >
                <option value="">{t('Selecione')}</option>
                {selectedBrand.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">{t('Título do Anúncio')} *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
            placeholder={t('Ex: Motor Completo Honda Civic 2020')}
            required
          />
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">{t('Condição')} *</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="">{t('Selecione')}</option>
            {CONDITIONS.map(condition => (
              <option key={condition.id} value={condition.id}>{t(condition.label)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">{t('Ano Início Compatibilidade')} *</label>
          <select
            value={formData.yearStart}
            onChange={(e) => setFormData({ ...formData, yearStart: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="">{t('Selecione')}</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">{t('Ano Fim Compatibilidade')} *</label>
          <select
            value={formData.yearEnd}
            onChange={(e) => setFormData({ ...formData, yearEnd: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="">{t('Selecione')}</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-text-secondary text-sm mb-2">{t('Descrição Detalhada')} *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text h-32 focus:border-primary focus:outline-none transition-colors"
          placeholder={t('Descreva os detalhes da peça, quilometragem, histórico...')}
          required
        />
      </div>

      <div className="card p-5 border border-border/60 bg-surface/50">
        <label className="block text-text-secondary text-sm font-semibold mb-2">
          {t('Tags de Compatibilidade (Kei Cars, JDM, Variantes)')}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          {t('Adicione outros veículos que também aceitam essa peça. A IA adiciona sugestões automaticamente baseada em códigos OEM.')}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {compatibilityTags.map((tag) => (
              <motion.span 
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setCompatibilityTags(compatibilityTags.filter(t => t !== tag))}
                  className="hover:text-red-400 font-bold ml-1 text-sm focus:outline-none"
                >
                  &times;
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          {compatibilityTags.length === 0 && (
            <span className="text-gray-500 text-xs py-1.5">{t('Nenhuma tag de compatibilidade adicionada.')}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('Adicione um veículo (Ex: Honda N-BOX)')}
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-text text-sm focus:border-daig-blue transition-colors focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newTagInput.trim()) {
                  const val = newTagInput.trim();
                  if (!compatibilityTags.includes(val)) {
                    setCompatibilityTags([...compatibilityTags, val]);
                  }
                  setNewTagInput('');
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (newTagInput.trim()) {
                const val = newTagInput.trim();
                if (!compatibilityTags.includes(val)) {
                  setCompatibilityTags([...compatibilityTags, val]);
                }
                setNewTagInput('');
              }
            }}
            className="px-4 py-2 bg-daig-blue/20 text-daig-blue hover:bg-daig-blue/30 rounded-lg text-sm font-semibold transition-colors focus:outline-none"
          >
            {t('Adicionar')}
          </button>
        </div>
      </div>
    </div>
  );
}
