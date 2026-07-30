/**
 * Cloud Growth & Financial Value Scaling Engine
 * Based on official pricing specifications for Vercel, Supabase, and Stripe Japan (JPY).
 */

export interface GrowthInputs {
  monthlyGmvJpy: number // Gross Merchandise Volume in JPY
  activeSaasStores: number // Number of SaaS Store Subscribers (¥30,000/mo)
  monthlyOrdersCount: number // Total orders processed
  estimatedDbSizeMb: number // Current DB storage in MB
  estimatedStorageGb: number // Current Media storage in GB
  estimatedBandwidthGb: number // Monthly data egress in GB
}

export interface GrowthProjection {
  // Financial Revenue Breakdown
  grossGmv: number
  marketplaceCommission: number // 10% on GMV
  saasMrr: number // ¥30,000 per active store
  totalGrossRevenue: number // Commission + SaaS MRR

  // Stripe Official Processing Costs (Japan JPY: 3.6% card fee)
  stripeCardFee: number // 3.6% of GMV
  stripeNetVolume: number // GMV - 3.6%

  // Infrastructure Costs (Official Vercel & Supabase Tiers)
  vercelTier: 'Hobby (Free)' | 'Pro ($20/mo)' | 'Enterprise'
  vercelCostUsd: number
  supabaseTier: 'Free ($0/mo)' | 'Pro ($25/mo)' | 'Team ($599/mo)'
  supabaseCostUsd: number
  totalCloudCostUsd: number
  totalCloudCostJpy: number // USD to JPY (1 USD ~ 155 JPY)

  // Net Profit & Business Health Metrics
  netProfitJpy: number
  netProfitMarginPercentage: number
  breakEvenSalesCount: number
  scalingAlerts: string[]
}

const USD_TO_JPY = 155 // Standard conversion rate

/**
 * Calculates accurate infrastructure & merchant fees based on official documentation.
 */
export function calculateCloudAndFinancialGrowth(inputs: GrowthInputs): GrowthProjection {
  const { 
    monthlyGmvJpy, 
    activeSaasStores, 
    monthlyOrdersCount, 
    estimatedDbSizeMb, 
    estimatedStorageGb, 
    estimatedBandwidthGb 
  } = inputs

  // 1. Marketplace Revenue (10% Commission + SaaS MRR of ¥30,000 per store)
  const marketplaceCommission = Math.round(monthlyGmvJpy * 0.10)
  const saasMrr = activeSaasStores * 30000
  const totalGrossRevenue = marketplaceCommission + saasMrr

  // 2. Stripe Fees (Japan Standard Card Processing: 3.6%)
  const stripeCardFee = Math.round(monthlyGmvJpy * 0.036)
  const stripeNetVolume = monthlyGmvJpy - stripeCardFee

  // 3. Vercel Official Infrastructure Cost Modeling
  let vercelTier: 'Hobby (Free)' | 'Pro ($20/mo)' | 'Enterprise' = 'Hobby (Free)'
  let vercelCostUsd = 0

  if (estimatedBandwidthGb > 100 || monthlyOrdersCount > 10000) {
    vercelTier = 'Pro ($20/mo)'
    vercelCostUsd = 20
    if (estimatedBandwidthGb > 1000) {
      const extraGb = estimatedBandwidthGb - 1000
      vercelCostUsd += Math.ceil(extraGb / 100) * 40
    }
  }

  // 4. Supabase Official Infrastructure Cost Modeling
  let supabaseTier: 'Free ($0/mo)' | 'Pro ($25/mo)' | 'Team ($599/mo)' = 'Free ($0/mo)'
  let supabaseCostUsd = 0

  const dbGb = estimatedDbSizeMb / 1024
  if (dbGb > 0.5 || estimatedStorageGb > 1 || activeSaasStores > 20) {
    supabaseTier = 'Pro ($25/mo)'
    supabaseCostUsd = 25
    if (dbGb > 8) {
      supabaseCostUsd += Math.ceil(dbGb - 8) * 0.125
    }
    if (estimatedStorageGb > 100) {
      supabaseCostUsd += Math.ceil(estimatedStorageGb - 100) * 0.021
    }
  }

  const totalCloudCostUsd = vercelCostUsd + supabaseCostUsd
  const totalCloudCostJpy = Math.round(totalCloudCostUsd * USD_TO_JPY)

  // 5. Net Profit & Margin Calculation
  const netProfitJpy = totalGrossRevenue - totalCloudCostJpy
  const netProfitMarginPercentage = totalGrossRevenue > 0 
    ? Number(((netProfitJpy / totalGrossRevenue) * 100).toFixed(1)) 
    : 100

  // 6. Scaling Alerts & Threshold Warnings
  const scalingAlerts: string[] = []

  if (estimatedDbSizeMb > 400) {
    scalingAlerts.push('⚠️ DB Supabase próximo ao limite de 500 MB do plano Free. Recomendado Upgrade Pro ($25/mês).')
  }
  if (estimatedBandwidthGb > 80) {
    scalingAlerts.push('⚠️ Banda Vercel em 80% da cota gratuita. Transição automática para Pro em breve.')
  }
  if (activeSaasStores >= 10 && supabaseTier === 'Free ($0/mo)') {
    scalingAlerts.push('🚀 10+ Lojas ativas! Escala recomendada para Supabase Pro para garantir conexões adicionais de banco.')
  }
  if (scalingAlerts.length === 0) {
    scalingAlerts.push('🟢 Infraestrutura Operando em Capacidade Ideal (0% de Custos Excedentes).')
  }

  // 7. Break-Even Sales Count
  const avgOrderValue = monthlyOrdersCount > 0 ? monthlyGmvJpy / monthlyOrdersCount : 15000
  const avgCommissionPerOrder = avgOrderValue * 0.10
  const breakEvenSalesCount = avgCommissionPerOrder > 0 
    ? Math.ceil(totalCloudCostJpy / avgCommissionPerOrder) 
    : 0

  return {
    grossGmv: monthlyGmvJpy,
    marketplaceCommission,
    saasMrr,
    totalGrossRevenue,
    stripeCardFee,
    stripeNetVolume,
    vercelTier,
    vercelCostUsd,
    supabaseTier,
    supabaseCostUsd,
    totalCloudCostUsd,
    totalCloudCostJpy,
    netProfitJpy,
    netProfitMarginPercentage,
    breakEvenSalesCount,
    scalingAlerts
  }
}
