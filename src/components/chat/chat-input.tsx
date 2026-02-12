"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { getMessagesRemaining } from "@/lib/translations";
import { ArrowUp, Square, Paperclip, X, FileText, ImageIcon, Loader2 } from "lucide-react";
import type { FileAttachment } from "@/lib/types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
];
const ALL_ACCEPT = [...IMAGE_TYPES, ...DOC_TYPES, ".pdf", ".docx", ".xlsx", ".xls", ".csv", ".txt"].join(",");
const MAX_FILES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 2048;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function processFile(file: File): Promise<FileAttachment> {
  const isImage = IMAGE_TYPES.includes(file.type) || file.type.startsWith("image/");

  if (isImage) {
    const dataUrl = await compressImage(file);
    return { name: file.name, type: file.type, size: file.size, dataUrl };
  }

  // Document - send to server for text extraction
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/process-file", { method: "POST", body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }));
    throw new Error(err.error || "Failed to process file");
  }

  const { text } = await res.json();
  return { name: file.name, type: file.type, size: file.size, extractedText: text };
}

interface ChatInputProps {
  draft?: string;
  onDraftConsumed?: () => void;
}

export function ChatInput({ draft, onDraftConsumed }: ChatInputProps) {
  const { user } = useAuth();
  const { sendMessage, isStreaming, anonUsageCount, anonDailyLimit } = useChat();
  const { t, locale } = useI18n();
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnon = !user;
  const limitReached = isAnon && anonUsageCount >= anonDailyLimit;
  const remaining = isAnon ? anonDailyLimit - anonUsageCount : Infinity;
  const hasContent = value.trim() || files.length > 0;

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

  useEffect(() => {
    if (draft) {
      setValue(draft);
      onDraftConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [draft, onDraftConsumed]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).slice(0, MAX_FILES - files.length);
    if (newFiles.length === 0) return;

    setProcessingFiles(true);
    try {
      const results: FileAttachment[] = [];
      for (const file of newFiles) {
        const isImage = IMAGE_TYPES.includes(file.type) || file.type.startsWith("image/");
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
        if (file.size > maxSize) continue;
        try {
          const att = await processFile(file);
          results.push(att);
        } catch {
          // Skip failed files silently
        }
      }
      setFiles((prev) => [...prev, ...results].slice(0, MAX_FILES));
    } finally {
      setProcessingFiles(false);
    }
  }, [files.length]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!value.trim() && files.length === 0) || isStreaming || limitReached) return;

    const content = value.trim() || (files.length > 0 ? t("attachedFiles") as string : "");
    const attachments = files.length > 0 ? [...files] : undefined;

    setValue("");
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await sendMessage(content, attachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pastedFiles = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[];
      if (pastedFiles.length > 0) {
        e.preventDefault();
        handleFiles(pastedFiles);
      }
    },
    [handleFiles]
  );

  return (
    <div className="flex-shrink-0 border-t border-border/50 bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-2 sm:py-4">
        <div
          className={cn(
            "relative rounded-2xl border border-border bg-card shadow-sm transition-colors",
            "focus-within:border-syntalys-blue/40 focus-within:shadow-md",
            limitReached && "opacity-60"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* File previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {files.map((file, i) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs"
                  >
                    {isImage ? (
                      <ImageIcon className="h-3.5 w-3.5 text-syntalys-blue flex-shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-syntalys-blue flex-shrink-0" />
                    )}
                    <span className="max-w-[120px] truncate text-card-foreground">{file.name}</span>
                    <span className="text-muted-foreground">{formatSize(file.size)}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-accent transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
              {processingFiles && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("processing")}
                </div>
              )}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end">
            {/* Attach button */}
            <div className="flex items-center pl-2 pb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={limitReached || files.length >= MAX_FILES || processingFiles}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  (limitReached || files.length >= MAX_FILES) && "opacity-40 cursor-not-allowed"
                )}
                aria-label={t("attachFile") as string}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALL_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                limitReached
                  ? (t("inputLimitReached") as string)
                  : (t("inputPlaceholder") as string)
              }
              disabled={limitReached}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-muted-foreground",
                "outline-none",
                "max-h-[200px]"
              )}
              aria-label="Mensaje"
            />

            <div className="flex items-center gap-1 px-2 pb-2">
              <button
                onClick={handleSubmit}
                disabled={!hasContent || isStreaming || limitReached || processingFiles}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                  hasContent && !isStreaming && !limitReached && !processingFiles
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
                    i < anonUsageCount ? "bg-syntalys-blue" : "bg-border"
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
