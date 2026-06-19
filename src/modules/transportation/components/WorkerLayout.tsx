import { PackageSearch, Truck, User } from 'lucide-react';
import { useAuthStore } from '@/modules/identity/store/authStore';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'coletor' | 'entregador' | 'admin';
}

export default function WorkerLayout({ children, activeTab, onTabChange, role }: Props) {
  const { user, signOut } = useAuthStore();

  const tabs = [
    ...(role === 'coletor'
      ? [{ id: 'coletas', label: 'MINHAS COLETAS', icon: PackageSearch }]
      : role === 'entregador'
      ? [{ id: 'entregas', label: 'MINHAS ENTREGAS', icon: Truck }]
      : []),
    { id: 'cadastro', label: 'CADASTRO', icon: User }
  ];

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[#0B1220] text-white flex flex-col">
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">L</span>
          </div>
          <div>
            <span className="font-bold text-sm block">LOGISTIX</span>
            <span className="text-[10px] text-gray-400 uppercase">
              {role === 'coletor' ? 'Coletor' : role === 'entregador' ? 'Entregador' : 'Admin'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="text-xs font-medium">{user?.full_name?.split(' ')[0] || 'Operador'}</p>
            <p className="text-[10px] text-gray-500">{user?.email}</p>
          </div>
          <button onClick={signOut} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {tabs.length > 0 && (
        <nav className="bg-[#0B1220] border-t border-white/5">
          <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg transition-colors ${
                    active ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500'
                  }`}>
                  <Icon size={24} />
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
