import { describe, it, expect } from 'vitest'
import { calculateCloudAndFinancialGrowth } from '../utils/cloudGrowthEngine'

describe('Cloud Growth & Financial Value Scaling Engine', () => {

  it('deve calcular corretamente a receita em lote baixo (100% dentro da cota gratuita)', () => {
    const projection = calculateCloudAndFinancialGrowth({
      monthlyGmvJpy: 100000, // ¥100,000 GMV
      activeSaasStores: 2,   // 2 lojas (¥60,000 MRR)
      monthlyOrdersCount: 5,
      estimatedDbSizeMb: 10,
      estimatedStorageGb: 0.1,
      estimatedBandwidthGb: 5
    })

    expect(projection.marketplaceCommission).toBe(10000) // 10% de ¥100,000 = ¥10,000
    expect(projection.saasMrr).toBe(60000) // 2 * ¥30,000 = ¥60,000
    expect(projection.totalGrossRevenue).toBe(70000) // ¥10,000 + ¥60,000 = ¥70,000
    expect(projection.stripeCardFee).toBe(3600) // 3.6% de ¥100,000 = ¥3,600
    expect(projection.totalCloudCostUsd).toBe(0) // $0 no Free Tier
    expect(projection.netProfitJpy).toBe(70000)
    expect(projection.netProfitMarginPercentage).toBe(100)
  })

  it('deve acionar upgrade automático para Vercel Pro e Supabase Pro ao atingir limites de escala', () => {
    const projection = calculateCloudAndFinancialGrowth({
      monthlyGmvJpy: 5000000, // ¥5,000,000 GMV
      activeSaasStores: 25,   // 25 lojas (¥750,000 MRR)
      monthlyOrdersCount: 250,
      estimatedDbSizeMb: 600, // Excede 500MB -> Dispara Supabase Pro ($25)
      estimatedStorageGb: 2,
      estimatedBandwidthGb: 150 // Excede 100GB -> Dispara Vercel Pro ($20)
    })

    expect(projection.vercelTier).toBe('Pro ($20/mo)')
    expect(projection.supabaseTier).toBe('Pro ($25/mo)')
    expect(projection.totalCloudCostUsd).toBe(45) // $20 + $25
    expect(projection.totalCloudCostJpy).toBe(45 * 155) // ¥6,975
    expect(projection.netProfitJpy).toBe(projection.totalGrossRevenue - 6975)
    expect(projection.scalingAlerts.length).toBeGreaterThan(0)
  })

  it('deve calcular corretamente a taxa do Stripe Japan (3.6%) e o volume líquido repassado', () => {
    const projection = calculateCloudAndFinancialGrowth({
      monthlyGmvJpy: 1000000, // ¥1,000,000
      activeSaasStores: 0,
      monthlyOrdersCount: 10,
      estimatedDbSizeMb: 5,
      estimatedStorageGb: 0.1,
      estimatedBandwidthGb: 2
    })

    expect(projection.stripeCardFee).toBe(36000) // 3.6% de 1M = 36,000 JPY
    expect(projection.stripeNetVolume).toBe(964000) // 1,000,000 - 36,000 = 964,000 JPY
  })

})
