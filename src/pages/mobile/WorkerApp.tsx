import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../lib/mobileApi';
import WorkerLayout from '../../components/mobile/WorkerLayout';
import WorkerColetas from './WorkerColetas';
import WorkerEntregas from './WorkerEntregas';
import WorkerCadastro from './WorkerCadastro';
import WorkerLogin from './WorkerLogin';

export default function WorkerApp() {
  const [activeTab, setActiveTab] = useState('coletas');
  const [role, setRole] = useState<'coletor' | 'entregador' | 'admin'>('admin');
  const [isDriverAuth, setIsDriverAuth] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('driver_authenticated') === 'true';
    setIsDriverAuth(isAuth);
  }, []);

  const { data: perfil, isLoading, error } = useQuery({
    queryKey: ['worker', 'perfil'],
    queryFn: () => mobileApi.me(),
    retry: 1,
    retryDelay: 1000,
    enabled: isDriverAuth, // Only load profile if driver authentication is active
  });

  console.log('[WorkerApp] render', { isLoading, error, perfil });

  useEffect(() => {
    if (perfil?.cargo?.nome) {
      const cargo = (perfil.cargo.nome as string).toLowerCase();
      console.log('[WorkerApp] Cargo detectado:', cargo);
      if (cargo.includes('colet') || cargo.includes('coletor')) {
        setRole('coletor');
        setActiveTab('coletas');
      } else if (cargo.includes('entreg') || cargo.includes('motorista')) {
        setRole('entregador');
        setActiveTab('entregas');
      }
    }
  }, [perfil]);

  if (!isDriverAuth) {
    return <WorkerLogin onLoginSuccess={() => setIsDriverAuth(true)} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-8">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-semibold">Carregando...</p>
        <p className="text-sm text-gray-400 mt-1">Verificando sua sessão</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Erro ao carregar</h2>
        <p className="text-sm text-gray-400 text-center mb-6 max-w-xs">
          {(error as any)?.message || 'Não foi possível conectar ao servidor'}
        </p>
        <button onClick={() => window.location.reload()}
          className="h-12 px-6 bg-blue-500 rounded-xl text-sm font-semibold">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <WorkerLayout activeTab={activeTab} onTabChange={setActiveTab} role={role}>
      {activeTab === 'cadastro' && <WorkerCadastro />}
      {activeTab === 'coletas' && role === 'coletor' && <WorkerColetas />}
      {activeTab === 'entregas' && role === 'entregador' && <WorkerEntregas />}
      {role === 'admin' && (
        <div className="p-4">
          {activeTab === 'coletas' && <WorkerColetas />}
          {activeTab === 'entregas' && <WorkerEntregas />}
        </div>
      )}
    </WorkerLayout>
  );
}
