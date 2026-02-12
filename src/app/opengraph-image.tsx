import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SYNTALYS Chat AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #03366d 0%, #021d3d 50%, #010e1f 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "rgba(255,255,255,0.1)",
            marginBottom: 32,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 19h20L12 2z" fill="white" opacity="0.9" />
            <circle cx="12" cy="14" r="3" fill="#03366d" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-1px",
            marginBottom: 12,
          }}
        >
          SYNTALYS Chat AI
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            fontWeight: 400,
          }}
        >
          Assistant intelligent — Intelligence artificielle sur mesure
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          ai.syntalys.ch
        </div>
      </div>
    ),
    { ...size }
  );
}
