import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  pedido: any;
  onClose: () => void;
}

export default function LabelPrint({ pedido, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && pedido?.codigo) {
      JsBarcode(barcodeRef.current, pedido.codigo, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
    }
  }, [pedido]);

  const p = pedido || {};
  const cliente = p.cliente || {};
  const origem = p.armazem_origem || {};

  return (
    <div className="bg-[#0B1220] min-h-screen text-white">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-400">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button onClick={() => window.print()}
            className="h-10 px-4 bg-blue-500 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Printer size={16} /> Imprimir
          </button>
        </div>

        <div id="label-content" className="bg-white text-black rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 font-medium">DAIG LOGISTIX</p>
              <p className="text-lg font-black tracking-tight">ETIQUETA DE ENVIO</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-black">
              L
            </div>
          </div>

          {/* Tracking Code */}
          <div className="text-center mb-4">
            <p className="text-2xl font-bold tracking-wider">{p.codigo || 'SEM CÓDIGO'}</p>
            <svg ref={barcodeRef} className="w-full mt-2"></svg>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-0.5">Origem</p>
              <p className="font-semibold text-sm">{origem.nome || '—'}</p>
              <p className="text-gray-500">{origem.cidade ? `${origem.cidade}, ${origem.estado}` : ''}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-0.5">Destino</p>
              <p className="font-semibold text-sm">{p.destino_cidade || '—'}</p>
              <p className="text-gray-500">{p.destino_estado || ''}</p>
            </div>
          </div>

          {/* Sender / Recipient */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-0.5">Remetente</p>
              <p className="font-semibold">{origem.responsavel || origem.nome || 'DAIG'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 font-medium mb-0.5">Destinatário</p>
              <p className="font-semibold">{cliente.nome || '—'}</p>
              <p className="text-gray-500">{cliente.cidade ? `${cliente.cidade}/${cliente.estado}` : ''}</p>
            </div>
          </div>

          {/* Weight & Value */}
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-3 mb-4">
            <div>
              <p className="text-gray-500">Peso</p>
              <p className="font-semibold">{p.peso_kg ? `${p.peso_kg}kg` : '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Valor</p>
              <p className="font-semibold">{p.valor ? `¥${p.valor.toLocaleString?.() || p.valor}` : '—'}</p>
            </div>
          </div>

          {/* Tracking Steps Preview */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-[10px] text-gray-400 text-center">logistix.daig.jp/rastreamento/{p.codigo || ''}</p>
          </div>
        </div>

        <style>{`@media print { body { background: white; } #label-content { box-shadow: none; border-radius: 0; } }`}</style>
      </div>
    </div>
  );
}
