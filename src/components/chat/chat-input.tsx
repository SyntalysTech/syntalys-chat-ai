"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { getMessagesRemaining } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";
import { ArrowUp, Square, Paperclip, X, FileText, ImageIcon, Loader2, AlertCircle, Mic, MicOff, Plus, Palette } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
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

/** Guess MIME from extension when browser reports empty/generic type (common on mobile) */
function effectiveType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.toLowerCase().split(".").pop();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return (ext && map[ext]) || file.type || "application/octet-stream";
}

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
  const mime = effectiveType(file);
  const isImage = IMAGE_TYPES.includes(mime) || mime.startsWith("image/");

  if (isImage) {
    const dataUrl = await compressImage(file);
    return { name: file.name, type: mime, size: file.size, dataUrl };
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
  return { name: file.name, type: mime, size: file.size, extractedText: text };
}

/** Map locale to BCP-47 language tag for SpeechRecognition */
function getRecognitionLang(locale: string): string {
  const map: Record<string, string> = { fr: "fr-FR", es: "es-ES", en: "en-US" };
  return map[locale] || "en-US";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Check if browser supports SpeechRecognition */
function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  const [fileError, setFileError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [pwaKeyboardOpen, setPwaKeyboardOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const isAnon = !user;
  const limitReached = isAnon && anonUsageCount >= anonDailyLimit;
  const remaining = isAnon ? anonDailyLimit - anonUsageCount : Infinity;
  const hasContent = value.trim() || files.length > 0;
  const hasSpeech = !!getSpeechRecognition();

  // In PWA standalone mode, detect keyboard via visualViewport to remove
  // safe-area bottom padding (iOS doesn't update env() when keyboard opens)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (!isStandalone || !window.visualViewport) return;

    const handler = () => {
      const diff = window.innerHeight - window.visualViewport!.height;
      setPwaKeyboardOpen(diff > 100);
    };

    window.visualViewport.addEventListener("resize", handler);
    handler();
    return () => window.visualViewport!.removeEventListener("resize", handler);
  }, []);

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

  // Auto-clear file error after 4s
  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => setFileError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.lang = getRecognitionLang(locale);
    recognition.continuous = true;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setValue((prev) => (prev ? prev + " " + transcript : transcript));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, locale]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).slice(0, MAX_FILES - files.length);
    if (newFiles.length === 0) return;

    setFileError("");
    setProcessingFiles(true);
    try {
      const results: FileAttachment[] = [];
      const errors: string[] = [];
      for (const file of newFiles) {
        const mime = effectiveType(file);
        const isImage = IMAGE_TYPES.includes(mime) || mime.startsWith("image/");
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
        if (file.size > maxSize) {
          errors.push(`${file.name}: ${t("fileTooLarge" as TranslationKey)}`);
          continue;
        }
        try {
          const att = await processFile(file);
          results.push(att);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Error";
          errors.push(`${file.name}: ${msg}`);
        }
      }
      setFiles((prev) => [...prev, ...results].slice(0, MAX_FILES));
      if (errors.length > 0) {
        setFileError(errors.join(". "));
      }
    } finally {
      setProcessingFiles(false);
    }
  }, [files.length, t]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!value.trim() && files.length === 0) || isStreaming || limitReached) return;

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const content = value.trim() || (files.length > 0 ? t("attachedFiles") as string : "");
    const attachments = files.length > 0 ? [...files] : undefined;

    // Save input state before clearing (restore if send is rejected)
    const savedValue = value;
    const savedFiles = files;
    const wasImageGen = imageGenMode;

    setValue("");
    setFiles([]);
    setFileError("");
    setImageGenMode(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const accepted = await sendMessage(content, attachments, undefined, wasImageGen || undefined);
    if (!accepted) {
      setValue(savedValue);
      setFiles(savedFiles);
      setImageGenMode(wasImageGen);
    }
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
    <div className={cn("flex-shrink-0 pl-safe pr-safe", !pwaKeyboardOpen && "pb-safe")}>
      <div className="mx-auto max-w-3xl px-3 sm:px-4 pt-2 sm:pt-3 pb-0.5 sm:pb-2">
        {/* File error message */}
        {fileError && (
          <div className="mb-2.5 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs text-destructive animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span className="break-words min-w-0">{fileError}</span>
            <button
              onClick={() => setFileError("")}
              className="ml-auto flex-shrink-0 rounded-full p-1.5 -mr-1 hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div
          className={cn(
            "relative rounded-2xl border border-border/80 bg-card shadow-sm",
            limitReached && "opacity-60"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* File previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-3.5 pt-3">
              {files.map((file, i) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs"
                  >
                    {isImage ? (
                      <ImageIcon className="h-3.5 w-3.5 text-syntalys-blue flex-shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-syntalys-blue flex-shrink-0" />
                    )}
                    <span className="max-w-[100px] sm:max-w-[120px] truncate text-card-foreground">{file.name}</span>
                    <span className="text-muted-foreground hidden sm:inline">{formatSize(file.size)}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="ml-0.5 rounded-full p-1 hover:bg-accent active:bg-accent/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
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

          {/* Hidden file input */}
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

          {/* Input row */}
          <div className="flex items-end gap-1.5 p-2">
            {/* Left: + dropdown OR image-mode pill */}
            {!imageGenMode ? (
              <Dropdown
                trigger={
                  <button
                    disabled={limitReached}
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80",
                      limitReached && "opacity-40 cursor-not-allowed"
                    )}
                    aria-label="Actions"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                }
                align="left"
                direction="up"
              >
                <DropdownItem
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-3.5 w-3.5" /> {t("attachFile")}
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setImageGenMode(true);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                >
                  <Palette className="h-3.5 w-3.5" /> {t("generateImage" as TranslationKey)}
                </DropdownItem>
              </Dropdown>
            ) : (
              <button
                onClick={() => setImageGenMode(false)}
                className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-syntalys-blue/10 text-syntalys-blue px-3 text-xs font-medium hover:bg-syntalys-blue/20 active:bg-syntalys-blue/25 transition-colors"
              >
                <Palette className="h-4 w-4 flex-shrink-0" />
                <X className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              </button>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                isListening
                  ? (t("voiceListening" as TranslationKey) as string)
                  : limitReached
                    ? (t("inputLimitReached") as string)
                    : imageGenMode
                      ? (t("describeImagePlaceholder" as TranslationKey) as string)
                      : (t("inputPlaceholder") as string)
              }
              disabled={limitReached}
              rows={1}
              className={cn(
                "flex-1 min-w-0 resize-none bg-transparent py-2 text-[16px] sm:text-sm text-foreground placeholder:text-muted-foreground",
                "outline-none ring-0 border-none focus:outline-none focus:ring-0 focus:border-none overflow-y-auto scrollbar-none",
                "max-h-[200px]"
              )}
              aria-label={t("inputPlaceholder") as string}
            />

            {/* Right-side buttons */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              {/* Voice input button */}
              {hasSpeech && !limitReached && (
                <button
                  onClick={toggleListening}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150",
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80"
                  )}
                  aria-label={isListening ? (t("voiceListening" as TranslationKey) as string) : (t("voiceInput" as TranslationKey) as string)}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-[18px] w-[18px]" />
                  )}
                </button>
              )}

              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={!hasContent || isStreaming || limitReached || processingFiles}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150",
                  hasContent && !isStreaming && !limitReached && !processingFiles
                    ? "bg-syntalys-blue text-white hover:bg-syntalys-blue-light active:scale-95 shadow-sm"
                    : "text-muted-foreground/40 cursor-not-allowed"
                )}
                aria-label={isStreaming ? (t("stop") as string) : (t("sendMessage") as string)}
              >
                {isStreaming ? (
                  <Square className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Usage indicator for anonymous users */}
        {isAnon && (
          <div className="mt-1.5 sm:mt-2.5 flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              {limitReached ? (
                <span className="text-destructive">
                  {t("limitReachedShort")}
                </span>
              ) : (
                getMessagesRemaining(locale, remaining)
              )}
            </p>
            <div className="flex gap-[3px]">
              {Array.from({ length: anonDailyLimit }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i < anonUsageCount ? "bg-syntalys-blue" : "bg-border"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <p className="mt-1 sm:mt-2 text-center text-[10px] sm:text-xs text-muted-foreground/50 leading-relaxed">
          {t("aiDisclaimer")}
        </p>
      </div>
    </div>
  );
}
