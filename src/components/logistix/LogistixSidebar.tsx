import { useState, useEffect } from 'react';
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
  ChevronRight,
  Menu,
  X
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center flex-shrink-0">
            <Truck size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
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
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30' 
                    : 'text-gray-400 hover:bg-dark-cardHover hover:text-white'
                  }
                `}
              >
                <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-neon-cyan' : ''}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button - Hide on mobile */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-dark-border text-gray-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      )}

      {/* User Info */}
      {userEmail && !collapsed && (
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple text-sm font-bold flex-shrink-0">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{userEmail}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                Admin
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Mobile: Hamburger menu + drawer
  if (isMobile) {
    return (
      <>
        {/* Hamburger Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-dark-card rounded-lg border border-dark-border text-white hover:bg-dark-cardHover transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside 
          className={`
            fixed left-0 top-0 h-screen 
            bg-dark-card border-r border-dark-border 
            transition-transform duration-300 ease-in-out
            flex flex-col
            z-50
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            w-64
          `}
        >
          {/* Close Button */}
          <div className="p-4 border-b border-dark-border flex justify-end">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: Fixed sidebar
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
      {sidebarContent}
    </aside>
  );
}