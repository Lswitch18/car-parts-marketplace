import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return null
  return profile
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Admin functions
export const isAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
    
  if (error) return false
  return data?.role === 'admin'
}

export const getAdminStats = async () => {
  try {
    const [usersResult, gmvResult, revenueResult, transactionsResult] = await Promise.all([
      supabase.rpc('get_total_users'),
      supabase.rpc('get_total_gmv'),
      supabase.rpc('get_total_revenue'),
      supabase
        .from('transactions')
        .select('id, payment_status', { count: 'exact' })
    ])
    
    const totalUsers = usersResult.data || 0
    const totalGMV = parseFloat(gmvResult.data?.toString() || '0')
    const totalRevenue = parseFloat(revenueResult.data?.toString() || '0')
    const totalTransactions = transactionsResult.count || 0
    const completedTransactions = transactionsResult.data?.filter(t => t.payment_status === 'paid').length || 0
    
    return {
      totalUsers,
      totalGMV,
      totalRevenue,
      totalTransactions,
      completedTransactions
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      totalGMV: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      completedTransactions: 0
    }
  }
}

export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, rating, is_verified, created_at, last_login_at')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

export const toggleUserVerification = async (userId: string, isVerified: boolean) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !isVerified })
      .eq('id', userId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling user verification:', error)
    return false
  }
}

export const getTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        payment_status,
        fulfillment_status,
        created_at,
        profiles!transactions_buyer_id_fkey(email, full_name),
        profiles!transactions_seller_id_fkey(email, full_name),
        parts!transactions_part_id_fkey(title)
      `)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export const updateTransactionStatus = async (
  transactionId: string, 
  status: string, 
  type: 'payment' | 'fulfillment'
) => {
  try {
    const updateData = type === 'payment' 
      ? { payment_status: status } 
      : { fulfillment_status: status }
      
    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating transaction status:', error)
    return false
  }
}