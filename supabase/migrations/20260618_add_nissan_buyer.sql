-- Seed comprador.nissan@gmail.com
DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users if it doesn't exist yet
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'comprador.nissan@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'comprador.nissan@gmail.com',
      crypt('nissan2026', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Comprador Nissan"}'::jsonb,
      false,
      'authenticated',
      'authenticated'
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      is_verified,
      email_verified
    ) VALUES (
      v_user_id,
      'comprador.nissan@gmail.com',
      'Comprador Nissan',
      'user',
      true,
      true
    );
  END IF;
END $$;
