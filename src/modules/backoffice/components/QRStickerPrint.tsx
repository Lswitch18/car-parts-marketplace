import { useState } from 'react'
import { QrCode, Printer, Check, Copy, Tag, Building2, Package } from 'lucide-react'

interface QRStickerPrintProps {
  partTitle: string
  oemCode?: string
  price: number
  wmsLocation?: string
  licensePlate?: string
  partId: string
  tenantName?: string
}

/**
 * 🏷️ IMPRESSORA DE ETIQUETAS TÉRMICAS WMS (80mm / 58mm)
 * Exclusivo do Painel do Vendedor / Tenant SaaS ERP
 */
export default function QRStickerPrint({
  partTitle,
  oemCode = 'OEM-JDM-7718',
  price,
  wmsLocation = 'Corredor B • Prateleira 04',
  licensePlate = '品川 300 な 45-89',
  partId,
  tenantName = 'Tokyo Auto Parts'
}: QRStickerPrintProps) {
  const [stickerSize, setStickerSize] = useState<'80mm' | '58mm'>('80mm')
  const [copied, setCopied] = useState(false)

  const qrValue = `DAIG_WMS_PART_${partId}`

  const handlePrint = () => {
    window.print()
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm">Etiqueta Térmica de Armazém WMS</h3>
        </div>
        
        {/* Seletor de Tamanho 80mm vs 58mm */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setStickerSize('80mm')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              stickerSize === '80mm' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            80mm (Zebra)
          </button>
          <button
            onClick={() => setStickerSize('58mm')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              stickerSize === '58mm' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            58mm (Mini)
          </button>
        </div>
      </div>

      {/* Visualização da Etiqueta Adesiva Pronta para Colagem na Peça */}
      <div className="flex justify-center my-4">
        <div 
          className={`bg-white text-black p-4 rounded-xl shadow-2xl border-2 border-dashed border-zinc-400 font-sans ${
            stickerSize === '80mm' ? 'w-72' : 'w-56'
          }`}
        >
          {/* Header da Etiqueta */}
          <div className="border-b border-black pb-2 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-tighter uppercase font-mono">{tenantName}</span>
            <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-mono font-bold">DAIG WMS</span>
          </div>

          {/* Título & OEM */}
          <p className="font-bold text-xs leading-tight line-clamp-2 mb-1">{partTitle}</p>
          <p className="font-mono text-[10px] font-semibold text-zinc-700">OEM: {oemCode}</p>

          {/* QR Code & Localização WMS */}
          <div className="flex items-center space-x-3 my-2 bg-zinc-100 p-2 rounded-lg border border-zinc-300">
            <div className="w-14 h-14 bg-white border border-black rounded flex items-center justify-center p-1 shrink-0">
              {/* QR Code SVG / Visual Mock */}
              <QrCode className="w-full h-full text-black" />
            </div>
            <div className="text-[10px] space-y-0.5 font-mono">
              <p className="font-bold text-black flex items-center gap-1">
                <Tag className="w-3 h-3 text-zinc-700" /> {wmsLocation}
              </p>
              <p className="text-zinc-800">Placa: {licensePlate}</p>
              <p className="text-zinc-900 font-bold">¥ {price.toLocaleString('ja-JP')} JPY</p>
            </div>
          </div>

          {/* Código de Barras Hash */}
          <div className="text-center pt-1 border-t border-zinc-300">
            <p className="font-mono text-[9px] font-bold tracking-widest text-zinc-800">{qrValue}</p>
          </div>
        </div>
      </div>

      {/* Botões de Ação para o Vendedor */}
      <div className="flex items-center space-x-2 mt-4">
        <button
          onClick={handlePrint}
          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Etiqueta Térmica</span>
        </button>

        <button
          onClick={handleCopyCode}
          className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition border border-zinc-700 flex items-center space-x-1"
          title="Copiar Código WMS"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  )
}
