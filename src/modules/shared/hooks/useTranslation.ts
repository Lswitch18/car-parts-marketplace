import { useI18n } from '@/modules/shared/lib/i18n';

export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}
