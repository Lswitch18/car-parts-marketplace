-- Cria 3 anúncios para tommsanje@gmail.com
-- Rode no SQL Editor: https://supabase.com/dashboard/project/clqubcryhbrjlupkgeva/sql/new

DO $$
DECLARE
  v_seller_id UUID;
BEGIN
  -- Busca o UUID do usuário pelo email
  SELECT id INTO v_seller_id FROM auth.users WHERE email = 'tommsanje@gmail.com';
  
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Usuário tommsanje@gmail.com não encontrado em auth.users';
  END IF;

  -- 1. Alternador
  INSERT INTO public.parts (seller_id, title, description, price, brand, model, category, condition, images, status, year_start, year_end)
  VALUES (
    v_seller_id,
    'Alternador Original JDM 12V 90A Nissan Skyline GT-R R34',
    'Alternador original Nissan Skyline GT-R R34 RB26DETT. 12V 90A. Testado e funcionando perfeitamente. Ideal para restauração ou upgrade. Acompanha conector e suporte original.',
    8500,
    'nissan', 'GT-R', 'electronics', 'used',
    ARRAY['https://images.unsplash.com/photo-1601369820466-67de64cedcc8?w=800'],
    'active', 1999, 2002
  );

  -- 2. Vela de Ignição (Spark Plug)
  INSERT INTO public.parts (seller_id, title, description, price, brand, model, category, condition, images, status, year_start, year_end)
  VALUES (
    v_seller_id,
    'Kit Vela de Ignição NGK Iridium IX 6 peças BKR6EIX-11',
    'Kit com 6 velas de ignição NGK Iridium IX BKR6EIX-11. Compatível com Toyota Supra MKIV 2JZ-GTE, Nissan Skyline GT-R RB26DETT, Subaru WRX STI. Eletrodo de irídio 0.6mm. Maior durabilidade e performance.',
    1800,
    'toyota', 'Supra', 'engine', 'new',
    ARRAY['https://images.unsplash.com/photo-1611016186353-9af58c069a7a?w=800'],
    'active', 2024, 2024
  );

  -- 3. Motor Completo
  INSERT INTO public.parts (seller_id, title, description, price, brand, model, category, condition, images, status, year_start, year_end)
  VALUES (
    v_seller_id,
    'Motor 2JZ-GTE VVTi Completo Toyota Supra MKIV JDM',
    'Motor 2JZ-GTE VVTi completo do Toyota Supra MKIV (JZA80). Bloco, cabeçote, pistões forjados, bielas, turbos gêmeos CT12A, coletor, injeção, ECU original JDM. 68.000km reais. Rodou no Japão. Pronto para instalar. Acompanha: alternador, compressor AR, mangueiras e chicote. Garantia de 90 dias.',
    185000,
    'toyota', 'Supra', 'engine', 'used',
    ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'],
    'active', 1997, 2002
  );

  RAISE NOTICE '3 anúncios criados para tommsanje@gmail.com!';
END $$;
