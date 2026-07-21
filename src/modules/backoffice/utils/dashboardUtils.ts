/**
 * Backoffice Module - Dashboard Utilities
 * Funções puras utilitárias para cálculo de métricas, consolidação financeira e alertas do Painel Admin.
 */

export interface TransactionSummary {
  amount?: number;
  payment_status?: string;
  fulfillment_status?: string;
}

export interface FinanceStats {
  gmv: number;
  escrow: number;
  activeOrders: number;
}

export interface AlertItem {
  type: 'critical' | 'warning' | 'info';
  msg: string;
  ctx: string;
  action: string | null;
  path: string | null;
}

export interface AlertOrchestrationParams {
  pendingStoreValidations: number;
  pendingShipments: number;
  openDisputes: number;
  flaggedReviews: number;
  t?: (key: string) => string;
}

/**
 * Calcula a porcentagem de crescimento entre o valor atual e o anterior.
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

/**
 * Consolida as métricas financeiras (GMV, Saldo em Custódia Escrow e Pedidos Ativos)
 * a partir das transações da plataforma.
 */
export function calculateFinanceStats(txData: TransactionSummary[] | null | undefined): FinanceStats {
  let gmv = 0;
  let escrow = 0;
  let activeOrders = 0;

  if (!txData || !Array.isArray(txData)) {
    return { gmv, escrow, activeOrders };
  }

  for (const tx of txData) {
    const amount = Number(tx.amount) || 0;
    const paymentStatus = tx.payment_status || '';
    const fulfillmentStatus = tx.fulfillment_status || '';

    // GMV engloba pagamentos confirmados/concluídos ou entregues
    if (paymentStatus === 'paid' || fulfillmentStatus === 'delivered' || fulfillmentStatus === 'completed') {
      gmv += amount;
    }

    // Escrow engloba valores em custódia pendentes de confirmação de entrega do comprador
    if (paymentStatus === 'escrow') {
      escrow += amount;
      activeOrders++;
    } else if (paymentStatus === 'pending' || paymentStatus === 'pending_payment') {
      activeOrders++;
    }
  }

  return { gmv, escrow, activeOrders };
}

/**
 * Orquestra e gera os alertas acionáveis exibidos no Painel Administrativo.
 */
export function orchestrateAlerts(params: AlertOrchestrationParams): AlertItem[] {
  const { pendingStoreValidations, pendingShipments, openDisputes, flaggedReviews, t = (s: string) => s } = params;
  const alerts: AlertItem[] = [];

  if (pendingStoreValidations > 0) {
    alerts.push({
      type: 'warning',
      msg: `${pendingStoreValidations} ${t('Company Verifications pending (B2B)')}`,
      ctx: t('Identity'),
      action: t('Review'),
      path: '/admin/crm/contacts'
    });
  }

  if (pendingShipments > 10) {
    alerts.push({
      type: 'warning',
      msg: `${t('High volume of pending shipments')} (${pendingShipments})`,
      ctx: t('Logistics'),
      action: t('Fulfill'),
      path: '/admin/logistix'
    });
  }

  if (openDisputes > 0) {
    alerts.push({
      type: 'critical',
      msg: `${openDisputes} ${t('Open Transaction Dispute requires mediation')}`,
      ctx: t('Finance'),
      action: t('Resolve'),
      path: '/admin/transactions'
    });
  }

  if (flaggedReviews > 5) {
    alerts.push({
      type: 'info',
      msg: `${flaggedReviews} ${t('reviews need moderation')}`,
      ctx: t('Trust'),
      action: t('Moderate'),
      path: '/admin/reviews'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      msg: t('All systems operational. Edge caches warmed up.'),
      ctx: t('System'),
      action: null,
      path: null
    });
  }

  return alerts;
}
