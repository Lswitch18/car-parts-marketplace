import React from 'react';

export default function BrandLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
      <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );
}
