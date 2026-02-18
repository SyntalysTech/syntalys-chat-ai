"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { MODELS, DEFAULT_MODEL_ID } from "@/lib/models";
import { LOCALES, type TranslationKey } from "@/lib/translations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  Monitor,
  Loader2,
  KeyRound,
  Trash2,
  AlertTriangle,
  Brain,
  X,
} from "lucide-react";
import type { UserMemory } from "@/lib/types";
import type { TranslationKey as TK } from "@/lib/translations";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export function SettingsModal({
  open,
  onClose,
  theme,
  onThemeChange,
}: SettingsModalProps) {
  const { user, profile, updateProfile, updatePassword, deleteAccount } =
    useAuth();
  const { setSelectedModel, deleteAllThreads } = useChat();
  const { t, locale, setLocale } = useI18n();
  const [displayName, setDisplayName] = useState(
    profile?.display_name || ""
  );
  const [defaultModel, setDefaultModel] = useState(
    profile?.default_model || DEFAULT_MODEL_ID
  );
  const [saving, setSaving] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete all chats
  const [showDeleteChats, setShowDeleteChats] = useState(false);
  const [deletingChats, setDeletingChats] = useState(false);

  // Delete account
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Memory management
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setDefaultModel(profile.default_model || DEFAULT_MODEL_ID);
    }
  }, [profile]);

  // Load memories when modal opens
  useEffect(() => {
    if (open && user) {
      setLoadingMemories(true);
      fetch("/api/memory")
        .then((res) => res.json())
        .then(({ memories: mems }) => setMemories(mems || []))
        .catch(() => setMemories([]))
        .finally(() => setLoadingMemories(false));
    } else if (open && !user) {
      // Load from localStorage for anonymous users
      try {
        const raw = localStorage.getItem("syntalys_anon_memories");
        setMemories(raw ? JSON.parse(raw) : []);
      } catch {
        setMemories([]);
      }
    }
  }, [open, user]);

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setPasswordSuccess(false);
      setShowDeleteChats(false);
      setShowDeleteAccount(false);
      setDeleteConfirmText("");
      setMemories([]);
    }
  }, [open]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName || null,
        default_model: defaultModel,
        theme: theme as "light" | "dark" | "system",
        language: locale,
      });
      setSelectedModel(defaultModel);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError(t("passwordTooShort") as string);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsNoMatch") as string);
      return;
    }

    setSavingPassword(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAllChats = async () => {
    setDeletingChats(true);
    try {
      await deleteAllThreads();
      setShowDeleteChats(false);
    } finally {
      setDeletingChats(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (user) {
      await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId }),
      });
    } else {
      try {
        const raw = localStorage.getItem("syntalys_anon_memories");
        const mems = raw ? JSON.parse(raw) : [];
        const filtered = mems.filter((m: UserMemory) => m.id !== memoryId);
        localStorage.setItem("syntalys_anon_memories", JSON.stringify(filtered));
      } catch {}
    }
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  };

  const handleClearAllMemories = async () => {
    if (user) {
      await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
    } else {
      localStorage.removeItem("syntalys_anon_memories");
    }
    setMemories([]);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError("");
    try {
      const result = await deleteAccount();
      if (result.error) {
        setDeleteError(result.error);
        setDeletingAccount(false);
      } else {
        onClose();
        window.location.reload();
      }
    } catch {
      setDeleteError("Failed to delete account");
      setDeletingAccount(false);
    }
  };

  const themes = [
    { id: "light" as const, labelKey: "themeLight" as const, icon: Sun },
    { id: "dark" as const, labelKey: "themeDark" as const, icon: Moon },
    { id: "system" as const, labelKey: "themeSystem" as const, icon: Monitor },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t("settings") as string}>
      <div className="space-y-5 sm:space-y-6">
        {/* Language */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-card-foreground">
            {t("language")}
          </h3>
          <div className="flex gap-2">
            {LOCALES.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setLocale(loc.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border py-2.5 text-xs sm:text-sm font-medium transition-all",
                  locale === loc.id
                    ? "border-syntalys-blue bg-syntalys-blue/5 text-syntalys-blue"
                    : "border-border text-muted-foreground hover:border-border hover:bg-accent"
                )}
              >
                <span>{loc.flag}</span>
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-card-foreground">
            {t("theme")}
          </h3>
          <div className="flex gap-2">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => onThemeChange(th.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border py-2.5 text-xs sm:text-sm font-medium transition-all",
                  theme === th.id
                    ? "border-syntalys-blue bg-syntalys-blue/5 text-syntalys-blue"
                    : "border-border text-muted-foreground hover:border-border hover:bg-accent"
                )}
              >
                <th.icon className="h-4 w-4" />
                {t(th.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* User settings (only if logged in) */}
        {user && (
          <>
            <div>
              <label
                htmlFor="settingsName"
                className="mb-1.5 block text-sm font-medium text-card-foreground"
              >
                {t("name")}
              </label>
              <Input
                id="settingsName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("yourName") as string}
              />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-card-foreground">
                {t("defaultModel")}
              </h3>
              <div className="space-y-2">
                {MODELS.filter((m) => !m.legacy).map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setDefaultModel(model.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 sm:px-4 py-3 text-left transition-all min-h-[44px]",
                      defaultModel === model.id
                        ? "border-syntalys-blue bg-syntalys-blue/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground">
                        {model.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(model.descriptionKey as TranslationKey) as string}
                      </p>
                    </div>
                    {model.badge && (
                      <span
                        className={cn(
                          "ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          model.badge === "Beta"
                            ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                            : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                        )}
                      >
                        {model.badge}
                      </span>
                    )}
                  </button>
                ))}

                {/* Legacy models */}
                <p className="pt-2 text-xs font-medium text-muted-foreground">
                  {t("legacyModels" as TranslationKey)}
                </p>
                {MODELS.filter((m) => m.legacy).map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setDefaultModel(model.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 sm:px-4 py-3 text-left transition-all min-h-[44px]",
                      defaultModel === model.id
                        ? "border-syntalys-blue bg-syntalys-blue/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground">
                        {model.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(model.descriptionKey as TranslationKey) as string}
                      </p>
                    </div>
                    {model.badge && (
                      <span
                        className={cn(
                          "ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          model.badge === "Beta"
                            ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                            : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                        )}
                      >
                        {model.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("saveChanges")
              )}
            </Button>

            {/* Change Password */}
            <div className="border-t border-border pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <KeyRound className="h-4 w-4" />
                {t("changePassword")}
              </h3>
              <div className="space-y-3">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("newPassword") as string}
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmNewPassword") as string}
                />
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t("passwordChanged")}
                  </p>
                )}
                <Button
                  onClick={handlePasswordChange}
                  disabled={savingPassword || !newPassword || !confirmPassword}
                  variant="outline"
                  className="w-full"
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("changePassword")
                  )}
                </Button>
              </div>
            </div>

            {/* Memory Management */}
            <div className="border-t border-border pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Brain className="h-4 w-4 text-syntalys-blue" />
                {t("memoryTitle" as TK)}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t("memoryDesc" as TK)}
              </p>

              {loadingMemories ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : memories.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t("memoryEmpty" as TK)}</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="group flex items-start gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 text-xs"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                          mem.source === "user_explicit"
                            ? "bg-syntalys-blue/10 text-syntalys-blue"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {mem.source === "user_explicit" ? "User" : "AI"}
                      </span>
                      <span className="flex-1 text-card-foreground leading-relaxed min-w-0 break-words">
                        {mem.content}
                      </span>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 -mr-1 rounded-lg hover:bg-destructive/10 active:bg-destructive/20"
                        aria-label="Delete memory"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {memories.length > 0 && (
                <button
                  onClick={handleClearAllMemories}
                  className="mt-2 text-xs text-destructive/70 hover:text-destructive transition-colors"
                >
                  {t("memoryClearAll" as TK)}
                </button>
              )}
            </div>

            {/* Danger Zone */}
            <div className="border-t border-destructive/20 pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {t("dangerZone")}
              </h3>
              <div className="space-y-3">
                {/* Delete all chats */}
                {!showDeleteChats ? (
                  <button
                    onClick={() => setShowDeleteChats(true)}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 sm:px-4 py-3 text-left text-sm text-card-foreground hover:border-destructive/40 hover:bg-destructive/5 transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{t("deleteAllChats")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("deleteAllChatsDesc")}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:p-4 space-y-3">
                    <p className="text-sm text-card-foreground">
                      {t("deleteAllChatsConfirm")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteChats(false)}
                        className="flex-1"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        onClick={handleDeleteAllChats}
                        disabled={deletingChats}
                        className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                      >
                        {deletingChats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("delete")
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete account */}
                {!showDeleteAccount ? (
                  <button
                    onClick={() => setShowDeleteAccount(true)}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 sm:px-4 py-3 text-left text-sm text-card-foreground hover:border-destructive/40 hover:bg-destructive/5 transition-all"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-destructive text-sm">
                        {t("deleteAccount")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("deleteAccountDesc")}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:p-4 space-y-3">
                    <p className="text-sm text-card-foreground">
                      {t("deleteAccountConfirm")}
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={t("typeDelete") as string}
                      className="border-destructive/30"
                    />
                    {deleteError && (
                      <p className="text-xs text-destructive">{deleteError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteAccount(false);
                          setDeleteConfirmText("");
                          setDeleteError("");
                        }}
                        className="flex-1"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={
                          deletingAccount ||
                          deleteConfirmText.toLowerCase() !== "delete"
                        }
                        className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                      >
                        {deletingAccount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("deleteAccount")
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Memory section for anonymous users */}
        {!user && memories.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Brain className="h-4 w-4 text-syntalys-blue" />
              {t("memoryTitle" as TK)}
            </h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="group flex items-start gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 text-xs"
                >
                  <span className="flex-1 text-card-foreground leading-relaxed min-w-0 break-words">
                    {mem.content}
                  </span>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 -mr-1 rounded-lg hover:bg-destructive/10 active:bg-destructive/20"
                    aria-label="Delete memory"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleClearAllMemories}
              className="mt-2 text-xs text-destructive/70 hover:text-destructive transition-colors"
            >
              {t("memoryClearAll" as TK)}
            </button>
          </div>
        )}

        {/* Info */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            SYNTALYS Chat AI v1.0
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} SYNTALYS TECH.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
