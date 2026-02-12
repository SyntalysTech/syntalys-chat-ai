import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { title, model, messages } = await req.json();

    if (!title || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Filter out system messages and only keep role + content
    const cleanMessages = messages
      .filter((m: { role: string }) => m.role !== "system")
      .map((m: { role: string; content: string; model?: string }) => ({
        role: m.role,
        content: m.content,
        model: m.model || null,
      }));

    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from("shared_conversations")
      .insert({
        thread_id: crypto.randomUUID(),
        title,
        model: model || "synta-1.0",
        messages: cleanMessages,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Share error:", error);
      return NextResponse.json({ error: "Failed to share" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
