import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Camera, ArrowDown } from 'lucide-react';

export default function QRInstallPage() {
  const [qrUrl, setQrUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const url = 'https://daig.jp/app/worker';
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#3B82F6', light: '#FFFFFF' } })
      .then(setQrUrl);
  }, []);

  const handleInstall = () => {
    window.location.href = '/app/worker/dashboard';
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-8 qr-bg">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <span className="text-4xl font-black">L</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">Logistix Mobile</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">App de coletas e entregas</p>

        <button onClick={handleInstall}
          className="w-full max-w-xs h-14 bg-blue-500 rounded-2xl text-base font-bold flex items-center justify-center gap-3 active:bg-blue-600 shadow-lg shadow-blue-500/30 mb-6">
          <ArrowDown size={22} /> ABRIR APP
        </button>

        <div className="text-xs text-gray-500 space-y-2 text-center max-w-xs">
          <p>📱 Chrome: ⋮ → Instalar aplicativo</p>
          <p>🍎 Safari: Compartilhar → Adicionar à Tela de Início</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-8 qr-bg">
      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
        <span className="text-3xl font-black">L</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Logistix Mobile</h1>
      <p className="text-gray-400 text-sm mb-8">App para coletores e entregadores</p>

      {qrUrl && (
        <div className="bg-white p-4 rounded-2xl shadow-2xl mb-6">
          <img src={qrUrl} alt="QR Code Logistix" className="w-56 h-56" />
        </div>
      )}

      <div className="flex items-center gap-2 text-blue-400 text-sm mb-6">
        <Camera size={16} />
        <span>Escaneie com o celular para instalar</span>
      </div>

      <div className="text-xs text-gray-500 space-y-1.5 text-center max-w-xs bg-[#111827] rounded-xl p-4 border border-white/5">
        <p className="text-gray-400 font-medium mb-2">📱 Como instalar no celular:</p>
        <p>1. Abra a câmera e aponte para o QR Code</p>
        <p>2. Toque no link que aparecer</p>
        <p>3. ⋮ Menu → "Adicionar à tela inicial"</p>
      </div>
    </div>
  );
}
