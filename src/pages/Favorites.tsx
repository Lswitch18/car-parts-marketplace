import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useFavoriteStore } from '../stores/favoriteStore'
import { supabase } from '../lib/supabase'
import { Heart, Trash2, Package } from 'lucide-react'
import SafeImage from '../components/SafeImage'

export default function Favorites() {
  const { favorites, clearFavorites } = useFavoriteStore()

  const { data: products } = useQuery({
    queryKey: ['favorites', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return []
      
      const { data, error } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name)')
        .in('id', favorites)
        .eq('status', 'active')
      
      if (error) throw error
      return data
    },
    enabled: favorites.length > 0
  })

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-white mb-8">
            Meus Favoritos
          </h1>
          <div className="card p-12 text-center">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Você ainda não tem favoritos</p>
            <Link to="/catalog" className="text-[#ff3d00] hover:underline">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Meus Favoritos
          </h1>
          <button
            onClick={clearFavorites}
            className="flex items-center space-x-2 text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar tudo</span>
          </button>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden">
                  <SafeImage
                    src={product.images?.[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallback={<div className="w-full h-full flex items-center justify-center text-gray-600"><Package className="w-12 h-12" /></div>}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      useFavoriteStore.getState().toggleFavorite(product.id)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-[#0a0a0a]/80 hover:bg-red-500 transition-colors"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[#ff3d00] text-sm mb-1">
                    {product.brand} {product.model}
                  </p>
                  <h3 className="text-white font-semibold mb-2 truncate group-hover:text-[#ff3d00] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-[#ff3d00] font-bold text-xl">
                    ¥ {product.price.toLocaleString('ja-JP')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}