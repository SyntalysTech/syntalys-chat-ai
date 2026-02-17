import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import { getModelByIdOrDefault, getSystemPrompt } from "@/lib/models";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
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

    const { messages, model: modelId, isAnonymous, userName, imageUrls } = parsed.data;

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

    let systemPrompt = getSystemPrompt(modelConfig.id);
    if (userName) {
      systemPrompt += `\n\nThe user's name is "${userName}". Address them by their name naturally when appropriate (greetings, personalized responses), but don't force it into every sentence.`;
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
      temperature: 0.7,
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
