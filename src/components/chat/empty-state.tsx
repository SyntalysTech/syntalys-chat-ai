"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import {
  Briefcase,
  Lightbulb,
  BarChart3,
  PenTool,
  Code2,
  Megaphone,
} from "lucide-react";
import type { TranslationKey } from "@/lib/translations";

const suggestions: {
  icon: typeof Code2;
  titleKey: TranslationKey;
  promptKey: TranslationKey;
  color: string;
}[] = [
  { icon: Briefcase, titleKey: "sugBusiness", promptKey: "sugBusinessPrompt", color: "text-blue-500" },
  { icon: Lightbulb, titleKey: "sugIdeas", promptKey: "sugIdeasPrompt", color: "text-amber-500" },
  { icon: BarChart3, titleKey: "sugAnalyze", promptKey: "sugAnalyzePrompt", color: "text-emerald-500" },
  { icon: PenTool, titleKey: "sugDraft", promptKey: "sugDraftPrompt", color: "text-violet-500" },
  { icon: Code2, titleKey: "sugWriteCode", promptKey: "sugWriteCodePrompt", color: "text-cyan-500" },
  { icon: Megaphone, titleKey: "sugMarketing", promptKey: "sugMarketingPrompt", color: "text-rose-500" },
];

interface EmptyStateProps {
  isDark: boolean;
  onSuggestionClick: (prompt: string) => void;
}

export function EmptyState({ isDark, onSuggestionClick }: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-3 sm:px-4 py-4 sm:py-16 pl-safe pr-safe">
      <div className="mb-4 sm:mb-8">
        <Image
          src={
            isDark
              ? "/logos/logo-icono-solo-white.png"
              : "/logos/logo-icono-solo-blue.png"
          }
          alt="SYNTALYS AI"
          width={44}
          height={44}
          className="opacity-80 h-9 w-9 sm:h-12 sm:w-12"
        />
      </div>

      <h1 className="mb-1 sm:mb-2 text-lg sm:text-2xl font-semibold text-foreground">
        {t("emptyStateTitle")}
      </h1>
      <p className="mb-4 sm:mb-10 max-w-sm sm:max-w-md text-center text-[13px] sm:text-sm text-muted-foreground">
        {t("emptyStateSubtitle")}
      </p>

      {/* Mobile: wrapped pills */}
      <div className="flex sm:hidden flex-wrap justify-center gap-2 w-full max-w-sm px-2">
        {suggestions.map((s) => {
          const title = t(s.titleKey) as string;
          const prompt = t(s.promptKey) as string;
          return (
            <button
              key={s.titleKey}
              onClick={() => onSuggestionClick(prompt)}
              className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 transition-all active:scale-[0.97]"
            >
              <s.icon className={`h-3.5 w-3.5 flex-shrink-0 ${s.color}`} />
              <span className="text-[12px] font-medium text-card-foreground whitespace-nowrap">
                {title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: 2-column grid with descriptions */}
      <div className="hidden sm:grid w-full max-w-2xl grid-cols-2 gap-2.5">
        {suggestions.map((s) => {
          const title = t(s.titleKey) as string;
          const prompt = t(s.promptKey) as string;
          return (
            <button
              key={s.titleKey}
              onClick={() => onSuggestionClick(prompt)}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left transition-all duration-200 hover:border-syntalys-blue/30 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/50 group-hover:bg-syntalys-blue/10 transition-colors">
                <s.icon className={`h-[18px] w-[18px] ${s.color} transition-colors`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground leading-tight">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
