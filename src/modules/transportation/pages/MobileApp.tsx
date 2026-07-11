import { useAuthStore } from '@/modules/identity/store/authStore';
import { LogOut, Sparkles } from 'lucide-react';
import MobileIaVision from './MobileIaVision';

export default function MobileApp() {
  const { user, signOut } = useAuthStore();

  return (
    <div 
      className="h-screen w-full max-w-md mx-auto text-white flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(11, 18, 32, 0.85), rgba(11, 18, 32, 0.95)), url("/digital_garage_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Cabeçalho do App de Visão de Peças */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0 bg-[#0B1220]/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <span className="font-bold text-sm tracking-wider font-display">GARAGE AI SCAN</span>
        </div>
        <div className="flex items-center gap-2.5">
          {user && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/20">
              {(user.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <button onClick={signOut} className="text-gray-400 hover:text-white p-1.5 transition-colors" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Área Principal de Escaneamento */}
      <main className="flex-1 overflow-y-auto p-4 pb-6">
        <MobileIaVision />
      </main>
    </div>
  );
}
