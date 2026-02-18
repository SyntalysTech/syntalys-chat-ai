import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import { getModelByIdOrDefault, getSystemPrompt } from "@/lib/models";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-server";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(100000),
    })
  ),
  model: z.string(),
  threadId: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  anonId: z.string().optional(),
  userName: z.string().max(100).optional(),
  imageUrls: z.array(z.string()).max(5).optional(),
  memoryContext: z.string().max(5000).optional(),
  imageGen: z.boolean().optional(),
});

function getClientIP(req: NextRequest): string {
  // Vercel / reverse proxy headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { messages, model: modelId, isAnonymous, userName, imageUrls, memoryContext, imageGen } = parsed.data;

    // Rate limiting for anonymous users — by IP, not client-generated anonId
    if (isAnonymous) {
      const clientIP = getClientIP(req);
      const rateLimitKey = `ip:${clientIP}`;
      const { allowed, remaining } = checkRateLimit(rateLimitKey);

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Limite diario alcanzado. Registrate para continuar sin limites.",
            remaining: 0,
          },
          { status: 429 }
        );
      }

      incrementUsage(rateLimitKey);
    }

    const modelConfig = getModelByIdOrDefault(modelId);

    // For anonymous users, force base model
    if (isAnonymous && modelConfig.requiresAuth) {
      return NextResponse.json(
        { error: "Modelo no disponible. Registrate para acceder." },
        { status: 403 }
      );
    }

    // ── Image generation (triggered by imageGen flag from input dropdown) ──
    if (imageGen) {
      // Require authentication for image generation
      if (isAnonymous) {
        return NextResponse.json(
          { error: "Registrate para generar imagenes." },
          { status: 403 }
        );
      }

      const lastUserMessage = messages[messages.length - 1]?.content || "";

      // If reference images are provided, use GPT-4o Vision to create an enhanced prompt
      let dallePrompt = lastUserMessage;
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
                { type: "input_text", text: lastUserMessage },
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
          { error: "No se pudo generar la imagen" },
          { status: 500 }
        );
      }

      // Persist to Supabase Storage so the URL doesn't expire
      let permanentUrl = dalleUrl;
      try {
        const supabase = await createServerSupabaseClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const imageRes = await fetch(dalleUrl);
          if (imageRes.ok) {
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
            const serviceClient = await createServiceRoleClient();
            const fileId = crypto.randomUUID();
            const storagePath = `${authUser.id}/${fileId}.png`;

            const { error: uploadError } = await serviceClient.storage
              .from("generated-images")
              .upload(storagePath, imageBuffer, {
                contentType: "image/png",
                upsert: false,
              });

            if (!uploadError) {
              const { data: publicUrlData } = serviceClient.storage
                .from("generated-images")
                .getPublicUrl(storagePath);
              permanentUrl = publicUrlData.publicUrl;

              // Save to gallery
              await serviceClient.from("generated_images").insert({
                user_id: authUser.id,
                prompt: lastUserMessage,
                revised_prompt: revisedPrompt,
                image_url: permanentUrl,
                storage_path: storagePath,
                size: "1024x1024",
              });
            }
          }
        }
      } catch (persistErr) {
        // Non-blocking: if persistence fails, still return the DALL-E URL
        console.error("Image persist error:", (persistErr as Error).message);
      }

      const markdown = `![${lastUserMessage.slice(0, 100)}](${permanentUrl})`;
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(markdown));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // ── Text chat models ──
    let systemPrompt = getSystemPrompt(modelConfig.id);
    if (userName) {
      systemPrompt += `\n\nThe user's name is "${userName}". Address them by their name naturally when appropriate (greetings, personalized responses), but don't force it into every sentence.`;
    }
    if (memoryContext) {
      systemPrompt += memoryContext;
    }

    // Build input messages for the Responses API
    const inputMessages: ResponseInputItem[] = [];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLastUser = i === messages.length - 1 && m.role === "user" && imageUrls?.length;

      if (isLastUser) {
        // Build multimodal content for the last user message with images
        inputMessages.push({
          role: "user",
          content: [
            { type: "input_text", text: m.content },
            ...imageUrls!.map((url) => ({
              type: "input_image" as const,
              image_url: url,
              detail: "auto" as const,
            })),
          ],
        });
      } else {
        inputMessages.push({
          role: m.role as "user" | "assistant",
          content: m.content,
        } as ResponseInputItem);
      }
    }

    const stream = await openai.responses.create({
      model: modelConfig.openaiModel,
      instructions: systemPrompt,
      input: inputMessages,
      tools: [{ type: "web_search_preview", search_context_size: "medium" }],
      stream: true,
      temperature: modelConfig.temperature ?? 0.6,
      max_output_tokens: 16384,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", (error as Error).message);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
