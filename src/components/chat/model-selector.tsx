"use client";

import { useState, useRef, useEffect } from "react";
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
  Sparkles,
  Zap,
  FlaskConical,
  Rocket,
  Brain,
  Atom,
} from "lucide-react";

const modelIcons: Record<string, typeof Zap> = {
  "talys-2.0": Rocket,
  "talys-2.5": Brain,
  "talys-3.0-beta": Atom,
  "synta-1.0": Zap,
  "synta-1.0-reasoning": Sparkles,
  "synta-1.5-beta": FlaskConical,
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
        "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
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
                model.badge === "Beta"
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

export function ModelSelector() {
  const { user } = useAuth();
  const { selectedModel, setSelectedModel } = useChat();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const availableModels = getAvailableModels(!!user);
  const currentModels = availableModels.filter((m) => !m.legacy);
  const legacyModels = availableModels.filter((m) => m.legacy);
  const currentModel =
    availableModels.find((m) => m.id === selectedModel) || availableModels[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = (model: ModelConfig) => {
    setSelectedModel(model.id);
    setOpen(false);
  };

  const Icon = modelIcons[currentModel.id] || Zap;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent text-foreground"
        )}
      >
        <Icon className="h-4 w-4 text-syntalys-blue" />
        <span className="hidden sm:inline">{currentModel.name}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[calc(100vw-2rem)] sm:w-[300px] max-w-[300px] rounded-xl border border-border bg-popover p-1.5 sm:p-2 shadow-xl animate-fade-in">
          {/* New models */}
          {currentModels.map((model) => (
            <ModelButton
              key={model.id}
              model={model}
              isSelected={model.id === selectedModel}
              onSelect={() => handleSelect(model)}
              t={t as (key: TranslationKey) => string}
            />
          ))}

          {/* Legacy models collapsible */}
          {legacyModels.length > 0 && (
            <div className="mt-1.5 border-t border-border/50 pt-1.5">
              <button
                onClick={() => setLegacyOpen((o) => !o)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    legacyOpen && "rotate-90"
                  )}
                />
                {t("legacyModels" as TranslationKey)}
              </button>

              {legacyOpen && (
                <div className="mt-0.5">
                  {legacyModels.map((model) => (
                    <ModelButton
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
