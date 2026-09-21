import React from 'react';

interface BrandLoaderProps {
  text?: string;
}

export default function BrandLoader({ text }: BrandLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-in-out">
      <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin" />
      {text && (
        <p className="text-sm font-medium tracking-wide text-cyan-300 animate-pulse font-sans">
          {text}
        </p>
      )}
    </div>
  );
}
