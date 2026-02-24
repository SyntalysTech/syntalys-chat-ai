"use client";

import { useState } from "react";
import { cn, truncate, groupChatsByDate } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { Tooltip } from "@/components/ui/tooltip";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
  LogIn,
  Compass,
  BookOpen,
  HelpCircle,
  Scale,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Search,
  X,
  Palette,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowRightToLine,
  ArrowLeftFromLine,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenExplore: () => void;
  onOpenDocumentation: () => void;
  onOpenSupport: () => void;
  onOpenLegal: () => void;
  activeView: "chat" | "humanizer" | "images";
  onViewChange: (view: "chat" | "humanizer" | "images") => void;
  isDark: boolean;
}

/* Wrapper that shows tooltip only when collapsed */
function CollapsedTooltip({
  collapsed,
  label,
  children,
}: {
  collapsed: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (collapsed) {
    return (
      <Tooltip content={label} side="right">
        {children}
      </Tooltip>
    );
  }
  return <>{children}</>;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  onOpenSettings,
  onOpenAuth,
  onOpenExplore,
  onOpenDocumentation,
  onOpenSupport,
  onOpenLegal,
  activeView,
  onViewChange,
  isDark,
}: SidebarProps) {
  const { user, profile, signOut } = useAuth();
  const {
    threads,
    currentThread,
    selectThread,
    deleteThread,
    renameThread,
    clearCurrentThread,
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveThreadToFolder,
  } = useChat();
  const { t } = useI18n();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<string | null>(null);

  const handleNewChat = () => {
    clearCurrentThread();
    onViewChange("chat");
    onMobileClose();
  };

  const handleSelectThread = async (id: string) => {
    await selectThread(id);
    onViewChange("chat");
    onMobileClose();
  };

  const handleStartRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleFinishRename = async () => {
    if (editingId && editTitle.trim()) {
      await renameThread(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleNewFolder = async () => {
    const id = await createFolder(t("newFolder"));
    if (id) setExpandedFolders((prev) => new Set(prev).add(id));
  };

  const handleStartFolderRename = (id: string, name: string) => {
    setEditingFolderId(id);
    setEditFolderName(name);
  };

  const handleFinishFolderRename = async () => {
    if (editingFolderId && editFolderName.trim()) {
      await renameFolder(editingFolderId, editFolderName.trim());
    }
    setEditingFolderId(null);
    setEditFolderName("");
  };

  const handleConfirmDeleteFolder = async () => {
    if (deleteFolderConfirmId) {
      await deleteFolder(deleteFolderConfirmId);
      setDeleteFolderConfirmId(null);
    }
  };

  const filteredThreads = searchQuery.trim()
    ? threads.filter((th) =>
        th.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : threads;

  const grouped = groupChatsByDate(filteredThreads);

  const logoSrc = isDark
    ? "/logos/logo-horizontal-white.png"
    : "/logos/logo-horizontal-blue.png";
  const iconSrc = isDark
    ? "/logos/logo-icono-solo-white.png"
    : "/logos/logo-icono-solo-blue.png";

  // Common transition class for text that fades in/out
  const textTransition = cn(
    "whitespace-nowrap overflow-hidden transition-all duration-300",
    collapsed
      ? "w-0 opacity-0 ml-0"
      : "w-auto opacity-100 ml-2.5"
  );

  // Display name: prefer profile name, fallback to email
  const displayName = profile?.display_name || user?.email || "";
  const avatarInitial =
    (profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  /* ── Reusable thread item renderer ── */
  const renderThreadItem = (thread: typeof threads[number]) => (
    <div
      key={thread.id}
      className={cn(
        "group relative flex items-center rounded-lg transition-colors",
        currentThread?.id === thread.id && activeView === "chat"
          ? "bg-accent text-accent-foreground"
          : "hover:bg-sidebar-hover text-sidebar-foreground"
      )}
    >
      {editingId === thread.id ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleFinishRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleFinishRename();
            if (e.key === "Escape") { setEditingId(null); setEditTitle(""); }
          }}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          autoFocus
        />
      ) : (
        <button
          className="flex-1 truncate px-3 py-2 text-left text-sm"
          onClick={() => handleSelectThread(thread.id)}
        >
          {truncate(thread.title, 30)}
        </button>
      )}
      {editingId !== thread.id && (
        <div className="absolute right-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Dropdown
            trigger={
              <button className="rounded-lg p-1.5 hover:bg-accent active:bg-accent/80">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            }
            align="right"
          >
            <DropdownItem onClick={() => handleStartRename(thread.id, thread.title)}>
              <Pencil className="h-3.5 w-3.5" /> {t("rename")}
            </DropdownItem>
            {/* Move to folder */}
            {user && folders.length > 0 && (
              <>
                <div className="h-px bg-border/50 mx-1 my-0.5" />
                {thread.folder_id ? (
                  <DropdownItem onClick={() => moveThreadToFolder(thread.id, null)}>
                    <ArrowLeftFromLine className="h-3.5 w-3.5" /> {t("removeFromFolder")}
                  </DropdownItem>
                ) : null}
                {folders
                  .filter((f) => f.id !== thread.folder_id)
                  .map((f) => (
                    <DropdownItem key={f.id} onClick={() => moveThreadToFolder(thread.id, f.id)}>
                      <ArrowRightToLine className="h-3.5 w-3.5" /> {f.name}
                    </DropdownItem>
                  ))}
              </>
            )}
            <div className="h-px bg-border/50 mx-1 my-0.5" />
            <DropdownItem destructive onClick={() => setDeleteConfirmId(thread.id)}>
              <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
            </DropdownItem>
          </Dropdown>
        </div>
      )}
    </div>
  );

  /* User menu dropdown content (GPT-style) */
  const userMenuContent = (
    <>
      {/* User header (non-closable) */}
      {user && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-syntalys-blue text-white text-xs font-semibold flex-shrink-0">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-popover-foreground">{displayName}</p>
              {user.email && displayName !== user.email && (
                <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <div className="h-px bg-border/50 mx-1 my-0.5" />
        </>
      )}

      {/* Core actions */}
      <DropdownItem onClick={() => { onOpenSettings(); onMobileClose(); }}>
        <Settings className="h-3.5 w-3.5" /> {t("settings")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenExplore(); onMobileClose(); }}>
        <Compass className="h-3.5 w-3.5" /> {t("explore")}
      </DropdownItem>

      <div className="h-px bg-border/50 mx-1 my-0.5" />

      {/* Help & info */}
      <DropdownItem onClick={() => { onOpenDocumentation(); onMobileClose(); }}>
        <BookOpen className="h-3.5 w-3.5" /> {t("documentation")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenSupport(); onMobileClose(); }}>
        <HelpCircle className="h-3.5 w-3.5" /> {t("support")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenLegal(); onMobileClose(); }}>
        <Scale className="h-3.5 w-3.5" /> {t("legal")}
      </DropdownItem>

      {/* Sign out */}
      {user && (
        <>
          <div className="h-px bg-border/50 mx-1 my-0.5" />
          <DropdownItem onClick={() => { signOut(); onMobileClose(); }}>
            <LogOut className="h-3.5 w-3.5" /> {t("signOut")}
          </DropdownItem>
        </>
      )}
    </>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* ─── Header: Logo + Toggle ─── */}
      <div className="flex items-center justify-between border-b border-border/50 px-2 py-3 min-h-[56px]">
        <div className="flex items-center min-w-0 flex-1">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 flex-shrink-0",
              collapsed ? "w-0 opacity-0" : "w-[130px] opacity-100 ml-1"
            )}
          >
            <Image
              src={logoSrc}
              alt="SYNTALYS"
              width={130}
              height={28}
              className="h-7 w-auto"
            />
          </div>
          <div
            className={cn(
              "flex-shrink-0 transition-all duration-300",
              collapsed ? "w-9 opacity-100 mx-auto" : "w-0 opacity-0 overflow-hidden"
            )}
          >
            <button
              onClick={onToggle}
              className="group/logo flex h-9 w-9 items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors relative"
              aria-label={t("expandSidebar")}
            >
              <PanelLeftOpen
                className="h-[18px] w-[18px] text-muted-foreground absolute inset-0 m-auto transition-opacity duration-200 group-hover/logo:opacity-0"
              />
              <Image
                src={iconSrc}
                alt="SYNTALYS"
                width={22}
                height={22}
                className="absolute inset-0 m-auto object-contain opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100"
              />
            </button>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground transition-all duration-300 flex-shrink-0",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-8"
          )}
          aria-label={t("collapseSidebar")}
        >
          <PanelLeftClose className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Overflow-hidden wrapper for collapsible content (keeps footer free for dropdowns) */}
      <div className="flex-1 flex flex-col overflow-hidden">

      {/* ─── Humanizer Button ─── */}
      <div className="px-2 pt-2 pb-0">
        <CollapsedTooltip collapsed={collapsed} label={t("humanizer")}>
          <button
            onClick={() => {
              onViewChange("humanizer");
              onMobileClose();
            }}
            className={cn(
              "flex items-center rounded-lg transition-all duration-300",
              activeView === "humanizer"
                ? "bg-syntalys-gold/10 text-syntalys-gold"
                : "text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground",
              collapsed
                ? "h-9 w-9 justify-center mx-auto p-0"
                : "w-full px-3 py-2"
            )}
          >
            <Sparkles className="h-[18px] w-[18px] flex-shrink-0" />
            <span className={cn("text-sm font-medium", textTransition)}>
              {t("humanizer")}
            </span>
          </button>
        </CollapsedTooltip>
      </div>

      {/* ─── Images Button ─── */}
      <div className="px-2 pt-0.5 pb-0">
        <CollapsedTooltip collapsed={collapsed} label={t("images" as TranslationKey)}>
          <button
            onClick={() => {
              onViewChange("images");
              onMobileClose();
            }}
            className={cn(
              "flex items-center rounded-lg transition-all duration-300",
              activeView === "images"
                ? "bg-syntalys-blue/10 text-syntalys-blue"
                : "text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground",
              collapsed
                ? "h-9 w-9 justify-center mx-auto p-0"
                : "w-full px-3 py-2"
            )}
          >
            <Palette className="h-[18px] w-[18px] flex-shrink-0" />
            <span className={cn("text-sm font-medium", textTransition)}>
              {t("images" as TranslationKey)}
            </span>
          </button>
        </CollapsedTooltip>
      </div>

      {/* ─── New Chat Button ─── */}
      <div className="px-2 py-2">
        <CollapsedTooltip collapsed={collapsed} label={t("newChat")}>
          <button
            onClick={handleNewChat}
            className={cn(
              "flex items-center rounded-lg border border-border/60 transition-all duration-300",
              "hover:border-syntalys-gold/40 hover:bg-sidebar-hover",
              collapsed
                ? "h-9 w-9 justify-center mx-auto p-0"
                : "w-full px-3 py-2"
            )}
          >
            <Plus className="h-[18px] w-[18px] flex-shrink-0 text-sidebar-foreground" />
            <span
              className={cn(
                "text-sm font-medium text-sidebar-foreground",
                textTransition
              )}
            >
              {t("newChat")}
            </span>
          </button>
        </CollapsedTooltip>
      </div>

      {/* ─── Search ─── */}
      {threads.length > 0 && !collapsed && (
        <div className="px-2 pb-1">
          {collapsed ? (
            <CollapsedTooltip collapsed={collapsed} label={t("searchChats")}>
              <button
                onClick={onToggle}
                className="flex h-9 w-9 items-center justify-center rounded-lg mx-auto text-muted-foreground hover:bg-sidebar-hover transition-colors"
                aria-label={t("searchChats")}
              >
                <Search className="h-4 w-4" />
              </button>
            </CollapsedTooltip>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchChats")}
                className="w-full rounded-lg bg-sidebar-hover/60 border border-transparent focus:border-syntalys-blue/30 pl-8 pr-8 py-1.5 text-sm text-sidebar-foreground placeholder:text-muted-foreground outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-accent transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Chat List (hidden when collapsed) ─── */}
      <div className={cn("flex-1 overflow-y-auto scrollbar-thin px-2", collapsed && "hidden")}>
        {threads.length > 0 && (
          <>
            {/* Expanded view */}
            <div
              className={cn(
                "transition-opacity duration-300",
                collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}
            >
              {filteredThreads.length === 0 && searchQuery.trim() && (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                  {t("noSearchResults")}
                </p>
              )}

              {/* ── Folders ── */}
              {!searchQuery.trim() && folders.length > 0 && (
                <div className="mb-2">
                  {folders.map((folder) => {
                    const folderThreads = filteredThreads.filter((t) => t.folder_id === folder.id);
                    const isOpen = expandedFolders.has(folder.id);
                    return (
                      <div key={folder.id} className="mb-0.5">
                        {/* Folder header */}
                        <div className="group/folder relative flex items-center rounded-lg hover:bg-sidebar-hover transition-colors">
                          <button
                            className="flex flex-1 items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-muted-foreground min-w-0"
                            onClick={() => toggleFolder(folder.id)}
                          >
                            <ChevronRight className={cn("h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
                            {isOpen ? <FolderOpen className="h-4 w-4 flex-shrink-0" /> : <Folder className="h-4 w-4 flex-shrink-0" />}
                            {editingFolderId === folder.id ? (
                              <input
                                value={editFolderName}
                                onChange={(e) => setEditFolderName(e.target.value)}
                                onBlur={handleFinishFolderRename}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleFinishFolderRename();
                                  if (e.key === "Escape") { setEditingFolderId(null); setEditFolderName(""); }
                                }}
                                className="flex-1 bg-transparent text-sm text-sidebar-foreground outline-none min-w-0"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="truncate">{folder.name}</span>
                            )}
                            <span className="text-xs text-muted-foreground/60 flex-shrink-0">{folderThreads.length}</span>
                          </button>
                          {editingFolderId !== folder.id && (
                            <div className="absolute right-1 sm:opacity-0 sm:group-hover/folder:opacity-100 transition-opacity">
                              <Dropdown
                                trigger={
                                  <button className="rounded-lg p-1 hover:bg-accent active:bg-accent/80">
                                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                }
                                align="right"
                              >
                                <DropdownItem onClick={() => handleStartFolderRename(folder.id, folder.name)}>
                                  <Pencil className="h-3.5 w-3.5" /> {t("renameFolder")}
                                </DropdownItem>
                                <DropdownItem destructive onClick={() => setDeleteFolderConfirmId(folder.id)}>
                                  <Trash2 className="h-3.5 w-3.5" /> {t("deleteFolder")}
                                </DropdownItem>
                              </Dropdown>
                            </div>
                          )}
                        </div>
                        {/* Folder threads */}
                        {isOpen && (
                          <div className="ml-3 border-l border-border/40 pl-1">
                            {folderThreads.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-muted-foreground/50 italic">{t("folderEmpty" as TranslationKey)}</p>
                            ) : (
                              folderThreads.map((thread) => renderThreadItem(thread))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── New Folder button (inline, subtle) ── */}
              {!searchQuery.trim() && !collapsed && user && (
                <button
                  onClick={handleNewFolder}
                  className="flex items-center gap-1.5 px-2 py-1 mb-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors w-full"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  {t("newFolder")}
                </button>
              )}

              {/* ── Ungrouped threads (no folder), grouped by date ── */}
              {(() => {
                const ungrouped = searchQuery.trim()
                  ? filteredThreads
                  : filteredThreads.filter((t) => !t.folder_id);
                const ungroupedGrouped = groupChatsByDate(ungrouped);
                return ungroupedGrouped.map((group) => (
                  <div key={group.label} className="mb-3">
                    <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(group.label as TranslationKey) as string}
                    </div>
                    {group.chats.map((thread) => renderThreadItem(thread))}
                  </div>
                ));
              })()}
            </div>

            {/* Collapsed view: icon-only */}
            <div
              className={cn(
                "flex flex-col items-center gap-0.5 pt-1 transition-opacity duration-300",
                collapsed ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
              )}
            >
              {filteredThreads.slice(0, 12).map((thread) => (
                <CollapsedTooltip
                  key={thread.id}
                  collapsed={collapsed}
                  label={thread.title}
                >
                  <button
                    onClick={() => handleSelectThread(thread.id)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors mx-auto",
                      currentThread?.id === thread.id && activeView === "chat"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </CollapsedTooltip>
              ))}
            </div>
          </>
        )}
      </div>

      </div>{/* end overflow-hidden wrapper */}

      {/* ─── Footer: User section (GPT-style menu) ─── */}
      <div className="border-t border-border/50 p-2">
        {user ? (
          /* ── Logged in: entire row is the dropdown trigger ── */
          <Dropdown
            trigger={
              collapsed ? (
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg mx-auto hover:bg-sidebar-hover transition-colors"
                  aria-label={displayName}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-syntalys-blue text-white text-xs font-semibold">
                    {avatarInitial}
                  </div>
                </button>
              ) : (
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-hover transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-syntalys-blue text-white text-xs font-semibold flex-shrink-0">
                    {avatarInitial}
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground text-left">
                    {displayName}
                  </span>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              )
            }
            align="left"
            direction="up"
            className="w-[240px]"
          >
            {userMenuContent}
          </Dropdown>
        ) : (
          /* ── Anonymous: settings menu + login button ── */
          <div
            className={cn(
              "flex transition-all duration-300",
              collapsed ? "flex-col items-center gap-0.5" : "flex-col gap-2"
            )}
          >
            {/* Settings dropdown */}
            <Dropdown
              trigger={
                collapsed ? (
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg mx-auto text-muted-foreground hover:bg-sidebar-hover transition-colors"
                    aria-label={t("settings")}
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-hover transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm text-muted-foreground text-left">
                      {t("anonymousMode")}
                    </span>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                )
              }
              align="left"
              direction="up"
              className="w-[240px]"
            >
              {userMenuContent}
            </Dropdown>

            {/* Login button */}
            <CollapsedTooltip collapsed={collapsed} label={t("signIn")}>
              <button
                onClick={onOpenAuth}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-300",
                  collapsed
                    ? "h-9 w-9 justify-center mx-auto text-syntalys-blue hover:bg-sidebar-hover"
                    : "flex-1 justify-center gap-2 bg-primary px-3 py-2 text-primary-foreground hover:bg-syntalys-blue-light"
                )}
              >
                <LogIn className="h-4 w-4 flex-shrink-0" />
                <span
                  className={cn(
                    "text-sm font-medium",
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-1"
                  )}
                >
                  {t("signIn")}
                </span>
              </button>
            </CollapsedTooltip>
          </div>
        )}
      </div>
    </div>
  );

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteThread(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 border-r border-border/50 h-full",
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "w-[56px]" : "w-[260px]"
        )}
      >
        {sidebarInner}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transition-transform duration-300 ease-in-out lg:hidden",
          "pt-safe pb-safe",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "var(--sidebar)" }}
      >
        {sidebarInner}
      </aside>

      {/* Delete thread confirmation */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title={t("deleteConversation")}
      >
        <p className="text-sm text-muted-foreground mb-6">
          {t("deleteConfirmMessage")}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirmDelete}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
          >
            {t("delete")}
          </button>
        </div>
      </Modal>

      {/* Delete folder confirmation */}
      <Modal
        open={deleteFolderConfirmId !== null}
        onClose={() => setDeleteFolderConfirmId(null)}
        title={t("deleteFolder")}
      >
        <p className="text-sm text-muted-foreground mb-6">
          {t("deleteFolderConfirm")}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteFolderConfirmId(null)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirmDeleteFolder}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
          >
            {t("delete")}
          </button>
        </div>
      </Modal>
    </>
  );
}
