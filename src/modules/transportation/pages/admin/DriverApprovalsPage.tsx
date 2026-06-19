import { useState, useEffect } from 'react';
import { RefreshCw, FileText, UserCheck, CheckCircle, X } from 'lucide-react';

export default function DriverApprovalsPage() {
  // Driver biometrics preview modal states
  const [previewModal, setPreviewModal] = useState<{
    type: 'cnh' | 'face' | 'signature' | null;
    title: string;
    image: string | null;
  }>({ type: null, title: '', image: null });

  // State to read local registered drivers
  const [localDrivers, setLocalDrivers] = useState<any[]>([]);

  const loadLocalDrivers = () => {
    const drivers = [];
    const profileStr = localStorage.getItem('driver_profile');
    const faceStr = localStorage.getItem('driver_face_template');
    
    // Find all signatures in localstorage
    let signatureStr = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('col_sig_') || key.startsWith('batch_signature_'))) {
        signatureStr = localStorage.getItem(key);
        break; // Grab the first one found for demonstration
      }
    }

    if (profileStr) {
      try {
        const p = JSON.parse(profileStr);
        drivers.push({
          id: 'driver-001',
          nome: p.name,
          cnh: p.cnh,
          plate: p.plate,
          phone: p.phone,
          cnhPhoto: p.docPhoto || null,
          faceTemplate: faceStr || null,
          signature: signatureStr || null
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Add mock drivers if empty to ensure the admin has data to see
    if (drivers.length === 0) {
      drivers.push({
        id: 'driver-mock-001',
        nome: 'Carlos Silva (Exemplo)',
        cnh: '98765432100',
        plate: 'XYZ-9876',
        phone: '(11) 98888-7777',
        cnhPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        faceTemplate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      });
    }

    setLocalDrivers(drivers);
  };

  useEffect(() => {
    loadLocalDrivers();
  }, []);

  const handleResetBiometrics = () => {
    if (confirm('Deseja realmente redefinir o cadastro biométrico local do motorista?')) {
      localStorage.removeItem('driver_profile');
      localStorage.removeItem('driver_face_template');
      // Clear signatures
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('col_sig_') || key.startsWith('batch_signature_'))) {
          localStorage.removeItem(key);
        }
      }
      loadLocalDrivers();
    }
  };

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-xl font-bold text-white">
          Aprovação de Motoristas e Biometria
        </h2>
        <button onClick={handleResetBiometrics} className="h-10 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-medium flex items-center gap-2 text-sm transition-all">
          <RefreshCw size={14} /> Redefinir Biometrias Locais
        </button>
      </div>

      {/* Driver Biometrics Audit Panel */}
      <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Motorista', 'CNH / Doc', 'Placa do Veículo', 'Telefone', 'Status CNH', 'Biometria Facial', 'Assinatura'].map(h => (
                  <th key={h} className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localDrivers.map((driver) => (
                <tr key={driver.id} className="border-b border-border hover:bg-surface/[0.02] transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{driver.nome}</td>
                  <td className="p-4 text-sm text-gray-300 font-mono">{driver.cnh}</td>
                  <td className="p-4 text-sm text-blue-400 font-semibold">{driver.plate}</td>
                  <td className="p-4 text-sm text-gray-400">{driver.phone}</td>
                  <td className="p-4">
                    {driver.cnhPhoto ? (
                      <button 
                        onClick={() => setPreviewModal({ type: 'cnh', title: `CNH - ${driver.nome}`, image: driver.cnhPhoto })}
                        className="h-8 px-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-blue-500/20 transition-all"
                      >
                        <FileText size={13} /> Visualizar
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Pendente</span>
                    )}
                  </td>
                  <td className="p-4">
                    {driver.faceTemplate ? (
                      <button 
                        onClick={() => setPreviewModal({ type: 'face', title: `Rosto - ${driver.nome}`, image: driver.faceTemplate })}
                        className="h-8 px-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-green-500/20 transition-all"
                      >
                        <UserCheck size={13} /> Ver Biometria
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Pendente</span>
                    )}
                  </td>
                  <td className="p-4">
                    {driver.signature ? (
                      <button 
                        onClick={() => setPreviewModal({ type: 'signature', title: `Última Assinatura - ${driver.nome}`, image: driver.signature })}
                        className="h-8 px-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-purple-500/20 transition-all"
                      >
                        <CheckCircle size={13} /> Assinatura
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Biometric Audit Preview Modal */}
      {previewModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewModal({ type: null, title: '', image: null })}>
          <div className="bg-[#1F2937] rounded-2xl p-6 w-full max-w-md border border-border flex flex-col items-center gap-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center w-full">{previewModal.title}</h3>
            <button 
              onClick={() => setPreviewModal({ type: null, title: '', image: null })}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className={`w-full bg-black rounded-xl border border-white/5 overflow-hidden flex items-center justify-center ${
              previewModal.type === 'face' ? 'h-64 w-64 rounded-full border-2 border-green-500/40' : 'h-48'
            }`}>
              {previewModal.image ? (
                <img src={previewModal.image} alt={previewModal.title} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-sm text-gray-500">Nenhuma imagem disponível</span>
              )}
            </div>
            
            <button 
              onClick={() => setPreviewModal({ type: null, title: '', image: null })}
              className="h-10 px-6 bg-[#111827] text-gray-400 rounded-lg text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
