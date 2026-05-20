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