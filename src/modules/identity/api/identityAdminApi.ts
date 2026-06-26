import { supabase } from '@/modules/shared/lib/supabase';

/**
 * Public API for Admin operations related to Identity & Users.
 * Enforces Modular Monolith pattern boundaries.
 */
export async function getIdentityPulse() {
  try {
    const [totalUsers, admins, sellers, pendingStores] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_store', true).eq('store_verified', false)
    ]);
    
    const totalCount = totalUsers.count || 0;
    const adminCount = admins.count || 0;
    const sellerCount = sellers.count || 0;
    const buyerCount = totalCount - adminCount - sellerCount;

    return {
      totalUsers: totalCount,
      roles: {
        admin: adminCount,
        seller: sellerCount,
        buyer: buyerCount >= 0 ? buyerCount : 0
      },
      pendingStoreValidations: pendingStores.count || 0
    };
  } catch (error) {
    console.error("Error fetching identity pulse:", error);
    return {
      totalUsers: 0,
      roles: { admin: 0, seller: 0, buyer: 0 },
      pendingStoreValidations: 0
    };
  }
}
