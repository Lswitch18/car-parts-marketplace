import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Bell, MoreHorizontal, Search, ChevronRight, Package, Truck, CreditCard, DollarSign, Image as ImageIcon, Users, Star, Building2, Menu, X, Brain } from 'lucide-react';
import { useAuthStore } from '@/modules/identity/store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fail-Closed Security Guard: Restrict admin layout strictly to admin users (CWE-285)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const NAV_ITEMS = [
    { section: 'OVERVIEW' },
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Analytics', path: '/admin/analytics', icon: Activity },
    { divider: true },
    
    { section: 'OPERATIONS' },
    { label: 'Fleet & Drivers', path: '/admin/transportation/drivers', icon: Truck },
    { divider: true },

    { section: 'MARKETPLACE' },
    { label: 'Transações & Escrow', path: '/admin/transactions', icon: CreditCard },
    { label: 'Entregas & Rastreio', path: '/admin/deliveries', icon: Package, badge: 'Direct' },
    { label: 'SaaS Subscriptions', path: '/admin/saas', icon: Building2, badge: 'MRR' },
    { label: 'Finance & Payouts', path: '/admin/finance/payable', icon: DollarSign },
    { label: 'AI 3D Engine', path: '/admin/image-to-3d', icon: ImageIcon, badge: 'Jobs' },
    { label: 'AI Ops', path: '/admin/ai-ops', icon: Brain },
    { divider: true },

    { section: 'TRUST & SAFETY' },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'CRM Contacts', path: '/admin/crm/contacts', icon: Building2 },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star, badge: '3' },
  ];

  const isActive = (path?: string, exact: boolean = false) => {
    if (!path) return false;
    if (exact) {
      return location.pathname === path || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#000000] text-[#EDEDED] font-sans antialiased relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-[#000000] border-b border-[#222] shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-green-500 to-green-400 border border-[#333]"></div>
           <span className="font-semibold text-white text-[14px]">DAIG Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-[#EDEDED] p-2 -mr-2 rounded-md hover:bg-[#111] transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Vercel-Exact (Bounded Contexts) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-[#000000] border-r border-[#222] transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-3 right-3 z-50">
           <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#888] hover:text-white p-1 rounded-md hover:bg-[#222] transition-colors">
             <X size={18} />
           </button>
        </div>

        {/* Header - Account Selector */}
        <div className="h-14 flex items-center px-4 border-b border-[#222] shrink-0 mt-8 md:mt-0">
          <button className="flex-1 flex items-center justify-between text-sm hover:opacity-80 transition-opacity pr-4 md:pr-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-green-500 to-green-400 border border-[#333]"></div>
              <span className="font-semibold text-white truncate max-w-[100px]">DAIG.jp Admin</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#222] text-[#AAA] border border-[#333]">Pro</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-[2px]">
               <div className="w-1 h-0.5 bg-[#888]"></div>
               <div className="w-1 h-0.5 bg-[#888]"></div>
            </div>
          </button>
        </div>

        {/* Find Input */}
        <div className="px-3 py-3 shrink-0">
          <div className="flex items-center h-8 bg-[#0A0A0A] border border-[#222] rounded-md px-2 focus-within:border-[#444] transition-colors">
            <Search size={14} className="text-[#888]" />
            <input 
              type="text" 
              placeholder="Find..." 
              className="bg-transparent border-none outline-none text-[#EDEDED] text-[13px] ml-2 w-full placeholder:text-[#666]"
            />
            <div className="hidden md:flex items-center justify-center w-5 h-5 rounded border border-[#333] bg-[#111] text-[#888] text-[10px] font-mono">
              F
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto pb-4">
          {NAV_ITEMS.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`sec-${idx}`} className="px-2 pt-3 pb-1">
                  <span className="text-[10px] font-semibold text-[#666] tracking-wider uppercase">
                    {item.section}
                  </span>
                </div>
              );
            }
            if (item.divider) {
              return <div key={`div-${idx}`} className="h-px bg-[#222] my-2 mx-2"></div>;
            }
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-2 h-8 rounded-md transition-colors text-[13px] font-medium ${
                  active
                    ? 'bg-[#222] text-[#EDEDED]'
                    : 'text-[#888888] hover:bg-[#111] hover:text-[#EDEDED]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <item.icon size={14} className={active ? 'text-[#EDEDED]' : 'text-[#888888]'} />}
                  {item.label}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badge === '3' ? 'bg-orange-500/20 text-orange-500' : 'bg-[#222] text-[#AAA] border border-[#333]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {/* @ts-ignore */}
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
              {user?.full_name || 'Admin'}
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
        
        {/* Top Header Desktop */}
        <header className="hidden md:flex h-14 items-center px-6 border-b border-[#222] bg-[#000000] shrink-0">
          <div className="flex-1 flex items-center text-[13px] font-medium text-[#EDEDED]">
             DAIG Dashboard
             <div className="flex flex-col ml-2 opacity-50 relative">
               <div className="w-[8px] h-px bg-white rotate-45 absolute top-[-3px]"></div>
               <div className="w-[8px] h-px bg-white -rotate-45 absolute top-[3px]"></div>
             </div>
          </div>
          <div className="flex items-center justify-center flex-1">
            <span className="text-[13px] font-medium text-[#EDEDED]">
              {NAV_ITEMS.find((n) => isActive(n.path, n.exact))?.label || 'Overview'}
            </span>
          </div>
          <div className="flex-1"></div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#000000] relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
