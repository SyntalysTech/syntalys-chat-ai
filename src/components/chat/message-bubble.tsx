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
  FileText,
  ImageIcon,
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        "group flex gap-2.5 sm:gap-4 px-3 sm:px-4 py-3 sm:py-5 animate-fade-in",
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
          <div className="inline-block max-w-[90%] sm:max-w-[85%]">
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 justify-end">
                {message.attachments.map((att, i) => {
                  const isImg = att.type.startsWith("image/");
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-syntalys-blue/80 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs text-white/90"
                    >
                      {isImg ? (
                        <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      ) : (
                        <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      )}
                      <span className="max-w-[80px] sm:max-w-[100px] truncate">{att.name}</span>
                      <span className="text-white/60 hidden sm:inline">{formatSize(att.size)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="rounded-2xl rounded-tr-sm bg-syntalys-blue px-3.5 sm:px-4 py-2 sm:py-2.5 text-white">
              <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                {message.content}
              </p>
            </div>
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

            {/* Action buttons — always visible on mobile, hover on desktop */}
            {!isStreaming && message.content && (
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors"
                  aria-label={t("copyMessage")}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                {isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors"
                    aria-label={t("regenerate")}
                  >
                    <RefreshCw className="h-4 w-4" />
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
