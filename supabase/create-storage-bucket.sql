-- =============================================
-- Criar bucket de armazenamento para imagens
-- Rode no SQL Editor: https://supabase.com/dashboard/project/clqubcryhbrjlupkgeva/sql/new
-- =============================================

-- Cria o bucket público para imagens de peças
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'parts-images',
  'parts-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Permite upload para qualquer usuário autenticado
CREATE POLICY "Upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'parts-images'
    AND auth.role() = 'authenticated'
  );

-- Permite leitura pública
CREATE POLICY "View images" ON storage.objects
  FOR SELECT USING (bucket_id = 'parts-images');

-- Permite usuário deletar suas próprias imagens
CREATE POLICY "Delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'parts-images'
    AND owner = auth.uid()
  );
