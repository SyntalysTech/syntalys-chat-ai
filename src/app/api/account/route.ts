import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use service role to delete user data and account
    const admin = await createServiceRoleClient();

    // Delete messages, threads, profile, then auth user
    const { data: threads } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", user.id);

    if (threads && threads.length > 0) {
      const ids = threads.map((t: { id: string }) => t.id);
      await admin.from("chat_messages").delete().in("thread_id", ids);
      await admin.from("chat_threads").delete().eq("user_id", user.id);
    }

    // Delete user memories (must happen before deleting auth user)
    await admin.from("user_memories").delete().eq("user_id", user.id);

    await admin.from("profiles").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
