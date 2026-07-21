-- Migration: Secure RLS policies and add stripe_transfer_id column

-- 1. Add stripe_transfer_id and stripe_payment_id to transactions if missing
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_id text;


-- 2. Create the is_admin function to avoid policy recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all on parts" ON public.parts;
DROP POLICY IF EXISTS "Allow all on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all on brands" ON public.brands;
DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;

-- 4. Enable RLS explicitly on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 5. Define strict policies

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- parts
DROP POLICY IF EXISTS "parts_select" ON public.parts;
DROP POLICY IF EXISTS "parts_insert" ON public.parts;
DROP POLICY IF EXISTS "parts_update" ON public.parts;
DROP POLICY IF EXISTS "parts_delete" ON public.parts;

CREATE POLICY "parts_select" ON public.parts
  FOR SELECT USING (true);

CREATE POLICY "parts_insert" ON public.parts
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "parts_update" ON public.parts
  FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "parts_delete" ON public.parts
  FOR DELETE USING (auth.uid() = seller_id OR public.is_admin());

-- transactions
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update" ON public.transactions;

CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());

-- messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;

CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR public.is_admin());

-- brands
DROP POLICY IF EXISTS "brands_select" ON public.brands;
DROP POLICY IF EXISTS "brands_modify" ON public.brands;

CREATE POLICY "brands_select" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "brands_modify" ON public.brands
  FOR ALL USING (public.is_admin());

-- categories
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_modify" ON public.categories;

CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_modify" ON public.categories
  FOR ALL USING (public.is_admin());
