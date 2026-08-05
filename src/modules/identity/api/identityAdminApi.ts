import { supabase } from '@/modules/shared/lib/supabase';

/**
 * Public API for Admin operations related to Identity & Users.
 * Enforces Modular Monolith pattern boundaries.
 */
export async function getIdentityPulse() {
  try {
    const totalRes = await supabase.from('admin_profiles').select('id', { count: 'exact' });
    const adminRes = await supabase.from('admin_profiles').select('id', { count: 'exact' }).eq('role', 'admin');
    const sellerRes = await supabase.from('admin_profiles').select('id', { count: 'exact' }).eq('role', 'seller');
    const pendingStoresRes = await supabase.from('admin_profiles').select('id', { count: 'exact' }).eq('role', 'seller');

    const totalCount = totalRes.count || totalRes.data?.length || 0;
    const adminCount = adminRes.count || adminRes.data?.length || 0;
    const sellerCount = sellerRes.count || sellerRes.data?.length || 0;
    const buyerCount = totalCount - adminCount - sellerCount;

    return {
      totalUsers: totalCount,
      roles: {
        admin: adminCount,
        seller: sellerCount,
        buyer: buyerCount >= 0 ? buyerCount : 0
      },
      pendingStoreValidations: pendingStoresRes.count || 0
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
