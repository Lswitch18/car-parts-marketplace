import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { MessageCircle, Send, User, ArrowLeft } from 'lucide-react'

export default function Messages() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('product') || null
  )
  const [newMessage, setNewMessage] = useState('')

  const { data: conversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*, parts(title, images), sender:sender_id(name, avatar_url), receiver:receiver_id(name, avatar_url)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      const grouped = messages?.reduce((acc: any, msg: any) => {
        const key = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!acc[key]) {
          acc[key] = {
            userId: key,
            user: msg.sender_id === user.id ? msg.receiver : msg.sender,
            product: msg.parts,
            lastMessage: msg,
            messages: []
          }
        }
        acc[key].messages.push(msg)
        return acc
      }, {})

      return Object.values(grouped || [])
    },
    enabled: !!user
  })

  const { data: selectedMessages } = useQuery({
    queryKey: ['messages', user?.id, selectedConversation],
    queryFn: async () => {
      if (!user || !selectedConversation) return []
      
      const { data } = await supabase
        .from('messages')
        .select('*, parts(*), sender:sender_id(name, avatar_url), receiver:receiver_id(name, avatar_url)')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      return data || []
    },
    enabled: !!user && !!selectedConversation
  })

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !selectedConversation || !newMessage.trim()) return

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        product_id: searchParams.get('product') || null,
        content: newMessage
      })
    },
    onSuccess: () => {
      setNewMessage('')
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, selectedConversation] })
    }
  })

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Mensagens
          </h1>
        </div>

        <div className="card overflow-hidden" style={{ height: '600px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="border-r border-[#2a2a2a] overflow-y-auto">
              {conversations && conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv.userId)}
                    className={`w-full p-4 text-left hover:bg-[#1a1a1a] transition-colors ${
                      selectedConversation === conv.userId ? 'bg-[#1a1a1a]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3d00] to-[#00e5ff] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {conv.user?.name || 'Usuário'}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {conv.lastMessage?.content}
                        </p>
                      </div>
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
                  <div className="p-4 border-b border-[#2a2a2a] flex items-center space-x-3">
                    <button onClick={() => setSelectedConversation(null)} className="md:hidden">
                      <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3d00] to-[#00e5ff] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {selectedMessages[0]?.sender?.name || selectedMessages[0]?.receiver?.name || 'Usuário'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_id === user.id
                              ? 'bg-[#ff3d00] text-white'
                              : 'bg-[#1a1a1a] text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(msg.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-[#2a2a2a]">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage.mutate()
                      }}
                      className="flex space-x-2"
                    >
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        className="bg-[#ff3d00] hover:bg-[#dd2c00] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
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
    </div>
  )
}