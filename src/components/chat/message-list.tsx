"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat-context";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  isDark: boolean;
  onSuggestionClick?: (prompt: string) => void;
}

export function MessageList({ isDark, onSuggestionClick }: MessageListProps) {
  const { messages, isStreaming, regenerateLastResponse } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const lastAssistantIdx = [...messages]
    .reverse()
    .findIndex((m) => m.role === "assistant");
  const actualLastAssistantIdx =
    lastAssistantIdx >= 0 ? messages.length - 1 - lastAssistantIdx : -1;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="mx-auto max-w-3xl">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={idx === actualLastAssistantIdx}
            isStreaming={isStreaming && idx === messages.length - 1}
            onRegenerate={
              idx === actualLastAssistantIdx
                ? (modelId?: string) => regenerateLastResponse(modelId)
                : undefined
            }
            onSuggestionClick={
              idx === actualLastAssistantIdx ? onSuggestionClick : undefined
            }
            isDark={isDark}
          />
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
