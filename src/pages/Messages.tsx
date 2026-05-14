import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { MessageCircle, Send, User, ArrowRight, DollarSign, Check, ShoppingCart } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: string
  proposed_price?: number
  price_confirmed?: boolean
  created_at: string
  product_id?: string
  parts?: {
    id: string
    title: string
    price: number
    images: string[]
  }
}

interface Conversation {
  oder_id: string
  oder: {
    id: string
    full_name: string
    avatar_url: string
  }
  part: {
    id: string
    title: string
    price: number
    images: string[]
  }
  lastMessage: Message
  unreadCount: number
}

export default function Messages() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('product') || null
  )
  const [newMessage, setNewMessage] = useState('')
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [proposedPrice, setProposedPrice] = useState('')

  const { data: conversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*, parts(id, title, price, images)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      const grouped = messages?.reduce((acc: Record<string, Conversation>, msg: any) => {
        const key = `${msg.sender_id === user.id ? msg.receiver_id : msg.sender_id}-${msg.product_id || 'no-product'}`
        if (!acc[key]) {
          acc[key] = {
            oder_id: msg.sender_id === user.id ? msg.receiver_id : msg.sender_id,
            oder: { id: msg.sender_id === user.id ? msg.receiver_id : msg.sender_id, full_name: '', avatar_url: '' },
            part: msg.parts || { id: '', title: 'Sem produto', price: 0, images: [] },
            lastMessage: msg,
            unreadCount: 0
          }
        }
        if (msg.receiver_id === user.id && !msg.read_at) {
          acc[key].unreadCount++
        }
        return acc
      }, {})

      const convs = await Promise.all(
        Object.values(grouped || {}).map(async (conv: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', conv.oder_id)
            .single()
          return { ...conv, oder: profile || conv.oder }
        })
      )

      return convs
    },
    enabled: !!user
  })

  const { data: selectedMessages } = useQuery({
    queryKey: ['messages', user?.id, selectedConversation],
    queryFn: async () => {
      if (!user || !selectedConversation) return []
      
      const { data } = await supabase
        .from('messages')
        .select('*, parts(id, title, price, images)')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      return data || []
    },
    enabled: !!user && !!selectedConversation
  })

  const sendMessage = useMutation({
    mutationFn: async (params: { type?: string; price?: number } = {}) => {
      const { type = 'text', price } = params
      if (!user || !selectedConversation || (!newMessage.trim() && type !== 'price_proposal')) return

      const conversation = conversations?.find(c => c.oder_id === selectedConversation)
      
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        product_id: conversation?.part.id || null,
        content: type === 'price_proposal' ? `Proposta de preço: ¥${Number(price).toLocaleString('ja-JP')}` : newMessage.trim(),
        message_type: type,
        proposed_price: type === 'price_proposal' ? price : null,
        price_confirmed: type === 'price_proposal' ? false : null
      })
    },
    onSuccess: () => {
      setNewMessage('')
      setShowPriceModal(false)
      setProposedPrice('')
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, selectedConversation] })
    }
  })

  const confirmPrice = async (messageId: string, price: number) => {
    if (!user || !selectedConversation) return

    await supabase
      .from('messages')
      .update({ price_confirmed: true })
      .eq('id', messageId)

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedConversation,
      product_id: conversations?.find(c => c.oder_id === selectedConversation)?.part.id,
      content: `✅ Preço de ¥${price.toLocaleString('ja-JP')} confirmado! Pronto para prosseguir para o pagamento.`,
      message_type: 'price_confirmed'
    })

    queryClient.invalidateQueries({ queryKey: ['messages', user?.id, selectedConversation] })
  }

  const getCurrentPrice = () => {
    const priceProposal = selectedMessages?.find(m => 
      m.message_type === 'price_proposal' && !m.price_confirmed
    )
    if (priceProposal?.price_confirmed) {
      return priceProposal.proposed_price
    }
    return null
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const currentPrice = getCurrentPrice()
  const conversation = conversations?.find(c => c.oder_id === selectedConversation)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Mensagens
          </h1>
        </div>

        <div className="card overflow-hidden" style={{ height: '600px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="border-r border-border overflow-y-auto">
              {conversations && conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <button
                    key={`${conv.oder_id}-${conv.part.id}`}
                    onClick={() => setSelectedConversation(conv.oder_id)}
                    className={`w-full p-4 text-left hover:bg-surface transition-colors ${
                      selectedConversation === conv.oder_id ? 'bg-surface' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                        {conv.part.images?.[0] ? (
                          <img src={conv.part.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <MessageCircle className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{conv.oder.full_name || 'Usuário'}</p>
                        <p className="text-gray-400 text-sm truncate">{conv.part.title || 'Sem produto'}</p>
                        <p className="text-daig-blue text-xs">¥ {conv.part.price?.toLocaleString('ja-JP') || 0}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-daig-blue text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma conversa</p>
                </div>
              )}
            </div>

            <div className="col-span-2 flex flex-col">
              {selectedConversation && selectedMessages ? (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setSelectedConversation(null)} className="md:hidden">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-daig-blue to-daig-cyan flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium">
                          {selectedMessages[0]?.sender_id === user.id 
                            ? selectedMessages.find(m => m.sender_id !== user.id)?.parts?.title || 'Usuário'
                            : selectedMessages[0]?.parts?.title || 'Usuário'}
                        </span>
                        <p className="text-gray-400 text-xs">
                          ¥ {conversation?.part.price.toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    {conversation && (
                      <Link
                        to={`/product/${conversation.part.id}`}
                        className="text-daig-blue text-sm hover:underline"
                      >
                        Ver anúncio
                      </Link>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedMessages.map((msg: any) => {
                      const isMe = msg.sender_id === user.id
                      const isPriceProposal = msg.message_type === 'price_proposal'
                      const isPriceConfirmed = msg.message_type === 'price_confirmed' || msg.price_confirmed

                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                            isMe 
                              ? 'bg-daig-blue text-white rounded-br-md' 
                              : isPriceProposal
                                ? 'bg-surface border-2 border-green-500 text-white rounded-bl-md'
                                : 'bg-surface text-white rounded-bl-md'
                          }`}>
                            {isPriceProposal && (
                              <div className="flex items-center space-x-2 mb-2">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                <span className="font-bold text-green-400">
                                  ¥ {msg.proposed_price?.toLocaleString('ja-JP')}
                                </span>
                              </div>
                            )}
                            <p>{msg.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs opacity-60">
                                {new Date(msg.created_at).toLocaleString('pt-BR')}
                              </p>
                              
                                     {isPriceProposal && !isPriceConfirmed && !isMe && (
                                <button
                                  onClick={() => confirmPrice(msg.id, msg.proposed_price!)}
                                  className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 ml-2"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirmar</span>
                                </button>
                              )}
                              {isPriceConfirmed && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                  ✓ Confirmado
                                </span>
                              )}
                              {msg.transaction_id && (
                                <a
                                  href={`/admin/logistix`}
                                  className="text-daig-cyan text-xs ml-2 hover:underline"
                                >
                                  🚚 Rastrear
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {currentPrice && (
                    <div className="p-4 bg-green-500/20 border-t border-green-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-green-400 font-medium">
                            Preço confirmado: ¥{currentPrice.toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <Link
                          to={`/checkout/${conversation?.part.id}?price=${currentPrice}`}
                          className="bg-daig-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Ir para Pagamento</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {!currentPrice && (
                    <div className="p-4 border-t border-border">
                      <div className="flex space-x-2 mb-2">
                        <button
                          onClick={() => setShowPriceModal(true)}
                          className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 hover:bg-green-500/30"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Fazer Proposta</span>
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          sendMessage.mutate({})
                        }}
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-white"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sendMessage.isPending}
                          className="bg-daig-blue hover:bg-daig-blue/80 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Selecione uma conversa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPriceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Fazer Proposta de Preço
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Preço original: ¥ {conversation?.part.price.toLocaleString('ja-JP')}
            </p>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              placeholder="Digite seu preço proposto"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowPriceModal(false); setProposedPrice('') }}
                className="flex-1 bg-surface text-white py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => sendMessage.mutate({ type: 'price_proposal', price: Number(proposedPrice) })}
                disabled={!proposedPrice || Number(proposedPrice) <= 0}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Enviar Proposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}