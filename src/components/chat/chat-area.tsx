"use client";

import { useState, useCallback } from "react";
import { useChat } from "@/lib/chat-context";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";

interface ChatAreaProps {
  onMenuClick: () => void;
  isDark: boolean;
}

export function ChatArea({ onMenuClick, isDark }: ChatAreaProps) {
  const { messages } = useChat();
  const hasMessages = messages.length > 0;
  const [draft, setDraft] = useState("");

  const handleSuggestionClick = useCallback((prompt: string) => {
    setDraft(prompt);
  }, []);

  const handleDraftConsumed = useCallback(() => {
    setDraft("");
  }, []);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <ChatHeader onMenuClick={onMenuClick} />

      {hasMessages ? (
        <MessageList isDark={isDark} />
      ) : (
        <EmptyState isDark={isDark} onSuggestionClick={handleSuggestionClick} />
      )}

      <ChatInput draft={draft} onDraftConsumed={handleDraftConsumed} />
    </div>
  );
}
