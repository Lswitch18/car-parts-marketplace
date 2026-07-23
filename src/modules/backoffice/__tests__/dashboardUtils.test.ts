import { describe, it, expect } from 'vitest';
import { 
  calculateGrowth, 
  calculateFinanceStats, 
  orchestrateAlerts,
  TransactionSummary 
} from '../utils/dashboardUtils';

describe('Backoffice Module - Dashboard Utils', () => {
  describe('calculateGrowth', () => {
    it('deve calcular porcentagem positiva de crescimento', () => {
      expect(calculateGrowth(150, 100)).toBe(50);
      expect(calculateGrowth(200, 50)).toBe(300);
    });

    it('deve calcular porcentagem estagnada (sem alteração)', () => {
      expect(calculateGrowth(100, 100)).toBe(0);
    });

    it('deve calcular porcentagem negativa de queda', () => {
      expect(calculateGrowth(50, 100)).toBe(-50);
      expect(calculateGrowth(25, 100)).toBe(-75);
    });

    it('deve tratar divisão por zero adequadamente', () => {
      expect(calculateGrowth(100, 0)).toBe(100);
      expect(calculateGrowth(0, 0)).toBe(0);
    });
  });

  describe('calculateFinanceStats', () => {
    it('deve retornar zeros quando os dados de transações forem nulos ou vazios', () => {
      expect(calculateFinanceStats(null)).toEqual({ gmv: 0, escrow: 0, activeOrders: 0, netProfit: 0 });
      expect(calculateFinanceStats([])).toEqual({ gmv: 0, escrow: 0, activeOrders: 0, netProfit: 0 });
    });

    it('deve calcular GMV e Lucro Líquido (10%) corretamente apenas para transações pagas e concluídas', () => {
      const mockData: TransactionSummary[] = [
        { amount: 15000, payment_status: 'paid', fulfillment_status: 'pending' },
        { amount: 25000, payment_status: 'escrow', fulfillment_status: 'delivered' },
        { amount: 10000, payment_status: 'escrow', fulfillment_status: 'completed' },
      ];

      const stats = calculateFinanceStats(mockData);
      expect(stats.gmv).toBe(50000); // 15000 + 25000 + 10000
      expect(stats.netProfit).toBe(5000); // 10% de 50000 = 5000 JPY
    });

    it('deve calcular saldo em custódia (Escrow) e pedidos ativos corretamente', () => {
      const mockData: TransactionSummary[] = [
        { amount: 8000, payment_status: 'escrow', fulfillment_status: 'pending' },
        { amount: 12000, payment_status: 'escrow', fulfillment_status: 'shipped' },
        { amount: 5000, payment_status: 'pending', fulfillment_status: 'pending' },
        { amount: 6000, payment_status: 'pending_payment', fulfillment_status: 'pending' }, // Konbini pendente
        { amount: 20000, payment_status: 'failed', fulfillment_status: 'cancelled' },
      ];

      const stats = calculateFinanceStats(mockData);
      expect(stats.escrow).toBe(20000); // 8000 + 12000
      expect(stats.activeOrders).toBe(4); // 2 escrow + 1 pending + 1 pending_payment
      expect(stats.netProfit).toBe(0); // Nenhuma transação finalizada/paga
    });

    it('deve ignorar transações canceladas, falhas ou reembolsadas no GMV, Escrow e Lucro', () => {
      const mockData: TransactionSummary[] = [
        { amount: 50000, payment_status: 'failed', fulfillment_status: 'cancelled' },
        { amount: 30000, payment_status: 'refunded', fulfillment_status: 'returned' },
      ];

      const stats = calculateFinanceStats(mockData);
      expect(stats.gmv).toBe(0);
      expect(stats.escrow).toBe(0);
      expect(stats.activeOrders).toBe(0);
      expect(stats.netProfit).toBe(0);
    });
  });

  describe('orchestrateAlerts', () => {
    it('deve gerar alertas de aviso para verificações B2B e envios pendentes elevados', () => {
      const alerts = orchestrateAlerts({
        pendingStoreValidations: 3,
        pendingShipments: 15,
        openDisputes: 0,
        flaggedReviews: 0,
      });

      expect(alerts.length).toBe(2);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].ctx).toBe('Identity');
      expect(alerts[1].type).toBe('warning');
      expect(alerts[1].ctx).toBe('Logistics');
    });

    it('deve gerar alerta crítico quando existirem disputas financeiras abertas', () => {
      const alerts = orchestrateAlerts({
        pendingStoreValidations: 0,
        pendingShipments: 0,
        openDisputes: 2,
        flaggedReviews: 0,
      });

      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('critical');
      expect(alerts[0].ctx).toBe('Finance');
      expect(alerts[0].path).toBe('/admin/transactions');
    });

    it('deve gerar alerta informativo operacional quando não houver pendências críticas', () => {
      const alerts = orchestrateAlerts({
        pendingStoreValidations: 0,
        pendingShipments: 2, // abaixo do limite de 10
        openDisputes: 0,
        flaggedReviews: 1, // abaixo do limite de 5
      });

      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('info');
      expect(alerts[0].ctx).toBe('System');
      expect(alerts[0].action).toBeNull();
    });
  });
});
