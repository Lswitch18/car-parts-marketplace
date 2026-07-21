import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { 
  calculateGrowth, 
  calculateFinanceStats, 
  orchestrateAlerts 
} from '../src/modules/backoffice/utils/dashboardUtils.ts';

describe('Admin Dashboard - Unit Tests', () => {

  describe('calculateGrowth', () => {
    it('deve calcular porcentagem positiva de crescimento', () => {
      assert.strictEqual(calculateGrowth(150, 100), 50);
      assert.strictEqual(calculateGrowth(200, 50), 300);
    });

    it('deve calcular porcentagem estagnada (sem alteração)', () => {
      assert.strictEqual(calculateGrowth(100, 100), 0);
    });

    it('deve calcular porcentagem negativa de queda', () => {
      assert.strictEqual(calculateGrowth(50, 100), -50);
      assert.strictEqual(calculateGrowth(25, 100), -75);
    });

    it('deve tratar divisão por zero adequadamente', () => {
      assert.strictEqual(calculateGrowth(100, 0), 100);
      assert.strictEqual(calculateGrowth(0, 0), 0);
    });
  });

  describe('calculateFinanceStats', () => {
    it('deve retornar zeros quando os dados de transações forem nulos ou vazios', () => {
      assert.deepStrictEqual(calculateFinanceStats(null), { gmv: 0, escrow: 0, activeOrders: 0 });
      assert.deepStrictEqual(calculateFinanceStats([]), { gmv: 0, escrow: 0, activeOrders: 0 });
    });

    it('deve calcular GMV corretamente para transações pagas e concluídas', () => {
      const mockData = [
        { amount: 15000, payment_status: 'paid', fulfillment_status: 'pending' },
        { amount: 25000, payment_status: 'escrow', fulfillment_status: 'delivered' },
        { amount: 10000, payment_status: 'escrow', fulfillment_status: 'completed' },
      ];

      const stats = calculateFinanceStats(mockData);
      assert.strictEqual(stats.gmv, 50000);
    });

    it('deve calcular saldo em custódia (Escrow) e pedidos ativos corretamente', () => {
      const mockData = [
        { amount: 8000, payment_status: 'escrow', fulfillment_status: 'pending' },
        { amount: 12000, payment_status: 'escrow', fulfillment_status: 'shipped' },
        { amount: 5000, payment_status: 'pending', fulfillment_status: 'pending' },
        { amount: 6000, payment_status: 'pending_payment', fulfillment_status: 'pending' },
        { amount: 20000, payment_status: 'failed', fulfillment_status: 'cancelled' },
      ];

      const stats = calculateFinanceStats(mockData);
      assert.strictEqual(stats.escrow, 20000);
      assert.strictEqual(stats.activeOrders, 4);
    });

    it('deve ignorar transações canceladas, falhas ou reembolsadas no GMV e Escrow', () => {
      const mockData = [
        { amount: 50000, payment_status: 'failed', fulfillment_status: 'cancelled' },
        { amount: 30000, payment_status: 'refunded', fulfillment_status: 'returned' },
      ];

      const stats = calculateFinanceStats(mockData);
      assert.strictEqual(stats.gmv, 0);
      assert.strictEqual(stats.escrow, 0);
      assert.strictEqual(stats.activeOrders, 0);
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

      assert.strictEqual(alerts.length, 2);
      assert.strictEqual(alerts[0].type, 'warning');
      assert.strictEqual(alerts[0].ctx, 'Identity');
      assert.strictEqual(alerts[1].type, 'warning');
      assert.strictEqual(alerts[1].ctx, 'Logistics');
    });

    it('deve gerar alerta crítico quando existirem disputas financeiras abertas', () => {
      const alerts = orchestrateAlerts({
        pendingStoreValidations: 0,
        pendingShipments: 0,
        openDisputes: 2,
        flaggedReviews: 0,
      });

      assert.strictEqual(alerts.length, 1);
      assert.strictEqual(alerts[0].type, 'critical');
      assert.strictEqual(alerts[0].ctx, 'Finance');
      assert.strictEqual(alerts[0].path, '/admin/transactions');
    });

    it('deve gerar alerta informativo operacional quando não houver pendências críticas', () => {
      const alerts = orchestrateAlerts({
        pendingStoreValidations: 0,
        pendingShipments: 2,
        openDisputes: 0,
        flaggedReviews: 1,
      });

      assert.strictEqual(alerts.length, 1);
      assert.strictEqual(alerts[0].type, 'info');
      assert.strictEqual(alerts[0].ctx, 'System');
      assert.strictEqual(alerts[0].action, null);
    });
  });

});
