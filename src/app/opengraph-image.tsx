import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SYNTALYS Chat AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #03366d 0%, #021d3d 50%, #010e1f 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative icon top-right */}
        <img
          src={iconSrc}
          width={180}
          height={180}
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            opacity: 0.04,
          }}
        />

        {/* Main logo */}
        <img
          src={logoSrc}
          width={400}
          height={92}
          style={{ marginBottom: 32 }}
        />

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 3,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}
        >
          Assistant intelligent — IA sur mesure
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "1px",
          }}
        >
          ai.syntalys.ch
        </div>
      </div>
    ),
    { ...size }
  );
}
