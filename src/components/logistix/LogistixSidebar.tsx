import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Warehouse, 
  Truck, 
  MapPin, 
  Boxes, 
  Search, 
  Settings,
  BarChart3,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface LogistixSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { id: 'pedidos', icon: <Package size={20} />, label: 'Pedidos' },
  { id: 'clientes', icon: <Users size={20} />, label: 'Clientes' },
  { id: 'armazens', icon: <Warehouse size={20} />, label: 'Armazéns' },
  { id: 'transportes', icon: <Truck size={20} />, label: 'Transportes' },
  { id: 'entregas', icon: <MapPin size={20} />, label: 'Entregas' },
  { id: 'estoque', icon: <Boxes size={20} />, label: 'Estoque' },
  { id: 'rastreamento', icon: <Search size={20} />, label: 'Rastreamento' },
  { id: 'relatorios', icon: <BarChart3 size={20} />, label: 'Relatórios' },
  { id: 'configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
];

export function LogistixSidebar({ activeTab, onTabChange, userEmail }: LogistixSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen 
        bg-dark-card border-r border-dark-border 
        transition-all duration-300 ease-in-out
        flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-lg text-white tracking-wider">LOGISTIX</div>
              <div className="text-xs text-gray-500">Smart Logistics</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30' 
                    : 'text-gray-400 hover:bg-dark-cardHover hover:text-white'
                  }
                `}
              >
                <span className={activeTab === item.id ? 'text-neon-cyan' : ''}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-dark-border text-gray-500 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* User Info */}
      {userEmail && !collapsed && (
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple text-sm font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{userEmail}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                Admin
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}