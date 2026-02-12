"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { getMessagesRemaining } from "@/lib/translations";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  draft?: string;
  onDraftConsumed?: () => void;
}

export function ChatInput({ draft, onDraftConsumed }: ChatInputProps) {
  const { user } = useAuth();
  const { sendMessage, isStreaming, anonUsageCount, anonDailyLimit } =
    useChat();
  const { t, locale } = useI18n();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAnon = !user;
  const limitReached = isAnon && anonUsageCount >= anonDailyLimit;
  const remaining = isAnon ? anonDailyLimit - anonUsageCount : Infinity;

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Fill textarea when a suggestion is clicked
  useEffect(() => {
    if (draft) {
      setValue(draft);
      onDraftConsumed?.();
      // Focus the textarea
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [draft, onDraftConsumed]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || limitReached) return;

    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:py-4">
        <div
          className={cn(
            "relative flex items-end rounded-2xl border border-border bg-card shadow-sm transition-colors",
            "focus-within:border-syntalys-blue/40 focus-within:shadow-md",
            limitReached && "opacity-60"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              limitReached
                ? (t("inputLimitReached") as string)
                : (t("inputPlaceholder") as string)
            }
            disabled={limitReached}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
              "outline-none",
              "max-h-[200px]"
            )}
            aria-label="Mensaje"
          />

          <div className="flex items-center gap-1 px-2 pb-2">
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isStreaming || limitReached}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                value.trim() && !isStreaming && !limitReached
                  ? "bg-syntalys-blue text-white hover:bg-syntalys-blue-light shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              aria-label={isStreaming ? (t("stop") as string) : (t("sendMessage") as string)}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Usage indicator for anonymous users */}
        {isAnon && (
          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-[11px] text-muted-foreground">
              {limitReached ? (
                <span className="text-destructive">
                  {t("limitReachedShort")}
                </span>
              ) : (
                getMessagesRemaining(locale, remaining)
              )}
            </p>
            <div className="flex gap-0.5">
              {Array.from({ length: anonDailyLimit }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 w-1 rounded-full transition-colors",
                    i < anonUsageCount
                      ? "bg-syntalys-blue"
                      : "bg-border"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          {t("aiDisclaimer")}
        </p>
      </div>
    </div>
  );
}
