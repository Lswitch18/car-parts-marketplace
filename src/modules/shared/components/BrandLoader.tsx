import React from 'react';
import GaidLogo from './GaidLogo';
import { Loader2 } from 'lucide-react';

interface BrandLoaderProps {
  text?: string;
}

export default function BrandLoader({ text = "Carregando..." }: BrandLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
      {/* Container pulsante */}
      <div className="flex flex-col items-center animate-pulse">
        {/* Logo DAIG com sombra Neon */}
        <div className="relative mb-8 drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]">
          <GaidLogo size={80} variant="vertical" />
        </div>
        
        {/* Spinner minimalista integrado */}
        <div className="flex items-center gap-3 text-[#00E5FF]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium tracking-widest uppercase opacity-90">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
