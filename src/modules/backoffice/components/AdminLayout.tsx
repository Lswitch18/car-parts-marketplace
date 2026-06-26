import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Package, Settings, LogOut } from 'lucide-react';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import { useAuthStore } from '@/modules/identity/store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Logistix WMS', path: '/admin/logistix', icon: Package },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Transactions', path: '/admin/transactions', icon: CreditCard },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0A0A0A]">
        {/* Logo & Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <GaidLogo size={28} animated={false} />
            <span className="font-bold text-sm tracking-wide">DAIG Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=dddddd`}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Administrator</p>
            </div>
            <button onClick={signOut} className="text-white/40 hover:text-white p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-[#0A0A0A]">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-white/80">
              {NAV_ITEMS.find((n) => isActive(n.path, n.exact))?.label || 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Environment Badge */}
            <span className="px-2 py-1 rounded text-[10px] font-mono bg-white/10 text-white/70 border border-white/20">
              Production
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
