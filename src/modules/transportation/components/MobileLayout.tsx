import {
  LayoutDashboard, PackageSearch, Truck, Warehouse, LogOut, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/modules/identity/store/authStore';

interface Tab {
  id: string;
  label: string;
  icon: any;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'coletas', label: 'Coletas', icon: PackageSearch },
  { id: 'ia-vision', label: 'Scanner IA', icon: Sparkles },
  { id: 'entregas', label: 'Entregas', icon: Truck },
  { id: 'cd', label: 'CD', icon: Warehouse },
];

export default function MobileLayout({ children, activeTab, onTabChange }: {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { user, signOut } = useAuthStore();

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[#0B1220] text-white flex flex-col">
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold">L</span>
          </div>
          <span className="font-bold text-sm">LOGISTIX MOBILE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <button onClick={signOut} className="text-gray-500 hover:text-white p-1">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0B1220] border-t border-white/5 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? 'text-blue-400' : 'text-gray-500'}`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
