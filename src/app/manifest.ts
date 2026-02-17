import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SYNTALYS Chat AI",
    short_name: "SYNTALYS AI",
    description: "Assistant intelligent SYNTALYS - Intelligence artificielle sur mesure",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#03366d",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
