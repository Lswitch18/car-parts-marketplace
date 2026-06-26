import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, Terminal, Activity, Globe, Bell, MoreHorizontal, Search, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/modules/identity/store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const NAV_ITEMS = [
    { label: 'Projects', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Deployments', path: '/admin/deployments', icon: Box },
    { label: 'Logs', path: '/admin/logs', icon: Terminal },
    { label: 'Analytics', path: '/admin/analytics', icon: Activity },
    { label: 'Speed Insights', path: '/admin/speed', icon: Activity },
    { label: 'Observability', path: '/admin/observability', icon: Activity, arrow: true },
    { label: 'Firewall', path: '/admin/firewall', icon: Box },
    { label: 'CDN', path: '/admin/cdn', icon: Globe },
    { divider: true },
    { label: 'Environment Variables', path: '/admin/env', icon: Box, badge: 6 },
    { label: 'Domains', path: '/admin/domains', icon: Globe },
    { label: 'Connect', path: '/admin/connect', icon: Box, beta: true },
    { label: 'Integrations', path: '/admin/integrations', icon: Box },
  ];

  const isActive = (path?: string, exact: boolean = false) => {
    if (!path) return false;
    if (exact) {
      return location.pathname === path || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-[#EDEDED] font-sans antialiased">
      {/* Sidebar Vercel-Exact */}
      <aside className="w-[240px] flex flex-col bg-[#000000] border-r border-[#222]">
        
        {/* Header - Account Selector */}
        <div className="h-14 flex items-center px-4 border-b border-[#222]">
          <button className="flex-1 flex items-center justify-between text-sm hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-green-500 to-green-400 border border-[#333]"></div>
              <span className="font-semibold text-white truncate max-w-[100px]">lswitch18's proj...</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#222] text-[#AAA] border border-[#333]">Hobby</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-[2px]">
               <div className="w-1 h-0.5 bg-[#888]"></div>
               <div className="w-1 h-0.5 bg-[#888]"></div>
            </div>
          </button>
        </div>

        {/* Find Input */}
        <div className="px-3 py-3">
          <div className="flex items-center h-8 bg-[#0A0A0A] border border-[#222] rounded-md px-2 focus-within:border-[#444] transition-colors">
            <Search size={14} className="text-[#888]" />
            <input 
              type="text" 
              placeholder="Find..." 
              className="bg-transparent border-none outline-none text-[#EDEDED] text-[13px] ml-2 w-full placeholder:text-[#666]"
            />
            <div className="flex items-center justify-center w-5 h-5 rounded border border-[#333] bg-[#111] text-[#888] text-[10px] font-mono">
              F
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto pb-4">
          {NAV_ITEMS.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="h-px bg-[#222] my-3 mx-2"></div>;
            }
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center justify-between px-2 h-8 rounded-md transition-colors text-[13px] font-medium ${
                  active
                    ? 'bg-[#222] text-[#EDEDED]'
                    : 'text-[#888888] hover:bg-[#111] hover:text-[#EDEDED]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon size={14} className={active ? 'text-[#EDEDED]' : 'text-[#888888]'} />
                  {item.label}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-500 text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.beta && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-semibold">
                      Beta
                    </span>
                  )}
                  {item.arrow && (
                    <ChevronRight size={14} className="text-[#666]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile */}
        <div className="h-14 border-t border-[#222] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <div className="relative">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=dddddd`}
                alt="avatar"
                className="w-6 h-6 rounded-full border border-[#333]"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-black rounded-full"></div>
            </div>
            <span className="text-[13px] font-medium text-[#EDEDED] truncate max-w-[100px]">
              {user?.full_name || 'lswitch18'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[#888] hover:text-[#EDEDED] transition-colors p-1 rounded hover:bg-[#222]">
              <MoreHorizontal size={14} />
            </button>
            <button onClick={signOut} className="text-[#888] hover:text-[#EDEDED] transition-colors p-1 rounded hover:bg-[#222] relative">
              <Bell size={14} />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        
        {/* Top Header */}
        <header className="h-14 flex items-center px-6 border-b border-[#222] bg-[#000000]">
          <div className="flex-1 flex items-center text-[13px] font-medium text-[#EDEDED]">
             All Projects
             <div className="flex flex-col ml-2 opacity-50 relative">
               <div className="w-[8px] h-px bg-white rotate-45 absolute top-[-3px]"></div>
               <div className="w-[8px] h-px bg-white -rotate-45 absolute top-[3px]"></div>
             </div>
          </div>
          <div className="flex items-center justify-center flex-1">
            <span className="text-[13px] font-medium text-[#EDEDED]">Overview</span>
          </div>
          <div className="flex-1"></div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#000000]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
