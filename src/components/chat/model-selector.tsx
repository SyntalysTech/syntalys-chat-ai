"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useI18n } from "@/lib/i18n-context";
import { getAvailableModels, type ModelConfig } from "@/lib/models";
import type { TranslationKey } from "@/lib/translations";
import { ChevronDown, Check, Sparkles, Zap, FlaskConical } from "lucide-react";

const modelIcons: Record<string, typeof Zap> = {
  "synta-1.0": Zap,
  "synta-1.0-reasoning": Sparkles,
  "synta-1.5-beta": FlaskConical,
};

export function ModelSelector() {
  const { user } = useAuth();
  const { selectedModel, setSelectedModel } = useChat();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const availableModels = getAvailableModels(!!user);
  const currentModel = availableModels.find((m) => m.id === selectedModel) || availableModels[0];

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
        <div className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-xl border border-border bg-popover p-2 shadow-xl animate-fade-in">
          {availableModels.map((model) => {
            const ModelIcon = modelIcons[model.id] || Zap;
            const isSelected = model.id === selectedModel;

            return (
              <button
                key={model.id}
                onClick={() => handleSelect(model)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                  isSelected
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <ModelIcon
                  className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    isSelected
                      ? "text-syntalys-blue"
                      : "text-muted-foreground"
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
                    {t(model.descriptionKey as TranslationKey) as string}
                  </p>
                </div>
                {isSelected && (
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-syntalys-blue" />
                )}
              </button>
            );
          })}

          {!user && (
            <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {t("registerForModels")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
