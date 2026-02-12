"use client";

import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { ModelSelector } from "./model-selector";
import { Menu, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  const { currentThread } = useChat();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-3 py-2 sm:px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors lg:hidden"
          aria-label={t("menu") as string}
        >
          <Menu className="h-5 w-5" />
        </button>
        <ModelSelector />
      </div>

      <div className="flex items-center gap-1">
        {currentThread && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={t("share") as string}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
