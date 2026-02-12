import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.syntalys.ch"),
  title: "SYNTALYS Chat AI",
  description:
    "Assistant intelligent SYNTALYS - Intelligence artificielle sur mesure",
  icons: {
    icon: "/logos/logo-favicon.png",
    apple: "/logos/logo-favicon.png",
  },
  openGraph: {
    title: "SYNTALYS Chat AI",
    description:
      "Assistant intelligent SYNTALYS - Intelligence artificielle sur mesure",
    type: "website",
    siteName: "SYNTALYS Chat AI",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
