import { useI18n } from '../lib/i18n';

export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}
