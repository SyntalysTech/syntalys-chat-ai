import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatRelativeDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "last7Days";
  return "older";
}

export function groupChatsByDate<T extends { created_at: string }>(
  chats: T[]
): { label: string; chats: T[] }[] {
  const groups: Record<string, T[]> = {};

  for (const chat of chats) {
    const label = formatRelativeDateKey(chat.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(chat);
  }

  const order = ["today", "yesterday", "last7Days", "older"];
  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({ label, chats: groups[label] }));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "\u2026";
}

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("syntalys_anon_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("syntalys_anon_id", id);
  }
  return id;
}
