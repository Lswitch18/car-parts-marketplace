import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { TenantCoreService, TenantInventoryStats } from '@/modules/shared/services/TenantCoreService'
import { Product } from '@/modules/shared/types'

/**
 * 🛠️ USE TENANT CORE (Clean Custom React Hook)
 * 
 * Centraliza o estado reativo, React Query caching, atualizações otimistas e toasts
 * para qualquer componente da aplicação que precise interagir com o SaaS do Tenant.
 */
export function useTenantCore() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'published' | 'private'>('all')
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }, [])

  // Query das Peças do Estoque Privado do Tenant
  const { data: parts = [], isLoading, refetch } = useQuery({
    queryKey: ['tenant-parts', user?.id],
    queryFn: () => TenantCoreService.getTenantInventory(user?.id || ''),
    enabled: !!user?.id,
  })

  // Mutation para Alternar a Chave de 1-Clique no Marketplace
  const togglePublishMutation = useMutation({
    mutationFn: async ({ partId, currentStatus }: { partId: string; currentStatus: boolean }) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return TenantCoreService.toggleOneClickPublish(user.id, partId, currentStatus)
    },
    onSuccess: (nextStatus) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-parts', user?.id] })
      showToast(
        nextStatus 
          ? 'Peça publicada no Marketplace DAIG com 1 clique!' 
          : 'Peça removida do Marketplace (mantida no estoque privado).'
      )
    },
    onError: (err: Error) => {
      showToast(`Erro ao alterar visibilidade: ${err.message}`)
    }
  })

  // Mutation para Operações em Lote
  const batchPublishMutation = useMutation({
    mutationFn: async (targetStatus: 'available' | 'draft') => {
      if (!user?.id || !selectedPartIds.length) return 0
      return TenantCoreService.batchSetMarketplacePublish(user.id, selectedPartIds, targetStatus)
    },
    onSuccess: (count, targetStatus) => {
      if (!count) return
      queryClient.invalidateQueries({ queryKey: ['tenant-parts', user?.id] })
      setSelectedPartIds([])
      showToast(`${count} peça(s) ${targetStatus === 'available' ? 'publicadas no Marketplace' : 'revertidas para gestão privada'}.`)
    },
    onError: (err: Error) => {
      showToast(`Erro ao processar lote: ${err.message}`)
    }
  })

  // Filtragem Reativa do Estoque
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesSearch = 
        part.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.oem_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchQuery.toLowerCase())

      const isPublished = part.status === 'available'
      if (filterCategory === 'published') return matchesSearch && isPublished
      if (filterCategory === 'private') return matchesSearch && !isPublished
      return matchesSearch
    })
  }, [parts, searchQuery, filterCategory])

  // Estatísticas Calculadas
  const stats: TenantInventoryStats = useMemo(() => {
    return TenantCoreService.calculateTenantStats(parts)
  }, [parts])

  // Manipuladores de Seleção de Peças
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedPartIds(filteredParts.map(p => p.id))
    } else {
      setSelectedPartIds([])
    }
  }, [filteredParts])

  const handleSelectOne = useCallback((id: string) => {
    setSelectedPartIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }, [])

  return {
    user,
    parts,
    filteredParts,
    stats,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    selectedPartIds,
    handleSelectAll,
    handleSelectOne,
    toastMessage,
    togglePublish: (partId: string, currentStatus: boolean) => 
      togglePublishMutation.mutate({ partId, currentStatus }),
    batchPublish: (targetStatus: 'available' | 'draft') => 
      batchPublishMutation.mutate(targetStatus),
    isToggling: togglePublishMutation.isPending,
    isBatching: batchPublishMutation.isPending,
  }
}
