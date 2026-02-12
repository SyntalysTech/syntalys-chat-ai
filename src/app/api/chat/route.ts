import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from "openai/resources/chat/completions";
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

    const { messages, model: modelId, isAnonymous, anonId, userName, imageUrls } = parsed.data;

    // Rate limiting for anonymous users
    if (isAnonymous && anonId) {
      const rateLimitKey = `anon:${anonId}`;
      const { allowed } = checkRateLimit(rateLimitKey);

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

    // Build OpenAI messages, with vision support for the last user message
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLastUser = i === messages.length - 1 && m.role === "user" && imageUrls?.length;

      if (isLastUser) {
        // Build multimodal content for the last user message
        const parts: ChatCompletionContentPart[] = [
          { type: "text", text: m.content },
        ];
        for (const url of imageUrls!) {
          parts.push({
            type: "image_url",
            image_url: { url, detail: "auto" },
          });
        }
        openaiMessages.push({ role: "user", content: parts });
      } else {
        openaiMessages.push({
          role: m.role as "user" | "assistant",
          content: m.content,
        });
      }
    }

    const stream = await openai.chat.completions.create({
      model: modelConfig.openaiModel,
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
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
