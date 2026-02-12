import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { SharedConversationView } from "./shared-view";
import type { Metadata } from "next";

interface SharedMessage {
  role: "user" | "assistant";
  content: string;
  model?: string | null;
}

interface SharedConversation {
  id: string;
  title: string;
  model: string;
  messages: SharedMessage[];
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServiceRoleClient();
  const { data } = await supabase
    .from("shared_conversations")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: data ? `${data.title} - SYNTALYS AI` : "SYNTALYS Chat AI",
    description: "Conversation partagée via SYNTALYS Chat AI",
  };
}

export default async function SharedPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from("shared_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const conversation = data as SharedConversation;

  return <SharedConversationView conversation={conversation} />;
}
