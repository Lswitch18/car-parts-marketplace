import { useState } from 'react';
import { ShieldCheck, Truck, FileText, AlertTriangle, Key } from 'lucide-react';

interface WorkerLoginProps {
  onLoginSuccess: () => void;
}

export default function WorkerLogin({ onLoginSuccess }: WorkerLoginProps) {
  const [cnh, setCnh] = useState('');
  const [plate, setPlate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanCnh = cnh.trim();
      const cleanPlate = plate.trim().toUpperCase();

      if (!cleanCnh || !cleanPlate) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }

      // Check against registered profile in localStorage
      const savedProfileStr = localStorage.getItem('driver_profile');
      let isMatched = false;

      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          if (profile.cnh === cleanCnh && profile.plate.toUpperCase() === cleanPlate) {
            isMatched = true;
          }
        } catch (e) {
          console.error('Failed to parse driver profile', e);
        }
      }

      // Hardcoded pre-registered default driver fallback for testing
      if (cleanCnh === '98765432100' && cleanPlate === 'XYZ-9876') {
        isMatched = true;
        
        // Auto-seed profile if not existing
        if (!savedProfileStr) {
          localStorage.setItem('driver_profile', JSON.stringify({
            name: 'Carlos Silva (Exemplo)',
            cnh: '98765432100',
            plate: 'XYZ-9876',
            phone: '(11) 98888-7777',
            docPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
          }));
          localStorage.setItem('driver_face_template', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        }
      }

      if (isMatched) {
        localStorage.setItem('driver_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Acesso negado: CNH ou Placa não conferem com os dados pré-cadastrados.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[#0B1220] text-white flex flex-col justify-between p-6 select-none">
      
      {/* Top Brand Header */}
      <div className="flex flex-col items-center text-center mt-12 space-y-3">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-400/20">
          <Truck size={32} className="text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            DAIG LOGISTIX
          </h1>
          <span className="text-xs font-bold text-blue-400 tracking-[0.25em] uppercase">
            Express Coletor
          </span>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center space-y-5 my-8">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-red-400 leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        {/* CNH Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Número da CNH</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
              <FileText size={18} />
            </span>
            <input
              type="text"
              required
              value={cnh}
              onChange={e => setCnh(e.target.value)}
              placeholder="Digite sua habilitação cadastrada"
              className="w-full h-14 pl-12 pr-4 bg-[#111827] border border-white/5 rounded-2xl text-base text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Plate Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Placa do Veículo</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
              <Truck size={18} />
            </span>
            <input
              type="text"
              required
              value={plate}
              onChange={e => setPlate(e.target.value)}
              placeholder="Digite a placa do veículo cadastrado"
              className="w-full h-14 pl-12 pr-4 bg-[#111827] border border-white/5 rounded-2xl text-base text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors uppercase"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Key size={18} /> ENTRAR NO DAIG EXPRESS
            </>
          )}
        </button>

      </form>

      {/* Footer System Info */}
      <div className="flex flex-col items-center gap-1.5 text-center mb-4 text-[10px] text-gray-600">
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-gray-600" />
          <span>Conexão Segura & Criptografada</span>
        </div>
        <p>© 2026 DAIG Logistix Express. Todos os direitos reservados.</p>
        <p className="text-blue-500/50 mt-1">Dica de Teste: CNH: 98765432100 | Placa: XYZ-9876</p>
      </div>

    </div>
  );
}
