import { ImageResponse } from "next/og";
import { createServiceRoleClient } from "@/lib/supabase-server";

export const runtime = "edge";
export const alt = "SYNTALYS Chat AI - Conversation partagée";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = "Conversation partagée";
  let messageCount = 0;

  try {
    const supabase = await createServiceRoleClient();
    const { data } = await supabase
      .from("shared_conversations")
      .select("title, messages")
      .eq("id", id)
      .single();

    if (data) {
      title = data.title;
      messageCount = Array.isArray(data.messages) ? data.messages.length : 0;
    }
  } catch {
    // Use defaults
  }

  // Truncate title if too long
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #03366d 0%, #021d3d 50%, #010e1f 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 19h20L12 2z" fill="white" opacity="0.9" />
              <circle cx="12" cy="14" r="3" fill="#03366d" />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
            SYNTALYS Chat AI
          </div>
        </div>

        {/* Shared badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Conversation partagée
            {messageCount > 0 && ` · ${messageCount} messages`}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            flex: 1,
          }}
        >
          {displayTitle}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>
            ai.syntalys.ch
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
