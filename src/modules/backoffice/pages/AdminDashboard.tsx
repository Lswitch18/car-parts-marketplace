import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { 
  Search, Filter, LayoutGrid, List, ChevronDown, CheckCircle2, MoreHorizontal, Info
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const MOCK_USAGE = [
    { label: 'Edge Requests', value: '49K / 1M', icon: 'blue' },
    { label: 'Fast Data Transfer', value: '450.69 MB / 100 GB', icon: 'blue' },
    { label: 'Edge Request CPU Duration', value: '4s / 1h', icon: 'blue' },
    { label: 'Fast Origin Transfer', value: '0 / 10 GB', icon: 'gray' },
  ];

  const MOCK_PROJECTS = [
    {
      name: 'car-parts-marketplace',
      domain: 'www.daig.jp',
      github: 'Lswitch18/car-parts-mark...',
      commit: 'feat: redesign admin dashboard with vercel and supabase hybrid theme usi...',
      time: 'Just now on main',
      status: 'success'
    },
    {
      name: 'emo-fighters',
      domain: 'emo-fighters.vercel.app',
      github: 'Lswitch18/emo-fighters',
      commit: 'Melhora preview, detecção de frames e template visual',
      time: 'Jun 13 on master',
      status: 'success'
    },
    {
      name: 'v0-ai-image-editor-web',
      domain: '',
      github: '',
      commit: '',
      time: '',
      status: 'pending'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 text-[#EDEDED] font-sans">
      
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center h-10 bg-[#0A0A0A] border border-[#222] rounded-md px-3 focus-within:border-[#444] transition-colors">
          <Search size={16} className="text-[#888]" />
          <input 
            type="text" 
            placeholder="Search Projects..." 
            className="bg-transparent border-none outline-none text-[14px] ml-2 w-full placeholder:text-[#666]"
          />
        </div>
        
        <button className="w-10 h-10 flex items-center justify-center border border-[#222] rounded-md hover:bg-[#111] transition-colors">
          <Filter size={16} className="text-[#EDEDED]" />
        </button>
        
        <div className="flex items-center h-10 border border-[#222] rounded-md overflow-hidden bg-[#000]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`w-10 h-full flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-[#222]' : 'hover:bg-[#111]'}`}
          >
            <LayoutGrid size={14} className={viewMode === 'grid' ? 'text-white' : 'text-[#888]'} />
          </button>
          <div className="w-px h-full bg-[#222]"></div>
          <button 
            onClick={() => setViewMode('list')}
            className={`w-10 h-full flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-[#222]' : 'hover:bg-[#111]'}`}
          >
            <List size={14} className={viewMode === 'list' ? 'text-white' : 'text-[#888]'} />
          </button>
        </div>

        <button className="h-10 px-4 bg-white text-black font-medium text-[14px] rounded-md hover:bg-[#EAEAEA] transition-colors flex items-center gap-2">
          Add New...
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Usage & Alerts) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          {/* Usage */}
          <div>
            <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3">Usage</h3>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-medium text-[#EDEDED]">Last 30 days</span>
                <button className="h-7 px-3 bg-white text-black text-[12px] font-medium rounded-md hover:bg-[#EAEAEA] transition-colors">
                  Upgrade
                </button>
              </div>
              
              <div className="space-y-4">
                {MOCK_USAGE.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border-[3px] ${item.icon === 'blue' ? 'border-[#3B82F6]' : 'border-[#444]'}`}></div>
                      <span className="text-[13px] text-[#888]">{item.label}</span>
                      <Info size={12} className="text-[#444]" />
                    </div>
                    <span className="text-[13px] font-mono text-[#AAA]">{item.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[#0A0A0A] border border-[#222] hover:bg-[#111] transition-colors">
                  <ChevronDown size={14} className="text-[#888]" />
                </button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3 mt-6">Alerts</h3>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <h4 className="text-[14px] font-medium text-[#EDEDED] mb-1">Get alerted for anomalies</h4>
              <p className="text-[13px] text-[#888] mb-5 leading-relaxed">
                Automatically monitor your projects<br/>for anomalies and get notified.
              </p>
              <button className="h-8 px-4 bg-transparent border border-[#333] text-[#EDEDED] text-[13px] font-medium rounded-md hover:bg-[#111] transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Projects) */}
        <div className="flex-1">
          <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3">Projects</h3>
          <div className="space-y-4">
            {MOCK_PROJECTS.map((project, idx) => (
              <div key={idx} className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-colors flex items-start justify-between cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0">
                    {project.status === 'success' ? (
                       <span className="text-[#EDEDED] text-[16px] font-bold">G</span>
                    ) : (
                       <span className="text-[#444] text-[16px] font-bold">v0</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-[15px] font-semibold text-[#EDEDED] group-hover:text-blue-400 transition-colors">{project.name}</h4>
                    </div>
                    
                    {project.domain && (
                      <p className="text-[13px] text-[#888] mb-4">{project.domain}</p>
                    )}
                    
                    {project.github && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center justify-center w-4 h-4 bg-white rounded-full shrink-0">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-black"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        </div>
                        <span className="text-[12px] font-medium text-[#EDEDED] bg-[#111] border border-[#222] px-2 py-0.5 rounded-full">
                          {project.github}
                        </span>
                      </div>
                    )}
                    
                    {project.commit && (
                      <p className="text-[13px] text-[#888] truncate max-w-[400px]">{project.commit}</p>
                    )}
                    
                    {project.time && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[12px] text-[#666]">{project.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {project.status === 'success' ? (
                    <div className="w-6 h-6 rounded-full border-[2px] border-[#3B82F6] border-r-transparent flex items-center justify-center rotate-45">
                      <CheckCircle2 size={12} className="text-[#3B82F6] -rotate-45" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-[2px] border-[#333] border-r-[#888] flex items-center justify-center"></div>
                  )}
                  <button className="text-[#666] hover:text-[#EDEDED] transition-colors p-1 rounded-md hover:bg-[#1A1A1A]">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
