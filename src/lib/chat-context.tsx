"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
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
import {
  getLocalMemories,
  saveLocalMemory,
  parseMemoryTags,
  buildMemoryContext,
} from "./memory-store";
import { DEFAULT_MODEL_ID, getModelByIdOrDefault } from "./models";
import type { ChatThread, ChatMessage, StreamMessage, FileAttachment, UserMemory } from "./types";
import { generateId, getAnonId } from "./utils";

/* ── Tree helper functions ── */

/** Walk the message tree following active-branch choices, returning a linear visible path. */
function computeVisiblePath(
  allMsgs: ChatMessage[],
  branches: Record<string, string>
): ChatMessage[] {
  if (allMsgs.length === 0) return [];

  const childrenOf = new Map<string, ChatMessage[]>();
  for (const msg of allMsgs) {
    const key = msg.parent_id ?? "root";
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(msg);
  }
  for (const children of childrenOf.values()) {
    children.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  const path: ChatMessage[] = [];
  let currentKey = "root";
  while (true) {
    const children = childrenOf.get(currentKey);
    if (!children || children.length === 0) break;
    const activeId = branches[currentKey];
    const active = activeId
      ? children.find((c) => c.id === activeId) || children[children.length - 1]
      : children[children.length - 1];
    path.push(active);
    currentKey = active.id;
  }
  return path;
}

/** Backtrack from a message to the root, returning the path in chronological order. */
function getPathToMessage(allMsgs: ChatMessage[], targetId: string): ChatMessage[] {
  const byId = new Map(allMsgs.map((m) => [m.id, m]));
  const path: ChatMessage[] = [];
  let current = byId.get(targetId);
  while (current) {
    path.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return path;
}

/** Assign sequential parent_ids to legacy messages that don't have them. */
function ensureParentIds(msgs: ChatMessage[]): ChatMessage[] {
  if (msgs.length === 0) return msgs;
  const hasAnyParent = msgs.some((m) => m.parent_id != null);
  if (hasAnyParent) {
    // Backfill only messages that still have null parent_id (legacy rows)
    return msgs.map((m, i) => {
      if (m.parent_id != null) return m;
      if (i === 0) return { ...m, parent_id: null };
      return { ...m, parent_id: msgs[i - 1].id };
    });
  }
  // Fully legacy thread — build a linear chain
  return msgs.map((m, i) => ({
    ...m,
    parent_id: i === 0 ? null : msgs[i - 1].id,
  }));
}

/* ── Context type ── */

interface ChatContextType {
  threads: ChatThread[];
  currentThread: ChatThread | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  isImageGenerating: boolean;
  selectedModel: string;
  anonUsageCount: number;
  anonDailyLimit: number;
  setSelectedModel: (model: string) => void;
  loadThreads: () => Promise<void>;
  createThread: () => Promise<string>;
  selectThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
  sendMessage: (content: string, attachments?: FileAttachment[], modelOverride?: string, imageGen?: boolean) => Promise<boolean>;
  regenerateLastResponse: (modelId?: string) => Promise<void>;
  clearCurrentThread: () => void;
  deleteAllThreads: () => Promise<void>;
  // Branching
  getBranchInfo: (messageId: string) => { index: number; total: number } | null;
  navigateBranch: (messageId: string, direction: "prev" | "next") => void;
  editAndResend: (messageId: string, newContent: string, attachments?: FileAttachment[]) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const ANON_DAILY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_ANON_DAILY_LIMIT || "20",
  10
);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), []);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [activeBranches, setActiveBranches] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [anonUsageCount, setAnonUsageCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);
  const streamStartedAtRef = useRef<number>(0);
  const allMessagesRef = useRef<ChatMessage[]>([]);
  allMessagesRef.current = allMessages;
  const memoriesRef = useRef<UserMemory[]>([]);

  // Computed visible path through the message tree
  const messages = useMemo(
    () => computeVisiblePath(allMessages, activeBranches),
    [allMessages, activeBranches]
  );
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // Load memories on mount / user change
  useEffect(() => {
    async function loadMemories() {
      if (user) {
        try {
          const res = await fetch("/api/memory");
          if (res.ok) {
            const { memories } = await res.json();
            memoriesRef.current = memories || [];
          }
        } catch {
          // Silently fail — memories are best-effort
        }
      } else {
        memoriesRef.current = getLocalMemories();
      }
    }
    loadMemories();
  }, [user]);

  // Auto-recover from stale streaming lock
  useEffect(() => {
    const STALE_THRESHOLD = 45_000;

    const recoverIfStale = () => {
      if (
        isStreamingRef.current &&
        Date.now() - streamStartedAtRef.current > STALE_THRESHOLD
      ) {
        console.warn("[chat] Recovering from stale streaming lock");
        abortRef.current?.abort();
        abortRef.current = null;
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") recoverIfStale();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = setInterval(recoverIfStale, 10_000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from("chat_threads")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) {
          console.error("Failed to load threads:", error.message);
          return;
        }
        if (data) setThreads(data as ChatThread[]);
      } else {
        setThreads(getLocalThreads());
        setAnonUsageCount(getAnonUsageCount());
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    }
  }, [user, supabase]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

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
        if (data) {
          const loaded = ensureParentIds(data as ChatMessage[]);
          setAllMessages(loaded);
        }
      } else {
        const loaded = ensureParentIds(getLocalMessages(threadId));
        setAllMessages(loaded);
      }
      setActiveBranches({});
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
        setAllMessages([]);
        setActiveBranches({});
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
    async (
      content: string,
      attachments?: FileAttachment[],
      modelOverride?: string,
      imageGen?: boolean,
      _branchOpts?: { userMsgParentId?: string | null; regenerateUserMsgId?: string }
    ): Promise<boolean> => {
      const isRegenerate = !!_branchOpts?.regenerateUserMsgId;
      const isFork = _branchOpts?.userMsgParentId !== undefined;

      // Self-heal stale streaming lock
      if (isStreamingRef.current) {
        const elapsed = Date.now() - streamStartedAtRef.current;
        if (elapsed > 30_000) {
          console.warn("[chat] Force-clearing stale streaming lock after", elapsed, "ms");
          abortRef.current?.abort();
          abortRef.current = null;
          isStreamingRef.current = false;
        } else {
          return false;
        }
      }

      // Check anonymous limit
      if (!user) {
        const usage = getAnonUsageCount();
        if (usage >= ANON_DAILY_LIMIT) return false;
      }

      const previousMessages = messagesRef.current;

      isStreamingRef.current = true;
      streamStartedAtRef.current = Date.now();
      setIsStreaming(true);
      if (imageGen) setIsImageGenerating(true);

      const effectiveModel = modelOverride || selectedModel;
      let assistantMessage: ChatMessage | null = null;
      let isNewThread = false;

      try {
        let threadId = currentThread?.id;

        if (!threadId) {
          if (isRegenerate) return false;
          isNewThread = true;
          try {
            threadId = await createThread();
          } catch (e) {
            console.error("[chat] Thread creation failed:", e);
            return false;
          }
        }

        // ── Phase 2: Build user message + history based on mode ──
        let historyForApi: StreamMessage[];
        let imageUrls: string[] = [];

        if (isRegenerate) {
          // Regenerate mode: skip user message, create assistant as sibling
          const regenerateParentId = _branchOpts!.regenerateUserMsgId!;
          const pathToUser = getPathToMessage(allMessagesRef.current, regenerateParentId);
          historyForApi = pathToUser.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

          assistantMessage = {
            id: generateId(),
            thread_id: threadId,
            role: "assistant",
            content: "",
            model: effectiveModel,
            parent_id: regenerateParentId,
            created_at: new Date().toISOString(),
          };

          setAllMessages((prev) => [...prev, assistantMessage!]);
          setActiveBranches((prev) => ({ ...prev, [regenerateParentId]: assistantMessage!.id }));
        } else {
          // Normal send or fork
          let userParentId: string | null;
          if (isFork) {
            userParentId = _branchOpts!.userMsgParentId!;
          } else {
            userParentId = previousMessages.length > 0
              ? previousMessages[previousMessages.length - 1].id
              : null;
          }

          const userMessage: ChatMessage = {
            id: generateId(),
            thread_id: threadId,
            role: "user",
            content,
            model: null,
            parent_id: userParentId,
            created_at: new Date().toISOString(),
            attachments: attachments?.map(({ name, type, size }) => ({ name, type, size })),
          };

          // Save user message
          if (user) {
            const { error: insertErr } = await supabase.from("chat_messages").insert({
              id: userMessage.id,
              thread_id: threadId,
              role: "user",
              content,
              parent_id: userParentId,
            });
            if (insertErr) console.error("[chat] User message insert failed:", insertErr.message);
          } else {
            addLocalMessage(threadId, userMessage);
          }

          setAllMessages((prev) => isNewThread ? [userMessage] : [...prev, userMessage]);
          setActiveBranches((prev) => ({
            ...prev,
            [userParentId ?? "root"]: userMessage.id,
          }));

          // Update title from first user message
          if (isNewThread) {
            const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
            renameThread(threadId, title).catch(() => {});
          } else if (!isFork) {
            const prevUserCount = previousMessages.filter((m) => m.role === "user").length;
            if (prevUserCount === 0) {
              const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
              renameThread(threadId, title).catch(() => {});
            }
          }

          // Build image URLs and document context from attachments
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

          const lastContent = docContext
            ? `${content}\n\n[Attached documents]${docContext}`
            : content;

          // Build history
          if (isFork && !isNewThread) {
            const parentPath = userParentId
              ? getPathToMessage(allMessagesRef.current, userParentId)
              : [];
            historyForApi = [
              ...parentPath.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
              { role: "user" as const, content: lastContent },
            ];
          } else if (isNewThread) {
            historyForApi = [{ role: "user" as const, content: lastContent }];
          } else {
            historyForApi = [
              ...previousMessages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
              { role: "user" as const, content: lastContent },
            ];
          }

          // Create assistant message
          assistantMessage = {
            id: generateId(),
            thread_id: threadId,
            role: "assistant",
            content: "",
            model: effectiveModel,
            parent_id: userMessage.id,
            created_at: new Date().toISOString(),
          };

          setAllMessages((prev) => [...prev, assistantMessage!]);
          setActiveBranches((prev) => ({ ...prev, [userMessage.id]: assistantMessage!.id }));
        }

        // ── Phase 3: Stream response (common for all modes) ──
        const MAX_RETRIES = 2;
        const RETRY_DELAYS = [1000, 3000];
        const msgId = assistantMessage!.id;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const abortController = new AbortController();
            abortRef.current = abortController;
            const requestTimeout = setTimeout(() => abortController.abort(), 90_000);
            const memCtx = buildMemoryContext(memoriesRef.current);

            let response: Response;
            try {
              response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: historyForApi,
                  model: effectiveModel,
                  threadId,
                  isAnonymous: !user,
                  userName: profile?.display_name || undefined,
                  imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                  memoryContext: memCtx || undefined,
                  imageGen: imageGen || undefined,
                }),
                signal: abortController.signal,
              });
            } catch (fetchErr) {
              clearTimeout(requestTimeout);
              throw fetchErr;
            }

            if (!response.ok) {
              clearTimeout(requestTimeout);
              const errorData = await response.json().catch(() => ({}));
              if (response.status === 429 && !user) {
                setAnonUsageCount(ANON_DAILY_LIMIT);
              }
              if (response.status >= 400 && response.status < 500) {
                throw Object.assign(
                  new Error(errorData.error || (t("responseError") as string)),
                  { noRetry: true }
                );
              }
              throw new Error(errorData.error || (t("responseError") as string));
            }

            const reader = response.body?.getReader();
            if (!reader) {
              clearTimeout(requestTimeout);
              throw new Error("No stream available");
            }

            const decoder = new TextDecoder();
            let fullContent = "";

            let chunkTimer: ReturnType<typeof setTimeout>;
            const resetChunkTimer = () => {
              clearTimeout(chunkTimer);
              chunkTimer = setTimeout(() => abortController.abort(), 30_000);
            };

            try {
              resetChunkTimer();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                resetChunkTimer();
                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;

                setAllMessages((prev) =>
                  prev.map((m) =>
                    m.id === msgId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } finally {
              clearTimeout(chunkTimer!);
              clearTimeout(requestTimeout);
            }

            // Save assistant message
            if (user) {
              await supabase.from("chat_messages").insert({
                id: assistantMessage!.id,
                thread_id: threadId,
                role: "assistant",
                content: fullContent,
                model: effectiveModel,
                parent_id: assistantMessage!.parent_id,
              });
            } else {
              addLocalMessage(threadId, {
                ...assistantMessage!,
                content: fullContent,
              });
              incrementAnonUsage();
              setAnonUsageCount(getAnonUsageCount());
            }

            // Haptic feedback
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(50);
            }

            // Extract and save memories
            const { memories: newMemories } = parseMemoryTags(fullContent);
            if (newMemories.length > 0) {
              if (user) {
                fetch("/api/memory", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ memories: newMemories }),
                }).then(async (res) => {
                  if (res.ok) {
                    const refreshRes = await fetch("/api/memory");
                    if (refreshRes.ok) {
                      const { memories } = await refreshRes.json();
                      memoriesRef.current = memories || [];
                    }
                  }
                }).catch(() => {});
              } else {
                for (const mem of newMemories) {
                  saveLocalMemory(mem);
                }
                memoriesRef.current = getLocalMemories();
              }
            }

            break; // Success — exit retry loop

          } catch (retryErr) {
            if ((retryErr as Error).name === "AbortError") throw retryErr;
            if ((retryErr as { noRetry?: boolean }).noRetry) throw retryErr;

            if (attempt < MAX_RETRIES) {
              setAllMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId
                    ? { ...m, content: t("reconnecting") as string }
                    : m
                )
              );
              await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
              setAllMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, content: "" } : m
                )
              );
              continue;
            }
            throw retryErr;
          }
        }
      } catch (err) {
        const errName = (err as Error).name;
        const errMsg = (err as Error).message;
        console.error("[chat] sendMessage error:", errName, errMsg);

        if (errName === "AbortError") {
          const assistantContent = assistantMessage
            ? allMessagesRef.current.find((m) => m.id === assistantMessage!.id)?.content
            : "";
          if (!assistantContent) {
            if (assistantMessage) {
              setAllMessages((prev) => prev.filter((m) => m.id !== assistantMessage!.id));
            }
            return false;
          }
          return true;
        }

        if (assistantMessage) {
          setAllMessages((prev) =>
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
        } else {
          return false;
        }
      } finally {
        isStreamingRef.current = false;
        setIsStreaming(false);
        setIsImageGenerating(false);
        abortRef.current = null;
      }
      return true;
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
    const visibleMsgs = messagesRef.current;
    if (visibleMsgs.length < 2) return;

    const lastUserMsg = [...visibleMsgs]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMsg) return;

    if (modelId) {
      setSelectedModel(modelId);
    }

    // Create a new assistant response as sibling (don't delete the old one)
    await sendMessage(
      lastUserMsg.content,
      undefined,
      modelId,
      undefined,
      { regenerateUserMsgId: lastUserMsg.id }
    );
  }, [sendMessage]);

  /* ── Branching functions ── */

  const getBranchInfo = useCallback((messageId: string): { index: number; total: number } | null => {
    const msg = allMessages.find((m) => m.id === messageId);
    if (!msg) return null;
    const parentKey = msg.parent_id ?? "root";
    const siblings = allMessages
      .filter((m) => (m.parent_id ?? "root") === parentKey)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (siblings.length <= 1) return null;
    const idx = siblings.findIndex((s) => s.id === messageId);
    return { index: idx + 1, total: siblings.length };
  }, [allMessages]);

  const navigateBranch = useCallback((messageId: string, direction: "prev" | "next") => {
    const msg = allMessages.find((m) => m.id === messageId);
    if (!msg) return;
    const parentKey = msg.parent_id ?? "root";
    const siblings = allMessages
      .filter((m) => (m.parent_id ?? "root") === parentKey)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const currentIdx = siblings.findIndex((s) => s.id === messageId);
    const newIdx = direction === "prev" ? currentIdx - 1 : currentIdx + 1;
    if (newIdx < 0 || newIdx >= siblings.length) return;
    setActiveBranches((prev) => ({ ...prev, [parentKey]: siblings[newIdx].id }));
  }, [allMessages]);

  const editAndResend = useCallback(async (
    messageId: string,
    newContent: string,
    attachments?: FileAttachment[]
  ): Promise<boolean> => {
    const original = allMessagesRef.current.find((m) => m.id === messageId);
    if (!original || original.role !== "user") return false;
    return sendMessage(newContent, attachments, undefined, undefined, {
      userMsgParentId: original.parent_id,
    });
  }, [sendMessage]);

  const clearCurrentThread = useCallback(() => {
    setCurrentThread(null);
    setAllMessages([]);
    setActiveBranches({});
  }, []);

  const deleteAllThreads = useCallback(async () => {
    if (user) {
      const threadIds = threads.map((t) => t.id);
      if (threadIds.length > 0) {
        await supabase.from("chat_messages").delete().in("thread_id", threadIds);
        await supabase.from("chat_threads").delete().eq("user_id", user.id);
      }
    } else {
      for (const thread of threads) {
        deleteLocalThread(thread.id);
      }
    }
    setThreads([]);
    setCurrentThread(null);
    setAllMessages([]);
    setActiveBranches({});
  }, [user, supabase, threads]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        currentThread,
        messages,
        isStreaming,
        isImageGenerating,
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
        getBranchInfo,
        navigateBranch,
        editAndResend,
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
