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
  activeView: "chat" | "humanizer";
  onViewChange: (view: "chat" | "humanizer") => void;
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
  } = useChat();
  const { t } = useI18n();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  /* Settings + info dropdown items (shared between logged-in and anon) */
  const settingsDropdownItems = (
    <>
      <DropdownItem onClick={() => { onOpenSettings(); onMobileClose(); }}>
        <Settings className="h-3.5 w-3.5" /> {t("settings")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenExplore(); onMobileClose(); }}>
        <Compass className="h-3.5 w-3.5" /> {t("explore")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenDocumentation(); onMobileClose(); }}>
        <BookOpen className="h-3.5 w-3.5" /> {t("documentation")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenSupport(); onMobileClose(); }}>
        <HelpCircle className="h-3.5 w-3.5" /> {t("support")}
      </DropdownItem>
      <DropdownItem onClick={() => { onOpenLegal(); onMobileClose(); }}>
        <Scale className="h-3.5 w-3.5" /> {t("legal")}
      </DropdownItem>
    </>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col bg-sidebar overflow-hidden">
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
      {threads.length > 0 && (
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

      {/* ─── Chat List ─── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {threads.length > 0 && (
          <>
            {/* Expanded view: grouped by date */}
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
              {grouped.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(group.label as TranslationKey) as string}
                  </div>
                  {group.chats.map((thread) => (
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
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditTitle("");
                            }
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
                            <DropdownItem
                              onClick={() =>
                                handleStartRename(thread.id, thread.title)
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" /> {t("rename")}
                            </DropdownItem>
                            <DropdownItem
                              destructive
                              onClick={() => setDeleteConfirmId(thread.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
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

      {/* ─── Footer: User section ─── */}
      <div className="border-t border-border/50 p-2">
        {user ? (
          /* ── Logged in ── */
          <div
            className={cn(
              "flex items-center transition-all duration-300",
              collapsed ? "flex-col gap-0.5" : "gap-2"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-syntalys-blue text-white text-xs font-semibold flex-shrink-0 transition-all duration-300",
                collapsed
                  ? "h-0 w-0 opacity-0 overflow-hidden"
                  : "h-8 w-8 opacity-100"
              )}
            >
              {avatarInitial}
            </div>
            {/* Name / Email */}
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-all duration-300",
                collapsed ? "w-0 h-0 opacity-0" : "flex-1 opacity-100"
              )}
            >
              <p className="truncate text-sm font-medium text-sidebar-foreground whitespace-nowrap">
                {displayName}
              </p>
            </div>
            {/* Settings dropdown */}
            <Dropdown
              trigger={
                <button
                  className={cn(
                    "flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover transition-all duration-300",
                    collapsed ? "h-9 w-9 mx-auto" : "h-8 w-8"
                  )}
                  aria-label={t("settings")}
                >
                  <Settings className="h-4 w-4" />
                </button>
              }
              align="right"
              direction="up"
            >
              {settingsDropdownItems}
            </Dropdown>
            {/* Logout */}
            <CollapsedTooltip collapsed={collapsed} label={t("signOut")}>
              <button
                onClick={signOut}
                className={cn(
                  "flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover transition-all duration-300",
                  collapsed ? "h-9 w-9 mx-auto" : "h-8 w-8"
                )}
                aria-label={t("signOut")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </CollapsedTooltip>
          </div>
        ) : (
          /* ── Anonymous ── */
          <div
            className={cn(
              "flex transition-all duration-300",
              collapsed ? "flex-col items-center gap-0.5" : "flex-col gap-2"
            )}
          >
            {/* Anon badge */}
            <CollapsedTooltip collapsed={collapsed} label={t("anonymousMode")}>
              <div
                className={cn(
                  "flex items-center rounded-lg transition-all duration-300",
                  collapsed
                    ? "h-9 w-9 justify-center mx-auto"
                    : "px-3 py-1.5 gap-2"
                )}
              >
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    textTransition
                  )}
                >
                  {t("anonymousMode")}
                </span>
              </div>
            </CollapsedTooltip>

            {/* Settings dropdown + Login row */}
            <div
              className={cn(
                "flex transition-all duration-300",
                collapsed ? "flex-col items-center gap-0.5" : "gap-2"
              )}
            >
              {/* Settings dropdown */}
              <Dropdown
                trigger={
                  <button
                    className={cn(
                      "flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover transition-all duration-300",
                      collapsed ? "h-9 w-9 mx-auto" : "h-9 w-9 flex-shrink-0"
                    )}
                    aria-label={t("settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                }
                align="right"
                direction="up"
              >
                {settingsDropdownItems}
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

      {/* Delete confirmation */}
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
    </>
  );
}
