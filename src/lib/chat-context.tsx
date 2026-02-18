"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "./supabase-client";
import { useAuth } from "./auth-context";
import { useI18n } from "./i18n-context";
import {
  getLocalThreads,
  saveLocalThread,
  deleteLocalThread,
  getLocalMessages,
  addLocalMessage,
  getAnonUsageCount,
  incrementAnonUsage,
} from "./chat-store";
import { DEFAULT_MODEL_ID, getModelByIdOrDefault } from "./models";
import type { ChatThread, ChatMessage, StreamMessage, FileAttachment } from "./types";
import { generateId, getAnonId } from "./utils";

interface ChatContextType {
  threads: ChatThread[];
  currentThread: ChatThread | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  selectedModel: string;
  anonUsageCount: number;
  anonDailyLimit: number;
  setSelectedModel: (model: string) => void;
  loadThreads: () => Promise<void>;
  createThread: () => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
  sendMessage: (content: string, attachments?: FileAttachment[], modelOverride?: string) => Promise<void>;
  regenerateLastResponse: (modelId?: string) => Promise<void>;
  clearCurrentThread: () => void;
  deleteAllThreads: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const ANON_DAILY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_ANON_DAILY_LIMIT || "20",
  10
);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const supabase = createClient();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [anonUsageCount, setAnonUsageCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const loadThreads = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setThreads(data as ChatThread[]);
    } else {
      setThreads(getLocalThreads());
      setAnonUsageCount(getAnonUsageCount());
    }
  }, [user, supabase]);

  const createThread = useCallback(async (): Promise<string> => {
    const model = getModelByIdOrDefault(selectedModel);
    const now = new Date().toISOString();

    if (user) {
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({
          user_id: user.id,
          title: t("newConversation") as string,
          model: model.id,
        })
        .select()
        .single();

      if (error || !data) throw new Error("Failed to create thread");
      const thread = data as ChatThread;
      setThreads((prev) => [thread, ...prev]);
      setCurrentThread(thread);
      setMessages([]);
      return thread.id;
    } else {
      const thread: ChatThread = {
        id: generateId(),
        user_id: null,
        anon_id: getAnonId(),
        title: t("newConversation") as string,
        model: model.id,
        created_at: now,
        updated_at: now,
      };
      saveLocalThread(thread);
      setThreads((prev) => [thread, ...prev]);
      setCurrentThread(thread);
      setMessages([]);
      return thread.id;
    }
  }, [user, supabase, selectedModel, t]);

  const selectThread = useCallback(
    async (threadId: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      isStreamingRef.current = false;
      setIsStreaming(false);

      const thread = threads.find((t) => t.id === threadId);
      if (!thread) return;

      setCurrentThread(thread);
      setSelectedModel(thread.model || DEFAULT_MODEL_ID);

      if (user) {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true });
        if (data) setMessages(data as ChatMessage[]);
      } else {
        setMessages(getLocalMessages(threadId));
      }
    },
    [user, supabase, threads]
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      if (user) {
        await supabase.from("chat_threads").delete().eq("id", threadId);
      } else {
        deleteLocalThread(threadId);
      }

      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
        setMessages([]);
      }
    },
    [user, supabase, currentThread]
  );

  const renameThread = useCallback(
    async (threadId: string, title: string) => {
      if (user) {
        await supabase
          .from("chat_threads")
          .update({ title })
          .eq("id", threadId);
      } else {
        const localThreads = getLocalThreads();
        const thread = localThreads.find((t) => t.id === threadId);
        if (thread) {
          thread.title = title;
          saveLocalThread(thread);
        }
      }

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title } : t))
      );
      if (currentThread?.id === threadId) {
        setCurrentThread((prev) => (prev ? { ...prev, title } : null));
      }
    },
    [user, supabase, currentThread]
  );

  const sendMessage = useCallback(
    async (content: string, attachments?: FileAttachment[], modelOverride?: string) => {
      // Use ref to prevent stale closure from blocking sends
      if (isStreamingRef.current) return;

      // Check anonymous limit
      if (!user) {
        const usage = getAnonUsageCount();
        if (usage >= ANON_DAILY_LIMIT) return;
      }

      // Lock immediately via ref (avoids stale closure issues)
      isStreamingRef.current = true;
      setIsStreaming(true);

      const effectiveModel = modelOverride || selectedModel;
      let assistantMessage: ChatMessage | null = null;

      try {
        let threadId = currentThread?.id;

        // Auto-create thread if needed
        if (!threadId) {
          threadId = await createThread();
        }

        const userMessage: ChatMessage = {
          id: generateId(),
          thread_id: threadId,
          role: "user",
          content,
          model: null,
          created_at: new Date().toISOString(),
          attachments: attachments?.map(({ name, type, size }) => ({ name, type, size })),
        };

        // Save user message
        if (user) {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            role: "user",
            content,
          });
        } else {
          addLocalMessage(threadId, userMessage);
        }

        setMessages((prev) => [...prev, userMessage]);

        // Update title from first message (use ref for current messages)
        const currentMsgs = user
          ? messagesRef.current
          : getLocalMessages(threadId).filter((m) => m.id !== userMessage.id);
        if (currentMsgs.filter((m) => m.role === "user").length === 0) {
          const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          await renameThread(threadId, title);
        }

        // Prepare streaming
        assistantMessage = {
          id: generateId(),
          thread_id: threadId,
          role: "assistant",
          content: "",
          model: effectiveModel,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage!]);

        // Build image URLs and document context from attachments
        const imageUrls: string[] = [];
        let docContext = "";
        if (attachments?.length) {
          for (const att of attachments) {
            if (att.type.startsWith("image/") && att.dataUrl) {
              imageUrls.push(att.dataUrl);
            } else if (att.extractedText) {
              docContext += `\n\n--- [${att.name}] ---\n${att.extractedText}`;
            }
          }
        }

        // If there's document context, prepend it to the last user message
        const lastContent = docContext
          ? `${content}\n\n[Attached documents]${docContext}`
          : content;

        // Use ref for current messages to avoid stale closure
        const historyForApi: StreamMessage[] = [
          ...messagesRef.current.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: lastContent },
        ];

        // Retry loop for network/server errors
        const MAX_RETRIES = 2;
        const RETRY_DELAYS = [1000, 3000];
        const msgId = assistantMessage!.id;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const abortController = new AbortController();
            abortRef.current = abortController;

            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: historyForApi,
                model: effectiveModel,
                threadId,
                isAnonymous: !user,
                userName: profile?.display_name || undefined,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
              }),
              signal: abortController.signal,
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              if (response.status === 429 && !user) {
                setAnonUsageCount(ANON_DAILY_LIMIT);
              }
              // Don't retry client errors (4xx)
              if (response.status >= 400 && response.status < 500) {
                throw Object.assign(
                  new Error(errorData.error || (t("responseError") as string)),
                  { noRetry: true }
                );
              }
              throw new Error(errorData.error || (t("responseError") as string));
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No stream available");

            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullContent += chunk;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId
                    ? { ...m, content: fullContent }
                    : m
                )
              );
            }

            // Save assistant message
            if (user) {
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                role: "assistant",
                content: fullContent,
                model: effectiveModel,
              });
            } else {
              addLocalMessage(threadId, {
                ...assistantMessage,
                content: fullContent,
              });
              incrementAnonUsage();
              setAnonUsageCount(getAnonUsageCount());
            }

            // Haptic feedback on successful completion
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(50);
            }

            break; // Success — exit retry loop

          } catch (retryErr) {
            // Always propagate abort and no-retry errors
            if ((retryErr as Error).name === "AbortError") throw retryErr;
            if ((retryErr as { noRetry?: boolean }).noRetry) throw retryErr;

            if (attempt < MAX_RETRIES) {
              // Show reconnecting state briefly
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId
                    ? { ...m, content: t("reconnecting") as string }
                    : m
                )
              );
              await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
              // Clear content to re-trigger thinking indicator
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, content: "" } : m
                )
              );
              continue;
            }
            throw retryErr; // Exhausted retries
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (assistantMessage) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage!.id
                ? {
                    ...m,
                    content:
                      m.content ||
                      (t("genericError") as string),
                  }
                : m
            )
          );
        }
      } finally {
        isStreamingRef.current = false;
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      user,
      profile,
      supabase,
      currentThread,
      selectedModel,
      createThread,
      renameThread,
      t,
    ]
  );

  const regenerateLastResponse = useCallback(async (modelId?: string) => {
    if (isStreamingRef.current) return;
    const currentMsgs = messagesRef.current;
    if (currentMsgs.length < 2) return;

    const lastUserMsg = [...currentMsgs]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // If switching model, update selectedModel for UI
    if (modelId) {
      setSelectedModel(modelId);
    }

    // Remove last assistant message
    const lastAssistantIdx = currentMsgs.length - 1;
    if (currentMsgs[lastAssistantIdx]?.role === "assistant") {
      if (user) {
        await supabase
          .from("chat_messages")
          .delete()
          .eq("id", currentMsgs[lastAssistantIdx].id);
      }
      setMessages((prev) => prev.slice(0, -1));
    }

    // Remove last user message too so sendMessage re-adds it
    if (user) {
      await supabase
        .from("chat_messages")
        .delete()
        .eq("id", lastUserMsg.id);
    }
    setMessages((prev) => prev.filter((m) => m.id !== lastUserMsg.id));

    await sendMessage(lastUserMsg.content, undefined, modelId);
  }, [user, supabase, sendMessage]);

  const clearCurrentThread = useCallback(() => {
    setCurrentThread(null);
    setMessages([]);
  }, []);

  const deleteAllThreads = useCallback(async () => {
    if (user) {
      // Delete all messages then all threads for this user
      const threadIds = threads.map((t) => t.id);
      if (threadIds.length > 0) {
        await supabase.from("chat_messages").delete().in("thread_id", threadIds);
        await supabase.from("chat_threads").delete().eq("user_id", user.id);
      }
    } else {
      // Clear localStorage
      for (const thread of threads) {
        deleteLocalThread(thread.id);
      }
    }
    setThreads([]);
    setCurrentThread(null);
    setMessages([]);
  }, [user, supabase, threads]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        currentThread,
        messages,
        isStreaming,
        selectedModel,
        anonUsageCount,
        anonDailyLimit: ANON_DAILY_LIMIT,
        setSelectedModel,
        loadThreads,
        createThread,
        selectThread,
        deleteThread,
        renameThread,
        sendMessage,
        regenerateLastResponse,
        clearCurrentThread,
        deleteAllThreads,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
