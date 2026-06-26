import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Package, LogOut, ChevronRight } from 'lucide-react';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import LanguageDetector from '@/modules/shared/components/LanguageDetector';
import { useAuthStore } from '@/modules/identity/store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const NAV_ITEMS = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Logistix WMS', path: '/admin/logistix', icon: Package },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Transactions', path: '/admin/transactions', icon: CreditCard },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#111111] text-[#EDEDED] font-sans antialiased selection:bg-purple-500/30 selection:text-white">
      {/* Sidebar (Supabase/Vercel hybrid) */}
      <aside className="w-[260px] border-r border-[#2A2A2A] flex flex-col bg-[#161616] relative z-20">
        
        {/* Top Glow Accent (Blue/Purple) */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Logo & Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#2A2A2A] relative">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <GaidLogo size={24} animated={false} />
            <span className="font-semibold text-sm tracking-wide text-white">DAIG Admin</span>
          </Link>
        </div>

        {/* Project Context (Supabase style selector) */}
        <div className="px-4 py-4">
          <button className="w-full flex items-center justify-between bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#444] rounded-md px-3 py-2 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">DA</span>
              </div>
              <span className="text-xs font-medium text-[#EDEDED]">DAIG Production</span>
            </div>
            <ChevronRight size={14} className="text-[#888]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium relative ${
                  active
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[#888888] hover:text-[#EDEDED] hover:bg-[#1E1E1E]'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                )}
                <item.icon size={16} className={`transition-colors ${active ? 'text-blue-500' : 'group-hover:text-[#EDEDED]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2A2A2A]">
          <div className="group flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1E1E1E] transition-all cursor-pointer">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=dddddd`}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-[#333] group-hover:border-purple-500/50 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-[#EDEDED]">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-[#888] uppercase tracking-wider">Owner</p>
            </div>
            <button onClick={signOut} className="text-[#666] hover:text-white p-1.5 rounded hover:bg-[#2A2A2A] transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#111111] relative">
        {/* Top Header (Vercel style crisp header) */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#888]">DAIG</span>
            <span className="text-[#444]">/</span>
            <span className="font-medium text-[#EDEDED]">
              {NAV_ITEMS.find((n) => isActive(n.path, n.exact))?.label || 'Overview'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageDetector mobileCompact={true} />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[11px] font-mono text-[#888]">Operational</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
