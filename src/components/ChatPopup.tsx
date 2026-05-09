import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { MessageCircle, X, Send, User, Minimize2, Maximize2, Package, DollarSign, Check, ShoppingCart, ArrowRight } from 'lucide-react'

interface ChatPopupProps {
  initialProductId?: string
  initialSellerId?: string
  onClose?: () => void
}

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

export default function ChatPopup({ initialProductId, initialSellerId, onClose }: ChatPopupProps) {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [proposedPrice, setProposedPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialProductId && initialSellerId) {
      openConversationWithProduct(initialSellerId, initialProductId)
    }
  }, [initialProductId, initialSellerId])

  useEffect(() => {
    if (user) {
      fetchConversations()
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          fetchConversations()
          if (selectedConversation) fetchMessages(selectedConversation)
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [user, selectedConversation])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchConversations = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('messages')
      .select(`*, parts(id, title, price, images)`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (data) {
      const grouped = data.reduce((acc: Record<string, Conversation>, msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        
        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            oder_id: otherUserId,
            oder: { id: otherUserId, full_name: '', avatar_url: '' },
            part: msg.parts || { id: '', title: '', price: 0, images: [] },
            lastMessage: msg,
            unreadCount: msg.receiver_id === user.id && !msg.read_at ? 1 : 0
          }
        } else {
          if (msg.receiver_id === user.id && !msg.read_at) {
            acc[otherUserId].unreadCount++
          }
        }
        return acc
      }, {})

      const convs = await Promise.all(
        Object.values(grouped).map(async (conv: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', conv.oder_id)
            .single()
          
          return { ...conv, oder: profile || conv.oder }
        })
      )
      
      setConversations(convs)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, parts(id, title, price, images)')
      .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${user?.id})`)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', user?.id)
        .eq('sender_id', conversationId)
    }
  }

  const openConversationWithProduct = async (sellerId: string, productId: string) => {
    setSelectedConversation(sellerId)
    const { data: product } = await supabase
      .from('parts')
      .select('id, title, price, images')
      .eq('id', productId)
      .single()
    
    if (product) {
      const convExists = conversations.find(c => c.oder_id === sellerId && c.part.id === productId)
      if (!convExists) {
        setConversations(prev => [{
          oder_id: sellerId,
          oder: { id: sellerId, full_name: 'Vendedor', avatar_url: '' },
          part: product,
          lastMessage: { id: '', sender_id: '', receiver_id: '', content: '', message_type: 'text', created_at: '' },
          unreadCount: 0
        }, ...prev])
      }
    }
    fetchMessages(sellerId)
  }

  const sendMessage = async (type: string = 'text', price?: number) => {
    if (!user || !newMessage.trim() || !selectedConversation) return

    const conversation = conversations.find(c => c.oder_id === selectedConversation)
    
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedConversation,
      product_id: conversation?.part.id || null,
      content: type === 'price_proposal' ? `Proposta de preço: ¥${Number(price).toLocaleString('ja-JP')}` : newMessage.trim(),
      message_type: type,
      proposed_price: type === 'price_proposal' ? price : null,
      price_confirmed: type === 'price_proposal' ? false : null
    })

    if (!error) {
      setNewMessage('')
      setShowPriceModal(false)
      setProposedPrice('')
      fetchMessages(selectedConversation)
    }
  }

  const confirmPrice = async (messageId: string, price: number) => {
    if (!user || !selectedConversation) return

    const { error } = await supabase
      .from('messages')
      .update({ price_confirmed: true })
      .eq('id', messageId)

    if (!error) {
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        product_id: conversations.find(c => c.oder_id === selectedConversation)?.part.id,
        content: `✅ Preço de ¥${price.toLocaleString('ja-JP')} confirmado! Pronto para prosseguir para o pagamento.`,
        message_type: 'price_confirmed'
      })

      fetchMessages(selectedConversation)
    }
  }

  const getCurrentPrice = () => {
    const priceProposal = messages.find(m => 
      m.message_type === 'price_proposal' && m.price_confirmed !== true
    )
    if (priceProposal?.price_confirmed) {
      return priceProposal.proposed_price
    }
    return null
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'agora'
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString('pt-BR')
  }

  const currentPrice = getCurrentPrice()
  const conversation = conversations.find(c => c.oder_id === selectedConversation)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-[#ff3d00] text-white p-4 rounded-full shadow-lg hover:bg-[#dd2c00] transition-colors z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-0 right-4 w-96 bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    }`}>
      <div 
        className="flex items-center justify-between p-4 border-b border-[#2a2a2a] cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3d00] to-[#00e5ff] flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Mensagens</h3>
            <p className="text-gray-400 text-xs">{conversations.length} conversas</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={(e) => { e.stopPropagation(); onClose?.() }}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}>
            {isMinimized ? <Maximize2 className="w-5 h-5 text-gray-400" /> : <Minimize2 className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto">
            {!selectedConversation ? (
              <div className="p-4 space-y-2">
                {conversations.length > 0 ? conversations.map((conv) => (
                  <button
                    key={`${conv.oder_id}-${conv.part.id}`}
                    onClick={() => { setSelectedConversation(conv.oder_id); fetchMessages(conv.oder_id) }}
                    className="w-full p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#2a2a2a] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {conv.part.images?.[0] ? (
                          <img src={conv.part.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{conv.oder.full_name || 'Usuário'}</p>
                        <p className="text-gray-400 text-sm truncate">{conv.part.title || 'Produto'}</p>
                        <p className="text-[#ff3d00] text-xs">¥ {conv.part.price?.toLocaleString('ja-JP')}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#ff3d00] text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma conversa ainda</p>
                    <p className="text-gray-500 text-sm">Entre em contato com um vendedor!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-[#2a2a2a] flex items-center space-x-2">
                  <button onClick={() => setSelectedConversation(null)} className="text-gray-400 hover:text-white">
                    ←
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff3d00] to-[#00e5ff] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white text-sm">
                      {conversation?.oder.full_name || 'Usuário'}
                    </span>
                    {conversation && (
                      <p className="text-gray-500 text-xs">{conversation.part.title}</p>
                    )}
                  </div>
                  {conversation && (
                    <span className="text-[#ff3d00] text-sm font-bold">
                      ¥ {conversation.part.price.toLocaleString('ja-JP')}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    const isPriceProposal = msg.message_type === 'price_proposal'
                    const isPriceConfirmed = msg.message_type === 'price_confirmed' || msg.price_confirmed

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                          isMe 
                            ? 'bg-[#ff3d00] text-white rounded-br-md' 
                            : 'bg-[#2a2a2a] text-white rounded-bl-md'
                        } ${isPriceProposal ? 'border-2 border-green-500' : ''}`}>
                          {isPriceProposal && (
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="w-5 h-5 text-green-400" />
                              <span className="font-bold text-green-400">
                                ¥ {msg.proposed_price?.toLocaleString('ja-JP')}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm">{msg.content}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                            
                            {isPriceProposal && !isPriceConfirmed && !isMe && (
                              <button
                                onClick={() => confirmPrice(msg.id, msg.proposed_price!)}
                                className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Confirmar</span>
                              </button>
                            )}
                            
                            {isPriceConfirmed && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                ✓ Confirmado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {currentPrice && (
                  <div className="p-3 bg-green-500/20 border-t border-green-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-green-400 font-medium">
                          Preço confirmado: ¥{currentPrice.toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <a
                        href={`/checkout/${conversation?.part.id}?price=${currentPrice}`}
                        className="bg-[#ff3d00] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-[#dd2c00]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Pagar</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedConversation && !currentPrice && (
            <div className="p-3 border-t border-[#2a2a2a]">
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() => setShowPriceModal(true)}
                  className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 hover:bg-green-500/30"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Fazer Proposta</span>
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-full px-4 py-2 text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-[#ff3d00] p-2 rounded-full text-white disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {showPriceModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-sm">
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
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowPriceModal(false); setProposedPrice('') }}
                className="flex-1 bg-[#2a2a2a] text-white py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => sendMessage('price_proposal', Number(proposedPrice))}
                disabled={!proposedPrice || Number(proposedPrice) <= 0}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}