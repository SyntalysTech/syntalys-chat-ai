-- SYNTALYS Chat AI - Add parent_id for conversation branching
-- Run this in Supabase SQL Editor

-- Add parent_id column to chat_messages (nullable for backward compatibility)
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL;

-- Index for fast child lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent_id ON chat_messages(parent_id);
