import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';

export default function AdminRoute({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('[AdminRoute] Verificando admin status...');
        
        // Usar getSession() em vez de getUser() para funcionar com cookies
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[AdminRoute] Session:', { hasSession: !!session, error: sessionError?.message });
        setDebugInfo(`Session: ${!!session}`);
        
        if (sessionError || !session) {
          console.log('[AdminRoute] Sem sessão, redirecionando para /login');
          setIsAdminUser(false);
          setLoading(false);
          return;
        }

        console.log('[AdminRoute] User ID:', session.user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log('[AdminRoute] Profile:', { profile, error: profileError?.message });
        setDebugInfo(`Role: ${profile?.role || 'não encontrado'}`);

        if (profileError) {
          console.error('[AdminRoute] Erro ao buscar profile:', profileError);
          setIsAdminUser(false);
          setLoading(false);
          return;
        }

        const isAdmin = profile?.role === 'admin';
        console.log('[AdminRoute] É admin:', isAdmin);
        setIsAdminUser(isAdmin);
        setLoading(false);
      } catch (error) {
        console.error('[AdminRoute] Error checking admin status:', error);
        setDebugInfo(`Erro: ${error}`);
        setIsAdminUser(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verificando acesso...</p>
          <p className="text-gray-500 text-sm mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="bg-gray-800 border-l-4 border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="font-bold text-xl text-white mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-400 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-gray-500 text-sm mb-4">Debug: {debugInfo}</p>
          <div className="flex gap-3">
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Voltar para Home
            </Link>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}