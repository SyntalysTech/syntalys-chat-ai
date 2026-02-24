-- Chat folders for organizing conversations
CREATE TABLE IF NOT EXISTS chat_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Folder',
  color TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_folders_user_id ON chat_folders(user_id);

-- Add folder_id column to chat_threads
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES chat_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_chat_threads_folder_id ON chat_threads(folder_id);

-- RLS policies for chat_folders
ALTER TABLE chat_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON chat_folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders" ON chat_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON chat_folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON chat_folders
  FOR DELETE USING (auth.uid() = user_id);
