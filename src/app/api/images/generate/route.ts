import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  imageUrls: z.array(z.string()).max(5).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { prompt, imageUrls } = parsed.data;

    // If reference images are provided, use GPT-4o Vision to enhance the prompt
    let dallePrompt = prompt;
    if (imageUrls?.length) {
      const visionResponse = await openai.responses.create({
        model: "gpt-4o",
        instructions: `You are an expert prompt engineer for DALL-E 3 image generation. The user will provide a text description and one or more reference images.

CRITICAL RULES for analyzing reference images:
1. Describe the subject with EXTREME precision: exact body position, pose, facial expression, facial features (nose shape, eye shape, ear shape and position, mouth/muzzle), fur/hair color patterns with exact colors, markings, proportions, body size, limbs position
2. Describe accessories precisely: collar color and style, leash, clothing, etc.
3. Preserve the EXACT color palette from the reference: use specific color names (e.g., "warm caramel brown and cream white with tan patches around the eyes")
4. Apply ONLY the artistic style the user requested (cartoon, watercolor, pixel art, etc.)
5. NEVER EVER include color palettes, color swatches, color bars, color wheels, or any design/UI elements
6. NEVER add borders, frames, watermarks, text, or labels to the image
7. The output must be ONLY the subject/scene — clean, complete, with nothing extra
8. If the user wants a cartoon/stylized version, keep ALL physical characteristics identical — just change the art style
9. Background should be simple and complementary unless the user specifies otherwise

Output ONLY the DALL-E 3 prompt text, nothing else. Max 950 characters.`,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              ...imageUrls.map((url) => ({
                type: "input_image" as const,
                image_url: url,
                detail: "high" as const,
              })),
            ],
          },
        ],
      });
      const enhanced = visionResponse.output_text;
      if (enhanced) dallePrompt = enhanced;
    }

    // Generate image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const dalleUrl = imageResponse.data?.[0]?.url;
    const revisedPrompt = imageResponse.data?.[0]?.revised_prompt || null;

    if (!dalleUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Download the image from DALL-E (URLs expire after ~1h)
    const imageRes = await fetch(dalleUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to download generated image" },
        { status: 500 }
      );
    }
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Upload to Supabase Storage
    const serviceClient = await createServiceRoleClient();
    const fileId = crypto.randomUUID();
    const storagePath = `${user.id}/${fileId}.png`;

    const { error: uploadError } = await serviceClient.storage
      .from("generated-images")
      .upload(storagePath, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to save image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = serviceClient.storage
      .from("generated-images")
      .getPublicUrl(storagePath);

    const permanentUrl = publicUrlData.publicUrl;

    // Save metadata to database
    const { data: imageRecord, error: dbError } = await serviceClient
      .from("generated_images")
      .insert({
        user_id: user.id,
        prompt,
        revised_prompt: revisedPrompt,
        image_url: permanentUrl,
        storage_path: storagePath,
        size: "1024x1024",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError.message);
      // Try to cleanup the uploaded file
      await serviceClient.storage
        .from("generated-images")
        .remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save image record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: imageRecord.id,
      image_url: permanentUrl,
      prompt,
      revised_prompt: revisedPrompt,
      storage_path: storagePath,
      size: "1024x1024",
      created_at: imageRecord.created_at,
    });
  } catch (error) {
    console.error("Image generation error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
