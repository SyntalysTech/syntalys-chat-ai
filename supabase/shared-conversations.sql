-- SYNTALYS Chat AI - Shared Conversations
-- Run this in Supabase SQL Editor

-- ============================================
-- SHARED CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  title TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'synta-1.0',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for shared_conversations
ALTER TABLE shared_conversations ENABLE ROW LEVEL SECURITY;

-- Anyone can read shared conversations (public links)
CREATE POLICY "Anyone can view shared conversations"
  ON shared_conversations FOR SELECT
  USING (true);

-- Authenticated users can create shares
CREATE POLICY "Authenticated users can insert shares"
  ON shared_conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Service role can also insert (for anonymous shares via API)
-- This is handled by the service role client bypassing RLS

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_conversations_thread_id ON shared_conversations(thread_id);
