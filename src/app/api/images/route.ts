import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-server";

// GET: Fetch user's generated images (paginated)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const { data: images, error, count } = await supabase
      .from("generated_images")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch images error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: images || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error("Images API error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an image by ID
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

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID required" },
        { status: 400 }
      );
    }

    // Fetch the image record first (to get storage_path)
    const { data: image, error: fetchError } = await supabase
      .from("generated_images")
      .select("storage_path")
      .eq("id", imageId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const serviceClient = await createServiceRoleClient();
    await serviceClient.storage
      .from("generated-images")
      .remove([image.storage_path]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", imageId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete image error:", deleteError.message);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
