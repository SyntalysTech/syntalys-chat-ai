-- SYNTALYS Chat AI - Generated Images Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- GENERATED IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  revised_prompt TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size TEXT DEFAULT '1024x1024',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for generated_images
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON generated_images FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_images_user ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created ON generated_images(created_at DESC);

-- ============================================
-- SUPABASE STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view generated images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

CREATE POLICY "Users can delete own generated images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'generated-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
