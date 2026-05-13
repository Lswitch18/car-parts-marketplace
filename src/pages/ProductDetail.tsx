import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Heart, Share2, MessageCircle, Eye, Shield, Truck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useFavoriteStore } from '../stores/favoriteStore'
import { Product } from '../types'
import PurchaseFlow from '../components/PurchaseFlow'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const [selectedImage, setSelectedImage] = useState(0)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name), profiles(full_name)')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-daig-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Produto não encontrado</p>
          <button onClick={() => navigate('/catalog')} className="text-daig-blue">
            Voltar ao catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-4">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <span className="text-6xl">🔧</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === i ? 'border-daig-blue' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-daig-blue font-medium mb-2">
                  {product.brand} {product.model} • {product.year_start} - {product.year_end}
                </p>
                <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
                <div className="flex items-center space-x-4 text-gray-400 text-sm">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{product.views || 0} visualizações</span>
                  </span>
                  <span className="badge">{product.condition}</span>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className="p-3 rounded-full bg-surface hover:bg-daig-blue transition-colors"
              >
                <Heart
                  className={`w-6 h-6 ${isFavorite(product.id) ? 'fill-daig-blue text-daig-blue' : 'text-white'}`}
                />
              </button>
            </div>

            <p className="text-4xl font-bold text-daig-blue mb-6">
              ¥ {product.price.toLocaleString('ja-JP')}
            </p>

<div className="flex gap-4 mb-8">
               {user?.id !== product.seller_id && (
                 <>
                   <Link
                     to={`/messages?product=${product.id}`}
                     className="flex-1 bg-daig-blue hover:bg-daig-blue/80 text-white py-3 rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
                   >
                     <MessageCircle className="w-5 h-5" />
                     <span>Enviar Mensagem</span>
                   </Link>
<Link
                      to={`/checkout/${product.id}`}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
                    >
                      <span className="w-5 h-5">💳</span>
                      <span>Comprar Agora</span>
                    </Link>
                 </>
               )}
               <button className="flex items-center justify-center space-x-2 bg-surface border border-border px-4 py-3 rounded-lg text-white hover:border-daig-blue">
                 <Share2 className="w-5 h-5" />
               </button>
             </div>

            <div className="card p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-daig-blue to-daig-cyan flex items-center justify-center">
                  <span className="text-white font-bold">
                    {product.profiles?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{product.profiles?.name || 'Vendedor'}</p>
                  <p className="text-gray-400 text-sm">Vendedor</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-400">
                <Shield className="w-5 h-5 text-daig-cyan" />
                <span>Compra segura com garantia</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Truck className="w-5 h-5 text-daig-cyan" />
                <span>Envio para todo Japão</span>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4">Descrição</h3>
              <p className="text-gray-400 whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}