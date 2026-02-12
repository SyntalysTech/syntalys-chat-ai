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
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";

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
  const { user, profile, updateProfile } = useAuth();
  const { setSelectedModel } = useChat();
  const { t, locale, setLocale } = useI18n();
  const [displayName, setDisplayName] = useState(
    profile?.display_name || ""
  );
  const [defaultModel, setDefaultModel] = useState(
    profile?.default_model || DEFAULT_MODEL_ID
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setDefaultModel(profile.default_model || DEFAULT_MODEL_ID);
    }
  }, [profile]);

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

  const themes = [
    { id: "light" as const, labelKey: "themeLight" as const, icon: Sun },
    { id: "dark" as const, labelKey: "themeDark" as const, icon: Moon },
    { id: "system" as const, labelKey: "themeSystem" as const, icon: Monitor },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t("settings") as string}>
      <div className="space-y-6">
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
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all",
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
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all",
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
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setDefaultModel(model.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                      defaultModel === model.id
                        ? "border-syntalys-blue bg-syntalys-blue/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <div>
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
                          "ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
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
          </>
        )}

        {/* Info */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            SYNTALYS Chat AI v1.0
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} SYNTALYS TECH. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
