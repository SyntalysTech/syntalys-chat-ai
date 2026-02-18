import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

const MAX_MEMORIES = 50;

const saveSchema = z.object({
  memories: z.array(
    z.object({
      content: z.string().min(1).max(500),
      category: z.enum(["preference", "fact", "instruction", "context", "general"]),
      source: z.enum(["user_explicit", "ai_inferred"]),
    })
  ).min(1).max(10),
});

const deleteSchema = z.object({
  memoryId: z.string().uuid().optional(),
  clearAll: z.boolean().optional(),
});

// GET — Load all memories for the authenticated user
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ memories: [] });
    }

    const { data, error } = await supabase
      .from("user_memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_MEMORIES);

    if (error) {
      console.error("Memory fetch error:", error.message);
      return NextResponse.json({ memories: [] });
    }

    return NextResponse.json({ memories: data || [] });
  } catch (error) {
    console.error("Memory GET error:", (error as Error).message);
    return NextResponse.json({ memories: [] });
  }
}

// POST — Save new memories
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Check current count
    const { count } = await supabase
      .from("user_memories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const currentCount = count || 0;
    const remaining = MAX_MEMORIES - currentCount;

    if (remaining <= 0) {
      // Delete oldest memories to make room
      const { data: oldest } = await supabase
        .from("user_memories")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(parsed.data.memories.length);

      if (oldest?.length) {
        await supabase
          .from("user_memories")
          .delete()
          .in("id", oldest.map((m) => m.id));
      }
    }

    // Fetch existing memories to deduplicate
    const { data: existing } = await supabase
      .from("user_memories")
      .select("content")
      .eq("user_id", user.id);

    const existingContents = new Set(
      (existing || []).map((m) => m.content.toLowerCase().trim())
    );

    const newMemories = parsed.data.memories
      .filter((m) => !existingContents.has(m.content.toLowerCase().trim()))
      .map((m) => ({
        user_id: user.id,
        content: m.content,
        category: m.category,
        source: m.source,
      }));

    if (newMemories.length === 0) {
      return NextResponse.json({ saved: 0 });
    }

    const { error } = await supabase
      .from("user_memories")
      .insert(newMemories);

    if (error) {
      console.error("Memory save error:", error.message);
      return NextResponse.json(
        { error: "Failed to save memories" },
        { status: 500 }
      );
    }

    return NextResponse.json({ saved: newMemories.length });
  } catch (error) {
    console.error("Memory POST error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Remove a specific memory or clear all
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (parsed.data.clearAll) {
      // Bulk delete all memories for this user
      await supabase
        .from("user_memories")
        .delete()
        .eq("user_id", user.id);
    } else if (parsed.data.memoryId) {
      // Delete a single memory
      await supabase
        .from("user_memories")
        .delete()
        .eq("id", parsed.data.memoryId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Memory DELETE error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
