"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { getAvailableModels, type ModelConfig } from "@/lib/models";
import type { TranslationKey } from "@/lib/translations";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Zap,
  Rocket,
  Brain,
  Crown,
  MessageCircle,
  Archive,
} from "lucide-react";

const modelIcons: Record<string, typeof Zap> = {
  "talys-execute": Rocket,
  "talys-think": Brain,
  "talys-apex": Crown,
  "milo-chat": MessageCircle,
  // Legacy fallbacks
  "talys-2.0": Rocket,
  "talys-2.5": Brain,
  "talys-3.0": Crown,
  "milo": MessageCircle,
  "synta-1.0": Zap,
};

function ModelButton({
  model,
  isSelected,
  onSelect,
  t,
}: {
  model: ModelConfig;
  isSelected: boolean;
  onSelect: () => void;
  t: (key: TranslationKey) => string;
}) {
  const Icon = modelIcons[model.id] || Zap;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors min-h-[44px]",
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 flex-shrink-0",
          isSelected ? "text-syntalys-blue" : "text-muted-foreground"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-popover-foreground">
            {model.name}
          </span>
          {model.badge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                model.badge === "Flagship"
                  ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                  : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
              )}
            >
              {model.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(model.descriptionKey as TranslationKey)}
        </p>
      </div>
      {isSelected && (
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-syntalys-blue" />
      )}
    </button>
  );
}

function LegacyModelButton({
  model,
  isSelected,
  onSelect,
  t,
}: {
  model: ModelConfig;
  isSelected: boolean;
  onSelect: () => void;
  t: (key: TranslationKey) => string;
}) {
  const Icon = modelIcons[model.id] || Zap;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors min-h-[40px]",
        isSelected ? "bg-accent/70" : "hover:bg-accent/30"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 flex-shrink-0",
          isSelected ? "text-syntalys-blue/70" : "text-muted-foreground/50"
        )}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-xs text-popover-foreground/80">
          {model.name}
        </span>
        {model.replacedByKey && (
          <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground/60">
            {t(model.replacedByKey as TranslationKey)}
          </p>
        )}
      </div>
      {isSelected && (
        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-syntalys-blue/70" />
      )}
    </button>
  );
}

export function ModelSelector() {
  const { user } = useAuth();
  const { selectedModel, setSelectedModel } = useChat();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [archiveDirection, setArchiveDirection] = useState<"right" | "left">("right");
  const ref = useRef<HTMLDivElement>(null);
  const archiveTriggerRef = useRef<HTMLDivElement>(null);

  const availableModels = getAvailableModels(!!user);
  const currentModels = availableModels.filter((m) => !m.legacy);
  const legacyModels = availableModels.filter((m) => m.legacy);
  const currentModel =
    availableModels.find((m) => m.id === selectedModel) || availableModels[0];

  // Responsive detection
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Reset archive when main dropdown closes
  useEffect(() => {
    if (!open) setArchiveOpen(false);
  }, [open]);

  // Detect overflow direction for desktop sub-panel
  useEffect(() => {
    if (archiveOpen && !isMobile && archiveTriggerRef.current) {
      const rect = archiveTriggerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      setArchiveDirection(spaceRight >= 270 ? "right" : "left");
    }
  }, [archiveOpen, isMobile]);

  // Click-outside detection (mousedown + touchstart for mobile)
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setArchiveOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleSelect = useCallback((model: ModelConfig) => {
    setSelectedModel(model.id);
    setOpen(false);
    setArchiveOpen(false);
  }, [setSelectedModel]);

  const Icon = modelIcons[currentModel.id] || Zap;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-0",
          "hover:bg-accent active:bg-accent/80 text-foreground"
        )}
      >
        <Icon className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
        <span className="text-[13px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{currentModel.name}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Main dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-1.5 sm:p-2 shadow-xl animate-fade-in">
          {/* Current models */}
          {currentModels.map((model) => (
            <ModelButton
              key={model.id}
              model={model}
              isSelected={model.id === selectedModel}
              onSelect={() => handleSelect(model)}
              t={t as (key: TranslationKey) => string}
            />
          ))}

          {/* Engine Archive trigger + sub-panel */}
          {legacyModels.length > 0 && (
            <div ref={archiveTriggerRef} className="relative mt-1.5 border-t border-border/50 pt-1.5">
              <button
                onClick={() => setArchiveOpen((o) => !o)}
                aria-expanded={archiveOpen}
                aria-haspopup="true"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors min-h-[44px] sm:min-h-0",
                  archiveOpen
                    ? "bg-accent text-popover-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Archive className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 text-left">
                  {t("engineArchive" as TranslationKey)}
                </span>
                <ChevronRight
                  className={cn(
                    "h-3 w-3 flex-shrink-0 transition-transform duration-200",
                    archiveOpen && isMobile && "rotate-90",
                  )}
                />
              </button>

              {/* Desktop: lateral sub-panel */}
              {archiveOpen && !isMobile && (
                <div
                  className={cn(
                    "absolute top-0 z-50 w-[260px] rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-fade-in-right",
                    archiveDirection === "right"
                      ? "left-full ml-1.5"
                      : "right-full mr-1.5"
                  )}
                  role="menu"
                >
                  <div className="px-2.5 py-2 mb-1">
                    <p className="text-[10px] leading-snug text-muted-foreground/60">
                      {t("engineArchiveDesc" as TranslationKey)}
                    </p>
                  </div>
                  <div className="border-t border-border/30 mb-1" />
                  {legacyModels.map((model) => (
                    <LegacyModelButton
                      key={model.id}
                      model={model}
                      isSelected={model.id === selectedModel}
                      onSelect={() => handleSelect(model)}
                      t={t as (key: TranslationKey) => string}
                    />
                  ))}
                </div>
              )}

              {/* Mobile: stacked inline */}
              {archiveOpen && isMobile && (
                <div className="mt-1 max-h-[40vh] overflow-y-auto animate-fade-in">
                  <div className="px-2.5 py-1.5">
                    <p className="text-[10px] leading-snug text-muted-foreground/60">
                      {t("engineArchiveDesc" as TranslationKey)}
                    </p>
                  </div>
                  <div className="border-t border-border/30 mb-1 mx-2" />
                  {legacyModels.map((model) => (
                    <LegacyModelButton
                      key={model.id}
                      model={model}
                      isSelected={model.id === selectedModel}
                      onSelect={() => handleSelect(model)}
                      t={t as (key: TranslationKey) => string}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Register prompt for anonymous users */}
          {!user && (
            <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {t("registerForModels" as TranslationKey)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
