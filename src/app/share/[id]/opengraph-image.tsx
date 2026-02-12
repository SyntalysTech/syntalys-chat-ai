import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createServiceRoleClient } from "@/lib/supabase-server";

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

  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;

  const [logoData, iconData] = await Promise.all([
    readFile(join(process.cwd(), "public/logos/logo-horizontal-white.png")),
    readFile(join(process.cwd(), "public/logos/logo-icono-solo-white.png")),
  ]);

  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

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
          position: "relative",
        }}
      >
        {/* Subtle decorative icon */}
        <img
          src={iconSrc}
          width={240}
          height={240}
          style={{
            position: "absolute",
            bottom: -40,
            right: -30,
            opacity: 0.04,
          }}
        />

        {/* Top bar with real logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <img
            src={logoSrc}
            width={200}
            height={46}
          />
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
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5">
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
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
            ai.syntalys.ch
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
