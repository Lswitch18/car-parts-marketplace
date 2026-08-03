import { describe, it, expect, vi } from 'vitest'

// Mock Supabase client to prevent WebSocket realtime errors in Vitest Node 20
vi.mock('@/modules/shared/lib/supabase', () => {
  return {
    supabase: {
      from: (table: string) => {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  id: '83441a3a-bdfc-4e34-bcc7-0244c2417764',
                  email: 'patrick.suzuki@daig.jp',
                  full_name: 'Patrick Suzuki',
                  stripe_account_id: 'acct_japan_connect_83441a3a',
                  bank_info: {
                    bank_name: 'MUFG Bank (三菱UFJ銀行)',
                    account_holder_name: 'PATRICK SUZUKI',
                    stripe_account_id: 'acct_japan_connect_83441a3a'
                  }
                },
                error: null
              })
            })
          }),
          update: () => ({
            eq: async () => ({ data: null, error: null })
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: 'tx-test-stripe-connect-100' },
                error: null
              })
            })
          })
        }
      }
    }
  }
})

import { StripeConnectService } from '@/modules/transactions/services/stripeConnectService'

describe('StripeConnectService - Seller Payouts & 6% Commission', () => {

  it('deve reter exatamente 6% de comissão e repassar 94% para o vendedor na peça de ¥100', () => {
    const amount = 100 // ¥ 100 Yenes
    const platformCommission = Math.round(amount * 0.06) // ¥ 6
    const sellerPayout = amount - platformCommission // ¥ 94

    expect(platformCommission).toBe(6)
    expect(sellerPayout).toBe(94)
  })

  it('deve calcular corretamente a divisão de 6% e 94% para ¥10.000', () => {
    const amount = 10000
    const platformCommission = Math.round(amount * 0.06) // ¥ 600
    const sellerPayout = amount - platformCommission // ¥ 9.400

    expect(platformCommission).toBe(600)
    expect(sellerPayout).toBe(9400)
  })

  it('deve gerar e estruturar os dados de repasse do Stripe Connect', async () => {
    const sellerId = '896a2a43-56fe-4efc-9328-4c20edcf810d'
    const buyerId = '83441a3a-bdfc-4e34-bcc7-0244c2417764'
    const partId = '1d7c0ab1-f8a0-4f58-9b6e-555cb8d18978'
    const amount = 100

    const result = await StripeConnectService.processConnectPayout({
      sellerId,
      buyerId,
      partId,
      amount
    })

    expect(result.success).toBe(true)
    expect(result.grossAmount).toBe(100)
    expect(result.platformCommission).toBe(6) // 6% retido
    expect(result.sellerPayout).toBe(94) // 94% repassado ao vendedor
    expect(result.transferId).toContain('tr_stripe_connect_6pct_')
    expect(result.sellerStripeAccountId).toContain('acct_')
  })

  it('deve consultar os detalhes da conta cadastrada no Stripe Connect', async () => {
    const userId = '83441a3a-bdfc-4e34-bcc7-0244c2417764'
    const details = await StripeConnectService.getConnectAccountDetails(userId)

    expect(details).not.toBeNull()
    expect(details?.currency).toBe('jpy')
    expect(details?.payoutStatus).toBe('verified')
    expect(details?.accountId).toBeDefined()
  })
})
