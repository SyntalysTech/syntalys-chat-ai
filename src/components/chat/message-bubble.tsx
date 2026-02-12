"use client";

import { useState, useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { useI18n } from "@/lib/i18n-context";
import {
  Check,
  Copy,
  RefreshCw,
  User,
  ChevronDown,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import Image from "next/image";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
  isDark: boolean;
}

/** Parse <reasoning>...</reasoning> tags from content */
function parseReasoning(content: string): {
  reasoning: string | null;
  answer: string;
  isReasoningComplete: boolean;
} {
  const openTag = "<reasoning>";
  const closeTag = "</reasoning>";
  const openIdx = content.indexOf(openTag);

  if (openIdx === -1) {
    return { reasoning: null, answer: content, isReasoningComplete: true };
  }

  const reasoningStart = openIdx + openTag.length;
  const closeIdx = content.indexOf(closeTag, reasoningStart);

  if (closeIdx === -1) {
    // Still streaming reasoning - no closing tag yet
    const reasoning = content.slice(reasoningStart).trim();
    return { reasoning, answer: "", isReasoningComplete: false };
  }

  const reasoning = content.slice(reasoningStart, closeIdx).trim();
  const answer = content.slice(closeIdx + closeTag.length).trim();
  return { reasoning, answer, isReasoningComplete: true };
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isLast,
  isStreaming,
  onRegenerate,
  isDark,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const { t } = useI18n();
  const isUser = message.role === "user";
  const isReasoning = message.model === "synta-1.0-reasoning";
  const isBeta = message.model === "synta-1.5-beta";

  const parsed = useMemo(() => {
    if (!isReasoning || isUser) return null;
    return parseReasoning(message.content);
  }, [message.content, isReasoning, isUser]);

  const handleCopy = async () => {
    // Copy only the final answer for reasoning messages
    const textToCopy =
      parsed && parsed.answer ? parsed.answer : message.content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine what content to render for assistant
  const displayContent = parsed ? parsed.answer : message.content;
  const hasReasoning = parsed && parsed.reasoning;
  const reasoningStillStreaming =
    isStreaming && isLast && parsed && !parsed.isReasoningComplete;

  return (
    <div
      className={cn(
        "group flex gap-3 sm:gap-4 px-4 py-4 sm:py-5 animate-fade-in",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-syntalys-blue/10 text-syntalys-blue">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-syntalys-blue shadow-sm">
            <Image
              src="/logos/logo-icono-solo-white.png"
              alt="SYNTALYS AI"
              width={18}
              height={18}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-w-0",
          isUser ? "flex justify-end" : "max-w-[calc(100%-3rem)]"
        )}
      >
        {isUser ? (
          <div className="inline-block max-w-[85%] rounded-2xl rounded-tr-sm bg-syntalys-blue px-4 py-2.5 text-white">
            <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Beta model banner */}
            {isBeta && message.content && !isStreaming && (
              <div className="flex items-center gap-2 rounded-lg border border-syntalys-gold/30 bg-syntalys-gold/5 px-3 py-2 mb-2">
                <FlaskConical className="h-3.5 w-3.5 flex-shrink-0 text-syntalys-gold-dark dark:text-syntalys-gold" />
                <p className="text-xs text-syntalys-gold-dark dark:text-syntalys-gold">
                  {t("betaWarning")}
                </p>
              </div>
            )}

            {/* Reasoning collapsible section */}
            {hasReasoning && (
              <div className="rounded-xl border border-border overflow-hidden mb-2">
                <button
                  onClick={() => setReasoningOpen((o) => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-syntalys-blue dark:text-[#4a8fd4]" />
                  <span>
                    {reasoningStillStreaming
                      ? t("reasoningThinking")
                      : reasoningOpen
                        ? t("hideReasoning")
                        : t("viewReasoning")}
                  </span>
                  {reasoningStillStreaming ? (
                    <div className="ml-auto flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-1" />
                      <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-2" />
                      <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-3" />
                    </div>
                  ) : (
                    <ChevronDown
                      className={cn(
                        "ml-auto h-3.5 w-3.5 transition-transform",
                        reasoningOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>
                {(reasoningOpen || reasoningStillStreaming) && (
                  <div className="border-t border-border bg-muted/30 px-3 py-3">
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsed!.reasoning}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main content */}
            {displayContent ? (
              <MarkdownRenderer content={displayContent} />
            ) : isStreaming && isLast && !reasoningStillStreaming ? (
              <div className="flex items-center gap-1 py-2">
                <div className="h-2 w-2 rounded-full bg-syntalys-blue animate-typing-dot-1" />
                <div className="h-2 w-2 rounded-full bg-syntalys-blue animate-typing-dot-2" />
                <div className="h-2 w-2 rounded-full bg-syntalys-blue animate-typing-dot-3" />
              </div>
            ) : null}

            {/* Action buttons */}
            {!isStreaming && message.content && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label={t("copyMessage")}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                {isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label={t("regenerate")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
