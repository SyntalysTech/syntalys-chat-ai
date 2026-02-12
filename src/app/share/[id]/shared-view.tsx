"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { getModelByIdOrDefault } from "@/lib/models";
import Image from "next/image";
import { User, Sparkles, ChevronDown, Share2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface SharedMessage {
  role: "user" | "assistant";
  content: string;
  model?: string | null;
}

interface SharedConversation {
  id: string;
  title: string;
  model: string;
  messages: SharedMessage[];
  created_at: string;
}

function parseReasoning(content: string) {
  const openTag = "<reasoning>";
  const closeTag = "</reasoning>";
  const openIdx = content.indexOf(openTag);
  if (openIdx === -1) return { reasoning: null, answer: content };
  const reasoningStart = openIdx + openTag.length;
  const closeIdx = content.indexOf(closeTag, reasoningStart);
  if (closeIdx === -1) return { reasoning: content.slice(reasoningStart).trim(), answer: "" };
  return {
    reasoning: content.slice(reasoningStart, closeIdx).trim(),
    answer: content.slice(closeIdx + closeTag.length).trim(),
  };
}

function SharedMessage({ message }: { message: SharedMessage }) {
  const isUser = message.role === "user";
  const isReasoning = message.model === "synta-1.0-reasoning";
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const parsed = useMemo(() => {
    if (!isReasoning || isUser) return null;
    return parseReasoning(message.content);
  }, [message.content, isReasoning, isUser]);

  const displayContent = parsed ? parsed.answer : message.content;

  return (
    <div className={cn("flex gap-3 sm:gap-4 px-4 py-4 sm:py-5", isUser && "flex-row-reverse")}>
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-syntalys-blue/10 text-syntalys-blue">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-syntalys-blue shadow-sm">
            <Image src="/logos/logo-icono-solo-white.png" alt="SYNTALYS AI" width={18} height={18} />
          </div>
        )}
      </div>
      <div className={cn("flex-1 min-w-0", isUser ? "flex justify-end" : "max-w-[calc(100%-3rem)]")}>
        {isUser ? (
          <div className="inline-block max-w-[85%] rounded-2xl rounded-tr-sm bg-syntalys-blue px-4 py-2.5 text-white">
            <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parsed?.reasoning && (
              <div className="rounded-xl border border-border overflow-hidden mb-2">
                <button
                  onClick={() => setReasoningOpen((o) => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-syntalys-blue dark:text-[#4a8fd4]" />
                  <span>{reasoningOpen ? "Masquer le raisonnement" : "Voir le raisonnement"}</span>
                  <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", reasoningOpen && "rotate-180")} />
                </button>
                {reasoningOpen && (
                  <div className="border-t border-border bg-muted/30 px-3 py-3">
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsed.reasoning}
                    </div>
                  </div>
                )}
              </div>
            )}
            {displayContent && <MarkdownRenderer content={displayContent} />}
          </div>
        )}
      </div>
    </div>
  );
}

export function SharedConversationView({ conversation }: { conversation: SharedConversation }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const model = getModelByIdOrDefault(conversation.model);
  const date = new Date(conversation.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logoSrc = isDark ? "/logos/logo-horizontal-white.png" : "/logos/logo-horizontal-blue.png";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <Image src={logoSrc} alt="SYNTALYS" width={120} height={28} className="h-6 w-auto" />
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">{date}</span>
            {model.badge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  model.badge === "Beta"
                    ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                    : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                )}
              >
                {model.badge}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Share2 className="h-3.5 w-3.5" />
          <span className="text-xs">Conversation partagee</span>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">{conversation.title}</h1>
      </div>

      {/* Messages */}
      <div className="mx-auto max-w-3xl pb-16">
        <div className="divide-y divide-border/30">
          {conversation.messages.map((msg, i) => (
            <SharedMessage key={i} message={msg} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <p className="text-xs text-muted-foreground">SYNTALYS Chat AI</p>
          <a
            href="/"
            className="rounded-lg bg-syntalys-blue px-4 py-2 text-sm font-medium text-white hover:bg-syntalys-blue-light transition-colors"
          >
            Essayer SYNTALYS AI
          </a>
        </div>
      </div>
    </div>
  );
}
