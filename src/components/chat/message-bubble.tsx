"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { MODELS } from "@/lib/models";
import type { TranslationKey } from "@/lib/translations";
import {
  Check,
  Copy,
  RefreshCw,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Sparkles,
  FlaskConical,
  FileText,
  ImageIcon,
  Volume2,
  VolumeX,
  Loader2,
  ArrowUpRight,
  Palette,
} from "lucide-react";
import Image from "next/image";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  isImageGenerating?: boolean;
  onRegenerate?: (modelId?: string) => void;
  onSuggestionClick?: (prompt: string) => void;
  isDark: boolean;
  // Branching
  branchInfo?: { index: number; total: number } | null;
  onNavigateBranch?: (direction: "prev" | "next") => void;
  onEditAndResend?: (newContent: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Strip markdown formatting for TTS */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // links
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/#{1,6}\s*/g, "") // headings
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // bold/italic
    .replace(/~~([^~]+)~~/g, "$1") // strikethrough
    .replace(/>\s*/g, "") // blockquotes
    .replace(/[-*+]\s+/g, "") // list items
    .replace(/\d+\.\s+/g, "") // ordered list items
    .replace(/\|.*\|/g, "") // table rows
    .replace(/<[^>]+>/g, "") // HTML tags
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
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
    const reasoning = content.slice(reasoningStart).trim();
    return { reasoning, answer: "", isReasoningComplete: false };
  }

  const reasoning = content.slice(reasoningStart, closeIdx).trim();
  const answer = content.slice(closeIdx + closeTag.length).trim();
  return { reasoning, answer, isReasoningComplete: true };
}

/** Strip <memory> tags from displayed content */
function stripMemoryTags(content: string): string {
  let cleaned = content.replace(/<memory(?:\s+category="[^"]*")?\s*>[\s\S]*?<\/memory>/g, "");
  cleaned = cleaned.replace(/<memory[^>]*>[^<]*$/, "").replace(/<memo[^>]*$/, "");
  return cleaned.trim();
}

/** Parse <suggestions>...</suggestions> from content */
function parseSuggestions(content: string): {
  cleanContent: string;
  suggestions: string[];
} {
  const withoutMemory = stripMemoryTags(content);

  const regex = /<suggestions>([\s\S]*?)<\/suggestions>/;
  const match = withoutMemory.match(regex);
  if (!match) {
    const cleaned = withoutMemory.replace(/<suggestions>[^<]*$/, "").replace(/<suggest[^>]*$/, "").trim();
    return { cleanContent: cleaned, suggestions: [] };
  }
  const raw = match[1].trim();
  const suggestions = raw
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 80);
  const cleanContent = withoutMemory.replace(regex, "").trim();
  return { cleanContent, suggestions };
}

/** Compact branch navigation arrows */
function BranchNav({
  info,
  onNavigate,
}: {
  info: { index: number; total: number };
  onNavigate: (dir: "prev" | "next") => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onNavigate("prev")}
        disabled={info.index === 1}
        className={cn(
          "flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md transition-colors",
          info.index === 1
            ? "text-muted-foreground/25 cursor-not-allowed"
            : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80"
        )}
        aria-label="Previous branch"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="text-[11px] text-muted-foreground font-medium tabular-nums min-w-[2rem] text-center select-none">
        {info.index}/{info.total}
      </span>
      <button
        onClick={() => onNavigate("next")}
        disabled={info.index === info.total}
        className={cn(
          "flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md transition-colors",
          info.index === info.total
            ? "text-muted-foreground/25 cursor-not-allowed"
            : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80"
        )}
        aria-label="Next branch"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isLast,
  isStreaming,
  isImageGenerating,
  onRegenerate,
  onSuggestionClick,
  isDark,
  branchInfo,
  onNavigateBranch,
  onEditAndResend,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const hasTTS = true;

  // Close model menu on outside click
  useEffect(() => {
    if (!modelMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [modelMenuOpen]);

  // Auto-resize edit textarea
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      const ta = editTextareaRef.current;
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [isEditing, editText]);

  const availableModels = useMemo(
    () => MODELS.filter((m) => !m.legacy && (user || !m.requiresAuth)),
    [user]
  );
  const isUser = message.role === "user";
  const isReasoning = message.model === "talys-think" || message.model === "talys-2.5" || message.model === "synta-1.0-reasoning";
  const isBeta = false;

  const parsed = useMemo(() => {
    if (!isReasoning || isUser) return null;
    return parseReasoning(message.content);
  }, [message.content, isReasoning, isUser]);

  const handleCopy = async () => {
    const textToCopy =
      parsed && parsed.answer ? parsed.answer : message.content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = useCallback(async () => {
    if (isSpeaking || ttsLoading) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(false);
      setTtsLoading(false);
      return;
    }

    const textToRead = parsed && parsed.answer ? parsed.answer : message.content;
    const cleaned = stripMarkdown(textToRead);
    if (!cleaned) return;

    setTtsLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned, lang: locale }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setTtsLoading(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      setTtsLoading(false);
      setIsSpeaking(true);
      await audio.play();
    } catch {
      setTtsLoading(false);
      setIsSpeaking(false);
    }
  }, [isSpeaking, ttsLoading, parsed, message.content, locale]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleEditSubmit = useCallback(() => {
    if (!editText.trim() || editText.trim() === message.content) return;
    setIsEditing(false);
    onEditAndResend?.(editText.trim());
  }, [editText, message.content, onEditAndResend]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }, [handleEditSubmit]);

  // Parse suggestions from content
  const rawContent = parsed ? parsed.answer : message.content;
  const suggestionsData = useMemo(
    () => (!isUser ? parseSuggestions(rawContent) : { cleanContent: rawContent, suggestions: [] }),
    [rawContent, isUser]
  );
  const displayContent = suggestionsData.cleanContent;
  const followUpSuggestions = suggestionsData.suggestions;

  const hasReasoning = parsed && parsed.reasoning;
  const reasoningStillStreaming =
    isStreaming && isLast && parsed && !parsed.isReasoningComplete;

  const showUserActions = isUser && !isStreaming && message.content;
  const hasBranches = branchInfo && branchInfo.total > 1;

  return (
    <div
      className={cn(
        "group flex gap-2.5 sm:gap-4 px-2.5 sm:px-4 py-2.5 sm:py-4 animate-fade-in",
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
          isUser ? "flex flex-col items-end" : "max-w-[calc(100%-2.5rem)] sm:max-w-[calc(100%-3rem)]"
        )}
      >
        {isUser ? (
          isEditing ? (
            /* ── Edit mode ── */
            <div className="w-full max-w-[88%] sm:max-w-[85%]">
              <div className="rounded-2xl border-2 border-syntalys-blue/30 bg-card p-3 shadow-sm">
                <textarea
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="w-full resize-none bg-transparent text-[15px] sm:text-sm text-foreground leading-relaxed outline-none scrollbar-none"
                  rows={1}
                />
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={!editText.trim() || editText.trim() === message.content}
                    className="rounded-lg bg-syntalys-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-syntalys-blue-light transition-colors disabled:opacity-40"
                  >
                    {t("saveAndSubmit" as TranslationKey)}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Normal user message ── */
            <>
              <div className="inline-block max-w-[88%] sm:max-w-[85%]">
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 justify-end">
                    {message.attachments.map((att, i) => {
                      const isImg = att.type.startsWith("image/");
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 rounded-lg bg-syntalys-blue/80 px-2.5 py-1.5 text-xs text-white/90"
                        >
                          {isImg ? (
                            <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          ) : (
                            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          )}
                          <span className="max-w-[100px] sm:max-w-[120px] truncate">{att.name}</span>
                          <span className="text-white/60 hidden sm:inline">{formatSize(att.size)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="rounded-2xl rounded-tr-sm bg-syntalys-blue px-3.5 sm:px-4 py-2.5 text-white">
                  <p className="whitespace-pre-wrap text-[15px] sm:text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
              </div>

              {/* User message actions: branch nav + edit */}
              {showUserActions && (hasBranches || onEditAndResend) && (
                <div className="flex items-center gap-1 mt-1">
                  {hasBranches && onNavigateBranch && (
                    <BranchNav info={branchInfo!} onNavigate={onNavigateBranch} />
                  )}
                  {onEditAndResend && (
                    <button
                      onClick={() => {
                        setEditText(message.content);
                        setIsEditing(true);
                      }}
                      className="flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent active:bg-accent/80 transition-colors"
                      aria-label={t("editMessage" as TranslationKey)}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </>
          )
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
              <div className="flex items-center gap-2.5 py-2 animate-fade-in">
                {isImageGenerating ? (
                  <>
                    <Palette className="h-4 w-4 text-syntalys-blue animate-pulse" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {t("generatingImageIndicator" as TranslationKey)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground font-medium">
                    {t("thinkingIndicator")}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-1" />
                  <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-2" />
                  <div className="h-1.5 w-1.5 rounded-full bg-syntalys-blue animate-typing-dot-3" />
                </div>
              </div>
            ) : null}

            {/* Branch navigation for assistant messages */}
            {hasBranches && !isStreaming && onNavigateBranch && (
              <div className="pt-0.5">
                <BranchNav info={branchInfo!} onNavigate={onNavigateBranch} />
              </div>
            )}

            {/* Action buttons */}
            {!isStreaming && message.content && (
              <div className="flex items-center gap-0.5 sm:gap-1 pt-1.5 sm:pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center h-10 w-10 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors"
                  aria-label={t("copyMessage")}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                {hasTTS && (
                  <button
                    onClick={handleSpeak}
                    disabled={ttsLoading}
                    className="flex items-center justify-center h-10 w-10 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors disabled:opacity-50"
                    aria-label={isSpeaking ? t("stopReading" as TranslationKey) : t("readAloud" as TranslationKey)}
                  >
                    {ttsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSpeaking ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                )}
                {isLast && onRegenerate && (
                  <div ref={modelMenuRef} className="relative">
                    <button
                      onClick={() => setModelMenuOpen((o) => !o)}
                      className="flex items-center justify-center h-10 w-10 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors"
                      aria-label={t("regenerate")}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    {modelMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-1 w-[min(14rem,calc(100vw-3rem))] rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-fade-in z-50">
                        <p className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                          {t("regenerateWith" as TranslationKey)}
                        </p>
                        {availableModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setModelMenuOpen(false);
                              onRegenerate(model.id);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 sm:py-2 text-left text-sm hover:bg-accent active:bg-accent/80 transition-colors"
                          >
                            <span className="font-medium text-xs text-popover-foreground">
                              {model.name}
                            </span>
                            {model.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                                  model.badge === "Flagship"
                                    ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                                    : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                                )}
                              >
                                {model.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Smart Follow-up Suggestions */}
            {isLast && !isStreaming && followUpSuggestions.length > 0 && onSuggestionClick && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-3 animate-fade-in">
                {followUpSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="group/chip flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-2 sm:px-3.5 sm:py-2 text-[13px] sm:text-[13px] text-muted-foreground transition-all duration-200 hover:border-syntalys-blue/40 hover:bg-syntalys-blue/5 hover:text-foreground active:scale-[0.97]"
                  >
                    <span className="leading-snug">{suggestion}</span>
                    <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 opacity-0 -translate-x-1 group-hover/chip:opacity-100 group-hover/chip:translate-x-0 transition-all duration-200 text-syntalys-blue" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
