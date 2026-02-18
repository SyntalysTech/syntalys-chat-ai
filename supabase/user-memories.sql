-- SYNTALYS Chat AI - User Memories Table
-- Run this in Supabase SQL Editor

-- ============================================
-- USER MEMORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('preference', 'fact', 'instruction', 'context', 'general')),
  source TEXT NOT NULL DEFAULT 'ai_inferred'
    CHECK (source IN ('user_explicit', 'ai_inferred')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for user_memories
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
  ON user_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON user_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON user_memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON user_memories FOR DELETE
  USING (auth.uid() = user_id);

-- Service role also needs access (for API route with service client)
-- No additional policy needed — service role bypasses RLS

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_category ON user_memories(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_memories_updated ON user_memories(updated_at DESC);

-- Limit: max 50 memories per user (enforced at application level)
