"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { Sidebar } from "./sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { AuthModal } from "@/components/auth/auth-modal";
import { SettingsModal } from "@/components/settings/settings-modal";
import { ExploreModal } from "@/components/pages/explore-modal";
import { DocumentationModal } from "@/components/pages/documentation-modal";
import { SupportModal } from "@/components/pages/support-modal";
import { LegalModal } from "@/components/pages/legal-modal";
import { HumanizerModal } from "@/components/pages/humanizer-modal";

export function AppShell() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { loading } = useAuth();
  const { loadThreads } = useChat();
  const { t } = useI18n();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [documentationOpen, setDocumentationOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [humanizerOpen, setHumanizerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safety timeout: if auth takes more than 5s, render anyway
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      console.warn("Auth loading timeout - proceeding without session");
      setAuthTimedOut(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const isReady = !loading || authTimedOut;

  useEffect(() => {
    if (isReady) {
      loadThreads();
    }
  }, [isReady, loadThreads]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleThemeChange = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  if (!mounted || !isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background pt-safe">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-syntalys-blue border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background pt-safe">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenExplore={() => setExploreOpen(true)}
        onOpenDocumentation={() => setDocumentationOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenLegal={() => setLegalOpen(true)}
        onOpenHumanizer={() => setHumanizerOpen(true)}
        isDark={isDark}
      />

      <ChatArea
        onMenuClick={() => setMobileOpen(true)}
        isDark={isDark}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        isDark={isDark}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme || "system"}
        onThemeChange={handleThemeChange}
      />

      <ExploreModal
        open={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onOpenAuth={() => {
          setExploreOpen(false);
          setAuthOpen(true);
        }}
      />

      <DocumentationModal
        open={documentationOpen}
        onClose={() => setDocumentationOpen(false)}
      />

      <SupportModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        onOpenDocumentation={() => {
          setSupportOpen(false);
          setDocumentationOpen(true);
        }}
      />

      <LegalModal
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
      />

      <HumanizerModal
        open={humanizerOpen}
        onClose={() => setHumanizerOpen(false)}
      />
    </div>
  );
}
