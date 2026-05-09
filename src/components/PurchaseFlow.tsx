import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';
import { useFavoriteStore } from '../stores/favoriteStore';

interface PurchaseFlowProps {
  partId: string;
  sellerId: string;
  partTitle: string;
  partPrice: number;
}

export default function PurchaseFlow({ partId, sellerId, partTitle, partPrice }: PurchaseFlowProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<'payment' | 'confirmation'>('payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavoriteStore();

  const calculateFees = (amount: number) => {
    const commissionRate = 0.10; // 10%
    const commission = amount * commissionRate;
    const sellerNet = amount - commission;
    return {
      commission,
      sellerNet,
      platformFee: 0, // Could add fixed platform fee later
      totalAmount: amount
    };
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!buyerProfile) {
        setError('Perfil do comprador não encontrado');
        return;
      }

      const fees = calculateFees(partPrice);
      
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          part_id: partId,
          buyer_id: buyerProfile.id,
          seller_id: sellerId,
          amount: partPrice,
          commission: fees.commission,
          seller_net: fees.sellerNet,
          platform_fee: fees.platformFee,
          payment_status: 'pending',
          fulfillment_status: 'pending',
          payment_method: 'credit_card', // In real app, this would come from payment processor
          shipping_address: {
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'Japan'
          }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // In a real app, you would integrate with a payment processor here
      // For now, we'll simulate immediate payment
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'payment') {
    const fees = calculateFees(partPrice);
    
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h1 className="font-display text-2xl font-bold text-text mb-4">
            {t('Confirmar Compra')}
          </h1>
          
          <div className="bg-background border border-border rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-text mb-2">
              {t('Detalhes da Peça')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-border rounded-lg flex items-center justify-center">
                <span className="text-text-secondary">🔧</span>
              </div>
              <div>
                <h3 className="font-medium text-text">{partTitle}</h3>
                <p className="text-text-secondary text-sm">
                  {t('Peça única')} | {t('Vendedor verificado')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <p className="text-text-secondary text-sm mb-2">
                {t('Subtotal:')}
              </p>
              <p className="text-2xl font-bold text-text">
                ¥ {partPrice.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-b pb-2">
              <p className="text-text-secondary text-sm mb-2">
                {t('Taxa da plataforma (10%):')}
              </p>
              <p className="text-lg font-semibold text-text">
                ¥ {fees.commission.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-b pb-2">
              <p className="text-text-secondary text-sm mb-2">
                {t('Valor para o vendedor:')}
              </p>
              <p className="text-lg font-semibold text-success">
                ¥ {fees.sellerNet.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-b pb-2">
              <p className="text-text-secondary text-sm mb-2">
                {t('Total:')}
              </p>
              <p className="text-2xl font-bold text-primary">
                ¥ {fees.totalAmount.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>{t('Processando...')}</span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5">💳</span>
                  <span>{t('Confirmar e Pagar')}</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => toggleFavorite(partId)}
              className={`text-text-secondary hover:text-text flex items-center space-x-1 ${isFavorite(partId) ? 'text-primary' : ''}`}
            >
              <span>{isFavorite(partId) ? '♥' : '♡'}</span>
              <span>{t('Adicionar aos favoritos')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text mb-4">
          {t('Compra Confirmada!')}
        </h1>
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-primary text-white rounded-full">
          <span className="text-4xl">✓</span>
        </div>
        <p className="text-lg font-medium text-text mb-4">
          {t('Sua compra foi processada com sucesso!')}
        </p>
        <p className="text-text-secondary mb-6">
          {t('O vendedor será notificado e enviará a peça via correio com rastreamento.')}
        </p>
        
        <div className="bg-background border border-border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-text mb-2">
            {t('Próximos passos:')}
          </h2>
          <ol className="list-decimal list-inside text-text-secondary space-y-2">
            <li>{t('Aguardar confirmação de pagamento')}</li>
            <li>{t('Vendedor prepara e envia a peça')}</li>
            <li>{t('Você recebe o código de rastreamento')}</li>
            <li>{t('Confirma o recebimento')}</li>
            <li>{t('O vendedor recebe o pagamento (menos 10% de taxa)')}</li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            {t('Voltar para o catálogo')}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-background border border-border px-6 py-3 rounded-lg font-medium text-text hover:border-primary"
          >
            {t('Ver meus pedidos')}
          </button>
        </div>
      </div>
    </div>
  );
}