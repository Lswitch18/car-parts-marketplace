import { supabase } from '@/modules/shared/lib/supabase';

/**
 * Public API for Admin operations related to Parts Catalog.
 * Enforces Modular Monolith pattern boundaries.
 */
export async function getPartsPulse() {
  try {
    const { count } = await supabase.from('parts').select('id', { count: 'exact', head: true });
    return {
      totalListings: count || 0,
      activeListings: count || 0 // Mocked active status for now
    };
  } catch (error) {
    console.error("Error fetching parts pulse:", error);
    return { totalListings: 0, activeListings: 0 };
  }
}
