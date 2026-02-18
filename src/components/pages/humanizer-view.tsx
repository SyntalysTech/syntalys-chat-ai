"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  RotateCcw,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HumanizerViewProps {
  onMenuClick: () => void;
}

export function HumanizerView({ onMenuClick }: HumanizerViewProps) {
  const { t } = useI18n();
  const { user } = useAuth();

  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setResult("");
    setError("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          isAnonymous: !user,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error processing text");
        setIsProcessing(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Stream unavailable");
        setIsProcessing(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Error processing text");
      }
    } finally {
      setIsProcessing(false);
      abortRef.current = null;
    }
  }, [inputText, isProcessing, user]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setInputText("");
    setResult("");
    setError("");
  }, []);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-md px-1.5 sm:px-4 py-1 sm:py-2">
        <div className="flex items-center gap-0.5 sm:gap-2">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent active:bg-accent/80 transition-colors lg:hidden"
            aria-label={t("menu") as string}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-syntalys-gold/10">
              <Sparkles className="h-4 w-4 text-syntalys-gold" />
            </div>
            <h1 className="text-sm font-semibold text-foreground">
              {t("humanizerTitle")}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pl-safe pr-safe">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10 space-y-4 sm:space-y-6">
          {/* Subtitle */}
          <div className="flex items-start gap-2.5 justify-center">
            <p className="text-[13px] sm:text-sm text-muted-foreground text-center max-w-md">
              {t("humanizerSubtitle")}
            </p>
          </div>

          {/* Input */}
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("humanizerPlaceholder") as string}
              rows={6}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-syntalys-blue/40 focus:ring-1 focus:ring-syntalys-blue/20 transition-colors resize-none"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">
                {inputText.length.toLocaleString()} / 50,000
              </span>
              {(inputText || result) && !isProcessing && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2 py-1 -mr-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("humanizerReset")}
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={isProcessing ? handleStop : handleHumanize}
            disabled={!inputText.trim() && !isProcessing}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-2.5 text-sm font-medium transition-all active:scale-[0.98]",
              isProcessing
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                : "bg-syntalys-blue text-white hover:bg-syntalys-blue-light disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("humanizerProcessing")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("humanizerButton")}
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Result */}
          {(result || isProcessing) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("humanizerResult")}
                </span>
                {result && !isProcessing && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        {t("humanizerCopied")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        {t("copy")}
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-[15px] sm:text-sm text-foreground leading-relaxed min-h-[100px] max-h-[400px] overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                {result || (
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("humanizerProcessing")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {!result && !isProcessing && !error && !inputText && (
            <p className="text-center text-xs text-muted-foreground py-4">
              {t("humanizerEmpty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
