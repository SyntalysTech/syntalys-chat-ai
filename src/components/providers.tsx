"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import { ChatProvider } from "@/lib/chat-context";
import { I18nProvider } from "@/lib/i18n-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
