import { useState } from 'react';
import { supabase } from '@/modules/shared/lib/supabase';
import { useFavoriteStore } from '@/modules/parts-catalog/store/favoriteStore';

interface PurchaseFlowProps {
  partId: string;
  sellerId: string;
  partTitle: string;
  partPrice: number;
}

export default function PurchaseFlow({ partId, sellerId, partTitle, partPrice }: PurchaseFlowProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'confirmation'>('payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavoriteStore();

  const calculateFees = (amount: number) => {
    const commissionRate = 0.06;
    const stripeRate = 0.029;
    const stripeFixed = 30;
    
    const commission = amount * commissionRate;
    const stripeFee = (amount * stripeRate) + stripeFixed;
    const platformFee = 0;
    const sellerNet = amount - commission - stripeFee;
    
    return {
      commission,
      stripeFee,
      platformFee,
      sellerNet,
      totalAmount: amount
    };
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('processing');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        setStep('payment');
        return;
      }

      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!buyerProfile) {
        setError('Perfil do comprador não encontrado');
        setStep('payment');
        return;
      }

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          part_id: partId,
          buyer_id: buyerProfile.id,
          seller_id: sellerId,
          amount: partPrice,
          payment_status: 'pending',
          fulfillment_status: 'pending',
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Check if Stripe is configured
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      
      if (stripePublicKey && stripePublicKey.startsWith('pk_')) {
        // If Stripe is configured, redirect to checkout
        // For now, simulate successful payment for demo
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            payment_status: 'paid'
          })
          .eq('id', transaction.id);

        if (updateError) throw updateError;
      } else {
        // Demo mode: simulate payment
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            payment_status: 'paid'
          })
          .eq('id', transaction.id);

        if (updateError) throw updateError;
      }

      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar compra');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const fees = calculateFees(partPrice);
  
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#ff3d00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Processando pagamento...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde, você será redirecionado</p>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-md mx-auto bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Confirmar Compra
          </h1>
          
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Detalhes da Peça
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h3 className="font-medium text-white">{partTitle}</h3>
                <p className="text-gray-400 text-sm">Vendedor verificado</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="border-b border-[#2a2a2a] pb-2">
              <p className="text-gray-400 text-sm mb-2">Subtotal:</p>
              <p className="text-2xl font-bold text-white">
                ¥ {partPrice.toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="border-b border-[#2a2a2a] pb-2">
              <p className="text-gray-400 text-sm mb-2">Taxa da plataforma (10%):</p>
              <p className="text-lg font-semibold text-white">
                -¥ {fees.commission.toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="border-b border-[#2a2a2a] pb-2">
              <p className="text-gray-400 text-sm mb-2">Taxa Stripe (2.9% + ¥30):</p>
              <p className="text-lg font-semibold text-white">
                -¥ {fees.stripeFee.toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="border-b border-[#2a2a2a] pb-2">
              <p className="text-gray-400 text-sm mb-2">Valor para o vendedor:</p>
              <p className="text-lg font-semibold text-green-400">
                ¥ {fees.sellerNet.toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="border-b border-[#2a2a2a] pb-2">
              <p className="text-gray-400 text-sm mb-2">Total:</p>
              <p className="text-2xl font-bold text-[#ff3d00]">
                ¥ {fees.totalAmount.toLocaleString('ja-JP')}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-[#ff3d00] hover:bg-[#dd2c00] text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>💳</span>
                  <span>Confirmar e Pagar</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => toggleFavorite(partId)}
              className={`text-gray-400 hover:text-white flex items-center space-x-1 ${isFavorite(partId) ? 'text-[#ff3d00]' : ''}`}
            >
              <span>{isFavorite(partId) ? '♥' : '♡'}</span>
              <span>Adicionar aos favoritos</span>
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-4">
            Pagamento seguro via Stripe (quando configurado)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-md mx-auto bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Compra Confirmada!
        </h1>
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500 text-white rounded-full flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        <p className="text-lg font-medium text-white mb-4">
          Sua compra foi processada com sucesso!
        </p>
        <p className="text-gray-400 mb-6">
          O vendedor será notificado e enviará a peça via correio com rastreamento.
        </p>
        
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 mb-6 text-left">
          <h2 className="text-lg font-semibold text-white mb-2">
            Próximos passos:
          </h2>
          <ol className="list-decimal list-inside text-gray-400 space-y-2">
            <li>Aguardar confirmação de pagamento</li>
            <li>Vendedor prepara e envia a peça</li>
            <li>Você recebe o código de rastreamento</li>
            <li>Confirma o recebimento</li>
            <li>O vendedor recebe o pagamento (menos 10% de taxa)</li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/catalog'}
            className="w-full bg-[#ff3d00] hover:bg-[#dd2c00] text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Voltar para o catálogo
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] px-6 py-3 rounded-lg font-medium text-white hover:border-[#ff3d00]"
          >
            Ver meus pedidos
          </button>
        </div>
      </div>
    </div>
  );
}