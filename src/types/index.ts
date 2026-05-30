export interface User {
  id: string
  email: string
  full_name?: string
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  cep?: string
  avatar_url?: string
  bio?: string
  rating?: number
  total_sales?: number
  is_verified?: boolean
  role?: string
  created_at: string
  updated_at?: string
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  brand: string
  model: string
  year_start: number
  year_end: number
  category: string
  condition: 'new' | 'used' | 'refurbished'
  images: string[]
  status: 'active' | 'sold' | 'draft'
  views: number
  created_at: string
  seller?: User
}

export interface Brand {
  id: string
  name: string
  logo?: string
  models: CarModel[]
}

export interface CarModel {
  id: string
  brand_id: string
  name: string
  years: number[]
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  product_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
}

export interface AuctionItem {
  id: string
  title: string
  description: string
  starting_bid: number
  current_bid: number
  buy_now_price: number | null
  condition: string
  images: string[]
  auction_end: string
  bid_count: number
  time_remaining: number
  status: string
  winning_bid_id: string | null
  winner_id: string | null
  winner_notified: boolean
  brand?: { id: string; name: string; logo_url: string }
  category?: { id: string; name: string }
  seller?: { id: string; full_name: string; rating: number; avatar_url?: string; is_verified?: boolean }
}

export interface AuctionBid {
  id: string
  part_id: string
  bidder_id: string
  amount: number
  is_winning: boolean
  created_at: string
  bidder?: { id: string; full_name: string; avatar_url?: string }
}

export interface AuctionDetail extends AuctionItem {
  bids: AuctionBid[]
  seller: NonNullable<AuctionItem['seller']>
  brand: NonNullable<AuctionItem['brand']>
  category: NonNullable<AuctionItem['category']>
}

export interface Transaction {
  id: string
  part_id: string
  auction_id: string | null
  buyer_id: string
  seller_id: string
  amount: number
  commission_rate: number
  commission_amount: number
  platform_fee: number
  seller_net: number
  payment_status: 'pending' | 'escrow' | 'paid' | 'failed' | 'refunded' | 'disputed'
  fulfillment_status: 'pending' | 'shipped' | 'delivered'
  stripe_payment_id: string | null
  shipping_name?: string
  shipping_email?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  created_at: string
  updated_at: string
  part?: { id: string; title: string; images: string[]; price: number }
  buyer?: { id: string; full_name: string; email: string }
  seller?: { id: string; full_name: string; email: string }
}

export interface CreateAuctionInput {
  title: string
  description?: string
  starting_bid: number
  buy_now_price?: number
  auction_duration_hours: number
  condition?: string
  brand_id?: string
  category_id?: string
  model_id?: string
  images?: string[]
}

export interface PlaceBidInput {
  auction_id: string
  amount: number
}