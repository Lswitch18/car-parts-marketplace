-- Security: Implement Row Level Security for profiles
-- Prevent non-admins from changing sensitive profile fields

-- 1. Create a function to validate profile updates
CREATE OR REPLACE FUNCTION public.check_profile_sensitive_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is an admin or the service role, allow any changes.
  IF (auth.role() = 'authenticated') THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
      RETURN NEW;
    END IF;

    -- For normal users, prevent them from changing these columns:
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role = OLD.role;
    END IF;
    
    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      NEW.is_verified = OLD.is_verified;
    END IF;
    
    IF NEW.store_verified IS DISTINCT FROM OLD.store_verified THEN
      NEW.store_verified = OLD.store_verified;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it already exists
DROP TRIGGER IF EXISTS tr_check_profile_sensitive_update ON public.profiles;

-- 3. Create the trigger
CREATE TRIGGER tr_check_profile_sensitive_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_sensitive_update();

-- 4. Fix "Allow all on profiles" policy which is too permissive
-- We will replace it with specific policies for SELECT and UPDATE
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;

-- Anyone can read basic profile info
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

-- Users can only update their own profile (and the trigger will protect sensitive columns)
CREATE POLICY "Enable update for users based on id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Enable insert for users based on id" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
