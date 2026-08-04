import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/modules/shared/lib/supabase'
import { useAuthStore } from '@/modules/identity/store/authStore'

export interface RealWorkOrder {
  id: string
  title: string
  client: string
  vehicle: string
  mechanic: string
  status: 'aguardando' | 'em_manutencao' | 'testes' | 'pronto'
  amount: number
  parts_used?: string
  created_at: string
}

export interface RealNfeInvoice {
  id: string
  access_key: string
  supplier: string
  invoice_value: number
  status: string
  issued_at: string
}

export interface RealTransactionSale {
  id: string
  part_id: string
  amount: number
  seller_net: number
  payment_status: string
  created_at: string
}

export function useTenantRealData() {
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [realParts, setRealParts] = useState<any[]>([])
  const [realWorkOrders, setRealWorkOrders] = useState<RealWorkOrder[]>([])
  const [realTransactions, setRealTransactions] = useState<RealTransactionSale[]>([])
  const [realNfeInvoices, setRealNfeInvoices] = useState<RealNfeInvoice[]>([])
  const [tenantInfo, setTenantInfo] = useState<any | null>(null)

  const loadRealTenantData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // 1. Busca perfil & dados do tenant
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, tenants(*)')
        .eq('id', user.id)
        .single()

      if (profile) {
        setTenantInfo(profile.tenants || {
          id: profile.tenant_id || `tenant_${user.id.slice(0, 8)}`,
          name: profile.store_name || user.full_name || user.name || 'Desmanche & Auto Peças',
          plan: 'enterprise'
        })
      }

      // 2. Busca Peças Reais do Estoque no Banco de Dados
      const { data: partsData } = await supabase
        .from('parts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setRealParts(partsData || [])

      // 3. Busca Vendas e Transações Reais
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setRealTransactions(txData || [])

      // 4. Busca Ordens de Serviço Reais da Oficina
      const { data: woData } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })

      setRealWorkOrders((woData as any[]) || [])

      // 5. Busca Notas Fiscais NFe de Compras
      const { data: nfeData } = await supabase
        .from('nfe_invoices')
        .select('*')
        .order('created_at', { ascending: false })

      setRealNfeInvoices((nfeData as any[]) || [])

    } catch (err) {
      console.warn('[useTenantRealData] Erro ao carregar dados reais do banco:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadRealTenantData()
  }, [loadRealTenantData])

  // Métricas Calculadas sobre os Dados Reais
  const realMetrics = {
    totalSKUs: realParts.length,
    totalStockValue: realParts.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    activePublicCount: realParts.filter(p => p.status === 'active').length,
    privateErpCount: realParts.filter(p => p.status !== 'active').length,
    monthlySalesVolume: realTransactions
      .filter(t => t.payment_status === 'completed' || t.payment_status === 'paid')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    activeWorkOrdersCount: realWorkOrders.filter(w => w.status !== 'pronto').length,
    completedWorkOrdersCount: realWorkOrders.filter(w => w.status === 'pronto').length
  }

  return {
    loading,
    tenantInfo,
    realParts,
    realWorkOrders,
    realTransactions,
    realNfeInvoices,
    realMetrics,
    refetch: loadRealTenantData
  }
}
