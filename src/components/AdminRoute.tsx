import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { isAdmin, getCurrentUser } from '../lib/supabase';

export default function AdminRoute({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setIsAdminUser(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = await isAdmin(user.id);
        setIsAdminUser(adminStatus);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminUser(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="bg-surface border-l-4 border-primary rounded-lg p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-text mb-4">
            {t('Acesso Negado')}
          </h2>
          <p className="text-text-secondary mb-4">
            {t('Você não tem permissão para acessar esta página.')}
          </p>
          <div className="flex items-center space-x-3">
            <Link to="/" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
              {t('Voltar para Home')}
            </Link>
            <Link to="/dashboard" className="bg-background border border-border px-4 py-2 rounded-lg text-text hover:border-primary">
              {t('Meu Dashboard')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}