"use client";

import { ChatThread, ChatMessage } from "./types";

const STORAGE_KEY = "syntalys_anon_chats";
const MESSAGES_KEY = "syntalys_anon_messages";

export function getLocalThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalThread(thread: ChatThread): void {
  const threads = getLocalThreads();
  const idx = threads.findIndex((t) => t.id === thread.id);
  if (idx >= 0) {
    threads[idx] = thread;
  } else {
    threads.unshift(thread);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function deleteLocalThread(threadId: string): void {
  const threads = getLocalThreads().filter((t) => t.id !== threadId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  localStorage.removeItem(`${MESSAGES_KEY}_${threadId}`);
}

export function getLocalMessages(threadId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${MESSAGES_KEY}_${threadId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMessages(
  threadId: string,
  messages: ChatMessage[]
): void {
  localStorage.setItem(`${MESSAGES_KEY}_${threadId}`, JSON.stringify(messages));
}

export function addLocalMessage(
  threadId: string,
  message: ChatMessage
): void {
  const messages = getLocalMessages(threadId);
  messages.push(message);
  saveLocalMessages(threadId, messages);
}

export function getAnonUsageCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const key = `syntalys_anon_usage_${today}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
}

export function incrementAnonUsage(): void {
  const today = new Date().toISOString().split("T")[0];
  const key = `syntalys_anon_usage_${today}`;
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(current + 1));
}
