import React from 'react';
import { Loader2 } from 'lucide-react';

interface BrandLoaderProps {
  text?: string;
}

export default function BrandLoader({ text = "Carregando..." }: BrandLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
      {/* Container simples com apenas o spinner */}
      <div className="flex flex-col items-center">
        {/* Spinner minimalista */}
        <div className="flex items-center text-[#00E5FF]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    </div>
  );
}
