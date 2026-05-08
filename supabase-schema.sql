-- JAPANCAR PARTS - Supabase Schema
-- Execute this in your Supabase SQL Editor

-- =============================================
-- TABLES
-- =============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  cep TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  country TEXT DEFAULT 'Japan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Car Models
CREATE TABLE IF NOT EXISTS public.car_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  years TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts
CREATE TABLE IF NOT EXISTS public.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles NOT NULL,
  brand_id UUID REFERENCES public.brands,
  model_id UUID REFERENCES public.car_models,
  category_id UUID REFERENCES public.categories NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair')) DEFAULT 'good',
  price DECIMAL(10,2),
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'ended', 'cancelled')),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles NOT NULL,
  part_id UUID REFERENCES public.parts NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, part_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles NOT NULL,
  receiver_id UUID REFERENCES public.profiles NOT NULL,
  part_id UUID REFERENCES public.parts,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES public.parts NOT NULL,
  buyer_id UUID REFERENCES public.profiles NOT NULL,
  seller_id UUID REFERENCES public.profiles NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions NOT NULL,
  reviewer_id UUID REFERENCES public.profiles NOT NULL,
  reviewed_id UUID REFERENCES public.profiles NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Brands policies
CREATE POLICY "Brands are viewable by everyone" ON public.brands FOR SELECT USING (true);

-- Car Models policies
CREATE POLICY "Car models are viewable by everyone" ON public.car_models FOR SELECT USING (true);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Parts policies
CREATE POLICY "Parts are viewable by everyone" ON public.parts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create parts" ON public.parts FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own parts" ON public.parts FOR UPDATE USING (auth.uid() = seller_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA: BRANDS
-- =============================================

INSERT INTO public.brands (id, name, slug, logo_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nissan', 'nissan', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nissan_2020_logo.svg'),
  ('22222222-2222-2222-2222-222222222222', 'Toyota', 'toyota', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_crest.svg'),
  ('33333333-3333-3333-3333-333333333333', 'Honda', 'honda', 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Honda_logo.svg'),
  ('44444444-4444-4444-4444-444444444444', 'Mazda', 'mazda', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Mazda_logo.svg'),
  ('55555555-5555-5555-5555-555555555555', 'Subaru', 'subaru', 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Subaru_logo.svg'),
  ('66666666-6666-6666-6666-666666666666', 'Mitsubishi', 'mitsubishi', 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Mitsubishi_logo.svg'),
  ('77777777-7777-7777-7777-777777777777', 'Lexus', 'lexus', 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Lexus_logo.svg'),
  ('88888888-8888-8888-8888-888888888888', 'Acura', 'acura', 'https://upload.wikimedia.org/wikipedia/commons/4/45/Acura_logo.svg'),
  ('99999999-9999-9999-9999-999999999999', 'Infiniti', 'infiniti', 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Infiniti_logo.svg')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SEED DATA: CATEGORIES
-- =============================================

INSERT INTO public.categories (name, slug, icon) VALUES
  ('Body Kits', 'body-kits', 'Car'),
  ('Wings & Spoilers', 'wings-spoilers', 'Wind'),
  ('Wheels & Rims', 'wheels-rims', 'Circle'),
  ('Brakes', 'brakes', 'Disc'),
  ('Suspension', 'suspension', 'ArrowDownUp'),
  ('Engine', 'engine', 'Cog'),
  ('Exhaust', 'exhaust', 'Flame'),
  ('Interior', 'interior', 'Armchair'),
  ('Lighting', 'lighting', 'Lightbulb'),
  ('Aero', 'aero', 'Waves'),
  ('Turbo & Boost', 'turbo-boost', 'Zap'),
  ('Cooling', 'cooling', 'Thermometer')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SEED DATA: CAR MODELS (Sample)
-- =============================================

-- Nissan Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('11111111-1111-1111-1111-111111111111', 'GT-R R35', 'gt-r-r35', '2007-Present'),
  ('11111111-1111-1111-1111-111111111111', 'Skyline R34', 'skyline-r34', '1999-2002'),
  ('11111111-1111-1111-1111-111111111111', 'Skyline R33', 'skyline-r33', '1993-1998'),
  ('11111111-1111-1111-1111-111111111111', 'Skyline R32', 'skyline-r32', '1989-1994'),
  ('11111111-1111-1111-1111-111111111111', 'Silvia S15', 'silvia-s15', '1999-2002'),
  ('11111111-1111-1111-1111-111111111111', 'Silvia S14', 'silvia-s14', '1993-1998'),
  ('11111111-1111-1111-1111-111111111111', '180SX', '180sx', '1989-1998'),
  ('11111111-1111-1111-1111-111111111111', 'Fairlady Z Z33', 'fairlady-z-z33', '2002-2008'),
  ('11111111-1111-1111-1111-111111111111', 'Fairlady Z Z34', 'fairlady-z-z34', '2008-2020'),
  ('11111111-1111-1111-1111-111111111111', '350Z', '350z', '2002-2008'),
  ('11111111-1111-1111-1111-111111111111', '370Z', '370z', '2008-2020')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Toyota Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Supra A80', 'supra-a80', '1993-2002'),
  ('22222222-2222-2222-2222-222222222222', 'Supra GR', 'supra-gr', '2019-Present'),
  ('22222222-2222-2222-2222-222222222222', 'AE86 Sprinter Trueno', 'ae86', '1983-1987'),
  ('22222222-2222-2222-2222-222222222222', 'GT86 / FR-S', 'gt86', '2012-2020'),
  ('22222222-2222-2222-2222-222222222222', 'GR86', 'gr86', '2021-Present'),
  ('22222222-2222-2222-2222-222222222222', 'MR2 SW20', 'mr2-sw20', '1989-1999'),
  ('22222222-2222-2222-2222-222222222222', 'Altezza', 'altezza', '1998-2005'),
  ('22222222-2222-2222-2222-222222222222', 'Celica GT-Four', 'celica-gt-four', '1986-1999'),
  ('22222222-2222-2222-2222-222222222222', 'Chaser', 'chaser', '1996-2001'),
  ('22222222-2222-2222-2222-222222222222', 'Mark II', 'mark2', '1968-2004')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Honda Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('33333333-3333-3333-3333-333333333333', 'NSX NA1', 'nsx-na1', '1990-2005'),
  ('33333333-3333-3333-3333-333333333333', 'NSX NC1', 'nsx-nc1', '2016-2022'),
  ('33333333-3333-3333-3333-333333333333', 'S2000 AP1', 's2000-ap1', '1999-2003'),
  ('33333333-3333-3333-3333-333333333333', 'S2000 AP2', 's2000-ap2', '2004-2009'),
  ('33333333-3333-3333-3333-333333333333', 'Civic Type R EK9', 'civic-type-r-ek9', '1997-2000'),
  ('33333333-3333-3333-3333-333333333333', 'Civic Type R EP3', 'civic-type-r-ep3', '2001-2005'),
  ('33333333-3333-3333-3333-333333333333', 'Integra Type R', 'integra-type-r', '1995-2001'),
  ('33333333-3333-3333-3333-333333333333', 'Prelude', 'prelude', '1978-2001'),
  ('33333333-3333-3333-3333-333333333333', 'S660', 's660', '2015-2021')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Mazda Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('44444444-4444-4444-4444-444444444444', 'RX-7 FC3S', 'rx7-fc3s', '1986-1992'),
  ('44444444-4444-4444-4444-444444444444', 'RX-7 FD3S', 'rx7-fd3s', '1991-1998'),
  ('44444444-4444-4444-4444-444444444444', 'RX-8', 'rx8', '2003-2012'),
  ('44444444-4444-4444-4444-444444444444', 'MX-5 NA', 'mx5-na', '1989-1997'),
  ('44444444-4444-4444-4444-444444444444', 'MX-5 NB', 'mx5-nb', '1998-2005'),
  ('44444444-4444-4444-4444-444444444444', 'MX-5 NC', 'mx5-nc', '2005-2015'),
  ('44444444-4444-4444-4444-444444444444', 'MX-5 ND', 'mx5-nd', '2015-Present'),
  ('44444444-4444-4444-4444-444444444444', 'Mazdaspeed3', 'mpspeed3', '2006-2013')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Subaru Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('55555555-5555-5555-5555-555555555555', 'WRX STI GC8', 'wrx-sti-gc8', '1994-1996'),
  ('55555555-5555-5555-5555-555555555555', 'WRX STI GDB', 'wrx-sti-gdb', '2000-2007'),
  ('55555555-5555-5555-5555-555555555555', 'WRX STI VAB', 'wrx-sti-vab', '2014-2021'),
  ('55555555-5555-5555-5555-555555555555', 'BRZ ZC6', 'brz-zc6', '2012-2020'),
  ('55555555-5555-5555-5555-555555555555', 'BRZ Z10', 'brz-z10', '2021-Present'),
  ('55555555-5555-5555-5555-555555555555', 'Impreza 22B', 'impreza-22b', '1998')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Mitsubishi Models
INSERT INTO public.car_models (brand_id, name, slug, years) VALUES
  ('66666666-6666-6666-6666-666666666666', 'Lancer Evo I-V', 'lancer-evo-1-5', '1992-1996'),
  ('66666666-6666-6666-6666-666666666666', 'Lancer Evo VI', 'lancer-evo-6', '1999-2001'),
  ('66666666-6666-6666-6666-666666666666', 'Lancer Evo VII-IX', 'lancer-evo-7-9', '2001-2007'),
  ('66666666-6666-6666-6666-666666666666', 'Lancer Evo X', 'lancer-evo-x', '2007-2016'),
  ('66666666-6666-6666-6666-666666666666', 'FTO', 'fto', '1994-2000'),
  ('66666666-6666-6666-6666-666666666666', '3000GT / GTO', '3000gt', '1990-2001'),
  ('66666666-6666-6666-6666-666666666666', 'Eclipse', 'eclipse', '1989-1999')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Enable Realtime for parts
ALTER PUBLICATION supabase_realtime ADD TABLE public.parts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
