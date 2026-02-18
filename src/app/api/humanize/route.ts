import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, incrementUsage } from "@/lib/rate-limit";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  text: z.string().min(1).max(50000),
  isAnonymous: z.boolean().optional(),
});

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

const HUMANIZER_PROMPT = `You are an elite text humanizer. Your ONLY job is to rewrite text so it sounds like a real, native human wrote it — not an AI.

## Rules

1. **Language**: DETECT the language of the input and write in that EXACT language. If Spanish, write like a native Spanish speaker. If French, write like a native French speaker. If English, write like a native English speaker.

2. **Meaning**: Keep the EXACT same meaning, information, and intent. Do NOT add or remove key information.

3. **Remove AI patterns**:
   - Overly structured/formulaic sentences
   - Repetitive transition words ("Moreover", "Furthermore", "Additionally", "En primer lugar", "De plus")
   - Generic filler phrases ("It's important to note that...", "Es importante destacar que...")
   - Perfect parallel sentence structures
   - Bullet points that all start the same way
   - Overly formal or stiff tone

4. **Add human touches**:
   - Varied sentence length (mix short punchy sentences with longer ones)
   - Natural contractions and colloquialisms appropriate to the register
   - Occasional informal connectors ("Look,", "Thing is,", "Mira,", "Bon,")
   - Real-person rhythm and flow — the way someone would actually write this
   - Slight personality — not robotic, not trying too hard

5. **Match the register**:
   - Professional email → stays professional but warm and human, not corporate robot
   - Social media post → casual, engaging, authentic voice
   - Academic text → maintains formality but with natural academic writing flow
   - Casual message → conversational, relaxed, genuine

6. **DO NOT**:
   - Add emojis unless the original had them
   - Add content that wasn't in the original
   - Add explanations, labels, or meta-commentary
   - Start with "Here's the humanized version" or anything like that
   - Change the format dramatically (if it's a list, keep it a list)

Output ONLY the humanized text. Nothing else.`;

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

    const { text, isAnonymous } = parsed.data;

    // Rate limiting for anonymous users
    if (isAnonymous) {
      const clientIP = getClientIP(req);
      const rateLimitKey = `ip:${clientIP}`;
      const { allowed } = checkRateLimit(rateLimitKey);

      if (!allowed) {
        return NextResponse.json(
          { error: "Limite diario alcanzado. Registrate para continuar sin limites." },
          { status: 429 }
        );
      }

      incrementUsage(rateLimitKey);
    }

    const stream = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions: HUMANIZER_PROMPT,
      input: [{ role: "user", content: text }],
      stream: true,
      temperature: 0.8,
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
    console.error("Humanize API error:", (error as Error).message);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
