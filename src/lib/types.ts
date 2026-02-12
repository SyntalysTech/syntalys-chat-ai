export interface ChatThread {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  created_at: string;
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
