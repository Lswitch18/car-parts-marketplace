import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../lib/mobileApi';
import WorkerLayout from '../../components/mobile/WorkerLayout';
import WorkerColetas from './WorkerColetas';
import WorkerEntregas from './WorkerEntregas';

export default function WorkerApp() {
  const [activeTab, setActiveTab] = useState('coletas');
  const [role, setRole] = useState<'coletor' | 'entregador' | 'admin'>('admin');

  const { data: perfil } = useQuery({
    queryKey: ['worker', 'perfil'],
    queryFn: () => mobileApi.me(),
  });

  useEffect(() => {
    if (perfil?.cargo?.nome) {
      const cargo = (perfil.cargo.nome as string).toLowerCase();
      if (cargo.includes('colet') || cargo.includes('coletor')) {
        setRole('coletor');
        setActiveTab('coletas');
      } else if (cargo.includes('entreg') || cargo.includes('motorista')) {
        setRole('entregador');
        setActiveTab('entregas');
      }
    }
  }, [perfil]);

  return (
    <WorkerLayout activeTab={activeTab} onTabChange={setActiveTab} role={role}>
      {role === 'coletor' && <WorkerColetas />}
      {role === 'entregador' && <WorkerEntregas />}
      {role === 'admin' && (
        <div className="p-4">
          {activeTab === 'coletas' && <WorkerColetas />}
          {activeTab === 'entregas' && <WorkerEntregas />}
        </div>
      )}
    </WorkerLayout>
  );
}
