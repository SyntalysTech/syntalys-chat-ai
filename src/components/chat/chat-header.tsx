"use client";

import { useState, useCallback } from "react";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { ModelSelector } from "./model-selector";
import { Menu, Share2, Check, Loader2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import type { ChatMessage } from "@/lib/types";

function formatAsMarkdown(title: string, msgs: ChatMessage[]): string {
  const lines: string[] = [`# ${title}`, ""];
  for (const msg of msgs) {
    if (msg.role === "system") continue;
    const role = msg.role === "user" ? "**User**" : "**SYNTALYS AI**";
    lines.push(`### ${role}`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
}

function formatAsText(title: string, msgs: ChatMessage[]): string {
  const lines: string[] = [title, "=".repeat(title.length), ""];
  for (const msg of msgs) {
    if (msg.role === "system") continue;
    const role = msg.role === "user" ? "User" : "SYNTALYS AI";
    lines.push(`[${role}]`);
    lines.push(msg.content);
    lines.push("");
  }
  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeName(title: string): string {
  return title.replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "chat";
}

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  const { currentThread, messages } = useChat();
  const { t } = useI18n();
  const [shareState, setShareState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleShare = useCallback(async () => {
    if (!currentThread || messages.length === 0 || shareState === "loading") return;

    setShareState("loading");

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentThread.title,
          model: currentThread.model,
          messages: messages.filter((m) => m.role !== "system"),
        }),
      });

      if (!res.ok) throw new Error("Failed to share");

      const { id } = await res.json();
      const shareUrl = `${window.location.origin}/share/${id}`;

      // Try native share on mobile, fallback to clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title: currentThread.title,
            url: shareUrl,
          });
          setShareState("success");
          setTimeout(() => setShareState("idle"), 2000);
          return;
        } catch {
          // User cancelled — still copy to clipboard
        }
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareState("success");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }, [currentThread, messages, shareState]);

  const handleExportMd = useCallback(() => {
    if (!currentThread || messages.length === 0) return;
    const content = formatAsMarkdown(currentThread.title, messages);
    downloadFile(content, `${safeName(currentThread.title)}.md`, "text/markdown");
  }, [currentThread, messages]);

  const handleExportTxt = useCallback(() => {
    if (!currentThread || messages.length === 0) return;
    const content = formatAsText(currentThread.title, messages);
    downloadFile(content, `${safeName(currentThread.title)}.txt`, "text/plain");
  }, [currentThread, messages]);

  const getIcon = () => {
    switch (shareState) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (shareState) {
      case "success":
        return t("shareCopied") as string;
      case "error":
        return t("shareError") as string;
      default:
        return t("share") as string;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-1.5 sm:px-4 py-1 sm:py-2">
      <div className="flex items-center gap-0.5 sm:gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent active:bg-accent/80 transition-colors lg:hidden"
          aria-label={t("menu") as string}
        >
          <Menu className="h-5 w-5" />
        </button>
        <ModelSelector />
      </div>

      <div className="flex items-center gap-1">
        {currentThread && (
          <>
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label={t("exportChat") as string}
                  title={t("exportChat") as string}
                >
                  <Download className="h-4 w-4" />
                </Button>
              }
              align="right"
            >
              <DropdownItem onClick={handleExportMd}>
                {t("exportMarkdown")}
              </DropdownItem>
              <DropdownItem onClick={handleExportTxt}>
                {t("exportText")}
              </DropdownItem>
            </Dropdown>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label={t("share") as string}
              onClick={handleShare}
              disabled={shareState === "loading"}
              title={getTitle()}
            >
              {getIcon()}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
