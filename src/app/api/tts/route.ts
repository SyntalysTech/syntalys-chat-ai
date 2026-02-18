import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Max characters to send to TTS (keeps cost and latency in check) */
const MAX_CHARS = 4096;

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Truncate to keep costs and latency reasonable
    const truncated = text.slice(0, MAX_CHARS);

    // Pick voice based on language — nova (female) is natural-sounding and multilingual
    // alloy is neutral, shimmer is warm. All handle FR/ES/EN well.
    const voice = "nova";

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: truncated,
      response_format: "mp3",
      speed: 1.0,
    });

    // Stream the audio back as mp3
    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
