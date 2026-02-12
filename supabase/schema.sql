-- SYNTALYS Chat AI - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  default_model TEXT DEFAULT 'synta-1.0',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NULL));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CHAT THREADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva conversacion',
  model TEXT DEFAULT 'synta-1.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for chat_threads
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads"
  ON chat_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON chat_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON chat_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON chat_threads FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_updated ON chat_threads(updated_at DESC);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- ============================================
-- USAGE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_id TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date),
  UNIQUE(anon_id, date)
);

-- RLS - usage_daily is managed by service role only
ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;

-- Only service role can access usage_daily (no public policies)

-- ============================================
-- HELPER FUNCTION: Update thread timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads SET updated_at = now() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_insert ON chat_messages;
CREATE TRIGGER on_message_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_timestamp();
