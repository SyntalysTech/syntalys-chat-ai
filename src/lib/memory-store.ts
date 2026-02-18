"use client";

import type { UserMemory } from "./types";

const MEMORY_STORAGE_KEY = "syntalys_anon_memories";
const MAX_MEMORIES = 50;

// ── Anonymous (localStorage) ──

export function getLocalMemories(): UserMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMemory(memory: Omit<UserMemory, "id" | "user_id" | "created_at" | "updated_at">): UserMemory {
  const memories = getLocalMemories();

  const newMemory: UserMemory = {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    user_id: null,
    content: memory.content,
    category: memory.category,
    source: memory.source,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Check for duplicate content (case-insensitive)
  const isDuplicate = memories.some(
    (m) => m.content.toLowerCase().trim() === newMemory.content.toLowerCase().trim()
  );
  if (isDuplicate) return newMemory;

  // Enforce max limit — remove oldest if at cap
  if (memories.length >= MAX_MEMORIES) {
    memories.pop();
  }

  memories.unshift(newMemory);
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  return newMemory;
}

export function deleteLocalMemory(memoryId: string): void {
  const memories = getLocalMemories().filter((m) => m.id !== memoryId);
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
}

export function clearLocalMemories(): void {
  localStorage.removeItem(MEMORY_STORAGE_KEY);
}

// ── Memory parsing from AI responses ──

export interface ParsedMemory {
  content: string;
  category: UserMemory["category"];
  source: UserMemory["source"];
}

/**
 * Extract <memory> tags from AI response content.
 * Supports: <memory>text</memory> and <memory category="fact">text</memory>
 */
export function parseMemoryTags(content: string): {
  cleanContent: string;
  memories: ParsedMemory[];
} {
  const memories: ParsedMemory[] = [];
  const regex = /<memory(?:\s+category="(preference|fact|instruction|context|general)")?\s*>([\s\S]*?)<\/memory>/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const category = (match[1] as ParsedMemory["category"]) || "general";
    const text = match[2].trim();
    if (text.length > 0 && text.length < 500) {
      memories.push({
        content: text,
        category,
        source: "ai_inferred",
      });
    }
  }

  // Clean: remove all <memory> tags from displayed content
  let cleanContent = content.replace(/<memory(?:\s+category="[^"]*")?\s*>[\s\S]*?<\/memory>/g, "").trim();
  // Also clean incomplete tags during streaming
  cleanContent = cleanContent.replace(/<memory[^>]*>[^<]*$/, "").replace(/<memo[^>]*$/, "").trim();

  return { cleanContent, memories };
}

/**
 * Build the memory context block to inject into system prompts.
 */
export function buildMemoryContext(memories: UserMemory[]): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => {
    const label = m.source === "user_explicit" ? "[User]" : "[Noted]";
    return `- ${label} ${m.content}`;
  });

  return `\n\n## User Memory (Persistent across conversations)

You have the following memories about this user. Use them naturally to personalize your responses — reference them when relevant, but don't list them or mention you have a "memory system" unless asked.

${lines.join("\n")}`;
}
