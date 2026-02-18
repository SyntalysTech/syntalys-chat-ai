export interface ChatThread {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  /** base64 data URL for images (only in-session, not persisted) */
  dataUrl?: string;
  /** Extracted text from documents (only in-session) */
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  created_at: string;
  attachments?: Pick<FileAttachment, "name" | "type" | "size">[];
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  default_model: string;
  theme: "light" | "dark" | "system";
  language: string;
  created_at: string;
}

export interface StreamMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserMemory {
  id: string;
  user_id: string | null;
  content: string;
  category: "preference" | "fact" | "instruction" | "context" | "general";
  source: "user_explicit" | "ai_inferred";
  created_at: string;
  updated_at: string;
}

export interface GeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  revised_prompt: string | null;
  image_url: string;
  storage_path: string;
  size: string;
  created_at: string;
}
